/**
 * Synthetic Cyber Threat Generator CLI
 * Injects multi-continent cyber attack waves and concept drift spikes into the running SOC backend.
 *
 * Usage:
 *   node backend/scripts/demo_traffic.js [--burst] [--drift] [--count 50]
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const CITIES = [
  { city: 'Tokyo, Japan', lat: 35.68, lng: 139.69 },
  { city: 'London, UK', lat: 51.51, lng: -0.12 },
  { city: 'New York, USA', lat: 40.71, lng: -74.01 },
  { city: 'Frankfurt, Germany', lat: 50.11, lng: 8.68 },
  { city: 'Sydney, Australia', lat: -33.87, lng: 151.21 },
  { city: 'Sao Paulo, Brazil', lat: -23.55, lng: -46.63 },
  { city: 'Singapore', lat: 1.35, lng: 103.82 },
  { city: 'New Delhi, India', lat: 28.61, lng: 77.21 },
  { city: 'Paris, France', lat: 48.85, lng: 2.35 },
  { city: 'Seoul, South Korea', lat: 37.56, lng: 126.98 },
  { city: 'San Francisco, USA', lat: 37.77, lng: -122.42 },
  { city: 'Dubai, UAE', lat: 25.20, lng: 55.27 },
  { city: 'Toronto, Canada', lat: 43.65, lng: -79.38 },
  { city: 'Johannesburg, South Africa', lat: -26.20, lng: 28.05 }
];

const TARGET_GATEWAYS = [
  { name: 'Central NOC (New Delhi)', lat: 28.6139, lng: 77.2090 },
  { name: 'US-East (Virginia)', lat: 38.9072, lng: -77.0369 },
  { name: 'Europe-Central (Frankfurt)', lat: 50.1109, lng: 8.6821 },
  { name: 'East Asia (Tokyo)', lat: 35.6762, lng: 139.6503 },
  { name: 'Asia-Pacific (Singapore)', lat: 1.3521, lng: 103.8198 },
  { name: 'UK-Regional (London)', lat: 51.5074, lng: -0.1278 }
];

const ATTACK_TYPES = [
  'DDoS_Volume_Spike',
  'SQL_Injection',
  'Adversarial_Drift',
  'Malware_Drop',
  'Port_Scan',
  'Brute_Force'
];

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
  console.log('⚡ Starting Synthetic Cyber Threat Stream Generator...');
  console.log(`📡 Ingestion Target: ${BACKEND_URL}/api/threats\n`);

  let count = 0;
  const isBurst = process.argv.includes('--burst');
  const maxEvents = process.argv.includes('--count') 
    ? parseInt(process.argv[process.argv.indexOf('--count') + 1], 10) 
    : (isBurst ? 50 : 1000);

  const intervalMs = isBurst ? 80 : 800;

  const timer = setInterval(async () => {
    count++;
    const source = CITIES[Math.floor(Math.random() * CITIES.length)];
    const dest = TARGET_GATEWAYS[Math.floor(Math.random() * TARGET_GATEWAYS.length)];
    const attack_type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
    const isCritical = attack_type === 'DDoS_Volume_Spike' || Math.random() > 0.55;
    const severity = isCritical 
      ? parseFloat((Math.random() * 0.35 + 0.65).toFixed(2)) 
      : parseFloat((Math.random() * 0.3 + 0.15).toFixed(2));
    const drift = isCritical 
      ? parseFloat((Math.random() * 0.4 + 0.5).toFixed(2)) 
      : parseFloat((Math.random() * 0.2).toFixed(2));

    const payload = {
      source_ip: `${Math.floor(Math.random()*210)+11}.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}`,
      dest_ip: `10.${Math.floor(Math.random()*10)}.${Math.floor(Math.random()*254)}.${Math.floor(Math.random()*254)}`,
      source_lat: source.lat + (Math.random() - 0.5) * 1.5,
      source_long: source.lng + (Math.random() - 0.5) * 1.5,
      dest_lat: dest.lat,
      dest_long: dest.lng,
      attack_type,
      severity,
      drift_score: drift,
      reconstruction_error: parseFloat((severity * 0.28).toFixed(3)),
      severity_level: isCritical ? 'CRITICAL' : 'HIGH',
      city: source.city,
      dest_name: dest.name,
      action: isCritical ? 'trigger_camera_zoom' : 'none'
    };

    await sendThreat(payload);
    const badge = isCritical ? '🚨 [CRIT]' : '🛡️ [WARN]';
    console.log(`${badge} ${payload.attack_type.padEnd(20)} from ${payload.source_ip.padEnd(16)} (${payload.city}) -> ${payload.dest_name}`);

    if (count >= maxEvents) {
      clearInterval(timer);
      console.log(`\n✓ Dispatched ${count} synthetic events successfully.`);
      process.exit(0);
    }
  }, intervalMs);
}

runGenerator();
