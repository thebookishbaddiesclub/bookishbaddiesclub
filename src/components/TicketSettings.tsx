"use client";
import { useState, useEffect } from "react";
import { blankTickets, type TicketConfig, type Guest } from "@/lib/tickets";
export function TicketSettings({value,change}:{value:TicketConfig|null;change:(c:TicketConfig|null)=>void}) {
  return <fieldset className="space-y-4 rounded-2xl border p-5"><legend>Billetterie</legend>
    <label><input type="checkbox" checked={!!value} onChange={e=>change(e.target.checked ? structuredClone(blankTickets) : null)}/> Vendre les places sur le site</label>
    {value && <>
      <label className="block">Nombre total de places<input className="admin-input" type="number" min="1" value={value.capacity || ""} onChange={e=>change({...value,capacity:Number(e.target.value)})}/></label>
      {value.offers.map((o,i)=>{
        const update=(patch:Partial<typeof o>)=>change({...value,offers:value.offers.map((old,j)=>j===i?{...old,...patch}:old)});
        return <fieldset key={i} className="grid gap-3 rounded-xl border p-3 sm:grid-cols-3"><legend>Tarif {i+1}</legend>
          <label>Nom<input className="admin-input" value={o.name} onChange={e=>update({name:e.target.value})}/></label>
          <label>Prix total (€)<input className="admin-input" type="number" min=".50" step=".01" value={o.cents/100 || ""} onChange={e=>update({cents:Math.round(Number(e.target.value)*100)})}/></label>
          <label>Places incluses<input className="admin-input" type="number" min="1" max="20" value={o.seats || ""} onChange={e=>update({seats:Number(e.target.value)})}/></label>
          {value.offers.length>1 && <button type="button" onClick={()=>change({...value,offers:value.offers.filter((_,j)=>i!==j)})}>Retirer ce tarif</button>}
        </fieldset>;
      })}
      <button type="button" onClick={()=>change({...value,offers:[...value.offers,{name:"Pack duo",seats:2,cents:2000}]})}>+ Ajouter un tarif ou un pack</button>
      <h3 className="font-bold">Questionnaire d’inscription</h3><p>Nom et prénom pour chaque place, un téléphone pour la réservation.</p>
      <label><input type="checkbox" checked={value.diet} onChange={e=>change({...value,diet:e.target.checked})}/> Demander les régimes alimentaires (facultatif)</label>
      <label className="block">Questions supplémentaires facultatives (une par ligne)<textarea className="admin-input" value={value.questions.join("\n")} onChange={e=>change({...value,questions:e.target.value.split("\n")})}/></label>
    </>}
  </fieldset>;
}
type Booking = {offer:string;phone:string;email:string;guests:Guest[];questions:string[]};
export function Participants({event}:{event:string}) {
  const [rows,setRows]=useState<Booking[]>([]),[status,setStatus]=useState("Chargement…");
  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/admin/participants?event="+encodeURIComponent(event),{signal:controller.signal,cache:"no-store"}).then(async res=>{
      if(!res.ok) throw Error();
      const {bookings}=await res.json(); setRows(bookings); setStatus(bookings.length?"":"Aucune réservation payée.");
    }).catch(()=>{if(!controller.signal.aborted)setStatus("Liste indisponible.");});
    return ()=>controller.abort();
  },[event]);
  return <section className="space-y-3"><h3 className="font-bold">Participants confirmés</h3>{status}<ul>{rows.map((b,i)=><li key={i} className="border-t py-3"><strong>{b.offer}</strong> · {b.email} · {b.phone}<ul>{b.guests.map((g,j)=><li key={j}>{g.first} {g.last}{g.diet && <p>Régime alimentaire · {g.diet}</p>}{b.questions.map((q,k)=><p key={k}>{q} · {g.answers[k] || "—"}</p>)}</li>)}</ul></li>)}</ul></section>;
}
