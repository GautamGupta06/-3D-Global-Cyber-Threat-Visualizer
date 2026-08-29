import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import Atmosphere from './Atmosphere';

// High-definition Equirectangular maps
const earthBlueMarbleUrl = 'https://unpkg.com/three-globe@2.41.12/example/img/earth-blue-marble.jpg';
const earthDayUrl        = 'https://unpkg.com/three-globe@2.41.12/example/img/earth-day.jpg';
const earthNightUrl      = 'https://unpkg.com/three-globe@2.41.12/example/img/earth-night.jpg';
const earthBumpUrl       = 'https://unpkg.com/three-globe@2.41.12/example/img/earth-topology.png';

// Convert GPS Lat/Long to 3D Cartesian coordinates
const getCoordinates = (lat, long, radius = 2) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (long + 180) * (Math.PI / 180);
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    (radius * Math.cos(phi)),
    (radius * Math.sin(phi) * Math.sin(theta)),
  ];
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

function EarthMesh({ mapMode, textures }) {
  const meshRef = useRef();
  const { earthBlueMarble, earthDay, earthBump } = textures;

  // 🗺️ Street / Political Day Mode: Bright, crystal-clear daytime cartography
  if (mapMode === 'Street') {
    return (
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial
          map={earthDay}
          bumpMap={earthBump}
          bumpScale={0.04}
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>
    );
  }

  // 🛰️ Satellite / Blue Marble: Photorealistic NASA planetary earth view
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 128, 128]} />
      <meshStandardMaterial
        map={earthBlueMarble}
        bumpMap={earthBump}
        bumpScale={0.05}
        roughness={0.85}
        metalness={0.1}
      />
    </mesh>
  );
}

function CityLabel({ city, zoomDist, camera }) {
  const pos = getCoordinates(city.lat, city.lng, 2.02);
  const cityVec = new THREE.Vector3(...pos);
  const camVec = camera.position.clone();
  const dot = cityVec.dot(camVec);
  if (dot < 0.2) return null;
  if (zoomDist > 5.2) return null;

  const scale = Math.max(8, Math.min(12, (zoomDist - 2.0) * 12 + 6));

  return (
    <Html position={pos} center style={{ pointerEvents: 'none' }}>
      <div style={{
        background: 'rgba(2,6,23,0.85)',
        border: '1px solid rgba(0,255,204,0.6)',
        borderRadius: '4px',
        padding: '2px 6px',
        color: '#00ffcc',
        fontSize: `${scale}px`,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 0 8px rgba(0,255,204,0.3)',
        userSelect: 'none',
      }}>
        ● {city.name}
      </div>
    </Html>
  );
}

