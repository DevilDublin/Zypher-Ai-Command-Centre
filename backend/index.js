
// ===== FFMPEG SILENCER =====
const origStdout = process.stdout.write.bind(process.stdout);
const origStderr = process.stderr.write.bind(process.stderr);

function isFFmpegNoise(str) {
  return (
    str.includes("ffmpeg version") ||
    str.includes("Input #") ||
    str.includes("Stream #") ||
    str.includes("Output #") ||
    str.includes("Press [q]") ||
    str.includes("pcm_s16le") ||
    str.includes("Lavf") ||
    str.includes("Lavc") ||
    str.includes("muxing overhead") ||
    str.includes("size=")
  );
}

process.stdout.write = (str, ...args) => {
  if (!isFFmpegNoise(String(str))) {
    return origStdout(str, ...args);
  }
};

process.stderr.write = (str, ...args) => {
  if (!isFFmpegNoise(String(str))) {
    return origStderr(str, ...args);
  }
};
// ===== END FFMPEG SILENCER =====

import "dotenv/config";
let ACTIVE_MODE = "TEST";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import http from "http";
import nodemailer from "nodemailer";
import { createEvent } from "ics";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import twilio from "twilio";
import { agentReply } from "./brain/agent.js";
import { initVoiceRuntime, setActiveNiche, setCallDirection, setActiveLead } from "./voiceRuntime.js";
import { setIO, onInternal } from "./socketBus.js";
import { createBooking } from "./googleCalendar.js";
import { leadHandler2 } from "./leadHandler2.js";
import { getAdapters } from "./adapters/core/router.js";
import { provisionClient } from "./provisionClient.js";
import { spawn } from "child_process";

dotenv.config();

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());




app.get("/health", (req, res) => {
  res.json({ ok: true, service: "zypher-backend" });
});

app.use(cors());
app.use(express.json());
app.post("/auth/dev", (req, res) => {
  if (req.body?.key === process.env.ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }
  res.status(401).json({ error: "denied" });
});



app.post("/provision", (req, res) => {
  const env = req.headers["x-env"] || "CAMPAIGN";
  const adapters = getAdapters({ environment: env });
  provisionClient(req, res, adapters);
});


// -------------------

app.post("/lead", leadHandler2);

app.post("/lead2", leadHandler2);


app.get("/voice", (req, res) => {
  const twiml = `
<Response>
  <Start>
    <Stream url="wss://zypher-ai-command-centre-production-7b26.up.railway.app/twilio-media" />
  </Start>
  <Pause length="600"/>
</Response>`;
  res.type("text/xml");
  res.send(twiml.trim());
});

