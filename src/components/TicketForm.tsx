"use client";
import {useState} from "react";
import type {TicketConfig} from "@/lib/tickets";
import {euros,type PassDetails} from "@/lib/event-pass";
export default function TicketForm({id,config,pass}:{id:string;config:TicketConfig;pass?:PassDetails}) {
  const [index,setIndex]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const offer=config.offers[index];
  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    const form=new FormData(e.currentTarget);
    const guests=Array.from({length:offer.seats},(_,i)=>({
      first:form.get("first"+i),last:form.get("last"+i),diet:form.get("diet"+i) || "",
      answers:config.questions.map((_,j)=>form.get("answer"+i+"-"+j) || "")
    }));
    setBusy(true);setError("");
    try {
      const res=await fetch("/api/tickets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,index,passId:pass?.id,expectedTotal:pass?.total,configuration:config,phone:form.get("phone"),guests})});
      const data=await res.json();
      if(!res.ok || !data.url) throw Error(data.error || "Réservation indisponible.");
      location.assign(data.url);
    } catch(err) {setError(err instanceof Error?err.message:"Réessaie dans un instant.");setBusy(false);}
  }
  return <form onSubmit={submit} className="space-y-6"><label className="block">Choisis ton billet<select className="admin-input" value={index} onChange={e=>setIndex(Number(e.target.value))}>{config.offers.map((o,i)=><option key={i} value={i}>{o.name} · {o.seats} place(s) · {(o.cents/100).toLocaleString("fr-FR",{style:"currency",currency:"EUR"})}</option>)}</select></label>
    <label className="block">Téléphone de contact<input className="admin-input" name="phone" type="tel" autoComplete="tel" required maxLength={30}/></label>
    {Array.from({length:offer.seats},(_,i)=><fieldset key={i} className="space-y-3 rounded-2xl border p-5"><legend>Participant {i+1}</legend>
      <label className="block">Nom<input className="admin-input" name={"last"+i} required maxLength={100}/></label>
      <label className="block">Prénom<input className="admin-input" name={"first"+i} required maxLength={100}/></label>
      {config.diet && <label className="block">Régime alimentaire (facultatif)<input className="admin-input" name={"diet"+i} maxLength={300}/></label>}
      {config.questions.map((q,j)=><label key={j} className="block">{q} (facultatif)<input className="admin-input" name={"answer"+i+"-"+j} maxLength={500}/></label>)}
    </fieldset>)}
    {pass && <section className="space-y-2 rounded-2xl border p-5"><h2 className="font-serif text-2xl">Ton panier</h2>{[pass.first,pass.second].map((event,i)=><p key={event.id}>{event.title} · 1 place · {euros(pass.prices[i])}</p>)}<p className="text-bb-rose">Réduction pass 2 événements · −{euros(pass.total-offer.cents)}</p><strong>Total à payer · {euros(offer.cents)}</strong></section>}
    {error && <p role="alert">{error}</p>}
    <button className="rounded-full bg-bb-rose px-6 py-3 text-white" disabled={busy}>{busy?"Ouverture du paiement…":"Payer "+(offer.cents/100).toLocaleString("fr-FR",{style:"currency",currency:"EUR"})}</button>
  </form>;
}
