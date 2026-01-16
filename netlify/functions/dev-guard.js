export async function handler(event) {
  const cookie = event.headers.cookie || "";

  const authed = cookie.includes("zy_dev_auth=1");

  if (!authed) {
    return {
      statusCode: 302,
      headers: {
        Location: "/"
      }
    };
  }

  return {
    statusCode: 200,
    body: "ok"
  };
}
