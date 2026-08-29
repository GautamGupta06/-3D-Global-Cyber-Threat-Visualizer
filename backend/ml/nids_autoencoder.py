import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from collections import deque
import time

class NIDSAutoencoder(nn.Module):
    """
    Deep PyTorch Autoencoder for Network Intrusion Detection.
    Trained on normal traffic distribution to detect anomalies via Reconstruction Error:
    E = ||x - x_hat||^2
    """
    def __init__(self, input_dim=10, latent_dim=4):
        super(NIDSAutoencoder, self).__init__()
        
        # Encoder Network
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.BatchNorm1d(16),
            nn.LeakyReLU(0.2),
            nn.Linear(16, 8),
            nn.BatchNorm1d(8),
            nn.LeakyReLU(0.2),
            nn.Linear(8, latent_dim),
            nn.LeakyReLU(0.2)
        )
        
        # Decoder Network
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 8),
            nn.BatchNorm1d(8),
            nn.LeakyReLU(0.2),
            nn.Linear(8, 16),
            nn.BatchNorm1d(16),
            nn.LeakyReLU(0.2),
            nn.Linear(16, input_dim),
            nn.Sigmoid()  # normalized feature space [0, 1]
        )

    def forward(self, x):
        latent = self.encoder(x)
        reconstructed = self.decoder(latent)
        return reconstructed, latent


class ConceptDriftDetector:
    """
    Concept Drift & Anomaly Detection Brain:
    1. Evaluates Autoencoder reconstruction error E = ||x - x_hat||^2
    2. Compares current sliding window distribution P_t(X) with baseline P_{t-1}(X)
    3. Calculates Drift Score & triggers adaptive weight updates
    """
    def __init__(self, input_dim=10, anomaly_threshold=0.35, window_size=50):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = NIDSAutoencoder(input_dim=input_dim).to(self.device)
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.005)
        self.criterion = nn.MSELoss(reduction='none')
        
        self.anomaly_threshold = anomaly_threshold
        self.window_size = window_size
        
        # Rolling windows to compare P_t(X) vs P_{t-1}(X)
        self.baseline_errors = deque(maxlen=window_size)
        self.current_window_errors = deque(maxlen=window_size)
        
        # Pretrain model on synthetic 'Normal' baseline traffic
        self._pretrain_baseline()

    def _pretrain_baseline(self, epochs=25):
        """Train Autoencoder on normal baseline network traffic distribution."""
        self.model.train()
        normal_samples = 400
        # Normal traffic: packet rate ~ [0.1, 0.4], small payload variances, standard protocols
        synthetic_normal = np.random.beta(a=2, b=5, size=(normal_samples, 10)).astype(np.float32)
        tensor_data = torch.from_numpy(synthetic_normal).to(self.device)
        
        for _ in range(epochs):
            self.optimizer.zero_grad()
            recon, _ = self.model(tensor_data)
            loss = nn.MSELoss()(recon, tensor_data)
            loss.backward()
            self.optimizer.step()
            
        self.model.eval()
        with torch.no_grad():
            recon, _ = self.model(tensor_data)
            errs = torch.mean((recon - tensor_data) ** 2, dim=1).cpu().numpy()
            for e in errs:
                self.baseline_errors.append(float(e))
        
        mean_base = np.mean(self.baseline_errors) if self.baseline_errors else 0.05
        # Dynamic baseline threshold: mean + 2.5 standard deviations
        self.anomaly_threshold = float(mean_base + 2.5 * np.std(self.baseline_errors) + 0.15)

    def process_features(self, feature_vector, metadata=None):
        """
        Process single network flow / aggregated window:
        feature_vector: list or np.ndarray of length 10
        returns: enriched threat prediction dict
        """
        self.model.eval()
        features_np = np.clip(np.array(feature_vector, dtype=np.float32).reshape(1, -1), 0.0, 1.0)
        tensor_x = torch.from_numpy(features_np).to(self.device)

        with torch.no_grad():
            recon_x, _ = self.model(tensor_x)
            # Reconstruction Error E = ||x - x_hat||^2
            recon_loss = float(torch.mean((tensor_x - recon_x) ** 2).item())

        self.current_window_errors.append(recon_loss)

        # Calculate Concept Drift Score: difference between current window and baseline distribution
        drift_score = 0.0
        baseline_mean = np.mean(self.baseline_errors) if self.baseline_errors else 0.02
        baseline_std = np.std(self.baseline_errors) + 1e-5
        
        if len(self.baseline_errors) > 5 and len(self.current_window_errors) > 3:
            current_mean = np.mean(self.current_window_errors)
            # Normalized distribution shift (Z-score deviation)
            deviation = max(0.0, (current_mean - baseline_mean) / baseline_std)
            drift_score = float(np.clip(deviation / 3.0, 0.0, 1.0))

        # Relative Anomaly Ratio: how much higher is this error compared to normal baseline
        error_ratio = recon_loss / max(baseline_mean, 1e-4)
        
        # Combined threat score: combines reconstruction anomaly & concept drift
        combined_score = float(np.clip((recon_loss * 3.5) + (drift_score * 0.4), 0.0, 1.0))
        is_anomaly = recon_loss > self.anomaly_threshold or error_ratio > 2.5 or combined_score > 0.45

        if combined_score > 0.60 or error_ratio > 4.0:
            severity = "CRITICAL"
            action = "trigger_camera_zoom"
        elif combined_score > 0.35 or error_ratio > 2.2:
            severity = "HIGH"
            action = "trigger_camera_zoom"
        elif combined_score > 0.20 or error_ratio > 1.4:
            severity = "MEDIUM"
            action = "none"
        else:
            severity = "LOW"
            action = "none"

        # Adaptive Learning: if traffic is genuinely normal, continuously adapt baseline
        if not is_anomaly and drift_score < 0.15:
            self.baseline_errors.append(recon_loss)

        result = {
            "reconstruction_error": round(recon_loss, 4),
            "drift_score": round(drift_score, 4),
            "severity_score": round(combined_score, 2),
            "severity": severity,
            "is_anomaly": is_anomaly,
            "action": action
        }
        
        if metadata:
            result.update(metadata)
            
        return result
