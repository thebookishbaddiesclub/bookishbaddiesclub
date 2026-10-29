"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { eventCategory } from "@/lib/event-category";

export type ClubEvent = { id: string; title: string; starts_at: string; city: string; summary?: string; image_url?: string; action_url?: string; action_label?: string; category?: string };

export default function EventCard({ event, past = false }: { event: ClubEvent; past?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const previousOverflow = useRef<string | null>(null);
  const twitch = eventCategory(event.category) === "twitch";
  const date = new Date(event.starts_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" });
  const location = twitch ? "En ligne · Twitch" : event.city;
  const description = event.summary || "";
  const excerpt = description.length > 180 ? `${description.slice(0, 180).trimEnd()}…` : description;
  const actionUrl = event.action_url && /^https?:\/\//i.test(event.action_url) ? event.action_url : null;
  const restoreScroll = () => { if (previousOverflow.current !== null) { document.body.style.overflow = previousOverflow.current; previousOverflow.current = null; } };
  useEffect(() => restoreScroll, []);
  const open = () => { dialog.current?.showModal(); previousOverflow.current = document.body.style.overflow; document.body.style.overflow = "hidden"; };
  const ticket = () => actionUrl && !past ? <a href={actionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center rounded-full bg-bb-rose px-5 py-3 text-xs font-bold text-white">{twitch ? "Voir sur Twitch" : "Je prends ma place"}</a> : null;
  return <>
    <article className="flex flex-col overflow-hidden rounded-[2rem] border border-bb-beige bg-white/60 shadow-sm">
      {event.image_url ? <div className="relative aspect-[16/9]"><Image src={event.image_url} alt={event.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div> : <div className="flex aspect-[16/9] items-center justify-center bg-bb-beige/30 text-5xl" aria-hidden="true">{twitch ? "📺" : "✨"}</div>}
      <div className="flex flex-1 flex-col p-6"><p className="text-xs font-bold uppercase tracking-widest text-bb-rose">{date} · {location}</p><h4 className="mt-2 font-serif text-2xl">{event.title}</h4><p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-bb-ink/70">{excerpt}</p><div className="mt-auto flex flex-wrap gap-3 pt-5"><button type="button" onClick={open} aria-haspopup="dialog" className="rounded-full border border-bb-beige px-5 py-3 text-xs font-bold">En savoir plus</button>{ticket()}</div></div>
    </article>
    <dialog ref={dialog} onClose={restoreScroll} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }} aria-labelledby={`event-title-${event.id}`} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-[2rem] bg-bb-cream p-0 text-bb-ink shadow-2xl backdrop:bg-black/50">
      <div className="p-6 md:p-10"><div className="mb-5 flex justify-end"><button type="button" autoFocus onClick={() => dialog.current?.close()} className="rounded-full border border-bb-beige px-4 py-2 text-sm">Fermer ✕</button></div>
        {event.image_url && <div className="relative mb-6 h-[40vh] w-full"><Image src={event.image_url} alt={event.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-contain" /></div>}
        <h2 id={`event-title-${event.id}`} className="font-serif text-3xl md:text-4xl">{event.title}</h2><p className="mt-4 text-sm font-semibold text-bb-rose">{date} (heure de Paris) · {location}</p>{past && <p className="mt-2 text-sm">Événement passé</p>}
        <p className="my-6 whitespace-pre-wrap break-words leading-relaxed">{description}</p>{ticket()}
      </div>
    </dialog>
  </>;
}
