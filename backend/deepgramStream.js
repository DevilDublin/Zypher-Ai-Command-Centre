import WebSocket from "ws";

export function createDeepgramStream(onTranscript) {
  const ws = new WebSocket(
    "wss://api.deepgram.com/v1/listen?encoding=mulaw&sample_rate=8000&channels=1&interim_results=true&endpointing=50&no_delay=true",
    {
      headers: {
        Authorization: "Token " + process.env.DEEPGRAM_API_KEY
      }
    }
  );

  let lastText = "";
  let lastTime = 0;

  ws.on("open", () => {
    console.log("🧠 Deepgram connected");
  });

  ws.on("message", msg => {
    try {
      const data = JSON.parse(msg.toString());
      const text = data.channel?.alternatives?.[0]?.transcript || "";
      if (!text.trim()) return;
        if (text.length < 3) return;

      const now = Date.now();

      // Fire early if transcript has been stable for 250ms
      const stable = text === lastText && now - lastTime > 90;

      if (data.is_final || stable) {
        onTranscript(text, true);
        lastText = "";
        lastTime = 0;
      } else {
        lastText = text;
        lastTime = now;
      }
    } catch {}
  });

  ws.on("close", () => console.log("🧠 Deepgram closed"));
  ws.on("error", e => console.error("Deepgram error", e.message));

  return {
    send(ulaw) {
      if (ws.readyState === 1) ws.send(ulaw);
    },
    close() {
      ws.close();
    }
  };
}
