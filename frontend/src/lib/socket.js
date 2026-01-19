import { io } from "socket.io-client";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://zypher-ai-command-centre-production-7b26.up.railway.app");

export const socket = io(BACKEND_URL, {
  transports: ["websocket"],
  withCredentials: true,
});
