import type Stripe from 'stripe';
import {retreatInstallments} from './retreat-installments';
export const RETREAT_CHECKOUT_VERSION='card-klarna-v2';
export const RETREAT_CHECKOUT_FLOW='full_payment_v2';
export function retreatCheckoutConsent(cents:number){
 return `Je confirme le montant total du séjour : ${(cents/100).toFixed(2)} €. Je choisirai mon moyen de paiement sur Stripe. Si je choisis Klarna, ses options et conditions seront présentées avant validation, sous réserve d’acceptation. Le bookclub ne programme aucun prélèvement supplémentaire.`;
}
export function retreatCheckoutParams(order:{id:string;cents:number;split:boolean;customer_id:string|null;expires_at:string},origin:string):NonNullable<Parameters<Stripe['checkout']['sessions']['create']>[0]>{
 if(order.split)throw Error('PLAN_CHANGED');
 retreatInstallments(order.cents,false); // Reject unknown prices even when called outside the API.
 const metadata={retreat_flow:RETREAT_CHECKOUT_FLOW,retreat_order:order.id};
 return {
  mode:'payment',customer:order.customer_id!,payment_method_types:['card','klarna'],
  expires_at:Math.floor(Date.parse(order.expires_at)/1000),
  metadata,client_reference_id:order.id,payment_intent_data:{metadata},
  line_items:[{quantity:1,price_data:{currency:'eur',unit_amount:order.cents,product_data:{name:'Le Week-end des Baddies — Mountain Edition',description:'Montant total du séjour'}}}],
  custom_text:{submit:{message:retreatCheckoutConsent(order.cents)}},
  success_url:origin+'/preview/retraite-lecture-2027/paiement?order='+order.id,
  cancel_url:origin+'/preview/retraite-lecture-2027/paiement?order='+order.id+'&cancelled=1',
 };
}
