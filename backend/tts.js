
import WebSocket from "ws";

let ws = null;
let ready = false;
let audioCallback = null;

export function initOpenAITTS(onPcm) {
  audioCallback = onPcm;

  ws = new WebSocket(
    "wss://api.openai.com/v1/realtime?model=gpt-realtime-mini",
    {
      headers: {
        Authorization: "Bearer " + process.env.OPENAI_API_KEY,
        "OpenAI-Beta": "realtime=v1"
      }
    }
  );

  ws.on("open", () => {
    ready = true;
    console.log("🔊 OpenAI Realtime TTS connected");
  });

  ws.on("message", msg => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === "response.audio.delta") {
        const pcm = Buffer.from(data.delta, "base64");
        if (audioCallback) audioCallback(pcm);
      }
    } catch {}
  });

  ws.on("close", () => {
    ready = false;
    console.log("🔊 OpenAI Realtime TTS closed");
  });

  ws.on("error", e => {
    console.error("OpenAI TTS socket error:", e.message);
  });
}

export function speak(text) {
  if (!ws || !ready) return;

  ws.send(JSON.stringify({
    type: "response.create",
    response: {
      modalities: ["audio"],
      instructions: text
    }
  }));
}
