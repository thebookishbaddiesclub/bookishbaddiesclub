"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Heart, Minus, Plus, UserRound, UsersRound, Users, BedSingle, BedDouble, Sparkles } from "lucide-react";
import styles from "./retreat.module.css";

import { demoRooms, demoSeats, sameDouble, type SleepPreference } from "./demo-rooms";

import Participants, { type Guests } from "./participants";

import Payment from "./payment";

type Party = "solo" | "duo" | "group";
const choices = [
  { id: "solo" as const, title: "Seule", subtitle: "", icon: UserRound },
  { id: "duo" as const, title: "Avec une amie ou ma sœur", subtitle: "(on est deux)", icon: UsersRound },
  { id: "group" as const, title: "Avec les copines", subtitle: "(on vient à plusieurs)", icon: Users },
];

export default function RetreatParty({ capacity }: { capacity: number }) {
  const [guests, setGuests] = useState<Guests>({});
  const [party, setParty] = useState<Party | null>(null);
  const [count, setCount] = useState(3);
  const [screen, setScreen] = useState<"choice" | "count" | "sleep" | "share" | "rooms" | "beds" | "done" | "participants" | "payment">("choice");
  const [sleep, setSleep] = useState<SleepPreference | null>(null);
  const [share, setShare] = useState<boolean | null>(null);
  const [roomId, setRoomId] = useState<string>("1");
  const [seats, setSeats] = useState<string[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    heading.current?.focus();
  }, [screen]);
  const total = party === "solo" ? 1 : party === "duo" ? 2 : count;

  function choose(value: Party) {
    if (value !== party) { setSeats([]); setShare(null); }
    setParty(value);
    setScreen(value === "group" ? "count" : "sleep");
  }

  const room = demoRooms.find(r => r.id === roomId)!;
  const step = screen === "payment" ? 6 : screen === "participants" ? 5 : screen === "choice" || screen === "count" ? 1 : screen === "sleep" || screen === "share" ? 2 : screen === "done" ? 4 : 3;
  const preferences = [
    { id: "single" as const, title: "Mon propre lit", subtitle: "Je préfère un couchage individuel.", icon: BedSingle },
    { id: "double" as const, title: "Un lit double partagé", subtitle: "Ça ne me dérange pas de partager un lit avec une autre Baddie.", icon: BedDouble },
    { id: "any" as const, title: "Peu importe !", subtitle: "Je suis flexible, je veux juste profiter du week-end.", icon: Sparkles },
  ];
  const titles = { choice: "Tu viens avec qui ?", count: "Combien de Baddies serez-vous ?", sleep: "Comment préfères-tu dormir ?", share: "Vous souhaitez partager le même lit ?", rooms: "Le Plan des Chambres :", beds: room.name, payment: "Le paiement", participants: "Les participantes", done: "Voici votre sélection ♡" };
  function back() {
    setScreen(screen === "count" ? "choice" : screen === "sleep" ? (party === "group" ? "count" : "choice") : screen === "share" ? "sleep" : screen === "rooms" ? (party === "duo" && sleep !== "single" ? "share" : "sleep") : "rooms");
  }
  function selectSleep(value: SleepPreference) {
    setSleep(value);
    if (value === "single") setShare(false);
    setScreen(party === "duo" && value !== "single" ? "share" : "rooms");
  }
  function toggleSeat(id: string) {
    setSeats(current => current.includes(id) ? current.filter(s => s !== id) : current.length < total ? [...current, id] : current);
  }
  const complete = seats.length === total && (!share || sameDouble(seats));
  return <section className={styles.retreat} aria-label="Aperçu de la réservation de la retraite">
    <div className={styles.topline}>
      <a href="/admin">← Retour à l’admin</a>
      <span>Aperçu privé · aucune réservation réelle</span>
    </div>
    <header className={styles.intro}>
      <p>THE BOOKISH RETREAT · 2027</p>
      <div className={styles.progress} aria-label={`Étape ${step} sur 6`}>
        {[1,2,3,4,5,6].map(n => <span key={n} className={n === step ? styles.activeDot : undefined} />)}
      </div>
      <small>Étape {step} · {step === 1 ? "Les participantes" : step === 2 ? "Le couchage" : step === 3 ? "Les chambres" : step === 4 ? "Le récapitulatif" : step === 5 ? "Les participantes" : "Le paiement"}</small>
    </header>

    {screen === "payment" ? <Payment seats={seats} guests={guests} onBack={() => setScreen("participants")} /> : screen === "participants" ? <Participants seats={seats} guests={guests} onChange={setGuests} onBack={() => setScreen("done")} onContinue={() => setScreen("payment")} /> : <div key={screen} className={styles.screen}>
      {screen !== "choice" && <button className={styles.back} onClick={back}><ArrowLeft size={18} aria-hidden="true" /> Retour</button>}
      <h1 ref={heading} tabIndex={-1}>{titles[screen]}</h1>

      {screen === "choice" && <div className={styles.cards}>
        {choices.map(({ id, title, subtitle, icon: Icon }) => <button key={id} className={`${styles.card} ${party === id ? styles.selected : ""}`} aria-pressed={party === id} onClick={() => choose(id)}>
          {party === id && <Check className={styles.check} size={20} aria-hidden="true" />}
          <Icon size={35} strokeWidth={1.4} aria-hidden="true" />
          <strong>{title}</strong>
          {subtitle && <span>{subtitle}</span>}
        </button>)}
      </div>}

      {screen === "count" && <div className={styles.center}>
        <p>Compte-toi aussi dans le groupe.</p>
        <div className={styles.counter}>
          <button aria-label="Une participante en moins" disabled={count <= 3} onClick={() => { setCount(n => Math.max(3, n - 1)); setSeats([]); }}><Minus aria-hidden="true" /></button>
          <output aria-live="polite">{count}<small>participantes</small></output>
          <button aria-label="Une participante en plus" disabled={count >= capacity} onClick={() => { setCount(n => Math.min(capacity, n + 1)); setSeats([]); }}><Plus aria-hidden="true" /></button>
        </div>
        <p className={styles.hint}>De 3 à {capacity} participantes · capacité fictive pour cet aperçu.</p>
        <button className={styles.continue} onClick={() => setScreen("sleep")}>C’est nous ! <Heart size={17} aria-hidden="true" /></button>
      </div>}

      {screen === "sleep" && <div className={styles.cards}>
        {preferences.map(({id, title, subtitle, icon: Icon}) => <button key={id} className={`${styles.card} ${sleep === id ? styles.selected : ""}`} aria-pressed={sleep === id} onClick={() => selectSleep(id)}><Icon size={35} aria-hidden="true" /><strong>{title}</strong><span>{subtitle}</span></button>)}
      </div>}
      {screen === "share" && <div className={styles.cards}>
        {[true, false].map(value => <button key={String(value)} className={`${styles.card} ${share === value ? styles.selected : ""}`} aria-pressed={share === value} onClick={() => { setShare(value); setScreen("rooms"); }}><BedDouble size={35} aria-hidden="true" /><strong>{value ? "Oui, ensemble ♡" : "Pas forcément"}</strong><span>{value ? "On choisira les deux places du même lit double." : "On choisira nos places librement."}</span></button>)}
      </div>}
      {(screen === "rooms" || screen === "beds") && <>
        <p className={styles.hint}>Chalet Husky · configuration provisoire de démonstration. Toutes les places sont libres.</p>
        <p role="status">{seats.length} / {total} place{total > 1 ? "s" : ""} sélectionnée{seats.length > 1 ? "s" : ""}</p>
        {share && <p className={styles.hint}>Votre souhait : les deux places du même lit double.</p>}
      </>}
      {screen === "rooms" && <>
        <div className={styles.rooms}>{demoRooms.filter(r => r.beds.length > 0).map(r => <button key={r.id} disabled={r.beds.length === 0} className={styles.card} onClick={() => { setRoomId(r.id); setScreen("beds"); }}>
          <strong>{r.name}</strong><div className={styles.bedIcons}>{r.beds.map((type,i) => type === "double" ? <BedDouble key={i} aria-label="Lit double" /> : <BedSingle key={i} aria-label="Lit individuel" />)}</div>
          <span>{r.beds.length === 0 ? "Réservée à l’organisatrice" : `${demoSeats.filter(s => s.roomId === r.id).length} places disponibles`}</span>
          {r.beds.length > 0 && (sleep === "any" || r.beds.some(b => b === sleep)) && <span>♡ Selon ta préférence</span>}
          {seats.some(id => demoSeats.find(s => s.id === id)?.roomId === r.id) && <span>✓ Des places choisies ici</span>}
        </button>)}</div>
        {share && seats.length === total && !sameDouble(seats) && <p role="status">Choisissez les deux places d’un même lit double, ou revenez modifier votre préférence.</p>}
        <button className={styles.continue} disabled={!complete} onClick={() => setScreen("done")}>Voir le récapitulatif</button>
        <p className={styles.hint}>Répartition provisoire : les attributions pourront être modifiées avec les participantes concernées.</p>
      </>}
      {screen === "beds" && <>
        <div className={styles.rooms}>{room.beds.map((type, index) => <div key={index} className={styles.bed}>
          {type === "double" ? <BedDouble size={36} aria-hidden="true" /> : <BedSingle size={36} aria-hidden="true" />}
          <h2>Lit {index + 1} · {type === "double" ? "double partagé" : "individuel"}</h2>
          {demoSeats.filter(s => s.bedId === `${room.id}-${index}`).map(s => <button key={s.id} className={styles.seat} aria-pressed={seats.includes(s.id)} disabled={!seats.includes(s.id) && seats.length >= total} onClick={() => toggleSeat(s.id)}>{seats.includes(s.id) ? "✓ Sélectionnée" : "Place libre"} · {s.type === "double" ? s.label.split(", ")[1] : "1 personne"}</button>)}
        </div>)}</div>
        {!complete && <p className={styles.hint} role="status">{seats.length < total ? `Choisis encore ${total - seats.length} place(s) pour continuer. Tu peux les choisir dans une autre chambre.` : "Choisissez les deux places du même lit double, ou revenez modifier votre préférence."}</p>}
        <div className="flex flex-wrap items-center gap-4">
          <button className={styles.continue} disabled={!complete} onClick={() => setScreen("done")}>Continuer vers le récapitulatif</button>
          <button className={styles.back} onClick={() => setScreen("rooms")}>Choisir une autre chambre</button>
        </div>
      </>}
      {screen === "done" && <div className={styles.center}>
        <div className={styles.summary}><Check aria-hidden="true" /><strong>{choices.find(c => c.id === party)?.title}</strong><span>{total} participante{total > 1 ? "s" : ""}</span><span>{preferences.find(p => p.id === sleep)?.title}</span>
          {demoSeats.filter(s => seats.includes(s.id)).map(s => <span key={s.id}>{s.room} · {s.label}</span>)}
        </div>
        <p>Aucune place n’est réservée : ceci est une simulation.</p>
        <button className={styles.continue} onClick={() => setScreen("participants")}>Renseigner les participantes</button>
        <button className={styles.continue} onClick={() => setScreen("rooms")}>Modifier les couchages</button>
      </div>}
    </div>}
  </section>;
}
