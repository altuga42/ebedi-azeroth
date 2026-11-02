import { isAdmin, json, getMembers, saveMembers, store } from "./_shared.mjs";

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (request.method === "GET") {
      if (!id) return new Response("Not found", { status: 404 });
      const members = await getMembers();
      const member = members.find(x => x.id === id);
      if (!member?.imageKey) return new Response("Not found", { status: 404 });
      const blob = await (await store()).get(member.imageKey, { type: "arrayBuffer" });
      if (!blob) return new Response("Not found", { status: 404 });
      const contentType = member.imageKey.endsWith(".png") ? "image/png" : member.imageKey.endsWith(".webp") ? "image/webp" : "image/jpeg";
      return new Response(blob, { status: 200, headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=300" } });
    }

    if (!isAdmin(request)) return json(401, { error: "Yönetici girişi gerekli." });

    if (request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return json(400, { error: "Geçersiz JSON." }); }
      if (!body.id || !body.data || !/^image\/(jpeg|png|webp)$/.test(body.mime || "")) return json(400, { error: "Görsel verisi geçersiz." });
      const bytes = Buffer.from(body.data, "base64");
      if (bytes.length > 5 * 1024 * 1024) return json(413, { error: "Görsel 5 MB altında olmalı." });
      const all = await getMembers();
      const member = all.find(x => x.id === body.id);
      if (!member) return json(404, { error: "Üye bulunamadı." });
      const extension = body.mime.split("/")[1].replace("jpeg", "jpg");
      const key = `member-images/${member.id}-${Date.now()}.${extension}`;
      const blobStore = await store();
      await blobStore.set(key, bytes, { metadata: { contentType: body.mime } });
      if (member.imageKey) await blobStore.delete(member.imageKey);
      member.imageKey = key;
      member.imageUrl = `/.netlify/functions/member-image?id=${encodeURIComponent(member.id)}`;
      await saveMembers(all);
      return json(200, { ok: true, imageUrl: member.imageUrl });
    }

    if (request.method === "DELETE") {
      if (!id) return json(400, { error: "Üye kimliği eksik." });
      const all = await getMembers();
      const member = all.find(x => x.id === id);
      if (member?.imageKey) await (await store()).delete(member.imageKey);
      if (member) { delete member.imageKey; delete member.imageUrl; await saveMembers(all); }
      return json(200, { ok: true });
    }
    return json(405, { error: "Method not allowed" }, { Allow: "GET, POST, DELETE" });
  } catch (error) {
    console.error("member-image function error:", error);
    return json(500, { error: "Görsel işlemi başarısız oldu." });
  }
}
