import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendEmail(clientId, email) {
  
  const messageId = `<${uuidv4()}@zypheragents.ai>`;

  return await mailer.sendMail({
    ...email,
    messageId,
    headers: {
      ...(email.headers || {}),
      "Message-ID": messageId,
      "X-Entity-Ref-ID": messageId,
      "In-Reply-To": undefined,
      "References": undefined
    }
  });

}
