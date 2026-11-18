"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CreditCard, Heart, CalendarDays, Check } from "lucide-react";
import { demoSeats } from "./demo-rooms";
import { installments, monthAfter, euros } from "./demo-payment";
import type { Guests } from "./participants";
import styles from "./retreat.module.css";

export default function Payment({seats,guests,onBack}:{seats:string[];guests:Guests;onBack:()=>void}) {
  const [price,setPrice] = useState(22500);
  const [split,setSplit] = useState(false);
  const [accepted,setAccepted] = useState(false);
  const [status,setStatus] = useState<"ready"|"failed"|"cancelled"|"success">("ready");
  const [today] = useState(() => new Date());
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [status]);
  const amounts = installments(price,seats.length,split);
  const total = price * seats.length;
  const date = (n:number) => monthAfter(today,n).toLocaleDateString("fr-FR");
  const reset = () => {setAccepted(false);setStatus("ready");};

  return <div className={styles.screen}>
    {status !== "success" && <button className={styles.back} onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Retour aux participantes</button>}
    <h1 ref={heading} tabIndex={-1}>{status === "success" ? "You’re officially a Bookish Retreat Baddie ! ♡" : "Ta petite place est presque réservée ♡"}</h1>
    <p className={styles.hint}>Simulation uniquement · aucun débit, aucune place bloquée, aucun e-mail envoyé.</p>
    {status === "success" ? <div className={styles.center}>
      <div className={styles.summary}><Check size={32} aria-hidden="true" /><strong>Réservation simulée avec succès</strong><span>Chalet Husky · du 12 au 14 mars 2027</span><small>Dates et logement provisoires</small><span>Premier paiement simulé : {euros(amounts[0])}</span><span>Montant réellement débité : 0 €</span><span>Total du séjour : {euros(total)}</span></div>
      {seats.map(id=>{const s=demoSeats.find(s=>s.id===id)!;const g=guests[id];return <p key={id}>{g.first} · {s.room} · {s.label}</p>;})}
      {split && <div className={styles.summary}><strong>Échéances restantes — simulation</strong><span>{date(1)} : {euros(amounts[1])}</span><span>{date(2)} : {euros(amounts[2])}</span></div>}
      <p>Les détails du week-end et les informations pratiques seront communiqués avant le séjour.</p>
      <p className={styles.hint}>L’e-mail récapitulatif et les paiements automatiques seront branchés plus tard. Cet essai n’est pas une réservation réelle.</p>
      <button className={styles.continue} onClick={reset}>Tester un autre paiement</button>
    </div> : <>
      <div className={styles.center}>
        <label className={styles.field}>Tarif à tester dans la démonstration<select value={price} onChange={e=>{setPrice(Number(e.target.value));reset();}}><option value={22500}>Early Bird · 225 € par personne</option><option value={23500}>Tarif normal · 235 € par personne</option></select></label>
        <p className={styles.hint}>Ce sélecteur sert aux tests. Les tarifs et quotas définitifs seront gérés dans l’administration.</p>
        <p>{seats.length} participante{seats.length>1?"s":""} × {euros(price)} = <strong>{euros(total)}</strong></p>
      </div>
      <div className={styles.cards}>
        <button className={`${styles.card} ${!split?styles.selected:""}`} aria-pressed={!split} onClick={()=>{setSplit(false);reset();}}><CreditCard size={32} aria-hidden="true" /><strong>En une fois</strong><span>{euros(total)} aujourd’hui</span></button>
        <button className={`${styles.card} ${split?styles.selected:""}`} aria-pressed={split} onClick={()=>{setSplit(true);reset();}}><CalendarDays size={32} aria-hidden="true" /><strong>En trois fois</strong><span>Trois échéances · sans frais dans cette simulation</span></button>
      </div>
      <div className={styles.center}>
        <div className={styles.summary}><strong>Ton échéancier simulé</strong>{amounts.map((amount,i)=><span key={i}>{i===0?`Aujourd’hui (${date(0)})`:date(i)} : {euros(amount)}</span>)}<span>Total : {euros(total)}</span></div>
        <p className={styles.hint}>Échéancier de démonstration : aujourd’hui, puis à un et deux mois si tu choisis trois fois. Les dates définitives seront confirmées avant l’ouverture.</p>
        <label className={styles.consent}><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} /> J’ai compris qu’il s’agit d’un essai : aucun paiement ni réservation réelle.</label>
        <p className={styles.hint}>Les conditions de réservation et d’annulation restent à définir. Elles devront être consultables et acceptées avant tout paiement réel.</p>
        {status === "failed" && <p role="alert">Paiement refusé — simulation. Aucun montant n’a été débité et aucune place n’a été réservée. Tu peux réessayer.</p>}
        {status === "cancelled" && <p role="status">Paiement abandonné — simulation. Tes réponses sont conservées pour reprendre, mais aucune place n’est réservée.</p>}
        <button className={styles.continue} disabled={!accepted} onClick={()=>setStatus("success")}>Simuler le paiement de {euros(amounts[0])} <Heart size={17} aria-hidden="true" /></button>
        <div className={styles.testActions}><button disabled={!accepted} onClick={()=>setStatus("failed")}>Tester un refus</button><button onClick={()=>setStatus("cancelled")}>Tester un abandon</button></div>
      </div>
    </>}
  </div>;
}
