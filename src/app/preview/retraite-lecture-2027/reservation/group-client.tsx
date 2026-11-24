"use client";
import {useEffect,useState} from 'react';
import Participants,{type Guests} from './participants';
import Payment from './payment';
import {demoSeats} from './demo-rooms';
import styles from './retreat.module.css';
export type GroupState={token:string;now:string;expiresAt:string;places:{id:string;state:'held'|'paid'|'released'|'cancelled';name:string|null}[]};
export {groupCall} from "./group-api-client";
import {groupCall} from "./group-api-client";
export function GroupLink({group}:{group:GroupState}){
 const [copied,setCopied]=useState(false);
 const url=typeof window==='undefined'?'':window.location.origin+'/preview/retraite-lecture-2027/groupe#'+group.token;
 return <div className={styles.summary}><strong>À toi de réunir les copines 🫶</strong><p>Leurs places sont gardées pendant une heure à partir de ton premier paiement simulé. Chacune ouvre ce lien, renseigne ses informations et règle uniquement sa place.</p><a href={url}>Ouvrir le lien du groupe</a><button className={styles.continue} onClick={async()=>{try{await navigator.clipboard.writeText(url);setCopied(true);}catch{setCopied(false);}}}>{copied?'Lien copié':'Copier le lien privé'}</button><p className={styles.hint}>Test réservé à l’admin. Aucun e-mail n’est envoyé pour l’instant.</p><Countdown token={group.token}/></div>;
}
export function Countdown({token,onUpdate}:{token:string;onUpdate?:(g:GroupState)=>void}){
 const [remaining,setRemaining]=useState<number|null>(null),[error,setError]=useState('');
 useEffect(()=>{
 let live=true;let deadline=0;
 async function sync(){try{const g:GroupState=await groupCall({action:'status',token});if(!live)return;deadline=performance.now()+Math.max(0,Date.parse(g.expiresAt)-Date.parse(g.now));setError('');setRemaining(Math.max(0,Math.ceil((deadline-performance.now())/1000)));onUpdate?.(g);}catch(e){if(live){setError(e instanceof Error?e.message:'Connexion interrompue');setRemaining(null);}}}
 void sync();const refresh=setInterval(sync,5000);const tick=setInterval(()=>{if(deadline&&live)setRemaining(Math.max(0,Math.ceil((deadline-performance.now())/1000)));},1000);
 return()=>{live=false;clearInterval(refresh);clearInterval(tick);};
 },[token,onUpdate]);
 return <p className={styles.hint}>{error|| (remaining===null?'Synchronisation du délai…':remaining===0?'Délai écoulé : les places non payées sont libérées. Les places payées restent réservées.':`Temps restant pour le groupe : ${Math.floor(remaining/60).toString().padStart(2,'0')}:${(remaining%60).toString().padStart(2,'0')}`)}</p>;
}
export default function GroupJoin(){
 const [token,setToken]=useState(''),[group,setGroup]=useState<GroupState|null>(null),[seat,setSeat]=useState(''),[stage,setStage]=useState<'choose'|'info'|'pay'>('choose'),[guests,setGuests]=useState<Guests>({}),[requestId]=useState(()=>crypto.randomUUID());
 useEffect(()=>{setToken(window.location.hash.slice(1));},[]);
 if(!token)return <p>Ouvre le lien complet partagé par la première participante.</p>;
 return <section className={styles.retreat}><p className={styles.hint}>Le Week-end des Baddies — Mountain Edition · test privé</p><h1>Les copines t’attendent ❤️‍🔥</h1><Countdown token={token} onUpdate={setGroup}/>
 {stage==='choose'&&<><p>Choisis une place gardée pour votre groupe. Tu rempliras tes propres informations et tu paieras seulement ta place, par carte ou avec Klarna si cette option est proposée.</p><div className={styles.rooms}>{group?.places.map(p=>{const s=demoSeats.find(s=>s.id===p.id)!;return <button key={p.id} className={styles.card} disabled={p.state!=='held'||Date.parse(group.expiresAt)<=Date.parse(group.now)} onClick={()=>{setSeat(p.id);setStage('info');}}><strong>{s.room}</strong><span>{s.label}</span><span>{p.state==='held'?'Gardée pour une copine':p.state==='paid'?(p.name||'Place réservée'):'Place libérée'}</span></button>;})}</div></>}
 {stage==='info'&&<Participants seats={[seat]} guests={guests} onChange={setGuests} onBack={()=>setStage('choose')} onContinue={()=>setStage('pay')}/>}
 {stage==='pay'&&<Payment checkout={{requestId,token,seats:[seat],seat}} seats={[seat]} guests={guests} onBack={()=>setStage('info')} onConfirm={async(cents,split)=>{const data=await groupCall({action:'claim',token,requestId,seat,guest:guests[seat],cents,split});setGroup(data);const receipt=data.places.find((p:{id:string})=>p.id===seat);return {cents:receipt.cents,split:receipt.split};}}/>}
 </section>;
}

