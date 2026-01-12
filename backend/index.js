
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
import { initVoiceRuntime, setActiveNiche, setCallDirection } from "./voiceRuntime.js";
import { setIO } from "./socketBus.js";
import { createBooking } from "./googleCalendar.js";

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
app.use(cors());
app.use(express.json());

// -------------------

app.post("/lead", async (req, res) => {
  console.log("🧪 /lead HEADERS:", req.headers);

  const lead = req.body;
  console.log("📧 NEW LEAD:", JSON.stringify(lead, null, 2));

  try {
    const text = `
New Zypher Lead

Niche: ${lead.niche}
Direction: ${lead.direction}

Name: ${lead.name}
Phone: ${lead.phone}
Email: ${lead.email}

Details:
${JSON.stringify(lead.data, null, 2)}

Calendar: Provisional slot booked (time to be confirmed)
`;
    const start = new Date(Date.now() + 60*60*1000);
    const end = new Date(start.getTime() + 30*60000);

      // 1) Internal Zypher ops email
      await mailer.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `🧠 Zypher Lead – ${lead.niche}`,
        text
      });

      // 2) Client confirmation email
      await mailer.sendMail({
        from: `Zypher Agents <${process.env.EMAIL_USER}>`,
        to: lead.email,
        subject: "Your Zypher consultation is booked",
        text: `Hi ${lead.name},

Thanks for speaking with Zypher.

We've provisionally booked your consultation for:
${start.toLocaleString("en-GB")}

Niche: ${lead.niche}

If you need to reschedule, just reply to this email.

— Zypher Agents`
      });


    await createBooking({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      niche: lead.niche,
      start: start.toISOString(),
      end: end.toISOString()
    });

    console.log("📅 Google Calendar booking created");

    console.log("📤 Lead email sent");
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
  }

  res.json({ ok: true });
});

// Twilio Voice Webhook (TwiML)
// -------------------
app.post("/voice", (req, res) => {
  console.log("📞 [VOICE] Incoming call webhook");

  const twiml = `
<Response>
  <Connect>
    <Stream url="wss://immunological-unmaliciously-lavette.ngrok-free.dev/twilio-media" />
  </Connect>
</Response>
`; 

  res.type("text/xml");
  res.send(twiml.trim());
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

setIO(io);
initVoiceRuntime(server, io);
const PORT = 3000;

// -------------------
// Twilio
// -------------------
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

let activeCallSid = null;

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
          to: process.env.YOUR_PHONE_NUMBER,
          from: process.env.TWILIO_PHONE_NUMBER,
          twiml: `<Response><Connect><Stream url="wss://immunological-unmaliciously-lavette.ngrok-free.dev/twilio-media" /></Connect></Response>`
        });

        activeCallSid = call.sid;
        io.emit("notify", "Test call started");
      }

      if (mode === "CAMPAIGN") {
          const lead = getCampaignLead(campaignState.index);

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
            to: phone,
            from: process.env.TWILIO_PHONE_NUMBER,
            twiml: `<Response><Connect><Stream url="wss://immunological-unmaliciously-lavette.ngrok-free.dev/twilio-media" /></Connect></Response>`
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
      activeCallSid = null;
      io.emit("notify", "Call ended");
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

server.listen(PORT, () => {
  console.log(`Zypher backend running on http://localhost:${PORT}`);
});