const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Kafka, logLevel } = require('kafkajs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Socket.io for Real-time Frontend connection
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const { insertThreat, getHistory, getStats, getPlaybackEvents, recordFeedback, db } = require('./db');
const { dispatchWebhookAlert } = require('./webhook');
const { GLOBAL_CITIES, GLOBAL_DESTINATIONS, ATTACK_TYPES, createSyntheticThreat, computePredictionIntelligence } = require('./cities');

// Metrics counters for Prometheus & Health Observability
const metrics = {
    startTime: Date.now(),
    totalIngested: 0,
    totalCritical: 0,
    droppedBackpressure: 0,
    lastDriftScore: 0,
    lastLoss: 0,
    lastAccuracy: 98.4
};

// WebSocket Authentication Middleware (Optional TOKEN support)
const AUTH_TOKEN = process.env.AUTH_TOKEN || null;
if (AUTH_TOKEN) {
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (token && token === AUTH_TOKEN) {
            next();
        } else {
            console.warn(`[Security] Unauthorized Socket.IO connection attempt from: ${socket.id}`);
            next(new Error('Authentication failed: invalid or missing token'));
        }
    });
}

// Threat history buffer (in-memory fast cache + SQLite persistence)
const threatHistory = [];
const MAX_HISTORY = 120;

// Rate limiting & Backpressure Guard (Prevent UI freeze under attack flood)
let eventQueueCount = 0;
let lastReset = Date.now();
const MAX_BROADCASTS_PER_SEC = 30;

function addThreat(threat) {
    const now = Date.now();
    if (now - lastReset > 1000) {
        eventQueueCount = 0;
        lastReset = now;
    }

    metrics.totalIngested++;
    const isCrit = (Number(threat.severity) >= 0.65) || (threat.attack_type && threat.attack_type.includes('DDoS'));
    if (isCrit) metrics.totalCritical++;
    if (threat.drift_score !== undefined) metrics.lastDriftScore = Number(threat.drift_score);
    if (threat.reconstruction_error !== undefined) metrics.lastLoss = Number(threat.reconstruction_error);

    // Compute AI prediction intelligence if missing
    let enriched = { ...threat };
    if (!enriched.ml_accuracy || !enriched.feature_attributions || enriched.feature_attributions.length === 0) {
        const intel = computePredictionIntelligence(
            Number(enriched.severity) || 0.3,
            enriched.attack_type || 'Unknown_Anomaly',
            Number(enriched.drift_score) || 0,
            Number(enriched.reconstruction_error) || 0.08
        );
        enriched = { ...intel, ...enriched };
    }
    metrics.lastAccuracy = enriched.ml_accuracy || 98.2;

    const data = insertThreat({
        ...enriched,
        id: enriched.id || `${enriched.source_ip}-${enriched.timestamp || Date.now()}-${Math.floor(Math.random()*10000)}`,
        timestamp: enriched.timestamp || Math.floor(Date.now() / 1000)
    });

    threatHistory.push(data);
    if (threatHistory.length > MAX_HISTORY) {
        threatHistory.shift();
    }

    // Critical events are ALWAYS broadcasted and dispatched to webhooks
    if (isCrit) {
        dispatchWebhookAlert(data);
    }

    // Rate-limit high velocity normal floods to preserve frontend frame rate
    eventQueueCount++;
    if (eventQueueCount <= MAX_BROADCASTS_PER_SEC || isCrit) {
        io.emit('new_threat', data);
    } else {
        metrics.droppedBackpressure++;
    }

    return data;
}

// Seed SQLite DB with realistic historical threat waves across 250+ worldwide cities if empty
function seedDatabaseIfEmpty() {
    try {
        const count = db.prepare('SELECT COUNT(*) as c FROM threats').get()?.c || 0;
        if (count < 30) {
            console.log("Seeding SQLite store with initial multi-continent worldwide threat waves...");
            const now = Math.floor(Date.now() / 1000);

            for (let i = 80; i >= 1; i--) {
                const ts = now - (i * 35); // Spread across the past ~45 minutes
                const threat = createSyntheticThreat({ timestamp: ts });
                insertThreat(threat);
            }
            console.log("✓ Initial worldwide multi-city threat history seed complete.");
        }
    } catch (e) {
        console.error("Error seeding initial threats:", e.message);
    }
}
seedDatabaseIfEmpty();

let kafkaConnected = false;
let isReconnecting = false;

