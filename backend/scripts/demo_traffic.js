/**
 * Synthetic Cyber Threat Generator CLI
 * Injects multi-continent cyber attack waves and concept drift spikes into the running SOC backend.
 *
 * Usage:
 *   node backend/scripts/demo_traffic.js [--burst] [--drift] [--count 50]
 */

const { createSyntheticThreat, GLOBAL_CITIES, GLOBAL_DESTINATIONS } = require('../cities');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

async function sendThreat(threat) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/threats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(threat)
    });
    return res.ok;
  } catch (err) {
    console.error(`[Error] Failed to connect to ${BACKEND_URL}:`, err.message);
    return false;
  }
}

async function runGenerator() {
  console.log('⚡ Starting Synthetic Cyber Threat Stream Generator across 250+ Worldwide Cities...');
  console.log(`📡 Ingestion Target: ${BACKEND_URL}/api/threats\n`);

  let count = 0;
  const isBurst = process.argv.includes('--burst');
  const maxEvents = process.argv.includes('--count') 
    ? parseInt(process.argv[process.argv.indexOf('--count') + 1], 10) 
    : (isBurst ? 50 : 1000);

  const intervalMs = isBurst ? 80 : 800;

  const timer = setInterval(async () => {
    count++;
    const payload = createSyntheticThreat();

    await sendThreat(payload);
    const badge = payload.severity_level === 'CRITICAL' ? '🚨 [CRIT]' : '🛡️ [WARN]';
    console.log(`${badge} ${payload.attack_type.padEnd(20)} from ${payload.source_ip.padEnd(16)} (${payload.city}) -> ${payload.dest_name} (Accuracy: ${payload.ml_accuracy}%, Confidence: ${payload.ml_confidence}%)`);

    if (count >= maxEvents) {
      clearInterval(timer);
      console.log(`\n✓ Dispatched ${count} synthetic events successfully.`);
      process.exit(0);
    }
  }, intervalMs);
}

runGenerator();

