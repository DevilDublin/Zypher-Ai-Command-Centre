import crypto from "crypto";
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

export async function createBooking({ name, email, phone, niche, start, end, timezone }) {
  const event = {
    summary: `Zypher Lead – ${name}`,
    description:
      `Niche: ${niche}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}`,

    attendees: [
      { email },
      { email: "zypheragent25@gmail.com" }
    ],

    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).slice(2)
      }
    },

    attendees: [
      { email },
      { email: "zypheragent25@gmail.com" }
    ],

    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).slice(2)
      }
    },
    start: {
      dateTime: start,
      timeZone: timezone
    },
    end: {
      dateTime: end,
      timeZone: timezone
    },
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" }
        }
      }

  };

  const res = await calendar.events.insert({
    calendarId: "6e6b28118554839fd9f04317d538404332baaa1c66d7306438164bcaea135169@group.calendar.google.com",
    resource: event,
      sendUpdates: "all",
      conferenceDataVersion: 1,
      sendUpdates: "all",
      conferenceDataVersion: 1,
      conferenceDataVersion: 1
  });

  
  return {
    event: res.data,
    meetLink: res.data.conferenceData?.entryPoints?.[0]?.uri || null,
    htmlLink: res.data.htmlLink,
    start: start,
    end: end
  };

}