// Kafka Consumer Setup (Connecting to KRaft Broker)
const kafka = new Kafka({
    clientId: 'threat-dashboard-server',
    brokers: ['127.0.0.1:9092'],
    logLevel: logLevel.NOTHING,
    retry: {
        initialRetryTime: 1000,
        retries: 1
    }
});

const consumer = kafka.consumer({ groupId: 'threat-group' });

async function startKafkaConsumer() {
    if (isReconnecting) return;
    isReconnecting = true;
    try {
        console.log("Checking Kafka Broker connection (127.0.0.1:9092)...");
        await consumer.connect();
        kafkaConnected = true;
        isReconnecting = false;
        console.log("✓ Connected to Kafka Broker (topic: raw_threat_logs)");
        io.emit('stream_status', { kafka: true, message: 'Connected to Kafka broker' });

        await consumer.subscribe({ topic: 'raw_threat_logs', fromBeginning: false });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const attackData = JSON.parse(message.value.toString());
                    console.log(`[Kafka Alert] ${attackData.attack_type} from ${attackData.source_ip}`);
                    addThreat(attackData);
                } catch (e) {
                    console.error("Error parsing Kafka message:", e);
                }
            },
        });
    } catch (error) {
        kafkaConnected = false;
        isReconnecting = false;
        console.log("ℹ️  Kafka Broker is currently offline (Standby mode).");
        console.log("   -> PyTorch AI model & REST stream are ACTIVE on http://localhost:4000");
        io.emit('stream_status', { kafka: false, message: 'Kafka standby (PyTorch stream ready)' });
        
        // Retry connection quietly after 15s
        setTimeout(() => {
            if (!kafkaConnected) startKafkaConsumer();
        }, 15000);
    }
}

// Prometheus Metrics Endpoint for Grafana / Ops Monitoring
app.get('/metrics', (req, res) => {
    const uptimeSec = Math.floor((Date.now() - metrics.startTime) / 1000);
    const clientsCount = io.engine.clientsCount || 0;
    const body = `# HELP nids_events_total Total number of threat telemetry events ingested
# TYPE nids_events_total counter
nids_events_total ${metrics.totalIngested}

# HELP nids_critical_events_total Total number of high/critical severity threats
# TYPE nids_critical_events_total counter
nids_critical_events_total ${metrics.totalCritical}

# HELP nids_backpressure_dropped_total Total events dropped by rate-limiting queue guard
# TYPE nids_backpressure_dropped_total counter
nids_backpressure_dropped_total ${metrics.droppedBackpressure}

# HELP nids_connected_clients Current active Socket.IO SOC clients connected
# TYPE nids_connected_clients gauge
nids_connected_clients ${clientsCount}

# HELP nids_latest_concept_drift_score Current concept drift score P_t(X)
# TYPE nids_latest_concept_drift_score gauge
nids_latest_concept_drift_score ${metrics.lastDriftScore}

# HELP nids_latest_reconstruction_loss Latest autoencoder reconstruction loss
# TYPE nids_latest_reconstruction_loss gauge
nids_latest_reconstruction_loss ${metrics.lastLoss}

# HELP nids_uptime_seconds Server uptime in seconds
# TYPE nids_uptime_seconds gauge
nids_uptime_seconds ${uptimeSec}
`;
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(body);
});

// REST Endpoints
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        kafka: kafkaConnected,
        connectedClients: io.engine.clientsCount,
        historyCount: threatHistory.length,
        database: 'sqlite-wal',
        uptimeSeconds: Math.floor((Date.now() - metrics.startTime) / 1000),
        totalIngested: metrics.totalIngested,
        criticalCount: metrics.totalCritical
    });
});

app.get('/api/threats', (req, res) => {
    res.json(threatHistory);
});

// REST endpoint: Query historical events with filters and pagination
app.get('/api/threats/history', (req, res) => {
    const { from, to, severity, attack_type, search, limit, offset } = req.query;
    const history = getHistory({ from, to, severity, attack_type, search, limit, offset });
    res.json(history);
});

// REST endpoint: Get aggregated SOC statistics and charts data
app.get('/api/threats/stats', (req, res) => {
    const { timeWindowSeconds } = req.query;
    const stats = getStats({ timeWindowSeconds: Number(timeWindowSeconds) || 86400 });
    res.json(stats);
});

// REST endpoint: Playback time-window stream
app.get('/api/threats/playback', (req, res) => {
    const { from, to, limit } = req.query;
    const events = getPlaybackEvents({ from, to, limit });
    res.json({ total: events.length, events });
});

