import * as offline from './offline.js';
import * as ics from './ics.js';

export function getCalendarAdapter({ environment }) {
  if (environment === 'TEST') {
    console.log("📅 CALENDAR ADAPTER: TEST → offline");
    return offline;
  }

  console.log("📅 CALENDAR ADAPTER: LIVE → ICS (NO MEET)");
  return ics;
}
