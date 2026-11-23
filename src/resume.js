// One structured model of the approved CV, rendered as PDF, Word, LaTeX and an on-screen paper.
// Layout follows Jake Gutierrez's popular single-column "Resume" LaTeX template (MIT licence).
import {parseCV} from './structure';

export const THEMES = {
  Classic: {font: 'Serif', size: 10.5, name: 24, center: true, rule: true, color: '#000000', margin: 44, head: 11.5},
  Modern: {font: 'Roboto', size: 10, name: 24, center: false, rule: true, color: '#1d4ed8', margin: 44, head: 11},
  Compact: {font: 'Serif', size: 9.3, name: 20, center: true, rule: true, color: '#000000', margin: 34, head: 10.5},
  'ATS plain': {font: 'Roboto', size: 10.5, name: 18, center: false, rule: false, color: '#000000', margin: 48, head: 11}
};

export const model = text => parseCV(text);
export const theme = t => THEMES[t] || THEMES.Classic;

// Normalised word list: used to prove nothing was lost when the layout was applied.
export const wordBag = s => (String(s).normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).sort().join(' ');

const joinContacts = m => m.contacts.join('  |  ');

export function pdfDefinition(text, template, pageSize) {
  const m = model(text), t = theme(template);
  const width = (pageSize === 'Letter' ? 612 : 595.28) - t.margin * 2;
  const content = [];
  const lead = t.center ? 'center' : 'left';
  if (m.name) content.push({text: m.name, fontSize: t.name, bold: true, alignment: lead, color: t.color, margin: [0, 0, 0, 2]});
  if (m.headline) content.push({text: m.headline, fontSize: t.size + 1, italics: true, alignment: lead, margin: [0, 0, 0, 2]});
  if (m.contacts.length) content.push({text: joinContacts(m), fontSize: t.size - 0.5, alignment: lead, margin: [0, 0, 0, 4]});
  m.extras.forEach(x => content.push({text: x, margin: [0, 0, 0, 3]}));
  for (const s of m.sections) {
    content.push({text: s.title.toUpperCase(), bold: true, fontSize: t.head, color: t.color, characterSpacing: 0.7, margin: [0, 9, 0, t.rule ? 1 : 3], keepWithNext: true});
    if (t.rule) content.push({canvas: [{type: 'line', x1: 0, y1: 1, x2: width, y2: 1, lineWidth: 0.7, lineColor: t.color}], margin: [0, 0, 0, 4], keepWithNext: true});
    const it = s.items;
    for (let i = 0; i < it.length; i++) {
      const x = it[i];
      if (x.type === 'bullet') {
        const list = [];
        while (i < it.length && it[i].type === 'bullet') list.push(it[i++].text);
        i--;
        content.push({ul: list.map(b => ({text: b, margin: [0, 0.5, 0, 0.5]})), margin: [10, 1, 0, 3], markerColor: t.color});
      } else if (x.type === 'entry') {
        content.push({columns: [{text: x.title, bold: true, width: '*'}, {text: x.date, alignment: 'right', width: 'auto'}], margin: [0, 3, 0, 0], keepWithNext: true});
      } else if (x.type === 'sub') {
        content.push({text: x.text, italics: true, fontSize: t.size - 0.3, margin: [0, 0, 0, 1], keepWithNext: true});
      } else if (x.type === 'chips') {
        content.push({text: [x.label ? {text: x.label + ': ', bold: true} : '', x.chips.join(', ')], margin: [0, 1, 0, 1]});
      } else content.push({text: x.text, margin: [0, 1, 0, 2]});
    }
  }
  return {
    pageSize: pageSize === 'Letter' ? 'LETTER' : 'A4',
    pageMargins: [t.margin, t.margin - 6, t.margin, t.margin - 6],
    defaultStyle: {font: t.font, fontSize: t.size, lineHeight: 1.12, color: '#111111'},
    content
  };
}