// REST endpoint: Analyst Feedback (True Positive / False Positive)
app.post('/api/threats/feedback', (req, res) => {
    const { incident_id, source_ip, feedback_type, notes } = req.body;
    if (!incident_id || !feedback_type) {
        return res.status(400).json({ error: 'Missing incident_id or feedback_type' });
    }
    const result = recordFeedback({ incident_id, source_ip, feedback_type, notes });
    io.emit('feedback_recorded', { incident_id, feedback_type, timestamp: Date.now() });
    res.json({ success: true, result });
});

// Endpoint to push a threat from PyTorch NIDS model or direct ingestion
app.post('/api/threats', (req, res) => {
    const {
        source_ip, dest_ip, source_lat, source_long, dest_lat, dest_long,
        attack_type, severity, drift_score, reconstruction_error, adaptive_threshold,
        ewma_loss, ml_confidence, feature_attributions, severity_level, action, city, dest_name
    } = req.body;
    if (!source_ip || !attack_type) {
        return res.status(400).json({ error: 'Missing required threat parameters' });
    }
    const threat = addThreat({
        source_ip,
        dest_ip: dest_ip || '10.0.0.1',
        source_lat: Number(source_lat) || 0,
        source_long: Number(source_long) || 0,
        dest_lat: Number(dest_lat) || 28.7041,
        dest_long: Number(dest_long) || 77.1025,
        attack_type,
        severity: Number(severity) || 0.3,
        drift_score: drift_score !== undefined ? Number(drift_score) : 0,
        reconstruction_error: reconstruction_error !== undefined ? Number(reconstruction_error) : 0,
        adaptive_threshold: adaptive_threshold !== undefined ? Number(adaptive_threshold) : 0.12,
        ewma_loss: ewma_loss !== undefined ? Number(ewma_loss) : 0.04,
        ml_confidence: ml_confidence !== undefined ? Number(ml_confidence) : 0.92,
        feature_attributions: Array.isArray(feature_attributions) ? feature_attributions : [],
        severity_level: severity_level || (Number(severity) > 0.6 ? 'CRITICAL' : 'HIGH'),
        action: action || (Number(severity) > 0.6 ? 'trigger_camera_zoom' : 'none'),
        city: city || 'External Host',
        dest_name: dest_name || 'Central SOC Gateway'
    });
    res.json({ success: true, threat });
});

// Socket.io Connection handling
io.on('connection', (socket) => {
    console.log('Frontend Client Connected:', socket.id);

    // Immediately send current buffer and status
    socket.emit('init_threats', threatHistory);
    socket.emit('stream_status', {
        kafka: kafkaConnected,
        message: kafkaConnected ? 'Connected to Kafka broker' : 'Kafka broker offline (ready for stream)'
    });

    // Client can request an instant test attack trigger
    socket.on('trigger_test_threat', () => {
        const severity = parseFloat((Math.random() * 0.28 + 0.72).toFixed(2));
        const threat = addThreat(createSyntheticThreat({
            severity,
            isManualTrigger: true,
            action: 'trigger_camera_zoom'
        }));
        console.log(`[Manual Trigger Alert] ${threat.attack_type} from ${threat.source_ip} (${threat.city}) -> ${threat.dest_name} (Accuracy: ${threat.ml_accuracy}%, Confidence: ${threat.ml_confidence}%)`);
    });

    socket.on('disconnect', () => {
        console.log('Frontend Client Disconnected:', socket.id);
    });
});

// Root status endpoint for Render Health Checks
app.get('/', (req, res) => {
    res.json({
        service: 'Cyber Threat Intelligence SOC Backend',
        status: 'online',
        websocket: 'active',
        threatCount: threatHistory.length,
        worldwideCoverage: `${GLOBAL_CITIES.length} cities across 6 continents`,
        targetGateways: `${GLOBAL_DESTINATIONS.length} SOC data centers`,
        latestAccuracy: `${metrics.lastAccuracy}%`
    });
});

// Autonomous stream across 250+ worldwide cities and 25+ target data centers
let autoStreamInterval = null;
function startAutoStream() {
    if (autoStreamInterval) return;
    autoStreamInterval = setInterval(() => {
        const threat = createSyntheticThreat();
        addThreat(threat);
    }, 1250);
}

// Auto start cloud stream on server start
startAutoStream();

const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startKafkaConsumer();
});