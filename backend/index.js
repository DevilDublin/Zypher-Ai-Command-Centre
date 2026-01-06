import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { agentReply } from "./brain/agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = 3000;

// -------------------
// In-memory states
const campaignPath = path.join(__dirname, "campaign.csv");

if (!fs.existsSync(campaignPath)) {
  console.error("❌ campaign.csv NOT FOUND — refusing to start");
  process.exit(1);
}

const campaignLines = fs
  .readFileSync(campaignPath, "utf-8")
  .split("\n")
  .filter(Boolean);

const campaignState = {
  total: campaignLines.length,
  index: 0
};

console.log(`📊 Loaded campaign.csv with ${campaignState.total} leads`);
// -------------------

const simState = {
  conversation: []
};

// -------------------
// Socket handling
// -------------------
io.on("connection", socket => {
  console.log("Client connected");

  socket.emit("campaign_stats", {
    total: campaignState.total,
    index: campaignState.index,
    remaining: campaignState.total - campaignState.index
  });

  socket.on("campaign_call_start", () => {
    campaignState.index++;
    socket.emit("campaign_stats", {
      total: campaignState.total,
      index: campaignState.index,
      remaining: campaignState.total - campaignState.index
    });
  });

  socket.on("sim_start", () => {
    simState.conversation = [];
    const greeting = "Good afternoon, this is Zypher calling. How can I help you today?";
    simState.conversation.push({ role: "assistant", content: greeting });
    socket.emit("sim_agent", greeting);
  });

  socket.on("sim_user", async msg => {
    if (!msg) return;
    simState.conversation.push({ role: "user", content: msg });
    const reply = await agentReply(simState.conversation);
    simState.conversation.push({ role: "assistant", content: reply });
    emitLines(socket, reply);
  });
});

function emitLines(socket, text) {
  const lines = text.split(/(?<=[.!?])\s+/);
  lines.forEach((line, i) => {
    setTimeout(() => {
      socket.emit("sim_agent", line);
    }, i * 600);
  });
}

server.listen(PORT, () => {
  console.log(`Zypher backend running on http://localhost:${PORT}`);
});
