import {retreatStripeConfigured} from '@/lib/server/retreat-stripe';
import { cookies } from 'next/headers';
import { validSession } from '@/lib/admin-session';
import { getStockDatabase } from '@/lib/server/clients';
import { demoSeats } from '../reservation/demo-rooms';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
const uuid=(s:unknown)=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
export async function POST(request:Request){
 if(!await validSession((await cookies()).get('admin_session')?.value))return json({error:'Connexion admin requise pour cet essai.'},401);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origine invalide.'},403);
 try{
 const b=await request.json();
 if(!['inventory','status','start','claim'].includes(b.action))return json({error:'Action invalide.'},400);
 if(['status','claim'].includes(b.action)&&!uuid(b.token))return json({error:'Lien invalide.'},400);
 if(['start','claim'].includes(b.action)&&retreatStripeConfigured())return json({error:'Utilise le paiement Stripe de test pour confirmer cette place.'},409);
 if(['start','claim'].includes(b.action)){
 const g=b.guest;
 if(!uuid(b.requestId)||!demoSeats.some(s=>s.id===b.seat)||![19900,21500,31500].includes(b.cents)||typeof b.split!=='boolean'||!g||!['first','last','city','email'].every(k=>typeof g[k]==='string'&&g[k].trim()&&g[k].length<=254)||!/^\S+@\S+\.\S+$/.test(g.email)||typeof g.diet!=='string'||g.diet.length>1000||typeof g.visible!=='boolean')return json({error:'Vérifie tes informations.'},400);
 }
 if(b.action==='start'&&(!Array.isArray(b.seats)||b.seats.length>12||!b.seats.length||new Set(b.seats).size!==b.seats.length||!b.seats.includes(b.seat)||!b.seats.every((id:string)=>demoSeats.some(s=>s.id===id))))return json({error:'Choisis des couchages valides.'},400);
 const {data,error}=await getStockDatabase().rpc('retreat_v2_action',{p_action:b.action,p_token:b.token||null,p_request:b.requestId||null,p_seats:b.seats||null,p_seat:b.seat||null,p_guest:b.guest||null,p_cents:b.cents||null,p_split:b.split||false});
 if(error){
 const message=error.message.includes('CANCELLED')?'Cette réservation a été annulée. Recommence une nouvelle réservation.':error.message.includes('PRICE_CHANGED')?'Le dernier tarif Early vient d’être attribué. Actualise le tarif avant de confirmer.':error.message.includes('SPLIT_CLOSED')?'Le paiement en trois fois n’est plus disponible.':error.message.includes('EXPIRED')?'Le délai est écoulé. Les places déjà payées sont conservées.':error.message.includes('UNAVAILABLE')?'Cette sélection n’est plus disponible. Reviens au plan des chambres.':error.message.includes('NOT_FOUND')?'Ce lien de groupe est introuvable.':'La nouvelle billetterie doit être activée dans Supabase avec le script activer-billetterie-retraite.sql.';
 return json({error:message},409);
 }
 return json({...data,stripeTest:retreatStripeConfigured()});
 }catch{return json({error:'Impossible de joindre le service des groupes. Réessaie.'},503);}
}
