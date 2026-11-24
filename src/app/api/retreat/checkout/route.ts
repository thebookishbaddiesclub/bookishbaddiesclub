import {cookies} from 'next/headers';
import {validSession} from '@/lib/admin-session';
import {createRetreatCheckout} from '@/lib/server/retreat-stripe';
import {demoSeats} from '@/app/preview/retraite-lecture-2027/reservation/demo-rooms';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export async function POST(request:Request){
 if(!await validSession((await cookies()).get('admin_session')?.value))return json({error:'Connexion admin requise.'},401);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origine invalide.'},403);
 try{
  const raw=await request.text();if(raw.length>12000)return json({error:'Données trop longues.'},413);
  const b=JSON.parse(raw),g=b.guest;
  if(!uuid(b.requestId)||(b.token&&!uuid(b.token))||!Array.isArray(b.seats)||b.seats.length<1||b.seats.length>12||!b.seats.includes(b.seat)||!b.seats.every((s:string)=>demoSeats.some(d=>d.id===s))||![19900,21500,31500].includes(b.cents)||b.split!==false||b.accepted!==true||!g||!['first','last','city','email'].every(k=>typeof g[k]==='string'&&g[k].trim()&&g[k].length<=254)||!/^\S+@\S+\.\S+$/.test(g.email)||typeof g.diet!=='string'||g.diet.length>1000||typeof g.visible!=='boolean')return json({error:'Vérifie les informations et ton accord de paiement.'},400);
  return json(await createRetreatCheckout(b));
 }catch(e){
  const message=e instanceof Error?e.message:'';
  return json({error:message.includes('EARLY_BUSY')?'Les dernières places Early sont en cours de paiement. Réessaie dans quelques minutes.':message.includes('UNAVAILABLE')?'Cette place n’est plus disponible. Reviens au plan.':message.includes('PRICE_CHANGED')||message.includes('PLAN_CHANGED')?'Le tarif ou le mode de paiement a changé. Recommence la réservation pour ouvrir une nouvelle session.':message.includes('STRIPE_TEST_NOT_CONFIGURED')?'Le paiement Stripe de test n’est pas encore configuré.':message.includes('REQUEST_CHANGED')?'Les informations ont changé. Recommence la réservation.':'Paiement non préparé. Réessaie avec les mêmes informations ; si cela persiste, consulte le suivi admin.'},409);
 }
}

