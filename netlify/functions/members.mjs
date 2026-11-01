import crypto from "node:crypto";
import {isAdmin,json,getMembers,saveMembers} from "./_shared.mjs";
export default async (event) => {
  if(event.httpMethod==="GET") return json(200,{members:await getMembers()});
  if(!isAdmin(event)) return json(401,{error:"Yönetici girişi gerekli."});
  if(event.httpMethod==="POST"){
    let data={};try{data=JSON.parse(event.body||"{}")}catch{return json(400,{error:"Geçersiz JSON."})}
    const all=await getMembers(), id=data.id||crypto.randomUUID();
    const member={id,memberName:String(data.memberName||"").slice(0,80),characterName:String(data.characterName||"").slice(0,80),surname:String(data.surname||"").slice(0,80),className:String(data.className||"").slice(0,80),spec:String(data.spec||"").slice(0,80),player:String(data.player||"").slice(0,80),focus:String(data.focus||"").slice(0,80),level:String(data.level||"").slice(0,3)};
    if(!member.memberName||!member.characterName)return json(400,{error:"Üye ve karakter adı zorunlu."});
    const old=all.find(x=>x.id===id);if(old){member.imageKey=old.imageKey;member.imageUrl=old.imageUrl;all[all.findIndex(x=>x.id===id)]=member}else all.push(member);
    await saveMembers(all);return json(200,{member});
  }
  if(event.httpMethod==="DELETE"){
    const id=event.queryStringParameters?.id;if(!id)return json(400,{error:"Üye kimliği eksik."});
    const all=await getMembers(), m=all.find(x=>x.id===id);if(m?.imageKey){const {store}=await import("./_shared.mjs");await (await store()).delete(m.imageKey)}
    await saveMembers(all.filter(x=>x.id!==id));return json(200,{ok:true});
  }
  return json(405,{error:"Method not allowed"});
};