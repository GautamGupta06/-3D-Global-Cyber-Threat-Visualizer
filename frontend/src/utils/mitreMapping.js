/**
 * MITRE ATT&CK Framework Mapping Utility
 * Maps threat types and anomaly signatures to standardized MITRE Enterprise ATT&CK matrix techniques.
 */

export const MITRE_TECHNIQUES = {
  DDoS: {
    id: 'T1498',
    name: 'Network Denial of Service',
    subId: 'T1498.001',
    subName: 'Direct Network Flood',
    tactic: 'Impact',
    tacticId: 'TA0040',
    description: 'Adversary floods the network layer with volumetric traffic to degrade or terminate service availability.',
    detectionAdvice: 'Inspect spike in UDP/SYN/ICMP packet volume exceeding normal baseline thresholds.',
    color: '#ff174f',
    bg: 'rgba(255, 23, 79, 0.15)',
    border: 'rgba(255, 23, 79, 0.45)',
    url: 'https://attack.mitre.org/techniques/T1498/'
  },
  DDoS_Volume_Spike: {
    id: 'T1498',
    name: 'Network Denial of Service',
    subId: 'T1498.001',
    subName: 'Direct Network Flood',
    tactic: 'Impact',
    tacticId: 'TA0040',
    description: 'Sudden high-velocity volumetric stream overwhelming ingress interface bandwidth.',
    detectionAdvice: 'Mitigate via BGP Blackholing, upstream scrubbers, and rate-limiting at edge ingress.',
    color: '#ff174f',
    bg: 'rgba(255, 23, 79, 0.15)',
    border: 'rgba(255, 23, 79, 0.45)',
    url: 'https://attack.mitre.org/techniques/T1498/001/'
  },
  SQL_Injection: {
    id: 'T1190',
    name: 'Exploit Public-Facing Application',
    subId: 'T1190',
    subName: 'SQL Parameter Injection',
    tactic: 'Initial Access',
    tacticId: 'TA0001',
    description: 'Adversary leverages malicious SQL clauses to bypass authentication or extract sensitive backend DB contents.',
    detectionAdvice: 'Inspect WAF signatures, parameterized queries, and HTTP body payload entropy.',
    color: '#ff6b35',
    bg: 'rgba(255, 107, 53, 0.15)',
    border: 'rgba(255, 107, 53, 0.45)',
    url: 'https://attack.mitre.org/techniques/T1190/'
  },
  Malware_Drop: {
    id: 'T1105',
    name: 'Ingress Tool Transfer',
    subId: 'T1105',
    subName: 'Payload Delivery',
    tactic: 'Command and Control',
    tacticId: 'TA0011',
    description: 'Adversary transfers tools or payloads from an external system into the target internal environment.',
    detectionAdvice: 'Monitor outbound and inbound binary transfers, TLS inspection, and file entropy signatures.',
    color: '#c026d3',
    bg: 'rgba(192, 38, 211, 0.15)',
    border: 'rgba(192, 38, 211, 0.45)',
    url: 'https://attack.mitre.org/techniques/T1105/'
  },
  Port_Scan: {
    id: 'T1046',
    name: 'Network Service Discovery',
    subId: 'T1046',
    subName: 'Port & Service Enumeration',
    tactic: 'Discovery',
    tacticId: 'TA0007',
    description: 'Adversary attempts to get a listing of services running on hosts across open IP ports.',
    detectionAdvice: 'Correlate rapid sequential TCP SYN probes with no subsequent ACK completion across varied ports.',
    color: '#ffd166',
    bg: 'rgba(255, 209, 102, 0.15)',
    border: 'rgba(255, 209, 102, 0.45)',
    url: 'https://attack.mitre.org/techniques/T1046/'
  },
  Brute_Force: {
    id: 'T1110',
    name: 'Brute Force',
    subId: 'T1110.001',
    subName: 'Password Guessing',
    tactic: 'Credential Access',
    tacticId: 'TA0006',
    description: 'Adversary attempts systematic trial-and-error password authentication against exposed protocols (SSH, RDP, API).',
    detectionAdvice: 'Enforce MFA, progressive backoff delay, fail2ban rules, and rate limiting on auth endpoints.',
    color: '#fb923c',
    bg: 'rgba(251, 146, 60, 0.15)',
    border: 'rgba(251, 146, 60, 0.45)',
    url: 'https://attack.mitre.org/techniques/T1110/'
  },
  Adversarial_Drift: {
    id: 'T1027',
    name: 'Obfuscated Files or Information',
    subId: 'T1027',
    subName: 'Adversarial Evasion Shift',
    tactic: 'Defense Evasion',
    tacticId: 'TA0005',
    description: 'Adversary subtly morphs traffic distribution parameters to evade statistical NIDS anomaly detection baselines.',
    detectionAdvice: 'PyTorch sliding window concept drift engine flagged P_t(X) ≠ P_{t-1}(X) divergence spike.',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.45)',
    url: 'https://attack.mitre.org/techniques/T1027/'
  },
  Network_Pulse: {
    id: 'T1071',
    name: 'Application Layer Protocol',
    subId: 'T1071.001',
    subName: 'Web Traffic Beaconing',
    tactic: 'Command and Control',
    tacticId: 'TA0011',
    description: 'Periodic pulse signals establishing heartbeat and staging instructions with external C2 node.',
    detectionAdvice: 'Inspect low-jitter periodicity in outbound HTTPS requests to low-reputation ASN blocks.',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.45)',
    url: 'https://attack.mitre.org/techniques/T1071/'
  }
};

