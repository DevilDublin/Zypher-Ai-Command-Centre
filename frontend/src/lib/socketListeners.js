import { socket } from "./socket";
import { socketState } from "./socketStore";

export function initSocketListeners() {
  socket.on("connect", () => {
    socketState.connected = true;
    socketState.notifications.unshift({
      message: "Socket connected",
      time: new Date().toLocaleTimeString(),
    });
    console.log("🟢 Socket connected");
  });

  socket.on("disconnect", () => {
    socketState.connected = false;
    socketState.notifications.unshift({
      message: "Socket disconnected",
      time: new Date().toLocaleTimeString(),
    });
    console.log("🔴 Socket disconnected");
  });

  // backend emits: { connected, mode }
  socket.on("system:status", (data = {}) => {
    if (typeof data.connected === "boolean") socketState.connected = data.connected;
    if (typeof data.mode === "string") socketState.mode = data.mode;
  });

  // backend emits: { total, processed, remaining } (optional)
  socket.on("analytics:update", (data = {}) => {
    socketState.analytics = {
      total: Number(data.total ?? socketState.analytics.total) || 0,
      processed: Number(data.processed ?? socketState.analytics.processed) || 0,
      remaining: Number(data.remaining ?? socketState.analytics.remaining) || 0,
    };
  });

  // ✅ YOUR CURRENT BACKEND emits campaign_stats: { total, index, remaining }
  socket.on("campaign_stats", (data = {}) => {
    socketState.analytics = {
      total: Number(data.total) || 0,
      processed: Number(data.index) || 0,
      remaining: Number(data.remaining) || 0,
    };
  });

  socket.on("notification", (msg) => {
    socketState.notifications.unshift({
      message: String(msg),
      time: new Date().toLocaleTimeString(),
    });
  });
}
