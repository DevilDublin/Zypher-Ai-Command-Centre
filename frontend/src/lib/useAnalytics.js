import { useEffect, useState } from "react";
import { subscribeAnalytics } from "./analytics";

export function useAnalytics() {
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    remaining: 0,
  });

  useEffect(() => {
    const unsub = subscribeAnalytics(setStats);
    return () => unsub();
  }, []);

  return stats;
}
