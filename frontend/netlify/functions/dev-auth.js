export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {}

  const provided = String(body.passkey ?? body.key ?? "").trim();
  const expected = String(process.env.DEV_PASSKEY ?? "").trim();

  const ok = expected.length > 0 && provided === expected;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok })
  };
}
