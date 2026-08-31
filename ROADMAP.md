# 🌐 3D Cyber Threat Intelligence & NIDS SOC Visualizer — Feature Roadmap

This document lists proposed additional features for the project, grouped by layer of the architecture. Each item includes a short rationale and suggested scope so it can be picked up as a standalone task or GitHub issue.

---

## 1. Detection / ML Layer

| Feature | Description | Why it matters |
|---|---|---|
| **Per-alert explainability** | Surface which input features drove the reconstruction error (e.g. SHAP values, or simple per-feature error contribution from the autoencoder) | Analysts see *why* traffic was flagged, not just a score — critical for trust and triage speed |
| **Secondary attack-type classifier** | Train a lightweight supervised model (XGBoost / small NN) on labeled traffic to output a specific label (DDoS, SQLi, port scan, brute force, malware drop) alongside the anomaly score | The autoencoder only says "anomalous" — a classifier gives actionable attack-type context |
| **MITRE ATT&CK tagging** | Map detected patterns to ATT&CK technique IDs (e.g. T1110 Brute Force, T1498 Network DoS) | Turns raw anomaly scores into industry-standard threat language; makes the tool read as a real SOC product |
| **Adaptive thresholding** | Replace the static reconstruction-error cutoff with an EWMA or rolling-percentile threshold | Avoids manual retuning as baseline traffic naturally shifts over time |
| **Analyst feedback loop** | "Mark as false positive / true positive" action in the UI, logged to a dataset for periodic retraining | Closes the loop between human judgment and model improvement |
| **Model versioning & metrics** | Track model version, training date, precision/recall on a held-out set | Makes the ML component auditable rather than a black box |

---

## 2. Backend / Data Layer

| Feature | Description | Why it matters |
|---|---|---|
| **Persistence layer** | Add TimescaleDB, PostgreSQL, or SQLite/Elasticsearch to store incident history | Currently pure streaming — no history means no playback, no trend analysis, no "what happened overnight" |
| **REST API for historical queries** | Endpoints to filter stored incidents by time range, country, severity, attack type | Enables reporting, dashboards, and the frontend playback feature below |
| **Alert integrations** | Push high-severity events to Slack, Discord, or a generic webhook | Real SOC tools need to notify people who aren't staring at the dashboard |
| **Auth on the WebSocket gateway** | Token-based handshake on the Socket.IO connection | Currently anyone who can reach port 4000 can subscribe to the live feed |
| **Unified docker-compose** | One compose file covering frontend, backend, Kafka, and the Python ML service | Removes the need to manually run three separate terminals to start the stack |
| **Rate limiting / backpressure handling** | Guard against event floods overwhelming the WebSocket broadcast or the frontend renderer | Protects the demo from crashing under a realistic attack burst |

---

## 3. Frontend / SOC HUD

| Feature | Description | Why it matters |
|---|---|---|
| **Time scrubber / playback mode** | Replay a stored window of past events on the globe instead of only live streaming | Lets analysts (or demo viewers) review specific incidents after the fact |
| **Filter panel** | Toggle visibility by attack type, severity, source country, or target country | Reduces visual clutter and supports focused investigation |
| **Click-to-inspect side panel** | Clicking an arc opens a panel with the raw event JSON, drift score, and explainability breakdown | Turns the globe from a "pretty visualization" into an actual investigative tool |
| **Country-level threat density heatmap** | Toggleable overlay showing aggregate threat volume per region alongside the arcs | Gives an at-a-glance "what's hot right now" view distinct from individual event arcs |
| **Severity-based audio/visual alerts** | Configurable alert sound/flash for critical-severity events, with a mute toggle | Matches real SOC wall-display conventions |
| **Dashboard summary stats** | Top source countries, top target countries, attack-type breakdown, rolling event count | Common expectation for this class of tool, currently only implied by the live log |

---

## 4. Operations / DevEx

| Feature | Description | Why it matters |
|---|---|---|
| **CI pipeline** | GitHub Actions running lint + tests on the Node backend and the Python ML service | Catches regressions before merge |
| **Structured logging & metrics endpoint** | Emit event throughput, drift score over time, and error rates in a format Prometheus/Grafana can scrape | Enables monitoring the pipeline itself, not just the threats it detects |
| **Environment config via `.env`** | Centralize ports, thresholds, and API keys instead of hardcoding | Standard practice for anything meant to run outside localhost |
| **Sample/synthetic data generator** | A script to replay realistic synthetic traffic for demos without needing live honeypot data | Makes the project runnable and demo-able out of the box |

---

## 🎯 Suggested Implementation Phases

### Phase 1: High-Impact Frontend & Threat Triage (Quick Wins)
- **Click-to-inspect side panel**: Select active arc / log entry to view full metadata, reconstruction loss, and attack traits.
- **HUD Filter Panel**: Filter by severity (Critical, High, Medium, Low), attack type, and country.
- **MITRE ATT&CK Mapping**: Map threat types (Brute Force `T1110`, DDoS `T1498`, SQLi `T1190`, Port Scan `T1046`, Malware Drop `T1105`) with badges in HUD and details.

### Phase 2: Persistence & Historical Query API
- **Persistence Store**: Lightweight SQLite/PostgreSQL layer in backend storing past $N$ incidents with fast indices.
- **REST Endpoints**: `/api/threats/history`, `/api/threats/stats`, `/api/threats/playback`.
- **Playback / Time Scrubber**: Frontend scrubber to rewind and visualize past attack waves.

### Phase 3: ML Intelligence & Explainability
- **Per-alert feature attribution**: Surface Top 3 driving features per anomaly spike.
- **Adaptive thresholding**: Rolling percentile / EWMA threshold for anomaly triggers.
- **Secondary attack-type classifier / confidence scoring**.

### Phase 4: Production Hardening & Ops
- **Unified Docker Compose**: Full-stack containerized deployment.
- **Gateway Auth & Rate Limiting**: Token-based Socket.IO handshake and event queue throttling.
- **Webhooks & Alerting**: Webhook dispatch for Critical severity incidents.
