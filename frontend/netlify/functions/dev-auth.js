export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { key } = await req.json();
  const PASSKEY = process.env.DEV_PASSKEY;

  if (!PASSKEY) {
    return new Response(
      JSON.stringify({ ok: false, error: "Server not configured" }),
      { status: 500 }
    );
  }

  if (key !== PASSKEY) {
    return new Response(
      JSON.stringify({ ok: false }),
      { status: 401 }
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200 }
  );
};
