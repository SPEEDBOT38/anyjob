export const isLatexCV=t=>t==='Classic'||t==='Modern';
export const isHeading=s=>/^(?:professional |work |technical |core )?(summary|skills|experience|education|projects|certifications|publications|highlights|languages|competencies)[:\s]*$/i.test(s.trim());
export const accent=t=>t==='Modern'?'#FF9600':'#0077C8';
function escapeTex(s){
  const special={'\\':'\\textbackslash{}','~':'\\textasciitilde{}','^':'\\textasciicircum{}','•':'\\textbullet{}'};
  return s.replace(/[\\~^%$#&_{}•]/g,c=>special[c]||'\\'+c);
}
export async function latexDocument(record){
  const file=record.template.toLowerCase();
  const response=await fetch('./assets/latexcv/'+file+'.tex');
  if(!response.ok)throw Error('Could not load the LaTeXCV layout.');
  const raw=await response.text();
  const split=raw.indexOf('\\newcommand{\\lorem}');
  if(split<0)throw Error('The LaTeXCV template is incomplete.');
  const paper=record.pageSize==='Letter'?'letterpaper':'a4paper';
  const preamble=raw.slice(0,split).replace('[10pt,A4]','[10pt,'+paper+']').replace('[a4paper]{geometry}','['+paper+']{geometry}').replace(/^\\chead\{.*$/m,'\\chead{}').replace('bottom=-.6cm','bottom=1.5cm');
  const lines=record.approved.split('\n').map((s,i)=>{
    const safe=escapeTex(s);
    if(i===0)return '{\\centering\\Huge\\bfseries '+safe+'\\par}\\medskip';
    if(isHeading(s))return '\\cvsection{'+safe+'}';
    return safe?safe+'\\par':'\\smallskip';
  });
  return preamble+'\\begin{document}\n\\pagestyle{empty}\n'+lines.join('\n')+'\n\\end{document}\n';
}

