# 🌐 3D Cyber Threat Intelligence & NIDS SOC Visualizer

An intelligent, real-time **Network Intrusion Detection System (NIDS)** and **3D Cyber Threat Operations Center (SOC)** powered by **PyTorch Deep Autoencoders**, **Explainable AI (XAI)**, **Concept Drift Detection**, **SQLite Persistence**, **Node.js WebSockets**, and **Three.js / React-Three-Fiber**.

---

## 🚀 Architecture Overview

```
[ Aggregated Stream / Honeypots / Synthetic Generator ]
                     │
                     ▼
[ PyTorch NIDS AI Brain & Explainability Engine ]
   ├── Reconstruction Error (||x - x̂||²) & Adaptive EWMA / P95 Cutoffs
   ├── Per-Alert Feature Attribution (Top 3 Driving Anomaly Factors)
   ├── Latent Bottleneck Secondary Classifier (Confidence Scoring)
   └── Concept Drift Engine (P_t(X) ≠ P_{t-1}(X) adversarial detection)
                     │
                     ▼ (Enriched Threat Telemetry)
[ Node.js + Socket.IO + SQLite WAL Backend ] (Port 4000)
   ├── Rate Limiting & Backpressure Queue Protection
   ├── SQLite WAL Event Persistence & Multi-parameter History Queries
   ├── Prometheus /metrics & Health Observability Scraper
   ├── Webhook Alert Dispatcher (Slack / Discord / Custom Webhooks)
   └── Socket.IO Token Authentication
                     │
                     ▼ (Real-time Broadcast & Time Replay)
[ React + Three.js 3D Cyber Globe HUD ] (Port 5173)
   ├── 3D Photorealistic Earth with Rayleigh Atmospheric Glow
   ├── 3D Parabolic Trajectory Arcs & Photon Particles with Hover Raycasting
   ├── MITRE ATT&CK Matrix Mapping (T1498, T1190, T1105, T1046, T1110, T1027)
   ├── Interactive Click-to-Inspect Drawer with 4 Tabbed Diagnostic Views
   ├── SOC Filter Toolbar (Severity pills, type filters, live text search)
   ├── Historical Time Scrubber & Playback Mode (15m, 1h, 6h, 24h)
   ├── SOC Analytics & Aggregated KPIs Intelligence Modal
   └── Web Audio API Alert Chimes & Active Firewall Null-Route Simulation
```

---

## 🧠 Key Features

- **PyTorch Deep Autoencoder (`backend/ml/nids_autoencoder.py`):** Trains on normal traffic baselines; calculates reconstruction error spikes ($\|x - \hat{x}\|^2$) with dynamic EWMA and rolling 95th-percentile adaptive cutoffs.
- **Explainable AI (XAI) Feature Attribution:** Surfaces the top 3 driving features contributing to each anomaly (e.g. `packet_rate_pps`, `syn_ack_ratio`, `uri_entropy`, `payload_length`).
- **Statistical Concept Drift Engine:** Tracks sliding window distribution shifts ($P_t(X) \text{ vs } P_{t-1}(X)$) to expose adversarial evasion tactics.
- **MITRE ATT&CK Mapping:** Automatically maps alerts to standard technique IDs with links to `attack.mitre.org` and tactical mitigation advice.
- **High-Performance SQLite WAL Store (`backend/db.js`):** Fully persistent event history with fast indexing for historical query filters and playback scrubbing.
- **Time Scrubber Playback Mode:** Rewind and re-animate 3D laser arcs across historical time windows with play/pause and 0.5x–5x speed controls.
- **Prometheus `/metrics` & Health API:** Native observability for Grafana and SOC metric scrapers.
- **Webhooks & Alerting (`backend/webhook.js`):** Instant dispatch for `CRITICAL` severity events to Slack or Discord.

---

## 🛠️ Quick Start Guide

### Option A: Unified Docker Compose (Recommended)
Run the entire stack (Frontend, Backend, PyTorch ML Brain, and Kafka) with a single command:
```powershell
docker compose up --build
```
- **3D SOC HUD Frontend:** `http://localhost:5173`
- **SOC Backend Gateway:** `http://localhost:4000`
- **Prometheus Metrics:** `http://localhost:4000/metrics`

---

### Option B: Local Development

#### 1. Start the Backend Server
```powershell
cd backend
npm install
node server.js
```
*Backend runs on `http://localhost:4000` (SQLite store auto-seeds on first launch).*

#### 2. Start the 3D Globe Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

#### 3. Start the PyTorch AI NIDS Stream Processor
```powershell
python backend/ml/stream_processor.py
```

#### 4. (Optional) Run Synthetic Demo Traffic Generator
```powershell
node backend/scripts/demo_traffic.js --count 50
```

---

## 📁 Repository Structure

```
├── backend/
│   ├── data/                 # SQLite WAL persistence store (threat_history.db)
│   ├── ml/
│   │   ├── nids_autoencoder.py   # PyTorch Deep Autoencoder, XAI & Drift Engine
│   │   ├── stream_processor.py   # Real-time Streaming Feature Aggregator
│   │   ├── Dockerfile            # Python ML container definition
│   │   └── requirements.txt      # PyTorch & NumPy dependencies
│   ├── scripts/
│   │   └── demo_traffic.js       # Synthetic demo attack generator CLI
│   ├── db.js                     # SQLite persistence layer & aggregation queries
│   ├── webhook.js                # Slack, Discord & generic webhook dispatcher
│   ├── server.js                 # Express + Socket.IO + Rate limiter + Prometheus
│   └── Dockerfile                # Node backend container definition
├── frontend/
│   ├── src/
│   │   ├── component/
│   │   │   ├── CyberGlobe.jsx         # 3D Earth Globe, Arcs & Raycast Markers
│   │   │   ├── Atmosphere.jsx         # Atmospheric Rayleigh scattering glow
│   │   │   ├── SeamlessMapView.jsx    # Road & Street level map view
│   │   │   ├── ThreatDetailDrawer.jsx # Click-to-Inspect side panel
│   │   │   ├── ThreatFilterBar.jsx    # SOC Filter Toolbar
│   │   │   ├── PlaybackControlBar.jsx # Time scrubber & transport controls
│   │   │   └── SOCStatsModal.jsx      # Aggregated metrics & analytics modal
│   │   ├── utils/
│   │   │   └── mitreMapping.js        # MITRE ATT&CK framework mapping
│   │   ├── App.jsx                   # Main Cyber SOC HUD Dashboard
│   │   └── App.css                   # Cyber styling & glassmorphism
│   └── Dockerfile                    # Multi-stage Nginx container definition
├── docker-compose.yml        # Unified full-stack docker compose
├── ROADMAP.md                # Feature roadmap & architectural phases
└── README.md
```
