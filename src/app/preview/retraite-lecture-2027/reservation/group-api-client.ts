export async function groupCall(body:unknown){
 const r=await fetch('/preview/retraite-lecture-2027/group-api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
 const data=await r.json();if(!r.ok)throw Error(data.error||'Réessaie.');return data;
}
