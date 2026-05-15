export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // استخراج المسار بعد كلمة /api
  // مثال: إذا طلب الموقع /api/admin/login، سيحولها السيرفر إلى /admin/login
  const targetPath = url.pathname.replace(/^\/api/, '');
  const targetUrl = `http://fi13.bot-hosting.cloud:21346${targetPath}`;

  // تجهيز الطلب لنسخه وإرساله لسيرفر Pterodactyl
  const fetchOptions = {
    method: request.method,
    headers: request.headers,
  };

  // إضافة محتوى الطلب (Body) في حال لم يكن GET
  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = request.body;
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: "السيرفر لا يستجيب (Pterodactyl)" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
