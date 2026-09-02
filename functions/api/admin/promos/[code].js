export async function onRequest(context) {
  const { request, params } = context;
  const code = params.code;
  const base = `http://fi5.bot-hosting.net:20035/admin/promo-codes/${encodeURIComponent(code)}`;
  const headers = { "Content-Type": "application/json" };
  const auth = request.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;
  try {
    const opts = { method: request.method, headers };
    if (request.method === "PUT")
      opts.body = JSON.stringify(await request.json().catch(() => ({})));
    const r = await fetch(base, opts);
    const d = await r.json();
    return new Response(JSON.stringify(d), { status: r.status, headers: {"Content-Type":"application/json"} });
  } catch(e) {
    return new Response(JSON.stringify({error:"فشل الاتصال"}), {status:500, headers:{"Content-Type":"application/json"}});
  }
}
