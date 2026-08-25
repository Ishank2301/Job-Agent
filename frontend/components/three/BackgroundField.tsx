"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Points() {
  const ref = useRef<THREE.Points>(null!);

  useFrame((state) => {
    if (!ref.current) return;

    ref.current.rotation.y = state.mouse.x * 0.05;
    ref.current.rotation.x = state.mouse.y * 0.05;
  });

  const positions = new Float32Array(300 * 3);

  for (let i = 0; i < 300; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

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