import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retreatInstallments,installmentConsent} from '../src/lib/retreat-installments';
import {scheduleRetreatInvoices,retreatStripeConfigured,getRetreatStripe} from '../src/lib/server/retreat-stripe';
test('three exact installments with Paris calendar cutoff and no recurring fourth charge',()=>{
 for(const [total,expected] of [[19900,[6633,6633,6634]],[21500,[7166,7166,7168]],[31500,[10500,10500,10500]]] as const){
  const plan=retreatInstallments(total,true,new Date('2026-11-20T15:00:00Z'));
  assert.deepEqual(plan.map(p=>p.cents),expected);
  assert.equal(plan.reduce((sum,p)=>sum+p.cents,0),total);
  assert.equal(plan[2].dueAt,'2027-02-01T09:00:00.000Z');
  assert(plan[1].dueAt>plan[0].dueAt&&plan[1].dueAt<plan[2].dueAt);
  assert(installmentConsent(plan).includes('Aucun abonnement'));
 }
 assert.equal(retreatInstallments(19900,true,new Date('2027-01-30T22:59:59Z')).length,3);
 assert.throws(()=>retreatInstallments(19900,true,new Date('2027-01-30T23:00:00Z')),/SPLIT_CLOSED/);
 assert.equal(retreatInstallments(19900,false,new Date('2027-02-02')).length,1);
 assert.throws(()=>retreatInstallments(1,false),/INVALID_PRICE/);
});
test('private testing rejects a live Stripe key',()=>{
 const oldKey=process.env.RETREAT_STRIPE_TEST_SECRET_KEY;
 process.env.RETREAT_STRIPE_TEST_SECRET_KEY='sk_live_invalid_test_placeholder';
 try{assert.equal(retreatStripeConfigured(),false);assert.throws(getRetreatStripe,/STRIPE_TEST_NOT_CONFIGURED/);}
 finally{if(oldKey===undefined)delete process.env.RETREAT_STRIPE_TEST_SECRET_KEY;else process.env.RETREAT_STRIPE_TEST_SECRET_KEY=oldKey;}
});
test('schedule creates two draft-first invoices and safely recovers a lost create response',async()=>{
 const invoices:any[]=[];const updates:any[]=[];let lost=true;let added=0;
 const stripe:any={
  invoices:{
   list:()=>({async *[Symbol.asyncIterator](){for(const i of invoices)yield i;}}),
   create:async(params:any)=>{
    assert.equal(params.auto_advance,false);assert.equal(params.pending_invoice_items_behavior,'exclude');
    const invoice={...params,id:'in_'+invoices.length,livemode:false,status:'draft',total:0,lines:{data:[]}};
    invoices.push(invoice);
    if(lost){lost=false;throw Error('Lost network response');}
    return invoice;
   },
   retrieve:async(id:string)=>invoices.find(i=>i.id===id),
   update:async(id:string,params:any)=>{const i=invoices.find(i=>i.id===id);assert(i.total>0);Object.assign(i,params);return i;},
  },
  invoiceItems:{create:async(params:any)=>{added++;const i=invoices.find(i=>i.id===params.invoice);i.total+=params.amount;i.lines.data.push({metadata:params.metadata});}},
 };
 const order:any={id:'order',split:true,state:'paid',customer_id:'cus_test',payment_method_id:'pm_test'};
 const plan=retreatInstallments(19900,true,new Date('2026-11-20'));
 const steps:any=plan.map(s=>({number:s.number,cents:s.cents,due_at:s.dueAt,invoice_id:null}));
 const persist:any=async(...args:any[])=>{updates.push(args);return true;};
 await assert.rejects(scheduleRetreatInvoices(stripe,order,steps,persist),/Lost/);
 await scheduleRetreatInvoices(stripe,order,steps,persist);
 await scheduleRetreatInvoices(stripe,order,steps,persist);
 assert.equal(invoices.length,2);assert.equal(added,2);
 assert.deepEqual(invoices.map(i=>i.total),[6633,6634]);
 assert(invoices.every(i=>i.auto_advance&&i.default_payment_method==='pm_test'));
 assert.equal(invoices[1].automatically_finalizes_at,Date.parse('2027-02-01T09:00:00Z')/1000);
});
test('overdue scheduling never silently initiates a catch-up debit',async()=>{
 const saved:any[]=[];let enabled=false;
 const invoice:any={id:'in_old',status:'draft',livemode:false,currency:'eur',total:6633,lines:{data:[{metadata:{retreat_order:'order'}}]},auto_advance:false};
 const stripe:any={invoices:{retrieve:async()=>invoice,update:async()=>{enabled=true;}}};
 const order:any={id:'order',split:true,state:'paid',customer_id:'cus',payment_method_id:'pm'};
 await scheduleRetreatInvoices(stripe,order,[{number:2,cents:6633,due_at:'2020-01-01',invoice_id:'in_old',status:'pending',hosted_url:null,email_status:null}],async(_id,_n,values)=>{saved.push(values);return true;});
 assert.equal(enabled,false);assert.equal(saved[0].status,'needs_review');
});
