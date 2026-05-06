// هذا الكود سيعمل كسيرفر وسيط (Proxy) داخل Cloudflare نفسها
export async function onRequestPost(context) {
  const targetUrl = "[http://fi13.bot-hosting.cloud:21346/analyze](http://fi13.bot-hosting.cloud:21346/analyze)";

  try {
    const body = await context.request.json();

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "فشل الاتصال بالسيرفر" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
