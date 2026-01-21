import * as offline from './offline.js';
import * as resend from './resend.js';

export function getEmailAdapter({ environment }) {
  if (environment === 'TEST') {
    console.log("📧 EMAIL ADAPTER: TEST → offline");
    return offline;
  }

  console.log("📧 EMAIL ADAPTER: LIVE → Resend");
  return resend;
}
