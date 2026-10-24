export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const data = await request.json();

    const webhook = process.env.DISCORD_WEBHOOK_URL;

    if (!webhook) {
      return new Response(
        JSON.stringify({ error: "Başvuru sistemi yapılandırılmamış." }),
        { status: 500 }
      );
    }

    const embed = {
      title: "🐺 Ebedi Azeroth — Yeni Üye Başvurusu",
      color: 16753920,
      fields: [
        { name: "Karakter adı", value: String(data.character || "Belirtilmedi").slice(0, 1024) },
        { name: "Sınıf", value: String(data.class || "Belirtilmedi").slice(0, 1024) },
        { name: "Seviye", value: String(data.level || "Belirtilmedi").slice(0, 1024) },
        { name: "Realm", value: String(data.realm || "Belirtilmedi").slice(0, 1024) },
        { name: "Discord", value: String(data.discord || "Belirtilmedi").slice(0, 1024) },
        { name: "Katılma nedeni", value: String(data.reason || "Belirtilmedi").slice(0, 1024) }
      ]
    };

    const result = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] })
    });

    if (!result.ok) {
      return new Response(
        JSON.stringify({ error: "Discord'a gönderilemedi." }),
        { status: 502 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Başvuru işlenemedi." }),
      { status: 400 }
    );
  }
};
