import { readRetreatTexts } from '@/lib/server/retreat-texts';
import { retreatTextFields } from '@/lib/retreat-texts';
import ChaletGallery from './chalet-gallery';
import Link from 'next/link';
import { BookOpen, Heart, Mountain, Sparkles } from 'lucide-react';
import styles from './presentation.module.css';
const root = '/preview/retraite-lecture-2027';
function Reserve({label}:{label:string}) {return <Link className={styles.cta} href={`${root}/reservation`}>{label} <small>Tester le parcours privé</small></Link>;}
export default async function RetreatPresentation() {
 const saved = await readRetreatTexts();
 const text = (id: string) => saved.values[id] ?? retreatTextFields.find(f=>f.id===id)!.value;
const experiences = [
 {title:text("text-001"),text:text("text-002")},
 {title:text("text-003"),text:text("text-004")},
 {title:text("text-005"),text:text("text-006")},
 {title:text("text-007"),text:text("text-008")},
 {title:text("text-009"),text:text("text-010")},
];
const faq = [
  [text("text-011"), text("text-012")],
  [text("text-013"), text("text-014")],
  [text("text-015"), text("text-016")],
  [text("text-017"), text("text-018")],
  [text("text-019"), text("text-020")],
  [text("text-021"), text("text-022")],
  [text("text-023"), text("text-024")],
];

 return <article className={styles.page}>
  <div className={styles.private}><Link href="/admin">← Retour à l’admin</Link><span>Aperçu privé · réservations réelles fermées</span></div>
  <section className={styles.hero}>
   <img src={`${root}/photos/exterieur`} alt="Chalet entouré d’arbres, avec façade en pierre et balcons en bois" fetchPriority="high" />
   <div className={styles.heroText}><p className={styles.eyebrow}>{text("text-025")}</p><h1 className="sr-only">{text("text-026")} {text("text-027")} — {text("text-028")}</h1><div className={styles.weekendLogo}><img src="/preview/retraite-lecture-2027/photos/weekend-logo" alt="Le week-end des Baddies" width={960} height={960}/></div><p className={styles.edition}>{text("text-028")}</p><p className={styles.subtitle}>{text("text-029")}<br/>{text("text-030")}</p><div className={styles.facts}><span>{text("text-031")}</span><span>{text("text-032")}</span><span>{text("text-033")}</span></div><p className={styles.partnerTeaser}>{text("text-034")}</p><Reserve label={text("reserve-label")}/><p className={styles.small}>{text("text-035")}</p></div>
  </section>
  <section className={styles.partner} aria-labelledby="olympe-title"><div className={styles.partnerLogo}><img src={`${root}/photos/olympe`} alt="Logo des éditions Olympe" width={300} height={300}/><span>{text("text-036")}</span></div><div><p className={styles.eyebrow}>{text("text-037")}</p><h2 id="olympe-title">{text("text-038")}<br/><em>{text("text-039")}</em></h2><p className={styles.lead}>{text("text-040")}<strong>{text("text-041")}</strong>{text("text-042")}</p><p className={styles.lead}>{text("text-043")}</p><p className={styles.small}>{text("text-044")}</p></div></section>
  <section className={styles.section}><p className={styles.eyebrow}>{text("text-045")}</p><h2>{text("text-046")}<br/><em>{text("text-047")}</em></h2><p className={styles.lead}>{text("text-048")}</p><div className={styles.experiences}>{[[BookOpen,text("text-049"),text("text-050")],[Heart,text("text-051"),text("text-052")],[Sparkles,text("text-053"),text("text-054")],[Mountain,text("text-055"),text("text-056")]].map(([Icon,title,text])=>{const I=Icon as typeof Heart;return <div key={String(title)}><I size={28} strokeWidth={1.4}/><h3>{String(title)}</h3><p>{String(text)}</p></div>;})}</div></section>
  <section className={`${styles.section} ${styles.rose}`}><p className={styles.eyebrow}>{text("text-057")}</p><h2>{text("text-058")}<br/><em>{text("text-059")}</em></h2><p className={styles.lead}>{text("text-060")}</p><div className={styles.days}>{experiences.map(p=><div key={p.title}><h3>{p.title}</h3><p className={styles.mood}>{p.text}</p></div>)}</div><p className={styles.small}>{text("text-061")}</p></section>
  <section className={`${styles.section} ${styles.lodging}`}><div><p className={styles.eyebrow}>{text("text-062")}</p><h2>{text("text-063")}<em>{text("text-064")}</em></h2><p className={styles.lead}>{text("text-065")}</p><p className={styles.small}>{text("text-066")}</p><p className={styles.lead}>{text("text-067")}</p></div><ChaletGallery/></section>
  <section className={`${styles.section} ${styles.included}`}><div><p className={styles.eyebrow}>{text("text-068")}</p><h2>{text("text-069")}<br/><em>{text("text-070")}</em></h2></div><ul>{[text("text-071"),text("text-072"),text("text-073"),text("text-074"),text("text-075"),text("text-076"),text("text-077")].map(s=><li key={s}>{s}</li>)}</ul><p className={styles.small}>{text("text-078")}</p></section>
  <section className={styles.section}><p className={styles.eyebrow}>{text("text-079")}</p><h2>{text("text-080")}<em>{text("text-081")}</em></h2><div className={styles.prices}><div><span>{text("text-082")}</span><strong>{text("text-083")}</strong><p>{text("text-084")}</p></div><div><span>{text("text-085")}</span><strong>{text("text-086")}</strong><p>{text("text-087")}</p></div></div><p className={styles.lead}>{text("text-088")}</p><Reserve label={text("reserve-label")}/></section>
  <section className={styles.section}><p className={styles.eyebrow}>{text("text-089")}</p><h2>{text("text-090")}<em>{text("text-091")}</em></h2><div className={styles.faq}>{faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
  <section className={`${styles.section} ${styles.rose} ${styles.finish}`}><Heart size={32}/><h2>{text("text-092")}<br/><em>{text("text-093")}</em></h2><Reserve label={text("reserve-label")}/><p className={styles.small}>Démonstration réservée à l’administration. Aucun paiement ni réservation réelle.</p></section>
 </article>;
}

