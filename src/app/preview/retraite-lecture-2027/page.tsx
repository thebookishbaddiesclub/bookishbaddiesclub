import Link from 'next/link';
import { BookOpen, Heart, Mountain, Sparkles } from 'lucide-react';
import styles from './presentation.module.css';
const root = '/preview/retraite-lecture-2027';
const programme = [
  {day:'Vendredi',mood:'On pose les valises.',items:['Arrivée et installation','Découverte du chalet','Grazing table & apéritif dînatoire','Première soirée lecture']},
  {day:'Samedi',mood:'On prend le temps.',items:['Brunch & reading time','Atelier jaspage','Atelier créatif autour du nouveau départ','Raclette, lecture et soirée entre Baddies']},
  {day:'Dimanche',mood:'Encore quelques pages…',items:['Petit-déjeuner / brunch léger','Derniers moments de lecture','Bagels ou sandwichs','Départ, des souvenirs plein les valises']},
];
const photos = [
  ['salon','Un salon pour nos reading times','Salon du chalet avec canapés, table basse et grandes fenêtres'],
  ['sejour','La grande tablée','Pièce de vie et table à manger ouverte sur les arbres'],
  ['terrasse','Une pause au grand air','Terrasse en bois avec table extérieure'],
  ['chambre','Un petit cocon pour la nuit','Chambre avec lit double et baie vitrée'],
  ['couchages','Des chambres à partager','Chambre avec deux couchages et accès à la terrasse'],
];
const faq = [
  ['Je peux venir seule ?', 'Bien sûr ♡ Le week-end est aussi pensé pour faire connaissance avec d’autres lectrices. Tu peux venir sans connaître personne et partager des moments autour des livres.'],
  ['Et avec une amie ?', 'Oui ! Le parcours te permet de venir à deux ou en groupe et de choisir vos couchages parmi les places disponibles.'],
  ['Comment fonctionnent les chambres ?', 'Les chambres sont partagées. Tu choisis une place précise sur le plan. La répartition reste provisoire et pourra être ajustée avec les participantes concernées.'],
  ['Est-ce que je dois partager un lit ?', 'Il y a des lits individuels et des lits doubles partagés. Tu indiques ta préférence, puis tu choisis parmi les couchages disponibles. Chaque lit double comporte deux places distinctes.'],
  ['Peut-on payer en plusieurs fois ?', 'Le paiement en trois fois sans frais est prévu, sous réserve de sa configuration définitive. Dans la simulation : premier règlement à la réservation, deuxième à mi-chemin et dernier le 1er février 2027. L’option est proposée jusqu’au 30 janvier inclus, puis le règlement est en une fois.'],
  ['Quelles sont les conditions d’annulation ?', 'Elles sont encore en cours de préparation. Elles seront affichées ici et présentées avant tout paiement réel. Aucune réservation réelle n’est ouverte dans cet aperçu.'],
  ['Comment se déroule le week-end ?', 'On alterne lecture, ateliers, repas partagés et temps libre. Le programme ci-dessus est prévisionnel : l’idée est de profiter du chalet et de ces moments ensemble, à son rythme.'],
];
function Reserve() {return <Link className={styles.cta} href={`${root}/reservation`}>Je réserve ma place ♡ <small>Tester le parcours privé</small></Link>;}
export default function RetreatPresentation() {
 return <article className={styles.page}>
  <div className={styles.private}><Link href="/admin">← Retour à l’admin</Link><span>Aperçu privé · réservations réelles fermées</span></div>
  <section className={styles.hero}>
   <img src={`${root}/photos/exterieur`} alt="Chalet entouré d’arbres, avec façade en pierre et balcons en bois" fetchPriority="high" />
   <div className={styles.heroText}><p className={styles.eyebrow}>Une parenthèse entre lectrices</p><h1>THE BOOKISH<br/><em>RETREAT</em></h1><p className={styles.subtitle}>Un week-end à la montagne,<br/>des livres et des Baddies.</p><div className={styles.facts}><span>12 — 14 mars 2027*</span><span>Pyrénées-Orientales*</span><span>À partir de 225 €</span></div><Reserve/><p className={styles.small}>*Dates et lieu provisoires. Paiement en 3 fois prévu, sous réserve de configuration.</p></div>
  </section>
  <section className={styles.section}><p className={styles.eyebrow}>Le temps d’un week-end</p><h2>Des livres. Un chalet.<br/><em>Et nous.</em></h2><p className={styles.lead}>Imagine : ton livre du moment, un coin cosy et des lectrices avec qui en parler pendant des heures. Une parenthèse intimiste à la montagne, pour ralentir, créer et se rencontrer.</p><div className={styles.experiences}>{[[BookOpen,'Lire, tout simplement','Des reading times et du temps libre pour avancer à ton rythme.'],[Heart,'Se rencontrer','Des repas partagés et des conversations qui commencent par « tu lis quoi ? ».'],[Sparkles,'Créer ensemble','Des ateliers pour essayer, imaginer et repartir avec un souvenir.'],[Mountain,'Souffler un peu','Profiter du chalet, du paysage et de cette pause hors du quotidien.']].map(([Icon,title,text])=>{const I=Icon as typeof Heart;return <div key={String(title)}><I size={28} strokeWidth={1.4}/><h3>{String(title)}</h3><p>{String(text)}</p></div>;})}</div></section>
  <section className={`${styles.section} ${styles.rose}`}><p className={styles.eyebrow}>Notre programme prévisionnel</p><h2>Trois jours pour <em>déconnecter.</em></h2><div className={styles.days}>{programme.map(p=><div key={p.day}><h3>{p.day}</h3><p className={styles.mood}>{p.mood}</p><ul>{p.items.map(i=><li key={i}>{i}</li>)}</ul></div>)}</div><p className={styles.small}>Le programme pourra évoluer. Les horaires précis seront communiqués avant le séjour.</p></section>
  <section className={styles.section}><p className={styles.eyebrow}>Notre cocon à la montagne</p><h2>Bienvenue <em>au chalet.</em></h2><p className={styles.lead}>Un salon pour bouquiner, une grande table pour se retrouver et des chambres partagées pour prolonger la parenthèse.</p><p className={styles.small}>Logement envisagé : Chalet Husky. Le choix du logement, les équipements et la répartition des couchages restent à confirmer.</p><div className={styles.gallery}>{photos.map(([id,caption,alt])=><figure key={id}><img src={`${root}/photos/${id}`} alt={alt} loading="lazy"/><figcaption>{caption}</figcaption></figure>)}</div><p className={styles.lead}>Les chambres sont partagées et certains lits doubles accueillent deux participantes. Le parcours te permet d’indiquer tes préférences et de choisir ton couchage.</p></section>
  <section className={`${styles.section} ${styles.included}`}><div><p className={styles.eyebrow}>Dans ta parenthèse bookish</p><h2>On a pensé<br/><em>aux petits détails.</em></h2></div><ul>{['Deux nuits sur place','Les repas prévus au programme','Les activités et ateliers','Le matériel créatif','Un welcome pack','Des petites attentions en préparation'].map(s=><li key={s}>♡ {s}</li>)}</ul><p className={styles.small}>Les surprises et cadeaux partenaires seront annoncés uniquement une fois confirmés.</p></section>
  <section className={styles.section}><p className={styles.eyebrow}>Choisis ta parenthèse</p><h2>Un week-end <em>pour toi.</em></h2><div className={styles.prices}><div><span>EARLY BIRD</span><strong>225 €</strong><p>par participante · quota à définir</p></div><div><span>TARIF NORMAL</span><strong>235 €</strong><p>par participante</p></div></div><p className={styles.lead}>Paiement en 3 fois sans frais prévu, sous réserve de configuration. Dernière échéance au plus tard le 1er février 2027.</p><Reserve/></section>
  <section className={styles.section}><p className={styles.eyebrow}>Les petites questions</p><h2>On te répond <em>ici.</em></h2><div className={styles.faq}>{faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
  <section className={`${styles.section} ${styles.rose} ${styles.finish}`}><Heart size={32}/><h2>Ton prochain chapitre<br/><em>commence ici ♡</em></h2><Reserve/><p className={styles.small}>Démonstration réservée à l’administration. Aucun paiement ni réservation réelle.</p></section>
 </article>;
}
