import {accent,isHeading,isLatexCV,latexDocument} from './latexLayout';
const styles = {
  Classic: {fontSize:11, lineHeight:1.22, color:'#0B1A38'},
  Modern: {fontSize:12, lineHeight:1.18, color:'#1E3A8A'},
  Compact: {fontSize:9, lineHeight:1.05, color:'#0B1A38'},
  'ATS plain': {fontSize:11, lineHeight:1.1, color:'#000000'}
};
async function pdfReader(bytes) {
  const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', import.meta.url).href;
  const loadingTask = pdfjs.getDocument({data:bytes});
  const document = await loadingTask.promise;
  try {
    const pages=[];
    for(let i=1;i<=document.numPages;i++){
      const page=await document.getPage(i);
      const text=await page.getTextContent();
      pages.push(text.items.map(x=>(x.str||'')+(x.hasEOL?'\n':' ')).join(''));
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
    text=(await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value;
  } else if(ext==='pdf')text=(await pdfReader(new Uint8Array(await file.arrayBuffer()))).join('\n');
  else throw Error('Choose a PDF, Word (.docx) or text file.');
  if(!text.trim())throw Error('No readable text found. Paste the text or upload a searchable copy.');
  return text.trim();
}
export async function validatedPDF(text,template,pageSize){
  const [{default:maker},{default:fonts}]=await Promise.all([import('pdfmake/build/pdfmake'),import('pdfmake/build/vfs_fonts')]);
  maker.addVirtualFileSystem(fonts);
  const lines=text.split('\n');
  const blocks=lines.map((line,i)=>{
    if(isLatexCV(template)&&isHeading(line)){
      if(template==='Modern')return {layout:'noBorders',table:{widths:['*'],body:[[{text:line,bold:true,color:'#222222',fillColor:accent(template)}]]},margin:[0,5,0,4]};
      return {text:line,bold:true,color:accent(template),alignment:'center',margin:[0,5,0,4]};
    }
    return {text:line||' ',...(i===0&&template!=='ATS plain'?{fontSize:20,bold:true,alignment:isLatexCV(template)?'center':'left',margin:[0,0,0,8]}:{})};
  });
  const definition={pageSize:pageSize==='Letter'?'LETTER':'A4',pageMargins:template==='Compact'?32:48,defaultStyle:styles[template],content:blocks};
  const bytes=await new Promise(resolve=>maker.createPdf(definition).getBuffer(resolve));
  const pages=await pdfReader(Uint8Array.from(bytes));
  const normalize=s=>s.normalize('NFKC').replace(/\s/g,'');
  if(pages.some(p=>!p.trim())||normalize(pages.join(''))!==normalize(text))throw Error('PDF text verification failed. Review unusual characters and try again.');
  return new Blob([bytes],{type:'application/pdf'});
}
export async function exportFile(record,format){
  if(!record.approved || record.approved!==record.draft)throw Error('Approve this version before downloading.');
  const content=record.approved;
  if(format==='pdf')return validatedPDF(content,record.template,record.pageSize);
  if(format==='docx'){
    const {Document,Paragraph,TextRun,Packer}=await import('docx');
    const compact=record.template==='Compact';
    const size=record.pageSize==='Letter'?{width:12240,height:15840}:{width:11906,height:16838};
    const font=record.template==='Classic'?'Georgia':'Arial';
    return Packer.toBlob(new Document({sections:[{properties:{page:{size}},children:content.split('\n').map((text,i)=>new Paragraph({
      alignment:isLatexCV(record.template)&&(i===0||isHeading(text)&&record.template==='Classic')?'center':'left',
      ...(isHeading(text)&&record.template==='Modern'?{shading:{fill:'FF9600'}}:{}),
      spacing:{after:compact?40:100},children:[new TextRun({text,font,size:i===0?32:compact?18:22,bold:i===0||isHeading(text),color:isHeading(text)&&record.template==='Classic'?'0077C8':'0B1A38'})]
    }))}]}));
  }
  if(format==='tex'){
    if(isLatexCV(record.template))return new Blob([await latexDocument(record)],{type:'text/plain;charset=utf-8'});
    const escapes={'\\':'\\textbackslash{}','~':'\\textasciitilde{}','^':'\\textasciicircum{}'};
    const safe=content.replace(/[\\~^%$#&_{}]/g,c=>escapes[c]||'\\'+c);
    return new Blob(['\\documentclass['+(record.pageSize==='Letter'?'letterpaper':'a4paper')+']{article}\n\\usepackage[T1]{fontenc}\n\\begin{document}\n'+safe.replace(/\n/g,'\\par\n')+'\n\\end{document}'],{type:'text/plain'});
  }
  return new Blob([content],{type:'text/plain;charset=utf-8'});
}

