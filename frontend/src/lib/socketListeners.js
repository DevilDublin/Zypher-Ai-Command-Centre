import { socket } from "./socket";
import { socketState } from "./socketStore";

let rafPending = false;

function scheduleUpdate(fn) {
  if (rafPending) return;
  rafPending = true;

  requestAnimationFrame(() => {
    rafPending = false;
    fn();
  });
}

export function initSocketListeners() {
  socket.on("connect", () => {
    scheduleUpdate(() => {
      socketState.connected = true;
      socketState.notifications.unshift({
        type: "system",
        text: "Backend connected"
      });
    });
  });

  socket.on("disconnect", () => {
    scheduleUpdate(() => {
      socketState.connected = false;
      socketState.notifications.unshift({
        type: "system",
        text: "Backend disconnected"
      });
    });
  });

  socket.on("pipeline:update", (data) => {
    scheduleUpdate(() => {
      socketState.pipeline = data;
    });
  });

  socket.on("notify", (msg) => {
    scheduleUpdate(() => {
      socketState.notifications.unshift(msg);
    });
  });
}
