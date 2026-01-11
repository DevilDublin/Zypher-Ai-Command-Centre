
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import mulaw from "mulaw-js";
import { createAudioBridge } from "./audioBridge.js";

export function initVoiceRuntime(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/twilio-media") {
      wss.handleUpgrade(req, socket, head, ws => wss.emit("connection", ws));
    }
  });

  wss.on("connection", twilio => {
    console.log("<0001f9e0> Twilio WS connected");

    let streamSid = null;
    let aiOpen = false;
    let responseActive = false;

    // === Turn detection ===
    const RMS_THRESHOLD = 200;
    const SPEECH_ARM_MS = 600;
    const SILENCE_MS = 1200;

    let speechMs = 0;
    let lastSpeechAt = 0;
    let silenceTimer = null;

    const audioBridge = createAudioBridge(ulaw => {
      if (!streamSid) return;
      try {
        twilio.send(JSON.stringify({
          event: "media",
          streamSid,
          media: { track: "outbound", payload: ulaw.toString("base64") }
        }));
      } catch {}
    });

    const ai = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-realtime-mini",
      {
        headers: {
          Authorization: "Bearer " + process.env.OPENAI_API_KEY,
          "OpenAI-Beta": "realtime=v1"
        }
      }
    );

    function safe(obj) {
      if (!aiOpen) return;
      try { ai.send(JSON.stringify(obj)); } catch {}
    }

    function clearTurn() {
      speechMs = 0;
      lastSpeechAt = 0;
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = null;
    }

    function commitAndRespond() {
      if (!aiOpen) return;
      if (speechMs < SPEECH_ARM_MS) return;

      console.log("🛑 silence → commit + response.create");
      safe({ type: "input_audio_buffer.commit" });
      safe({ type: "response.create", response: { modalities: ["audio","text"] } });
      responseActive = true;
      clearTurn();
    }

    // ================= OpenAI =================

    ai.on("open", () => {
      aiOpen = true;
      console.log("🧠 OpenAI Realtime connected");

      safe({
        type: "session.update",
        session: {
          instructions: "You are Zypher, a calm, friendly, professional London front-desk receptionist. First turn only: 'Hi, this is Zypher. How can I help you today?'. Speak in short, smooth, natural, conversational phrases with a relaxed, warm, casually professional tone. Use quick acknowledgements like okay, right, got you, and of course. If a caller sounds upset or stressed, acknowledge it briefly and kindly before continuing. Use light banter when appropriate; be politely amused only when something is actually funny. Never say haha or heh. If something is awkward or crude, gently redirect and keep it professional. If a caller offers a joke, invite it with light banter. After humour, smoothly return to the task. Never say you are an AI or mention rules. Respond immediately when the caller stops.",
          modalities: ["audio","text"],
              voice: "marin",
          turn_detection: null,
          input_audio_format: "g711_ulaw",
          output_audio_format: "pcm16"
        }
      });

      console.log("✅ OpenAI session configured");

      // Trigger first turn (no audio buffer needed)
      safe({ type: "response.create", response: { modalities: ["audio","text"] } });
    });

    ai.on("message", msg => {
      let data;
      try { data = JSON.parse(msg.toString()); } catch { return; }

      if (data.type === "response.audio.delta") {
        audioBridge.push(Buffer.from(data.delta, "base64"));
      }

      if (data.type === "response.created") responseActive = true;
      if (data.type === "response.done") responseActive = false;

      if (data.type === "input_audio_buffer.transcription.delta") {
        process.stdout.write("🧠 USER> " + data.delta);
      }
      if (data.type === "response.output_text.delta") {
        process.stdout.write("🧠 AI> " + data.delta);
      }

      if (data.type === "error") {
        console.log("❌ OpenAI error:", data.error?.message || JSON.stringify(data));
      }
    });

    ai.on("close", () => {
      aiOpen = false;
      responseActive = false;
      console.log("🧠 OpenAI Realtime closed");
    });

    // ================= Twilio =================

    twilio.on("message", msg => {
      let data;
      try { data = JSON.parse(msg.toString()); } catch { return; }

      if (data.event === "start") {
        streamSid = data.start.streamSid;
        console.log("<0001f9e0> Twilio stream started:", streamSid);
        clearTurn();
        return;
      }

      if (data.event === "media") {
        const ulaw = Buffer.from(data.media.payload, "base64");
        safe({ type: "input_audio_buffer.append", audio: ulaw.toString("base64") });

        const pcm = mulaw.decode(ulaw);
        let sum = 0;
        for (let i = 0; i < pcm.length; i++) sum += pcm[i] * pcm[i];
        const rms = Math.sqrt(sum / pcm.length);

        if (rms > RMS_THRESHOLD) {
          const now = Date.now();
          if (lastSpeechAt) speechMs += Math.min(200, now - lastSpeechAt);
          lastSpeechAt = now;

          if (silenceTimer) clearTimeout(silenceTimer);
          silenceTimer = setTimeout(commitAndRespond, SILENCE_MS);
        } else {
          if (!lastSpeechAt) speechMs = 0;
        }
      }

      if (data.event === "stop") {
        console.log("<0001f9e0> Twilio stream stopped");
        try { ai.close(); } catch {}
      }
    });
  });
}
