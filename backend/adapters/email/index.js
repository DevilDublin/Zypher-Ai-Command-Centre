import * as offline from './offline.js';
import * as resend from './resend.js';

export function getEmailAdapter({ environment }) {
  if (environment === 'TEST') {
    return offline;
  }
  return resend;
}
