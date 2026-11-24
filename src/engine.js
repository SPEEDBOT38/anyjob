export const statuses=['Draft','Ready','Applied','Interview','Offer','Closed'];
export const defaults={template:'jake',accent:'blue',pageSize:'A4',tone:'Balanced',provider:'Auto',model:'gemini-3.1-flash-lite',locks:[],role:'',location:''};
const stop=new Set('a and the in of for we our are as will with to your you this that is an job work role must required experience using skills team looking hiring have at on be need preferred responsibilities requirements qualifications seeking years year'.split(' '));
function terms(s){return new Set((s.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}+#.-]*/gu)||[]).map(x=>x.replace(/[.-]+$/,'')).filter(x=>x.length>1&&!stop.has(x)))}
function overlap(a,b){return [...terms(a)].filter(t=>b.has(t))}
export function assess(cv,jd){
  const lines=cv.split(/\n/).map(s=>s.trim()).filter(Boolean);
  const requirements=jd.split(/\n|(?<=[.!?])\s+/).map(s=>s.trim().replace(/^[-•*]\s+/,'')).filter(s=>!/^#{2,3}\s/.test(s)&&terms(s).size&&s.length>=8);
  const rows=requirements.map(requirement=>{
    const required=terms(requirement);
    const best=lines.map(line=>({line,words:overlap(line,required)})).sort((a,b)=>b.words.length-a.words.length)[0];
    return {requirement,evidence:best?.words.length?best.line:'',words:best?.words||[],total:required.size};
  });
  if(!rows.length)throw Error('Add the responsibilities and requirements from the posting.');
  return {rows,score:Math.round(100*rows.reduce((n,r)=>n+r.words.length/r.total,0)/rows.length)};
}
export async function tailor(record,prefs,key,provider,backend){
  const lines=record.cv.split('\n');
  const local=lines.map(line=>overlap(line,terms(record.jd)).length);
  let order=null;
  if(provider==='Kilo'){
    const response=await fetch(backend+'/api/providers/kilo/rank',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(55000),body:JSON.stringify({cv:record.cv,jd:record.jd,tone:prefs.tone})});
    if(!response.ok)throw Error('Kilo preparation failed. Check the server key and available credits or select Local in Settings.');
    order=(await response.json()).order;
  }
  if(provider==='Gemini'){
    if(!key)throw Error('Add your Gemini key or choose a different provider in Settings.');
    const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(prefs.model)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},signal:AbortSignal.timeout(45000),body:JSON.stringify({contents:[{parts:[{text:JSON.stringify({task:'Rank resume line numbers by relevance to the job. Return JSON {order:[line numbers]} using zero-based indices.',tone:prefs.tone,job:record.jd,lines})}]}],generationConfig:{responseMimeType:'application/json'}})});
    if(!response.ok)throw Error('Gemini could not process this request. Check the model, key and quota in Settings, or clear the key for local preparation.');
    try{order=JSON.parse((await response.json()).candidates[0].content.parts[0].text).order;if(!Array.isArray(order))throw Error()}catch{throw Error('Gemini returned an unreadable ranking. Retry or clear the key to use local preparation.')}
  }
  const rank=i=>order?(order.includes(i)?-order.indexOf(i):-lines.length):local[i];
  let section='Header';
  for(let i=0;i<lines.length;i++){
    const heading=lines[i].trim().match(/^(?:professional |technical |work |core )?(summary|skills|experience|education)[:\s]*$/i);
    if(heading)section=heading[1][0].toUpperCase()+heading[1].slice(1).toLowerCase();
    if(prefs.locks.includes(section)||!/^\s*[-•*]\s/.test(lines[i]))continue;
    let end=i+1;while(end<lines.length&&/^\s*[-•*]\s/.test(lines[end]))end++;
    const sorted=lines.slice(i,end).map((line,n)=>({line,rank:rank(i+n)})).sort((a,b)=>b.rank-a.rank);
    sorted.forEach((x,n)=>lines[i+n]=x.line);i=end-1;
  }
  return lines.join('\n');
}

