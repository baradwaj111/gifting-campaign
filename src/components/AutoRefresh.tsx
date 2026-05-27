"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  // null on first render (SSR) — avoids server/client time mismatch
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time only on the client
    setLastRefresh(new Date());
    const timer = setInterval(() => {
      router.refresh();
      setLastRefresh(new Date());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [router, intervalMs]);

  return (
    <span className="text-xs text-slate-400">
      Auto-refreshes every {intervalMs / 1000}s
      {lastRefresh && ` · Last: ${lastRefresh.toLocaleTimeString()}`}
    </span>
  );
}
