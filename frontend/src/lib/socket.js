import { io } from "socket.io-client";

const BACKEND_URL =
  import.meta.env.PROD
    ? "https://zypher-ai-command-centre.up.railway.app"
    : "http://localhost:3000";

export const socket = io(BACKEND_URL, {
  transports: ["websocket"],
  withCredentials: true
});
