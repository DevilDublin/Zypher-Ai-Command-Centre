
import fs from "fs";
import path from "path";

const clientsPath = path.resolve("./clients.json");

export function login(req, res) {
  try {
    const { clientId, password } = req.body || {};

    if (!clientId || !password) {
      return res.json({ ok: false, error: "Missing credentials" });
    }

    const data = JSON.parse(fs.readFileSync(clientsPath, "utf8"));
    const client = data[clientId];

    if (!client) {
      return res.json({ ok: false, error: "Client not found" });
    }

    if (!client.active) {
      return res.json({ ok: false, error: "Account disabled" });
    }

    if (client.password !== password) {
      return res.json({ ok: false, error: "Invalid password" });
    }

    return res.json({
      ok: true,
      clientId,
      name: client.name,
      plan: client.plan
    });

  } catch (e) {
    console.error("AUTH ERROR", e);
    res.json({ ok: false, error: "Server error" });
  }
}