// ---------- LaTeX (Jake's Resume layout) ----------
const SPECIAL = {'\\': '\\textbackslash{}', '~': '\\textasciitilde{}', '^': '\\textasciicircum{}', '&': '\\&', '%': '\\%', '$': '\\$', '#': '\\#', '_': '\\_', '{': '\\{', '}': '\\}'};
export function tex(s) {
  return String(s || '')
    .replace(/[–—]/g, m => (m === '–' ? '--' : '---'))
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...')
    .replace(/[•●▪·]/g, '-').replace(/ /g, ' ')
    .replace(/[^\x00-ɏ]/g, '')
    .replace(/[\\~^&%$#_{}]/g, c => SPECIAL[c]);
}
const link = c => {
  if (/@/.test(c)) return '\\href{mailto:' + c.replace(/[{}\\%#]/g, '') + '}{\\underline{' + tex(c) + '}}';
  if (/^(?:https?:\/\/|www\.|linkedin\.com|github\.com)/i.test(c)) {
    const u = /^https?:/i.test(c) ? c : 'https://' + c;
    return '\\href{' + u.replace(/[{}\\%#]/g, '') + '}{\\underline{' + tex(c) + '}}';
  }
  return tex(c);
};

export function latexDocument(text, template, pageSize) {
  const m = model(text), compact = template === 'Compact';
  const paper = pageSize === 'Letter' ? 'letterpaper' : 'a4paper';
  const o = [];
  o.push('\\documentclass[' + paper + ',' + (compact ? '10' : '11') + 'pt]{article}',
    '\\usepackage{latexsym}', '\\usepackage[empty]{fullpage}', '\\usepackage{titlesec}', '\\usepackage[usenames,dvipsnames]{color}',
    '\\usepackage{enumitem}', '\\usepackage[hidelinks]{hyperref}', '\\usepackage{fancyhdr}', '\\usepackage[english]{babel}', '\\usepackage{tabularx}',
    '\\usepackage[T1]{fontenc}', '\\usepackage[utf8]{inputenc}',
    '\\pagestyle{fancy}', '\\fancyhf{}', '\\fancyfoot{}', '\\renewcommand{\\headrulewidth}{0pt}', '\\renewcommand{\\footrulewidth}{0pt}',
    '\\addtolength{\\oddsidemargin}{-0.5in}', '\\addtolength{\\evensidemargin}{-0.5in}', '\\addtolength{\\textwidth}{1in}',
    '\\addtolength{\\topmargin}{-.5in}', '\\addtolength{\\textheight}{1.0in}',
    '\\urlstyle{same}', '\\raggedbottom', '\\raggedright', '\\setlength{\\tabcolsep}{0in}',
    '\\titleformat{\\section}{\\vspace{-4pt}\\scshape\\raggedright\\large}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]',
    '\\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-2pt}}}',
    '\\newcommand{\\resumeSubheading}[4]{\\vspace{-2pt}\\item\\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}\\textbf{#1} & #2 \\\\ \\textit{\\small#3} & \\textit{\\small #4} \\\\ \\end{tabular*}\\vspace{-7pt}}',
    '\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}',
    '\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}',
    '\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.2in]}',
    '\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}',
    '\\begin{document}');
  if (m.name) o.push('\\begin{center}', '\\textbf{\\Huge \\scshape ' + tex(m.name) + '} \\\\ \\vspace{1pt}');
  else o.push('\\begin{center}');
  if (m.headline) o.push('\\textit{' + tex(m.headline) + '} \\\\ \\vspace{1pt}');
  if (m.contacts.length) o.push('\\small ' + m.contacts.map(link).join(' $|$ '));
  o.push('\\end{center}');
  m.extras.forEach(x => o.push('\\noindent\\small ' + tex(x) + '\\par'));
  for (const s of m.sections) {
    o.push('\\section{' + tex(s.title) + '}');
    let subs = false, items = false;
    const closeItems = () => { if (items) { o.push('\\resumeItemListEnd'); items = false; } };
    const closeSubs = () => { closeItems(); if (subs) { o.push('\\resumeSubHeadingListEnd'); subs = false; } };
    const it = s.items;
    for (let i = 0; i < it.length; i++) {
      const x = it[i];
      if (x.type === 'entry') {
        closeItems();
        if (!subs) { o.push('\\resumeSubHeadingListStart'); subs = true; }
        const sub = it[i + 1] && it[i + 1].type === 'sub' ? it[++i].text : '';
        o.push('\\resumeSubheading{' + tex(x.title) + '}{' + tex(x.date) + '}{' + tex(sub) + '}{}');
      } else if (x.type === 'bullet') {
        if (!items) { o.push('\\resumeItemListStart'); items = true; }
        o.push('\\resumeItem{' + tex(x.text) + '}');
      } else {
        closeSubs();
        if (x.type === 'chips') o.push('\\noindent\\small ' + (x.label ? '\\textbf{' + tex(x.label) + ':} ' : '') + x.chips.map(tex).join(', ') + '\\par\\smallskip');
        else o.push('\\noindent\\small ' + tex(x.text || '') + '\\par\\smallskip');
      }
    }
    closeSubs();
  }
  o.push('\\end{document}', '');
  return o.join('\n');
}
