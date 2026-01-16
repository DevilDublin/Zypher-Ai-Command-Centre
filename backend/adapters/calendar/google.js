import { google } from "googleapis";
import fs from "fs";

const CREDENTIALS = JSON.parse(fs.readFileSync(new URL("../../google_credentials.json", import.meta.url)));
const TOKENS = JSON.parse(fs.readFileSync(new URL("../../google_token.json", import.meta.url)));

const { client_id, client_secret, redirect_uris } =
  CREDENTIALS.web || CREDENTIALS.installed;

const auth = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

auth.setCredentials(TOKENS);

const calendar = google.calendar({ version: "v3", auth });

const CALENDAR_ID = "6e6b28118554839fd9f04317d538404332baaa1c66d7306438164bcaea135169@group.calendar.google.com";

const BUSINESS_START = 11; // 11am
const BUSINESS_END = 16;   // 4pm
const SLOT_MINUTES = 30;
const TZ = "Europe/London";

function roundToNextSlot(date) {
  const ms = SLOT_MINUTES * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

function clampToBusinessHours(date) {
  const d = new Date(date);
  const h = d.getHours();

  if (h < BUSINESS_START) {
    d.setHours(BUSINESS_START, 0, 0, 0);
  }

  if (h >= BUSINESS_END) {
    d.setDate(d.getDate() + 1);
    d.setHours(BUSINESS_START, 0, 0, 0);
  }

  return d;
}

async function getBusy(start, end) {
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      timeZone: TZ,
      items: [{ id: CALENDAR_ID }]
    }
  });

  return res.data.calendars[CALENDAR_ID].busy || [];
}

export async function getNextFreeSlot(requestedStart) {
  let cursor = roundToNextSlot(new Date(requestedStart));
  cursor = clampToBusinessHours(cursor);

  while (true) {
    const slotEnd = new Date(cursor.getTime() + SLOT_MINUTES * 60000);
    const busy = await getBusy(cursor, slotEnd);

    if (busy.length === 0) {
      return { start: cursor, end: slotEnd };
    }

    cursor = new Date(cursor.getTime() + SLOT_MINUTES * 60000);
    cursor = clampToBusinessHours(cursor);
  }
}

export async function createBooking(clientId, booking) {
  const { start, name, email, phone, niche } = booking;

  const slot = await getNextFreeSlot(new Date(start));

  const event = {
    summary: `Zypher Lead – ${name}`,
    description: `Niche: ${niche}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}`,
    start: { dateTime: slot.start.toISOString(), timeZone: TZ },
    end: { dateTime: slot.end.toISOString(), timeZone: TZ }
  };

  const res = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    resource: event
  });

  return {
    start: slot.start.toISOString(),
    end: slot.end.toISOString(),
    htmlLink: res.data.htmlLink
  };
}