app.post("/voice", (req, res) => {
  const twiml = `
<Response>
  <Start>
    <Stream url="wss://zypher-ai-command-centre-production-7b26.up.railway.app/twilio-media"/>
  </Start>
  <Pause length="600"/>
</Response>`;
  res.type("text/xml");
  res.send(twiml.trim());
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://zypheragents.com",
      "https://www.zypheragents.com",
      process.env.PUBLIC_BASE_URL || "https://www.zypheragents.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

setIO(io);



initVoiceRuntime(server, io);

  // ===== PIPELINE TELEMETRY =====
  const PIPELINE_ENABLED = process.env.PIPELINE_ENABLED === "true";

  function emitPipeline() {
    if (!PIPELINE_ENABLED) return;

    try {
      const py = spawn("python3", ["pipeline.py"]);
      let out = "";

      py.stdout.on("data", d => out += d.toString());
      py.on("close", () => {
        try {
          const data = JSON.parse(out.trim());
          io.emit("pipeline:update", data);
        } catch {}
      });

      py.on("error", () => {
        console.warn("⚠️ Pipeline disabled (python not available)");
      });

    } catch {
      console.warn("⚠️ Pipeline disabled (spawn failed)");
    }
  }

  if (PIPELINE_ENABLED) {
    setInterval(emitPipeline, 3000);
    emitPipeline();
  }
  // ===== END PIPELINE TELEMETRY =====

const PORT = process.env.PORT || 3000;

// -------------------
// Twilio
// -------------------
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

let activeCallSid = null;

function terminateCall(reason = "unknown") {
  if (!activeCallSid && reason !== "twilio_hangup") return;
  console.log("☎️ Terminating call:", reason);
  activeCallSid = null;
  try {
    io.emit("notify", "Call ended");
    io.emit("system:idle");
  } catch {}
}


onInternal("call:ended", (data = {}) => {
  terminateCall(data.reason || "twilio_hangup");
});


// -------------------
// Campaign loading
// -------------------
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
    total: campaignLines.length - 1,
    index: 1
  };

console.log(`�� Loaded campaign.csv with ${campaignState.total} leads`);

function getCampaignLead(index) {
  const header = campaignLines[0].split(",");
  const row = campaignLines[index]?.split(",") || [];

  const data = {};
  header.forEach((h, i) => {
    data[h.trim()] = (row[i] || "").replace(/^'|'$/g, "");
  });

  const first = data["First Name"] || "";
  const last = data["Last Name"] || "";
  const name = (first + " " + last).trim();

  const phone =
    data["Mobile Phone"] ||
    data["Work Direct Phone"] ||
    data["Corporate Phone"] ||
    data["Other Phone"] ||
    "";

  return {
    name,
    phone,
    email: data["Email"] || "",
    company: data["Company Name"] || "",
    raw: data
  };
}


const simState = {
  conversation: []
};

// -------------------
// Socket handling
// -------------------

io.on("connection", socket => {
  socket.on("niche:select", (niche) => {
    setActiveNiche(niche);
    io.emit("notify", `🧩 Niche: ${niche}`);
  });

  socket.on("niche:direction", (dir) => {
    setCallDirection(dir);
    io.emit("notify", `📞 Direction: ${dir}`);
  });


    socket.on("mode:update", (mode) => {
    ACTIVE_MODE = mode;
    io.emit("notify", `Mode switched to ${mode}`);
  });

  console.log("Client connected");

  socket.emit("campaign_stats", {
    total: campaignState.total,
    index: campaignState.index,
    remaining: campaignState.total - campaignState.index
  });

  // Campaign index update
  socket.on("campaign_call_start", () => {
    campaignState.index++;
    socket.emit("campaign_stats", {
      total: campaignState.total,
      index: campaignState.index,
      remaining: campaignState.total - campaignState.index
    });
  });

  // Simulator
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

  // ===================
  // REAL CALL CONTROL
  // ===================
  socket.on("call_start", async ({ mode }) => {
    try {
      if (activeCallSid) {
        io.emit("notify", "Call already active");
        return;
      }

      if (mode === "TEST") {
        const call = await twilioClient.calls.create({
            answerOnBridge: true,
          to: process.env.YOUR_PHONE_NUMBER,
          from: process.env.TWILIO_PHONE_NUMBER,
          twiml: `<Response><Start><Stream url="wss://zypher-ai-command-centre-production-7b26.up.railway.app/twilio-media" /></Start><Pause length="600"/></Response>`
        });

        activeCallSid = call.sid;
        io.emit("notify", "Test call started");
      }

      if (mode === "CAMPAIGN") {

            // �� Force campaign brain + identity
            setActiveNiche("campaign_calling");
            setCallDirection("outbound");
            const lead = getCampaignLead(campaignState.index);
            setActiveLead(lead);


          if (!lead || !lead.phone) {
            io.emit("notify", "❌ Campaign lead has no phone number");
            return;
          }

          let phone = String(lead.phone).trim();
          if (phone.startsWith("07")) {
            phone = "+44" + phone.slice(1);
          }
          if (!phone.startsWith("+")) {
            phone = "+" + phone;
          }

          console.log("📞 Campaign dialing:", lead.name, phone);

          const call = await twilioClient.calls.create({
            answerOnBridge: true,
            to: phone,
            from: process.env.TWILIO_PHONE_NUMBER,
            twiml: `<Response><Start><Stream url="wss://zypher-ai-command-centre-production-7b26.up.railway.app/twilio-media" /></Start><Pause length="600"/></Response>`
          });

          activeCallSid = call.sid;

          io.emit("notify", `Calling ${lead.name}`);
          socket.emit("campaign_call_start");
        }
    } catch (err) {
      io.emit("notify", `Call error: ${err.message}`);
    }
  });

  socket.on("call_stop", async () => {
      try {
        if (!activeCallSid) {
          io.emit("notify", "No active call");
          return;
        }

        await twilioClient.calls(activeCallSid).update({ status: "completed" });
        terminateCall("ui_stop");
      } catch (err) {
        io.emit("notify", `Stop error: ${err.message}`);
      }
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

server.listen(process.env.PORT || PORT, () => {
  console.log(`Zypher backend running on http://localhost:${PORT}`);
});