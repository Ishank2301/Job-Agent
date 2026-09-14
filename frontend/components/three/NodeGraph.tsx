"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Deterministic PRNG so geometry generation stays pure during render
 * (react-hooks/purity) while still looking organic.
 */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CONNECTION_DISTANCE = 2.35;

function NetworkGraph({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null!);

  const { nodePositions, linePositions } = useMemo(() => {
    const rand = mulberry32(count * 2654435761);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * 18;
      positions[i * 3 + 1] = (rand() - 0.5) * 12;
      positions[i * 3 + 2] = (rand() - 0.5) * 12;
    }
    const lines: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < CONNECTION_DISTANCE) {
          lines.push(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2],
            positions[j * 3],
            positions[j * 3 + 1],
            positions[j * 3 + 2],
          );
        }
      }
    }
    return { nodePositions: positions, linePositions: new Float32Array(lines) };
  }, [count]);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.03;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.12,
      0.04,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      state.pointer.x * 0.06,
      0.04,
    );
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#8b5cf6" transparent opacity={0.6} sizeAttenuation />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#3f3f46" transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}

export function NodeGraph() {
  // Client-only (imported via <Ambient3D /> with ssr:false), so window is
  // always available at first render — no mount effect needed.
  const [nodeCount] = useState(() =>
    typeof window === "undefined"
      ? 0
      : window.matchMedia("(max-width: 768px), (pointer: coarse)").matches
        ? 90
        : 220,
  );
  const [reducedMotion] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  if (nodeCount === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.13] dark:opacity-40"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 45 }}
        dpr={[1, 1.5]}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{ antialias: false, powerPreference: "low-power" }}
      >
        <ambientLight intensity={0.35} />
        <NetworkGraph key={nodeCount} count={nodeCount} />
      </Canvas>
    </div>
  );
}
