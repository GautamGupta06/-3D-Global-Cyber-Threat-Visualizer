import { useEffect, useRef, useState, useCallback } from 'react';
import StreetView from './StreetView';
import DeckGL from '@deck.gl/react';
import { _GlobeView as GlobeView } from '@deck.gl/core';
import { BitmapLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';

const ATTACK_COLOR = {
  DDoS:          [255, 23,  79],
  SQL_Injection: [255, 107, 53],
  Malware_Drop:  [192, 38, 211],
  Port_Scan:     [255, 209, 102],
  Brute_Force:   [251, 146, 60],
};


function toHex(arr) {
  return '#' + arr.map(c => c.toString(16).padStart(2, '0')).join('');
}

const TILE_SOURCES = {
  Satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  Street:    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  Dark:      'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
};

export default function GlobeStreetView({ lat, lng, attackType, onClose }) {
  const colorArr = ATTACK_COLOR[attackType] ?? [0, 255, 204];
  const colorHex = toHex(colorArr);
  const [visible, setVisible]       = useState(false);
  const [zoomLabel, setZoomLabel]   = useState('World View');
  const [viewState, setViewState]   = useState({ latitude: lat, longitude: lng, zoom: 0.5 });
  const [mapStyle, setMapStyle]     = useState('Satellite'); // 'Satellite' | 'Street' | 'Dark'
  const animRef     = useRef(null);
  const userDragged = useRef(false);  // stop rotation once user interacts

  // Fade in
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Google Earth zoom-in animation
  useEffect(() => {
    const START = 0.5, END = 14, DUR = 3200;
    const t0 = Date.now();
    const step = () => {
      const raw  = Math.min((Date.now() - t0) / DUR, 1);
      const ease = raw < 0.5 ? 4*raw*raw*raw : 1 - Math.pow(-2*raw+2,3)/2;
      const zoom = START + (END - START) * ease;
      setZoomLabel(zoom<2?'World View':zoom<5?'Continental':zoom<8?'Regional':zoom<11?'City Level':zoom<13?'District':'Street Level');
      setViewState(prev => ({ ...prev, zoom, latitude: lat, longitude: lng }));
      if (raw < 1) animRef.current = requestAnimationFrame(step);
    };
    const tid = setTimeout(() => { animRef.current = requestAnimationFrame(step); }, 350);
    return () => {
      clearTimeout(tid);
      cancelAnimationFrame(animRef.current);
    };
  }, [lat, lng]);

  const layers = [
    // ── Base Globe Layer
    new BitmapLayer({
      id: 'earth-base',
      bounds: [-180, -90, 180, 90],
      image: mapStyle === 'Dark'
        ? 'https://unpkg.com/three-globe@2.41.12/example/img/earth-night.jpg'
        : 'https://unpkg.com/three-globe@2.41.12/example/img/earth-blue-marble.jpg',
      opacity: 1,
    }),
    // ── High-res Tiles (Satellite / Street / Dark) loaded based on mapStyle
    new TileLayer({
      id: `tiles-${mapStyle}`,
      data: TILE_SOURCES[mapStyle] || TILE_SOURCES.Satellite,
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      opacity: viewState.zoom > 3 ? 1 : Math.max(0, (viewState.zoom - 1.5) / 1.5),
      renderSubLayers: props => {
        const { bbox: { west, south, east, north } } = props.tile;
        return new BitmapLayer(props, { data: null, image: props.data, bounds: [west, south, east, north] });
      },
    }),
    new ScatterplotLayer({
      id: 'ring',
      data: [{ position: [lng, lat] }],
      getPosition: d => d.position,
      getRadius: 50000,
      getFillColor: [...colorArr, 40],
      getLineColor: [...colorArr, 220],
      stroked: true, filled: true,
      lineWidthMinPixels: 2,
      radiusUnits: 'meters',
    }),
    new ScatterplotLayer({
      id: 'dot',
      data: [{ position: [lng, lat] }],
      getPosition: d => d.position,
      getRadius: 10000,
      getFillColor: [...colorArr, 255],
      stroked: true,
      getLineColor: [255,255,255,200],
      lineWidthMinPixels: 2,
      radiusUnits: 'meters',
    }),
    new TextLayer({
      id: 'lbl',
      data: [{ position: [lng, lat + 0.5], text: '⚠ ' + (attackType || 'THREAT') }],
      getPosition: d => d.position,
      getText: d => d.text,
      getSize: 14,
      getColor: colorArr,
      getBackgroundColor: [2, 6, 23, 200],
      background: true,
      backgroundPadding: [6, 4],
      fontFamily: 'monospace',
      fontWeight: 'bold',
    }),
  ];

  const scanStyle = {
    position:'absolute', left:0, right:0, height:2, pointerEvents:'none',
    background: `linear-gradient(90deg,transparent,${colorHex}cc,transparent)`,
    animationName: 'svScan', animationDuration: '3.5s', animationTimingFunction: 'linear', animationIterationCount: 'infinite',
    zIndex: 1,
  };

  return (
    <>
      <style>{`
        @keyframes svScan { 0% { top:0; opacity:.85; } 95% { opacity:.3; } 100% { top:100%; opacity:0; } }
        @keyframes svPulse { 0%,100% { opacity:1; box-shadow:0 0 14px ${colorHex}; } 50% { opacity:.3; } }
      `}</style>

      <div style={{ position:'fixed', inset:0, zIndex:201, background:'#000510', opacity:visible?1:0, transition:'opacity .4s ease' }}>

        <DeckGL
          views={new GlobeView({ id:'globe' })}
          viewState={viewState}
          onViewStateChange={({ viewState: vs, interactionState }) => {
            cancelAnimationFrame(animRef.current);
            if (interactionState?.isDragging || interactionState?.isZooming) {
              userDragged.current = true;
            }
            setViewState(vs);
            const z = vs.zoom;
            setZoomLabel(z<2?'World View':z<5?'Continental':z<8?'Regional':z<11?'City Level':z<13?'District':'Street Level');
          }}
          layers={layers}
          controller={{ inertia: 400 }}
          style={{ width:'100vw', height:'100vh' }}
        />

        <div style={scanStyle}/>

        {/* Top HUD */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, width: '100%',
          boxSizing: 'border-box',
          zIndex: 10,
          background: 'linear-gradient(180deg, rgba(2,6,23,0.92) 0%, rgba(2,6,23,0.6) 70%, transparent 100%)',
          padding: '16px 24px 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          pointerEvents: 'auto'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorHex, animationName: 'svPulse', animationDuration: '1.4s', animationIterationCount: 'infinite' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold', color: colorHex, letterSpacing: '.1em' }}>
                GLOBE INTEL VIEW
              </span>
              {attackType && (
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: colorHex, background: colorHex + '22', border: `1px solid ${colorHex}44`, borderRadius: 5, padding: '2px 9px' }}>
                  {attackType}
                </span>
              )}
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginLeft: 20 }}>
              {lat.toFixed(4)}°N &nbsp;·&nbsp; {lng.toFixed(4)}°E &nbsp;·&nbsp;
              <span style={{ color: colorHex, fontWeight: 'bold' }}>{zoomLabel}</span>
            </span>
          </div>
        </div>

        {/* ─── Bottom-right 3 Buttons: Satellite, Street, Dark ─── */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 50,
          display: 'flex',
          gap: 8,
          background: 'rgba(2, 6, 23, 0.9)',
          border: '1px solid rgba(0, 255, 204, 0.35)',
          borderRadius: 10,
          padding: '6px 8px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 24px rgba(0, 0, 0, 0.6)',
          pointerEvents: 'auto'
        }}>
          {[
            { id: 'Satellite', label: '🛰️ Satellite' },
            { id: 'Street',    label: '🗺️ Street' },
            { id: 'Dark',      label: '🌙 Dark' }
          ].map(({ id, label }) => {
            const isActive = mapStyle === id;
            return (
              <button
                key={id}
                onClick={() => setMapStyle(id)}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '.06em',
                  padding: '8px 14px',
                  borderRadius: 7,
                  cursor: 'pointer',
                  border: `1px solid ${isActive ? colorHex : 'rgba(255,255,255,0.15)'}`,
                  background: isActive ? `${colorHex}35` : 'rgba(255,255,255,0.06)',
                  color: isActive ? colorHex : 'rgba(255,255,255,0.7)',
                  boxShadow: isActive ? `0 0 14px ${colorHex}50` : 'none',
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

        {/* Bottom vignette */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:80, zIndex:1, background:'linear-gradient(0deg,rgba(2,6,23,.5) 0%,transparent 100%)', pointerEvents:'none' }}/>

        {/* Corner brackets */}
        {[
          { top:0,    left:0,  borderTop:`2px solid ${colorHex}`,    borderLeft:`2px solid ${colorHex}` },
          { top:0,    right:0, borderTop:`2px solid ${colorHex}`,    borderRight:`2px solid ${colorHex}` },
          { bottom:0, left:0,  borderBottom:`2px solid ${colorHex}`, borderLeft:`2px solid ${colorHex}` },
          { bottom:0, right:0, borderBottom:`2px solid ${colorHex}`, borderRight:`2px solid ${colorHex}` },
        ].map((s,i) => <div key={i} style={{ position:'absolute', width:28, height:28, zIndex:2, ...s, pointerEvents:'none' }}/>)}
      </div>
    </>
  );
}
