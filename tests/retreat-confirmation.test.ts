import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retreatConfirmationHtml} from '../src/lib/retreat-confirmation';
test('email keeps the supplied design and Instagram link without executable export scripts',()=>{
 const html=retreatConfirmationHtml();
 assert(html.includes('Pack your books, Baddies !'));
 assert(html.includes('https://ig.me/j/s8Dgh1znRffutBwW/'));
 assert(!/<script|<iframe|src="images\//i.test(html));
 assert(html.includes('canva-cdn.email/'));
});
test('booking details remain visible and cannot inject HTML into confirmation',()=>{
 const html=retreatConfirmationHtml('Bonjour <img src=x onerror=alert(1)> & copines');
 assert(html.includes('Bonjour &lt;img src=x onerror=alert(1)&gt; &amp; copines'));
 assert(!html.includes('<img src=x'));
 assert(html.includes('Ta place pour le Week-end des Baddies est confirmée'));
});
