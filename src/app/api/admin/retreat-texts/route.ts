import {cookies} from 'next/headers';
import {validSession} from '@/lib/admin-session';
import {readRetreatTexts} from '@/lib/server/retreat-texts';
import {getStockDatabase} from '@/lib/server/clients';
import {validRetreatTexts} from '@/lib/retreat-texts';
export const dynamic='force-dynamic';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'private, no-store'}});
async function authorized(){return validSession((await cookies()).get('admin_session')?.value);}
export async function GET(){
 if(!await authorized())return json({error:'Connexion admin requise.'},401);
 return json(await readRetreatTexts());
}
export async function PUT(request:Request){
 if(!await authorized())return json({error:'Connexion admin requise.'},401);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origine invalide.'},403);
 try{
  const raw=await request.text();if(raw.length>160000)return json({error:'Texte trop long.'},413);
  const {values,revision}=JSON.parse(raw);
  if(!validRetreatTexts(values)||!Number.isSafeInteger(revision)||revision<0)return json({error:'Vérifie les textes saisis (6 000 caractères maximum par champ).'},400);
  const {data,error}=await getStockDatabase().from('retreat_page_content').update({texts:values,revision:revision+1,updated_at:new Date().toISOString()}).eq('id','mountain-2027').eq('revision',revision).select('revision').maybeSingle();
  if(error)return json({error:'Enregistrement indisponible. Vérifie que le script de l’éditeur a été exécuté dans Supabase.'},503);
  if(!data)return json({error:'Une autre version a été enregistrée. Copie tes modifications avant de recharger cette page.'},409);
  return json({revision:data.revision});
 }catch{return json({error:'Impossible d’enregistrer. Tes modifications restent dans le formulaire.'},503);}
}
