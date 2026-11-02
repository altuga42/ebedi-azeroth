import crypto from "node:crypto";
import { isAdmin, json, store } from "./_shared.mjs";

const keyName = "member-gallery.json";
async function readGallery() {
  return (await store().get(keyName, { type: "json" })) || [];
}
async function writeGallery(images) {
  await store().setJSON(keyName, images);
}
export default async (event) => {
  if (event.httpMethod === "GET" && event.queryStringParameters?.id) {
    const image = (await readGallery()).find(x => x.id === event.queryStringParameters.id);
    if (!image) return { statusCode: 404, body: "Not found" };
    const blob = await (await store()).get(image.key, { type: "arrayBuffer" });
    if (!blob) return { statusCode: 404, body: "Not found" };
    return { statusCode: 200, headers: { "Content-Type": image.mime, "Cache-Control": "public, max-age=300" }, body: Buffer.from(blob).toString("base64"), isBase64Encoded: true };
  }
  if (event.httpMethod === "GET") {
    const images = await readGallery();
    return json(200, { images: images.map(({ id }) => ({
      id, url: `/.netlify/functions/member-gallery?id=${encodeURIComponent(id)}`
    })) });
  }
  if (!isAdmin(event)) return json(401, { error: "Yönetici girişi gerekli." });
  const id = event.queryStringParameters?.id;
  if (event.httpMethod === "POST") {
    let body = {};
    try { body = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "Geçersiz JSON." }); }
    if (!body.data || !/^image\/(jpeg|png|webp)$/.test(body.mime || "")) return json(400, { error: "Görsel verisi geçersiz." });
    const bytes = Buffer.from(body.data, "base64");
    if (bytes.length > 5 * 1024 * 1024) return json(413, { error: "Görsel 5 MB altında olmalı." });
    const ext = body.mime.split("/")[1].replace("jpeg", "jpg");
    const imageId = crypto.randomUUID(), key = `member-gallery/${imageId}.${ext}`;
    const blobStore = await store();
    await blobStore.set(key, bytes, { metadata: { contentType: body.mime } });
    const images = await readGallery();
    images.push({ id: imageId, key, mime: body.mime });
    await writeGallery(images);
    return json(200, { ok: true, id: imageId });
  }
  if (event.httpMethod === "DELETE") {
    if (!id) return json(400, { error: "Görsel kimliği eksik." });
    const images = await readGallery(), image = images.find(x => x.id === id);
    if (image) {
      await (await store()).delete(image.key);
      await writeGallery(images.filter(x => x.id !== id));
    }
    return json(200, { ok: true });
  }
  return json(405, { error: "Method not allowed" });
};
