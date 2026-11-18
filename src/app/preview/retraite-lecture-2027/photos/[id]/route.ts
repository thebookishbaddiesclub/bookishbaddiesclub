import { cookies } from 'next/headers';
import { validSession } from '@/lib/admin-session';
import exterieur from '@/lib/retreat-photos/exterieur.json';
import salon from '@/lib/retreat-photos/salon.json';
import sejour from '@/lib/retreat-photos/sejour.json';
import terrasse from '@/lib/retreat-photos/terrasse.json';
import chambre from '@/lib/retreat-photos/chambre.json';
import couchages from '@/lib/retreat-photos/couchages.json';
import facade from '@/lib/retreat-photos/facade.json';
import superposes from '@/lib/retreat-photos/superposes.json';
import olympe from '@/lib/retreat-photos/olympe.json';
export const dynamic = 'force-dynamic';
const photos: Record<string,string> = {exterieur,salon,sejour,terrasse,chambre,couchages,facade,superposes,olympe};
export async function GET(_request: Request, {params}: {params: Promise<{id:string}>}) {
  if (!await validSession((await cookies()).get('admin_session')?.value)) return new Response(null,{status:401});
  const {id}=await params;
  if (!Object.prototype.hasOwnProperty.call(photos,id)) return new Response(null,{status:404});
  return new Response(Buffer.from(photos[id],'base64'),{headers:{'Content-Type':'image/webp','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
}
