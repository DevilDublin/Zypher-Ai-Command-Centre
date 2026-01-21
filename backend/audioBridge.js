import mulaw from "mulaw-js";

export function createAudioBridge(sendUlaw) {
  // PCM16 buffer (Int16 samples)
  let buffer = new Int16Array(0);

  // 20ms pacing (8kHz = 160 samples)
  let ticker = null;

  function ensureTicker() {
    if (ticker) return;
    ticker = setInterval(() => {
      if (buffer.length < 160) return;

      const frame = buffer.subarray(0, 160);
      buffer = buffer.subarray(160);

      const ulaw = mulaw.encode(frame);
      sendUlaw(Buffer.from(ulaw));
    }, 20);
  }

  return {
    push(pcmBytes) {
      ensureTicker();

      // Expect PCM16 LE
      const samples = Math.floor(pcmBytes.length / 2);
      if (samples <= 0) return;

      const pcm = new Int16Array(samples);
      for (let i = 0; i < samples; i++) {
        const o = i * 2;
        if (o + 1 >= pcmBytes.length) break;
        pcm[i] = pcmBytes.readInt16LE(o);
      }

      // Downsample 24kHz -> 8kHz (3:1)
      const outLen = Math.floor(pcm.length / 3);
      if (outLen <= 0) return;

      const down = new Int16Array(outLen);
      for (let i = 0; i < outLen; i++) {
        const j = i * 3;
        down[i] = ((pcm[j] + pcm[j + 1] + pcm[j + 2]) / 3) | 0;
      }

      // Append to buffer
      const merged = new Int16Array(buffer.length + down.length);
      merged.set(buffer);
      merged.set(down, buffer.length);
      buffer = merged;
    }
  };
}
