import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TILE_LAYERS = {
  Satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
  },
  Street: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
};

const ATTACK_COLOR = {
  DDoS: '#ff174f',
  SQL_Injection: '#ff6b35',
  Malware_Drop: '#c026d3',
  Port_Scan: '#ffd166',
  Brute_Force: '#fb923c',
};

// Sync map zoom with parent app & detect zoom-out back to 3D Globe
function MapController({ onZoomOut, onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => {
      const z = map.getZoom();
      onZoomChange?.(z);
      // When user zooms out past world level, return to 3D space globe
      if (z <= 2.2) {
        onZoomOut?.();
      }
    },
  });
  return null;
}

export default function SeamlessMapView({
  center = [20, 0],
  zoom = 6,
  mapMode = 'Satellite',
  attacks = [],
  onZoomOut,
  onZoomChange,
}) {
  const activeTile = TILE_LAYERS[mapMode] || TILE_LAYERS.Satellite;

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', zIndex: 2 }}>
      <style>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          background: #000510 !important;
        }
        .leaflet-control-attribution {
          background: rgba(2, 6, 23, 0.8) !important;
          color: rgba(255, 255, 255, 0.5) !important;
          font-family: monospace !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a {
          color: #00ffcc !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: rgba(2, 6, 23, 0.92) !important;
          border: 1px solid #00ffcc !important;
          border-radius: 8px !important;
          color: #fff !important;
          font-family: monospace !important;
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.3) !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: rgba(2, 6, 23, 0.92) !important;
          border: 1px solid #00ffcc !important;
        }
      `}</style>

      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={2}
        maxZoom={19}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <MapController onZoomOut={onZoomOut} onZoomChange={onZoomChange} />

        {/* Real-time high-res tiles down to street & building level */}
        <TileLayer
          key={mapMode}
          url={activeTile.url}
          attribution={activeTile.attribution}
          maxZoom={activeTile.maxZoom}
        />

        {/* Live Attack Markers on the Street Map */}
        {attacks.map((attack, i) => {
          const lat = Number(attack.source_lat);
          const lng = Number(attack.source_long);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

          const color = ATTACK_COLOR[attack.attack_type] || '#00ffcc';

          return (
            <CircleMarker
              key={attack.id || `${attack.source_ip}-${i}`}
              center={[lat, lng]}
              radius={attack.attack_type === 'DDoS' ? 12 : 8}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.6,
                weight: 2,
              }}
              className="custom-popup"
            >
              <Popup>
                <div style={{ fontSize: '11px', lineHeight: 1.4 }}>
                  <div style={{ color, fontWeight: 'bold', fontSize: '12px', marginBottom: 2 }}>
                    ⚠ [{attack.attack_type || 'THREAT'}]
                  </div>
                  <div>IP: <span style={{ color: '#00ffcc' }}>{attack.source_ip}</span></div>
                  <div>Lat/Lng: {lat.toFixed(3)}°, {lng.toFixed(3)}°</div>
                  {attack.severity && <div>Severity: {(attack.severity * 100).toFixed(0)}%</div>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
