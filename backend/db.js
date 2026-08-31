const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'threat_history.db');

let db;
try {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  console.log(`✓ SQLite Threat Persistence Store initialized at: ${DB_PATH}`);
} catch (err) {
  console.error('Failed to initialize SQLite database:', err);
}

// Initialize tables and indexes
if (db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS threats (
      id TEXT PRIMARY KEY,
      timestamp INTEGER NOT NULL,
      source_ip TEXT NOT NULL,
      dest_ip TEXT,
      source_lat REAL,
      source_long REAL,
      dest_lat REAL,
      dest_long REAL,
      attack_type TEXT NOT NULL,
      severity REAL NOT NULL,
      drift_score REAL,
      reconstruction_error REAL,
      severity_level TEXT,
      city TEXT,
      dest_name TEXT,
      raw_json TEXT
    );

    CREATE TABLE IF NOT EXISTS analyst_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id TEXT NOT NULL,
      source_ip TEXT,
      feedback_type TEXT NOT NULL,
      notes TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_feedback_incident ON analyst_feedback(incident_id);
  `);
}

const insertStmt = db ? db.prepare(`
  INSERT OR REPLACE INTO threats (
    id, timestamp, source_ip, dest_ip, source_lat, source_long,
    dest_lat, dest_long, attack_type, severity, drift_score,
    reconstruction_error, severity_level, city, dest_name, raw_json
  ) VALUES (
    @id, @timestamp, @source_ip, @dest_ip, @source_lat, @source_long,
    @dest_lat, @dest_long, @attack_type, @severity, @drift_score,
    @reconstruction_error, @severity_level, @city, @dest_name, @raw_json
  )
`) : null;

/**
 * Persist an incoming threat event to SQLite
 */
function insertThreat(threat) {
  if (!db || !insertStmt) return threat;

  const nowSec = Math.floor(Date.now() / 1000);
  const ts = threat.timestamp
    ? (typeof threat.timestamp === 'number' && threat.timestamp > 10000000000 ? Math.floor(threat.timestamp / 1000) : Number(threat.timestamp))
    : nowSec;

  const record = {
    id: threat.id || `${threat.source_ip}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    timestamp: ts,
    source_ip: threat.source_ip || '0.0.0.0',
    dest_ip: threat.dest_ip || '10.0.0.1',
    source_lat: Number(threat.source_lat) || 0,
    source_long: Number(threat.source_long) || 0,
    dest_lat: Number(threat.dest_lat) || 28.7041,
    dest_long: Number(threat.dest_long) || 77.1025,
    attack_type: threat.attack_type || 'Unknown_Anomaly',
    severity: Number(threat.severity) || 0.3,
    drift_score: Number(threat.drift_score) || 0,
    reconstruction_error: Number(threat.reconstruction_error) || 0,
    severity_level: threat.severity_level || (Number(threat.severity) > 0.6 ? 'CRITICAL' : 'HIGH'),
    city: threat.city || 'Unknown Region',
    dest_name: threat.dest_name || 'Central SOC Gateway',
    raw_json: JSON.stringify(threat)
  };

  try {
    insertStmt.run(record);
  } catch (e) {
    console.error('Error inserting threat to DB:', e.message);
  }

  return { ...threat, ...record };
}

/**
 * Query historical threats with multi-parameter filtering and pagination
 */
