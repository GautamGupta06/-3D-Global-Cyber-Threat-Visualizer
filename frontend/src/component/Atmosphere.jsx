import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Custom GLSL atmosphere shader — glowing rim when viewed from space
const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  uniform float uOpacity;
  void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    gl_FragColor = vec4(0.1, 0.55, 1.0, 1.0) * intensity * uOpacity;
  }
`;

export default function Atmosphere({ zoomLevel = 6 }) {
  const meshRef = useRef();
  const { camera } = useThree();

  const uniforms = useMemo(() => ({
    uOpacity: { value: 1.0 }
  }), []);

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, [uniforms]);

  // Fade atmosphere smoothly to 0 as camera approaches Earth surface
  useFrame(() => {
    const dist = camera.position.length();
    // Fully visible at orbit (> 4.5), completely faded out at surface (< 2.6)
    const factor = THREE.MathUtils.clamp((dist - 2.5) / 2.0, 0.0, 1.0);
    uniforms.uOpacity.value = factor * 0.75;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.14, 64, 64]} />
      <primitive object={atmosphereMaterial} attach="material" />
    </mesh>
  );
}
