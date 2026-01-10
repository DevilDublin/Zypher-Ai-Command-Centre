
import mulaw from "mulaw-js";

export function createAudioBridge(sendUlaw) {
  let buffer = new Int16Array(0);
  let nextTime = Date.now();

  return {
    push(pcmBytes) {
      const samples = Math.floor(pcmBytes.length / 2);
      const pcm24 = new Int16Array(samples);
      for (let i = 0; i < samples; i++) {
        const offset = i * 2;
        if (offset + 1 >= pcmBytes.length) break;
        pcm24[i] = pcmBytes.readInt16LE(offset);
      }

      // 24kHz → 8kHz
      const down = new Int16Array(Math.floor(pcm24.length / 3));
      for (let i = 0; i < down.length; i++) {
        down[i] = pcm24[i * 3];
      }

      const merged = new Int16Array(buffer.length + down.length);
      merged.set(buffer);
      merged.set(down, buffer.length);
      buffer = merged;

      while (buffer.length >= 160) {
        const now = Date.now();
        if (now < nextTime) break;

        const frame = buffer.subarray(0, 160);
        buffer = buffer.subarray(160);

        const ulaw = mulaw.encode(frame);
        sendUlaw(Buffer.from(ulaw));

        nextTime += 20;
      }
    }
  };
}
