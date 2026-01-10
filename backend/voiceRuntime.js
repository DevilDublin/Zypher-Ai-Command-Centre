import { WebSocketServer } from "ws";
import { createAudioBridge } from "./audioBridge.js";
import { chatStream } from "./brain.js";
import { textToSpeechFFmpegStream } from "./tts.js";
import { createDeepgramStream } from "./deepgramStream.js";

export function initVoiceRuntime(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/twilio-media") {
      wss.handleUpgrade(req, socket, head, ws => {
        wss.emit("connection", ws);
      });
    }
  });

  wss.on("connection", ws => {
    console.log("<0001f9e0> Twilio WS connected");

    let streamSid = null;

    const audioBridge = createAudioBridge(ulaw => {
      if (!streamSid) return;
      ws.send(JSON.stringify({
        event: "media",
        streamSid,
        media: {
          track: "outbound",
          payload: ulaw.toString("base64")
        }
      }));
    });

    const deepgram = createDeepgramStream(async (text, isFinal) => {
      if (!isFinal) return;

      console.log("🗣 USER:", text);

      const messages = [{ role: "user", content: text }];
      console.log("<0001f9e0> GPT input:", messages);

      await chatStream(messages, async sentence => {
        console.log("🤖:", sentence);

        const pcmStream = await textToSpeechFFmpegStream(sentence);
        for await (const chunk of pcmStream) {
          audioBridge.push(chunk);
        }
      });
    });

    ws.on("message", msg => {
      const data = JSON.parse(msg.toString());

      if (data.event === "start") {
        streamSid = data.start.streamSid;
        console.log("<0001f9e0> Twilio stream started:", streamSid);

        // Play intro
        (async () => {
          const intro = "Hello, this is Zypher AI. How can I help you today?";
          console.log("🤖 INTRO:", intro);
          const pcmStream = await textToSpeechFFmpegStream(intro);
          for await (const chunk of pcmStream) {
            audioBridge.push(chunk);
          }
        })();
        return;
      }

      if (data.event === "media") {
        const ulaw = Buffer.from(data.media.payload, "base64");
        deepgram.send(ulaw);
      }

      if (data.event === "stop") {
        console.log("<0001f9e0> Twilio stream stopped");
        deepgram.close();
      }
    });

    ws.on("close", () => {
      console.log("<0001f9e0> Twilio WS closed");
      deepgram.close();
    });
  });
}
