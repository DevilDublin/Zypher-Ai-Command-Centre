import * as calendarGoogle from "../calendar/google.js";
import * as calendarOffline from "../calendar/offline.js";
import * as emailGoogle from "../email/gmail.js";
import * as emailOffline from "../email/offline.js";

export function getAdapters(config) {
  const env = config.environment || "TEST";

  const baseDir = env === "TEST" ? "test_runs" : "clients";

  return {
    environment: env,
    baseDir,
    calendar: env === "TEST" ? calendarOffline : calendarGoogle,
    email: env === "TEST" ? emailOffline : emailGoogle
  };
}
