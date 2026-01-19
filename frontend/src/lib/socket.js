import { io } from "socket.io-client";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  null;

export let socket = null;

if (BACKEND_URL) {
  socket = io(BACKEND_URL, {
  transports: ["polling", "websocket"],
  autoConnect: true,
});
}
