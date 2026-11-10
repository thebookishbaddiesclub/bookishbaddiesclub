import {notFound} from "next/navigation";
import {supabase} from "@/lib/supabase";
import {validTickets} from "@/lib/tickets";
import PassChoice from "@/components/PassChoice";
import {passesFor} from "@/lib/server/event-passes";
export const dynamic="force-dynamic";
export default async function Booking({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const {data}=await supabase.from("events").select("title,city,category,starts_at,ticketing").eq("id",id).maybeSingle();
  if(!data || !validTickets(data.ticketing)) notFound();
  return <section className="mx-auto max-w-2xl space-y-6"><a href="/evenements">← Événements</a><h1 className="font-serif text-4xl">{data.title}</h1><p>{new Date(data.starts_at).toLocaleString("fr-FR",{dateStyle:"long",timeStyle:"short",timeZone:"Europe/Paris"})} · {data.category==="twitch"?"En ligne":data.city}</p>
    {Date.parse(data.starts_at)<=Date.now()?<p>Les réservations sont closes.</p>:<PassChoice id={id} config={data.ticketing} passes={await passesFor(id)}/>}</section>;
}
