import crypto from "node:crypto";
import { isAdmin, json, store } from "./_shared.mjs";

const keyName = "member-gallery.json";

async function readGallery() {
  return (await store().get(keyName, { type: "json" })) || [];
}

async function writeGallery(images) {
  await store().setJSON(keyName, images);
}

export default async function handler(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const method = request.method;

    // Görselin kendisini getir
    if (method === "GET" && id) {
      const image = (await readGallery()).find((x) => x.id === id);
      if (!image) return new Response("Not found", { status: 404 });

      const blob = await store().get(image.key, { type: "arrayBuffer" });
      if (!blob) return new Response("Not found", { status: 404 });

      return new Response(blob, {
        status: 200,
        headers: {
          "Content-Type": image.mime,
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    // Galerideki görselleri listele
    if (method === "GET") {
      const images = await readGallery();

      return json(200, {
        images: images.map(({ id }) => ({
          id,
          url: `/.netlify/functions/member-gallery?id=${encodeURIComponent(id)}`,
        })),
      });
    }

    // Yükleme ve silme işlemleri yönetici girişi gerektirir
    if (!isAdmin(request)) {
      return json(401, { error: "Yönetici girişi gerekli." });
    }

    // Yeni görsel yükle
    if (method === "POST") {
      let body = {};

      try {
        body = await request.json();
      } catch {
        return json(400, { error: "Geçersiz JSON." });
      }

      if (
        !body.data ||
        !/^image\/(jpeg|png|webp)$/.test(body.mime || "")
      ) {
        return json(400, { error: "Görsel verisi geçersiz." });
      }

      const bytes = Buffer.from(body.data, "base64");

      if (bytes.length > 5 * 1024 * 1024) {
        return json(413, { error: "Görsel 5 MB altında olmalı." });
      }

      const ext = body.mime.split("/")[1].replace("jpeg", "jpg");
      const imageId = crypto.randomUUID();
      const key = `member-gallery/${imageId}.${ext}`;

      const blobStore = store();

      await blobStore.set(key, bytes, {
        metadata: { contentType: body.mime },
      });

      const images = await readGallery();
      images.push({ id: imageId, key, mime: body.mime });
      await writeGallery(images);

      return json(200, { ok: true, id: imageId });
    }

    // Görsel sil
    if (method === "DELETE") {
      if (!id) {
        return json(400, { error: "Görsel kimliği eksik." });
      }

      const images = await readGallery();
      const image = images.find((x) => x.id === id);

      if (image) {
        await store().delete(image.key);
        await writeGallery(images.filter((x) => x.id !== id));
      }

      return json(200, { ok: true });
    }

    return json(
      405,
      { error: "Method not allowed" },
      { Allow: "GET, POST, DELETE" }
    );
  } catch (error) {
    console.error("member-gallery function error:", error);
    return json(500, { error: "Internal server error" });
  }
}
