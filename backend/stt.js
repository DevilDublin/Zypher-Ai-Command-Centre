import fs from "fs";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Transcribe a WAV file using OpenAI
 * @param {string} filePath
 */
export async function transcribeWav(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("Audio file not found");
  }

  const transcription = await client.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
    language: "en"
  });

  return transcription.text;
}
