import { google } from "googleapis";
import fs from "fs";

const TZ = "Europe/London";
const BUSINESS_START = 11;
const BUSINESS_END = 16;
const SLOT_MINUTES = 30;
const CALENDAR_ID = "6e6b28118554839fd9f04317d538404332baaa1c66d7306438164bcaea135169@group.calendar.google.com";

let calendar = null;

function readJsonMaybe(url) {
  try {
    return JSON.parse(fs.readFileSync(url));
  } catch {
    return null;
  }
}

if (process.env.GOOGLE_ENABLED === "true") {
  let CREDENTIALS = null;
  let TOKENS = null;

  try {
    CREDENTIALS = process.env.GOOGLE_CREDENTIALS_JSON
      ? JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON)
      : readJsonMaybe(new URL("../../google_credentials.json", import.meta.url));
  } catch (e) {
    console.error("❌ Failed to parse GOOGLE_CREDENTIALS_JSON:", e.message);
  }

  try {
    TOKENS = process.env.GOOGLE_TOKEN_JSON
      ? JSON.parse(process.env.GOOGLE_TOKEN_JSON)
      : readJsonMaybe(new URL("../../google_token.json", import.meta.url));
  } catch (e) {
    console.error("❌ Failed to parse GOOGLE_TOKEN_JSON:", e.message);
  }

  if (CREDENTIALS && TOKENS) {
    const { client_id, client_secret, redirect_uris } =
      CREDENTIALS.web || CREDENTIALS.installed;

    const auth = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    auth.setCredentials(TOKENS);
    calendar = google.calendar({ version: "v3", auth });
      console.log("✅ Google calendar adapter initialised");
  } else {
    console.log("📅 Google adapter disabled (missing credentials)");
  }
} else {
  console.log("📅 Google adapter disabled (GOOGLE_ENABLED != true)");
}

function roundToNextSlot(date) {
  const ms = SLOT_MINUTES * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

function clampToBusinessHours(date) {
  const d = new Date(date);
  const h = d.getHours();

  if (h < BUSINESS_START) d.setHours(BUSINESS_START, 0, 0, 0);
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
  if (!calendar) return null;

  let cursor = clampToBusinessHours(
    roundToNextSlot(new Date(requestedStart))
  );

  while (true) {
    const slotEnd = new Date(cursor.getTime() + SLOT_MINUTES * 60000);
    const busy = await getBusy(cursor, slotEnd);

    if (busy.length === 0) {
      return { start: cursor, end: slotEnd };
    }

    cursor = clampToBusinessHours(
      new Date(cursor.getTime() + SLOT_MINUTES * 60000)
    );
  }
}
async function createBooking(clientId, booking) {
  console.log("📅 createBooking called", { clientId, booking });
  if (!calendar) return { disabled: true };

  const { start, name, email, phone, niche } = booking;
  const slot = await getNextFreeSlot(start);

  if (!slot) return { disabled: true };

  const event = {
    summary: `Zypher Lead – ${name}`,
    description: `Niche: ${niche}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}`,
    start: { dateTime: slot.start.toISOString(), timeZone: TZ },
    end: { dateTime: slot.end.toISOString(), timeZone: TZ }
  };

  console.log("📅 inserting calendar event");

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

export { createBooking };
