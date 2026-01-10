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

    // ---- OpenAI realtime socket state ----
    let aiOpen = false;
    let responseActive = false;

    // ---- Turn detection / gating ----
    const RMS_THRESHOLD = 200;      // voice activity threshold
    const SPEECH_ARM_MS = 250;      // must speak this long before we consider it a turn
    const SILENCE_MS = 280;         // how long of silence ends the turn

    let armed = false;              // user has spoken enough to count as a turn
    let speechMs = 0;               // accumulated voiced time (real clock)
    let lastSpeechAt = 0;           // last time we saw voice activity (Date.now)
    let silenceTimer = null;        // commits after silence

    // latency timing
    const timing = { commit: 0, firstAudio: 0, lastInbound: 0 };

    const audioBridge = createAudioBridge(ulaw => {
      if (!streamSid) return;

      if (!timing.firstAudio && timing.commit) {
        timing.firstAudio = Date.now();
        console.log("⏱ commit → first audio:", timing.firstAudio - timing.commit, "ms");
      }

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

    function safeAISend(obj) {
      if (!aiOpen) return;
      try { ai.send(JSON.stringify(obj)); } catch {}
    }

    function cancelIfTalking() {
      // Only cancel if a response is actually active, otherwise OpenAI will error-spam
      if (!responseActive) return;
      safeAISend({ type: "response.cancel" });
    }

    function clearTurnState() {
      armed = false;
      speechMs = 0;
      lastSpeechAt = 0;
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = null;
    }

    function commitAndRespond() {
      if (!aiOpen) return;
      if (!armed) return;

      timing.commit = Date.now();
      timing.firstAudio = 0;

      console.log("🛑 silence → commit + response.create");
      if (timing.lastInbound) console.log("⏱ last frame → commit:", Date.now() - timing.lastInbound, "ms");

      // Commit the audio buffer for this user turn
      safeAISend({ type: "input_audio_buffer.commit" });

      // Start assistant response
      // Guard: if a response is still active, do not create another
      if (!responseActive) {
        responseActive = true; // optimistic; will be cleared on response.done
        safeAISend({
          type: "response.create",
          response: {
            modalities: ["audio", "text"]
          }
        });
      }

      clearTurnState();
    }

    ai.on("open", () => {
      aiOpen = true;
      console.log("🧠 OpenAI Realtime connected");

      safeAISend({
        type: "session.update",
        session: {
          instructions: "You are Zypher. You are a friendly AI voice assistant. Respond directly to what the user says. Do not add filler. Do not speak until the user finishes their turn.",
          modalities: ["audio", "text"],
          turn_detection: null,          // we control turn-taking manually
          input_audio_format: "g711_ulaw",
          output_audio_format: "pcm16"
        }
      });

      console.log("✅ OpenAI session configured");
    });

    ai.on("message", msg => {
      let data;
      try { data = JSON.parse(msg.toString()); } catch { return; }

      if (data.type === "response.audio.delta") {
        const pcm = Buffer.from(data.delta, "base64");
        audioBridge.push(pcm);
      }

      // Track response lifecycle so we don't double-create or spam cancel
      if (data.type === "response.created") {
        responseActive = true;
      }
      if (data.type === "response.done") {
        responseActive = false;
      }
      if (data.type === "response.cancelled") {
        responseActive = false;
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

    ai.on("error", e => {
      console.error("OpenAI realtime error:", e.message);
    });

    twilio.on("message", msg => {
      let data;
      try { data = JSON.parse(msg.toString()); } catch { return; }

      if (data.event === "start") {
        streamSid = data.start.streamSid;
        console.log("<0001f9e0> Twilio stream started:", streamSid);
        clearTurnState();
        return;
      }

      if (data.event === "media") {
        timing.lastInbound = Date.now();

        const ulaw = Buffer.from(data.media.payload, "base64");

        // VAD energy estimate
        const pcm = mulaw.decode(ulaw);
        let sum = 0;
        for (let i = 0; i < pcm.length; i++) sum += pcm[i] * pcm[i];
        const rms = Math.sqrt(sum / pcm.length);

        // Always append inbound audio to OpenAI buffer
        if (aiOpen) {
          safeAISend({
            type: "input_audio_buffer.append",
            audio: ulaw.toString("base64")
          });
        }

        // Manual turn detection
        if (rms > RMS_THRESHOLD) {
          // user is talking: cancel assistant if it is talking
          cancelIfTalking();

          const now = Date.now();
          if (lastSpeechAt) {
            const dt = now - lastSpeechAt;
            // clamp dt to avoid spikes if the event loop stalls
            speechMs += Math.max(0, Math.min(dt, 200));
          }
          lastSpeechAt = now;

          if (!armed && speechMs >= SPEECH_ARM_MS) {
            armed = true;
          }

          if (silenceTimer) clearTimeout(silenceTimer);
          silenceTimer = setTimeout(commitAndRespond, SILENCE_MS);
        } else {
          // no voice activity; don't reset immediately — silence timer handles end-of-turn
          // but if we haven't armed yet, allow quick resets so tiny noises don't arm
          if (!armed) {
            speechMs = 0;
            lastSpeechAt = 0;
          }
        }

        return;
      }

      if (data.event === "stop") {
        console.log("<0001f9e0> Twilio stream stopped");
        try { if (silenceTimer) clearTimeout(silenceTimer); } catch {}
        try { ai.close(); } catch {}
        return;
      }
    });

    twilio.on("close", () => {
      console.log("<0001f9e0> Twilio WS closed");
      try { if (silenceTimer) clearTimeout(silenceTimer); } catch {}
      try { ai.close(); } catch {}
    });
  });
}
