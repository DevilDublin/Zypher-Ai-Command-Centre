import { useEffect, useState } from "react";
import { socketState } from "./socketStore";

export function useAnalytics() {
  const [analytics, setAnalytics] = useState(socketState.analytics);

  useEffect(() => {
    // simple sync loop (no UI rewrites, no extra libs)
    const t = setInterval(() => {
      setAnalytics({ ...socketState.analytics });
    }, 150);

    return () => clearInterval(t);
  }, []);

  return analytics;
}
