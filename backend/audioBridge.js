import mulaw from "mulaw-js";

export function createAudioBridge(sendUlaw) {
  let buffer = new Int16Array(0);
  let wasSilent = true;

  // Stable 20ms pacing: one 160-sample frame (8kHz) every 20ms
  let ticker = null;

  function ensureTicker() {
    if (ticker) return;
    ticker = setInterval(() => {
      if (buffer.length < 160) {
        if (buffer.length === 0) wasSilent = true;
        return;
      }

      const frame = buffer.subarray(0, 160);
      buffer = buffer.subarray(160);

      const ulaw = mulaw.encode(frame);
      sendUlaw(Buffer.from(ulaw));
    }, 20);
  }

  return {
    push(pcmBytes) {
      ensureTicker();

      const samples = Math.floor(pcmBytes.length / 2);
      if (samples <= 0) return;

      const pcm24 = new Int16Array(samples);
      for (let i = 0; i < samples; i++) {
        const offset = i * 2;
        if (offset + 1 >= pcmBytes.length) break;
        pcm24[i] = pcmBytes.readInt16LE(offset);
      }

        // 24kHz -> 8kHz with anti-aliasing (3-tap box filter)
        const outLen = Math.floor(pcm24.length / 3);
        if (outLen <= 0) return;

        const down = new Int16Array(outLen);

        // 3-tap box filter (anti-alias)
        for (let i = 0; i < outLen; i++) {
          const j = i * 3;
          const a = pcm24[j] || 0;
          const b = pcm24[j + 1] || 0;
          const c = pcm24[j + 2] || 0;
          down[i] = ((a + b + c) / 3) | 0;
        }

        // De-emphasis (tames sibilance without underwater effect)
        let prev = 0;
        for (let i = 0; i < down.length; i++) {
          const cur = down[i];
          down[i] = (0.85 * cur + 0.15 * prev) | 0;
          prev = cur;
        }
      // Only fade when transitioning from silence -> speech
      if (wasSilent) {
        const fade = Math.min(80, down.length);
        for (let i = 0; i < fade; i++) {
          const g = i / fade;
          down[i] = (down[i] * g) | 0;
        }
        wasSilent = false;
      }

      // Merge into playback buffer
      const merged = new Int16Array(buffer.length + down.length);
      merged.set(buffer);
      merged.set(down, buffer.length);
      buffer = merged;
    }
  };
}
