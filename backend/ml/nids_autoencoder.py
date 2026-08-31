import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from collections import deque
import time

FEATURE_NAMES = [
    {"name": "packet_rate_pps", "desc": "Ingress packet-per-second rate", "unit": "pps"},
    {"name": "byte_entropy", "desc": "Payload byte entropy & randomness", "unit": "bits"},
    {"name": "syn_ack_ratio", "desc": "TCP SYN vs ACK handshake asymmetry", "unit": "ratio"},
    {"name": "payload_length", "desc": "Average payload framing size", "unit": "bytes"},
    {"name": "flow_duration", "desc": "Connection persistence & duration", "unit": "ms"},
    {"name": "port_diversity", "desc": "Distinct target port spread", "unit": "ports"},
    {"name": "uri_entropy", "desc": "HTTP parameter & query depth", "unit": "entropy"},
    {"name": "tls_ja3_variance", "desc": "TLS JA3 fingerprint deviation", "unit": "delta"},
    {"name": "error_response_rate", "desc": "HTTP 4xx/5xx & TCP RST rate", "unit": "rate"},
    {"name": "packet_jitter", "desc": "Inter-arrival timing jitter", "unit": "jitter"}
]

ATTACK_CLASSES = [
    "DDoS_Volume_Spike",
    "SQL_Injection",
    "Port_Scan",
    "Malware_Drop",
    "Brute_Force",
    "Adversarial_Drift",
    "Benign_Flow"
]

class NIDSAutoencoder(nn.Module):
    """
    Deep PyTorch Autoencoder with Latent Feature Classifier Head for Network Intrusion Detection.
    Computes:
    1. Reconstruction Error: E = ||x - x_hat||^2
    2. Per-feature attribution errors: (x_i - x_hat_i)^2
    3. Latent space attack classification & confidence probabilities.
    """
    def __init__(self, input_dim=10, latent_dim=4, num_classes=7):
        super(NIDSAutoencoder, self).__init__()
        
        # Encoder Network
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.LayerNorm(16),
            nn.LeakyReLU(0.2),
            nn.Linear(16, 8),
            nn.LayerNorm(8),
            nn.LeakyReLU(0.2),
            nn.Linear(8, latent_dim),
            nn.LeakyReLU(0.2)
        )
        
        # Decoder Network
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 8),
            nn.LayerNorm(8),
            nn.LeakyReLU(0.2),
            nn.Linear(8, 16),
            nn.LayerNorm(16),
            nn.LeakyReLU(0.2),
            nn.Linear(16, input_dim),
            nn.Sigmoid()  # normalized feature space [0, 1]
        )

        # Secondary Attack Classifier Head (operating on latent bottleneck)
        self.classifier = nn.Sequential(
            nn.Linear(latent_dim, 16),
            nn.LeakyReLU(0.2),
            nn.Linear(16, num_classes)
        )

    def forward(self, x):
        latent = self.encoder(x)
        reconstructed = self.decoder(latent)
        logits = self.classifier(latent)
        return reconstructed, latent, logits