function getHistory({
  from,
  to,
  severity,
  attack_type,
  search,
  limit = 50,
  offset = 0
} = {}) {
  if (!db) return { total: 0, items: [] };

  const conditions = [];
  const params = {};

  if (from) {
    conditions.push('timestamp >= @from');
    params.from = Number(from);
  }
  if (to) {
    conditions.push('timestamp <= @to');
    params.to = Number(to);
  }
  if (severity) {
    if (severity === 'CRITICAL') {
      conditions.push('severity >= 0.65');
    } else if (severity === 'HIGH') {
      conditions.push('severity >= 0.40 AND severity < 0.65');
    } else if (severity === 'MEDIUM') {
      conditions.push('severity >= 0.20 AND severity < 0.40');
    } else if (severity === 'LOW') {
      conditions.push('severity < 0.20');
    }
  }
  if (attack_type && attack_type !== 'ALL') {
    conditions.push('attack_type LIKE @attack_type');
    params.attack_type = `%${attack_type}%`;
  }
  if (search) {
    conditions.push('(source_ip LIKE @search OR city LIKE @search OR attack_type LIKE @search)');
    params.search = `%${search}%`;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countQuery = `SELECT COUNT(*) as total FROM threats ${whereClause}`;
  const total = db.prepare(countQuery).get(params)?.total || 0;

  const dataQuery = `
    SELECT * FROM threats
    ${whereClause}
    ORDER BY timestamp DESC
    LIMIT @limit OFFSET @offset
  `;
  params.limit = Math.min(Number(limit) || 50, 500);
  params.offset = Number(offset) || 0;

  const items = db.prepare(dataQuery).all(params);
  return { total, limit: params.limit, offset: params.offset, items };
}

/**
 * Get aggregated SOC metrics for dashboards & analytics
 */
function getStats({ timeWindowSeconds = 86400 } = {}) {
  if (!db) {
    return {
      total: 0,
      criticalCount: 0,
      topSourceCities: [],
      topDestinations: [],
      attackTypeBreakdown: [],
      severityDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
      timeSeries: []
    };
  }

  const minTimestamp = Math.floor(Date.now() / 1000) - timeWindowSeconds;

  const total = db.prepare('SELECT COUNT(*) as c FROM threats WHERE timestamp >= ?').get(minTimestamp)?.c || 0;
  const criticalCount = db.prepare('SELECT COUNT(*) as c FROM threats WHERE timestamp >= ? AND severity >= 0.65').get(minTimestamp)?.c || 0;

  const topSourceCities = db.prepare(`
    SELECT city, COUNT(*) as count, AVG(severity) as avg_severity
    FROM threats
    WHERE timestamp >= ? AND city IS NOT NULL
    GROUP BY city
    ORDER BY count DESC
    LIMIT 6
  `).all(minTimestamp);

  const topDestinations = db.prepare(`
    SELECT dest_name, COUNT(*) as count
    FROM threats
    WHERE timestamp >= ? AND dest_name IS NOT NULL
    GROUP BY dest_name
    ORDER BY count DESC
    LIMIT 6
  `).all(minTimestamp);

  const attackTypeBreakdown = db.prepare(`
    SELECT attack_type, COUNT(*) as count, AVG(severity) as avg_severity
    FROM threats
    WHERE timestamp >= ?
    GROUP BY attack_type
    ORDER BY count DESC
  `).all(minTimestamp);

  const sevRows = db.prepare(`
    SELECT
      SUM(CASE WHEN severity >= 0.65 THEN 1 ELSE 0 END) as critical,
      SUM(CASE WHEN severity >= 0.40 AND severity < 0.65 THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN severity >= 0.20 AND severity < 0.40 THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN severity < 0.20 THEN 1 ELSE 0 END) as low
    FROM threats
    WHERE timestamp >= ?
  `).get(minTimestamp);

  // Time series histogram (grouped into 10 buckets across window)
  const bucketSize = Math.max(60, Math.floor(timeWindowSeconds / 12));
  const timeSeries = db.prepare(`
    SELECT
      (timestamp / ${bucketSize}) * ${bucketSize} as bucket_time,
      COUNT(*) as count,
      SUM(CASE WHEN severity >= 0.65 THEN 1 ELSE 0 END) as critical_count
    FROM threats
    WHERE timestamp >= ?
    GROUP BY bucket_time
    ORDER BY bucket_time ASC
  `).all(minTimestamp);

  return {
    total,
    criticalCount,
    topSourceCities,
    topDestinations,
    attackTypeBreakdown,
    severityDistribution: {
      critical: sevRows?.critical || 0,
      high: sevRows?.high || 0,
      medium: sevRows?.medium || 0,
      low: sevRows?.low || 0
    },
    timeSeries
  };
}

/**
 * Retrieve playback events ordered chronologically for time scrubbing
 */
function getPlaybackEvents({ from, to, limit = 200 } = {}) {
  if (!db) return [];

  const nowSec = Math.floor(Date.now() / 1000);
  const startTs = from ? Number(from) : nowSec - 3600; // Default past 1 hour
  const endTs = to ? Number(to) : nowSec;

  const query = `
    SELECT * FROM threats
    WHERE timestamp >= ? AND timestamp <= ?
    ORDER BY timestamp ASC
    LIMIT ?
  `;

  return db.prepare(query).all(startTs, endTs, Math.min(Number(limit) || 200, 1000));
}

/**
 * Store human analyst feedback (False Positive / True Positive) for model improvement
 */
function recordFeedback({ incident_id, source_ip, feedback_type, notes = '' }) {
  if (!db) return null;
  const insertFeedbackStmt = db.prepare(`
    INSERT INTO analyst_feedback (incident_id, source_ip, feedback_type, notes, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  return insertFeedbackStmt.run(
    incident_id,
    source_ip || '',
    feedback_type || 'true_positive',
    notes || '',
    Math.floor(Date.now() / 1000)
  );
}

function getFeedback(incident_id) {
  if (!db) return [];
  return db.prepare('SELECT * FROM analyst_feedback WHERE incident_id = ? ORDER BY created_at DESC').all(incident_id);
}

module.exports = {
  db,
  insertThreat,
  getHistory,
  getStats,
  getPlaybackEvents,
  recordFeedback,
  getFeedback
};
