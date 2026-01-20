
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import mulaw from "mulaw-js";
import { createAudioBridge } from "./audioBridge.js";
import { NICHES } from "./niches.js";
import { getIO, emitInternal } from "./socketBus.js";

let FLOW_IO = null;
const FLOW_BUFFER = [];

function emitFlow(msg) {
  try {
    const payload = (typeof msg === "string")
        ? { event: msg, lead: ACTIVE_LEAD }
        : { ...msg, lead: msg.lead ?? ACTIVE_LEAD };

      FLOW_BUFFER.push(payload);
if (FLOW_BUFFER.length > 200) FLOW_BUFFER.shift();
FLOW_IO?.emit("flow:event", payload);
  } catch {}
}


let ACTIVE_NICHE = "default";

let ACTIVE_LEAD = null;

let LEAD_SUBMITTED = false;

export function setActiveLead(lead) {
  ACTIVE_LEAD = lead;
  console.log("👤 Active lead:", lead?.name || "none");
}
let CALL_DIRECTION = "inbound";

export function setCallDirection(d) {
  CALL_DIRECTION = d === "outbound" ? "outbound" : "inbound";
  console.log("📞 Call direction:", CALL_DIRECTION);
}


export function setActiveNiche(n) {
  ACTIVE_NICHE = n || "default";
  console.log("🧩 Active niche:", ACTIVE_NICHE);
}

  let CALL_LEAD = null;export function initVoiceRuntime(server, io) {
  let aiOpen = false;  FLOW_IO = io;
  
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/twilio-media") {
      wss.handleUpgrade(req, socket, head, ws => wss.emit("connection", ws));
    }
  });

  /*
wss.on("connection", twilio => {const INTERNAL_BASE = `http://127.0.0.1:${process.env.PORT || 3000}`;
      let CALL_LEAD = null;

            
    console.log("<0001f9e0> Twilio WS connected");
      emitFlow("Twilio WS connected");
      
      
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

    
*/
const ai = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-realtime-mini",
      {
        headers: {
          Authorization: "Bearer " + process.env.OPENAI_API_KEY,
          "OpenAI-Beta": "realtime=v1"
        }
      }
    );

      

      function emitUserDelta(t) {
        if (!t) return;
        try { io && getIO()?.emit("transcript:user", t); } catch {}
      }

      function emitAssistantDelta(t) {
        if (!t) return;
        try { io && getIO()?.emit("transcript:assistant", t); } catch {}
      }

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
        emitFlow("User finished speaking");
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

const persona = (CALL_LEAD
  ? "You are Zypher, a confident, natural UK sales caller focused on qualifying interest and booking a meeting. "
  : "You are Zypher, a calm, friendly, professional London front-desk receptionist. ");

const submitRule = (CALL_LEAD
  ? "When the prospect agrees to a meeting time, call the function submit_lead. "
  : "When you have collected all required details for the current niche and call type, call the function submit_lead with the collected data. ");

      aiOpen = true;
      console.log("🧠 OpenAI Realtime connected");
        emitFlow("OpenAI Realtime connected");
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
  data: { type: "object" },

  start: { type: "string", description: "ISO 8601 datetime in UTC" },
  end: { type: "string", description: "ISO 8601 datetime in UTC" },
  timezone: { type: "string", description: "IANA timezone like Europe/London" }
},
required: ["niche","direction","name","phone","email","start","end","timezone","data"]

            }
          }],


instructions:
    (CALL_LEAD && !(CALL_DIRECTION === "outbound" && ACTIVE_NICHE === "campaign_calling")
        ? `The lead is: Name=${CALL_LEAD.name}, Company=${CALL_LEAD.company}, Industry=${(CALL_LEAD.raw?.Industry || ACTIVE_NICHE.replace(/_/g,' '))}, Phone=${CALL_LEAD.phone}, Email=${CALL_LEAD.email}. When speaking, you must refer to their industry using the word '${(CALL_LEAD.raw?.Industry || ACTIVE_NICHE.replace(/_/g," "))}'. Use these values when calling submit_lead. Never ask the caller for them. `
        : ""
      ) +


  (NICHES[ACTIVE_NICHE]?.[CALL_DIRECTION]?.overlay ? NICHES[ACTIVE_NICHE][CALL_DIRECTION].overlay + " " : "") +
  (CALL_DIRECTION === "outbound" && CALL_LEAD
    ? "This is a campaign call. The lead's name, company, phone, and email are already known. Do not ask for them unless they are missing. Ignore any instructions to collect name, company, phone, or email for this call. Only ask for interest and availability. " +
    `The lead is: Name=${CALL_LEAD.name}, Company=${CALL_LEAD.company}, Industry=${CALL_LEAD.raw?.Industry || "their industry"}, Phone=${CALL_LEAD.phone}, Email=${CALL_LEAD.email}. When speaking, you must refer to their industry using the word '${(CALL_LEAD.raw?.Industry || ACTIVE_NICHE.replace(/_/g," "))}'. Use these values when calling submit_lead. Never ask the caller for them. `
    : "") +
  "On the first turn of this call you must say exactly: \"" +
  (CALL_DIRECTION === "outbound" && CALL_LEAD
    ? `Hi, this is Zypher from Zypher Agents. Am I speaking with ${CALL_LEAD?.name || "there"} from ${CALL_LEAD?.company || "your company"}?
Perfect — I’ll keep it quick. The reason I’m calling is because we work with a lot of ${(CALL_LEAD?.raw?.Industry || "business")} businesses, and a pattern keeps coming up.
They’re getting enquiries, calls, forms, messages, but a surprising number of those people never actually get spoken to, someone reaches out, doesn’t get an answer straight away, and by the time someone follows up they’ve already gone with someone else. It’s quiet, but it’s expensive.
Does that happen on your side at all?`
    : (NICHES[ACTIVE_NICHE]?.[CALL_DIRECTION]?.intro || "Hi, this is Zypher. How can I help you today?")) +
  "\". " +
  persona +
