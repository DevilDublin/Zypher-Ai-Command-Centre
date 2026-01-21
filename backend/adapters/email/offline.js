import { writeVSC } from "../core/vsc.js";

export async function sendEmail(
  { to, subject, html, text },
  clientId = "default_client"
) {
  writeVSC(clientId, "email", {
    to,
    subject,
    html,
    text
  });
}
