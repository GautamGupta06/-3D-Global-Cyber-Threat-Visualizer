import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Preload } from '@react-three/drei';
import { Suspense } from 'react';
import CyberGlobe from './component/CyberGlobe';
import SeamlessMapView from './component/SeamlessMapView';
import ThreatDetailDrawer from './component/ThreatDetailDrawer';
import ThreatFilterBar from './component/ThreatFilterBar';
import PlaybackControlBar from './component/PlaybackControlBar';
import SOCStatsModal from './component/SOCStatsModal';
import ProjectGuideModal from './component/ProjectGuideModal';
import { getMitreDetails, getSeverityInfo } from './utils/mitreMapping';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (
  (typeof window !== 'undefined' && window.location.hostname && (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'))
    ? 'https://3d-global-cyber-threat-visualizer.onrender.com'
    : 'http://localhost:4000'
);

const previewAttacks = [
  { id: 'preview-1', source_ip: '185.42.18.7', source_lat: 28.61, source_long: 77.21, attack_type: 'DDoS', severity: 0.85, drift_score: 0.62, city: 'New Delhi, India' },
  { id: 'preview-2', source_ip: '45.12.88.4', source_lat: 51.51, source_long: -0.12, attack_type: 'Port_Scan', severity: 0.22, drift_score: 0.15, city: 'London, UK' },
  { id: 'preview-3', source_ip: '103.8.14.2', source_lat: 35.68, source_long: 139.69, attack_type: 'SQL_Injection', severity: 0.55, drift_score: 0.38, city: 'Tokyo, Japan' },
  { id: 'preview-4', source_ip: '201.17.66.9', source_lat: -23.55, source_long: -46.63, attack_type: 'Malware_Drop', severity: 0.72, drift_score: 0.51, city: 'Sao Paulo, Brazil' },
  { id: 'preview-5', source_ip: '41.76.22.8', source_lat: -1.29, source_long: 36.82, attack_type: 'Brute_Force', severity: 0.45, drift_score: 0.28, city: 'Nairobi, Kenya' },
];

// Web Audio API Chime synthesizer (Zero external dependencies)
function playThreatAlertChime(isCritical = true) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isCritical ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isCritical ? 880 : 440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isCritical ? 330 : 220, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Ignore audio context restrictions
  }
}

