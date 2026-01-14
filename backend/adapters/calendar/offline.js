import { writeVSC } from "../core/vsc.js";

export async function createBooking(clientId, booking, config = {}) {
  const enriched = {
    id: "offline",
    status: "recorded",
    meetLink: "https://meet.google.com/zypher-demo",
    htmlLink: "https://calendar.google.com/calendar/u/0/r/eventedit?zypher-demo",
    ...booking
  };

  writeVSC(clientId, "calendar", enriched, config.baseDir || "test_runs");
  return enriched;
}