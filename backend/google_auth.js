import fs from "fs";
import readline from "readline";
import { google } from "googleapis";

const CREDENTIALS_PATH = "./google_credentials.json";
const TOKEN_PATH = "./google_token.json";

const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
const config = creds.installed || creds.web;
const { client_secret, client_id, redirect_uris } = config;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/calendar"]
});

console.log("\nOpen this URL in your browser:\n");
console.log(authUrl);
console.log("\nPaste the code here:");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("> ", async code => {
  const { tokens } = await oAuth2Client.getToken(code);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log("\n✅ Token saved to google_token.json");
  rl.close();
});
