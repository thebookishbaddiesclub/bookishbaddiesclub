import Stripe from 'stripe';
import {getStockDatabase,getSiteOrigin} from './clients';
import {retreatInstallments,type Installment} from '../retreat-installments';

import {retreatCheckoutParams,retreatCheckoutConsent,RETREAT_CHECKOUT_VERSION,RETREAT_CHECKOUT_FLOW} from '../retreat-checkout';

export function retreatStripeConfigured(){
 return /^sk_test_/.test(process.env.RETREAT_STRIPE_TEST_SECRET_KEY||'') && !!process.env.RETREAT_STRIPE_TEST_WEBHOOK_SECRET;
}
export function getRetreatStripe(){
 const key=process.env.RETREAT_STRIPE_TEST_SECRET_KEY;
 if(!key||!key.startsWith('sk_test_'))throw Error('STRIPE_TEST_NOT_CONFIGURED');
 return new Stripe(key,{maxNetworkRetries:2,timeout:15000});
}
type Order={id:string;place_id:string;group_token:string;leader:boolean;cents:number;split:boolean;state:string;session_id:string|null;customer_id:string|null;payment_method_id:string|null;expires_at:string;created_at:string;email_sent:boolean};
type Step={number:number;cents:number;due_at:string;invoice_id:string|null;status:string;hosted_url:string|null;email_status:string|null};
async function orderData(id:string){
 const db=getStockDatabase();
 const {data:order,error}=await db.from('retreat_payment_orders').select('*').eq('id',id).single();
 if(error||!order)throw Error('ORDER_NOT_FOUND');
 const {data:steps,error:stepsError}=await db.from('retreat_payment_steps').select('*').eq('order_id',id).order('number');
 const {data:place,error:placeError}=await db.from('retreat_v2_places').select('guest,seat').eq('id',order.place_id).single();
 if(stepsError||placeError||!place||!steps)throw Error('ORDER_NOT_FOUND');
 return {order:order as Order,steps:steps as Step[],place};
}
async function saveOrder(id:string,values:Record<string,unknown>){
 const {error}=await getStockDatabase().from('retreat_payment_orders').update(values).eq('id',id);if(error)throw error;
}
async function saveStep(id:string,n:number,values:Record<string,unknown>){
 let query=getStockDatabase().from('retreat_payment_steps').update(values).eq('order_id',id).eq('number',n);
 if(values.status && values.status!=='paid')query=query.neq('status','paid');
 const {data,error}=await query.select('number');if(error)throw error;
 return !!data?.length;
}
const metadata=(id:string,n?:number)=>({retreat_flow:'automatic_v1',retreat_order:id,...(n?{installment:String(n)}:{})});
const amount=(cents:number)=>(cents/100).toFixed(2)+' €';
const date=(at:string)=>new Date(at).toLocaleDateString('fr-FR',{timeZone:'Europe/Paris'});
export async function createRetreatCheckout(body:{requestId:string;token?:string;seats:string[];seat:string;guest:Record<string,unknown>;cents:number;split:boolean;consentVersion:string;expectedSteps:Installment[]}){
 const stripe=getRetreatStripe(),db=getStockDatabase();
 if(body.split)throw Error('PLAN_CHANGED');
 const plan=retreatInstallments(body.cents,false);
 if(body.consentVersion!==RETREAT_CHECKOUT_VERSION||!Array.isArray(body.expectedSteps)||JSON.stringify(body.expectedSteps.map(s=>[s.cents,s.number,s.number===1?'now':s.dueAt]))!==JSON.stringify(plan.map(s=>[s.cents,s.number,s.number===1?'now':s.dueAt])))throw Error('PLAN_CHANGED');
 const {error}=await db.rpc('retreat_payment_prepare',{p_id:body.requestId,p_token:body.token||null,p_seats:body.seats,p_seat:body.seat,p_guest:body.guest,p_cents:body.cents,p_split:body.split,p_steps:plan,p_consent:retreatCheckoutConsent(body.cents)});
 if(error)throw Error(error.message);
 let {order}=await orderData(body.requestId);
 if(order.state!=='pending')throw Error('ORDER_ALREADY_FINISHED');
 if(order.split)throw Error('PLAN_CHANGED');
 // Keep the existing database RPC compatible; persist the new consent version before contacting Stripe.
 await saveOrder(order.id,{consent_version:RETREAT_CHECKOUT_VERSION});
 if(order.session_id){
  const session=await stripe.checkout.sessions.retrieve(order.session_id);
  if(session.metadata?.retreat_flow!==RETREAT_CHECKOUT_FLOW)throw Error('PLAN_CHANGED');
  if(session.status!=='open'||!session.url)throw Error('ORDER_ALREADY_FINISHED');
  return {url:session.url};
 }
 if(Date.parse(order.expires_at)-Date.now()<30*60*1000)throw Error('CHECKOUT_RECONCILE');
 if(!order.customer_id){
  const customer=await stripe.customers.create({email:String(body.guest.email),name:String(body.guest.first)+' '+String(body.guest.last),metadata:{retreat_flow:RETREAT_CHECKOUT_FLOW,retreat_order:order.id}},{idempotencyKey:'retreat-customer-'+order.id});
  await saveOrder(order.id,{customer_id:customer.id});order={...order,customer_id:customer.id};
 }
 const session=await stripe.checkout.sessions.create(retreatCheckoutParams(order,getSiteOrigin()),{idempotencyKey:'retreat-checkout-'+order.id});
 if(session.livemode)throw Error('LIVE_MODE_FORBIDDEN');
 await saveOrder(order.id,{session_id:session.id});
 if(!session.url)throw Error('CHECKOUT_URL_MISSING');
 return {url:session.url};
}

