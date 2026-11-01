import {isAdmin,json,getMembers,saveMembers,store} from "./_shared.mjs";
export default async (event) => {
  if(!isAdmin(event)) return json(401,{error:"Yönetici girişi gerekli."});
  const id=event.queryStringParameters?.id;
  if(event.httpMethod==="POST"){
    let b={};try{b=JSON.parse(event.body||"{}")}catch{return json(400,{error:"Geçersiz JSON."})}
    if(!b.id||!b.data||!/^image\/(jpeg|png|webp)$/.test(b.mime||""))return json(400,{error:"Görsel verisi geçersiz."});
    const bytes=Buffer.from(b.data,"base64");if(bytes.length>5*1024*1024)return json(413,{error:"Görsel 5 MB altında olmalı."});
    const all=await getMembers(),m=all.find(x=>x.id===b.id);if(!m)return json(404,{error:"Üye bulunamadı."});
    const key=`member-images/${m.id}-${Date.now()}.${b.mime.split("/")[1].replace("jpeg","jpg")}`;
    const s=await store();await s.set(key,bytes,{metadata:{contentType:b.mime}});
    if(m.imageKey)await s.delete(m.imageKey);
    m.imageKey=key;m.imageUrl=`/.netlify/functions/member-image?id=${encodeURIComponent(m.id)}`;
    await saveMembers(all);return json(200,{ok:true,imageUrl:m.imageUrl});
  }
  if(event.httpMethod==="DELETE"){
    if(!id)return json(400,{error:"Üye kimliği eksik."});
    const all=await getMembers(),m=all.find(x=>x.id===id);if(m?.imageKey)await (await store()).delete(m.imageKey);
    if(m){delete m.imageKey;delete m.imageUrl;await saveMembers(all)}
    return json(200,{ok:true});
  }
  if(event.httpMethod==="GET"){
    const all=await getMembers(),m=all.find(x=>x.id===id);if(!m?.imageKey)return {statusCode:404,body:"Not found"};
    const s=await store(),blob=await s.get(m.imageKey,{type:"arrayBuffer"});if(!blob)return {statusCode:404,body:"Not found"};
    const ext=m.imageKey.endsWith(".png")?"image/png":m.imageKey.endsWith(".webp")?"image/webp":"image/jpeg";
    return {statusCode:200,headers:{"Content-Type":ext,"Cache-Control":"public, max-age=300"},body:Buffer.from(blob).toString("base64"),isBase64Encoded:true};
  }
  return json(405,{error:"Method not allowed"});
};