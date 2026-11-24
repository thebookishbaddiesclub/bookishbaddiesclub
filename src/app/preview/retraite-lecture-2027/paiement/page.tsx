"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {euros} from '../reservation/demo-payment';
import styles from '../reservation/retreat.module.css';
type Receipt={id:string;state:string;cents:number;groupToken:string|null;steps:{number:number;cents:number;dueAt:string;status:string;url:string|null}[]};
const labels:Record<string,string>={paid:'Payé',scheduled:'Prélèvement programmé',pending:'En préparation',needs_review:'À vérifier avec le bookclub',action_required:'Validation nécessaire',failed:'Échec',cancelled:'Annulé'};
export default function RetreatPaymentReturn(){
 const [receipt,setReceipt]=useState<Receipt|null>(null),[error,setError]=useState(''),[id,setId]=useState('');
 useEffect(()=>{
  const order=new URLSearchParams(window.location.search).get('order')||'';setId(order);let live=true;
  async function refresh(){try{const response=await fetch('/api/retreat/payment-status?order='+encodeURIComponent(order),{cache:'no-store'});const data=await response.json();if(!response.ok)throw Error(data.error);if(live){setReceipt(data);setError('');}}catch(e){if(live)setError(e instanceof Error?e.message:'Confirmation en attente.');}}
  void refresh();const timer=setInterval(refresh,5000);return()=>{live=false;clearInterval(timer);};
 },[]);
 return <section className={styles.retreat}><h1>{receipt?.state==='paid'?'Ta place est confirmée ❤️‍🔥':receipt?.state==='expired'?'Le paiement n’a pas été finalisé':'Confirmation du paiement'}</h1><p className={styles.hint}>Stripe en mode test : aucun montant réellement débité.</p>
 {error&&<p role="status">{error}</p>}
 {receipt?.state==='pending'&&<p>Le paiement est en attente. Si tu as quitté Stripe sans payer, la place sera libérée après l’expiration de la session. Si tu as payé, la confirmation arrivera ici automatiquement.</p>}
 {receipt&&<div className={styles.summary}><strong>Total du séjour : {euros(receipt.cents)}</strong>{receipt.steps.map(s=><span key={s.number}>{receipt.steps.length===1?'Paiement du séjour':`Échéance ${s.number}`} · {new Date(s.dueAt).toLocaleDateString('fr-FR',{timeZone:'Europe/Paris'})} · {euros(s.cents)} · {labels[s.status]||s.status}{s.url&&s.status==='action_required'&&<> · <a className="underline" href={s.url}>Régulariser le paiement</a></>}</span>)}</div>}
 {receipt?.groupToken&&<div className={styles.summary}><strong>Les copines peuvent te rejoindre</strong><p>Les places de ton groupe sont gardées une heure à partir du premier paiement confirmé.</p><Link href={'/preview/retraite-lecture-2027/groupe#'+receipt.groupToken}>Ouvrir le lien privé à partager</Link></div>}
 <p className={styles.hint}>Référence : {id}</p><Link href="/admin/retraite/reservations">Voir le suivi admin</Link>
 </section>;
}

