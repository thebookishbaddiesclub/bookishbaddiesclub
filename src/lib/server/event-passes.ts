import {supabase} from "@/lib/supabase";
import {passDetails,type PassEvent,type PassRow} from "@/lib/event-pass";
export async function passesFor(id:string) {
  if(!/^[0-9a-f-]{36}$/i.test(id)) return [];
  const {data:rows} = await supabase.from("event_passes").select("id,first_id,second_id,cents").or("first_id.eq."+id+",second_id.eq."+id);
  if(!rows?.length) return [];
  const ids=[...new Set(rows.flatMap(r=>[r.first_id,r.second_id]))];
  const {data:events}=await supabase.from("events").select("id,title,starts_at,ticketing").in("id",ids);
  const byId=new Map((events || []).map(e=>[e.id,e as PassEvent]));
  return (rows as PassRow[]).flatMap(row=>{
    const first=byId.get(row.first_id),second=byId.get(row.second_id);
    const details=first && second && passDetails(row,first,second);
    return details?[details]:[];
  });
}
