// LaTeX resume templates: one structured CV model, rendered into six open-source LaTeX designs.
// Each template lists where it came from, its licence, the TeX engine it needs and the files
// (class files, fonts) the compiler must fetch from /assets/latex/.
import {parseCV} from './structure';

export const TEMPLATES = [
  {
    id: 'jake', name: "Jake's Resume", engine: 'pdflatex',
    author: 'Jake Gutierrez', repo: 'https://github.com/jakegut/resume', license: 'MIT',
    bestFor: ['Software & tech', 'Students & new grads', 'Big-tech / ATS portals'],
    blurb: 'The most recommended resume on r/cscareerquestions: one column, serif, tight spacing. Parses cleanly in every applicant tracking system.',
    ats: 'Excellent', columns: 1, files: [],
  },
  {
    id: 'awesome', name: 'Awesome CV', engine: 'xelatex',
    author: 'Claud D. Park (posquit0)', repo: 'https://github.com/posquit0/Awesome-CV', license: 'LPPL 1.3c',
    bestFor: ['Experienced professionals', 'Product, consulting, marketing', 'Design-aware tech roles'],
    blurb: 'Polished modern header with an accent colour, small-caps positions and dates on the right. Looks premium while staying single-column.',
    ats: 'Good', columns: 1, files: ['awesome/awesomecv-anyjob.cls'], accent: true,
  },
  {
    id: 'deedy', name: 'Deedy Resume', engine: 'xelatex',
    author: 'Debarghya Das', repo: 'https://github.com/deedy/Deedy-Resume', license: 'Apache-2.0',
    bestFor: ['Senior engineers & data scientists', 'Lots of skills and projects', 'Startups, US tech'],
    blurb: 'Famous two-column layout: education, skills and links on the left, experience on the right. Fits a lot on one page.',
    ats: 'Fair (two columns)', columns: 2,
    files: ['deedy/deedy-resume-anyjob.cls'],
  },
  {
    id: 'moderncv', name: 'ModernCV (banking)', engine: 'pdflatex',
    author: 'Xavier Danaux, Moritz Wilhelmy', repo: 'https://ctan.org/pkg/moderncv', license: 'LPPL 1.3c',
    bestFor: ['Academic & research CVs', 'Europe, UK, India', 'Multi-page careers'],
    blurb: 'The classic LaTeX CV class. Banking style: centred name, clean rules, dates beside each role. Comfortable over two or more pages.',
    ats: 'Good', columns: 1, files: [], accent: true,
  },
  {
    id: 'altacv', name: 'AltaCV', engine: 'pdflatex',
    author: 'LianTze Lim', repo: 'https://github.com/liantze/AltaCV', license: 'LPPL 1.3c',
    bestFor: ['Creative & marketing', 'Startups', 'Portfolio-style CVs'],
    blurb: 'Colourful two-column CV with icons, tags for skills and a sidebar. Stands out when a human, not a parser, reads it first.',
    ats: 'Fair (two columns)', columns: 2, files: ['altacv/altacv.cls'], accent: true,
  },
  {
    id: 'mcdowell', name: 'McDowell CV', engine: 'xelatex',
    author: 'Daniil Belyakov (format by Gayle L. McDowell)', repo: 'https://github.com/dnl-blkv/mcdowell-cv', license: 'MIT',
    bestFor: ['Finance & consulting', 'Business roles', 'Traditional employers'],
    blurb: 'The one-page format from Cracking the Coding Interview: centred header, role / company / dates on one line, compact bullets.',
    ats: 'Excellent', columns: 1, files: ['mcdowell/mcdowellcv-anyjob.cls'],
  },
];

export const ACCENTS = [
  {id: 'blue', label: 'Blue', hex: '1D4ED8'},
  {id: 'red', label: 'Red', hex: 'B91C1C'},
  {id: 'green', label: 'Green', hex: '15803D'},
  {id: 'purple', label: 'Purple', hex: '6D28D9'},
  {id: 'teal', label: 'Teal', hex: '0F766E'},
  {id: 'black', label: 'Black', hex: '111827'},
];

// Old record templates (before LaTeX templates) map onto the new ones.
const LEGACY = {Classic: 'jake', Modern: 'awesome', Compact: 'jake', 'ATS plain': 'jake'};
export const templateById = id => TEMPLATES.find(t => t.id === (LEGACY[id] || id)) || TEMPLATES[0];
export const normalizeTemplate = id => templateById(id).id;

