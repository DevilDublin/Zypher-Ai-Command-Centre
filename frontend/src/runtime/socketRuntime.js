import { socket } from "../lib/socket";

/**
 * This file ONLY wires live socket events to the existing UI.
 * It does NOT touch layout or React state.
 */

export function initSocketRuntime() {
  // SYSTEM STATUS
  socket.on("system:status", (data) => {
    const status = document.querySelector("[data-system-status]");
    if (status) {
      status.textContent = data.connected ? "Backend: Connected" : "Backend: Disconnected";
    }
  });

  // NOTIFICATIONS
  socket.on("notification", (msg) => {
    const box = document.querySelector("[data-notifications]");
    if (!box) return;

    const line = document.createElement("div");
    line.textContent = msg;
    line.style.opacity = "0.85";
    box.prepend(line);
  });
}