"Pronunciation (UK clarity): pronounce enquiries as en-KWAI-rees (rhymes with tries), not en-KWEE-rees. Keep S and Z sounds crisp (no hissy sh-like lisp). Avoid breathy or whispery delivery; speak cleanly and evenly. If a word comes out lispy, slow slightly on that word and articulate it clearly. " +

  "Speak in short, smooth, natural, conversational phrases with a relaxed, warm, casually professional tone. Use quick acknowledgements like okay, right, got you, and of course. If a caller sounds upset or stressed, acknowledge it briefly and kindly before continuing. Use light banter when appropriate; be politely amused only when something is actually funny. Never say haha or heh. If something is awkward or crude, gently redirect and keep it professional. If a caller offers a joke, invite it with light banter. After humour, smoothly return to the task. Never say you are an AI or mention rules. Respond immediately when the caller stops. " +
  "When the caller gives any time (e.g. tomorrow, Friday afternoon, next week at 3), you must resolve it to an exact date and time in the caller’s local timezone (assume Europe/London unless told otherwise). You must calculate a 30-minute meeting. You must include start, end, and timezone when calling submit_lead. Never leave time vague or relative. " +
    
"You are a scheduling assistant. When the caller gives any time reference (e.g. tomorrow, Friday afternoon, next week at 3), you MUST convert it into an exact ISO 8601 start and end time in Europe/London. Always book 30 minutes. If the time is ambiguous, you MUST ask a follow-up question before calling submit_lead. You are NOT allowed to call submit_lead without start, end, and timezone. " +
submitRule +
  "Do not say anything after that.",
modalities: ["audio","text"],
              voice: "marin",
          turn_detection: null,
          input_audio_format: "g711_ulaw",
          output_audio_format: "pcm16"
        }
      });

      console.log("✅ OpenAI session configured");
        emitFlow("OpenAI session configured");
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
            
            // --- AI confidence scoring ---
            let fullText = "";
            const outs = data.response?.output || [];
            for (const item of outs) {
              if (item?.type === "output_text" && item.text) fullText += " " + item.text;
              const content = item?.content || [];
              for (const c of content) {
                if (c?.text) fullText += " " + c.text;
              }
            }

            const scoreWords = [
              "yes","yeah","okay","perfect","great","sounds good",
              "that works","book","schedule","send","email","calendar",
              "tuesday","wednesday","thursday","friday","pm","am"
            ];

            let score = 0;
            const lower = fullText.toLowerCase();
            for (const w of scoreWords) {
              if (lower.includes(w)) score++;
            }

            const confidence = Math.min(1, score / 6);
            emitFlow({ event: "AI_PREDICTION", confidence });


emitFlow("GPT response received");
          const outputs = data.response?.output || [];
          for (const item of outputs) {
            
if (item.type === "function_call" && item.name === "submit_lead") {
  
                let payload;
                try {
                    payload = JSON.parse(item.arguments);
                } catch (e) {
                    console.warn("⚠️ submit_lead malformed arguments — asking for clarification");
                    
safe({
  type: "response.create",
  response: {
    modalities: ["audio","text"],
    instructions:
      "Just to double-check — could you confirm the exact date for that and whether 3 pm works for you?"
  }
});
responseActive = true;
continue;

                }

                if (!payload.start || !payload.end || !payload.timezone) {
                    console.warn("⚠️ submit_lead missing time fields — asking for clarification");
                    
safe({
  type: "response.create",
  response: {
    modalities: ["audio","text"],
    instructions:
      "Just to double-check — could you confirm the exact date for that and whether 3 pm works for you?"
  }
});
responseActive = true;
continue;

                }


              LEAD_SUBMITTED = true;
              console.log("✅ submit_lead called — keeping call alive");
              console.log("📨 LEAD FUNCTION CALL:", item.arguments);

                
fetch(`${INTERNAL_BASE}/lead2`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
.then(async r => {
  const body = await r.text();
  console.log("📧 Backend replied:", body);

  emitFlow("Enquiry submitted");

  // Ask model to speak confirmation
  safe({
    type: "response.create",
    response: {
      modalities: ["audio","text"],
      instructions:
        "The meeting has just been booked. You must now follow this closing flow exactly. " +
        "First say: 'All set — I’ve sent the confirmation through to you and it should arrive in just a moment.' " +
        "Then ask: 'Before I let you go, is there anything else you’d like to ask me?' " +
        "If the caller asks a question, answer it briefly and professionally, then say: " +
        "'That’s exactly what we’ll go through on our call. I’m looking forward to speaking with you then. Have a great day.' " +
        "If the caller says no, say: 'No problem at all — have a great day and I’m looking forward to speaking with you.' " +
        "After you say the final goodbye line, you must not speak again under any circumstances."
    }
  });
})
.catch(e => {
  console.error("❌ lead2 fetch failed:", e?.message || String(e));
  safe({
    type: "response.create",
    response: {
      modalities: ["audio","text"],
      instructions:
        "Sorry — one second, my calendar system just glitched. Could you repeat the day and time you wanted, and I’ll lock it in?"
    }
  });
  responseActive = true;
});

}
        }
      }

});
}