function ThreatArc({ startLat, startLng, endLat, endLng, color = '#ff174f', isCritical = false }) {
  const laserRef = useRef();

  const { curve, lineObject } = useMemo(() => {
    const p1 = new THREE.Vector3(...getCoordinates(startLat, startLng, 2.015));
    const p2 = new THREE.Vector3(...getCoordinates(endLat, endLng, 2.015));
    const dist = p1.distanceTo(p2);

    // Parabolic mid-flight trajectory peak
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    const altitude = 2.0 + Math.min(1.4, dist * 0.35 + 0.12);
    mid.normalize().multiplyScalar(altitude);

    const c = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const pts = c.getPoints(36);
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: isCritical ? 0.75 : 0.4,
    });
    const line = new THREE.Line(geom, mat);
    return { curve: c, lineObject: line };
  }, [startLat, startLng, endLat, endLng, color, isCritical]);

  useFrame(({ clock }) => {
    if (laserRef.current) {
      const speed = isCritical ? 1.2 : 0.8;
      const t = (clock.elapsedTime * speed) % 1;
      const pt = curve.getPoint(t);
      laserRef.current.position.copy(pt);
    }
  });

  return (
    <group>
      <primitive object={lineObject} />
      <mesh ref={laserRef}>
        <sphereGeometry args={[isCritical ? 0.032 : 0.022, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function AttackMarker({ attack, zoomDist }) {
  const pulseRef = useRef();
  const lat = Number(attack.source_lat);
  const lng = Number(attack.source_long);
  const severity = Number(attack.severity) || 0;
  const isCritical = attack.attack_type === 'DDoS' || attack.attack_type === 'DDoS_Volume_Spike' || severity > 0.5;
  const position = getCoordinates(lat, lng, 2.015);
  const color = isCritical ? '#ff174f' : '#ffd166';

  // Smooth dynamic marker scaling down to pinpoint size at close surface zoom
  const markerScale = THREE.MathUtils.clamp((zoomDist - 2.0) * 1.5, 0.08, 1.0);

  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const pulse = (Math.sin(clock.elapsedTime * 5) + 1) / 2;
      pulseRef.current.scale.setScalar((1 + pulse * 0.6) * markerScale);
      pulseRef.current.material.opacity = 0.2 + (1 - pulse) * 0.6;
    }
  });

  return (
    <group position={position} scale={markerScale}>
      <mesh ref={pulseRef}>
        <ringGeometry args={[isCritical ? 0.055 : 0.038, isCritical ? 0.075 : 0.052, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[isCritical ? 0.04 : 0.028, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

// Convert 3D camera position back to GPS lat/long
const cameraToLatLng = (pos) => {
  const r = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
  const lat = 90 - (Math.acos(pos.y / r) * 180) / Math.PI;
  const lng = ((Math.atan2(pos.z, -pos.x) * 180) / Math.PI) - 180;
  return { lat, lng: lng < -180 ? lng + 360 : lng };
};

export default function CyberGlobe({ attacks, onZoomChange, onEnterMapView, autoRotate = false, mapMode = 'Satellite' }) {
  const globeRef = useRef();
  const isInteractingRef = useRef(false);
  const lastZoomReport = useRef(6);
  const idleTimer = useRef(null);
  const { camera, gl } = useThree();
  const [zoomDist, setZoomDist] = useState(6);

  // Preload verified textures
  const [earthBlueMarble, earthDay, earthNight, earthBump] = useLoader(THREE.TextureLoader, [
    earthBlueMarbleUrl,
    earthDayUrl,
    earthNightUrl,
    earthBumpUrl,
  ]);

  // Set 16x Anisotropic texture filtering
  useEffect(() => {
    const maxAniso = gl.capabilities?.getMaxAnisotropy?.() || 16;
    [earthBlueMarble, earthDay, earthNight, earthBump].forEach((tex) => {
      if (tex) {
        tex.anisotropy = maxAniso;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
      }
    });
  }, [earthBlueMarble, earthDay, earthNight, earthBump, gl]);

  const textures = { earthBlueMarble, earthDay, earthNight, earthBump };

  // Interaction tracking for smooth auto-rotation
  useEffect(() => {
    const el = gl.domElement;
    const onStart = () => {
      isInteractingRef.current = true;
      clearTimeout(idleTimer.current);
    };
    const onEnd = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        isInteractingRef.current = false;
      }, 2500);
    };

    el.addEventListener('pointerdown', onStart);
    el.addEventListener('pointerup', onEnd);
    el.addEventListener('wheel', () => { onStart(); onEnd(); });

    return () => {
      el.removeEventListener('pointerdown', onStart);
      el.removeEventListener('pointerup', onEnd);
      clearTimeout(idleTimer.current);
    };
  }, [gl]);

  // 100% Solid & Steady Frame Handler: zero auto-movements unless autoRotate toggle is ON
  useFrame(() => {
    if (!globeRef.current) return;
    const dist = camera.position.length();

    if (autoRotate && !isInteractingRef.current) {
      globeRef.current.rotation.y += 0.001;
    }

    if (Math.abs(dist - lastZoomReport.current) > 0.08) {
      lastZoomReport.current = dist;
      setZoomDist(dist);
      onZoomChange?.(dist);
    }

    // Seamlessly transition into the high-resolution Street & Road map when zooming in close
    if (dist <= 2.24) {
      const coords = cameraToLatLng(camera.position);
      onEnterMapView?.(coords);
    }
  });

  // Latest active arcs (top 15 recent threats)
  const activeArcs = useMemo(() => {
    return attacks.slice(-15).filter(a => {
      const sLat = Number(a.source_lat);
      const sLng = Number(a.source_long);
      const dLat = Number(a.dest_lat || 28.7041);
      const dLng = Number(a.dest_long || 77.1025);
      return Number.isFinite(sLat) && Number.isFinite(sLng) && Number.isFinite(dLat) && Number.isFinite(dLng);
    });
  }, [attacks]);

  return (
    <group ref={globeRef}>
      {/* 360-degree even lighting so the entire globe is visible from every angle without black shadows or glare spots */}
      <ambientLight intensity={mapMode === 'Dark' ? 0.85 : 1.4} />
      <directionalLight position={[0, 0, 8]} intensity={mapMode === 'Dark' ? 0.4 : 0.7} color="#ffffff" />
      <directionalLight position={[0, 0, -8]} intensity={mapMode === 'Dark' ? 0.3 : 0.5} color="#ffffff" />

      {/* Seamless Crack-free 3D Earth */}
      <EarthMesh mapMode={mapMode} textures={textures} />

      {/* Atmospheric Rim Glow */}
      <Atmosphere zoomLevel={zoomDist} />

      {/* Major City Badges */}
      {majorCities.map((city) => (
        <CityLabel key={city.name} city={city} zoomDist={zoomDist} camera={camera} />
      ))}

      {/* 3D Curved Threat Trajectory Arcs */}
      {activeArcs.map((arc, i) => (
        <ThreatArc
          key={`arc-${arc.id || i}`}
          startLat={Number(arc.source_lat)}
          startLng={Number(arc.source_long)}
          endLat={Number(arc.dest_lat || 28.7041)}
          endLng={Number(arc.dest_long || 77.1025)}
          color={Number(arc.severity) > 0.5 ? '#ff174f' : '#ffd166'}
          isCritical={Number(arc.severity) > 0.5}
        />
      ))}

      {/* Real-time Kafka Threat Markers */}
      {attacks.map((attack, index) => {
        const lat = Number(attack.source_lat);
        const lng = Number(attack.source_long);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return <AttackMarker key={attack.id ?? `${attack.source_ip}-${index}`} attack={attack} zoomDist={zoomDist} />;
      })}
    </group>
  );
}