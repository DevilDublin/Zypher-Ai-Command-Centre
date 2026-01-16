import crypto from "crypto";
import fs from "fs";
import { google } from "googleapis";

function readJsonMaybe(url) {
  try {
    return JSON.parse(fs.readFileSync(url));
  } catch {
    return null;
  }
}

export async function createBooking(payload = {}) {
  if (process.env.GOOGLE_ENABLED !== "true") {
    return { disabled: true };
  }

  const CREDENTIALS =
    process.env.GOOGLE_CREDENTIALS_JSON
      ? JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON)
      : readJsonMaybe(new URL("./google_credentials.json", import.meta.url));

  const TOKENS =
    process.env.GOOGLE_TOKEN_JSON
      ? JSON.parse(process.env.GOOGLE_TOKEN_JSON)
      : readJsonMaybe(new URL("./google_token.json", import.meta.url));

  if (!CREDENTIALS || !TOKENS) {
    return { disabled: true, reason: "google_creds_missing" };
  }

  const { client_id, client_secret, redirect_uris } =
    CREDENTIALS.web || CREDENTIALS.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  oAuth2Client.setCredentials(TOKENS);

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  const { name, email, phone, niche, start, end, timezone } = payload;

  const event = {
    summary: `Zypher Lead – ${name}`,
    description: `Niche: ${niche}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}`,
    attendees: [{ email }, { email: "zypheragent25@gmail.com" }],
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" }
      }
    },
    start: { dateTime: start, timeZone: timezone },
    end: { dateTime: end, timeZone: timezone }
  };

  const res = await calendar.events.insert({
    calendarId: "6e6b28118554839fd9f04317d538404332baaa1c66d7306438164bcaea135169@group.calendar.google.com",
    resource: event,
    conferenceDataVersion: 1,
    sendUpdates: "all"
  });

  return {
    event: res.data,
    meetLink: res.data.conferenceData?.entryPoints?.[0]?.uri || null,
    htmlLink: res.data.htmlLink,
    start,
    end
  };
}
