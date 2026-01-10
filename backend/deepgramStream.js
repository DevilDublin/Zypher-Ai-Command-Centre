import WebSocket from "ws";

export function createDeepgramStream(onTranscript) {
  const ws = new WebSocket("wss://api.deepgram.com/v1/listen?encoding=mulaw&sample_rate=8000&channels=1&interim_results=true&endpointing=300", {
    headers: {
      Authorization: "Token " + process.env.DEEPGRAM_API_KEY
    }
  });

  ws.on("open", () => {
    console.log("🧠 Deepgram connected");
  });

  ws.on("message", msg => {
    try {
      const data = JSON.parse(msg.toString());
      const text = data.channel?.alternatives?.[0]?.transcript || "";
      if (text.trim()) {
        onTranscript(text, data.is_final);
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
