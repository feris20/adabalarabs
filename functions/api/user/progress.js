export async function onRequest(context) {
  const { request } = context;
  const base = "http://fi5.bot-hosting.net:20035/user/progress";

  const headers = { "Content-Type": "application/json" };
  const auth = request.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;

  try {
    if (request.method === "GET") {
      const r = await fetch(base, { method: "GET", headers });
      const d = await r.json();
      return new Response(JSON.stringify(d), {
        status: r.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (request.method === "PUT") {
      const body = await request.json();
      const r = await fetch(base, {
        method: "PUT", headers,
        body: JSON.stringify(body)
      });
      const d = await r.json();
      return new Response(JSON.stringify(d), {
        status: r.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "فشل الاتصال" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
}