function App() {
  // Live State
  const [attacks, setAttacks] = useState(previewAttacks);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [blockedIps, setBlockedIps] = useState(new Set());
  const [toastMessage, setToastMessage] = useState(null);
  const [statsOpen, setStatsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  // Global Keyboard Shortcuts (Press ? or H to toggle System Guide)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT')) {
        return;
      }
      if (e.key === '?' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setGuideOpen(prev => !prev);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setSoundEnabled(prev => {
          const next = !prev;
          if (next) playThreatAlertChime(false);
          return next;
        });
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setAutoRotate(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Playback & Historical State
  const [isPlaybackMode, setIsPlaybackMode] = useState(false);
  const [playbackEvents, setPlaybackEvents] = useState([]);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playbackWindow, setPlaybackWindow] = useState('1h');
  const [playbackLoading, setPlaybackLoading] = useState(false);

  // Filter States
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Globe & Map States
  const [zoomDist, setZoomDist] = useState(6);
  const [mapZoomLevel, setMapZoomLevel] = useState(7);
  const [autoRotate, setAutoRotate] = useState(false);
  const [mapMode, setMapMode] = useState('Satellite'); // 'Satellite' | 'Street'
  const [mapViewState, setMapViewState] = useState({
    active: false,
    center: [20, 0],
    zoom: 6,
  });

  const [socketStatus, setSocketStatus] = useState({
    connected: false,
    kafka: false,
    message: 'Connecting to backend...'
  });
  const socketRef = useRef(null);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Fetch playback events when window changes or playback mode enters
  const fetchPlaybackEvents = useCallback((windowRange) => {
    setPlaybackLoading(true);
    let seconds = 3600;
    if (windowRange === '15m') seconds = 900;
    if (windowRange === '6h') seconds = 21600;
    if (windowRange === '24h') seconds = 86400;

    const fromTs = Math.floor(Date.now() / 1000) - seconds;
    fetch(`${BACKEND_URL}/api/threats/playback?from=${fromTs}&limit=300`)
      .then(res => res.json())
      .then(data => {
        if (data.events && data.events.length > 0) {
          setPlaybackEvents(data.events);
          setPlaybackIndex(data.events.length - 1);
        } else {
          setPlaybackEvents(attacks);
          setPlaybackIndex(Math.max(0, attacks.length - 1));
        }
        setPlaybackLoading(false);
      })
      .catch(err => {
        console.error('Error loading playback data:', err);
        setPlaybackEvents(attacks);
        setPlaybackIndex(Math.max(0, attacks.length - 1));
        setPlaybackLoading(false);
      });
  }, [attacks]);

  const handleTogglePlaybackMode = useCallback(() => {
    setIsPlaybackMode(prev => {
      const next = !prev;
      if (next) {
        setIsPlaying(false);
        fetchPlaybackEvents(playbackWindow);
        showToast('⏪ Historical Playback Active — Scrub timeline to replay attacks');
      } else {
        setIsPlaying(false);
        showToast('🔴 Switched to Live Threat Stream');
      }
      return next;
    });
  }, [fetchPlaybackEvents, playbackWindow, showToast]);

  const handleSelectPlaybackWindow = useCallback((w) => {
    setPlaybackWindow(w);
    fetchPlaybackEvents(w);
  }, [fetchPlaybackEvents]);

  // Historical playback loop timer
  useEffect(() => {
    if (!isPlaybackMode || !isPlaying) return;

    const interval = setInterval(() => {
      setPlaybackIndex(prev => {
        if (prev >= playbackEvents.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, Math.max(200, 1000 / playbackSpeed));

    return () => clearInterval(interval);
  }, [isPlaybackMode, isPlaying, playbackSpeed, playbackEvents.length]);

  // Live Socket connection
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
      if (isPausedRef.current) return;

      const threatObj = {
        ...data,
        id: data.id ?? `${data.source_ip}-${data.timestamp || Date.now()}`
      };

      setAttacks(prev => {
        const live = prev.filter(a => !a.id?.startsWith('preview-'));
        const next = [...live, threatObj];
        if (next.length > 120) next.shift();
        return next;
      });

      // Play alert chime if critical and sound enabled
      const isCritical = (Number(threatObj.severity) > 0.6) || threatObj.attack_type?.includes('DDoS');
      if (soundEnabledRef.current && isCritical) {
        playThreatAlertChime(true);
      }

      // Alert notification if manual trigger
      if (data.isManualTrigger) {
        showToast(`⚡ High-Priority Alert: ${threatObj.attack_type} from ${threatObj.source_ip}`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [showToast]);

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
    setSelectedThreat(null);
    setMapViewState({ active: false, center: [20, 0], zoom: 6 });
    setZoomDist(5.5);
  }, []);

  const handleSelectThreat = useCallback((threat) => {
    setSelectedThreat(prev => (prev?.id === threat.id ? null : threat));
  }, []);

  const handleFlyToLocation = useCallback((threat) => {
    if (threat.source_lat && threat.source_long) {
      handleEnterMapView({ lat: threat.source_lat, lng: threat.source_long });
      showToast(`🎯 Centering Map on ${threat.city || `${threat.source_lat}°, ${threat.source_long}°`}`);
    }
  }, [handleEnterMapView, showToast]);

  const handleBlockIp = useCallback((ip) => {
    setBlockedIps(prev => {
      const next = new Set(prev);
      if (next.has(ip)) {
        next.delete(ip);
        showToast(`🔓 Unblocked IP: ${ip}`);
      } else {
        next.add(ip);
        showToast(`🛡️ Added Firewall Rule: NULL_ROUTE DROP on ${ip}`);
      }
      return next;
    });
  }, [showToast]);

  // Base list depending on live vs playback mode
  const currentEventSource = useMemo(() => {
    if (isPlaybackMode && playbackEvents.length > 0) {
      // Return historical events up to the current scrubbed index
      const maxSlice = Math.max(1, playbackIndex + 1);
      return playbackEvents.slice(Math.max(0, maxSlice - 20), maxSlice);
    }
    return attacks;
  }, [isPlaybackMode, playbackEvents, playbackIndex, attacks]);

  // Filtered threats calculation
  const filteredAttacks = useMemo(() => {
    return currentEventSource.filter(a => {
      // Severity Filter
      if (selectedSeverity !== 'ALL') {
        const sev = getSeverityInfo(a.severity, a.attack_type);
        if (sev.label !== selectedSeverity) return false;
      }

      // Attack Type Filter
      if (selectedType !== 'ALL') {
        if (selectedType === 'DDoS' && !a.attack_type?.includes('DDoS')) return false;
        if (selectedType !== 'DDoS' && a.attack_type !== selectedType) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mitre = getMitreDetails(a.attack_type);
        const matchIp = a.source_ip?.toLowerCase().includes(q);
        const matchCity = a.city?.toLowerCase().includes(q);
        const matchType = a.attack_type?.toLowerCase().includes(q);
        const matchMitre = mitre.id.toLowerCase().includes(q) || mitre.name.toLowerCase().includes(q);
        if (!matchIp && !matchCity && !matchType && !matchMitre) return false;
      }

      return true;
    });
  }, [currentEventSource, selectedSeverity, selectedType, searchQuery]);

  const criticalCount = useMemo(() => {
    return currentEventSource.filter(a => Number(a.severity) >= 0.65 || a.attack_type?.includes('DDoS')).length;
  }, [currentEventSource]);

  const zoomLabel = mapViewState.active
    ? (mapZoomLevel > 14 ? 'Street / Road Level' : mapZoomLevel > 10 ? 'City Level' : 'Regional Map')
    : (zoomDist > 7 ? 'Deep Space Orbit' : zoomDist > 5 ? 'Orbit' : zoomDist > 3.8 ? 'Continental' : 'Regional');

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000510', color: 'white', position: 'relative', overflow: 'hidden' }}>

      {/* ─── Top Filter Bar ─── */}
      <ThreatFilterBar
        selectedSeverity={selectedSeverity}
        onSelectSeverity={setSelectedSeverity}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(p => !p)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          setSoundEnabled(s => {
            const next = !s;
            if (next) playThreatAlertChime(false);
            return next;
          });
        }}
        totalEvents={currentEventSource.length}
        filteredEvents={filteredAttacks.length}
        criticalCount={criticalCount}
      />

      {/* ─── Top-Right: Complete System Guide & Architecture Manual Button ─── */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        pointerEvents: 'auto',
      }}>
        <button
          onClick={() => setGuideOpen(true)}
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '0.06em',
            padding: '9px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.18) 0%, rgba(56, 189, 248, 0.22) 100%)',
            border: '1px solid #00ffcc',
            color: '#00ffcc',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 0 25px rgba(0, 255, 204, 0.25), 0 4px 18px rgba(0,0,0,0.6)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 0 35px rgba(0, 255, 204, 0.6), 0 8px 25px rgba(0,0,0,0.7)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 204, 0.35) 0%, rgba(56, 189, 248, 0.35) 100%)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 255, 204, 0.25), 0 4px 18px rgba(0,0,0,0.6)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 204, 0.18) 0%, rgba(56, 189, 248, 0.22) 100%)';
          }}
          title="Open Complete Project Guide, Button Directory & Architecture Documentation (Shortcut: ? or H)"
        >
          <span style={{ fontSize: '14px', filter: 'drop-shadow(0 0 6px #00ffcc)' }}>📘</span>
          <span>SYSTEM GUIDE</span>
          <span style={{
            fontSize: '9px',
            background: 'rgba(0, 255, 204, 0.2)',
            border: '1px solid rgba(0, 255, 204, 0.5)',
            padding: '1px 5px',
            borderRadius: '4px',
            color: '#ffffff',
            fontWeight: 'bold'
          }}>
            ?
          </span>
        </button>
      </div>

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
              attacks={filteredAttacks}
              onZoomChange={handleZoomChange}
              onEnterMapView={handleEnterMapView}
              autoRotate={autoRotate}
              mapMode={mapMode}
              selectedThreat={selectedThreat}
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
          attacks={filteredAttacks}
          onZoomOut={handleZoomOutToGlobe}
          onZoomChange={setMapZoomLevel}
        />
      )}

      {/* ─── Top-left: Dashboard HUD Feed Panel ─── */}
      <div style={{
        position: 'absolute', top: 20, left: 20, zIndex: 10,
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        background: 'linear-gradient(135deg, rgba(2,6,23,0.94) 0%, rgba(0,18,36,0.94) 100%)',
        border: `1px solid ${isPlaybackMode ? '#ffd166' : (socketStatus.connected ? 'rgba(0,255,204,0.4)' : 'rgba(255,100,100,0.4)')}`,
        borderRadius: '12px',
        padding: '16px 18px',
        backdropFilter: 'blur(14px)',
        boxShadow: isPlaybackMode ? '0 0 30px rgba(255,209,102,0.2)' : (socketStatus.connected ? '0 0 30px rgba(0,255,204,0.15)' : '0 0 30px rgba(255,50,50,0.15)'),
        minWidth: '280px',
        maxWidth: '340px',
        pointerEvents: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '9px', height: '9px', borderRadius: '50%',
              background: isPlaybackMode ? '#ffd166' : (socketStatus.connected ? (socketStatus.kafka ? '#00ffcc' : '#ffd166') : '#ff4444'),
              boxShadow: `0 0 10px ${isPlaybackMode ? '#ffd166' : (socketStatus.connected ? '#00ffcc' : '#ff4444')}`,
              animation: 'pulse 1.5s infinite',
            }} />
            <h2 style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: isPlaybackMode ? '#ffd166' : '#00ffcc', letterSpacing: '0.08em' }}>
              CYBER THREAT SOC
            </h2>
          </div>
          <span style={{
            fontSize: '9px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: isPlaybackMode ? 'rgba(255,209,102,0.15)' : (socketStatus.connected ? 'rgba(0,255,204,0.12)' : 'rgba(255,68,68,0.12)'),
            color: isPlaybackMode ? '#ffd166' : (socketStatus.connected ? '#00ffcc' : '#ff6b6b'),
            border: `1px solid ${isPlaybackMode ? '#ffd166' : (socketStatus.connected ? 'rgba(0,255,204,0.3)' : 'rgba(255,68,68,0.3)')}`,
          }}>
            {isPlaybackMode ? 'PLAYBACK MODE' : (socketStatus.connected ? (socketStatus.kafka ? 'KAFKA LIVE' : 'WS CONNECTED') : 'WS OFFLINE')}
          </span>
        </div>

        <div style={{ margin: '4px 0 10px', color: 'rgba(255,255,255,0.65)', fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span>⚡ {filteredAttacks.length} EVENTS IN VIEW</span>
          <span style={{ color: isPlaybackMode ? '#ffd166' : (socketStatus.kafka ? '#00ffcc' : '#ffd166') }}>
            {isPlaybackMode ? `● Replay Frame` : (isPaused ? '⏸ Paused' : (socketStatus.kafka ? '● Stream Live' : '○ Standby'))}
          </span>
        </div>

        {/* Quick controls: Trigger Test Attack & Sphere Rotation & Analytics Modal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={triggerTestThreat}
              disabled={!socketStatus.connected || isPlaybackMode}
              style={{
                flex: 1,
                fontFamily: 'inherit',
                fontSize: '10px',
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: (socketStatus.connected && !isPlaybackMode) ? 'pointer' : 'not-allowed',
                background: (socketStatus.connected && !isPlaybackMode) ? 'rgba(0,255,204,0.15)' : 'rgba(255,255,255,0.05)',
                color: (socketStatus.connected && !isPlaybackMode) ? '#00ffcc' : 'rgba(255,255,255,0.3)',
                border: `1px solid ${(socketStatus.connected && !isPlaybackMode) ? 'rgba(0,255,204,0.4)' : 'rgba(255,255,255,0.1)'}`,
                transition: 'all 0.2s ease',
              }}
            >
              ⚡ TEST ATTACK
            </button>

            <button
              onClick={() => setStatsOpen(true)}
              style={{
                flex: 1,
                fontFamily: 'inherit',
                fontSize: '10px',
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                transition: 'all 0.2s ease',
              }}
              title="Open Historical SOC Intelligence & Analytics Modal"
            >
              📊 ANALYTICS
            </button>
          </div>

          <button
            onClick={() => setAutoRotate(r => !r)}
            style={{
              width: '100%',
              fontFamily: 'inherit',
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
          >
            <span>{autoRotate ? '🔄' : '🔒'}</span>
            <span>{autoRotate ? 'SPHERE ROTATION: ON' : 'SPHERE ROTATION: LOCKED'}</span>
          </button>
        </div>

        {/* Live Threat Log with MITRE Tags & Click-to-Inspect selection */}
        <div style={{ fontSize: '11px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
          {filteredAttacks.slice(-10).reverse().map((a, i) => {
            const mitre = getMitreDetails(a.attack_type);
            const sev = getSeverityInfo(a.severity, a.attack_type);
            const isSelected = selectedThreat?.id === a.id;
            const isBlocked = blockedIps.has(a.source_ip);

            return (
              <div
                key={a.id || i}
                onClick={() => handleSelectThreat(a)}
                style={{
                  marginBottom: '6px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: isSelected ? 'rgba(0, 255, 204, 0.2)' : (isBlocked ? 'rgba(255, 23, 79, 0.15)' : 'rgba(255,255,255,0.05)'),
                  borderLeft: `3px solid ${sev.color}`,
                  border: isSelected ? '1px solid #00ffcc' : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,255,204,0.15)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isBlocked ? 'rgba(255, 23, 79, 0.15)' : 'rgba(255,255,255,0.05)'; }}
                title="Click to inspect raw telemetry, MITRE ATT&CK and ML explainability"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: sev.color, fontWeight: 'bold', fontSize: '10px' }}>
                      [{a.attack_type?.replace(/_/g, ' ')}]
                    </span>
                    <span style={{
                      fontSize: '8px',
                      color: '#00ffcc',
                      background: 'rgba(0,255,204,0.15)',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      fontWeight: 'bold'
                    }}>
                      {mitre.id}
                    </span>
                  </div>
                  <span style={{ color: a.drift_score > 0.4 ? '#ff174f' : 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 'bold' }}>
                    {a.drift_score !== undefined ? `drift ${(Number(a.drift_score) * 100).toFixed(0)}%` : `sev ${(sev.score * 100).toFixed(0)}%`}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: '9px' }}>
                  <span style={{ color: isBlocked ? '#ff6b6b' : 'inherit' }}>
                    {isBlocked ? `🚫 ${a.source_ip}` : a.source_ip}
                  </span>
                  <span>{a.city ? a.city.split(',')[0] : `${Number(a.source_lat).toFixed(1)}°, ${Number(a.source_long).toFixed(1)}°`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Bottom Historical Time Scrubber / Playback Control ─── */}
      <PlaybackControlBar
        isPlaybackMode={isPlaybackMode}
        onTogglePlaybackMode={handleTogglePlaybackMode}
        playbackEvents={playbackEvents}
        currentIndex={playbackIndex}
        isPlaying={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onSeek={(idx) => {
          setPlaybackIndex(idx);
          if (selectedThreat && playbackEvents[idx]) {
            setSelectedThreat(playbackEvents[idx]);
          }
        }}
        onStepForward={() => {
          setPlaybackIndex(idx => Math.min(playbackEvents.length - 1, idx + 1));
        }}
        onStepBackward={() => {
          setPlaybackIndex(idx => Math.max(0, idx - 1));
        }}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={setPlaybackSpeed}
        selectedWindow={playbackWindow}
        onSelectWindow={handleSelectPlaybackWindow}
        loading={playbackLoading}
      />

      {/* ─── Click-to-Inspect Detailed Side Drawer ─── */}
      {selectedThreat && (
        <ThreatDetailDrawer
          threat={selectedThreat}
          onClose={() => setSelectedThreat(null)}
          onFlyToLocation={handleFlyToLocation}
          onBlockIp={handleBlockIp}
          blockedIps={blockedIps}
          backendUrl={BACKEND_URL}
          onShowToast={showToast}
        />
      )}

      {/* ─── Historical SOC Intelligence Modal ─── */}
      <SOCStatsModal
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
        backendUrl={BACKEND_URL}
      />

      {/* ─── Complete Project Guide & Operational Architecture Modal ─── */}
      <ProjectGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />

      {/* ─── Active SOC Toast Notifications ─── */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          bottom: 95,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 120,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#00ffcc',
          background: 'rgba(2, 6, 23, 0.95)',
          border: '1px solid #00ffcc',
          borderRadius: '8px',
          padding: '10px 18px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 25px rgba(0, 255, 204, 0.4)',
          animation: 'fadeInUp 0.25s ease',
          pointerEvents: 'none'
        }}>
          {toastMessage}
        </div>
      )}

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
            fontFamily: "'JetBrains Mono', monospace",
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
          <span>RESET GLOBE VIEW</span>
        </button>
      </div>

      {/* ─── Bottom-right: Map Layer Switcher ─── */}
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
                fontFamily: "'JetBrains Mono', monospace",
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

      {/* ─── Global CSS Animations ─── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #00ffcc; }
          50% { opacity: 0.4; box-shadow: 0 0 2px #00ffcc; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 15px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.3);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 204, 0.3);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 204, 0.6);
        }
      `}</style>
    </div>
  );
}

export default App;