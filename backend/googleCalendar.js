import fs from "fs";
import { google } from "googleapis";

const CREDENTIALS = JSON.parse(fs.readFileSync("./google_credentials.json"));
const TOKENS = JSON.parse(fs.readFileSync("./google_token.json"));

const { client_id, client_secret, redirect_uris } =
  CREDENTIALS.web || CREDENTIALS.installed;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

oAuth2Client.setCredentials(TOKENS);

const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

export async function createBooking({ name, email, phone, niche, start, end }) {
  const event = {
    summary: `Zypher Lead – ${name}`,
    description:
      `Niche: ${niche}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}`,
    start: {
      dateTime: start,
      timeZone: "Europe/London"
    },
    end: {
      dateTime: end,
      timeZone: "Europe/London"
    }
  };

  const res = await calendar.events.insert({
    calendarId: "primary",
    resource: event
  });

  return res.data;
}
