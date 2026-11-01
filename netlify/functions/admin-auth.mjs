import { isAdmin, cookieHeader, json } from "./_shared.mjs";
export default async (event) => {
  if(event.httpMethod==="DELETE") return json(200,{ok:true},{ "Set-Cookie":cookieHeader("",0) });
  if(event.httpMethod!=="POST") return json(405,{error:"Method not allowed"});
  const expected=process.env.ADMIN_PASSWORD||"";
  if(!expected) return json(500,{error:"Netlify Environment variables bölümünde ADMIN_PASSWORD tanımlanmamış."});
  let body={};try{body=JSON.parse(event.body||"{}")}catch{}
  if(body.password!==expected) return json(401,{error:"Şifre yanlış."});
  return json(200,{ok:true},{ "Set-Cookie":cookieHeader(true) });
};