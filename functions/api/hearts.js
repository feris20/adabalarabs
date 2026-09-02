export async function onRequest(context) {
  const { request } = context;
  const base = "http://fi5.bot-hosting.net:20035/user/hearts";
  const headers = { "Content-Type": "application/json" };
  const auth = request.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;
  try {
    const opts = { method: request.method, headers };
    if (["POST","PUT"].includes(request.method))
      opts.body = JSON.stringify(await request.json().catch(() => ({})));
    const r = await fetch(base, opts);
    const d = await r.json();
    return new Response(JSON.stringify(d), { status: r.status, headers: {"Content-Type":"application/json"} });
  } catch(e) {
    return new Response(JSON.stringify({error:"فشل الاتصال"}), { status:500, headers:{"Content-Type":"application/json"} });
  }
}
