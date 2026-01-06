require("dotenv").config();
const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

let lastCalls = [];

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/call/start", async (req, res) => {
  try {
    const call = await client.calls.create({
      to: process.env.TO_PHONE,
      from: process.env.TWILIO_PHONE,
      twiml: `<Response><Say voice="alice">Hello. This is Zypher AI calling. This is a demo.</Say></Response>`
    });

    lastCalls.unshift({
      sid: call.sid,
      time: new Date().toISOString()
    });

    lastCalls = lastCalls.slice(0, 10);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/calls", (req, res) => {
  res.json(lastCalls);
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
