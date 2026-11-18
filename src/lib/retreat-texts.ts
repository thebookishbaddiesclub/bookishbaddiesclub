import fields from './retreat-texts.json';
export const retreatTextFields = fields;
export const retreatTextDefaults:Record<string,string> = Object.fromEntries(fields.map(f=>[f.id,f.value]));
export function validRetreatTexts(value:unknown):value is Record<string,string>{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const entries=Object.entries(value);
 return entries.length<=fields.length&&entries.every(([key,text])=>Object.prototype.hasOwnProperty.call(retreatTextDefaults,key)&&typeof text==='string'&&text.length<=6000)&&JSON.stringify(value).length<=150000;
}
