const { insertThreat, getHistory, getStats, recordFeedback, getFeedback } = require('../db');
const { createSyntheticThreat } = require('../cities');

console.log('Running Backend Database & Telemetry Tests...');

// 1. Test insertion of synthetic multi-region threat
const sample = createSyntheticThreat();
const saved = insertThreat(sample);
if (!saved || !saved.id) {
  console.error('❌ insertThreat failed');
  process.exit(1);
}
console.log(`✓ insertThreat successful: ${saved.id} (${saved.city} -> ${saved.dest_name})`);

// 2. Test query history
const history = getHistory({ limit: 10 });
if (!Array.isArray(history.items) || history.items.length === 0) {
  console.error('❌ getHistory failed');
  process.exit(1);
}
console.log(`✓ getHistory successful: returned ${history.items.length} records`);

// 3. Test stats aggregation with AI accuracy metrics
const stats = getStats({ timeWindowSeconds: 86400 });
if (typeof stats.total !== 'number' || !stats.aiMetrics) {
  console.error('❌ getStats failed or missing aiMetrics');
  process.exit(1);
}
console.log(`✓ getStats successful: Total ${stats.total}, Avg Accuracy ${stats.aiMetrics.avgAccuracy}%`);

// 4. Test analyst feedback
const fb = recordFeedback({ incident_id: saved.id, source_ip: saved.source_ip, feedback_type: 'true_positive' });
const fbList = getFeedback(saved.id);
if (!Array.isArray(fbList) || fbList.length === 0) {
  console.error('❌ recordFeedback failed');
  process.exit(1);
}
console.log('\n✅ All Backend & SQLite Persistence tests passed successfully.');
