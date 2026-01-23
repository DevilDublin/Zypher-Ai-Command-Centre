import { Resend } from "resend";

let client = null;

function getClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("❌ RESEND_API_KEY missing in LIVE environment");
  }
  if (!client) {
    console.log("📨 Resend client initialising");
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

export async function sendEmail(email) {
  const { to, subject, html, text } = email;

  if (!to) {
    throw new Error("❌ sendEmail called without `to`");
  }

  const resend = getClient();

  const result = await resend.emails.send({
    from: "Zypher Agents <contact@zypheragents.com>",
    to,
    subject,
    html,
    text,
  });

  console.log("📧 Resend sent:", result?.id || result);
  return result;
}
