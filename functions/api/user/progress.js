export async function onRequest(context) {
  const { request } = context;
  if (request.method !== "PUT")
    return new Response("Method Not Allowed", { status: 405 });

  const headers = { "Content-Type": "application/json" };
  const auth = request.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;

  try {
    const body = await request.json();
    const r = await fetch("http://fi5.bot-hosting.net:20035/user/progress", {
      method: "PUT", headers, body: JSON.stringify(body)
    });
    const d = await r.json();
    return new Response(JSON.stringify(d), {
      status: r.status, headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "فشل الاتصال" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
}
