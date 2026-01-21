import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(clientId, { to, subject, text, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("📧 Resend disabled (no API key)");
    return { disabled: true };
  }

  const res = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Zypher Agents <bookings@zypheragents.com>",
    to,
    subject,
    text,
    html
  });

  console.log("📧 Resend email sent:", res.id);
  return res;
}

export { sendEmail };