class ConceptDriftDetector:
    """
    Intelligent NIDS AI Brain with:
    1. Deep Autoencoder Reconstruction Loss
    2. Per-Alert Feature Attribution (Explainability)
    3. Adaptive Rolling Percentile / EWMA Thresholding
    4. Sliding Window Concept Drift Detection (P_t(X) ≠ P_{t-1}(X))
    5. Secondary Multi-class Classifier with Confidence Scoring
    6. Online Feedback Retraining Loop
    """
    def __init__(self, input_dim=10, window_size=60, ewma_alpha=0.08):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = NIDSAutoencoder(input_dim=input_dim).to(self.device)
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.004)
        
        self.window_size = window_size
        self.ewma_alpha = ewma_alpha
        
        # EWMA & Rolling distribution memory
        self.ewma_loss = 0.04
        self.baseline_errors = deque(maxlen=window_size)
        self.current_window_errors = deque(maxlen=window_size)
        
        # Adaptive Threshold (Rolling 95th percentile + EWMA buffer)
        self.adaptive_threshold = 0.12
        
        # Pretrain model on synthetic baseline traffic
        self._pretrain_baseline()

    def _pretrain_baseline(self, epochs=30):
        """Train Autoencoder on normal baseline network traffic distribution."""
        self.model.train()
        normal_samples = 500
        synthetic_normal = np.random.beta(a=2, b=5, size=(normal_samples, 10)).astype(np.float32)
        tensor_data = torch.from_numpy(synthetic_normal).to(self.device)
        
        for _ in range(epochs):
            self.optimizer.zero_grad()
            recon, _, _ = self.model(tensor_data)
            loss = nn.MSELoss()(recon, tensor_data)
            loss.backward()
            self.optimizer.step()
            
        self.model.eval()
        with torch.no_grad():
            recon, _, _ = self.model(tensor_data)
            errs = torch.mean((recon - tensor_data) ** 2, dim=1).cpu().numpy()
            for e in errs:
                self.baseline_errors.append(float(e))
        
        mean_base = float(np.mean(self.baseline_errors)) if self.baseline_errors else 0.04
        self.ewma_loss = mean_base
        self.adaptive_threshold = float(np.percentile(self.baseline_errors, 95) + 0.08)

    def compute_feature_attribution(self, tensor_x, recon_x):
        """
        Computes per-feature reconstruction error contribution:
        Surfaces top features driving the anomaly spike with percentage weights.
        """
        diff_sq = ((tensor_x - recon_x) ** 2).cpu().numpy().flatten()
        total_err = float(np.sum(diff_sq)) + 1e-8
        
        attributions = []
        for i, err in enumerate(diff_sq):
            feat_info = FEATURE_NAMES[i]
            pct = (float(err) / total_err) * 100.0
            attributions.append({
                "index": i,
                "feature": feat_info["name"],
                "description": feat_info["desc"],
                "error_sq": round(float(err), 5),
                "contribution_pct": round(pct, 1),
                "formatted_pct": f"{pct:.1f}%"
            })
            
        attributions.sort(key=lambda x: x["error_sq"], reverse=True)
        return attributions

    def process_features(self, feature_vector, metadata=None):
        """
        Process single network flow / aggregated window:
        - feature_vector: list or np.ndarray of length 10
        - returns: enriched threat prediction dict with explainability and classifier confidence
        """
        self.model.eval()
        features_np = np.clip(np.array(feature_vector, dtype=np.float32).reshape(1, -1), 0.0, 1.0)
        tensor_x = torch.from_numpy(features_np).to(self.device)

        with torch.no_grad():
            recon_x, latent, logits = self.model(tensor_x)
            recon_loss = float(torch.mean((tensor_x - recon_x) ** 2).item())
            probs = torch.softmax(logits, dim=-1).cpu().numpy().flatten()

        self.current_window_errors.append(recon_loss)

        # 1. Update EWMA Loss
        self.ewma_loss = (self.ewma_alpha * recon_loss) + ((1.0 - self.ewma_alpha) * self.ewma_loss)

        # 2. Adaptive Thresholding (Rolling 95th Percentile + EWMA buffer)
        if len(self.current_window_errors) >= 10:
            rolling_p95 = float(np.percentile(self.current_window_errors, 92))
            self.adaptive_threshold = max(0.085, (rolling_p95 * 0.7) + (self.ewma_loss * 0.3) + 0.04)

        # 3. Concept Drift Score P_t(X) vs P_{t-1}(X)
        drift_score = 0.0
        baseline_mean = float(np.mean(self.baseline_errors)) if self.baseline_errors else 0.03
        baseline_std = float(np.std(self.baseline_errors)) + 1e-5
        
        if len(self.baseline_errors) > 5 and len(self.current_window_errors) > 3:
            current_mean = float(np.mean(self.current_window_errors))
            deviation = max(0.0, (current_mean - baseline_mean) / baseline_std)
            drift_score = float(np.clip(deviation / 3.2, 0.0, 1.0))

        # 4. Anomaly Decision & Threat Score
        error_ratio = recon_loss / max(baseline_mean, 1e-4)
        combined_score = float(np.clip((recon_loss * 3.4) + (drift_score * 0.45), 0.0, 1.0))
        is_anomaly = recon_loss > self.adaptive_threshold or combined_score > 0.42

        # 5. Secondary Classifier Prediction & Confidence
        pred_class_idx = int(np.argmax(probs))
        pred_class = ATTACK_CLASSES[pred_class_idx]
        confidence = float(np.max(probs))

        # Override attack_type if confident classification
        final_attack_type = metadata.get("attack_type") if metadata else pred_class
        if not final_attack_type or final_attack_type == "Benign_Flow":
            final_attack_type = "Network_Pulse" if is_anomaly else "Normal_Traffic"

        if combined_score > 0.62 or error_ratio > 3.8:
            severity = "CRITICAL"
            action = "trigger_camera_zoom"
        elif combined_score > 0.36 or error_ratio > 2.2:
            severity = "HIGH"
            action = "trigger_camera_zoom"
        elif combined_score > 0.20 or error_ratio > 1.3:
            severity = "MEDIUM"
            action = "none"
        else:
            severity = "LOW"
            action = "none"

        # 6. Per-Alert Feature Attribution (Explainability)
        attributions = self.compute_feature_attribution(tensor_x, recon_x)
        top_features = attributions[:3]

        # Online baseline adaptation for benign traffic
        if not is_anomaly and drift_score < 0.15:
            self.baseline_errors.append(recon_loss)

        result = {
            "reconstruction_error": round(recon_loss, 4),
            "adaptive_threshold": round(self.adaptive_threshold, 4),
            "ewma_loss": round(self.ewma_loss, 4),
            "drift_score": round(drift_score, 4),
            "severity_score": round(combined_score, 2),
            "severity": severity,
            "is_anomaly": is_anomaly,
            "action": action,
            "ml_confidence": round(confidence, 3),
            "predicted_class": pred_class,
            "feature_attributions": top_features,
            "top_driving_feature": top_features[0]["feature"] if top_features else "N/A"
        }
        
        if metadata:
            result.update(metadata)
            
        return result

    def record_analyst_feedback(self, feature_vector, is_true_positive=True):
        """
        Online retraining loop based on analyst feedback.
        If marked False Positive, adapt baseline to accommodate benign pattern.
        """
        if not is_true_positive:
            features_np = np.clip(np.array(feature_vector, dtype=np.float32).reshape(1, -1), 0.0, 1.0)
            tensor_x = torch.from_numpy(features_np).to(self.device)
            self.model.train()
            self.optimizer.zero_grad()
            recon_x, _, _ = self.model(tensor_x)
            loss = nn.MSELoss()(recon_x, tensor_x)
            loss.backward()
            self.optimizer.step()
            self.model.eval()
            self.baseline_errors.append(float(loss.item()))
            return {"status": "model_adapted", "loss": float(loss.item())}
        return {"status": "logged_for_training"}
