"use client";

import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/api";

export type BackendStatus = "checking" | "online" | "retrying" | "offline";

export interface SystemState {
  status: BackendStatus;
  dryRun: boolean;
}

const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export function useBackendStatus(): SystemState {
  const [state, setState] = useState<SystemState>({
    status: "checking",
    dryRun: true,
  });

  useEffect(() => {
    let alive = true;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function check() {
      try {
        // Ping FastAPI's OpenAPI schema endpoint — any response means up.
        const res = await fetch(`${BACKEND_ORIGIN}/openapi.json`, {
          cache: "no-store",
          method: "HEAD",
        });

        if (!alive) return;

        if (res.ok || res.status === 404 || res.status === 405) {
          setState({ status: "online", dryRun: true });
          try {
            const settings = await fetch(`${API_BASE_URL}/settings`, {
              cache: "no-store",
            });
            if (alive && settings.ok) {
              const data = (await settings.json()) as { dry_run?: boolean };
              setState({ status: "online", dryRun: data.dry_run ?? true });
            }
          } catch {
            // Settings endpoint is optional — the health ping is enough.
          }
          return;
        }
        throw new Error("unhealthy");
      } catch {
        if (!alive) return;
        attempt += 1;
        setState({
          status: attempt > 2 ? "offline" : "retrying",
          dryRun: true,
        });
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

  return state;
}