/**
 * Resolves MITRE ATT&CK metadata for an attack type string.
 */
export function getMitreDetails(attackType) {
  if (!attackType) {
    return {
      id: 'T1000',
      name: 'Unclassified Cyber Anomaly',
      subId: 'T1000',
      subName: 'Generic Anomaly',
      tactic: 'General Anomaly',
      tacticId: 'TA0000',
      description: 'Anomalous network telemetry flagged by deep autoencoder reconstruction error.',
      detectionAdvice: 'Perform deep packet inspection on payload.',
      color: '#00ffcc',
      bg: 'rgba(0, 255, 204, 0.15)',
      border: 'rgba(0, 255, 204, 0.45)',
      url: 'https://attack.mitre.org/'
    };
  }

  // Check direct or normalized key match
  const normalized = Object.keys(MITRE_TECHNIQUES).find(k => 
    attackType.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  return MITRE_TECHNIQUES[normalized] || MITRE_TECHNIQUES[attackType] || {
    id: 'T1000',
    name: attackType.replace(/_/g, ' '),
    subId: 'T1000',
    subName: attackType.replace(/_/g, ' '),
    tactic: 'Threat Activity',
    tacticId: 'TA0000',
    description: `Threat signature flagged as ${attackType}.`,
    detectionAdvice: 'Inspect flow statistics and ingress source telemetry.',
    color: '#00ffcc',
    bg: 'rgba(0, 255, 204, 0.15)',
    border: 'rgba(0, 255, 204, 0.45)',
    url: 'https://attack.mitre.org/'
  };
}

/**
 * Formats severity into human-readable label & theme.
 */
export function getSeverityInfo(severity, attackType) {
  const score = Number(severity) || 0;
  const isCritType = attackType === 'DDoS' || attackType === 'DDoS_Volume_Spike';
  
  if (score >= 0.65 || isCritType) {
    return { label: 'CRITICAL', score, color: '#ff174f', bg: 'rgba(255, 23, 79, 0.2)', border: '#ff174f' };
  }
  if (score >= 0.4) {
    return { label: 'HIGH', score, color: '#ff6b35', bg: 'rgba(255, 107, 53, 0.2)', border: '#ff6b35' };
  }
  if (score >= 0.2) {
    return { label: 'MEDIUM', score, color: '#ffd166', bg: 'rgba(255, 209, 102, 0.2)', border: '#ffd166' };
  }
  return { label: 'LOW', score, color: '#00ffcc', bg: 'rgba(0, 255, 204, 0.2)', border: '#00ffcc' };
}
