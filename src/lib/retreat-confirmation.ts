import template from './retreat-confirmation-template.json';
export const retreatConfirmationSubject='Ta réservation est confirmée — Week-end des Baddies';
export const retreatConfirmationTestDetails='Bonjour Anaïs,\n\nEXEMPLE DE CONFIRMATION — aucune réservation créée.\nSéjour : du 12 au 14 mars 2027 à Bolquère.\nChambre : chambre 2 (exemple).\nMontant simulé : 199 €. Aucun débit réel.\n\nLes informations réelles de chaque participante remplaceront cet exemple.';
export function retreatConfirmationHtml(details:string=retreatConfirmationTestDetails){
 const escaped=details.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
 const summary=`<table role="presentation" align="center" width="100%" style="max-width:600px;background:#faf8f5;color:#7f3449"><tr><td style="padding:24px;font:14px/1.6 Arial,sans-serif;white-space:pre-wrap">${escaped}</td></tr></table>`;
 return template.replace(/(<body\b[^>]*>)/i,(_match,body)=>body+summary);
}
