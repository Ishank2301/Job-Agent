"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const FluidGridShader = {
  vertexShader: `
    varying vec2 vUv;
    uniform vec2 uMouse;
    uniform float uTime;
    varying float vGlow;
    void main() {
      vUv = uv;
      vec3 pos = position;
      float dist = distance(uv, uMouse);
      if (dist < 0.28) {
        float wave = sin(dist * 31.41 - uTime * 4.0) * 0.5 + 0.5;
        pos.z += (1.0 - (dist / 0.28)) * 0.14 * wave;
      }
      vGlow = pos.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying float vGlow;
    uniform float uTime;
    uniform vec3 uBaseColor;
    uniform vec3 uAccentColor;
    void main() {
      vec2 dotGrid = fract(vUv * 75.0);
      float dotMask = smoothstep(0.46, 0.50, length(dotGrid - 0.5));
      vec3 color = mix(uBaseColor, uAccentColor, clamp(vGlow * 4.0, 0.0, 1.0));
      color += vec3(0.05, 0.48, 0.37) * vGlow * 1.5;
      gl_FragColor = vec4(color * (1.0 - dotMask * 0.85), 0.92);
    }
  `
};

function FluidSurfaceMesh() {
  const { size } = useThree();
  const meshRef = useRef(null);
  const customUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uBaseColor: { value: new THREE.Color("#131211") },
    uAccentColor: { value: new THREE.Color("#3ecf9a") }
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const { material } = meshRef.current;
    material.uniforms.uTime.value = state.clock.getElapsedTime();
    const targetX = (state.pointer.x + 1) / 2;
    const targetY = (state.pointer.y + 1) / 2;
    material.uniforms.uMouse.value.x += (targetX - material.uniforms.uMouse.value.x) * 0.08;
    material.uniforms.uMouse.value.y += (targetY - material.uniforms.uMouse.value.y) * 0.08;
  });

  return (
    <mesh ref={meshRef} scale={[size.width / 100, size.height / 100, 1]}>
      <planeGeometry args={[100, 100, 64, 64]} />
      <shaderMaterial vertexShader={FluidGridShader.vertexShader} fragmentShader={FluidGridShader.fragmentShader} uniforms={customUniforms} />
    </mesh>
  );
}

export default function LuxuryVisualCanvas() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-40 w-full h-full bg-[#131211]">
      <Canvas camera={{ position: [0, 0, 50], fof: 45 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <FluidSurfaceMesh />
      </Canvas>
    </div>
  );
}
