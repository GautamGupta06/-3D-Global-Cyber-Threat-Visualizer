import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { _GlobeView as GlobeView } from '@deck.gl/core';
import { BitmapLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';

const TILE_SOURCES = {
  Satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  Street:    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  Dark:      'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
};

const ATTACK_COLOR = {
  DDoS:          [255, 23,  79],
  SQL_Injection: [255, 107, 53],
  Malware_Drop:  [192, 38, 211],
  Port_Scan:     [255, 209, 102],
  Brute_Force:   [251, 146, 60],
};

const majorCities = [
  { name: 'New York', lat: 40.71, lng: -74.01 },
  { name: 'London', lat: 51.51, lng: -0.12 },
  { name: 'Tokyo', lat: 35.68, lng: 139.69 },
  { name: 'Paris', lat: 48.85, lng: 2.35 },
  { name: 'Sydney', lat: -33.87, lng: 151.21 },
  { name: 'Beijing', lat: 39.9, lng: 116.4 },
  { name: 'Mumbai', lat: 19.08, lng: 72.88 },
  { name: 'Cairo', lat: 30.04, lng: 31.24 },
  { name: 'São Paulo', lat: -23.55, lng: -46.63 },
  { name: 'Moscow', lat: 55.75, lng: 37.62 },
  { name: 'Los Angeles', lat: 34.05, lng: -118.24 },
  { name: 'Dubai', lat: 25.2, lng: 55.27 },
  { name: 'Singapore', lat: 1.35, lng: 103.82 },
  { name: 'Berlin', lat: 52.52, lng: 13.4 },
  { name: 'Toronto', lat: 43.65, lng: -79.38 },
  { name: 'Bangkok', lat: 13.75, lng: 100.5 },
  { name: 'Lagos', lat: 6.52, lng: 3.38 },
  { name: 'Buenos Aires', lat: -34.6, lng: -58.38 },
  { name: 'New Delhi', lat: 28.61, lng: 77.21 },
  { name: 'Shanghai', lat: 31.23, lng: 121.47 },
];

export default function CyberGlobeDeck({
  attacks = [],
  mapMode = 'Satellite',
  autoRotate = false,
  onZoomChange,
}) {
  const [viewState, setViewState] = useState({
    latitude: 20,
    longitude: 0,
    zoom: 0.5,
    maxZoom: 18,
    minZoom: 0,
  });

  const rotRef = useRef(null);
  const userInteracting = useRef(false);
  const idleTimer = useRef(null);

  // Auto-rotate globe when enabled and user is not dragging
  useEffect(() => {
    if (!autoRotate) {
      if (rotRef.current) cancelAnimationFrame(rotRef.current);
      return;
    }

    let lastTime = performance.now();
    const rotate = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!userInteracting.current) {
        setViewState((prev) => ({
          ...prev,
          longitude: (prev.longitude + delta * 0.008) % 360,
        }));
      }
      rotRef.current = requestAnimationFrame(rotate);
    };

    rotRef.current = requestAnimationFrame(rotate);
    return () => {
      if (rotRef.current) cancelAnimationFrame(rotRef.current);
    };
  }, [autoRotate]);

  const handleViewStateChange = useCallback(({ viewState: vs, interactionState }) => {
    if (interactionState?.isDragging || interactionState?.isZooming || interactionState?.isRotating) {
      userInteracting.current = true;
      clearTimeout(idleTimer.current);
    } else {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        userInteracting.current = false;
      }, 2500);
    }

    setViewState(vs);
    onZoomChange?.(vs.zoom);
  }, [onZoomChange]);

  // Dynamic Tile Layers & Threat Markers
  const layers = useMemo(() => {
    const validAttacks = attacks.filter((a) => {
      const lat = Number(a.source_lat);
      const lng = Number(a.source_long);
      return Number.isFinite(lat) && Number.isFinite(lng);
    });

    const isStreet = mapMode === 'Street';
    const isDark   = mapMode === 'Dark';

    return [
      // 1. Base Globe Layer (always covers the whole sphere immediately)
      new BitmapLayer({
        id: 'globe-base',
        bounds: [-180, -90, 180, 90],
        image: isDark
          ? 'https://unpkg.com/three-globe@2.41.12/example/img/earth-night.jpg'
          : 'https://unpkg.com/three-globe@2.41.12/example/img/earth-blue-marble.jpg',
        opacity: 1,
      }),

      // 2. High-Resolution Multi-level Tile Layer (Streams sharp tiles dynamically)
      new TileLayer({
        id: `tile-layer-${mapMode}`,
        data: TILE_SOURCES[mapMode] || TILE_SOURCES.Satellite,
        minZoom: 0,
        maxZoom: 19,
        tileSize: 256,
        opacity: 1,
        renderSubLayers: (props) => {
          const { bbox: { west, south, east, north } } = props.tile;
          return new BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [west, south, east, north],
          });
        },
      }),

      // 3. Attack Pulse Rings
      new ScatterplotLayer({
        id: 'threat-rings',
        data: validAttacks,
        getPosition: (d) => [Number(d.source_long), Number(d.source_lat)],
        getRadius: (d) => (d.attack_type === 'DDoS' ? 90000 : 55000),
        getFillColor: (d) => {
          const c = ATTACK_COLOR[d.attack_type] || [0, 255, 204];
          return [...c, 45];
        },
        getLineColor: (d) => {
          const c = ATTACK_COLOR[d.attack_type] || [0, 255, 204];
          return [...c, 240];
        },
        stroked: true,
        filled: true,
        lineWidthMinPixels: 2,
        radiusUnits: 'meters',
      }),

      // 4. Attack Center Dots
      new ScatterplotLayer({
        id: 'threat-dots',
        data: validAttacks,
        getPosition: (d) => [Number(d.source_long), Number(d.source_lat)],
        getRadius: (d) => (d.attack_type === 'DDoS' ? 24000 : 16000),
        getFillColor: (d) => ATTACK_COLOR[d.attack_type] || [0, 255, 204],
        stroked: true,
        getLineColor: [255, 255, 255, 220],
        lineWidthMinPixels: 1.5,
        radiusUnits: 'meters',
        pickable: true,
      }),

      // 5. Threat Type Labels
      new TextLayer({
        id: 'threat-labels',
        data: validAttacks.slice(-12),
        getPosition: (d) => [Number(d.source_long), Number(d.source_lat) + (viewState.zoom > 4 ? 0.08 : 0.6)],
        getText: (d) => `⚠ ${d.attack_type || 'THREAT'}`,
        getSize: viewState.zoom > 5 ? 13 : 11,
        getColor: (d) => ATTACK_COLOR[d.attack_type] || [0, 255, 204],
        getBackgroundColor: [2, 6, 23, 210],
        background: true,
        backgroundPadding: [5, 3],
        fontFamily: 'monospace',
        fontWeight: 'bold',
      }),

      // 6. Major City Labels
      ...(viewState.zoom > 1.5
        ? [
            new TextLayer({
              id: 'city-labels',
              data: majorCities,
              getPosition: (d) => [d.lng, d.lat],
              getText: (d) => `● ${d.name}`,
              getSize: viewState.zoom > 6 ? 13 : 10,
              getColor: [0, 255, 204, 230],
              getBackgroundColor: [2, 6, 23, 180],
              background: true,
              backgroundPadding: [4, 2],
              fontFamily: 'monospace',
              fontWeight: 'bold',
            }),
          ]
        : []),
    ];
  }, [attacks, mapMode, viewState.zoom]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <DeckGL
        views={new GlobeView({ id: 'globe' })}
        viewState={viewState}
        onViewStateChange={handleViewStateChange}
        layers={layers}
        controller={{
          dragRotate: true,
          scrollZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          inertia: 350,
        }}
        style={{ width: '100vw', height: '100vh', background: '#000510' }}
      />
    </div>
  );
}
