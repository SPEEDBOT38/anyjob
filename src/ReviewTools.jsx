import React,{useState} from 'react';
const lockedHead=/^(?:professional |technical |work |core )?(summary|skills|experience|education)[:\s]*$/i;
function editableLines(text,locks){
 let section='Header';
 return text.split('\n').map((line,i)=>{
   const heading=line.trim().match(lockedHead);
   if(heading)section=heading[1][0].toUpperCase()+heading[1].slice(1).toLowerCase();
   return {i,line,editable:/^\s*[-•*]\s/.test(line)&&!locks.includes(section)};
 });
}
export function ReviewTools({record,locks,save}){
 const [removed,setRemoved]=useState([]),[evidence,pick]=useState('');
 const lines=editableLines(record.draft,locks);
 const options=record.cv.split('\n').map(s=>s.trim()).filter(s=>s.length>=12);
 return <section className="panel"><h2>Application materials</h2>
 <details><summary>Edit included bullets</summary><p>Select which original bullets to include. Locked sections stay intact.</p>
 {lines.filter(x=>x.editable).map(x=><label className="check" key={x.i}><input type="checkbox" checked={!removed.includes(x.i)} onChange={e=>setRemoved(e.target.checked?removed.filter(i=>i!==x.i):[...removed,x.i])}/>{x.line}</label>)}
 {lines.some(x=>x.editable)?<button onClick={()=>{save({draft:lines.filter(x=>!x.editable||!removed.includes(x.i)).map(x=>x.line).join('\n'),approved:null});setRemoved([])}}>Save edits</button>:<p>No unlocked bullet lists in this draft.</p>}</details>
 <details><summary>Prepare cover letter</summary><label>Career evidence<select value={evidence} onChange={e=>pick(e.target.value)}><option value="">Choose a line from your CV</option>{options.map((x,i)=><option key={i} value={x}>{x}</option>)}</select></label><button disabled={!evidence} onClick={()=>save({letter:'Dear hiring team,\n\nI am applying for '+record.title+'. My relevant experience includes the following:\n\n'+evidence.replace(/^[-•*]\s*/,'')+'\n\nI would welcome the opportunity to discuss this role.\n\n'+record.cv.split('\n')[0]})}>Prepare letter</button>{record.letter&&<pre>{record.letter}</pre>}</details></section>
}

