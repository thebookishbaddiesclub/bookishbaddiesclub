import {cookies} from "next/headers";
import {validSession} from "@/lib/admin-session";
import {getStockDatabase} from "@/lib/server/clients";
import {passDetails} from "@/lib/event-pass";
async function authorized(){return validSession((await cookies()).get("admin_session")?.value);}
const fail=(error:string,status:number)=>Response.json({error},{status});
export async function GET(){
  if(!await authorized())return fail("Connexion requise.",401);
  const {data,error}=await getStockDatabase().from("event_passes").select("id,first_id,second_id,cents");
  return error?fail("La mise à jour Supabase des pass est nécessaire ou la liste est indisponible.",503):Response.json(data,{headers:{"Cache-Control":"private,no-store"}});
}
export async function POST(req:Request){
  if(!await authorized())return fail("Connexion requise.",401);
  const {first,second,cents}=await req.json();
  if(typeof first!=="string" || typeof second!=="string" || first===second || !Number.isSafeInteger(cents) || cents<50)return fail("Choisis deux événements distincts et un prix valide.",400);
  const db=getStockDatabase(),[first_id,second_id]=[first,second].sort();
  const {data}=await db.from("events").select("id,title,starts_at,ticketing").in("id",[first_id,second_id]);
  const a=data?.find(e=>e.id===first_id),b=data?.find(e=>e.id===second_id);
  if(!a||!b||!passDetails({id:"",first_id,second_id,cents},a,b))return fail("Choisis deux billetteries à venir et un prix inférieur aux deux billets individuels.",400);
  const {error}=await db.from("event_passes").upsert({first_id,second_id,cents},{onConflict:"first_id,second_id"});
  return error?fail("Impossible d’enregistrer le pass.",503):Response.json({ok:true});
}
export async function DELETE(req:Request){
  if(!await authorized())return fail("Connexion requise.",401);
  const {id}=await req.json();
  const {error}=await getStockDatabase().from("event_passes").delete().eq("id",id);
  return error?fail("Impossible de retirer le pass.",503):Response.json({ok:true});
}
