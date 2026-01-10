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

  for await (const part of res) {
    const delta = (part.choices && part.choices[0] && part.choices[0].delta && part.choices[0].delta.content) ? part.choices[0].delta.content : "";
    if (!delta) continue;

    buffer += delta;

    const chunks = buffer.match(/[^.!?]+[.!?]*/g);
    if (!chunks) continue;

    for (let j = 0; j < chunks.length - 1; j++) {
      const clean = chunks[j].trim();
      if (clean) await onSentence(clean);
    }

    buffer = chunks[chunks.length - 1];
  }

  if (buffer.trim()) await onSentence(buffer.trim());
  return;
}
