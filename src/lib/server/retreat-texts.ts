import 'server-only';
import {getStockDatabase} from './clients';
import {retreatTextDefaults, validRetreatTexts} from '../retreat-texts';
export async function readRetreatTexts(){
 try{
  const {data,error}=await getStockDatabase().from('retreat_page_content').select('texts,revision').eq('id','mountain-2027').maybeSingle();
  if(error||!data) return {values:retreatTextDefaults,revision:0,ready:false};
  return {values:{...retreatTextDefaults,...(validRetreatTexts(data.texts)?data.texts:{})},revision:data.revision as number,ready:true};
 }catch{return {values:retreatTextDefaults,revision:0,ready:false};}
}
