import Link from "next/link";
import Image from "next/image";
import styles from "./home.module.css";

export default function Home() {
  return <div className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.label}>Montpellier · Perpignan · Et sur Twitch</p>
        <h1>Des livres.<br />Des rencontres.<br /><em>Nos petits bonheurs.</em></h1>
        <p className={styles.lead}>Ici, on lit, on crée et on s’évade le temps d’une soirée ou d’un week-end. Bienvenue au Bookish Baddies Club.</p>
        <div className={styles.actions}><a className={styles.primary} href="https://tally.so/r/jaoWo6" target="_blank" rel="noopener noreferrer">Rejoindre la liste d’attente ↗</a><Link className={styles.link} href="/le-club">Découvrir le club →</Link></div>
      </div>
      <figure className={styles.heroPhoto}><Image src="/club/souvenir-01.webp" alt="Les lectrices du Bookish Baddies Club réunies avec leurs tote bags" width={650} height={800} priority /><figcaption>Des pages et des copines ♡</figcaption></figure>
    </section>
    <section className={styles.intro}>
      <p className={styles.label}>Plus qu’un bookclub</p>
      <h2>Une passion commune,<br /><em>des liens qui se créent.</em></h2>
      <p>Un espace pour se retrouver entre lectrices, autour de livres qui font battre nos cœurs et de moments qui font du bien. Que tu viennes pour papoter de ta dernière lecture ou rencontrer de nouvelles copines, il y a une place pour toi.</p>
    </section>
    <section className={styles.format}>
      <figure className={styles.photo}><Image src="/club/souvenir-07.webp" alt="Une table de rencontre du bookclub, entre livres et boissons" width={600} height={650} /><figcaption>Encore un chapitre…</figcaption></figure>
      <div><p className={styles.label}>01 / Les lectures communes · Gratuit</p><h2>Un livre par mois,<br /><em>mille choses à se dire.</em></h2><p>À Montpellier et à Perpignan, on partage une lecture commune, on échange nos impressions et on choisit ensemble nos prochaines pépites. Un rendez-vous pour parler livres et faire de belles rencontres.</p><Link className={styles.link} href="/lectures">Découvrir les lectures du moment →</Link><br /><a className={styles.link} href="https://tally.so/r/jaoWo6" target="_blank" rel="noopener noreferrer">Rejoindre la liste d’attente ↗</a></div>
    </section>
    <section className={`${styles.format} ${styles.reverse}`}>
      <figure className={styles.photo}><Image src="/club/souvenir-11.webp" alt="Un atelier créatif organisé avec les lectrices" width={600} height={650} /><figcaption>Des souvenirs entre les pages ♡</figcaption></figure>
      <div><p className={styles.label}>02 / Les Bookevents · Ouverts à tout le monde</p><h2>Les livres nous réunissent.<br /><em>La suite s’invente ensemble.</em></h2><p>Brunchs, ateliers créatifs, Watch Parties, Booknights, chasses aux livres… On se retrouve pour essayer de nouvelles activités et s’évader du quotidien. Les événements sont payants : toutes les infos et les inscriptions sont sur leur fiche.</p><Link className={styles.link} href="/evenements">Voir les prochains événements →</Link></div>
    </section>
    <section className={styles.format}>
      <figure className={styles.photo}><Image src="/club/souvenir-10.webp" alt="Une Baddies Night en direct sur Twitch avec des invitées" width={600} height={650} /><figcaption>On se retrouve dans le chat !</figcaption></figure>
      <div><p className={styles.label}>03 / Les Baddies Night · Sur Twitch</p><h2>Un plaid, un écran,<br /><em>et une soirée entre baddies.</em></h2><p>Pas besoin d’habiter à côté pour nous retrouver ! Les Baddies Night, ce sont nos soirées sur Twitch avec des autrices pour parler de leurs romans, de leur parcours, de leurs lectures et de tout ce qui se passe entre les lignes.</p><p>Installe-toi, rejoins la discussion dans le chat et partage tes questions avec nous.</p><a className={styles.primary} href="https://www.twitch.tv/thebookishbaddiesclub" target="_blank" rel="noopener noreferrer">Retrouver les Baddies Night sur Twitch ↗</a></div>
    </section>
    <section className={styles.partner}><p className={styles.label}>Notre librairie partenaire</p><h2>Le Coin de Mnemosyne</h2><p>Parce que l’amour des livres se partage aussi en librairie.</p></section>
  </div>;
}
