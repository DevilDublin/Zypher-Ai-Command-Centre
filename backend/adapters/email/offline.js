import { writeVSC } from "../core/vsc.js";

export async function sendEmail(clientId, email, config = {}) {
  writeVSC(clientId, "email", email, config.baseDir || "test_runs");
  return { status: "recorded" };
}
