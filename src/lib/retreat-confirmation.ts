import template from './retreat-confirmation-template.json';
export const retreatConfirmationSubject='Pack your books, Baddies !';
export function retreatConfirmationHtml(details?:string){
 if(!details)return template;
 const escaped=details.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
 const summary=`<table role="presentation" align="center" width="100%" style="max-width:600px;background:#faf8f5;color:#7f3449"><tr><td style="padding:24px;font:14px/1.6 Arial,sans-serif;white-space:pre-wrap">${escaped}</td></tr></table>`;
 return template.replace('</body>',summary+'</body>');
}
