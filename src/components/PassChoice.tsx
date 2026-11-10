"use client";
import {useState} from "react";
import {euros,type PassDetails} from "@/lib/event-pass";
import type {TicketConfig} from "@/lib/tickets";
import TicketForm from "./TicketForm";
export default function PassChoice({id,config,passes}:{id:string;config:TicketConfig;passes:PassDetails[]}) {
  const [selected,setSelected]=useState("");
  const pass=passes.find(p=>p.id===selected);
  return <div className="space-y-6">
    {passes.length>0 && <fieldset className="space-y-3 rounded-3xl border p-6"><legend className="font-serif text-2xl">Ta réservation</legend>
      <label className="block"><input type="radio" name="pass" checked={!pass} onChange={()=>setSelected("")}/> Cet événement uniquement</label>
      {passes.map(p=><label className="block" key={p.id}><input type="radio" name="pass" checked={p.id===selected} onChange={()=>setSelected(p.id)}/> Ajouter « {id===p.first.id?p.second.title:p.first.title} » · {euros(p.config.offers[0].cents)} pour les deux · économise {euros(p.total-p.config.offers[0].cents)}</label>)}
    </fieldset>}
    <TicketForm key={selected} id={id} config={pass?.config || config} pass={pass}/>
  </div>;
}
