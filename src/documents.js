import {pdfDefinition,latexDocument,model,theme,wordBag} from './resume';
import serifRegular from './fonts/LiberationSerif-Regular.ttf';
import serifBold from './fonts/LiberationSerif-Bold.ttf';
import serifItalic from './fonts/LiberationSerif-Italic.ttf';
import serifBoldItalic from './fonts/LiberationSerif-BoldItalic.ttf';
// Rebuild lines from text positions: items on the same baseline form one line, big vertical gaps become blank lines.
function pageLines(items){
  const parts=items.filter(x=>x.str!==undefined&&x.str.trim()!=='').map(x=>({s:x.str,x:x.transform[4],y:x.transform[5],h:Math.abs(x.height)||Math.abs(x.transform[3])||10,w:x.width||0}));
  parts.sort((a,b)=>b.y-a.y||a.x-b.x);
  const rows=[];
  for(const p of parts){
    const row=rows[rows.length-1];
    if(row&&Math.abs(row.y-p.y)<=Math.max(2,row.h*0.45))row.items.push(p);
    else rows.push({y:p.y,h:p.h,items:[p]});
  }
  const out=[];let prev=null;
  for(const row of rows){
    row.items.sort((a,b)=>a.x-b.x);
    let line='',end=null;
    for(const it of row.items){
      if(end!==null){const gap=it.x-end;line+=gap>row.h*0.15||!/\S$/.test(line)?(gap>row.h*3?'   ':' '):'';}
      line+=it.s;end=it.x+it.w;
    }
    if(prev&&prev.y-row.y>Math.max(prev.h,row.h)*1.9)out.push('');
    out.push(line.replace(/[ \t]+$/,'').replace(/^[●•▪◦·]\s*/,'• '));
    prev=row;
  }
  return out.join('\n');
}
async function pdfReader(bytes) {
  await import('pdfjs-dist/build/pdf.worker.mjs'); // bundled worker: runs on the main thread, no separate module file needed
  const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
  const loadingTask = pdfjs.getDocument({data:bytes});
  const document = await loadingTask.promise;
  try {
    const pages=[];
    for(let i=1;i<=document.numPages;i++){
      const page=await document.getPage(i);
      const content=await page.getTextContent();
      pages.push(pageLines(content.items));
    }
    return pages;
  } finally { await loadingTask.destroy(); }
}
export async function readCV(file){
  if(file.size>10*1024*1024)throw Error('Choose a file smaller than 10 MB.');
  const ext=file.name.split('.').pop().toLowerCase();
  let text;
  if(ext==='txt')text=await file.text();
  else if(ext==='docx'){
    const {default:mammoth}=await import('mammoth/mammoth.browser');
    text=(await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value.replace(/\n{3,}/g,'\n\n');
  } else if(ext==='pdf')text=(await pdfReader(new Uint8Array(await file.arrayBuffer()))).join('\n');
  else throw Error('Choose a PDF, Word (.docx) or text file.');
  if(!text.trim())throw Error('No readable text found. Paste the text or upload a searchable copy.');
  return text.trim();
}
export async function validatedPDF(text,template,pageSize){
  const [{default:maker},{default:fonts}]=await Promise.all([import('pdfmake/build/pdfmake'),import('pdfmake/build/vfs_fonts')]);
  maker.addVirtualFileSystem({...fonts,'Serif-Regular.ttf':serifRegular,'Serif-Bold.ttf':serifBold,'Serif-Italic.ttf':serifItalic,'Serif-BoldItalic.ttf':serifBoldItalic});
  maker.addFonts({Roboto:{normal:'Roboto-Regular.ttf',bold:'Roboto-Medium.ttf',italics:'Roboto-Italic.ttf',bolditalics:'Roboto-MediumItalic.ttf'},Serif:{normal:'Serif-Regular.ttf',bold:'Serif-Bold.ttf',italics:'Serif-Italic.ttf',bolditalics:'Serif-BoldItalic.ttf'}});
  const bytes=await new Promise(resolve=>maker.createPdf(pdfDefinition(text,template,pageSize)).getBuffer(resolve));
  const pages=await pdfReader(Uint8Array.from(bytes));
  if(pages.some(p=>!p.trim())||wordBag(pages.join(' '))!==wordBag(text))throw Error('PDF text verification failed. Review unusual characters and try again.');
  return new Blob([bytes],{type:'application/pdf'});
}
async function wordDocument(text,template,pageSize){
  const {Document,Paragraph,TextRun,Packer,TabStopType,BorderStyle,AlignmentType}=await import('docx');
  const m=model(text),t=theme(template);
  const letter=pageSize==='Letter';
  const size=letter?{width:12240,height:15840}:{width:11906,height:16838};
  const margin=Math.round(t.margin*20),textWidth=size.width-margin*2;
  const font=t.font==='Serif'?'Times New Roman':'Arial',half=Math.round(t.size*2),color=t.color.slice(1);
  const lead=t.center?AlignmentType.CENTER:AlignmentType.LEFT;
  const run=(text,o={})=>new TextRun({text,font,size:half,...o});
  const kids=[];
  if(m.name)kids.push(new Paragraph({alignment:lead,spacing:{after:40},children:[run(m.name,{bold:true,size:Math.round(t.name*2),color})]}));
  if(m.headline)kids.push(new Paragraph({alignment:lead,spacing:{after:40},children:[run(m.headline,{italics:true})]}));
  if(m.contacts.length)kids.push(new Paragraph({alignment:lead,spacing:{after:80},children:[run(m.contacts.join('  |  '),{size:half-1})]}));
  m.extras.forEach(x=>kids.push(new Paragraph({spacing:{after:60},children:[run(x)]})));
  for(const s of m.sections){
    kids.push(new Paragraph({keepNext:true,spacing:{before:200,after:80},border:t.rule?{bottom:{style:BorderStyle.SINGLE,size:6,space:1,color}}:undefined,children:[run(s.title.toUpperCase(),{bold:true,size:Math.round(t.head*2),color,characterSpacing:14})]}));
    const it=s.items;
    for(let i=0;i<it.length;i++){
      const x=it[i];
      if(x.type==='entry')kids.push(new Paragraph({keepNext:true,spacing:{before:60},tabStops:[{type:TabStopType.RIGHT,position:textWidth}],children:[run(x.title,{bold:true}),run('\t'+x.date)]}));
      else if(x.type==='sub')kids.push(new Paragraph({keepNext:true,children:[run(x.text,{italics:true})]}));
      else if(x.type==='bullet')kids.push(new Paragraph({bullet:{level:0},spacing:{after:20},children:[run(x.text)]}));
      else if(x.type==='chips')kids.push(new Paragraph({spacing:{after:20},children:[...(x.label?[run(x.label+': ',{bold:true})]:[]),run(x.chips.join(', '))]}));
      else kids.push(new Paragraph({spacing:{after:40},children:[run(x.text)]}));
    }
  }
  return Packer.toBlob(new Document({sections:[{properties:{page:{size,margin:{top:margin-120,bottom:margin-120,left:margin,right:margin}}},children:kids}]}));
}
// Built-in layouts (no LaTeX service needed): the closest match for each LaTeX template.
const BUILTIN={jake:'Classic',mcdowell:'Classic',moderncv:'Modern',awesome:'Modern',deedy:'Modern',altacv:'Modern',Classic:'Classic',Modern:'Modern',Compact:'Compact','ATS plain':'ATS plain'};
export const builtinLayout=t=>BUILTIN[t]||'Classic';
export async function builtinPDF(text,template,pageSize){return validatedPDF(text,builtinLayout(template),pageSize)}
export async function wordFile(text,template,pageSize){return wordDocument(text,builtinLayout(template),pageSize)}
export async function letterFile(text,name){
  const {Document,Paragraph,TextRun,Packer}=await import('docx');
  return Packer.toBlob(new Document({sections:[{properties:{page:{margin:{top:1200,bottom:1200,left:1300,right:1300}}},children:String(text).split(/\n/).map(line=>new Paragraph({spacing:{after:line.trim()?120:60},children:[new TextRun({text:line,font:'Calibri',size:23})]}))}]}));
}
