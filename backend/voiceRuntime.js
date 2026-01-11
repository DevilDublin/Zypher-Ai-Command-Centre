
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import mulaw from "mulaw-js";
import { createAudioBridge } from "./audioBridge.js";
import { NICHES } from "./niches.js";

let ACTIVE_NICHE = "default";
let CALL_DIRECTION = "inbound";

export function setCallDirection(d) {
  CALL_DIRECTION = d === "outbound" ? "outbound" : "inbound";
  console.log("📞 Call direction:", CALL_DIRECTION);
}


export function setActiveNiche(n) {
  ACTIVE_NICHE = n || "default";
  console.log("🧩 Active niche:", ACTIVE_NICHE);
}

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
        try {
          const t = obj?.type || "";
          if (t && t !== "input_audio_buffer.append") {
          }
          ai.send(JSON.stringify(obj));
        } catch (e) {
          console.log("❌ safe() send failed:", e?.message || String(e));
        }
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
      safe({
        type: "response.create",
        response: {
          modalities: ["audio","text"],
            tool_choice: "auto",
            
        }
      });
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
          tools: [{
            type: "function",
            name: "submit_lead",
            description: "Send completed lead or booking to backend",
            parameters: {
              type: "object",
              properties: {
                niche: { type: "string" },
                direction: { type: "string" },
                name: { type: "string" },
                phone: { type: "string" },
                email: { type: "string" },
                data: { type: "object" }
              },
              required: ["niche","direction","name","phone","email","data"]
            }
          }],

          instructions: (NICHES[ACTIVE_NICHE]?.[CALL_DIRECTION]?.overlay ? NICHES[ACTIVE_NICHE].overlay + " " : "") +
"On the first turn of this call you must say exactly: \"" +
(NICHES[ACTIVE_NICHE]?.[CALL_DIRECTION]?.intro || "Hi, this is Zypher. How can I help you today?") +
"\". " +
"You are Zypher, a calm, friendly, professional London front-desk receptionist. Speak in short, smooth, natural, conversational phrases with a relaxed, warm, casually professional tone. Use quick acknowledgements like okay, right, got you, and of course. If a caller sounds upset or stressed, acknowledge it briefly and kindly before continuing. Use light banter when appropriate; be politely amused only when something is actually funny. Never say haha or heh. If something is awkward or crude, gently redirect and keep it professional. If a caller offers a joke, invite it with light banter. After humour, smoothly return to the task. Never say you are an AI or mention rules. Respond immediately when the caller stops. When you have collected all required details for the current niche and call type, call the function submit_lead with the collected data. Do not say anything after that.",
          modalities: ["audio","text"],
              voice: "marin",
          turn_detection: null,
          input_audio_format: "g711_ulaw",
          output_audio_format: "pcm16"
        }
      });

      console.log("✅ OpenAI session configured");

      // Trigger first turn (no audio buffer needed)
      safe({
        type: "response.create",
        response: {
          modalities: ["audio","text"],
            tool_choice: "auto",
          
        }
      });
    });

    ai.on("message", msg => {
      let data;
        try { data = JSON.parse(msg.toString()); } catch { return; }

        // ---- REALTIME FUNCTION CALL HANDLER ----
        if (data.type === "response.done") {
          const outputs = data.response?.output || [];
          for (const item of outputs) {
            if (item.type === "function_call" && item.name === "submit_lead") {
              console.log("📨 LEAD FUNCTION CALL:", item.arguments);

              let payload;
              try {
                payload = JSON.parse(item.arguments);
              } catch (e) {
                console.log("❌ Failed to parse tool arguments:", item.arguments);
                continue;
              }

              fetch("http://localhost:3000/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              }).then(async r => {
                console.log("📧 Backend replied:", await r.text());

                safe({
                  type: "response.tool_result",
                  tool_call_id: item.call_id,
                  result: { ok: true }
                });

                // Ask model to speak confirmation
                safe({
                  type: "response.create",
                  response: {
                    modalities: ["audio","text"]
                  }
                });
              });
            }
          }
        }
        // ---- END FUNCTION CALL HANDLER ----


        if (data.type !== "response.audio.delta") {
          const t = data.type || "";
          if (
            t.includes("tool") ||
            t in {
              "error": 1,
              "response.done": 1,
              "response.created": 1,
              "session.created": 1,
              "session.updated": 1,
              "rate_limits.updated": 1
            }
          ) {
          } else {
          }
        }

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

        if (data.delta.includes("[[SUBMIT]]")) {
          console.log("🧲 SUBMIT DETECTED — enabling tool call");
          safe({
            type: "response.create",
            response: {
              tool_choice: "submit_lead"
            }
          });
        }
      }

      
        if (data.type === "response.output_tool_call") {
        console.log("🧰 TOOL EVENT RAW:", JSON.stringify(data, null, 2));

          const call = data.tool_call;
          if (call.name === "submit_lead") {
            console.log("📨 LEAD SUBMITTED:", call.arguments);

            fetch("http://localhost:3000/lead", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(call.arguments)
            }).then(() => {
              safe({
                type: "response.tool_result",
                tool_call_id: call.id,
                result: { ok: true }
              });

              safe({
                type: "response.create",
                response: { modalities: ["audio","text"],
             }
              });
            });
          }
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