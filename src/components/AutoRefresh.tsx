"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
      setLastRefresh(new Date());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [router, intervalMs]);

  return (
    <span className="text-xs text-slate-400">
      Auto-refreshes every {intervalMs / 1000}s · Last:{" "}
      {lastRefresh.toLocaleTimeString()}
    </span>
  );
}