/** Schedule exactly one invoice per remaining installment. Draft-first avoids empty automatic charges. */
export async function scheduleRetreatInvoices(stripe:Stripe,order:Order,steps:Step[],persist:typeof saveStep=saveStep){
 if(!order.split||order.state!=='paid')return;
 if(!order.customer_id||!order.payment_method_id)throw Error('SAVED_CARD_MISSING');
 for(const step of steps.filter(s=>s.number>1&&!['paid','cancelled'].includes(s.status))){
  let invoice:Stripe.Invoice|undefined;
  if(step.invoice_id)invoice=await stripe.invoices.retrieve(step.invoice_id);
  else{
   // Recover a create whose network response or database write was lost, even after the
   // Stripe idempotency window. Each order has its own isolated Customer.
   for await(const candidate of stripe.invoices.list({customer:order.customer_id,limit:100})){
    if(candidate.metadata?.retreat_order===order.id&&candidate.metadata?.installment===String(step.number)){invoice=candidate;break;}
   }
   if(!invoice)invoice=await stripe.invoices.create({
    customer:order.customer_id,currency:'eur',collection_method:'charge_automatically',
    default_payment_method:order.payment_method_id,auto_advance:false,
    pending_invoice_items_behavior:'exclude',metadata:metadata(order.id,step.number),
    description:`Week-end des Baddies · échéance ${step.number}/3 · ${date(step.due_at)}`,
    payment_settings:{payment_method_types:['card']},
   },{idempotencyKey:`retreat-invoice-${order.id}-${step.number}`});
   await persist(order.id,step.number,{invoice_id:invoice.id});
  }
  if(invoice.livemode)throw Error('LIVE_MODE_FORBIDDEN');
  if(invoice.status!=='draft')continue;
  if(!invoice.lines.data.some(line=>line.metadata?.retreat_order===order.id)){
   await stripe.invoiceItems.create({customer:order.customer_id,invoice:invoice.id,currency:'eur',amount:step.cents,description:`Week-end des Baddies · échéance ${step.number}/3`,metadata:metadata(order.id,step.number)},{idempotencyKey:`retreat-item-${order.id}-${step.number}`});
  }
  invoice=await stripe.invoices.retrieve(invoice.id);
  if(invoice.total!==step.cents||invoice.currency!=='eur')throw Error('INVOICE_AMOUNT_MISMATCH');
  if(invoice.auto_advance&&invoice.automatically_finalizes_at){await persist(order.id,step.number,{status:'scheduled'});continue;}
  const planned=Math.floor(Date.parse(step.due_at)/1000);
  if(planned<=Date.now()/1000){
   // Never silently create a catch-up debit on an unapproved date.
   await persist(order.id,step.number,{status:'needs_review',error:'Échéance dépassée avant programmation : aucun débit lancé.'});
   continue;
  }
  await stripe.invoices.update(invoice.id,{auto_advance:true,automatically_finalizes_at:planned},{idempotencyKey:`retreat-schedule-${order.id}-${step.number}`});
  await persist(order.id,step.number,{status:'scheduled',error:null});
 }
}
async function notify(id:string,subject:string,text:string,key:string){
 // Private Stripe testing cannot email participants. An optional explicit test mailbox
 // receives previews; no email service call is made otherwise.
 const recipient=process.env.RETREAT_TEST_EMAIL_RECIPIENT;
 if(!recipient)return false;
 if(!process.env.RESEND_API_KEY||!process.env.EMAIL_FROM)throw Error('EMAIL_NOT_CONFIGURED');
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({from:process.env.EMAIL_FROM,to:[recipient],subject:'[TEST RETRAITE] '+subject,text:text+'\nRéférence : '+id})});
 if(!response.ok)throw Error('EMAIL_FAILED');
 return true;
}
export async function handleRetreatSession(session:Stripe.Checkout.Session,eventType=''){
 if(!['automatic_v1',RETREAT_CHECKOUT_FLOW].includes(session.metadata?.retreat_flow||''))return;
 if(session.livemode)throw Error('LIVE_MODE_FORBIDDEN');
 const id=session.metadata!.retreat_order;
 const stripe=getRetreatStripe();
 if(eventType==='checkout.session.async_payment_failed')session=await stripe.checkout.sessions.retrieve(session.id);
 const {order}=await orderData(id);
 if(session.metadata?.retreat_flow===RETREAT_CHECKOUT_FLOW&&(order.split||session.amount_total!==order.cents))throw Error('PAYMENT_MISMATCH');
 if(order.session_id!==session.id) {
  if(order.session_id||session.client_reference_id!==id||session.customer!==order.customer_id)throw Error('SESSION_MISMATCH');
  await saveOrder(id,{session_id:session.id});
 }
 if((session.status==='expired'||eventType==='checkout.session.async_payment_failed')&&session.payment_status!=='paid'){
  const {error}=await getStockDatabase().rpc('retreat_payment_finish',{p_id:id,p_session:session.id,p_paid:false,p_amount:0,p_currency:'eur',p_customer:null,p_method:null,p_paid_at:null});if(error)throw error;
  return;
 }
 if(session.payment_status!=='paid')return;
 if(session.mode!=='payment'||!session.payment_intent||typeof session.payment_intent!=='string')throw Error('PAYMENT_MISMATCH');
 const pi=await stripe.paymentIntents.retrieve(session.payment_intent,{expand:['latest_charge']});
 const method=typeof pi.payment_method==='string'?pi.payment_method:pi.payment_method?.id;
 if(pi.status!=='succeeded'||pi.customer!==order.customer_id||pi.amount_received!==session.amount_total||pi.currency!=='eur')throw Error('PAYMENT_MISMATCH');
 const charge=pi.latest_charge;
 const paidAt=typeof charge==='object'&&charge?new Date(charge.created*1000).toISOString():new Date().toISOString();
 const {error}=await getStockDatabase().rpc('retreat_payment_finish',{p_id:id,p_session:session.id,p_paid:true,p_amount:session.amount_total,p_currency:session.currency,p_customer:order.customer_id,p_method:method||null,p_paid_at:paidAt});if(error)throw error;
 const current=await orderData(id);
 if(session.metadata?.retreat_flow==='automatic_v1')await scheduleRetreatInvoices(stripe,current.order,current.steps);
 if(!current.order.email_sent){
  const refreshed=await orderData(id);
  const details=refreshed.steps.map(s=>`${date(s.due_at)} : ${amount(s.cents)}`).join('\n');
  const link=current.order.leader?getSiteOrigin()+'/preview/retraite-lecture-2027/groupe#'+current.order.group_token:'';
  const sent=await notify(id,'Réservation confirmée',`Bonjour ${current.place.guest.first},\nTa réservation de test est confirmée.\n${details}\n${link?'Lien privé pour les copines (une heure après le premier paiement) : '+link:''}\nAucun débit réel. Consulte le suivi pour vérifier le paiement de test. Les éventuelles échéances Klarna sont gérées par Klarna.`,'retreat-confirm-'+id);
  if(sent)await saveOrder(id,{email_sent:true});
 }
}
export async function handleRetreatInvoice(invoiceId:string,eventType=''){
 const stripe=getRetreatStripe();
 const invoice=await stripe.invoices.retrieve(invoiceId);
 if(invoice.metadata?.retreat_flow!=='automatic_v1')return;
 if(invoice.livemode)throw Error('LIVE_MODE_FORBIDDEN');
 const id=invoice.metadata.retreat_order,n=Number(invoice.metadata.installment);
 const {order,steps}=await orderData(id);const step=steps.find(s=>s.number===n);
 if(!step||n<2||invoice.customer!==order.customer_id||(step.invoice_id&&step.invoice_id!==invoice.id))throw Error('INVOICE_MISMATCH');
 // Draft invoice.created can precede insertion of its line item.
 if(invoice.status==='draft'){
  if(invoice.last_finalization_error)await saveStep(id,n,{invoice_id:invoice.id,status:'needs_review',error:'Stripe n’a pas pu finaliser cette échéance. Vérifie la facture.'});
  return;
 }
 if(invoice.total!==step.cents||invoice.currency!=='eur')throw Error('INVOICE_AMOUNT_MISMATCH');
 const status=invoice.status==='paid'?'paid':invoice.status==='void'?'cancelled':invoice.status==='uncollectible'?'failed':(invoice.attempted||eventType==='invoice.payment_action_required'||eventType==='invoice.payment_failed')?'action_required':'scheduled';
 if(status==='action_required'&&invoice.auto_advance)await stripe.invoices.update(invoice.id,{auto_advance:false});
 const changed=await saveStep(id,n,{invoice_id:invoice.id,status,hosted_url:invoice.hosted_invoice_url,error:status==='action_required'?'Paiement non abouti : validation ou autre carte nécessaire.':null});
 if(changed&&['paid','action_required'].includes(status)&&step.email_status!==status){
  const text=status==='paid'?`Ton paiement de ${amount(step.cents)} est reçu.`:`Ton paiement de ${amount(step.cents)} n’a pas abouti. Tu peux le régulariser ici : ${invoice.hosted_invoice_url||'contacte le bookclub'}\nTa place est conservée. Aucun nouvel essai automatique ne sera lancé pour cette échéance.`;
  if(await notify(id,status==='paid'?'Échéance reçue':'Une échéance demande ton attention',text,`retreat-step-${id}-${n}-${status}`))await saveStep(id,n,{email_status:status});
 }
}
export async function reconcileRetreatOrder(id:string){
 const stripe=getRetreatStripe();let {order}=await orderData(id);
 if(!order.session_id&&order.customer_id){
  const sessions=await stripe.checkout.sessions.list({customer:order.customer_id,limit:100});
  const found=sessions.data.find(s=>s.metadata?.retreat_order===id);
  if(found){await saveOrder(id,{session_id:found.id});order={...order,session_id:found.id};}
 }
 if(order.session_id){
  const session=await stripe.checkout.sessions.retrieve(order.session_id);
  await handleRetreatSession(session);
 }else if(Date.parse(order.expires_at)<=Date.now()){
  const {error}=await getStockDatabase().rpc('retreat_payment_finish',{p_id:id,p_session:null,p_paid:false,p_amount:0,p_currency:'eur',p_customer:null,p_method:null,p_paid_at:null});if(error)throw error;
 }
 const result=await orderData(id);
 for(const step of result.steps){if(step.invoice_id)await handleRetreatInvoice(step.invoice_id);}
 return result;
}
export async function retreatPaymentStatus(id:string){
 const {order,steps}=await orderData(id);
 return {id:order.id,state:order.state,cents:order.cents,split:order.split,groupToken:order.state==='paid'&&order.leader?order.group_token:null,steps:steps.map(s=>({number:s.number,cents:s.cents,dueAt:s.due_at,status:s.status,url:s.hosted_url}))};
}

export async function handleRetreatInvoiceDeleted(invoice:Stripe.Invoice){
 if(invoice.livemode||invoice.metadata?.retreat_flow!=='automatic_v1')return;
 const id=invoice.metadata.retreat_order,n=Number(invoice.metadata.installment);
 const {order,steps}=await orderData(id);const step=steps.find(s=>s.number===n);
 if(!step||n<2||invoice.customer!==order.customer_id||(step.invoice_id&&step.invoice_id!==invoice.id))throw Error('INVOICE_MISMATCH');
 await saveStep(id,n,{invoice_id:invoice.id,status:'cancelled',error:'Facture supprimée dans Stripe. Aucun prélèvement programmé pour cette échéance.'});
}

