import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Ember-style buffered streaming (human pacing)
export async function chatStream(messages, onSentence) {
  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    stream: true
  });

  let buffer = "";
  let lastFlush = Date.now();

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (!delta) continue;

    buffer += delta;
    const now = Date.now();

    const shouldFlush =
      buffer.length >= 120 ||            // big enough to sound human
      /[.!?]\s*$/.test(buffer) ||         // natural sentence end
      (now - lastFlush) > 400;            // Ember-style cadence

    if (shouldFlush) {
      const text = buffer.trim();
      buffer = "";
      lastFlush = now;
      if (text.length > 0) await onSentence(text);
    }
  }

  if (buffer.trim().length > 0) {
    await onSentence(buffer.trim());
  }
}
