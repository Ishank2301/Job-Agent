"use client";

import { useEffect, useState } from "react";

export type BackendStatus = "checking" | "online" | "retrying" | "offline";

export function useBackendStatus(): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>("checking");

  useEffect(() => {
    let alive = true;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function check() {
      try {
        // Ping FastAPI's auto-generated OpenAPI schema endpoint
        const res = await fetch("http://127.0.0.1:8000/openapi.json", { 
          cache: "no-store",
          method: "HEAD" 
        });
        
        if (!alive) return;
        
        // If the server responds at all, it's online
        if (res.ok || res.status === 404 || res.status === 405) {
          setStatus("online");
          return;
        }
        throw new Error("unhealthy");
      } catch {
        if (!alive) return;
        attempt += 1;
        setStatus(attempt > 2 ? "offline" : "retrying");
        const backoff = Math.min(15000, 1500 * attempt);
        timer = setTimeout(check, backoff);
      }
    }

    check();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return status;
}