"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardEvent } from "@/lib/types";
import { getWsUrl } from "@/lib/api-client";

export function useEventStream(maxEvents = 50) {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data as string) as DashboardEvent;
        setEvents((prev) => [event, ...prev].slice(0, maxEvents));
      } catch {
        // ignore malformed messages
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [maxEvents]);

  const clear = useCallback(() => setEvents([]), []);

  return { events, connected, clear };
}
