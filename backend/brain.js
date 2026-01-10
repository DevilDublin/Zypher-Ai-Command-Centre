import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function chatStream(messages, onSentence) {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    stream: true
  });

  let buffer = "";
  let speaking = false;
  let lastEmit = 0;

  const START_THRESHOLD = 28;
  const EMIT_THRESHOLD = 60;
  const EMIT_INTERVAL = 60;

  for await (const part of res) {
    const delta =
      part.choices &&
      part.choices[0] &&
      part.choices[0].delta &&
      part.choices[0].delta.content
        ? part.choices[0].delta.content
        : "";

    if (!delta) continue;

    buffer += delta;
    const now = Date.now();

    if (!speaking && buffer.length >= START_THRESHOLD) {
      speaking = true;
    }

    if (
      speaking &&
      buffer.length >= EMIT_THRESHOLD &&
      now - lastEmit > EMIT_INTERVAL
    ) {
      const chunk = buffer;
      buffer = "";
      lastEmit = now;
      if (chunk.trim()) {
        await onSentence(chunk);
      }
    }
  }

  if (buffer.trim()) {
    await onSentence(buffer.trim());
  }
}
