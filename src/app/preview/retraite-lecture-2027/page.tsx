import Link from 'next/link';
import { BookOpen, Heart, Mountain, Sparkles } from 'lucide-react';
import styles from './presentation.module.css';
const root = '/preview/retraite-lecture-2027';
const experiences = [
 {title:'Des lectures qui débordent',text:'Un plaid, quelques pages, puis une discussion qui part sur ton dernier coup de cœur. Apporte les livres qui te font envie : ici, on lit à son rythme.'},
 {title:'Les mains dans la création',text:'Des activités créatives pour tester de nouvelles idées, papoter et fabriquer un souvenir du week-end. Le détail des ateliers sera dévoilé plus tard 👀'},
 {title:'Un peu d’air frais',text:'Une balade pour profiter de la montagne et prendre le temps de regarder autour de nous, selon la météo et les envies du groupe.'},
 {title:'À table, les Baddies !',text:'Des repas partagés, de bonnes choses à grignoter et des conversations qui traînent. Les pauses gourmandes font aussi partie du programme.'},
 {title:'Du temps pour toi, des moments avec elles',text:'Bouquiner dans un coin, discuter sur le canapé ou ne rien prévoir du tout. Pas besoin de remplir chaque minute pour passer un bon week-end 🫶'},
];
const photos = [
  ['salon','Un salon pour nos reading times','Salon du chalet avec canapés, table basse et grandes fenêtres'],
  ['sejour','La grande tablée','Pièce de vie et table à manger ouverte sur les arbres'],
  ['terrasse','Une pause au grand air','Terrasse en bois avec table extérieure'],
  ['chambre','Un petit cocon pour la nuit','Chambre avec lit double et baie vitrée'],
  ['couchages','Des chambres à partager','Chambre avec deux couchages et accès à la terrasse'],
];
const faq = [
  ['Je peux venir seule ?', 'Bien sûr Le week-end est aussi pensé pour faire connaissance avec d’autres lectrices. Tu peux venir sans connaître personne et partager des moments autour des livres.'],
  ['Et avec les copines ?', 'Choisis vos places et règle uniquement la tienne. Dès la confirmation de ton premier paiement, les autres places du groupe sont gardées une heure. Tu partages le lien privé : chacune renseigne ses informations et paie sa place, en une ou trois fois selon la date. Le compte à rebours est commun. À la fin du délai, seules les places non payées sont libérées.'],
  ['Comment fonctionnent les chambres ?', 'Les chambres sont partagées. Tu choisis une place précise sur le plan. La répartition reste provisoire et pourra être ajustée avec les participantes concernées.'],
  ['Est-ce que je dois partager un lit ?', 'Il y a des lits individuels et des lits doubles partagés. Tu indiques ta préférence, puis tu choisis parmi les couchages disponibles. Chaque lit double comporte deux places distinctes.'],
  ['Peut-on payer en plusieurs fois ?', 'Le paiement en trois fois sans frais est prévu, sous réserve de sa configuration définitive. Dans la simulation : premier règlement à la réservation, deuxième à mi-chemin et dernier le 1er février 2027. L’option est proposée jusqu’au 30 janvier inclus, puis le règlement est en une fois.'],
  ['Quelles sont les conditions d’annulation ?', 'Elles sont encore en cours de préparation. Elles seront affichées ici et présentées avant tout paiement réel. Aucune réservation réelle n’est ouverte dans cet aperçu.'],
  ['Comment se déroule le week-end ?', 'On alterne lecture, ateliers, repas partagés et temps libre. Pas de planning à la minute : on profite du chalet et de ces moments ensemble, à son rythme. Les activités et les balades pourront évoluer selon la météo et l’organisation.'],
];
function Reserve() {return <Link className={styles.cta} href={`${root}/reservation`}>Je réserve ma place <small>Tester le parcours privé</small></Link>;}
export default function RetreatPresentation() {
 return <article className={styles.page}>
  <div className={styles.private}><Link href="/admin">← Retour à l’admin</Link><span>Aperçu privé · réservations réelles fermées</span></div>
  <section className={styles.hero}>
   <img src={`${root}/photos/exterieur`} alt="Chalet entouré d’arbres, avec façade en pierre et balcons en bois" fetchPriority="high" />
   <div className={styles.heroText}><p className={styles.eyebrow}>Une parenthèse entre lectrices</p><h1>Le Week-end<br/>des Baddies<br/><em>Mountain Edition</em></h1><p className={styles.subtitle}>Un week-end à la montagne,<br/>des livres et des Baddies.</p><div className={styles.facts}><span>12 — 14 mars 2027*</span><span>Pyrénées-Orientales*</span><span>À partir de 225 €</span></div><Reserve/><p className={styles.small}>*Dates et lieu provisoires. Paiement en 3 fois prévu, sous réserve de configuration.</p></div>
  </section>
  <section className={styles.section}><p className={styles.eyebrow}>Le temps d’un week-end</p><h2>Des livres. Un chalet.<br/><em>Et nous.</em></h2><p className={styles.lead}>Imagine : ton livre du moment, un coin cosy et des lectrices avec qui en parler pendant des heures. Une parenthèse intimiste à la montagne, pour ralentir, créer et se rencontrer.</p><div className={styles.experiences}>{[[BookOpen,'Lire, tout simplement','Des reading times et du temps libre pour avancer à ton rythme.'],[Heart,'Se rencontrer','Des repas partagés et des conversations qui commencent par « tu lis quoi ? ».'],[Sparkles,'Créer ensemble','Des ateliers pour essayer, imaginer et repartir avec un souvenir.'],[Mountain,'Souffler un peu','Profiter du chalet, du paysage et de cette pause hors du quotidien.']].map(([Icon,title,text])=>{const I=Icon as typeof Heart;return <div key={String(title)}><I size={28} strokeWidth={1.4}/><h3>{String(title)}</h3><p>{String(text)}</p></div>;})}</div></section>
  <section className={`${styles.section} ${styles.rose}`}><p className={styles.eyebrow}>Ce qui vous attend</p><h2>Des livres, des copines,<br/><em>et une bonne dose de montagne.</em></h2><p className={styles.lead}>On ne vous dévoile pas tout maintenant. Mais voici l’ambiance : des moments simples, de quoi créer, prendre l’air et repartir avec plein de souvenirs ✨</p><div className={styles.days}>{experiences.map(p=><div key={p.title}><h3>{p.title}</h3><p className={styles.mood}>{p.text}</p></div>)}</div><p className={styles.small}>Les activités restent prévisionnelles. Les balades dépendront notamment de la météo ; les informations pratiques seront partagées avant le séjour.</p></section>
  <section className={styles.section}><p className={styles.eyebrow}>Notre cocon à la montagne</p><h2>Bienvenue <em>au chalet.</em></h2><p className={styles.lead}>Un salon pour bouquiner, une grande table pour se retrouver et des chambres partagées pour prolonger la parenthèse.</p><p className={styles.small}>Logement envisagé : Chalet Husky. Le choix du logement, les équipements et la répartition des couchages restent à confirmer.</p><div className={styles.gallery}>{photos.map(([id,caption,alt])=><figure key={id}><img src={`${root}/photos/${id}`} alt={alt} loading="lazy"/><figcaption>{caption}</figcaption></figure>)}</div><p className={styles.lead}>Les chambres sont partagées et certains lits doubles accueillent deux participantes. Le parcours te permet d’indiquer tes préférences et de choisir ton couchage.</p></section>
  <section className={`${styles.section} ${styles.included}`}><div><p className={styles.eyebrow}>Dans ta parenthèse bookish</p><h2>On a pensé<br/><em>aux petits détails.</em></h2></div><ul>{['Deux nuits sur place','Les repas du séjour','Les activités et ateliers','Le matériel créatif','Un welcome pack','Des petites attentions en préparation'].map(s=><li key={s}>{s}</li>)}</ul><p className={styles.small}>Les surprises et cadeaux partenaires seront annoncés uniquement une fois confirmés.</p></section>
  <section className={styles.section}><p className={styles.eyebrow}>Choisis ta parenthèse</p><h2>Un week-end <em>pour toi.</em></h2><div className={styles.prices}><div><span>EARLY BIRD</span><strong>225 €</strong><p>par participante · quota à définir</p></div><div><span>TARIF NORMAL</span><strong>235 €</strong><p>par participante</p></div></div><p className={styles.lead}>Paiement en 3 fois sans frais prévu, sous réserve de configuration. Dernière échéance au plus tard le 1er février 2027.</p><Reserve/></section>
  <section className={styles.section}><p className={styles.eyebrow}>Les petites questions</p><h2>On te répond <em>ici.</em></h2><div className={styles.faq}>{faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
  <section className={`${styles.section} ${styles.rose} ${styles.finish}`}><Heart size={32}/><h2>Prête pour le week-end<br/><em>des Baddies ? ❤️‍🔥</em></h2><Reserve/><p className={styles.small}>Démonstration réservée à l’administration. Aucun paiement ni réservation réelle.</p></section>
 </article>;
}
