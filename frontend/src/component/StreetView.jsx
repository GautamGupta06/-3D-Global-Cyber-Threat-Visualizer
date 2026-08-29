import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ATTACK_COLOR = {
  DDoS:          '#ff174f',
  SQL_Injection: '#ff6b35',
  Malware_Drop:  '#c026d3',
  Port_Scan:     '#ffd166',
  Brute_Force:   '#fb923c',
};

// 100% free tiles — no API key
const LAYERS = {
  Street: {
    url:  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    max: 19,
  },
  Dark: {
    url:  'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    attr: '&copy; Stadia Maps',
    max: 20,
  },
  Satellite: {
    url:  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: 'Tiles &copy; Esri',
    max: 19,
  },
};

function cyberIcon(color) {
  const id = color.replace('#', '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <filter id="glow${id}">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="32" cy="32" r="28" fill="none" stroke="${color}" stroke-width="1" opacity="0.2">
    <animate attributeName="r" values="18;30;18" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.45;0;0.45" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="32" cy="32" r="19" fill="none" stroke="${color}" stroke-width="2.2" opacity="0.85" filter="url(#glow${id})"/>
  <circle cx="32" cy="32" r="8"  fill="${color}" opacity="0.95" filter="url(#glow${id})"/>
  <line x1="32" y1="5"  x2="32" y2="20" stroke="${color}" stroke-width="2.5"/>
  <line x1="32" y1="44" x2="32" y2="59" stroke="${color}" stroke-width="2.5"/>
  <line x1="5"  y1="32" x2="20" y2="32" stroke="${color}" stroke-width="2.5"/>
  <line x1="44" y1="32" x2="59" y2="32" stroke="${color}" stroke-width="2.5"/>
</svg>`;
  return L.divIcon({ html: svg, className: '', iconSize:[64,64], iconAnchor:[32,32], popupAnchor:[0,-36] });
}

export default function StreetView({ lat, lng, attackType, onClose }) {
  const mapRef    = useRef(null);
  const lmap      = useRef(null);
  const markerRef = useRef(null);
  const tileRef   = useRef(null);
  const [layer, setLayer]     = useState('Street');
  const [visible, setVisible] = useState(false);
  const [zoomLabel, setZoomLabel] = useState('World View');

  const color = ATTACK_COLOR[attackType] ?? '#00ffcc';

  // Fade-in
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Init map using useLayoutEffect so dimensions are measured before paint
  useLayoutEffect(() => {
    if (!mapRef.current) return;
    if (lmap.current) { lmap.current.remove(); lmap.current = null; }

    // Explicitly set pixel dimensions — Leaflet measures these synchronously
    const W = window.innerWidth;
    const H = window.innerHeight;
    mapRef.current.style.width  = W + 'px';
    mapRef.current.style.height = H + 'px';

    // Start at world zoom (like Google Earth globe) then fly in
    const map = L.map(mapRef.current, {
      zoomControl:        false,
      attributionControl: true,
      preferCanvas:       true,
      center:  [lat, lng],
      zoom:    2,           // Start world-level like Google Earth
      minZoom: 1,
      maxZoom: 19,
    });
    lmap.current = map;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const cfg = LAYERS.Street;
    tileRef.current = L.tileLayer(cfg.url, { maxZoom: cfg.max, attribution: cfg.attr }).addTo(map);

    // Add marker at the attack location
    markerRef.current = L.marker([lat, lng], { icon: cyberIcon(color) })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:monospace;font-size:12px;color:${color};font-weight:bold;padding:3px 6px">
          &#9888; ${attackType || 'THREAT'} DETECTED<br/>
          <span style="color:#aaa;font-size:10px">${lat.toFixed(4)}&deg;, ${lng.toFixed(4)}&deg;</span>
        </div>`,
        { className: 'cv-popup', maxWidth: 250 }
      );

    // Update zoom label on zoom events
    map.on('zoomend', () => {
      const z = map.getZoom();
      setZoomLabel(
        z <= 3  ? 'World View' :
        z <= 6  ? 'Continental' :
        z <= 10 ? 'Regional' :
        z <= 14 ? 'City Level' :
        z <= 16 ? 'District' :
                  'Street Level'
      );
    });

    // Google Earth style: fly from world view → street level
    // Short delay so the world map renders first, then animates in
    const tid = setTimeout(() => {
      if (!lmap.current) return;
      map.flyTo([lat, lng], 18, {
        duration:     3.0,    // 3 second zoom animation (matches Google Earth feel)
        easeLinearity: 0.15,  // ease-in-out curve
      });
      // Open popup when zoom reaches street level
      map.once('moveend', () => {
        if (markerRef.current) markerRef.current.openPopup();
        setZoomLabel('Street Level');
      });
    }, 400);

    return () => {
      clearTimeout(tid);
      map.remove();
      lmap.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  // Tile layer swap
  useEffect(() => {
    if (!lmap.current) return;
    if (tileRef.current) lmap.current.removeLayer(tileRef.current);
    const cfg = LAYERS[layer];
    tileRef.current = L.tileLayer(cfg.url, { maxZoom: cfg.max, attribution: cfg.attr }).addTo(lmap.current);
    if (markerRef.current) { markerRef.current.remove(); markerRef.current.addTo(lmap.current); }
  }, [layer]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 340); };

  return (
    <>
      <style>{`
        .cv-popup .leaflet-popup-content-wrapper {
          background: rgba(2,6,23,0.96) !important;
          border: 1px solid ${color}88 !important;
          border-radius: 10px !important;
          box-shadow: 0 0 24px ${color}44 !important;
          backdrop-filter: blur(12px) !important;
          color: #fff !important;
        }
        .cv-popup .leaflet-popup-tip { background: rgba(2,6,23,0.96) !important; }
        .cv-popup .leaflet-popup-close-button { color: rgba(255,255,255,0.3) !important; }
        @keyframes svScan {
          0%   { top:0;    opacity:0.85; }
          95%  { opacity:0.3; }
          100% { top:100%; opacity:0; }
        }
        @keyframes svPulse {
          0%,100% { opacity:1; box-shadow:0 0 14px ${color}; }
          50%     { opacity:0.3; box-shadow:0 0 3px ${color}; }
        }
        .leaflet-control-zoom a {
          background: rgba(2,6,23,0.92) !important;
          color: ${color} !important;
          border-color: ${color}55 !important;
          font-weight: bold !important;
        }
        .leaflet-control-zoom a:hover { background: ${color}22 !important; }
        .leaflet-control-attribution {
          background: rgba(2,6,23,0.72) !important;
          color: rgba(255,255,255,0.3) !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color:rgba(255,255,255,0.45)!important; }
      `}</style>

      {/* Leaflet map — explicit pixel size via useLayoutEffect */}
      <div
        ref={mapRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width:  '100vw',
          height: '100vh',
          zIndex: 201,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* HUD overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 220,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }}>
        {/* Scan line */}
        <div style={{
          position:'absolute', left:0, right:0, height:2,
          background: `linear-gradient(90deg,transparent,${color}cc,transparent)`,
          animation: 'svScan 3.5s linear infinite',
        }}/>

        {/* Top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, width: '100%',
          boxSizing: 'border-box',
          zIndex: 10,
          background: 'linear-gradient(180deg, rgba(2,6,23,0.95) 0%, rgba(2,6,23,0.7) 70%, transparent 100%)',
          padding: '14px 20px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          pointerEvents: 'auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, animation: 'svPulse 1.4s infinite' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold', color, letterSpacing: '0.1em' }}>
                STREET LEVEL INTEL
              </span>
              {attackType && (
                <span style={{
                  fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.06em', color,
                  background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 5, padding: '2px 9px',
                }}>{attackType}</span>
              )}
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginLeft: 20 }}>
              {lat.toFixed(4)}°N &nbsp;·&nbsp; {lng.toFixed(4)}°E &nbsp;·&nbsp; 
              <span style={{ color, fontWeight: 'bold' }}>{zoomLabel}</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {Object.keys(LAYERS).map(name => (
              <button key={name} onClick={() => setLayer(name)} style={{
                fontFamily: 'monospace', fontSize: 10, padding: '6px 12px', borderRadius: 6,
                cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(10px)',
                border: `1px solid ${layer===name ? color : 'rgba(255,255,255,0.2)'}`,
                background: layer===name ? `${color}33` : 'rgba(2,6,23,0.85)',
                color: layer===name ? color : 'rgba(255,255,255,0.6)',
              }}>{name}</button>
            ))}
            <button onClick={handleClose} style={{
              fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold',
              letterSpacing: '0.06em', padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(2,6,23,0.92)', color: '#00ffcc',
              border: '1px solid rgba(0,255,204,0.6)', backdropFilter: 'blur(12px)',
              boxShadow: '0 0 20px rgba(0,255,204,0.25)', transition: 'all 0.22s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(0,255,204,0.25)'; e.currentTarget.style.boxShadow='0 0 32px rgba(0,255,204,0.4)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='rgba(2,6,23,0.92)';    e.currentTarget.style.boxShadow='0 0 20px rgba(0,255,204,0.25)'; }}
            >
              <span>🌍</span>
              <span>BACK TO GLOBE</span>
            </button>
          </div>
        </div>

        {/* Bottom vignette */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:80,
          background:'linear-gradient(0deg,rgba(2,6,23,0.5) 0%,transparent 100%)',
        }}/>

        {/* Corner brackets */}
        {[
          {top:0,   left:0,  borderTop:`2px solid ${color}`,    borderLeft:`2px solid ${color}`},
          {top:0,   right:0, borderTop:`2px solid ${color}`,    borderRight:`2px solid ${color}`},
          {bottom:0,left:0,  borderBottom:`2px solid ${color}`, borderLeft:`2px solid ${color}`},
          {bottom:0,right:0, borderBottom:`2px solid ${color}`, borderRight:`2px solid ${color}`},
        ].map((s,i)=>(
          <div key={i} style={{ position:'absolute', width:28, height:28, ...s }}/>
        ))}
      </div>
    </>
  );
}
