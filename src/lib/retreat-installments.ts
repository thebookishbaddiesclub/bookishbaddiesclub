export type Installment = {number:number;cents:number;dueAt:string};
export const RETREAT_CONSENT_VERSION='automatic-card-v1';
export function retreatInstallments(cents:number,split:boolean,now=new Date()):Installment[]{
 if(![19900,21500,31500].includes(cents))throw Error('INVALID_PRICE');
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const part=(key:string)=>Number(parts.find(p=>p.type===key)!.value);
 const today=Date.UTC(part('year'),part('month')-1,part('day'));
 const last=Date.UTC(2027,1,1),day=86400000,days=Math.round((last-today)/day);
 if(!split)return [{number:1,cents,dueAt:now.toISOString()}];
 if(days<2)throw Error('SPLIT_CLOSED');
 // All future dates are in winter: 09:00 UTC = 10:00 Paris.
 const middle=today+Math.floor(days/2)*day+9*3600000;
 const first=Math.floor(cents/3);
 return [{number:1,cents:first,dueAt:now.toISOString()},{number:2,cents:first,dueAt:new Date(middle).toISOString()},{number:3,cents:cents-first*2,dueAt:new Date(last+9*3600000).toISOString()}];
}
export function installmentConsent(steps:Installment[]){
 const money=(n:number)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n/100);
 const date=(d:string)=>new Date(d).toLocaleDateString('fr-FR',{timeZone:'Europe/Paris'});
 return steps.length===1
 ? `J’accepte le paiement de ${money(steps[0].cents)} aujourd’hui.`
 : `J’autorise Stripe à enregistrer ma carte et à débiter ${money(steps[0].cents)} aujourd’hui, puis automatiquement ${money(steps[1].cents)} le ${date(steps[1].dueAt)} et ${money(steps[2].cents)} le ${date(steps[2].dueAt)}. Aucun abonnement ni renouvellement après ces trois paiements.`;
}
