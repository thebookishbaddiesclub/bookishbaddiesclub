import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retreatCheckoutParams,retreatCheckoutConsent,RETREAT_CHECKOUT_FLOW} from '../src/lib/retreat-checkout';
import {currentRetreatPaymentTexts,retreatTextDefaults} from '../src/lib/retreat-texts';
import {scheduleRetreatInvoices} from '../src/lib/server/retreat-stripe';

test('card and Klarna charge the complete price without saving a card or creating installments',async()=>{
 for(const cents of [19900,21500,31500]){
  const order={id:'order',cents,split:false,customer_id:'cus_test',expires_at:'2026-12-01T10:00:00Z'};
  const params=retreatCheckoutParams(order,'https://example.com');
  assert.deepEqual(params.payment_method_types,['card','klarna']);
  assert.equal(params.mode,'payment');
  assert.equal(params.line_items![0].price_data!.unit_amount,cents);
  assert.equal(params.line_items![0].quantity,1);
  assert.equal(params.payment_intent_data?.setup_future_usage,undefined);
  assert.equal(params.metadata?.retreat_flow,RETREAT_CHECKOUT_FLOW);
  assert.equal((params.custom_text?.submit || undefined)?.message,retreatCheckoutConsent(cents));
  // An accidentally invoked legacy scheduler must still not charge these orders.
  await scheduleRetreatInvoices({} as any,{...order,state:'paid'} as any,[]);
 }
 assert.throws(()=>retreatCheckoutParams({id:'x',cents:19900,split:true,customer_id:'cus_test',expires_at:''},''),/PLAN_CHANGED/);
 assert.throws(()=>retreatCheckoutParams({id:'x',cents:1,split:false,customer_id:'cus_test',expires_at:''},''),/INVALID_PRICE/);
});
test('saved old payment claims are replaced, unrelated and current custom text is preserved',()=>{
 const original={'text-020':'Trois fois, dernier paiement le 1er février','text-035':'Adresse privée. Paiement en 3 fois prévu.','text-001':'Mon atelier','text-088':'3 fois avec Klarna selon éligibilité.'};
 const updated=currentRetreatPaymentTexts(original);
 assert.equal(updated['text-020'],retreatTextDefaults['text-020']);
 assert.equal(updated['text-035'],retreatTextDefaults['text-035']);
 assert.equal(updated['text-001'],original['text-001']);
 assert.equal(updated['text-088'],original['text-088']);
 assert.notEqual(original['text-020'],updated['text-020']);
});
