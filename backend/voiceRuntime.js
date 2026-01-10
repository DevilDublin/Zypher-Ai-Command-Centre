
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import { createAudioBridge } from "./audioBridge.js";
import mulaw from "mulaw-js";

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
    let alive = TrueBool();
    let aiOpen = false;
      let lastInbound = 0;

    // timing
    const timing = { commit: 0, firstAudio: 0 };

    // send outbound audio to Twilio
    const audioBridge = createAudioBridge(ulaw => {
      if (!streamSid || !alive.v) return;

      if (!timing.firstAudio && timing.commit) {
        timing.firstAudio = Date.now();
        console.log("⏱ commit → first audio:", (timing.firstAudio - timing.commit), "ms");
      }

      try {
        twilio.send(JSON.stringify({
          event: "media",
          streamSid,
          media: { track: "outbound", payload: ulaw.toString("base64") }
        }));
      } catch {}
    });

    // OpenAI Realtime socket
    const ai = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-realtime-mini",
      {
        headers: {
          Authorization: "Bearer " + process.env.OPENAI_API_KEY,
          "OpenAI-Beta": "realtime=v1"
        }
      }
    );

    function safeAISend(obj) {
      if (!aiOpen) return;
      ai.send(JSON.stringify(obj));
    }

    ai.on("open", () => {
      aiOpen = true;
      console.log("🧠 OpenAI Realtime connected");

      // IMPORTANT: configure only. DO NOT create a response on connect.
      safeAISend({
        type: "session.update",
        session: {
          instructions: "You are Zypher AI. Speak naturally, quickly, and conversationally. Do not mention system details.",
          modalities: ["audio","text"],
          turn_detection: null,
          // We are sending Twilio μ-law 8k frames in input_audio_buffer.append:
          input_audio_format: "g711_ulaw",
          // We want PCM16 audio back which our audioBridge expects:
          output_audio_format: "pcm16"
        }
      });

      console.log("✅ OpenAI session configured (no auto-speech).");
    });

    ai.on("message", msg => {
      let data;
      try { data = JSON.parse(msg.toString()); } catch { return; }

      if (data.type === "response.audio.delta") {
        const pcm = Buffer.from(data.delta, "base64");
        audioBridge.push(pcm);
      }

      if (data.type === "response.output_text.delta") {
        // optional: uncomment if you want text streaming logs
        // process.stdout.write(data.delta);
      }

      if (data.type === "error") {
        console.log("❌ OpenAI error:", data.error?.message || JSON.stringify(data));
      }
    });

    ai.on("close", () => {
      aiOpen = false;
      if (alive.v) console.log("🧠 OpenAI Realtime closed");
    });

    ai.on("error", e => {
      console.error("OpenAI realtime error:", e.message);
    });

    // Twilio → OpenAI turn handling
    const SILENCE_MS = 280;
    let silenceTimer = null;

    function commitAndRespond() {
      if (!aiOpen) return;

      timing.commit = Date.now();
      timing.firstAudio = 0;

      console.log("🛑 silence → commit + response.create");
        if (lastInbound) console.log("⏱ last frame → commit:", Date.now() - lastInbound, "ms");
      safeAISend({ type: "input_audio_buffer.commit" });

      // THIS is what you were missing: create the assistant response after commit
      safeAISend({
        type: "response.create",
        response: {
          modalities: ["audio","text"]
        }
      });
    }

    twilio.on("message", msg => {
      let data;
      try { data = JSON.parse(msg.toString()); } catch { return; }

      if (data.event === "start") {
        streamSid = data.start.streamSid;
        console.log("<0001f9e0> Twilio stream started:", streamSid);
        return;
      }

      if (data.event === "media") {
          lastInbound = Date.now();


        const ulaw = Buffer.from(data.media.payload, "base64");

        const pcm = mulaw.decode(ulaw);
        let sum = 0;
        for (let i = 0; i < pcm.length; i++) sum += pcm[i] * pcm[i];
        const rms = Math.sqrt(sum / pcm.length);

        // speech-based turn detection (Ember-style)
        if (rms > 200) {
          if (silenceTimer) clearTimeout(silenceTimer);
          silenceTimer = setTimeout(commitAndRespond, SILENCE_MS);
        }




        if (aiOpen) {
          safeAISend({
            type: "input_audio_buffer.append",
            audio: ulaw.toString("base64")
          });
        }
        return;
      }

      if (data.event === "stop") {
        console.log("<0001f9e0> Twilio stream stopped");
        alive.v = false;
        try { if (silenceTimer) clearTimeout(silenceTimer); } catch {}
        try { ai.close(); } catch {}
        return;
      }
    });

    twilio.on("close", () => {
      console.log("<0001f9e0> Twilio WS closed");
      alive.v = false;
      try { if (silenceTimer) clearTimeout(silenceTimer); } catch {}
      try { ai.close(); } catch {}
    });
  });
}

// tiny mutable boolean helper (avoids accidental reassign issues)
function TrueBool() { return { v: true }; }