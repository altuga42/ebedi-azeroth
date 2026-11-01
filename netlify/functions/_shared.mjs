import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const store = () => getStore("ebedi-azeroth-members");
const secret = () => process.env.ADMIN_PASSWORD || "";
const cookieName = "ea_admin";
const sign = (value) => crypto.createHmac("sha256", secret()).update(value).digest("hex");
export function isAdmin(event) {
  if (!secret()) return false;
  const cookie = event.headers.cookie || event.headers.Cookie || "";
  const token = cookie.split(";").map(x=>x.trim()).find(x=>x.startsWith(cookieName+"="))?.slice(cookieName.length+1);
  if (!token) return false;
  const [expiry,mac] = token.split(".");
  if (!expiry || !mac || Number(expiry)<Date.now()) return false;
  return crypto.timingSafeEqual(Buffer.from(mac),Buffer.from(sign(expiry)));
}
export function cookieHeader(value, maxAge=86400) {
  const exp=String(Date.now()+maxAge*1000);
  return `${cookieName}=${value?exp+"."+sign(exp):""}; HttpOnly; Secure; SameSite=Strict; Path=/.netlify/functions/; Max-Age=${value?maxAge:0}`;
}
export const json=(statusCode,body,headers={})=>({statusCode,headers:{"Content-Type":"application/json; charset=utf-8",...headers},body:JSON.stringify(body)});
export async function getMembers(){return (await store().get("members.json",{type:"json"}))||[]}
export async function saveMembers(m){await store().setJSON("members.json",m)}
export {store};