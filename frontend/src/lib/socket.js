import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.PROD
    ? "https://zypher-ai-command-centre-production-7b26.up.railway.app"
    : "http://localhost:3000";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
});
