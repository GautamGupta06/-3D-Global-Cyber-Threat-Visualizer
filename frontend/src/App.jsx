import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Preload } from '@react-three/drei';
import { Suspense } from 'react';
import CyberGlobe from './component/CyberGlobe';
import SeamlessMapView from './component/SeamlessMapView';

const BACKEND_URL = (typeof window !== 'undefined' && window.location.hostname)
  ? `http://${window.location.hostname}:4000`
  : 'http://localhost:4000';

const previewAttacks = [
  { id: 'preview-1', source_ip: '185.42.18.7', source_lat: 28.61, source_long: 77.21, attack_type: 'DDoS', severity: 0.5 },
  { id: 'preview-2', source_ip: '45.12.88.4', source_lat: 51.51, source_long: -0.12, attack_type: 'Port_Scan', severity: 0.22 },
  { id: 'preview-3', source_ip: '103.8.14.2', source_lat: 35.68, source_long: 139.69, attack_type: 'SQL_Injection', severity: 0.35 },
  { id: 'preview-4', source_ip: '201.17.66.9', source_lat: -23.55, source_long: -46.63, attack_type: 'Malware_Drop', severity: 0.31 },
  { id: 'preview-5', source_ip: '41.76.22.8', source_lat: -1.29, source_long: 36.82, attack_type: 'Brute_Force', severity: 0.18 },
];

const severityColor = (type) => {
  switch (type) {
    case 'DDoS': return '#ff174f';
    case 'SQL_Injection': return '#ff6b35';
    case 'Malware_Drop': return '#c026d3';
    case 'Port_Scan': return '#ffd166';
    case 'Brute_Force': return '#fb923c';
    default: return '#00ffcc';
  }
};

