"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CreditCard, Heart, Check } from "lucide-react";
import {retreatInstallments} from "@/lib/retreat-installments";
import {retreatCheckoutConsent,RETREAT_CHECKOUT_VERSION} from "@/lib/retreat-checkout";
import { demoSeats } from "./demo-rooms";
import { groupCall } from "./group-api-client";
import { installments, euros } from "./demo-payment";
import type { Guests } from "./participants";
import styles from "./retreat.module.css";

export default function Payment({seats,guests,onBack,onConfirm,afterSuccess,checkout}:{seats:string[];guests:Guests;onBack:()=>void;onConfirm?:(cents:number,split:boolean)=>Promise<{cents:number;split:boolean}>;afterSuccess?:React.ReactNode;checkout?:{requestId:string;token?:string;seats:string[];seat:string}}) {
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [price,setPrice] = useState(21500);
  const [stripeTest,setStripeTest]=useState(false);
  const [priced,setPriced]=useState(false);
  async function refreshPrice(){
    setPriced(false);setAccepted(false);setToday(new Date());
    try{const inventory=await groupCall({action:"inventory"});setStripeTest(inventory.stripeTest===true);setPrice(seats[0]==="3-private"?31500:inventory.cents);setPriced(true);setError("");}
    catch(e){setError(e instanceof Error?e.message:"Tarif indisponible.");}
  }
  useEffect(()=>{void refreshPrice();},[seats[0]]);

  const [accepted,setAccepted] = useState(false);
  const [status,setStatus] = useState<"ready"|"failed"|"cancelled"|"success">("ready");
  const [today,setToday] = useState(() => new Date());
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [status]);
  const payingSplit = false;
  const amounts = installments(price,seats.length,false);
  const total = price * seats.length;
  const reset = () => {setAccepted(false);setStatus("ready");};

  async function confirm(){
    if(busy||!priced)return;setBusy(true);setError("");
    try{
     if(stripeTest){
      if(!checkout)throw Error("Sélection manquante.");
      const response=await fetch('/api/retreat/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...checkout,guest:guests[checkout.seat],cents:price,split:payingSplit,accepted,consentVersion:RETREAT_CHECKOUT_VERSION,expectedSteps:retreatInstallments(price,payingSplit,today)})});
      const result=await response.json();if(!response.ok)throw Error(result.error);
      window.location.assign(result.url);return;
     }
     const receipt=await onConfirm?.(price,payingSplit);if(receipt){setPrice(receipt.cents);}setStatus("success");}catch(e){setError(e instanceof Error?e.message:"Réessaie.");}finally{setBusy(false);}
  }
  return <div className={styles.screen}>
    {status !== "success" && <button className={styles.back} onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Retour aux participantes</button>}
    <h1 ref={heading} tabIndex={-1}>{status === "success" ? "Tu fais partie du Week-end des Baddies ❤️‍🔥" : "Ta petite place est presque réservée"}</h1>
    <p className={styles.hint}>{stripeTest?"Stripe en mode test · carte ou Klarna de test. Aucun débit réel.":"Simulation uniquement · aucun débit réel ni e-mail. Les blocages concernent uniquement les places de test."}</p>
    {status === "success" ? <div className={styles.center}>
      <div className={styles.summary}><Check size={32} aria-hidden="true" /><strong>Réservation simulée avec succès</strong><span>Le Week-end des Baddies — Mountain Edition · du 12 au 14 mars 2027</span><small>Bolquère · l’adresse exacte sera envoyée par e-mail aux participantes.</small><span>Premier paiement simulé : {euros(amounts[0])}</span><span>Montant réellement débité : 0 €</span><span>Total du séjour : {euros(total)}</span></div>
      {seats.map(id=>{const s=demoSeats.find(s=>s.id===id)!;const g=guests[id];return <p key={id}>{g.first} · {s.room} · {s.label}</p>;})}

      <p>Les détails du week-end et les informations pratiques seront communiqués avant le séjour.</p>
      <p className={styles.hint}> Cet essai n’est pas une réservation réelle.</p>
      {afterSuccess}
      {!onConfirm && <button className={styles.continue} onClick={reset}>Tester un autre paiement</button>}
    </div> : <>
      <div className={styles.center}>
        <p className={styles.field}>{price===31500?"Chambre privatisée":price===19900?"Early Baddies · parmi les quatre premières places confirmées":"Classique"} · {euros(price)}</p>
        <p className={styles.hint}>Tarif vérifié à la confirmation. Les places gardées pour les copines ne réservent pas le tarif Early.</p>
        <button className={styles.back} disabled={busy} onClick={()=>void refreshPrice()}>Actualiser le tarif</button>
        <p>{seats.length} participante{seats.length>1?"s":""} × {euros(price)} = <strong>{euros(total)}</strong></p>
      </div>
      <div className={styles.cards}>
        <div className={styles.card}><CreditCard size={32} aria-hidden="true" /><strong>Carte bancaire</strong><span>Le montant total en une fois</span></div>
        <div className={styles.card}><CreditCard size={32} aria-hidden="true" /><strong>Klarna</strong><span>Options proposées au paiement, sous réserve d’éligibilité et d’acceptation</span></div>
      </div>
      <div className={styles.center}>
        <div className={styles.summary}><strong>Total de ta réservation : {euros(total)}</strong><span>Tu choisiras ton moyen de paiement sur la page sécurisée Stripe.</span></div>
        <p className={styles.hint}>Si tu choisis Klarna, les dates et conditions seront affichées avant validation. Les éventuelles échéances sont gérées par Klarna : le bookclub ne programme aucun prélèvement supplémentaire.</p>
        <label className={styles.consent}><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} /> {stripeTest?retreatCheckoutConsent(price):"J’ai compris qu’il s’agit d’un essai : aucun paiement ni réservation réelle."}</label>
        <p className={styles.hint}>Les conditions de réservation et d’annulation restent à définir. Elles devront être consultables et acceptées avant tout paiement réel.</p>
        {status === "failed" && <p role="alert">Paiement refusé — simulation. Aucun montant n’a été débité et aucune place n’a été réservée. Tu peux réessayer.</p>}
        {status === "cancelled" && <p role="status">Paiement abandonné — simulation. Tes réponses sont conservées pour reprendre, mais aucune place n’est réservée.</p>}
        <button className={styles.continue} disabled={!accepted||busy||!priced} onClick={confirm}>{stripeTest?"Payer avec Stripe (test) :":"Simuler le paiement de"} {euros(amounts[0])} <Heart size={17} aria-hidden="true" /></button>
        {error && <p role="alert">{error}</p>}
        {busy && <p role="status">{stripeTest?"Préparation du paiement Stripe…":"Confirmation de la simulation…"}</p>}
        {!stripeTest&&<div className={styles.testActions}><button disabled={!accepted} onClick={()=>setStatus("failed")}>Tester un refus</button><button onClick={()=>setStatus("cancelled")}>Tester un abandon</button></div>}
      </div>
    </>}
  </div>;
}

