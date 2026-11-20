import {cookies} from 'next/headers';
import {validSession} from '@/lib/admin-session';
import {getStockDatabase} from '@/lib/server/clients';
import {demoSeats} from '@/app/preview/retraite-lecture-2027/reservation/demo-rooms';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
async function authorized(){return validSession((await cookies()).get('admin_session')?.value);}
export async function GET(){
 if(!await authorized())return json({error:'Connexion admin requise.'},401);
 const {data,error}=await getStockDatabase().rpc('retreat_v2_action',{p_action:'admin_list'});
 if(!error){
  const db=getStockDatabase();
  const {data:orders}=await db.from('retreat_payment_orders').select('id,place_id,state,cents,split,session_id,created_at,expires_at');
  const {data:steps}=await db.from('retreat_payment_steps').select('order_id,number,cents,due_at,status,hosted_url,error');
  return json({...data,payments:orders||[],paymentSteps:steps||[]});
 }
 return error?json({error:'Active le script activer-billetterie-retraite.sql dans Supabase, puis recharge cette page.'},503):json(data);
}
export async function POST(request:Request){
 if(!await authorized())return json({error:'Connexion admin requise.'},401);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origine invalide.'},403);
 try{
  const {action,id,seat}=await request.json();
  if(!['admin_cancel','admin_release','admin_move','admin_block'].includes(action))return json({error:'Action invalide.'},400);
  if(action!=='admin_block'&&(typeof id!=='string'||!/^[0-9a-f-]{36}$/i.test(id)))return json({error:'Réservation invalide.'},400);
  if(['admin_move','admin_block'].includes(action)&&!demoSeats.some(s=>s.id===seat))return json({error:'Place invalide.'},400);
  const {data,error}=await getStockDatabase().rpc('retreat_v2_action',{p_action:action,p_request:id||null,p_seat:seat||null});
  if(error)return json({error:error.message.includes('UNAVAILABLE')?'Cette place n’est plus disponible. Actualise le tableau.':'Modification impossible. Actualise le tableau et vérifie la sélection.'},409);
  return json(data);
 }catch{return json({error:'Modification impossible.'},400);}
}
