import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("VITE_BACKEND_URL is not defined");
}

export const socket = io(BACKEND_URL, {
  path: "/socket.io",
  transports: ["websocket"],
  withCredentials: true,
});

// DEBUG: expose socket globally
window.socket = socket;