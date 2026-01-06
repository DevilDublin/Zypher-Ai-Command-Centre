import { socket } from "./socket";
import { socketState } from "./socketStore";

export function initSocketListeners() {
  socket.on("connect", () => {
    socketState.connected = true;
    console.log("🟢 Socket connected");
  });

  socket.on("disconnect", () => {
    socketState.connected = false;
    console.log("🔴 Socket disconnected");
  });

  socket.on("system:status", (data) => {
    socketState.connected = data.connected;
    socketState.mode = data.mode;
  });

  socket.on("analytics:update", (data) => {
    socketState.analytics = data;
  });

  socket.on("notification", (msg) => {
    socketState.notifications.unshift({
      message: msg,
      time: new Date().toLocaleTimeString(),
    });
  });
}
