import {cookies} from 'next/headers';
import {validSession} from '@/lib/admin-session';
import {retreatPaymentStatus,reconcileRetreatOrder} from '@/lib/server/retreat-stripe';
export async function GET(request:Request){
 if(!await validSession((await cookies()).get('admin_session')?.value))return Response.json({error:'Connexion admin requise.'},{status:401});
 const id=new URL(request.url).searchParams.get('order');
 if(!id||!/^[0-9a-f-]{36}$/i.test(id))return Response.json({error:'Référence invalide.'},{status:400});
 try{
  // Read-only polling: only signed webhooks or an explicit admin reconciliation settle payments.
  return Response.json(await retreatPaymentStatus(id),{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Confirmation en attente.'},{status:503});}
}
export async function POST(request:Request){
 if(!await validSession((await cookies()).get('admin_session')?.value))return Response.json({error:'Connexion admin requise.'},{status:401});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origine invalide.'},{status:403});
 try{const {id}=await request.json();if(typeof id!=='string'||!/^[0-9a-f-]{36}$/i.test(id))throw Error();await reconcileRetreatOrder(id);return Response.json({ok:true});}
 catch{return Response.json({error:'Vérification Stripe impossible. Réessaie.'},{status:503});}
}
