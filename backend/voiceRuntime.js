import "dotenv/config";
import { WebSocketServer } from "ws";
import fs from "fs";
import os from "os";
import path from "path";
import mulaw from "mulaw-js";

import { chatStream } from "./brain.js";
import { transcribeWav } from "./stt.js";

const SILENCE_MS = 900;
const SAMPLE_RATE = 8000;
const FRAME_SIZE = 160;

const STATE = {
  IDLE: "IDLE",
  ASSISTANT_SPEAKING: "ASSISTANT_SPEAKING",
  USER_SPEAKING: "USER_SPEAKING",
  PROCESSING: "PROCESSING"
};

export function initVoiceRuntime(server) {
  const mediaWSS = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/twilio-media") {
      mediaWSS.handleUpgrade(req, socket, head, ws => {
        mediaWSS.emit("connection", ws);
      });
    }
  });

  mediaWSS.on("connection", ws => {
    const session = {
      callSid: null,
      streamSid: null,
      state: STATE.IDLE,
      audioChunks: [],
      lastAudioAt: 0,
      ttsAbort: false,
      introPlayed: false,
        alive: true,
        ttsQueue: [],
        ttsPlaying: false
    };

    console.log("🟢 [E2] Media WS connected");

    ws.on("message", async msg => {
      let data;
      try {
        data = JSON.parse(msg.toString());
      } catch {
        return;
      }

      // ===== START =====
      if (data.event === "start") {
        session.callSid = data.start.callSid;
        session.streamSid = data.start.streamSid;
        session.audioChunks = [];
        session.lastAudioAt = Date.now();
        session.state = STATE.IDLE;

        console.log("▶️ [E2] Stream started", session.streamSid);

        if (!session.introPlayed) {
          session.introPlayed = true;
          speak("Hello, this is Zypher AI. How can I help you today?");
        }
      }

      // ===== INBOUND AUDIO (CLEAN REWRITE) =====
      if (data.event === "media" && data.media && data.media.payload) {
        const ulaw = Buffer.from(data.media.payload, "base64");

        // mulaw-js may return Array OR Int16Array — normalize it
        let decoded = mulaw.decode(ulaw);
        if (!decoded || decoded.length === 0) return;

        const pcm16 = decoded instanceof Int16Array ? decoded : new Int16Array(decoded);

        const pcmBuf = Buffer.from(
          pcm16.buffer,
          pcm16.byteOffset,
          pcm16.byteLength
        );

        // --- Energy gate (RMS) ---
        let sum = 0;
        for (let i = 0; i < pcm16.length; i++) {
          const v = pcm16[i];
          sum += v * v;
        }
        const rms = Math.sqrt(sum / pcm16.length);

        const SPEECH_RMS_THRESHOLD = 1200;
        const isSpeech = rms > SPEECH_RMS_THRESHOLD;

        if (isSpeech) {
          session.lastAudioAt = Date.now();
        }

        // --- BARGE-IN (speech only) ---
        if (isSpeech && session.state === STATE.ASSISTANT_SPEAKING) {
          console.log("✋ [BARGE-IN] Real speech detected");
          session.ttsAbort = true;
          session.state = STATE.USER_SPEAKING;
          session.audioChunks = [];
        }

        // --- Buffer speech only ---
        if (isSpeech && (session.state === STATE.USER_SPEAKING || session.state === STATE.IDLE)) {
          session.state = STATE.USER_SPEAKING;
          session.audioChunks.push(pcmBuf);
        }
      }

      // ===== STOP =====
      if (data.event === "stop") {
        console.log("⏹️ [E2] Stream stopped");
        ws.close();
      }
    });

    // ===== SILENCE DETECTOR =====
    const silenceCheck = setInterval(async () => {
      if (
        session.state === STATE.USER_SPEAKING &&
        Date.now() - session.lastAudioAt > SILENCE_MS &&
        session.audioChunks.length > 0
      ) {
        session.state = STATE.PROCESSING;

        const pcmBuffer = Buffer.concat(session.audioChunks);
        session.audioChunks = [];

        console.log("🛑 [TURN] User finished speaking");
        session.timing = { turnEnd: Date.now() };

        const wavPath = path.join(os.tmpdir(), `e2-${Date.now()}.wav`);
        writeWav(wavPath, pcmBuffer);

        try {
          const text = await transcribeWav(wavPath);
          session.timing.sttDone = Date.now();
          console.log("📝 [E2] Transcript:", text);
          console.log("⏱ STT latency:", session.timing.sttDone - session.timing.turnEnd, "ms");

          const llmStart = Date.now();

          await chatStream([
            { role: "system", content: "You are a friendly, natural conversationalist." },
            { role: "user", content: text }
          ], async (sentence) => {
            console.log("🧠 [E3] GPT sentence:", sentence);
            console.log("⏱ First token:", Date.now() - llmStart, "ms");
            await speak(sentence);
          });

          session.state = STATE.IDLE;
        } catch (err) {
          console.error("❌ [PIPELINE ERROR]", err.message);
          session.state = STATE.IDLE;
        }
      }
    }, 100);

    ws.on("close", () => {
        session.alive = false;
        session.ttsQueue = [];
        console.log("🧨 Session killed — GPT + TTS stopped");
      clearInterval(silenceCheck);
      console.log("🔴 [E2] Media WS closed");
    });

    // ===== HELPERS =====

    
async function speak(text) {
  if (!session.alive) return;

  session.ttsQueue.push(text);

  if (!session.ttsPlaying) {
    session.ttsPlaying = true;
    playTTSQueue();
  }
}

async function playTTSQueue() {
  while (session.ttsQueue.length > 0 && session.alive) {
    const text = session.ttsQueue.shift();

    session.timing = session.timing || {};
    session.timing.ttsStart = Date.now();
    console.log("⏱ Total silence → voice:", session.timing.ttsStart - session.timing.turnEnd, "ms");

    session.state = STATE.ASSISTANT_SPEAKING;
    session.ttsAbort = false;

    const { textToSpeech } = await import("./tts.js");
    const ttsPath = path.join(os.tmpdir(), `tts-${Date.now()}.wav`);
    await textToSpeech(text, ttsPath);

    if (!session.alive) return;

    const { execSync } = await import("child_process");
    const tmpPcm = ttsPath.replace(".wav", ".raw");
    execSync(`ffmpeg -y -i "${ttsPath}" -ar 8000 -ac 1 -f s16le "${tmpPcm}"`);

    const pcm = fs.readFileSync(tmpPcm);
    const pcm16 = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length / 2);
    const ulaw = mulaw.encode(pcm16);

    for (let i = 0; i < ulaw.length; i += FRAME_SIZE) {
      if (!session.alive || session.ttsAbort) return;

      const frame = ulaw.slice(i, i + FRAME_SIZE);
      if (frame.length !== FRAME_SIZE) continue;

      ws.send(JSON.stringify({
        event: "media",
        streamSid: session.streamSid,
        media: {
          track: "outbound",
          payload: Buffer.from(frame).toString("base64")
        }
      }));

      await new Promise(r => setTimeout(r, 20));
    }

    session.state = STATE.IDLE;
  }

  session.ttsPlaying = false;
}


    function writeWav(file, pcmBuffer) {
      const wavHeader = Buffer.alloc(44);
      const byteRate = SAMPLE_RATE * 2;

      wavHeader.write("RIFF", 0);
      wavHeader.writeUInt32LE(36 + pcmBuffer.length, 4);
      wavHeader.write("WAVEfmt ", 8);
      wavHeader.writeUInt32LE(16, 16);
      wavHeader.writeUInt16LE(1, 20);
      wavHeader.writeUInt16LE(1, 22);
      wavHeader.writeUInt32LE(SAMPLE_RATE, 24);
      wavHeader.writeUInt32LE(byteRate, 28);
      wavHeader.writeUInt16LE(2, 32);
      wavHeader.writeUInt16LE(16, 34);
      wavHeader.write("data", 36);
      wavHeader.writeUInt32LE(pcmBuffer.length, 40);

      fs.writeFileSync(file, Buffer.concat([wavHeader, pcmBuffer]));
    }
  });
}
