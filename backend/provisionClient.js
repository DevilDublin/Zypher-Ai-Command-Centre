import crypto from "crypto";
import fs from "fs";
import path from "path";

export async function provisionClient(req, res, adapters) {
  try {
    const data = req.body;

    if (!data.clientName || !data.email) {
      return res.status(400).json({ error: "Missing client name or email" });
    }

    const slug =
      data.clientName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 24) +
      "_" +
      crypto.randomBytes(2).toString("hex");

    const password = crypto.randomBytes(6).toString("base64url");

    const baseDir = path.join("campaign_runs", slug);
    fs.mkdirSync(baseDir, { recursive: true });

    const client = {
      clientId: slug,
      name: data.clientName,
      company: data.company,
      email: data.email,
      phone: data.phone,
      niche: data.niche,
      skin: data.skin,
      created: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(baseDir, "client.json"),
      JSON.stringify(client, null, 2)
    );

    // Send verification artifacts into campaign_runs
    await adapters.email.sendEmail(
      slug,
      {
        to: data.email,
        subject: "Zypher Agent Activated",
        text: `Your Zypher agent is live.\n\nClient ID: ${slug}`
      },
      { baseDir: "campaign_runs" }
    );

    await adapters.calendar.createBooking(
      slug,
      {
        name: data.clientName,
        email: data.email,
        niche: data.niche,
        start: new Date().toISOString(),
        end: new Date(Date.now() + 30 * 60000).toISOString()
      },
      { baseDir: "campaign_runs" }
    );

    res.json({
      ok: true,
      clientId: slug,
      password
    });
  } catch (err) {
    console.error("❌ Provision failed:", err);
    res.status(500).json({ error: "Provision failed" });
  }
}
