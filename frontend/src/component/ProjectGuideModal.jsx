import { useState, useEffect } from 'react';

const TABS = [
  { id: 'overview', label: '🌟 Executive Overview', icon: '🌟' },
  { id: 'architecture', label: '⚙️ System Architecture', icon: '⚙️' },
  { id: 'dashboard', label: '🎛️ Dashboard & Buttons', icon: '🎛️' },
  { id: 'soc_drawer', label: '🔬 Threat Inspector & XAI', icon: '🔬' },
  { id: 'playback', label: '⏪ Time-Travel Playback', icon: '⏪' },
  { id: 'mitre', label: '🛡️ MITRE & Threats', icon: '🛡️' },
  { id: 'shortcuts', label: '⌨️ Shortcuts & Tips', icon: '⌨️' },
];

export default function ProjectGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchFilter, setSearchFilter] = useState('');

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(2, 6, 23, 0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      color: '#ffffff',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Modal Container */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(8, 15, 35, 0.98) 0%, rgba(2, 6, 23, 0.98) 100%)',
        border: '1px solid rgba(0, 255, 204, 0.4)',
        borderRadius: '16px',
        width: '95vw',
        maxWidth: '1200px',
        height: '88vh',
        maxHeight: '900px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 50px rgba(0, 255, 204, 0.2), 0 25px 60px rgba(0, 0, 0, 0.9)',
        overflow: 'hidden',
        position: 'relative'
      }}>

        {/* ─── Modal Header ─── */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(0, 255, 204, 0.25)',
          background: 'linear-gradient(90deg, rgba(0, 255, 204, 0.08) 0%, rgba(56, 189, 248, 0.04) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(0, 255, 204, 0.15)',
              border: '1px solid #00ffcc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 0 15px rgba(0, 255, 204, 0.3)'
            }}>
              📘
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#00ffcc', letterSpacing: '0.08em' }}>
                  GLOBAL SOC INTELLIGENCE SYSTEM MANUAL
                </h1>
                <span style={{
                  fontSize: '9px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(0, 255, 204, 0.2)',
                  color: '#00ffcc',
                  border: '1px solid rgba(0, 255, 204, 0.5)',
                  fontWeight: 'bold'
                }}>
                  v2.4 PRO SOC
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>
                Comprehensive operational guide, button breakdown, and architecture documentation
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: '4px' }}>
              Press <kbd style={{ color: '#00ffcc', fontWeight: 'bold' }}>ESC</kbd> or <kbd style={{ color: '#00ffcc', fontWeight: 'bold' }}>?</kbd> to toggle
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 23, 79, 0.15)',
                border: '1px solid rgba(255, 23, 79, 0.5)',
                color: '#ff174f',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ff174f';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 23, 79, 0.15)';
                e.currentTarget.style.color = '#ff174f';
              }}
              title="Close Manual (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ─── Navigation Tabs Bar ─── */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '10px 24px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto',
          flexShrink: 0
        }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '0.04em',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: `1px solid ${isActive ? '#00ffcc' : 'rgba(255, 255, 255, 0.1)'}`,
                  background: isActive ? 'rgba(0, 255, 204, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#00ffcc' : 'rgba(255, 255, 255, 0.7)',
                  boxShadow: isActive ? '0 0 15px rgba(0, 255, 204, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Tab Content Body ─── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          fontSize: '13px',
          lineHeight: '1.65',
          color: 'rgba(255, 255, 255, 0.88)'
        }}>

          {/* ════════════════════ TAB 1: OVERVIEW & PURPOSE ════════════════════ */}
          {activeTab === 'overview' && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.08) 0%, rgba(56, 189, 248, 0.04) 100%)',
                border: '1px solid rgba(0, 255, 204, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h2 style={{ margin: '0 0 10px', fontSize: '18px', color: '#00ffcc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎯</span> What is this Project & Why was it Built?
                </h2>
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                  The <strong>3D Global Cyber Threat Visualizer & AI SOC Platform</strong> is a mission-critical, real-time Security Operations Center (SOC) intelligence system. It transforms millions of raw network packets, telemetry logs, and distributed cyber attacks into an interactive, 3D geospatial threat matrix powered by Deep Learning Network Intrusion Detection (NIDS), MITRE ATT&CK taxonomy, and time-travel forensics.
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>
                  Traditional SIEM logs (text tables) suffer from cognitive overload during large-scale cyber warfare or distributed botnet campaigns. This platform gives SOC Tier 1–3 analysts instantaneous situational awareness of global cyber battlefields.
                </p>
              </div>

              <h3 style={{ fontSize: '15px', color: '#38bdf8', marginBottom: '14px', borderBottom: '1px solid rgba(56,189,248,0.2)', paddingBottom: '6px' }}>
                🔑 Core Missions & Key Capabilities
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ color: '#00ffcc', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                    🌐 Real-Time 3D Geospatial Threat Mapping
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    Renders live ballistic threat trajectories between global attacker IP origins and victim infrastructure nodes with sub-second latency across continents.
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ color: '#ff6b35', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                    🧠 Deep Learning NIDS + Concept Drift Detection
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    PyTorch neural network classifies zero-day anomalies and monitors statistical Kolmogorov-Smirnov drift to catch evasive, evolving polymorphic malware.
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ color: '#ffd166', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                    🛡️ MITRE ATT&CK Matrix & Remediation Guidance
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    Maps every detected vector to enterprise MITRE Enterprise ATT&CK Technique IDs (e.g., T1498, T1190) and prescribes instant mitigation playbooks.
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                    ⏪ Historical Time-Travel Forensics Scrubber
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    Query SQLite WAL persistence across 15m, 1h, 6h, and 24h windows to rewind, scrub, and step through past breaches with speed controls.
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ color: '#ff174f', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                    🔬 Explainable AI (XAI) & Incident Action Engine
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    Deep-dive drawer with feature importance bars (packet entropy, burst rate), one-click IP containment firewall rule generation, and SIEM forensic exports.
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ color: '#a78bfa', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                    🗺️ Seamless Orbit-to-Street GIS Drill-down
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    Zooming in seamlessly transitions from deep space orbital 3D globe to high-resolution street-level OpenStreetMap geospatial node tiles.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════ TAB 2: ARCHITECTURE ════════════════════ */}
          {activeTab === 'architecture' && (
            <div>
              <h2 style={{ fontSize: '16px', color: '#00ffcc', margin: '0 0 14px' }}>
                ⚙️ End-to-End Enterprise Architecture & Data Pipeline
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '18px' }}>
                The platform is built on an event-driven, microservices-oriented distributed architecture optimized for ultra-low latency, zero data loss, and high throughput.
              </p>

              {/* Visual Pipeline Block */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(0, 255, 204, 0.25)',
                borderRadius: '12px',
                padding: '18px',
                marginBottom: '22px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#ff6b35', color: '#000', fontWeight: 'bold', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', minWidth: '130px', textAlign: 'center' }}>
                      1. Ingestion Layer
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
                      <strong>Apache Kafka Cluster & Synthetic Threat Generators</strong> ingest multi-source NetFlow / PCAP packet telemetry across global honeypots and cloud endpoints.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#ffd166', color: '#000', fontWeight: 'bold', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', minWidth: '130px', textAlign: 'center' }}>
                      2. AI / ML NIDS Engine
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
                      <strong>PyTorch Deep Learning Model</strong> performs real-time classification, scoring severity, anomaly confidence, feature attribution, and online Concept Drift detection.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#00ffcc', color: '#000', fontWeight: 'bold', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', minWidth: '130px', textAlign: 'center' }}>
                      3. Backend Server
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
                      <strong>Node.js / Express / Socket.IO Cluster</strong> delivers bidirectional real-time event broadcasting, automated fallback streaming, and security authentication.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#38bdf8', color: '#000', fontWeight: 'bold', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', minWidth: '130px', textAlign: 'center' }}>
                      4. Persistence Layer
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
                      <strong>SQLite with Write-Ahead Logging (WAL)</strong> enables ultra-fast sub-millisecond writes, indexed temporal queries, and historical replay forensics.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#a78bfa', color: '#000', fontWeight: 'bold', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', minWidth: '130px', textAlign: 'center' }}>
                      5. Visualization Client
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
                      <strong>React 19 + Three.js + WebGL + Deck.gl + Leaflet</strong> renders GPU-accelerated 3D spherical bezier arcs, spatial particle effects, and GIS overlays.
                    </div>
                  </div>

                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#00ffcc', fontSize: '12px' }}>🚀 Cloud Hosting (Render & Netlify)</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li><strong>Backend on Render:</strong> Hosted with Node 20 runtime, auto-streaming fallback, SQLite persistence, and CORS WebSocket bridge.</li>
                    <li><strong>Frontend on Netlify:</strong> High-performance edge CDN distributing optimized Vite single-page application bundle.</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#38bdf8', fontSize: '12px' }}>📈 Observability & Webhooks</h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li><strong>Prometheus Endpoint:</strong> <code>/metrics</code> exposes ingestion rate, backpressure, drift moving average, and memory utilization.</li>
                    <li><strong>Webhook Dispatcher:</strong> Automatically pushes critical alerts to external Discord/Slack/SIEM webhook endpoints.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════ TAB 3: DASHBOARD & BUTTONS ════════════════════ */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ fontSize: '16px', color: '#00ffcc', margin: '0 0 12px' }}>
                🎛️ Complete Dashboard Controls & Button Directory
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '18px' }}>
                Every single button, indicator, and viewport control explained in detail:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Section A: Top Right Guide & Header */}
                <div style={{ background: 'rgba(0, 255, 204, 0.05)', border: '1px solid rgba(0, 255, 204, 0.25)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ffcc', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>
                    <span>📘</span> TOP RIGHT: SYSTEM GUIDE BUTTON
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
                    <strong>[📘 SYSTEM GUIDE / ?] Button:</strong> Opens this complete operational manual and architectural blueprint modal. Accessible at all times and toggled with the <code>?</code> keyboard key.
                  </div>
                </div>

                {/* Section B: Top-Left HUD Feed Panel */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '13px', marginBottom: '10px' }}>
                    📟 TOP-LEFT: CYBER THREAT SOC HUD PANEL
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                    <div>
                      <span style={{ color: '#00ffcc', fontWeight: 'bold' }}>• Status Indicator Badge:</span> Displays live connection state (<code>KAFKA LIVE</code>, <code>WS CONNECTED</code>, <code>PLAYBACK MODE</code>, or <code>WS OFFLINE</code>).
                    </div>
                    <div>
                      <span style={{ color: '#ffd166', fontWeight: 'bold' }}>• ⚡ TEST ATTACK Button:</span> Manually generates and fires an immediate synthetic threat payload into the pipeline for testing detection triggers.
                    </div>
                    <div>
                      <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>• 📊 ANALYTICS Button:</span> Opens the SOC Intelligence & Prometheus Metrics dashboard modal with ingestion graphs and drift trends.
                    </div>
                    <div>
                      <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>• 🔄 SPHERE ROTATION Button:</span> Toggles smooth orbital rotation of the 3D Earth sphere or locks camera orientation for precise aiming.
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#ff6b35', fontWeight: 'bold' }}>• Live Threat Feed Cards:</span> Displays the 10 most recent attacks with MITRE technique codes, severity color bar, drift percentage, source IP, and origin city. <em>Click any card to open the Threat Inspector Drawer!</em>
                    </div>
                  </div>
                </div>

                {/* Section C: Top Floating Filter Bar */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ color: '#ffd166', fontWeight: 'bold', fontSize: '13px', marginBottom: '10px' }}>
                    🔍 TOP FLOATING THREAT FILTER BAR
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                    <div>
                      <span style={{ color: '#00ffcc', fontWeight: 'bold' }}>• Search Input (🔍):</span> Instant text search across Source IPs, Origin Cities, Threat Types, or MITRE Technique IDs (e.g. <code>T1498</code>, <code>Tokyo</code>, <code>185.42</code>).
                    </div>
                    <div>
                      <span style={{ color: '#ff174f', fontWeight: 'bold' }}>• Severity Filters (CRIT, HIGH, MED, LOW):</span> Click to isolate threats by ML severity classification threshold.
                    </div>
                    <div>
                      <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>• Threat Type Dropdown:</span> Filters the stream by attack vector (DDoS, SQL Injection, Malware Drop, Port Scan, Brute Force, Drift).
                    </div>
                    <div>
                      <span style={{ color: '#ffd166', fontWeight: 'bold' }}>• ⏸ FREEZE / ▶ RESUME Button:</span> Freezes incoming visual telemetry so analysts can inspect active incidents without items disappearing.
                    </div>
                    <div>
                      <span style={{ color: '#00ffcc', fontWeight: 'bold' }}>• 🔊 AUDIO ON / 🔇 MUTED Button:</span> Toggles Web Audio API synthesizer alert chimes on critical threat ingress.
                    </div>
                    <div>
                      <span style={{ color: '#ff174f', fontWeight: 'bold' }}>• Counter & CRIT Badge:</span> Shows real-time matching threat count and active critical events in viewport.
                    </div>
                  </div>
                </div>

                {/* Section D: 3D Globe & Map Viewport */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ color: '#a78bfa', fontWeight: 'bold', fontSize: '13px', marginBottom: '10px' }}>
                    🌍 3D GLOBE & SEAMLESS STREET-LEVEL GIS MAP
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                    <div>
                      <span style={{ color: '#00ffcc', fontWeight: 'bold' }}>• Ballistic Cyber Arcs:</span> Color-coded 3D bezier curves connecting origin IP node to target server node with animated particle pulses.
                    </div>
                    <div>
                      <span style={{ color: '#ff6b35', fontWeight: 'bold' }}>• Click-to-Inspect Globe Nodes:</span> Click any threat point directly on the globe to open forensic telemetry and auto-align camera.
                    </div>
                    <div>
                      <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>• Mouse Orbit / Zoom:</span> Left-click + drag to rotate globe; scroll wheel to zoom from space into continent level.
                    </div>
                    <div>
                      <span style={{ color: '#ffd166', fontWeight: 'bold' }}>• Seamless Street View Mode:</span> Zooming past threshold transitions smoothly into OpenStreetMap tile layer for micro-location inspection.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ════════════════════ TAB 4: THREAT INSPECTOR & XAI ════════════════════ */}
          {activeTab === 'soc_drawer' && (
            <div>
              <h2 style={{ fontSize: '16px', color: '#00ffcc', margin: '0 0 12px' }}>
                🔬 Deep Threat Inspector Drawer & Explainable AI (XAI)
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '18px' }}>
                Clicking any threat in the live feed or 3D globe slides out the comprehensive Forensic Intelligence Drawer on the right:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px' }}>
                  <h3 style={{ color: '#38bdf8', margin: '0 0 10px', fontSize: '13px' }}>1. Raw Network Telemetry & Geolocation</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                    Displays exact Source IP address, Target IP/Service, Origin City, Country, Geographic Latitude/Longitude, Protocol, Destination Port, and UTC Timestamp.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px' }}>
                  <h3 style={{ color: '#ffd166', margin: '0 0 10px', fontSize: '13px' }}>2. MITRE ATT&CK Framework Breakdown</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: '0 0 8px' }}>
                    Directly aligns the event with official MITRE Enterprise matrices:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <li><strong>Technique ID:</strong> e.g., <code>T1498 (Network Denial of Service)</code>, <code>T1190 (Exploit Public-Facing Application)</code>.</li>
                    <li><strong>Tactic Phase:</strong> Initial Access, Execution, Persistence, Impact, Lateral Movement.</li>
                    <li><strong>Tactical Mitigations:</strong> Specific defense playbooks (e.g., Anycast rate-limiting, WAF rules, parameterized SQL queries).</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px' }}>
                  <h3 style={{ color: '#ff6b35', margin: '0 0 10px', fontSize: '13px' }}>3. PyTorch Explainable AI (XAI) Attribution</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: '0 0 8px' }}>
                    Explains <em>why</em> the deep learning model classified the event as malicious:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '11px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                      <strong style={{ color: '#00ffcc' }}>Packet Size Anomaly:</strong> Deviation from normal MTU.
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                      <strong style={{ color: '#ffd166' }}>Payload Shannon Entropy:</strong> Encrypted or packed payloads.
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                      <strong style={{ color: '#ff6b35' }}>Port Signature Mismatch:</strong> Non-standard protocol tunnels.
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                      <strong style={{ color: '#ff174f' }}>Burst Rate Spike:</strong> Rapid PPS volumetric frequency.
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px' }}>
                  <h3 style={{ color: '#00ffcc', margin: '0 0 10px', fontSize: '13px' }}>4. SOC Analyst Remediation Actions</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
                    <div>
                      <strong style={{ color: '#ff174f' }}>🚫 [BLOCK IP / UNBLOCK IP]:</strong> Simulates instant firewall containment rule, isolating malicious traffic from the visualizer.
                    </div>
                    <div>
                      <strong style={{ color: '#38bdf8' }}>📥 [EXPORT FORENSICS JSON]:</strong> Downloads complete STIX/NIST-formatted incident artifact file for external SIEM ingest.
                    </div>
                    <div>
                      <strong style={{ color: '#ffd166' }}>⚠️ [MARK FALSE POSITIVE]:</strong> Submits analyst validation feedback back to the drift calibration model.
                    </div>
                    <div>
                      <strong style={{ color: '#00ffcc' }}>🎯 [FOCUS ON GLOBE]:</strong> Smoothly animates the 3D camera to frame the origin of the threat.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════ TAB 5: HISTORICAL PLAYBACK ════════════════════ */}
          {activeTab === 'playback' && (
            <div>
              <h2 style={{ fontSize: '16px', color: '#ffd166', margin: '0 0 12px' }}>
                ⏪ Historical Time-Travel Playback Scrubber
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '18px' }}>
                Located at the bottom of the screen, the Historical Playback Bar allows SOC analysts to rewind time and replay cyber attacks as they occurred.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(255, 209, 102, 0.05)', border: '1px solid rgba(255, 209, 102, 0.3)', borderRadius: '10px', padding: '16px' }}>
                  <h3 style={{ color: '#ffd166', margin: '0 0 8px', fontSize: '13px' }}>
                    ⏪ [HISTORICAL PLAYBACK] Toggle Button
                  </h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    Switches the application from live WebSocket streaming mode to SQLite WAL historical query mode. The top HUD badge turns amber to indicate playback state.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ color: '#00ffcc', fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>
                      ⏱️ Time Window Selector (15m, 1h, 6h, 24h)
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                      Fetches persisted attack records from the SQLite database matching the chosen timeframe for rapid incident reconstruction.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>
                      🎚️ Interactive Timeline Scrubber Slider
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                      Drag the slider or click anywhere on the timeline to jump directly to an exact historical attack event with severity tick marks.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ color: '#ff6b35', fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>
                      ⏯️ Play / Pause & Frame-by-Frame Stepping
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                      Use <code>▶ PLAY</code>, <code>⏮ STEP BACK</code>, and <code>⏭ STEP FWD</code> buttons for microsecond-accurate forensic attack progression.
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ color: '#a78bfa', fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>
                      ⏩ Playback Speed Multiplier (1x, 2x, 5x, 10x)
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                      Accelerates or slows down replay velocity for reviewing hours of incident logs in seconds.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════ TAB 6: MITRE ATT&CK ════════════════════ */}
          {activeTab === 'mitre' && (
            <div>
              <h2 style={{ fontSize: '16px', color: '#00ffcc', margin: '0 0 12px' }}>
                🛡️ MITRE ATT&CK Matrix & Threat Taxonomy Reference
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '18px' }}>
                The visualizer categorizes attacks according to official MITRE Enterprise Framework techniques:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {[
                  {
                    name: 'DDoS / Volumetric Flood',
                    mitre: 'T1498 (Network Denial of Service)',
                    tactic: 'Impact',
                    severity: 'Critical / High (85%)',
                    color: '#ff174f',
                    desc: 'High-volume UDP/SYN flood aimed at depleting link bandwidth and service availability.',
                    mitigation: 'Implement BGP Flowspec rate limits, Anycast scrubbers, and SYN cookies.'
                  },
                  {
                    name: 'SQL Injection (SQLi)',
                    mitre: 'T1190 (Exploit Public-Facing App)',
                    tactic: 'Initial Access / Execution',
                    severity: 'High (60%)',
                    color: '#ff6b35',
                    desc: 'Crafted SQL payload injected via HTTP parameters to bypass auth and exfiltrate database records.',
                    mitigation: 'Enforce Parameterized SQL queries, ORM sanitation, and WAF inspection.'
                  },
                  {
                    name: 'Malware Drop / C2 Beacon',
                    mitre: 'T1059 (Command and Scripting Interpreter)',
                    tactic: 'Execution / Command & Control',
                    severity: 'Critical (75%)',
                    color: '#ff174f',
                    desc: 'Malicious payload staged or secondary beacon establishing remote access to target host.',
                    mitigation: 'Endpoint Detection and Response (EDR), process containment, DNS sinkholing.'
                  },
                  {
                    name: 'Reconnaissance / Port Scan',
                    mitre: 'T1046 (Network Service Discovery)',
                    tactic: 'Discovery',
                    severity: 'Low / Medium (25%)',
                    color: '#38bdf8',
                    desc: 'Automated SYN/FIN probe scanning destination ports for exposed vulnerable daemon services.',
                    mitigation: 'Drop unmapped ingress ports, employ Port Knocking, and rate-limit TCP handshakes.'
                  },
                  {
                    name: 'Credential Brute Force',
                    mitre: 'T1110 (Brute Force)',
                    tactic: 'Credential Access',
                    severity: 'Medium (45%)',
                    color: '#ffd166',
                    desc: 'High-frequency authentication attempts cycling dictionary wordlists against SSH/RDP/Web portals.',
                    mitigation: 'Enforce MFA / FIDO2 tokens, account lockout thresholds, and fail2ban IP blocks.'
                  },
                  {
                    name: 'Adversarial Drift / Polymorphic Zero-Day',
                    mitre: 'T1027 (Obfuscated / Evasive Payloads)',
                    tactic: 'Defense Evasion',
                    severity: 'High (65%)',
                    color: '#a78bfa',
                    desc: 'Polymorphic evasion attempting to bypass traditional static heuristic signatures; flagged by PyTorch Drift Detector.',
                    mitigation: 'Trigger human-in-the-loop retraining, isolate affected subnet, and inspect memory dumps.'
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderLeft: `4px solid ${item.color}`,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    borderRight: '1px solid rgba(255,255,255,0.08)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    padding: '14px 18px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: item.color, fontWeight: 'bold', fontSize: '13px' }}>{item.name}</span>
                        <span style={{ background: 'rgba(0,255,204,0.15)', color: '#00ffcc', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                          {item.mitre}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: item.color, fontWeight: 'bold' }}>Tactic: {item.tactic}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>
                      {item.desc}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(0,255,204,0.85)' }}>
                      🛡️ <strong>Mitigation:</strong> {item.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════ TAB 7: SHORTCUTS & TIPS ════════════════════ */}
          {activeTab === 'shortcuts' && (
            <div>
              <h2 style={{ fontSize: '16px', color: '#00ffcc', margin: '0 0 12px' }}>
                ⌨️ Keyboard Shortcuts & Pro SOC Tips
              </h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginBottom: '18px' }}>
                Master keyboard shortcuts and power-user workflows for lightning-fast threat response:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {[
                  { key: '?', desc: 'Toggle this System Guide / Operational Manual' },
                  { key: 'H', desc: 'Alternative hotkey for Help / Manual' },
                  { key: 'Space', desc: 'Freeze / Resume live threat stream' },
                  { key: 'M', desc: 'Toggle audio alert chimes on/off' },
                  { key: 'R', desc: 'Toggle auto-rotation on 3D globe' },
                  { key: 'Esc', desc: 'Close open drawers, modals, or reset selection' },
                  { key: 'Left / Right', desc: 'Step backward / forward in historical playback' },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <kbd style={{
                      background: 'rgba(0, 255, 204, 0.15)',
                      border: '1px solid #00ffcc',
                      color: '#00ffcc',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      boxShadow: '0 0 8px rgba(0, 255, 204, 0.2)'
                    }}>
                      {item.key}
                    </kbd>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', textAlign: 'right' }}>
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#38bdf8', fontSize: '13px' }}>💡 Pro Analyst Workflow</h4>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>When a critical alert strikes, hit <kbd style={{ color: '#00ffcc' }}>Space</kbd> to freeze the stream.</li>
                  <li>Click the red threat card to open the <strong>Threat Detail Drawer</strong> and review the MITRE attack technique.</li>
                  <li>Check the PyTorch XAI feature attribution bars to determine if it is a volumetric burst or polymorphic exploit.</li>
                  <li>Click <strong style={{ color: '#ff174f' }}>BLOCK IP</strong> to isolate the offender and <strong style={{ color: '#38bdf8' }}>EXPORT FORENSICS</strong> to download the STIX incident file.</li>
                  <li>Hit <kbd style={{ color: '#00ffcc' }}>Space</kbd> again to unfreeze and return to the live global feed!</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* ─── Modal Footer ─── */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(2, 6, 23, 0.95)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          <div>
            Built with <strong>React 19 • Three.js • PyTorch • SQLite WAL • Kafka • Socket.IO</strong>
          </div>
          <button
            onClick={onClose}
            style={{
              fontFamily: 'inherit',
              background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)',
              border: '1px solid #00ffcc',
              color: '#00ffcc',
              borderRadius: '6px',
              padding: '6px 16px',
              fontWeight: 'bold',
              fontSize: '11px',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(0, 255, 204, 0.2)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 255, 204, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 204, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)'}
          >
            GOT IT / CLOSE MANUAL ➔
          </button>
        </div>

      </div>
    </div>
  );
}
