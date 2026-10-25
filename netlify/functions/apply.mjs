export default async (request) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (request.method === "OPTIONS") return new Response("", { status: 204, headers });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });

  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return new Response(JSON.stringify({ error: "Başvuru sistemi ayarı eksik." }), { status: 500, headers });

  try {
    const data = await request.json();
    const clean = (v, max = 1000) => String(v ?? "").trim().slice(0, max);
    const character = clean(data.character, 40);
    const playerClass = clean(data.class, 40);
    const level = clean(data.level, 3);
    const realm = clean(data.realm, 80);
    const discordName = clean(data.discordName, 80);
    const role = clean(data.role, 40);
    const reason = clean(data.reason, 1000);

    if (!character || !playerClass || !level || !realm || !discordName || !reason) {
      return new Response(JSON.stringify({ error: "Zorunlu alanları doldur." }), { status: 400, headers });
    }

    const payload = {
      username: "Ebedi Azeroth Başvuru",
      embeds: [{
        title: "⚔️ Yeni Guild Başvurusu",
        color: 14500644,
        fields: [
          { name: "Karakter", value: character, inline: true },
          { name: "Sınıf", value: playerClass, inline: true },
          { name: "Seviye", value: level, inline: true },
          { name: "Sunucu / Realm", value: realm, inline: true },
          { name: "Discord kullanıcı adı", value: discordName, inline: true },
          { name: "Tercih edilen rol", value: role || "Belirtilmedi", inline: true },
          { name: "Guild'e katılma nedeni", value: reason }
        ],
        footer: { text: "Ebedi Azeroth • FOR THE HORDE!" },
        timestamp: new Date().toISOString()
      }]
    };
console.log("BAŞVURU PAYLOAD:", JSON.stringify(payload));
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Discord'a gönderilemedi. Webhook ayarını kontrol edin." }), { status: 502, headers });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ error: "Başvuru işlenirken bir hata oluştu." }), { status: 400, headers });
  }
};
console.log("DISCORD YANITI:", response.status, await response.text());