function App() {
  const [attacks, setAttacks] = useState(previewAttacks);
  const [zoomDist, setZoomDist] = useState(6);
  const [mapZoomLevel, setMapZoomLevel] = useState(7);
  const [autoRotate, setAutoRotate] = useState(false);
  const [mapMode, setMapMode] = useState('Satellite'); // 'Satellite' | 'Street'
  const [mapViewState, setMapViewState] = useState({
    active: false,
    center: [20, 0],
    zoom: 6,
  });
  const [focusedThreat, setFocusedThreat] = useState(null);
  const [socketStatus, setSocketStatus] = useState({
    connected: false,
    kafka: false,
    message: 'Connecting to backend...'
  });
  const socketRef = useRef(null);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    const socket = io(BACKEND_URL, {
      reconnectionAttempts: 20,
      reconnectionDelay: 1500,
      timeout: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Threat Backend:', socket.id);
      setSocketStatus(prev => ({ ...prev, connected: true, message: 'Backend connected' }));
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from Threat Backend:', reason);
      setSocketStatus(prev => ({ ...prev, connected: false, message: 'Backend offline (reconnecting...)' }));
    });

    socket.on('connect_error', () => {
      setSocketStatus(prev => ({ ...prev, connected: false, message: 'Connection error' }));
    });

    socket.on('stream_status', (status) => {
      setSocketStatus(prev => ({ ...prev, kafka: status.kafka, message: status.message }));
    });

    socket.on('init_threats', (history) => {
      if (Array.isArray(history) && history.length > 0) {
        setAttacks(history);
      }
    });

    socket.on('new_threat', (data) => {
      setAttacks(prev => {
        const live = prev.filter(a => !a.id?.startsWith('preview-'));
        const next = [...live, { ...data, id: data.id ?? `${data.source_ip}-${data.timestamp || Date.now()}` }];
        if (next.length > 100) next.shift();
        return next;
      });

      // Only auto-focus camera if it is an explicit manual trigger
      if (data.isManualTrigger) {
        setFocusedThreat(data);
        setTimeout(() => setFocusedThreat(null), 3000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const triggerTestThreat = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('trigger_test_threat');
    }
  }, []);

  const handleZoomChange = useCallback((dist) => {
    setZoomDist(dist);
  }, []);

  const handleEnterMapView = useCallback(({ lat, lng }) => {
    setMapViewState({
      active: true,
      center: [Number(lat), Number(lng)],
      zoom: 7,
    });
    setMapZoomLevel(7);
  }, []);

  const handleZoomOutToGlobe = useCallback(() => {
    setFocusedThreat(null);
    setMapViewState({ active: false, center: [20, 0], zoom: 6 });
    setZoomDist(5.5);
  }, []);

  const zoomLabel = mapViewState.active
    ? (mapZoomLevel > 14 ? 'Street / Road Level' : mapZoomLevel > 10 ? 'City Level' : 'Regional Map')
    : (zoomDist > 7 ? 'Deep Space Orbit' : zoomDist > 5 ? 'Orbit' : zoomDist > 3.8 ? 'Continental' : 'Regional');

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000510', color: 'white', position: 'relative', overflow: 'hidden' }}>

      {/* ─── 3D Earth Globe (Space / Orbit / Continental) ─── */}
      {!mapViewState.active && (
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45, near: 0.05, far: 1000 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          style={{ background: '#000510' }}
        >
          <Stars radius={300} depth={80} count={8000} factor={5} saturation={0} fade speed={0.5} />

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={2.02}
            maxDistance={25}
            rotateSpeed={0.9}
            zoomSpeed={1.4}
            minPolarAngle={0.05}
            maxPolarAngle={Math.PI - 0.05}
          />

          <Suspense fallback={null}>
            <CyberGlobe
              attacks={attacks}
              onZoomChange={handleZoomChange}
              onEnterMapView={handleEnterMapView}
              autoRotate={autoRotate}
              mapMode={mapMode}
            />
            <Preload all />
          </Suspense>
        </Canvas>
      )}

      {/* ─── High-Resolution Street/Road Map (Seamless zoom to roads & buildings) ─── */}
      {mapViewState.active && (
        <SeamlessMapView
          center={mapViewState.center}
          zoom={mapViewState.zoom}
          mapMode={mapMode}
          attacks={attacks}
          onZoomOut={handleZoomOutToGlobe}
          onZoomChange={setMapZoomLevel}
        />
      )}

      {/* ─── Top-left: Dashboard Panel ─── */}
      <div style={{
        position: 'absolute', top: 20, left: 20, zIndex: 10,
        fontFamily: "'Courier New', monospace",
        background: 'linear-gradient(135deg, rgba(2,6,23,0.92) 0%, rgba(0,20,40,0.92) 100%)',
        border: `1px solid ${socketStatus.connected ? 'rgba(0,255,204,0.4)' : 'rgba(255,100,100,0.4)'}`,
        borderRadius: '12px',
        padding: '16px 20px',
        backdropFilter: 'blur(12px)',
        boxShadow: socketStatus.connected ? '0 0 30px rgba(0,255,204,0.15)' : '0 0 30px rgba(255,50,50,0.15)',
        minWidth: '260px',
        maxWidth: '320px',
        pointerEvents: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '9px', height: '9px', borderRadius: '50%',
              background: socketStatus.connected ? (socketStatus.kafka ? '#00ffcc' : '#ffd166') : '#ff4444',
              boxShadow: `0 0 10px ${socketStatus.connected ? (socketStatus.kafka ? '#00ffcc' : '#ffd166') : '#ff4444'}`,
              animation: 'pulse 1.5s infinite',
            }} />
            <h2 style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#00ffcc', letterSpacing: '0.08em' }}>
              CYBER THREAT SOC
            </h2>
          </div>
          <span style={{
            fontSize: '9px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: socketStatus.connected ? 'rgba(0,255,204,0.12)' : 'rgba(255,68,68,0.12)',
            color: socketStatus.connected ? '#00ffcc' : '#ff6b6b',
            border: `1px solid ${socketStatus.connected ? 'rgba(0,255,204,0.3)' : 'rgba(255,68,68,0.3)'}`,
          }}>
            {socketStatus.connected ? (socketStatus.kafka ? 'KAFKA LIVE' : 'WS CONNECTED') : 'WS OFFLINE'}
          </span>
        </div>

        <div style={{ margin: '4px 0 10px', color: 'rgba(255,255,255,0.65)', fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span>⚡ {attacks.length} EVENTS BUFFERED</span>
          <span style={{ color: socketStatus.kafka ? '#00ffcc' : '#ffd166' }}>
            {socketStatus.kafka ? '● Stream Live' : '○ Standby'}
          </span>
        </div>

        {/* Quick controls: Trigger Test Attack & Sphere Rotation Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
          <button
            onClick={triggerTestThreat}
            disabled={!socketStatus.connected}
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: '10px',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: socketStatus.connected ? 'pointer' : 'not-allowed',
              background: socketStatus.connected ? 'rgba(0,255,204,0.15)' : 'rgba(255,255,255,0.05)',
              color: socketStatus.connected ? '#00ffcc' : 'rgba(255,255,255,0.3)',
              border: `1px solid ${socketStatus.connected ? 'rgba(0,255,204,0.4)' : 'rgba(255,255,255,0.1)'}`,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (socketStatus.connected) e.currentTarget.style.background = 'rgba(0,255,204,0.3)'; }}
            onMouseLeave={e => { if (socketStatus.connected) e.currentTarget.style.background = 'rgba(0,255,204,0.15)'; }}
          >
            ⚡ TRIGGER TEST ATTACK
          </button>

          <button
            onClick={() => setAutoRotate(r => !r)}
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: '10px',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              background: autoRotate ? 'rgba(0,255,204,0.22)' : 'rgba(255,255,255,0.08)',
              color: autoRotate ? '#00ffcc' : '#ffffff',
              border: `1px solid ${autoRotate ? 'rgba(0,255,204,0.6)' : 'rgba(255,255,255,0.2)'}`,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = autoRotate ? 'rgba(0,255,204,0.35)' : 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = autoRotate ? 'rgba(0,255,204,0.22)' : 'rgba(255,255,255,0.08)'; }}
          >
            <span>{autoRotate ? '🔄' : '🔒'}</span>
            <span>{autoRotate ? 'SPHERE ROTATION: ON' : 'SPHERE ROTATION: LOCKED (OFF)'}</span>
          </button>
        </div>

        <div style={{ fontSize: '11px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
          {attacks.slice(-8).reverse().map((a, i) => (
            <div
              key={a.id || i}
              onClick={() => {
                setFocusedThreat(a);
                setTimeout(() => setFocusedThreat(null), 3500);
              }}
              style={{
                marginBottom: '6px',
                padding: '7px 9px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.05)',
                borderLeft: `3px solid ${severityColor(a.attack_type)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,204,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              title="Click to focus camera on this attack location"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: severityColor(a.attack_type), fontWeight: 'bold', fontSize: '10px' }}>
                  [{a.attack_type}]
                </span>
                <span style={{ color: a.drift_score > 0.4 ? '#ff174f' : 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 'bold' }}>
                  {a.drift_score !== undefined ? `drift ${(Number(a.drift_score) * 100).toFixed(0)}%` : (a.severity ? `sev ${(a.severity * 100).toFixed(0)}%` : '')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: '9px' }}>
                <span>{a.source_ip}</span>
                <span>{a.city ? a.city.split(',')[0] : `${Number(a.source_lat).toFixed(1)}°, ${Number(a.source_long).toFixed(1)}°`}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Top-right: Zoom Indicator ─── */}
      <div style={{
        position: 'absolute', top: 20, right: 24, zIndex: 10,
        fontFamily: 'monospace',
        background: 'rgba(2,6,23,0.88)',
        border: '1px solid rgba(0,255,204,0.3)',
        borderRadius: '10px',
        padding: '12px 18px',
        backdropFilter: 'blur(10px)',
        fontSize: '11px',
        color: '#00ffcc',
        letterSpacing: '0.08em',
        minWidth: '150px',
        boxShadow: '0 0 20px rgba(0,0,0,0.6)',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}>
        <div style={{ opacity: 0.6, fontSize: '9px', marginBottom: '4px' }}>ZOOM LEVEL</div>
        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>🔭 {zoomLabel}</div>
        <div style={{ opacity: 0.45, fontSize: '9px', marginTop: '6px' }}>
          Scroll to zoom • Drag to orbit
        </div>
      </div>

      {/* ─── Bottom-left: Back to Globe Reset Button ─── */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: 24,
        zIndex: 50,
        pointerEvents: 'auto',
      }}>
        <button
          onClick={handleZoomOutToGlobe}
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '.06em',
            padding: '9px 18px',
            borderRadius: 8,
            cursor: 'pointer',
            border: '1px solid rgba(0, 255, 204, 0.5)',
            background: 'rgba(2, 6, 23, 0.92)',
            color: '#00ffcc',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 20px rgba(0, 255, 204, 0.25)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0, 255, 204, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 28px rgba(0, 255, 204, 0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(2, 6, 23, 0.92)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 204, 0.25)';
          }}
        >
          <span>🌐</span>
          <span>BACK TO GLOBE VIEW</span>
        </button>
      </div>

      {/* ─── Bottom-right: 2 Layer Buttons (Satellite, Street) ─── */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 50,
        display: 'flex',
        gap: 8,
        background: 'rgba(2, 6, 23, 0.92)',
        border: '1px solid rgba(0, 255, 204, 0.35)',
        borderRadius: 10,
        padding: '6px 8px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 24px rgba(0, 0, 0, 0.6)',
        pointerEvents: 'auto',
      }}>
        {[
          { id: 'Satellite', label: '🛰️ Satellite' },
          { id: 'Street',    label: '🗺️ Street' }
        ].map(({ id, label }) => {
          const isActive = mapMode === id;
          return (
            <button
              key={id}
              onClick={() => setMapMode(id)}
              style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: 'bold',
                letterSpacing: '.06em',
                padding: '8px 16px',
                borderRadius: 7,
                cursor: 'pointer',
                border: `1px solid ${isActive ? '#00ffcc' : 'rgba(255,255,255,0.15)'}`,
                background: isActive ? 'rgba(0,255,204,0.25)' : 'rgba(255,255,255,0.06)',
                color: isActive ? '#00ffcc' : 'rgba(255,255,255,0.7)',
                boxShadow: isActive ? '0 0 14px rgba(0,255,204,0.4)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ─── Scroll hint (shown at deep zoom) ─── */}
      {zoomDist > 5.2 && (
        <div style={{
          position: 'absolute', bottom: 28, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          fontFamily: 'monospace',
          color: 'rgba(0,255,204,0.85)',
          background: 'rgba(2,6,23,0.85)',
          border: '1px solid rgba(0,255,204,0.3)',
          borderRadius: '20px',
          padding: '8px 18px',
          fontSize: '11px',
          letterSpacing: '0.08em',
          textAlign: 'center',
          pointerEvents: 'none',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeInUp 1s ease',
          whiteSpace: 'nowrap',
        }}>
          <span>🖱️</span>
          <span>Scroll to zoom in &middot; Drag to orbit</span>
        </div>
      )}

      {/* ─── Global CSS Animations ─── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #00ffcc; }
          50% { opacity: 0.4; box-shadow: 0 0 2px #00ffcc; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;