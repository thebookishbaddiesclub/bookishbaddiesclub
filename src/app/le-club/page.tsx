import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";
import { clubMemories, type MemoryChapter } from "@/data/club-memories";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Le Club — Bookish Baddies Club",
  description: "Des livres, des rencontres et une bande de copines. Découvrez l’histoire du Bookish Baddies Club, à Montpellier et Perpignan.",
};

function Memories({ chapter }: { chapter: MemoryChapter }) {
  const photos = clubMemories.filter(photo => photo.chapter === chapter);
  if (!photos.length) return null;
  return <aside className={styles.memories} aria-label="Souvenirs du club">
    {photos.map((photo, index) => <figure key={photo.src} className={styles.photo}
      style={{ "--tilt": `${index % 2 ? 3 : -4}deg` } as CSSProperties}>
      {/* Native image accepts the community’s hosted photos without broadening Next image hosts. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async"
        className={photo.orientation === "portrait" ? styles.portrait : styles.landscape} />
      <figcaption>{photo.caption}</figcaption>
    </figure>)}
  </aside>;
}

function Chapter({ id, number, title, children }: { id: MemoryChapter; number: string; title: ReactNode; children: ReactNode }) {
  const hasPhotos = clubMemories.some(photo => photo.chapter === id);
  return <section id={id} className={`${styles.chapter} ${hasPhotos ? styles.withPhotos : ""}`}>
    <div className={styles.story}>
      <span className={styles.number}>{number} / LE CLUB</span>
      <h2>{title}</h2>
      <div className={styles.copy}>{children}</div>
    </div>
    <Memories chapter={id} />
  </section>;
}

const formats = [
  { id: "bookclub", title: "Le bookclub", text: "Lectures communes, rencontres mensuelles, débats et discussions autour de nos dernières obsessions littéraires.", link: "/lectures", label: "Nos lectures communes" },
  { id: "evenements", title: "Les événements", text: "Avant-premières cinéma, soirées thématiques, rencontres et activités créatives.", link: "/evenements", label: "Les prochains rendez-vous" },
  { id: "baddies-night", title: "Baddies Night", text: "Nos soirées sur Twitch avec des autrices pour parler de leurs romans, de leur parcours, de leurs lectures et de tout ce qui se passe entre les lignes.", link: "https://www.twitch.tv/thebookishbaddiesclub", label: "Retrouvons-nous sur Twitch" },
  { id: "weekends", title: "Les week-ends lecture", text: "Des parenthèses cosy entre lectrices : de beaux endroits, des livres, des activités, de la nourriture et du temps pour déconnecter.", link: "/evenements", label: "Découvrir les événements" },
] as const;

export default function ClubPage() {
  return <article className={styles.page}>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>BOOKISH BADDIES CLUB ❤️‍🔥</p>
      <h1>Plus qu’un<br /><em>bookclub.</em></h1>
      <p className={styles.intro}>Une bande de copines qui aiment<br className={styles.desktopBreak} /> beaucoup trop parler de livres.</p>
      <p className={styles.lead}>Le Bookish Baddies Club est né d’une idée toute simple : créer l’espace que j’aurais aimé trouver en tant que lectrice. Un endroit pour rencontrer d’autres passionnées, parler pendant des heures de nos lectures et vivre ensemble tout ce qui existe autour des livres.</p>
      <Memories chapter="hero" />
      <a href="#origine" className={styles.scroll}>Notre histoire <span aria-hidden="true">↓</span></a>
    </section>

    <Chapter id="origine" number="02" title={<>Je voulais juste trouver<br /><em>des copines avec qui parler livres.</em></>}>
      <p>Moi, c’est Anaïs ! Quand j’ai emménagé à Montpellier, mes copines avec qui papoter livres étaient loin : j’ai créé le bookclub pour rencontrer des lectrices dans ma nouvelle ville, discuter de nos lectures et aller ensemble en librairie.</p>
      <p>Puis j’ai déménagé à Perpignan, et je me suis dit : pourquoi ne pas faire se rencontrer les lectrices d’ici aussi ?</p>
      <blockquote>Spoiler : au tout premier bookclub, j’étais ultra-stressée.</blockquote>
    </Chapter>

    <section className={styles.team} aria-labelledby="team-title">
      <p className={styles.eyebrow}>LES VISAGES DU CLUB</p>
      <h2 id="team-title">Derrière les rencontres,<br /><em>des lectrices comme toi.</em></h2>
      <div className={styles.teamGrid}>
        {[
          { id: "anais", name: "Anaïs", role: "Créatrice du Bookish Baddies Club", book: "Le Chevalier et la Phalène" },
          { id: "deborah", name: "Déborah", role: "Ambassadrice de Montpellier", book: "Le Chevalier et la Phalène" },
          { id: "lea", name: "Léa", role: "Ambassadrice de Perpignan", book: <>Le Royaume des Cendres —<br />Le Trône de Verre, Tome 7</> },
        ].map(person => <article key={person.name} className={styles.profile}>
          <div className={styles.profilePortrait}>
            <h3 className="sr-only">{person.name}</h3>
            <svg className={styles.curvedName} viewBox="0 0 300 300" aria-hidden="true">
              <defs><path id={`name-arc-${person.id}`} d={person.id === "lea" ? "M 55,78 Q 150,-26 245,78" : "M 55,96 Q 150,-8 245,96"} /></defs>
              <text><textPath href={`#name-arc-${person.id}`} startOffset="50%" textAnchor="middle">{person.name}</textPath></text>
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/club/${person.id}.webp`} alt={`Portrait de ${person.name}`} width={1000} height={1000} loading="lazy" />
          </div>
          <p className={styles.role}>{person.role}</p>
          <p className={styles.favorite}><span>Lecture préférée</span>{person.book}</p>
        </article>)}
      </div>
    </section>

    <Chapter id="communaute" number="03" title={<>Venir pour les livres.<br /><em>Rester pour les copines.</em></>}>
      <p>Le cœur du Bookish Baddies Club, ce sont les rencontres.</p>
      <p>On vient parler de personnages fictifs comme s’ils existaient vraiment, défendre nos unpopular opinions, découvrir de nouvelles lectures et partager nos dernières obsessions.</p>
      <p>Mais surtout, on rencontre d’autres lectrices.</p>
      <blockquote>Tu peux venir seule.<br />C’est même un peu le principe.</blockquote>
    </Chapter>

    <section className={styles.formats} aria-labelledby="formats-title">
      <span className={styles.number}>04 / LES LIVRES, MAIS PAS QUE</span>
      <h2 id="formats-title">Les livres, on les vit aussi<br /><em>en dehors de nos bibliothèques.</em></h2>
      {formats.map((format, index) => <section key={format.id} className={`${styles.format} ${clubMemories.some(photo => photo.chapter === format.id) ? styles.withPhotos : ""}`}>
        <div className={styles.story}>
          <span className={styles.formatIndex}>0{index + 1}</span>
          <h3>{format.title}</h3>
          <p>{format.text}</p>
          <Link href={format.link} className={styles.textLink}>{format.label} <span aria-hidden="true">↗</span></Link>
        </div>
        <Memories chapter={format.id} />
      </section>)}
    </section>

    <Chapter id="avenir" number="05" title={<>Et je ne compte pas<br /><em>m’arrêter là.</em></>}>
      <p>Mon envie est de continuer à imaginer les expériences que je rêverais de vivre en tant que lectrice : rencontres, soirées, ateliers créatifs, week-ends lecture, collaborations avec des autrices, maisons d’édition et marques…</p>
      <p>Toujours avec la même idée : <strong>faire sortir les livres de nos bibliothèques pour créer des souvenirs autour d’eux.</strong></p>
    </Chapter>
    <section className={styles.finale}>
      <Memories chapter="finale" />
      <p className={styles.eyebrow}>IL RESTE UNE PLACE POUR TOI</p>
      <h2>Et le prochain souvenir ?<br /><em>On le crée ensemble.</em></h2>
      <div className={styles.actions}>
        <Link className={styles.primary} href="/evenements">Voir les prochains événements <span aria-hidden="true">→</span></Link>
        <a className={styles.secondary} href="https://tally.so/r/jaoWo6">Rejoindre le Club</a>
      </div>
      <p className={styles.signature}>Montpellier · Perpignan · et tant de souvenirs à créer</p>
    </section>
  </article>;
}
