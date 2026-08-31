import { useState } from 'react';

const SEVERITY_LEVELS = [
  { id: 'ALL', label: 'ALL', color: '#00ffcc' },
  { id: 'CRITICAL', label: 'CRIT', color: '#ff174f' },
  { id: 'HIGH', label: 'HIGH', color: '#ff6b35' },
  { id: 'MEDIUM', label: 'MED', color: '#ffd166' },
  { id: 'LOW', label: 'LOW', color: '#38bdf8' },
];

const ATTACK_TYPES = [
  { id: 'ALL', label: 'All Threats' },
  { id: 'DDoS', label: 'DDoS / Flood' },
  { id: 'SQL_Injection', label: 'SQL Injection' },
  { id: 'Malware_Drop', label: 'Malware Drop' },
  { id: 'Port_Scan', label: 'Port Scan' },
  { id: 'Brute_Force', label: 'Brute Force' },
  { id: 'Adversarial_Drift', label: 'Adversarial Drift' },
];

export default function ThreatFilterBar({
  selectedSeverity,
  onSelectSeverity,
  selectedType,
  onSelectType,
  searchQuery,
  onSearchChange,
  isPaused,
  onTogglePause,
  soundEnabled,
  onToggleSound,
  totalEvents = 0,
  filteredEvents = 0,
  criticalCount = 0,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 20,
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      background: 'linear-gradient(135deg, rgba(2, 6, 23, 0.92) 0%, rgba(1, 15, 30, 0.94) 100%)',
      border: '1px solid rgba(0, 255, 204, 0.35)',
      borderRadius: '12px',
      padding: '8px 14px',
      backdropFilter: 'blur(14px)',
      boxShadow: '0 0 25px rgba(0, 255, 204, 0.12), 0 10px 30px rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '92vw',
      flexWrap: 'wrap',
      pointerEvents: 'auto',
    }}>
      {/* ─── Search Bar ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: 'rgba(0, 255, 204, 0.8)' }}>🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter IP / City / MITRE..."
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(0, 255, 204, 0.25)',
            borderRadius: '6px',
            padding: '4px 8px',
            color: '#ffffff',
            fontFamily: 'inherit',
            fontSize: '11px',
            width: '160px',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => e.target.style.borderColor = '#00ffcc'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(0, 255, 204, 0.25)'}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              fontSize: '11px',
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.12)' }} />

      {/* ─── Severity Filter Pills ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.45)', marginRight: '2px' }}>SEV:</span>
        {SEVERITY_LEVELS.map((sev) => {
          const isActive = selectedSeverity === sev.id;
          return (
            <button
              key={sev.id}
              onClick={() => onSelectSeverity(sev.id)}
              style={{
                fontFamily: 'inherit',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '3px 7px',
                borderRadius: '5px',
                cursor: 'pointer',
                border: `1px solid ${isActive ? sev.color : 'rgba(255, 255, 255, 0.12)'}`,
                background: isActive ? `${sev.color}26` : 'rgba(255, 255, 255, 0.04)',
                color: isActive ? sev.color : 'rgba(255, 255, 255, 0.65)',
                boxShadow: isActive ? `0 0 10px ${sev.color}40` : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {sev.label}
            </button>
          );
        })}
      </div>

      <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.12)' }} />

      {/* ─── Attack Type Selector ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <select
          value={selectedType}
          onChange={(e) => onSelectType(e.target.value)}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(0, 255, 204, 0.25)',
            borderRadius: '6px',
            padding: '4px 8px',
            color: '#00ffcc',
            fontFamily: 'inherit',
            fontSize: '11px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {ATTACK_TYPES.map((t) => (
            <option key={t.id} value={t.id} style={{ background: '#020617', color: '#ffffff' }}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.12)' }} />

      {/* ─── Quick Controls: Stream Pause & Audio Alert Toggle ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={onTogglePause}
          style={{
            fontFamily: 'inherit',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '6px',
            cursor: 'pointer',
            border: `1px solid ${isPaused ? '#ffd166' : 'rgba(0, 255, 204, 0.3)'}`,
            background: isPaused ? 'rgba(255, 209, 102, 0.15)' : 'rgba(0, 255, 204, 0.08)',
            color: isPaused ? '#ffd166' : '#00ffcc',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          }}
          title={isPaused ? 'Resume Live Ingestion Stream' : 'Freeze Stream for Inspection'}
        >
          <span>{isPaused ? '▶ RESUME' : '⏸ FREEZE'}</span>
        </button>

        <button
          onClick={onToggleSound}
          style={{
            fontFamily: 'inherit',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '6px',
            cursor: 'pointer',
            border: `1px solid ${soundEnabled ? 'rgba(0, 255, 204, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
            background: soundEnabled ? 'rgba(0, 255, 204, 0.15)' : 'rgba(255, 255, 255, 0.04)',
            color: soundEnabled ? '#00ffcc' : 'rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          }}
          title={soundEnabled ? 'Mute Critical Audio Chime' : 'Enable Critical Alert Chimes'}
        >
          <span>{soundEnabled ? '🔊 AUDIO ON' : '🔇 MUTED'}</span>
        </button>
      </div>

      {/* ─── Match Counter ─── */}
      <div style={{
        fontSize: '10px',
        color: 'rgba(255, 255, 255, 0.65)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span>Showing <strong style={{ color: '#00ffcc' }}>{filteredEvents}</strong>/{totalEvents}</span>
        {criticalCount > 0 && (
          <span style={{
            background: 'rgba(255, 23, 79, 0.2)',
            border: '1px solid #ff174f',
            color: '#ff174f',
            borderRadius: '4px',
            padding: '1px 5px',
            fontWeight: 'bold',
            fontSize: '9px',
          }}>
            {criticalCount} CRIT
          </span>
        )}
      </div>
    </div>
  );
}
