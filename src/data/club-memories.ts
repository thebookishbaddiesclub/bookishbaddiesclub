export type MemoryChapter = "hero" | "origine" | "communaute" | "bookclub" | "evenements" | "baddies-night" | "weekends" | "avenir" | "finale";

export interface ClubMemory {
  src: string;
  alt: string;
  caption: string;
  chapter: MemoryChapter;
  orientation?: "portrait" | "landscape";
}

export const clubMemories: ClubMemory[] = [
  {
    "src": "/club/souvenir-01.webp",
    "alt": "Les lectrices réunies avec leurs tote bags décorés",
    "caption": "Nos baddies ♡",
    "chapter": "hero",
    "orientation": "portrait"
  },
  {
    "src": "/club/souvenir-02.webp",
    "alt": "Lectrices autour d’une table de livres et de gourmandises",
    "caption": "Encore un chapitre…",
    "chapter": "hero",
    "orientation": "portrait"
  },
  {
    "src": "/club/souvenir-03.webp",
    "alt": "Décoration de cœurs pour une rencontre entre lectrices",
    "caption": "Galentine’s gang",
    "chapter": "hero",
    "orientation": "portrait"
  },
  {
    "src": "/club/souvenir-04.webp",
    "alt": "Coin lecture avec des livres autour d’un canapé",
    "caption": "Là où l’on se retrouve",
    "chapter": "origine",
    "orientation": "portrait"
  },
  {
    "src": "/club/souvenir-05.webp",
    "alt": "Un carton rempli de romans Saxus Romance",
    "caption": "Nos prochaines obsessions",
    "chapter": "origine",
    "orientation": "portrait"
  },
  {
    "src": "/club/souvenir-06.webp",
    "alt": "Photo de groupe des lectrices en plein air avec leurs livres",
    "caption": "Une bande de copines",
    "chapter": "communaute",
    "orientation": "portrait"
  },
  {
    "src": "/club/souvenir-07.webp",
    "alt": "Livres et boissons sur une table entourée de lectrices",
    "caption": "Bookclub night ♡",
    "chapter": "bookclub",
    "orientation": "portrait"
  },
  {
    "src": "/club/souvenir-08.webp",
    "alt": "Discussion du Bookish Baddies Club devant un écran de cinéma",
    "caption": "Les livres, autrement",
    "chapter": "evenements",
    "orientation": "portrait"
  },
  {
    "src": "/club/souvenir-09.webp",
    "alt": "Écran de la soirée cinéma La Femme de ménage",
    "caption": "Watch party",
    "chapter": "evenements",
    "orientation": "portrait"
  },
  {
    "src": "/club/souvenir-10.webp",
    "alt": "Une Baddies Night suivie sur un ordinateur portable",
    "caption": "Entre les lignes",
    "chapter": "baddies-night",
    "orientation": "portrait"
  },
  {
    "src": "/club/souvenir-11.webp",
    "alt": "Atelier créatif avec papiers colorés et matériel sur la table",
    "caption": "Créer ensemble",
    "chapter": "avenir",
    "orientation": "portrait"
  },
  {
    "src": "/club/souvenir-12.webp",
    "alt": "Les membres du club réunies pour une photo de groupe",
    "caption": "Core memory ♡",
    "chapter": "finale",
    "orientation": "landscape"
  },
  {
    "src": "/club/souvenir-13.webp",
    "alt": "Un repas partagé entre les membres du club",
    "caption": "À la prochaine ?",
    "chapter": "finale",
    "orientation": "portrait"
  }
];