// ---------- text helpers ----------
const SPECIAL = {'\\': '\\textbackslash{}', '~': '\\textasciitilde{}', '^': '\\textasciicircum{}', '&': '\\&', '%': '\\%', '$': '\\$', '#': '\\#', '_': '\\_', '{': '\\{', '}': '\\}'};
export function tex(s, unicode = false) {
  let t = String(s || '')
    .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\u2026/g, '...')
    .replace(/[\u2022\u25cf\u25aa\u00b7]/g, '-').replace(/\u00a0/g, ' ');
  if (!unicode) t = t.replace(/[\u2013]/g, '--').replace(/[\u2014]/g, '---').replace(/[^\x00-\u024f]/g, '');
  else t = t.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '');
  return t.replace(/[\\~^&%$#_{}]/g, c => SPECIAL[c]);
}
const url = s => String(s).replace(/[{}\\%#\s]/g, '');
const href = s => (/^https?:/i.test(s) ? s : 'https://' + s);

export function contactKinds(contacts) {
  const out = {email: '', phone: '', linkedin: '', github: '', website: '', location: '', other: []};
  for (const c of contacts || []) {
    if (!out.email && /@/.test(c) && !/\s/.test(c)) out.email = c;
    else if (!out.phone && /^\+?[\d\s().-]{8,}$/.test(c)) out.phone = c;
    else if (!out.linkedin && /linkedin\.com/i.test(c)) out.linkedin = c;
    else if (!out.github && /github\.com/i.test(c)) out.github = c;
    else if (!out.website && /^(https?:\/\/|www\.)|\.(com|io|dev|me|net|org|in|co|ai)(\/|$)/i.test(c)) out.website = c;
    else if (!out.location && /^[\p{L} .'-]+(,\s*[\p{L} .'-]+){0,2}$/u.test(c) && c.length < 50) out.location = c;
    else out.other.push(c);
  }
  return out;
}
const handle = (u, site) => url(u).replace(new RegExp('^(https?://)?(www\\.)?' + site + '\\.com/(in/)?', 'i'), '').replace(/\/$/, '');

export function splitName(name) {
  const parts = String(name || 'Your Name').trim().split(/\s+/);
  if (parts.length === 1) return [parts[0], ''];
  return [parts.slice(0, -1).join(' '), parts[parts.length - 1]];
}

// "Software Engineer, Acme Corp" -> role + organisation
export function splitTitle(title) {
  const t = String(title || '').trim();
  const m = t.match(/^(.*?)\s+(?:at|@)\s+(.+)$/i) || t.match(/^(.*?)\s+[|–—-]\s+(.+)$/) || t.match(/^(.*?),\s+(.+)$/);
  return m ? [m[1].trim(), m[2].trim()] : [t, ''];
}
const looksLikePlace = s => /^(remote|hybrid|on-?site)$/i.test(s) || /^[\p{Lu}][\p{L} .'-]+,\s*[\p{Lu}][\p{L} .'-]+$/u.test(s);

const KIND = [
  ['summary', /summary|profile|objective|about/i],
  ['education', /education|academic|qualification/i],
  ['skills', /skill|competenc|technolog|tools|languages|stack|expertise/i],
  ['experience', /experience|employment|work|career|history/i],
  ['projects', /project/i],
  ['awards', /award|honou?r|achievement|certific|publication|course/i],
  ['interests', /interest|hobb|volunteer|extra/i],
];
export const sectionKind = title => (KIND.find(([, re]) => re.test(title)) || ['other'])[0];

// Group parsed items into blocks: entries (with sub-title and bullets), loose bullets, text, skill lines.
export function blocks(items) {
  const out = [];
  let cur = null;
  for (const it of items) {
    if (it.type === 'entry') {
      const [role, org] = splitTitle(it.title);
      cur = {kind: 'entry', title: it.title, role, org, date: it.date || '', sub: '', place: '', bullets: [], notes: []};
      out.push(cur);
    } else if (it.type === 'sub' && cur && !cur.sub && !cur.bullets.length) {
      if (looksLikePlace(it.text)) cur.place = it.text; else cur.sub = it.text;
    } else if (it.type === 'bullet') {
      if (cur) cur.bullets.push(it.text);
      else {
        const last = out[out.length - 1];
        if (last && last.kind === 'bullets') last.bullets.push(it.text); else out.push({kind: 'bullets', bullets: [it.text]});
      }
    } else if ((it.type === 'text' || it.type === 'sub') && cur && !cur.bullets.length && cur.notes.length < 3 && it.text.length < 160) {
      cur.notes.push(it.text);
    } else {
      cur = null;
      if (it.type === 'chips') out.push({kind: 'chips', label: it.label, chips: it.chips});
      else if (it.type === 'subhead') out.push({kind: 'subhead', text: it.text});
      else out.push({kind: 'text', text: it.text});
    }
  }
  return out;
}

export function cvModel(text) {
  const m = parseCV(text);
  return {...m, contact: contactKinds(m.contacts), sections: m.sections.map(s => ({title: s.title, kind: sectionKind(s.title), blocks: blocks(s.items)}))};
}

const paper = size => (size === 'Letter' ? 'letterpaper' : 'a4paper');

// ---------- Jake's Resume ----------
function jake(m, o) {
  const e = s => tex(s);
  const o2 = [];
  o2.push('%-------------------------', "% Resume generated by AnyJob with Jake's Resume template", '% https://github.com/jakegut/resume (MIT licence)', '%-------------------------',
    `\\documentclass[${paper(o.pageSize)},${o.compact ? '10' : '11'}pt]{article}`,
    '\\usepackage{latexsym}', '\\usepackage[empty]{fullpage}', '\\usepackage{titlesec}', '\\usepackage[usenames,dvipsnames]{color}',
    '\\usepackage{enumitem}', '\\usepackage[hidelinks]{hyperref}', '\\usepackage{fancyhdr}', '\\usepackage[english]{babel}', '\\usepackage{tabularx}',
    '\\usepackage[T1]{fontenc}', '\\usepackage{lmodern}', '\\usepackage[utf8]{inputenc}', '\\input{glyphtounicode}', '',
    '\\pagestyle{fancy}', '\\fancyhf{}', '\\fancyfoot{}', '\\renewcommand{\\headrulewidth}{0pt}', '\\renewcommand{\\footrulewidth}{0pt}', '',
    '% Adjust margins', '\\addtolength{\\oddsidemargin}{-0.5in}', '\\addtolength{\\evensidemargin}{-0.5in}', '\\addtolength{\\textwidth}{1in}',
    '\\addtolength{\\topmargin}{-.5in}', '\\addtolength{\\textheight}{1.0in}', '',
    '\\urlstyle{same}', '\\raggedbottom', '\\raggedright', '\\setlength{\\tabcolsep}{0in}', '',
    '% Sections formatting', '\\titleformat{\\section}{', '  \\vspace{-4pt}\\scshape\\raggedright\\large', '}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]', '',
    '% Ensure that generate pdf is machine readable/ATS parsable', '\\pdfgentounicode=1', '',
    '%-------------------------', '% Custom commands',
    '\\newcommand{\\resumeItem}[1]{\\item\\small{{#1 \\vspace{-2pt}}}}',
    '\\newcommand{\\resumeSubheading}[4]{', '  \\vspace{-2pt}\\item', '    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}',
    '      \\textbf{#1} & #2 \\\\', '      \\textit{\\small#3} & \\textit{\\small #4} \\\\', '    \\end{tabular*}\\vspace{-7pt}', '}',
    '\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}',
    '\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}',
    '\\newcommand{\\resumeItemListStart}{\\begin{itemize}}',
    '\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}',
    '\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}', '',
    '\\begin{document}', '', '%----------HEADING----------', '\\begin{center}',
    `    \\textbf{\\Huge \\scshape ${e(m.name || 'Your Name')}} \\\\ \\vspace{1pt}`);
  if (m.headline) o2.push(`    \\textit{${e(m.headline)}} \\\\ \\vspace{1pt}`);
  const c = m.contact, parts = [];
  if (c.phone) parts.push(e(c.phone));
  if (c.email) parts.push(`\\href{mailto:${url(c.email)}}{\\underline{${e(c.email)}}}`);
  for (const k of ['linkedin', 'github', 'website']) if (c[k]) parts.push(`\\href{${url(href(c[k]))}}{\\underline{${e(c[k].replace(/^https?:\/\//, ''))}}}`);
  if (c.location) parts.push(e(c.location));
  c.other.forEach(x => parts.push(e(x)));
  if (parts.length) o2.push('    \\small ' + parts.join(' $|$ '));
  o2.push('\\end{center}', '');
  m.extras.forEach(x => o2.push(`\\noindent\\small ${e(x)}\\par`));
  for (const s of m.sections) {
    o2.push('', `%-----------${e(s.title).toUpperCase()}-----------`, `\\section{${e(s.title)}}`);
    const bs = s.blocks;
    let open = false;
    const close = () => { if (open) { o2.push('\\resumeSubHeadingListEnd'); open = false; } };
    for (const b of bs) {
      if (b.kind === 'entry') {
        if (!open) { o2.push('  \\resumeSubHeadingListStart'); open = true; }
        const left2 = b.sub || b.notes[0] || '';
        o2.push(`    \\resumeSubheading`, `      {${e(b.org ? b.role : b.title)}}{${e(b.date)}}`, `      {${e(b.org || left2)}}{${e(b.place || (b.org ? left2 : ''))}}`);
        const rest = b.org ? b.notes.slice(b.sub ? 0 : 1) : b.notes.slice(b.sub ? 0 : 1);
        if (b.bullets.length || rest.length) {
          o2.push('      \\resumeItemListStart');
          rest.forEach(n => o2.push(`        \\resumeItem{${e(n)}}`));
          b.bullets.forEach(x => o2.push(`        \\resumeItem{${e(x)}}`));
          o2.push('      \\resumeItemListEnd');
        }
      } else if (b.kind === 'bullets') {
        close();
        o2.push(' \\begin{itemize}[leftmargin=0.15in, label={}]', '    \\small{\\item{');
        b.bullets.forEach(x => o2.push(`     $\\bullet$ ${e(x)} \\\\`));
        o2.push('    }}', ' \\end{itemize}');
      } else if (b.kind === 'chips') {
        close();
        o2.push(` \\begin{itemize}[leftmargin=0.15in, label={}]`, `    \\small{\\item{${b.label ? `\\textbf{${e(b.label)}}{: ` : '{'}${b.chips.map(e).join(', ')}}}}`, ' \\end{itemize}');
      } else if (b.kind === 'subhead') {
        close();
        o2.push(`\\noindent\\textbf{${e(b.text)}}\\par`);
      } else {
        close();
        o2.push(` \\begin{itemize}[leftmargin=0.15in, label={}]`, `    \\small{\\item{${e(b.text)}}}`, ' \\end{itemize}');
      }
    }
    close();
  }
  o2.push('', '\\end{document}', '');
  return o2.join('\n');
}

// ---------- Awesome CV ----------
function awesome(m, o) {
  const e = s => tex(s, true);
  const [first, last] = splitName(m.name);
  const c = m.contact;
  const L = [];
  L.push('%-------------------------------------------------------------------------------',
    '% Resume generated by AnyJob with Awesome CV by Claud D. Park',
    '% https://github.com/posquit0/Awesome-CV  (LPPL 1.3c) -- compile with XeLaTeX',
    '%-------------------------------------------------------------------------------',
    `\\documentclass[11pt, ${paper(o.pageSize)}]{awesomecv-anyjob}`, '',
    '\\geometry{left=1.4cm, top=.8cm, right=1.4cm, bottom=1.8cm, footskip=.5cm}', '',
    `\\definecolor{anyjob}{HTML}{${o.accent}}`, '\\colorlet{awesome}{anyjob}', '\\setbool{acvSectionColorHighlight}{true}',
    '\\renewcommand{\\acvHeaderSocialSep}{\\quad\\textbar\\quad}', '',
    `\\name{${e(first)}}{${e(last)}}`);
  if (m.headline) L.push(`\\position{${e(m.headline)}}`);
  if (c.location) L.push(`\\address{${e(c.location)}}`);
  if (c.phone) L.push(`\\mobile{${e(c.phone)}}`);
  if (c.email) L.push(`\\email{${e(c.email)}}`);
  if (c.website) L.push(`\\homepage{${e(c.website.replace(/^https?:\/\//, ''))}}`);
  if (c.github) L.push(`\\github{${e(handle(c.github, 'github'))}}`);
  if (c.linkedin) L.push(`\\linkedin{${e(handle(c.linkedin, 'linkedin'))}}`);
  if (c.other.length) L.push(`\\extrainfo{${c.other.map(e).join(' \\quad ')}}`);
  L.push('', '\\begin{document}', '', '\\makecvheader[C]', '',
    `\\makecvfooter{}{${e(m.name)}~~~·~~~Résumé}{\\thepage}`, '');
  m.extras.forEach(x => L.push(`\\begin{cvparagraph}${e(x)}\\end{cvparagraph}`));
  for (const s of m.sections) {
    L.push('', `\\cvsection{${e(s.title)}}`);
    let entries = false, skills = false;
    const end = () => { if (entries) { L.push('\\end{cventries}'); entries = false; } if (skills) { L.push('\\end{cvskills}'); skills = false; } };
    for (const b of s.blocks) {
      if (b.kind === 'entry') {
        if (skills) { L.push('\\end{cvskills}'); skills = false; }
        if (!entries) { L.push('\\begin{cventries}'); entries = true; }
        const items = [...(b.sub && b.org ? [] : []), ...b.notes, ...b.bullets];
        L.push('  \\cventry', `    {${e(b.org ? b.role : b.sub || '')}}`, `    {${e(b.org || b.title)}}`, `    {${e(b.place || (b.org ? b.sub : ''))}}`, `    {${e(b.date)}}`);
        if (items.length) L.push('    {', '      \\begin{cvitems}', ...items.map(x => `        \\item {${e(x)}}`), '      \\end{cvitems}', '    }');
        else L.push('    {}');
      } else if (b.kind === 'chips') {
        if (entries) { L.push('\\end{cventries}'); entries = false; }
        if (!skills) { L.push('\\begin{cvskills}'); skills = true; }
        L.push(`  \\cvskill{${e(b.label || 'Skills')}}{${b.chips.map(e).join(', ')}}`);
      } else {
        end();
        if (b.kind === 'bullets') L.push('\\begin{cvparagraph}', '\\begin{itemize}[leftmargin=2ex, nosep, noitemsep]', ...b.bullets.map(x => `  \\item ${e(x)}`), '\\end{itemize}', '\\end{cvparagraph}');
        else if (b.kind === 'subhead') L.push(`\\cvsubsection{${e(b.text)}}`);
        else L.push('\\begin{cvparagraph}', e(b.text), '\\end{cvparagraph}');
      }
    }
    end();
  }
  L.push('', '\\end{document}', '');
  return L.join('\n');
}

// ---------- Deedy ----------
function deedy(m, o) {
  const e = s => tex(s, true);
  const [first, last] = splitName(m.name);
  const c = m.contact;
  const links = [];
  if (c.website) links.push(`\\href{${url(href(c.website))}}{${e(c.website.replace(/^https?:\/\//, ''))}}`);
  if (c.linkedin) links.push(`\\href{${url(href(c.linkedin))}}{${e(c.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}}`);
  if (c.github) links.push(`\\href{${url(href(c.github))}}{${e(c.github.replace(/^https?:\/\/(www\.)?/, ''))}}`);
  const reach = [];
  if (c.email) reach.push(`\\href{mailto:${url(c.email)}}{${e(c.email)}}`);
  if (c.phone) reach.push(e(c.phone));
  if (c.location) reach.push(e(c.location));
  c.other.forEach(x => reach.push(e(x)));
  const left = m.sections.filter(s => ['education', 'skills', 'awards', 'interests'].includes(s.kind));
  const right = m.sections.filter(s => !left.includes(s));
  const L = ['%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%', '% Resume generated by AnyJob with Deedy Resume by Debarghya Das',
    '% https://github.com/deedy/Deedy-Resume (Apache-2.0) -- compile with XeLaTeX', '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
    `\\documentclass[]{deedy-resume-anyjob}`, o.pageSize === 'Letter' ? '\\usepackage[letterpaper]{geometry}' : '\\geometry{a4paper, hmargin=1.25cm, vmargin=0.75cm}', '\\usepackage{fancyhdr}', '\\pagestyle{fancy}', '\\fancyhf{}', '\\renewcommand{\\headrulewidth}{0pt}', '',
    '\\begin{document}', '',
    `\\namesection{${e(first)}}{${e(last)}}{ \\urlstyle{same}${[links.join(' | '), reach.join(' | ')].filter(Boolean).join('\\\\\n')}`, '}', ''];
  const sec = (s, wide) => {
    L.push(`\\section{${e(s.title)}}`);
    for (const b of s.blocks) {
      if (b.kind === 'entry') {
        if (wide) {
          L.push(`\\runsubsection{${e(b.org || b.title)}}`);
          if (b.org || b.sub) L.push(`\\descript{| ${e(b.org ? b.role : b.sub)}}`);
          L.push(`\\location{${e([b.date, b.place].filter(Boolean).join(' | ') || ' ')}}`);
        } else {
          L.push(`\\subsection{${e(b.org || b.title)}}`);
          if (b.org) L.push(`\\descript{${e(b.role)}}`);
          L.push(`\\location{${e([b.date, b.place].filter(Boolean).join(' | ') || ' ')}}`);
        }
        const items = [...(wide && b.sub && !b.org ? [] : b.sub && b.org ? [b.sub] : []), ...b.notes, ...b.bullets];
        if (items.length) {
          if (wide) L.push('\\vspace{\\topsep}', '\\begin{tightemize}', ...items.map(x => `\\item ${e(x)}`), '\\end{tightemize}');
          else items.forEach(x => L.push(`${e(x)} \\\\`));
        }
        L.push('\\sectionsep', '');
      } else if (b.kind === 'chips') {
        L.push(wide ? `\\textbf{${e(b.label || 'Skills')}:} ${b.chips.map(e).join(' \\textbullet{} ')} \\\\` : `\\subsection{${e(b.label || 'Skills')}}`, ...(wide ? [] : [b.chips.map(e).join(' \\textbullet{} ') + ' \\\\']), '\\sectionsep');
      } else if (b.kind === 'bullets') {
        L.push('\\begin{tightemize}', ...b.bullets.map(x => `\\item ${e(x)}`), '\\end{tightemize}', '\\sectionsep');
      } else if (b.kind === 'subhead') L.push(`\\subsection{${e(b.text)}}`);
      else L.push(`${e(b.text)} \\\\`, '\\sectionsep');
    }
    L.push('');
  };
  L.push('\\begin{minipage}[t]{0.33\\textwidth}');
  if (m.headline) L.push('\\section{Profile}', `${e(m.headline)} \\\\`, '\\sectionsep', '');
  left.forEach(s => sec(s, false));
  L.push('\\end{minipage}', '\\hfill', '\\begin{minipage}[t]{0.66\\textwidth}');
  m.extras.forEach(x => L.push(`${e(x)} \\\\`));
  right.forEach(s => sec(s, true));
  L.push('\\end{minipage}', '', '\\end{document}', '');
  return L.join('\n');
}

// ---------- ModernCV ----------
function moderncv(m, o) {
  const e = s => tex(s);
  const [first, last] = splitName(m.name);
  const c = m.contact;
  const L = ['%-------------------------------------------------------------------------------',
    '% CV generated by AnyJob with the moderncv class (banking style)', '% https://ctan.org/pkg/moderncv (LPPL 1.3c) -- included in TeX Live',
    '%-------------------------------------------------------------------------------',
    `\\documentclass[11pt,${paper(o.pageSize)},sans]{moderncv}`, '\\moderncvstyle{banking}', `\\definecolor{color1}{HTML}{${o.accent}}`,
    '\\usepackage[scale=0.82, top=1.6cm, bottom=1.6cm]{geometry}', '',
    `\\name{${e(first)}}{${e(last)}}`];
  if (m.headline) L.push(`\\title{${e(m.headline)}}`);
  if (c.location) L.push(`\\address{${e(c.location)}}{}{}`);
  if (c.phone) L.push(`\\phone[mobile]{${e(c.phone)}}`);
  if (c.email) L.push(`\\email{${e(c.email)}}`);
  if (c.website) L.push(`\\homepage{${e(c.website.replace(/^https?:\/\//, ''))}}`);
  if (c.linkedin) L.push(`\\social[linkedin]{${e(handle(c.linkedin, 'linkedin'))}}`);
  if (c.github) L.push(`\\social[github]{${e(handle(c.github, 'github'))}}`);
  if (c.other.length) L.push(`\\extrainfo{${c.other.map(e).join(', ')}}`);
  L.push('', '\\begin{document}', '\\makecvtitle', '');
  m.extras.forEach(x => L.push(`\\cvitem{}{${e(x)}}`));
  for (const s of m.sections) {
    L.push(`\\section{${e(s.title)}}`);
    for (const b of s.blocks) {
      if (b.kind === 'entry') {
        const items = [...b.notes, ...b.bullets];
        const desc = items.length ? `\\begin{itemize}${items.map(x => `\\item ${e(x)}`).join('')}\\end{itemize}` : '';
        L.push(`\\cventry{${e(b.date)}}{${e(b.org ? b.role : b.title)}}{${e(b.org || b.sub)}}{${e(b.place)}}{${e(b.org ? b.sub : '')}}{${desc}}`);
      } else if (b.kind === 'chips') L.push(`\\cvitem{${e(b.label || 'Skills')}}{${b.chips.map(e).join(', ')}}`);
      else if (b.kind === 'bullets') b.bullets.forEach(x => L.push(`\\cvlistitem{${e(x)}}`));
      else if (b.kind === 'subhead') L.push(`\\subsection{${e(b.text)}}`);
      else L.push(`\\cvitem{}{${e(b.text)}}`);
    }
    L.push('');
  }
  L.push('\\end{document}', '');
  return L.join('\n');
}

// ---------- AltaCV ----------
function altacv(m, o) {
  const e = s => tex(s);
  const c = m.contact;
  const side = m.sections.filter(s => ['skills', 'education', 'awards', 'interests'].includes(s.kind));
  const main = m.sections.filter(s => !side.includes(s));
  const L = ['%-------------------------------------------------------------------------------',
    '% CV generated by AnyJob with AltaCV by LianTze Lim', '% https://github.com/liantze/AltaCV (LPPL 1.3c)',
    '%-------------------------------------------------------------------------------',
    `\\documentclass[10pt,${o.pageSize === 'Letter' ? 'letterpaper' : 'a4paper'},withhyper]{altacv}`,
    '\\geometry{left=1.25cm,right=1.25cm,top=1.5cm,bottom=1.5cm,columnsep=1.2cm}', '\\usepackage{paracol}',
    '\\usepackage[rm]{roboto}', '\\usepackage[defaultsans]{lato}', '\\renewcommand{\\familydefault}{\\sfdefault}', '',
    `\\definecolor{Accent}{HTML}{${o.accent}}`, '\\definecolor{SlateGrey}{HTML}{2E2E2E}', '\\definecolor{LightGrey}{HTML}{666666}',
    '\\colorlet{name}{black}', '\\colorlet{tagline}{Accent}', '\\colorlet{heading}{Accent}', '\\colorlet{headingrule}{Accent!40}',
    '\\colorlet{subheading}{Accent}', '\\colorlet{accent}{Accent}', '\\colorlet{emphasis}{SlateGrey}', '\\colorlet{body}{LightGrey}',
    '\\renewcommand{\\namefont}{\\Huge\\rmfamily\\bfseries}', '\\renewcommand{\\personalinfofont}{\\footnotesize}',
    '\\renewcommand{\\cvsectionfont}{\\LARGE\\rmfamily\\bfseries}', '\\renewcommand{\\cvsubsectionfont}{\\large\\bfseries}',
    '\\renewcommand{\\cvItemMarker}{{\\small\\textbullet}}', '',
    '\\begin{document}', `\\name{${e(m.name || 'Your Name')}}`];
  if (m.headline) L.push(`\\tagline{${e(m.headline)}}`);
  L.push('\\personalinfo{%');
  if (c.email) L.push(`  \\email{${e(c.email)}}`);
  if (c.phone) L.push(`  \\phone{${e(c.phone)}}`);
  if (c.location) L.push(`  \\location{${e(c.location)}}`);
  if (c.website) L.push(`  \\homepage{${e(c.website.replace(/^https?:\/\//, ''))}}`);
  if (c.linkedin) L.push(`  \\linkedin{${e(handle(c.linkedin, 'linkedin'))}}`);
  if (c.github) L.push(`  \\github{${e(handle(c.github, 'github'))}}`);
  L.push('}', '\\makecvheader', '\\columnratio{0.62}', '\\begin{paracol}{2}', '');
  const sec = (s, narrow) => {
    L.push(`\\cvsection{${e(s.title)}}`);
    let first = true;
    for (const b of s.blocks) {
      if (b.kind === 'entry') {
        if (!first) L.push('\\divider');
        first = false;
        L.push(`\\cvevent{${e(b.org ? b.role : b.title)}}{${e(b.org || b.sub)}}{${e(b.date)}}{${e(b.place)}}`);
        const items = [...(b.org && b.sub ? [b.sub] : []), ...b.notes, ...b.bullets];
        if (items.length) L.push('\\begin{itemize}', ...items.map(x => `\\item ${e(x)}`), '\\end{itemize}');
      } else if (b.kind === 'chips') {
        if (b.label) L.push(`\\cvsubsection{${e(b.label)}}`);
        L.push(b.chips.map(x => `\\cvtag{${e(x)}}`).join('\n'), '');
      } else if (b.kind === 'bullets') L.push('\\begin{itemize}', ...b.bullets.map(x => `\\item ${e(x)}`), '\\end{itemize}');
      else if (b.kind === 'subhead') L.push(`\\cvsubsection{${e(b.text)}}`);
      else L.push(`${e(b.text)}\\par`, '\\medskip');
    }
    L.push('');
  };
  m.extras.forEach(x => L.push(`${e(x)}\\par\\medskip`));
  main.forEach(s => sec(s, false));
  L.push('\\switchcolumn', '');
  side.forEach(s => sec(s, true));
  L.push('\\end{paracol}', '\\end{document}', '');
  return L.join('\n');
}

// ---------- McDowell ----------
function mcdowell(m, o) {
  const e = s => tex(s, true);
  const c = m.contact;
  const addr = [c.location, ...c.other].filter(Boolean).map(e).join(' \\linebreak ');
  const contacts = [c.phone, c.email, c.linkedin, c.github, c.website].filter(Boolean).map(e).join(' \\linebreak ');
  const L = ['%-------------------------------------------------------------------------------',
    '% Resume generated by AnyJob with McDowell CV by Daniil Belyakov', '% https://github.com/dnl-blkv/mcdowell-cv (MIT) -- compile with XeLaTeX',
    '%-------------------------------------------------------------------------------',
    `\\documentclass[${o.pageSize === 'Letter' ? 'letterpaper' : 'a4paper'}]{mcdowellcv-anyjob}`, '',
    `\\name{${e(m.name || 'Your Name')}}`, `\\address{${addr || e(m.headline)}}`, `\\contacts{${contacts}}`, '',
    '\\begin{document}', '\\makeheader', ''];
  if (m.headline && addr) L.push('\\begin{center}\\textit{' + e(m.headline) + '}\\end{center}');
  m.extras.forEach(x => L.push(`${e(x)}\\par`));
  for (const s of m.sections) {
    L.push(`\\begin{cvsection}{${e(s.title)}}`);
    for (const b of s.blocks) {
      if (b.kind === 'entry') {
        const items = [...b.notes, ...b.bullets];
        L.push(`  \\begin{cvsubsection}{${e(b.org ? b.role : b.title)}}{${e(b.org)}}{${e(b.date)}}`);
        if (b.sub || b.place) L.push(`    ${e([b.sub, b.place].filter(Boolean).join(', '))}`);
        if (items.length) L.push('    \\begin{itemize}', ...items.map(x => `      \\item ${e(x)}`), '    \\end{itemize}');
        L.push('  \\end{cvsubsection}');
      } else if (b.kind === 'chips') {
        const prev = s.blocks[s.blocks.indexOf(b) - 1], next = s.blocks[s.blocks.indexOf(b) + 1];
        if (!prev || prev.kind !== 'chips') L.push('  \\begin{cvsubsection}{}{}{}');
        L.push(`    \\textbf{${e(b.label || 'Skills')}:} ${b.chips.map(e).join(', ')}${next && next.kind === 'chips' ? ' \\\\' : ''}`);
        if (!next || next.kind !== 'chips') L.push('  \\end{cvsubsection}');
      } else if (b.kind === 'bullets') {
        L.push('  \\begin{cvsubsection}{}{}{}', '    \\begin{itemize}', ...b.bullets.map(x => `      \\item ${e(x)}`), '    \\end{itemize}', '  \\end{cvsubsection}');
      } else L.push('  \\begin{cvsubsection}{}{}{}', `    ${b.kind === 'subhead' ? '\\textbf{' + e(b.text) + '}' : e(b.text)}`, '  \\end{cvsubsection}');
    }
    L.push('\\end{cvsection}', '');
  }
  L.push('\\end{document}', '');
  return L.join('\n');
}

const GENERATORS = {jake, awesome, deedy, moderncv, altacv, mcdowell};

// Build the LaTeX source for a CV text with a template and options.
export function generateLatex(text, templateId, options = {}) {
  const t = templateById(templateId);
  const accent = (ACCENTS.find(a => a.id === options.accent) || ACCENTS[0]).hex;
  return GENERATORS[t.id](cvModel(text), {pageSize: options.pageSize || 'A4', accent, compact: options.compact});
}
