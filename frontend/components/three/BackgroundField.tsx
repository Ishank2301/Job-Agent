"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Points() {
  const ref = useRef<THREE.Points>(null!);

  useFrame((state) => {
    if (!ref.current) return;

    ref.current.rotation.y = state.mouse.x * 0.05;
    ref.current.rotation.x = state.mouse.y * 0.05;
  });

  // Deterministic PRNG keeps render pure (react-hooks/purity).
  const positions = useMemo(() => {
    const rand = mulberry32(9001);
    const arr = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      arr[i * 3] = (rand() - 0.5) * 20;
      arr[i * 3 + 1] = (rand() - 0.5) * 20;
      arr[i * 3 + 2] = (rand() - 0.5) * 20;
    }
    return arr;
  }, []);

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#52525b" transparent opacity={0.7} />
    </points>
  );
}

export function BackgroundField() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 opacity-30">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <Points />
      </Canvas>
    </div>
  );
}