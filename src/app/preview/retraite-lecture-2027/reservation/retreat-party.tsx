"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Heart, Minus, Plus, UserRound, UsersRound, Users } from "lucide-react";
import styles from "./retreat.module.css";

type Party = "solo" | "duo" | "group";
const choices = [
  { id: "solo" as const, title: "Seule", subtitle: "", icon: UserRound },
  { id: "duo" as const, title: "Avec une amie ou ma sœur", subtitle: "(on est deux)", icon: UsersRound },
  { id: "group" as const, title: "Avec les copines", subtitle: "(on vient à plusieurs)", icon: Users },
];

export default function RetreatParty({ capacity }: { capacity: number }) {
  const [party, setParty] = useState<Party | null>(null);
  const [count, setCount] = useState(3);
  const [screen, setScreen] = useState<"choice" | "count" | "done">("choice");
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    heading.current?.focus();
  }, [screen]);
  const total = party === "solo" ? 1 : party === "duo" ? 2 : count;

  function choose(value: Party) {
    setParty(value);
    setScreen(value === "group" ? "count" : "done");
  }

  return <section className={styles.retreat} aria-label="Aperçu de la réservation de la retraite">
    <div className={styles.topline}>
      <a href="/admin">← Retour à l’admin</a>
      <span>Aperçu privé · aucune réservation réelle</span>
    </div>
    <header className={styles.intro}>
      <p>THE BOOKISH RETREAT · 2027</p>
      <div className={styles.progress} aria-label="Première étape : les participantes">
        <span className={styles.activeDot} /><span /><span /><span /><span /><span />
      </div>
      <small>Étape 1 · Les participantes</small>
    </header>

    <div key={screen} className={styles.screen}>
      {screen !== "choice" && <button className={styles.back} onClick={() => setScreen(screen === "done" && party === "group" ? "count" : "choice")}><ArrowLeft size={18} aria-hidden="true" /> Retour</button>}
      <h1 ref={heading} tabIndex={-1}>{screen === "choice" ? "Tu viens avec qui ?" : screen === "count" ? "Combien de Baddies serez-vous ?" : "L’aventure commence avec vous ♡"}</h1>

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
          <button aria-label="Une participante en moins" disabled={count <= 3} onClick={() => setCount(n => Math.max(3, n - 1))}><Minus aria-hidden="true" /></button>
          <output aria-live="polite">{count}<small>participantes</small></output>
          <button aria-label="Une participante en plus" disabled={count >= capacity} onClick={() => setCount(n => Math.min(capacity, n + 1))}><Plus aria-hidden="true" /></button>
        </div>
        <p className={styles.hint}>De 3 à {capacity} participantes · capacité fictive pour cet aperçu.</p>
        <button className={styles.continue} onClick={() => setScreen("done")}>C’est nous ! <Heart size={17} aria-hidden="true" /></button>
      </div>}

      {screen === "done" && <div className={styles.center}>
        <div className={styles.summary}><Check aria-hidden="true" /><strong>{choices.find(c => c.id === party)?.title}</strong><span>{total} participante{total > 1 ? "s" : ""}</span></div>
        <p>Ton choix est conservé tant que cet aperçu reste ouvert.</p>
        <p className={styles.hint}>Fin de cette première démonstration. Les préférences de couchage et le plan des chambres arrivent à l’étape suivante.</p>
        <button className={styles.continue} onClick={() => setScreen("choice")}>Modifier mon choix</button>
      </div>}
    </div>
  </section>;
}
