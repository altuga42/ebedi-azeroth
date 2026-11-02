import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

export const store = () => getStore("ebedi-azeroth-members");
const secret = () => process.env.ADMIN_PASSWORD || "";
const cookieName = "ea_admin";
const sign = (value) => crypto.createHmac("sha256", secret()).update(value).digest("hex");

export function isAdmin(request) {
  if (!secret()) return false;
  const cookie = request.headers.get("cookie") || "";
  const token = cookie.split(";").map(x => x.trim()).find(x => x.startsWith(cookieName + "="))?.slice(cookieName.length + 1);
  if (!token) return false;
  const [expiry, mac] = token.split(".");
  if (!expiry || !mac || Number(expiry) < Date.now()) return false;
  const expected = sign(expiry);
  const a = Buffer.from(mac), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function cookieHeader(value, maxAge = 86400) {
  const exp = String(Date.now() + maxAge * 1000);
  return `${cookieName}=${value ? exp + "." + sign(exp) : ""}; HttpOnly; Secure; SameSite=Strict; Path=/.netlify/functions/; Max-Age=${value ? maxAge : 0}`;
}

export const json = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", ...headers }
});

export async function getMembers() {
  return (await store().get("members.json", { type: "json" })) || [];
}
export async function saveMembers(members) {
  await store().setJSON("members.json", members);
}
