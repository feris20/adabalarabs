export async function onRequest(context) {
  try {
    const r = await fetch("http://fi5.bot-hosting.net:20035/leaderboard");
    const d = await r.json();
    return new Response(JSON.stringify(d), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
