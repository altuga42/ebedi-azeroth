import crypto from "node:crypto";
import { isAdmin, json, getMembers, saveMembers, store } from "./_shared.mjs";

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    if (request.method === "GET") return json(200, { members: await getMembers() });
    if (!isAdmin(request)) return json(401, { error: "Yönetici girişi gerekli." });

    if (request.method === "POST") {
      let data;
      try { data = await request.json(); } catch { return json(400, { error: "Geçersiz JSON." }); }
      const all = await getMembers();
      const id = data.id || crypto.randomUUID();
      const member = data.imageOnly ? { id } : {
        id,
        memberName: String(data.memberName || "").slice(0, 80),
        characterName: String(data.characterName || "").slice(0, 80),
        surname: String(data.surname || "").slice(0, 80),
        className: String(data.className || "").slice(0, 80),
        spec: String(data.spec || "").slice(0, 80),
        player: String(data.player || "").slice(0, 80),
        focus: String(data.focus || "").slice(0, 80),
        level: String(data.level || "").slice(0, 3)
      };
      if (!data.imageOnly && (!member.memberName || !member.characterName)) return json(400, { error: "Üye ve karakter adı zorunlu." });
      const oldIndex = all.findIndex(x => x.id === id);
      if (oldIndex >= 0) {
        member.imageKey = all[oldIndex].imageKey;
        member.imageUrl = all[oldIndex].imageUrl;
        all[oldIndex] = member;
      } else all.push(member);
      await saveMembers(all);
      return json(200, { member });
    }

    if (request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return json(400, { error: "Üye kimliği eksik." });
      const all = await getMembers();
      const member = all.find(x => x.id === id);
      if (member?.imageKey) await (await store()).delete(member.imageKey);
      await saveMembers(all.filter(x => x.id !== id));
      return json(200, { ok: true });
    }
    return json(405, { error: "Method not allowed" }, { Allow: "GET, POST, DELETE" });
  } catch (error) {
    console.error("members function error:", error);
    return json(500, { error: "Üye verileri alınamadı veya kaydedilemedi." });
  }
}
