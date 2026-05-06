export async function onRequest(context) {
  const { request } = context;
  const targetUrl = "http://fi13.bot-hosting.cloud:21346/analyze";

  // إذا قام أحد بفتح الرابط في المتصفح (GET)
  if (request.method === "GET") {
    return new Response("الدالة تعمل بنجاح! يرجى استخدام POST للتحليل.", { status: 200 });
  }

  // معالجة طلب التحليل (POST)
  try {
    const body = await request.json();
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
    return new Response(JSON.stringify({ error: "فشل الاتصال بسيرفر Pterodactyl" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
