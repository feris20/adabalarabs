export async function onRequest(context) {
  const { request } = context;
  if (request.method !== "POST")
    return new Response("Method Not Allowed", { status: 405 });

  try {
    const body = await request.json();
    const r = await fetch("http://fi5.bot-hosting.net:20035/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const d = await r.json();
    return new Response(JSON.stringify(d), {
      status: r.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "فشل الاتصال بالسيرفر" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
}
