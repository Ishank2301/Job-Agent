"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const NODE_COUNT = 220;
const CONNECTION_DISTANCE = 2.35;

function NetworkGraph() {
  const group = useRef<THREE.Group>(null!);

  const { nodePositions, linePositions } = useMemo(() => {
    const positions = new Float32Array(NODE_COUNT * 3);

    for (let i = 0; i < NODE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }

    const lines: number[] = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      const x1 = positions[i * 3];
      const y1 = positions[i * 3 + 1];
      const z1 = positions[i * 3 + 2];

      for (let j = i + 1; j < NODE_COUNT; j++) {
        const x2 = positions[j * 3];
        const y2 = positions[j * 3 + 1];
        const z2 = positions[j * 3 + 2];

        const distance = Math.sqrt(
          (x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2
        );

        if (distance < CONNECTION_DISTANCE) {
          lines.push(x1, y1, z1, x2, y2, z2);
        }
      }
    }

    return {
      nodePositions: positions,
      linePositions: new Float32Array(lines),
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    group.current.rotation.y += delta * 0.02;

    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.08,
      0.05
    );

    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      state.pointer.x * 0.04,
      0.05
    );
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[nodePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color="#71717a"
          transparent
          opacity={0.75}
          sizeAttenuation
        />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#3f3f46"
          transparent
          opacity={0.28}
        />
      </lineSegments>
    </group>
  );
}

export function NodeGraph() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 opacity-35">
      <Canvas
        camera={{
          position: [0, 0, 9],
          fov: 45,
        }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.35} />
        <NetworkGraph />
      </Canvas>
    </div>
  );
}