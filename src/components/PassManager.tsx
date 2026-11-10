"use client";
import {useState,useEffect} from "react";
import {euros,singlePrice,type PassRow,type PassEvent} from "@/lib/event-pass";
export default function PassManager({events}:{events:PassEvent[]}) {
  const [a,setA]=useState(""),[b,setB]=useState(""),[price,setPrice]=useState(""),[rows,setRows]=useState<PassRow[]>([]),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  const options=events.filter(e=>Date.parse(e.starts_at)>Date.now()&&Number.isFinite(singlePrice(e.ticketing)));
  const title=(id:string)=>events.find(e=>e.id===id)?.title || "Événement";
  async function load(){
    try {const res=await fetch("/api/admin/passes",{cache:"no-store"});const value=await res.json(); if(!res.ok)throw Error(value.error);setRows(value);}
    catch(e){setMessage(e instanceof Error?e.message:"Liste indisponible.");}
  }
  useEffect(()=>{void load();},[]);
  async function save(method:string,body:object){
    setBusy(true);setMessage("");
    try {const r=await fetch("/api/admin/passes",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const result=await r.json();if(!r.ok)throw Error(result.error);setMessage(method==="POST"?"Pass enregistré.":"Pass retiré de la vente.");await load();}
    catch(e){setMessage(e instanceof Error?e.message:"Réessaie.");}finally{setBusy(false);}
  }
  const opts=(omit:string)=>options.filter(e=>e.id!==omit).map(e=><option key={e.id} value={e.id}>{e.title} · {euros(singlePrice(e.ticketing))}</option>);
  const first=options.find(e=>e.id===a),second=options.find(e=>e.id===b),cents=Math.round(Number(price)*100);
  const total=first && second ? singlePrice(first.ticketing)+singlePrice(second.ticketing):0;
  return <section className="space-y-4 rounded-3xl border p-6"><h2 className="font-serif text-2xl">Pass 2 événements</h2>
    <form className="grid gap-3" onSubmit={e=>{e.preventDefault();void save("POST",{first:a,second:b,cents});}}>
      <label>Premier événement<select required className="admin-input" value={a} onChange={e=>setA(e.target.value)}><option value="">Choisir un événement</option>{opts(b)}</select></label>
      <label>Deuxième événement<select required className="admin-input" value={b} onChange={e=>setB(e.target.value)}><option value="">Choisir un événement</option>{opts(a)}</select></label>
      <label>Prix total du pass (€)<input className="admin-input" type="number" min=".50" step=".01" required value={price} onChange={e=>setPrice(e.target.value)}/></label>
      {total>0 && <p>Deux billets individuels · {euros(total)}{cents>0 && cents<total && " · Réduction du pass "+euros(total-cents)}</p>}
      <button className="admin-button" disabled={busy||cents<50||cents>=total}>Enregistrer le pass</button>
    </form>
    <p role="status">{message}</p>
    {rows.map(r=><div key={r.id} className="flex flex-wrap items-center gap-4 border-t py-2"><span>{title(r.first_id)} + {title(r.second_id)} · {euros(r.cents)}</span><button disabled={busy} onClick={()=>{setA(r.first_id);setB(r.second_id);setPrice(String(r.cents/100));}}>Modifier le prix</button><button disabled={busy} onClick={()=>save("DELETE",{id:r.id})}>Retirer de la vente</button></div>)}
  </section>;
}
