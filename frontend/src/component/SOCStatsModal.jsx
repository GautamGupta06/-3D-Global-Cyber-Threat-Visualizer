import { useEffect, useState } from 'react';

export default function SOCStatsModal({ isOpen, onClose, backendUrl }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeWindow, setTimeWindow] = useState('86400'); // 24 hours in seconds

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch(`${backendUrl}/api/threats/stats?timeWindowSeconds=${timeWindow}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load SOC stats:', err);
        setLoading(false);
      });
  }, [isOpen, timeWindow, backendUrl]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 5, 16, 0.82)',
      backdropFilter: 'blur(10px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'JetBrains Mono', 'Courier New', monospace"
    }}>
      <div style={{
        background: 'linear-gradient(165deg, rgba(2, 8, 26, 0.98) 0%, rgba(1, 4, 15, 0.99) 100%)',
        border: '1px solid rgba(0, 255, 204, 0.4)',
        borderRadius: '16px',
        width: '840px',
        maxWidth: '100%',
        maxHeight: '90vh',
        boxShadow: '0 0 50px rgba(0, 255, 204, 0.2), 0 25px 60px rgba(0,0,0,0.9)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeInUp 0.25s ease'
      }}>
        {/* ─── Modal Header ─── */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>📊</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00ffcc', letterSpacing: '0.06em' }}>
                SOC INTELLIGENCE & HISTORICAL ANALYTICS
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                Aggregated SQLite Persistence Layer Metrics
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Time window selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[
                { label: '1 Hour', val: '3600' },
                { label: '6 Hours', val: '21600' },
                { label: '24 Hours', val: '86400' },
                { label: '7 Days', val: '604800' }
              ].map(w => (
                <button
                  key={w.val}
                  onClick={() => setTimeWindow(w.val)}
                  style={{
                    fontFamily: 'inherit',
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: `1px solid ${timeWindow === w.val ? '#00ffcc' : 'rgba(255,255,255,0.12)'}`,
                    background: timeWindow === w.val ? 'rgba(0, 255, 204, 0.18)' : 'rgba(255,255,255,0.04)',
                    color: timeWindow === w.val ? '#00ffcc' : 'rgba(255,255,255,0.65)'
                  }}
                >
                  {w.label}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                borderRadius: '8px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ─── Modal Body ─── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#00ffcc' }}>
              ⚡ Querying Threat Telemetry Store...
            </div>
          )}

          {!loading && stats && (
            <>
              {/* High level KPI cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(0,255,204,0.3)',
                  borderRadius: '10px',
                  padding: '12px 16px'
                }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>TOTAL INCIDENTS</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#00ffcc', marginTop: '4px' }}>
                    {stats.total.toLocaleString()}
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,23,79,0.3)',
                  borderRadius: '10px',
                  padding: '12px 16px'
                }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>CRITICAL THREATS</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ff174f', marginTop: '4px' }}>
                    {stats.criticalCount.toLocaleString()}
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,107,53,0.3)',
                  borderRadius: '10px',
                  padding: '12px 16px'
                }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>HIGH SEVERITY</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ff6b35', marginTop: '4px' }}>
                    {(stats.severityDistribution?.high || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,209,102,0.3)',
                  borderRadius: '10px',
                  padding: '12px 16px'
                }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>CRIT RATIO</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ffd166', marginTop: '4px' }}>
                    {stats.total > 0 ? `${((stats.criticalCount / stats.total) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </div>
              </div>

              {/* Attack Type Breakdown */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#00ffcc', marginBottom: '12px' }}>
                  ATTACK VECTOR BREAKDOWN
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stats.attackTypeBreakdown.map((item, idx) => {
                    const pct = stats.total > 0 ? ((item.count / stats.total) * 100).toFixed(1) : 0;
                    return (
                      <div key={idx} style={{ fontSize: '11px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ color: '#e2e8f0' }}>{item.attack_type.replace(/_/g, ' ')}</span>
                          <span style={{ color: '#94a3b8' }}>{item.count} events ({pct}%)</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '6px',
                          background: 'rgba(255,255,255,0.08)',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: item.attack_type.includes('DDoS') ? '#ff174f' : (item.attack_type.includes('SQL') ? '#ff6b35' : '#00ffcc'),
                            borderRadius: '3px'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Source Origins & Target Hubs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '14px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ff6b6b', marginBottom: '10px' }}>
                    TOP ATTACK ORIGINS (HOTSPOTS)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                    {stats.topSourceCities.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                        <span>● {c.city}</span>
                        <span style={{ fontWeight: 'bold', color: '#ff6b6b' }}>{c.count} threats</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '14px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '10px' }}>
                    TOP TARGET CLOUD GATEWAYS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                    {stats.topDestinations.map((d, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                        <span>🛡️ {d.dest_name}</span>
                        <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{d.count} protected</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
