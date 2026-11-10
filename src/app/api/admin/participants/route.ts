import {cookies} from "next/headers";
import {validSession} from "@/lib/admin-session";
import {getStockDatabase} from "@/lib/server/clients";
export async function GET(request:Request) {
  if (!await validSession((await cookies()).get("admin_session")?.value)) return Response.json({error:"Connexion requise"},{status:401});
  const event = new URL(request.url).searchParams.get("event");
  if(!event || !/^[0-9a-f-]{36}$/i.test(event)) return Response.json({error:"Événement invalide"},{status:400});
  let {data,error} = await getStockDatabase().from("event_bookings").select("offer,phone,email,guests,questions").or("event_id.eq."+event+",second_event_id.eq."+event).eq("state","paid");
  if(error?.code==="42703") ({data,error}=await getStockDatabase().from("event_bookings").select("offer,phone,email,guests,questions").eq("event_id",event).eq("state","paid"));
  return Response.json(error ? {error:"Liste indisponible"} : {bookings:data},{status:error?503:200,headers:{"Cache-Control":"private, no-store"}});
}
