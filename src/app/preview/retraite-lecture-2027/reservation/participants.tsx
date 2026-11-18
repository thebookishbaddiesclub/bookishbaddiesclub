"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, UserRound } from "lucide-react";
import { demoSeats } from "./demo-rooms";
import styles from "./retreat.module.css";

export type Guest = { first: string; last: string; email: string; city: string; diet: string; visible: boolean };
export type Guests = Record<string, Guest>;
const empty: Guest = { first: "", last: "", email: "", city: "", diet: "", visible: false };
const questions = [
  { key: "first", title: "Quel est ton prénom ?", label: "Prénom", type: "text", autocomplete: "given-name" },
  { key: "last", title: "Et ton nom de famille ?", label: "Nom de famille", type: "text", autocomplete: "family-name" },
  { key: "email", title: "À quelle adresse peut-on t’écrire ?", label: "Adresse e-mail", type: "email", autocomplete: "email" },
  { key: "city", title: "De quelle ville viens-tu ?", label: "Ville", type: "text", autocomplete: "address-level2" },
  { key: "diet", title: "Une information pour les repas ?", label: "Allergies ou restrictions alimentaires (facultatif)", type: "text", autocomplete: "off" },
  { key: "visible", title: "On aide tes copines à te retrouver ? ♡", label: "Affichage sur le plan", type: "text", autocomplete: "off" },
] as const;

export default function Participants({ seats, guests, onChange, onBack }: { seats: string[]; guests: Guests; onChange: (value: Guests) => void; onBack: () => void }) {
  const [position, setPosition] = useState(0);
  const [finished, setFinished] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [position, finished]);
  const person = Math.floor(position / questions.length);
  const question = questions[position % questions.length];
  const seat = demoSeats.find(s => s.id === seats[person])!;
  const guest = guests[seat.id] || empty;
  function change(key: keyof Guest, value: string | boolean) {
    onChange({ ...guests, [seat.id]: { ...guest, [key]: value } });
  }
  function next() {
    if (position + 1 === seats.length * questions.length) setFinished(true);
    else setPosition(p => p + 1);
  }
  function back() {
    if (finished) setFinished(false);
    else if (position > 0) setPosition(p => p - 1);
    else onBack();
  }
  return <div className={styles.screen}>
    <button className={styles.back} onClick={back}><ArrowLeft size={18} aria-hidden="true" /> Retour</button>
    <h1 ref={heading} tabIndex={-1}>{finished ? "Tout est prêt pour la suite ♡" : question.title}</h1>
    {finished ? <div className={styles.center}>
      <p>Voici les informations saisies dans cet aperçu.</p>
      {seats.map((id, index) => { const s = demoSeats.find(s => s.id === id)!; const g = guests[id]; return <div className={styles.summary} key={id}>
        <strong>Participante {index + 1} · {g.first}</strong>
        <span>{s.room} · {s.label}</span>
        <span>{g.email} · {g.city}</span>
        {g.diet && <span className={styles.preserved}>Repas : {g.diet}</span>}
        <span><UserRound size={18} aria-hidden="true" /> Sur le plan après réservation : {g.visible ? `${g.first} ${Array.from(g.last)[0]}. · ${g.city}` : "Place réservée"}</span>
        <button className={styles.back} onClick={() => { setPosition(index * questions.length); setFinished(false); }}>Modifier ses informations</button>
      </div>; })}
      <p className={styles.hint}>Aucune donnée n’a été envoyée ni enregistrée. Actualiser ou quitter la page efface cet essai. Utilise des coordonnées fictives.</p>
      <p>Prochaine étape : le paiement simulé. Les conditions de réservation seront présentées avant cette étape, une fois définies.</p>
    </div> : <form key={position} className={styles.center} onSubmit={e => { e.preventDefault(); next(); }}>
      <p>Participante {person + 1} sur {seats.length} · Question {position % questions.length + 1} sur {questions.length}</p>
      <p className={styles.hint}>{seat.room} · {seat.label}</p>
      <p className={styles.hint}>Démonstration privée : utilise des coordonnées fictives.</p>
      {question.key === "visible" ? <>
        <p>Une copine ou une lectrice que tu connais vient aussi ? En apparaissant sur le plan, elle pourra te repérer et choisir une place près de toi, selon les disponibilités. De quoi préparer votre petit cocon de lecture ensemble ♡</p>
        <label className={styles.consent}><input type="checkbox" checked={guest.visible} onChange={e => change("visible", e.target.checked)} /> {person === 0 ? "Oui, j’accepte que mon prénom, l’initiale de mon nom et ma ville apparaissent à mon couchage sur le plan, une fois ma réservation confirmée." : "Avec son accord, j’autorise l’affichage de son prénom, de l’initiale de son nom et de sa ville à son couchage, une fois sa réservation confirmée."}</label>
        <p className={styles.hint}>Tu préfères rester discrète ? Aucun souci, c’est facultatif : sans accord, seule la mention « Place réservée » apparaîtra. Le nom complet et les coordonnées restent privés.</p>
      </> : <label className={styles.field}>{question.label}
        {question.key === "diet" ? <textarea rows={3} maxLength={1000} value={guest.diet} onChange={e => change("diet", e.target.value)} placeholder="Ex. : végétarienne, allergie aux noix…" /> : <input type={question.type} required maxLength={question.key === "email" ? 254 : 100} autoComplete={question.autocomplete} value={guest[question.key]} onChange={e => { e.target.setCustomValidity(""); change(question.key, e.target.value); }} onBlur={e => { const value = e.target.value.trim(); change(question.key, value); e.target.setCustomValidity(value ? "" : "Merci de remplir ce champ."); }} />}
      </label>}
      <button className={styles.continue} type="submit">{position + 1 === seats.length * questions.length ? "Voir le récapitulatif" : "Continuer"} <Check size={17} aria-hidden="true" /></button>
    </form>}
  </div>;
}
