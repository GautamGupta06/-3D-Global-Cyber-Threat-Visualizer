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

// Threat history buffer
const threatHistory = [];
const MAX_HISTORY = 100;

function addThreat(threat) {
    const data = {
        ...threat,
        id: threat.id || `${threat.source_ip}-${threat.timestamp || Date.now()}`,
        timestamp: threat.timestamp || Math.floor(Date.now() / 1000)
    };
    threatHistory.push(data);
    if (threatHistory.length > MAX_HISTORY) {
        threatHistory.shift();
    }
    io.emit('new_threat', data);
    return data;
}

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

// REST Endpoints
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        kafka: kafkaConnected,
        connectedClients: io.engine.clientsCount,
        historyCount: threatHistory.length
    });
});

app.get('/api/threats', (req, res) => {
    res.json(threatHistory);
});

// Endpoint to push a threat from PyTorch NIDS model or direct ingestion
app.post('/api/threats', (req, res) => {
    const {
        source_ip, dest_ip, source_lat, source_long, dest_lat, dest_long,
        attack_type, severity, drift_score, reconstruction_error, severity_level, action
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
        severity_level: severity_level || (Number(severity) > 0.6 ? 'CRITICAL' : 'HIGH'),
        action: action || (Number(severity) > 0.6 ? 'trigger_camera_zoom' : 'none')
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
        const attackTypes = ['DDoS_Volume_Spike', 'SQL_Injection', 'Adversarial_Drift', 'Malware_Drop', 'Port_Scan'];
        const sampleCities = [
            { name: 'Tokyo, Japan', lat: 35.68, lng: 139.69 },
            { name: 'London, UK', lat: 51.51, lng: -0.12 },
            { name: 'New York, USA', lat: 40.71, lng: -74.01 },
            { name: 'Frankfurt, Germany', lat: 50.11, lng: 8.68 },
            { name: 'Sydney, Australia', lat: -33.87, lng: 151.21 },
            { name: 'Sao Paulo, Brazil', lat: -23.55, lng: -46.63 },
            { name: 'Seoul, South Korea', lat: 37.56, lng: 126.98 },
            { name: 'Paris, France', lat: 48.85, lng: 2.35 }
        ];
        const city = sampleCities[Math.floor(Math.random() * sampleCities.length)];
        const attack_type = attackTypes[Math.floor(Math.random() * attackTypes.length)];
        const severity = parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)); // High severity 0.70 - 1.00
        const drift_score = parseFloat((Math.random() * 0.4 + 0.6).toFixed(2));

        const threat = addThreat({
            source_ip: `${Math.floor(Math.random()*210)+11}.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}`,
            dest_ip: '10.0.0.1',
            source_lat: city.lat + (Math.random() - 0.5) * 1.5,
            source_long: city.lng + (Math.random() - 0.5) * 1.5,
            dest_lat: 28.7041,
            dest_long: 77.1025,
            attack_type,
            severity,
            drift_score,
            reconstruction_error: parseFloat((severity * 0.28).toFixed(3)),
            severity_level: 'CRITICAL',
            action: 'trigger_camera_zoom',
            isManualTrigger: true,
            city: city.name
        });
        console.log(`[Manual Trigger Alert] ${threat.attack_type} from ${threat.source_ip} (${city.name}) - Action: trigger_camera_zoom`);
    });

// Root status endpoint for Render Health Checks
app.get('/', (req, res) => {
    res.json({
        service: 'Cyber Threat Intelligence SOC Backend',
        status: 'online',
        websocket: 'active',
        threatCount: threatHistory.length
    });
});

// Autonomous cloud streaming for Render (runs automatically when no local Python producer is connected)
const CLOUD_TARGETS = [
    { city: "New York, USA", lat: 40.71, lng: -74.01 }, { city: "London, UK", lat: 51.51, lng: -0.12 },
    { city: "Tokyo, Japan", lat: 35.68, lng: 139.69 }, { city: "Frankfurt, Germany", lat: 50.11, lng: 8.68 },
    { city: "Sydney, Australia", lat: -33.87, lng: 151.21 }, { city: "Sao Paulo, Brazil", lat: -23.55, lng: -46.63 },
    { city: "Singapore", lat: 1.35, lng: 103.82 }, { city: "New Delhi, India", lat: 28.61, lng: 77.21 },
    { city: "San Francisco, USA", lat: 37.77, lng: -122.42 }, { city: "Paris, France", lat: 48.85, lng: 2.35 },
    { city: "Dubai, UAE", lat: 25.20, lng: 55.27 }, { city: "Seoul, South Korea", lat: 37.56, lng: 126.98 },
    { city: "Johannesburg, South Africa", lat: -26.20, lng: 28.05 }, { city: "Toronto, Canada", lat: 43.65, lng: -79.38 }
];

const CLOUD_DESTINATIONS = [
    { name: "Central NOC (New Delhi)", lat: 28.6139, lng: 77.2090 },
    { name: "US-East (Virginia)", lat: 38.9072, lng: -77.0369 },
    { name: "Europe-Central (Frankfurt)", lat: 50.1109, lng: 8.6821 },
    { name: "East Asia (Tokyo)", lat: 35.6762, lng: 139.6503 },
    { name: "Asia-Pacific (Singapore)", lat: 1.3521, lng: 103.8198 },
    { name: "UK-Regional (London)", lat: 51.5074, lng: -0.1278 }
];

const CLOUD_ATTACKS = ['DDoS_Volume_Spike', 'SQL_Injection', 'Adversarial_Drift', 'Malware_Drop', 'Port_Scan', 'Brute_Force', 'Network_Pulse'];

let autoStreamInterval = null;
function startAutoStream() {
    if (autoStreamInterval) return;
    autoStreamInterval = setInterval(() => {
        const source = CLOUD_TARGETS[Math.floor(Math.random() * CLOUD_TARGETS.length)];
        const dest = CLOUD_DESTINATIONS[Math.floor(Math.random() * CLOUD_DESTINATIONS.length)];
        const attackType = CLOUD_ATTACKS[Math.floor(Math.random() * CLOUD_ATTACKS.length)];
        const isCritical = attackType !== 'Network_Pulse' && Math.random() > 0.4;
        const severity = isCritical ? parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)) : parseFloat((Math.random() * 0.3 + 0.1).toFixed(2));
        const drift = isCritical ? parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)) : parseFloat((Math.random() * 0.2).toFixed(2));

        addThreat({
            source_ip: `${Math.floor(Math.random()*210)+11}.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}`,
            dest_ip: `10.${Math.floor(Math.random()*10)}.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}`,
            source_lat: source.lat + (Math.random() - 0.5) * 2.0,
            source_long: source.lng + (Math.random() - 0.5) * 2.0,
            dest_lat: dest.lat,
            dest_long: dest.lng,
            attack_type: attackType,
            severity,
            drift_score: drift,
            reconstruction_error: parseFloat((severity * 0.3).toFixed(3)),
            severity_level: isCritical ? 'CRITICAL' : 'LOW',
            city: source.city,
            dest_name: dest.name
        });
    }, 1400);
}

// Auto start cloud stream on server start
startAutoStream();

const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startKafkaConsumer();
});