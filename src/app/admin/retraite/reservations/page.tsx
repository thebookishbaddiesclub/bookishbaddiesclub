"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {demoSeats,physicalSeats,seatUnavailable} from '@/app/preview/retraite-lecture-2027/reservation/demo-rooms';
import {euros} from '@/app/preview/retraite-lecture-2027/reservation/demo-payment';
type Booking={id:string;seat:string;state:string;tariff:string|null;cents:number|null;split:boolean;confirmed_at:string|null;guest:{first:string;last:string;email:string;city:string;diet:string}|null;occupied:string[]};
type Inventory={earlyRemaining:number;unavailable:string[];reservations:Booking[]};
const labels:Record<string,string>={held:'Gardée pour le groupe',paid:'Confirmée (simulation)',cancelled:'Annulée',released:'Libérée',blocked:'Bloquée par l’admin'};
export default function RetreatBookings(){
 const [data,setData]=useState<Inventory|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[block,setBlock]=useState(''),[targets,setTargets]=useState<Record<string,string>>({});
 async function refresh(){try{const r=await fetch('/api/admin/retreat-bookings',{cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error);setData(d);setError('');}catch(e){setError(e instanceof Error?e.message:'Chargement impossible.');}}
 useEffect(()=>{void refresh();const timer=setInterval(refresh,5000);return()=>clearInterval(timer);},[]);
 async function mutate(action:string,id?:string,seat?:string){
  if(action==='admin_cancel'&&!window.confirm('Annuler cette réservation de test et libérer les invitations encore en attente de ce groupe ? Les autres places confirmées seront conservées.'))return;
  setBusy(true);try{const r=await fetch('/api/admin/retreat-bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,id,seat})});const d=await r.json();if(!r.ok)throw Error(d.error);await refresh();}catch(e){setError(e instanceof Error?e.message:'Modification impossible.');}finally{setBusy(false);}
 }
 const paid=data?.reservations.filter(r=>r.state==='paid')||[];
 return <section className="space-y-6"><Link href="/admin/retraite" className="underline">← Textes de la retraite</Link><h1 className="text-3xl font-serif text-bb-rose">Places et réservations</h1><p>Aperçu privé : confirmations simulées, aucun paiement réel. Les anciennes réservations de démonstration ont été conservées séparément.</p>
 <p>Early Baddies : 199 € pour les quatre premières confirmations · Classique : 215 € · Chambre 3 privatisée : 315 € pour une personne.</p>
 {error&&<p role="alert">{error}</p>}
 {data&&<><div className="flex flex-wrap gap-6 rounded-2xl border p-5"><span>{paid.length} participantes confirmées</span><span>{physicalSeats.length-data.unavailable.length} couchages libres</span><span>{data.earlyRemaining} tarifs Early restants</span><span>Capacité : {paid.some(r=>r.tariff==='private')?11:12} participantes</span></div>
 <p className="text-sm">Actualisation toutes les 5 secondes. Les quatre tarifs Early correspondent aux premières confirmations : une annulation ne remet pas un tarif Early en vente.</p>
 <div className="flex flex-wrap items-center gap-3"><label>Bloquer une place<select className="admin-input" value={block} onChange={e=>setBlock(e.target.value)}><option value="">Choisir</option>{demoSeats.filter(s=>!seatUnavailable(s.id,data.unavailable)).map(s=><option key={s.id} value={s.id}>{s.room} · {s.label}</option>)}</select></label><button className="admin-button" disabled={busy||!block} onClick={()=>void mutate('admin_block',undefined,block)}>Bloquer</button></div>
 <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['Participante / coordonnées','Couchage','Tarif','Statut','Gestion'].map(h=><th className="p-3 border-b" key={h}>{h}</th>)}</tr></thead><tbody>{data.reservations.map(r=><tr key={r.id}><td className="p-3 border-b">{r.guest?<><strong>{r.guest.first} {r.guest.last}</strong><p>{r.guest.email}</p><p>{r.guest.city}</p><p>{r.guest.diet}</p></>:'—'}</td><td className="p-3 border-b">{demoSeats.find(s=>s.id===r.seat)?.room}<p>{demoSeats.find(s=>s.id===r.seat)?.label}</p></td><td className="p-3 border-b">{r.cents?euros(r.cents):'À la confirmation'}<p>{r.tariff==='early'?'Early Baddies':r.tariff==='private'?'Privatisée':r.tariff==='classic'?'Classique':''}</p>{r.cents&&<small>{r.split?'3 fois':'1 fois'} · simulation</small>}</td><td className="p-3 border-b">{labels[r.state]}</td><td className="p-3 border-b space-y-2">{['held','paid'].includes(r.state)&&<button className="underline" disabled={busy} onClick={()=>void mutate('admin_cancel',r.id)}>Annuler</button>}{r.state==='blocked'&&<button className="underline" disabled={busy} onClick={()=>void mutate('admin_release',r.id)}>Libérer</button>}{r.state==='paid'&&r.tariff!=='private'&&<div><select aria-label="Nouveau couchage" className="admin-input" value={targets[r.id]||''} onChange={e=>setTargets({...targets,[r.id]:e.target.value})}><option value="">Déplacer vers…</option>{physicalSeats.filter(s=>!data.unavailable.includes(s.id)).map(s=><option key={s.id} value={s.id}>{s.room} · {s.label}</option>)}</select><button className="underline" disabled={busy||!targets[r.id]} onClick={()=>void mutate('admin_move',r.id,targets[r.id])}>Déplacer, tarif conservé</button></div>}</td></tr>)}</tbody></table></div>
 {!data.reservations.length&&<p>Aucune réservation pour le moment.</p>}</>}
 </section>;
}
