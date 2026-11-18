"use client";
import {useEffect,useState} from 'react';
import {ChevronLeft,ChevronRight,Pause,Play} from 'lucide-react';
import styles from './presentation.module.css';
const photos=[
 ['exterieur','Le chalet entouré d’arbres à Bolquère'],['salon','Salon et salle à manger ouverts sur les arbres'],['sejour','Cuisine et grande table pour les repas partagés'],['couchages','Chambre avec deux couchages et baie vitrée'],['facade','Façade du chalet et terrasse en bois'],['chambre','Chambre avec lit double et grande fenêtre'],['superposes','Lits superposés dans une chambre'],['terrasse','Terrasse avec vue sur les montagnes'],
];
export default function ChaletGallery(){
 const [index,setIndex]=useState(0),[playing,setPlaying]=useState(true),[hover,setHover]=useState(false),[focus,setFocus]=useState(false),[reduced,setReduced]=useState(true);
 useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 useEffect(()=>{if(!playing||hover||focus||reduced)return;const id=setInterval(()=>{if(!document.hidden)setIndex(i=>(i+1)%photos.length);},5000);return()=>clearInterval(id);},[playing,hover,focus,reduced]);
 function move(delta:number){setPlaying(false);setIndex(i=>(i+delta+photos.length)%photos.length);}
 return <div className={styles.slideshow} role="region" aria-roledescription="carrousel" aria-label="Photos du chalet" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={()=>setFocus(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocus(false);}}>
  <figure><img src={`/preview/retraite-lecture-2027/photos/${photos[index][0]}`} alt={photos[index][1]} width={1400} height={900}/><figcaption aria-live={playing?'off':'polite'}>{photos[index][1]}</figcaption></figure>
  <div className={styles.galleryControls}><button aria-label="Photo précédente" onClick={()=>move(-1)}><ChevronLeft/></button><span>{index+1} / {photos.length}</span><button aria-label="Photo suivante" onClick={()=>move(1)}><ChevronRight/></button>{!reduced&&<button onClick={()=>setPlaying(v=>!v)} aria-label={playing?'Mettre le défilement en pause':'Lancer le défilement'}>{playing?<Pause/>:<Play/>}</button>}</div>
 </div>;
}
