import crypto from "node:crypto";
import { isAdmin, json, store } from "./_shared.mjs";
const indexKey = "media-gallery.json";
async function readItems(){ return (await store().get(indexKey,{type:"json"})) || []; }
export default async function handler(request){
 try {
  const url=new URL(request.url), id=url.searchParams.get("id"), method=request.method;
  if(method==="GET" && id){ const item=(await readItems()).find(x=>x.id===id); if(!item||!item.key)return new Response("Not found",{status:404}); const bytes=await store().get(item.key,{type:"arrayBuffer"}); if(!bytes)return new Response("Not found",{status:404}); return new Response(Buffer.from(bytes),{headers:{"Content-Type":item.mime,"Cache-Control":"public,max-age=300"}}); }
  if(method==="GET") return json(200,{items:await readItems()});
  if(!isAdmin(request)) return json(401,{error:"Yönetici girişi gerekli."});
  if(method==="POST"){
   const b=await request.json(); if(!b.title||(!b.video&&!b.data))return json(400,{error:"Başlık ve fotoğraf veya video bağlantısı gerekli."});
   const item={id:crypto.randomUUID(),title:String(b.title).slice(0,120),category:["raid","pvp","fun"].includes(b.category)?b.category:"fun",owner:String(b.owner||"Guild üyesi").slice(0,80),date:new Date().toLocaleDateString("tr-TR"),desc:String(b.desc||"").slice(0,500),video:String(b.video||"").slice(0,500),src:"",mime:""};
   if(b.data){if(!/^image\/(jpeg|png|webp)$/.test(b.mime||""))return json(400,{error:"JPEG, PNG veya WEBP destekleniyor."});const bytes=Buffer.from(b.data,"base64");if(bytes.length>5*1024*1024)return json(413,{error:"Fotoğraf en fazla 5 MB olabilir."});const ext=b.mime.split("/")[1].replace("jpeg","jpg");item.key=`media-gallery/${item.id}.${ext}`;item.mime=b.mime;await store().set(item.key,bytes,{metadata:{contentType:b.mime}});item.src=`/.netlify/functions/media-gallery?id=${item.id}`;}
   const items=await readItems();items.unshift(item);await store().setJSON(indexKey,items);return json(200,{ok:true,item});
  }
  if(method==="DELETE"){if(!id)return json(400,{error:"İçerik kimliği eksik."});const items=await readItems(),item=items.find(x=>x.id===id);if(item?.key)await store().delete(item.key);await store().setJSON(indexKey,items.filter(x=>x.id!==id));return json(200,{ok:true});}
  return json(405,{error:"Method not allowed"});
 }catch(e){console.error("media-gallery error",e);return json(500,{error:"Sunucu hatası."});}
}
