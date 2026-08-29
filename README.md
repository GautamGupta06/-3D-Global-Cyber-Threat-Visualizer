# 🌐 3D Cyber Threat Intelligence & NIDS SOC Visualizer

An intelligent, real-time **Network Intrusion Detection System (NIDS)** and **3D Cyber Threat Operations Center (SOC)** powered by **PyTorch Deep Autoencoders**, **Concept Drift Detection**, **Node.js WebSockets**, and **Three.js / React-Three-Fiber**.

---

## 🚀 Architecture Overview

```
[ Aggregated Stream / Honeypots ]
              │
              ▼
[ PyTorch NIDS AI Brain ] ──► (Reconstruction Error ||x - x̂||² + Concept Drift P_t(X) ≠ P_t-1(X))
              │
              ▼ (Enriched Threat JSON via HTTP / WebSockets)
[ Node.js & Socket.IO SOC Backend ] (Port 4000)
              │
              ▼ (Real-time Broadcast)
[ React + Three.js 3D Cyber Globe ] (Port 5173)
  ├── 3D Photorealistic Earth Globe with Atmospheric Rim Glow
  ├── 3D Parabolic Laser Trajectory Arcs with Traveling Photons
  ├── 280+ Worldwide Cities & Dynamic GPS Coordinates
  ├── Live SOC HUD with Real-time Threat Logs & Drift Scores
  └── Seamless Zoom-In to Road & Building Maps
```

---

## 🧠 Key Features

- **PyTorch Deep Autoencoder (`backend/ml/nids_autoencoder.py`):** Trains on normal traffic distribution; detects malicious traffic (DDoS, SQL Injection, Port Scans, Malware Drops, Brute Force) through reconstruction error spikes.
- **Statistical Concept Drift Engine:** Tracks sliding window distribution shifts ($P_t(X) \text{ vs } P_{t-1}(X)$) to expose adversarial evasion tactics and subtle traffic shifts in real-time.
- **3D Parabolic Laser Arcs (`CyberGlobe.jsx`):** Renders curved 3D Great-Circle trajectories elevated above the planetary surface connecting worldwide origins to global cloud gateways.
- **Seamless Road Map Mode (`SeamlessMapView.jsx`):** Deep zoom into planetary surface seamlessly transitions into high-resolution satellite, street, and building level maps.
- **Multi-Region Global Hubs:** Over 280+ international tech hubs and capitals across all continents.

---

## 🛠️ Quick Start Guide

### 1. Start the Backend Server
```powershell
cd backend
npm install
node server.js
```
*Backend runs on `http://localhost:4000`*

### 2. Start the 3D Globe Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

### 3. Start the PyTorch AI NIDS & Concept Drift Stream Processor
```powershell
python backend/ml/stream_processor.py
```

---

## 📁 Repository Structure

```
├── backend/
│   ├── ml/
│   │   ├── nids_autoencoder.py   # PyTorch Deep Autoencoder & Drift Detection
│   │   └── stream_processor.py   # Real-time Streaming Feature Aggregator
│   ├── docker-compose.yml        # Kafka KRaft mode container setup
│   ├── producer.py               # Raw Kafka threat log producer
│   └── server.js                 # Express + Socket.IO WebSocket Gateway
├── frontend/
│   ├── src/
│   │   ├── component/
│   │   │   ├── CyberGlobe.jsx     # 3D Earth Globe, Arcs & Markers
│   │   │   ├── Atmosphere.jsx     # Atmospheric Rayleigh scattering glow
│   │   │   └── SeamlessMapView.jsx# Road & Street level map view
│   │   ├── App.jsx               # Main Cyber SOC HUD Dashboard
│   │   └── App.css               # Styling & HUD Glassmorphism
└── README.md
```
