import {cookies} from 'next/headers';
import {createHash} from 'node:crypto';
import {validSession} from '@/lib/admin-session';
import {retreatConfirmationHtml,retreatConfirmationSubject} from '@/lib/retreat-confirmation';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!await validSession((await cookies()).get('admin_session')?.value))return Response.json({error:'Connexion admin requise.'},{status:401});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origine invalide.'},{status:403});
 const key=process.env.RESEND_API_KEY,from=process.env.EMAIL_FROM;
 if(!key||!from)return Response.json({error:'Configure RESEND_API_KEY et EMAIL_FROM dans Vercel.'},{status:503});
 const html=retreatConfirmationHtml();
 const digest=createHash('sha256').update(html+from).digest('hex').slice(0,32);
 try{
  const response=await fetch('https://api.resend.com/emails',{
   method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':'retreat-html-test-'+digest+'-'+new Date().toISOString().slice(0,10)},
   body:JSON.stringify({from,to:['thebookishbaddiesclub@gmail.com'],subject:'[TEST] '+retreatConfirmationSubject,html}),signal:AbortSignal.timeout(20000),
  });
  const result=await response.json();
  if(!response.ok||!result.id)return Response.json({error:response.status===403?'Resend refuse l’expéditeur : vérifie EMAIL_FROM et le domaine validé.':'Resend n’a pas confirmé l’envoi. Réessaie ; le même test est protégé contre les doublons pendant la journée.'},{status:502});
  return Response.json({id:result.id,message:'Test accepté par Resend pour thebookishbaddiesclub@gmail.com. Vérifie la boîte de réception et les indésirables.'},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Confirmation Resend indisponible. Réessaie sans risque de doublon pour ce test aujourd’hui.'},{status:502});}
}
