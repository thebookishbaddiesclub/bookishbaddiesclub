import type Stripe from 'stripe';
import {getRetreatStripe,handleRetreatInvoice,handleRetreatInvoiceDeleted,handleRetreatSession} from '@/lib/server/retreat-stripe';
export async function POST(request:Request){
 const secret=process.env.RETREAT_STRIPE_TEST_WEBHOOK_SECRET,signature=request.headers.get('stripe-signature');
 if(!secret)return Response.json({error:'Not configured'},{status:503});
 if(!signature)return Response.json({error:'Missing signature'},{status:400});
 let event:Stripe.Event;
 try{event=getRetreatStripe().webhooks.constructEvent(await request.text(),signature,secret);}catch{return Response.json({error:'Invalid signature'},{status:400});}
 if(event.livemode)return Response.json({error:'Test mode only'},{status:400});
 try{
  if(['checkout.session.completed','checkout.session.expired','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed'].includes(event.type))await handleRetreatSession(event.data.object as Stripe.Checkout.Session,event.type);
  else if(event.type==='invoice.deleted')await handleRetreatInvoiceDeleted(event.data.object as Stripe.Invoice);
  else if(event.type.startsWith('invoice.')){
   const invoice=event.data.object as Stripe.Invoice;
   if(invoice.metadata?.retreat_flow==='automatic_v1')await handleRetreatInvoice(invoice.id,event.type);
  }
  return Response.json({received:true});
 }catch{return Response.json({error:'Retry required'},{status:500});}
}

