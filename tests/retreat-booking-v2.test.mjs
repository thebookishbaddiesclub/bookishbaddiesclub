import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {randomUUID} from 'node:crypto';
const sql=await readFile(new URL('../supabase/migrations/202611190001_retreat_booking_v2.sql',import.meta.url),'utf8');
const guest={first:'Alice',last:'Test',email:'test@example.com',city:'Montpellier',visible:false,diet:''};
async function setup(){
 const db=new PGlite();
 await db.exec('create role anon; create role authenticated; create role service_role;');
 await db.exec(sql);
 async function call(action,{token=null,request=null,seats=null,seat=null,cents=19900,split=false}={}){
 return (await db.query('select retreat_v2_action($1,$2::uuid,$3::uuid,$4::text[],$5,$6::jsonb,$7,$8) as result',[action,token,request,seats,seat,JSON.stringify(guest),cents,split])).rows[0].result;
 }
 const book=(seat,cents=19900,seats=[seat],request=randomUUID())=>call('start',{seat,seats,cents,request});
 return {db,call,book};
}
test('four Early confirmations only, held places do not consume quota and stale quotes are rejected',async()=>{
 const {db,call,book}=await setup();
 try{
 const group=await book('2-0-0',19900,['2-0-0','2-0-1','2-1-0']);
 assert.equal((await call('inventory')).earlyRemaining,3);
 await book('4-0-0');await book('4-1-0');
 const results=await Promise.allSettled([book('5-0-0'),book('5-0-1')]);
 assert.equal(results.filter(x=>x.status==='fulfilled').length,1);
 assert.match(results.find(x=>x.status==='rejected').reason.message,/PRICE_CHANGED/);
 assert.equal((await call('inventory')).earlyRemaining,0);
 await assert.rejects(call('claim',{token:group.token,request:randomUUID(),seat:'2-0-1'}),/PRICE_CHANGED/);
 await call('claim',{token:group.token,request:randomUUID(),seat:'2-0-1',cents:21500});
 const admin=await call('admin_list');
 assert.equal(admin.reservations.filter(r=>r.tariff==='early').length,4);
 const early=admin.reservations.find(r=>r.tariff==='early');
 await call('admin_cancel',{request:early.id});
 assert.equal((await call('inventory')).earlyRemaining,0);
 const publicData=JSON.stringify(await call('inventory'));
 assert(!publicData.includes('test@example.com'));assert(!publicData.includes('Alice'));
 await assert.rejects(book('1-0-0'),/INVALID/);
 }finally{await db.close();}
});
test('private room occupies two beds for one person and excludes Early',async()=>{
 const {db,call,book}=await setup();
 try{
 await assert.rejects(book('3-private',19900),/PRICE_CHANGED/);
 const privateGroup=await book('3-private',31500);
 assert.equal(privateGroup.places.length,1);assert.equal(privateGroup.places[0].tariff,'private');
 const inv=await call('inventory');assert.equal(inv.earlyRemaining,4);
 assert.deepEqual(inv.unavailable.sort(),['3-0-0','3-0-1']);
 await assert.rejects(book('3-0-0'),/UNAVAILABLE/);
 await assert.rejects(book('3-0-1'),/UNAVAILABLE/);
 const privateBooking=(await call('admin_list')).reservations[0];
 await call('admin_cancel',{request:privateBooking.id});
 await book('3-0-0');
 await assert.rejects(book('3-private',31500),/UNAVAILABLE/);
 }finally{await db.close();}
});
test('holds prevent privatization, expiry frees only unpaid places, retries do not restart the hour',async()=>{
 const {db,call,book}=await setup();
 try{
 const request=randomUUID();const group=await book('2-0-0',19900,['2-0-0','3-0-0'],request);
 const retry=await book('2-0-0',19900,['2-0-0','3-0-0'],request);
 assert.equal(group.expiresAt,retry.expiresAt);assert.equal((await call('inventory')).earlyRemaining,3);
 await assert.rejects(book('3-private',31500),/UNAVAILABLE/);
 await db.query("update retreat_v2_groups set expires_at=now()-interval '1 second' where token=$1",[group.token]);
 const inv=await call('inventory');assert.deepEqual(inv.unavailable,['2-0-0']);
 await assert.rejects(call('claim',{token:group.token,request:randomUUID(),seat:'3-0-0'}),/EXPIRED/);
 await book('3-private',31500);
 await assert.rejects(book('3-private',31500,['3-private','3-0-1']),/INVALID/);
 }finally{await db.close();}
});
test('admin blocking, moves, cancellation and permissions respect occupancy',async()=>{
 const {db,call,book}=await setup();
 try{
 await call('admin_block',{seat:'3-0-1'});
 await assert.rejects(book('3-private',31500),/UNAVAILABLE/);
 const blocked=(await call('admin_list')).reservations[0];
 await call('admin_release',{request:blocked.id});
 await book('2-0-0');await book('2-0-1');
 const b=(await call('admin_list')).reservations.find(r=>r.seat==='2-0-0');
 await assert.rejects(call('admin_move',{request:b.id,seat:'2-0-1'}),/UNAVAILABLE/);
 await call('admin_move',{request:b.id,seat:'5-1-0'});
 const moved=(await call('admin_list')).reservations.find(r=>r.id===b.id);
 assert.equal(moved.cents,19900);assert.equal(moved.seat,'5-1-0');
 await db.exec('set role anon;');
 await assert.rejects(db.query("select retreat_v2_action('inventory')"),/permission denied/);
 await assert.rejects(db.query("select * from retreat_v2_places"),/permission denied/);
 await db.exec('reset role;set role service_role;');
 await assert.rejects(db.query("insert into retreat_v2_places(seat,occupied,state) values('1',array['1'],'paid')"),/permission denied/);
 }finally{await db.close();}
});
test('full capacity is 12 shared or 11 participants with a private room',async()=>{
 for(const privateRoom of [false,true]){
 const {db,call,book}=await setup();
 try{
 const seats=['2-0-0','2-0-1','2-1-0',...(privateRoom?['3-private']:['3-0-0','3-0-1']),'4-0-0','4-1-0','4-2-0','4-2-1','5-0-0','5-0-1','5-1-0'];
 let early=0;
 for(const seat of seats){await book(seat,seat==='3-private'?31500:early++<4?19900:21500);}
 const admin=await call('admin_list');
 assert.equal(admin.reservations.filter(r=>r.state==='paid').length,privateRoom?11:12);
 assert.equal(admin.reservations.filter(r=>r.tariff==='early').length,4);
 assert.equal(admin.reservations.filter(r=>r.tariff==='classic').length,privateRoom?6:8);
 assert.equal(admin.unavailable.length,12);
 }finally{await db.close();}
 }
});
