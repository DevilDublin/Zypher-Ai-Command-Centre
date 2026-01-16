export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405 };
  }

  const { passkey } = JSON.parse(event.body || "{}");

  if (!passkey || passkey !== process.env.DEV_PASSKEY) {
    return {
      statusCode: 401,
      body: JSON.stringify({ ok: false })
    };
  }

  const isProd = process.env.NODE_ENV === "production";
  const cookie = `zy_dev_auth=1; Path=/; HttpOnly; SameSite=Strict; ${isProd ? "Secure;" : ""}`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Cookie": cookie,   // <— debug only
      "Set-Cookie": cookie
    },
    body: JSON.stringify({ ok: true })
  };
}
