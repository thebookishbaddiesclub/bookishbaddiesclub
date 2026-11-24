import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {randomUUID} from 'node:crypto';
const guest={first:'Test',last:'Baddie',email:'test@example.com',city:'Test',diet:'',visible:false};
async function setup(){
 const db=new PGlite();await db.exec('create role anon; create role authenticated; create role service_role;');
 for(const file of ['202611190001_retreat_booking_v2.sql','202611190002_retreat_automatic_payments.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
 const plan=[{number:1,cents:6633,dueAt:'2026-11-20T10:00:00Z'},{number:2,cents:6633,dueAt:'2026-12-26T09:00:00Z'},{number:3,cents:6634,dueAt:'2027-02-01T09:00:00Z'}];
 async function prepare(seat,seats=[seat],id=randomUUID(),token=null){
  return (await db.query('select retreat_payment_prepare($1,$2,$3,$4,$5,19900,true,$6,$7) as result',[id,token,seats,seat,JSON.stringify(guest),JSON.stringify(plan),'Test consent'])).rows[0].result;
 }
 async function attach(o){await db.query("update retreat_payment_orders set session_id=$2,customer_id='cus_test' where id=$1",[o.id,'cs_'+o.id]);}
 async function finish(o,paid,amount=6633){
  return (await db.query("select retreat_payment_finish($1,$2,$3,$4,'eur','cus_test','pm_test',now()) as result",[o.id,'cs_'+o.id,paid,amount])).rows[0].result;
 }
 async function inventory(){return(await db.query("select retreat_v2_action('inventory') as result")).rows[0].result;}
 return{db,prepare,attach,finish,inventory};
}
test('Stripe preparation holds inventory without confirming, settlement is verified and idempotent',async()=>{
 const {db,prepare,attach,finish,inventory}=await setup();
 try{
 const o=await prepare('2-0-0',['2-0-0','2-0-1']);await attach(o);
 const retry=await prepare('2-0-0',['2-0-0','2-0-1'],o.id);assert.equal(retry.id,o.id);
 assert.equal((await inventory()).earlyRemaining,4);
 await assert.rejects(prepare('2-0-0'),/UNAVAILABLE/);
 await assert.rejects(finish(o,true,1),/PAYMENT_MISMATCH/);
 assert.equal((await db.query('select state from retreat_payment_orders where id=$1',[o.id])).rows[0].state,'pending');
 await finish(o,true);await finish(o,true);
 assert.equal((await inventory()).earlyRemaining,3);
 const group=(await db.query('select expires_at from retreat_v2_groups where token=$1',[o.group_token])).rows[0];
 assert(Math.abs(Date.parse(group.expires_at)-Date.now()-3600000)<5000);
 await finish(o,false);assert.equal((await db.query('select state from retreat_payment_orders where id=$1',[o.id])).rows[0].state,'paid');
 const rows=(await db.query('select * from retreat_payment_steps where order_id=$1 order by number',[o.id])).rows;
 assert.deepEqual(rows.map(r=>r.status),['paid','pending','pending']);
 await assert.rejects(db.query("select retreat_v2_action('admin_cancel',null,$1)",[o.place_id]),/STRIPE_MANAGED/);
 }finally{await db.close();}
});
test('last four Early checkouts serialize and an expired payment restores the available offer',async()=>{
 const {db,prepare,attach,finish,inventory}=await setup();
 try{
 const orders=[];
 for(const seat of ['2-0-0','2-0-1','2-1-0','4-0-0']){const o=await prepare(seat);await attach(o);orders.push(o);}
 await assert.rejects(prepare('4-1-0'),/EARLY_BUSY/);
 await finish(orders[0],false);
 assert(!(await inventory()).unavailable.includes('2-0-0'));
 await prepare('4-1-0');
 const pending=(await db.query("select count(*)::int n from retreat_payment_orders where state='pending'")).rows[0].n;
 assert.equal(pending,4);
 }finally{await db.close();}
});
test('a pending group payment remains protected during group expiry and on an admin invitation cancellation',async()=>{
 const {db,prepare,attach,finish,inventory}=await setup();
 try{
 const leader=await prepare('2-0-0',['2-0-0','2-0-1','2-1-0']);await attach(leader);await finish(leader,true);
 const friend=await prepare('2-0-1',['2-0-1'],randomUUID(),leader.group_token);await attach(friend);
 await db.query("update retreat_v2_groups set expires_at=now()-interval '1 minute' where token=$1",[leader.group_token]);
 assert((await inventory()).unavailable.includes('2-0-1'));
 await finish(friend,false);
 assert(!(await inventory()).unavailable.includes('2-0-1'));
 assert((await inventory()).unavailable.includes('2-0-0'));
 }finally{await db.close();}
});

test('full-price checkout settles once without a saved card and releases a failed reservation',async()=>{
 const {db,inventory}=await setup();
 try{
  const id=randomUUID(),plan=[{number:1,cents:19900,dueAt:new Date().toISOString()}];
  const o=(await db.query("select retreat_payment_prepare($1,null,$2,$3,$4,19900,false,$5,'Full payment test') as result",[id,['2-0-0','2-0-1'],'2-0-0',JSON.stringify(guest),JSON.stringify(plan)])).rows[0].result;
  await db.query("update retreat_payment_orders set session_id='cs_full',customer_id='cus_test',consent_version='card-klarna-v2' where id=$1",[id]);
  const finish=(paid,cents)=>db.query("select retreat_payment_finish($1,'cs_full',$2,$3,'eur','cus_test',null,now())",[id,paid,cents]);
  await assert.rejects(finish(true,6633),/PAYMENT_MISMATCH/);
  await finish(true,19900);await finish(true,19900);await finish(false,0);
  assert.equal((await inventory()).earlyRemaining,3);
  const steps=(await db.query('select * from retreat_payment_steps where order_id=$1',[id])).rows;
  assert.equal(steps.length,1);assert.equal(steps[0].status,'paid');assert.equal(steps[0].invoice_id,null);
  const friendId=randomUUID();
  await db.query("select retreat_payment_prepare($1,$2,$3,$4,$5,19900,false,$6,'Full payment test')",[friendId,o.group_token,['2-0-1'],'2-0-1',JSON.stringify(guest),JSON.stringify(plan)]);
  await db.query("update retreat_payment_orders set session_id='cs_failed',customer_id='cus_test' where id=$1",[friendId]);
  await db.query("select retreat_payment_finish($1,'cs_failed',false,0,'eur',null,null,null)",[friendId]);
  const available=await inventory();assert(available.unavailable.includes('2-0-0'));assert(!available.unavailable.includes('2-0-1'));
 }finally{await db.close();}
});
