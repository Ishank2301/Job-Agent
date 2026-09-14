"use client";

import dynamic from "next/dynamic";

const NodeGraph = dynamic(
  () => import("@/components/three/NodeGraph").then((m) => m.NodeGraph),
  { ssr: false },
);

/**
 * Client-only 3D ambient background (three.js is heavy — keep it out of
 * the server bundle and off the critical path).
 */
export function Ambient3D() {
  return <NodeGraph />;
}
