import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {randomUUID} from 'node:crypto';
test('group deadline, individual claims, idempotency, expiry and paid-seat preservation', async()=>{
 const db=new PGlite();
 await db.exec('create role anon; create role authenticated; create role service_role;');
 await db.exec(await readFile(new URL('../supabase/migrations/202611180001_retreat_preview_groups.sql',import.meta.url),'utf8'));
 const guest={first:'Test',last:'Demo',email:'test@example.com',city:'Test',visible:false,diet:''};
 async function call(action,token=null,request=null,seats=null,seat=null){return (await db.query('select retreat_preview_action($1,$2::uuid,$3::uuid,$4::text[],$5,$6::jsonb,22500,false) as result',[action,token,request,seats,seat,JSON.stringify(guest)])).rows[0].result;}
 const req=randomUUID();const a=await call('start',null,req,['1-0-0','1-0-1','1-1-0'],'1-0-0');
 assert.equal(Date.parse(a.expiresAt)-Date.parse(a.now),3600000);
 const retry=await call('start',null,req,['1-0-0','1-0-1','1-1-0'],'1-0-0');assert.equal(retry.token,a.token);assert.equal(retry.expiresAt,a.expiresAt);
 await assert.rejects(call('start',null,randomUUID(),['1-0-1'],'1-0-1'),/UNAVAILABLE/);
 const claimReq=randomUUID();const joined=await call('claim',a.token,claimReq,null,'1-0-1');assert.equal(joined.expiresAt,a.expiresAt);assert.equal(joined.places.filter(s=>s.state==='paid').length,2);
 assert(!JSON.stringify(joined).includes('test@example.com'));assert(!JSON.stringify(joined).includes('Demo'));assert(joined.places.every(s=>s.name===null));
 await assert.rejects(call('claim',a.token,randomUUID(),null,'1-0-1'),/UNAVAILABLE/);
 await db.query("update retreat_preview_groups set expires_at=now()-interval '1 second' where token=$1",[a.token]);
 const expired=await call('status',a.token);assert.equal(expired.places.filter(s=>s.state==='paid').length,2);assert.equal(expired.places.find(s=>s.id==='1-1-0').state,'released');
 await assert.rejects(call('claim',a.token,randomUUID(),null,'1-1-0'),/EXPIRED/);
 const paidRetry=await call('claim',a.token,claimReq,null,'1-0-1');assert.equal(paidRetry.places.filter(s=>s.state==='paid').length,2);
 const inventory=await call('inventory');assert.deepEqual(inventory.unavailable.sort(),['1-0-0','1-0-1']);
 await call('start',null,randomUUID(),['1-1-0'],'1-1-0');
 await assert.rejects(call('start',null,randomUUID(),['1-0-0'],'1-0-0'),/UNAVAILABLE/);
 await db.close();
});
