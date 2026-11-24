import fields from './retreat-texts.json';
export const retreatTextFields = fields;
export const retreatTextDefaults:Record<string,string> = Object.fromEntries(fields.map(f=>[f.id,f.value]));
export function validRetreatTexts(value:unknown):value is Record<string,string>{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const entries=Object.entries(value);
 return entries.length<=fields.length&&entries.every(([key,text])=>Object.prototype.hasOwnProperty.call(retreatTextDefaults,key)&&typeof text==='string'&&text.length<=6000)&&JSON.stringify(value).length<=150000;
}


export function currentRetreatPaymentTexts(values:Record<string,string>){
 const result={...values};
 for(const id of ['text-014','text-020','text-035','text-088']){
  if(/trois fois|3 fois|1er février|02\/02|30 janvier|prélèvements automatiques/i.test(result[id]||'')&&!/klarna/i.test(result[id]||''))result[id]=retreatTextDefaults[id];
 }
 return result;
}
