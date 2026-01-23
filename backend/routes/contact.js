import { sendEmail } from "../adapters/email/resend.js";

import cors from "cors";

const contactCors = cors({
  origin: "*",
});

export async function contactHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  const { name, company, message } = req.body || {};

  if (!name || !message) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const text = `
Name: ${name}
Company: ${company || "-"}
Message:
${message}
`.trim();

  // ✅ SINGLE AUTHORITATIVE EMAIL (internal only)
  await sendEmail({
    to: "zypheragent25@gmail.com",
    subject: "Zypher Contact Request",
    text,
    html: text.replace(/\n/g, "<br>")
  });

  // ✅ If we reached here, the request is successful
  return res.json({ ok: true });
}



