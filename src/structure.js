import {tidyJob} from './tidyJob';
export {tidyJob};
// Turn extracted CV and job-post text into structure so it can be shown as a clean document.
const HEADINGS = 'summary|professional summary|profile|objective|career objective|about me|about|skills|technical skills|core skills|key skills|core competencies|competencies|experience|work experience|professional experience|employment history|work history|education|academic background|projects|certifications?|certificates|publications|achievements|awards|languages|interests|volunteer(?:ing)?(?: experience)?|references|highlights|training|courses';
const CV_HEAD = new RegExp('^(?:' + HEADINGS + ')\\s*:?$', 'i');
export const isCvHeading = line => CV_HEAD.test(String(line).trim());
const JOB_HEAD = /^(?:about (?:the )?(?:role|job|position|team|us|company|you)|the role|role overview|overview|job (?:description|summary|overview)|position summary|(?:key |main |core )?responsibilities|what you(?:'|’)?ll do|what you will (?:do|bring|accomplish)|what we(?:'|’)?re looking for|what we offer|what you bring|who you are|requirements?|(?:required |minimum |basic |preferred |desired )?(?:qualifications?|skills(?: required)?|experience)|nice to have|good to have|bonus points|benefits|perks|why join us|how to apply|about the job|duties|your role|your profile|compensation|salary)\s*:?$/i;
export const BULLET = /^\s*(?:[•\-*–—·▪●◦‣►✓]|\d{1,2}[.)])\s+(.*\S)\s*$/;
const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?';
const DATE = new RegExp('(?:' + MONTH + '\\s+)?(?:19|20)\\d{2}\\s*(?:[-–—]|to)\\s*(?:(?:' + MONTH + '\\s+)?(?:19|20)\\d{2}|present|current|now|ongoing)|(?:' + MONTH + '\\s+)?(?:19|20)\\d{2}\\s*$', 'i');
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
const PHONE = /\+?\d[\d\s().-]{8,}\d/;
const URL = /(?:https?:\/\/|www\.|linkedin\.com|github\.com|[\w-]+\.(?:com|io|dev|me|net|org)\b)\S*/i;

const clean = s => s.replace(/[\t ]+/g, ' ').trim();
const isAllCaps = s => s.length >= 3 && s.length <= 40 && /[A-Z]/.test(s) && s === s.toUpperCase() && !/\d|@/.test(s);

export function normalize(text) {
  return String(text || '').replace(/\r/g, '').replace(/ /g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function splitSections(lines, isHead) {
  const head = [], sections = [];
  let cur = null;
  for (const raw of lines) {
    const line = clean(raw);
    if (/^##\s+\S/.test(line)) {
      cur = {title: line.replace(/^##\s+/, ''), lines: []};
      sections.push(cur);
    } else if (line && !BULLET.test(line) && (isHead.test(line.replace(/[:：]$/, '')) || isHead.test(line) || isAllCaps(line))) {
      cur = {title: line.replace(/[:：]\s*$/, ''), lines: []};
      sections.push(cur);
    } else (cur ? cur.lines : head).push(line);
  }
  return {head, sections};
}

function chipsFrom(line) {
  const labeled = line.match(/^([^:]{2,30}):\s*(.+)$/);
  const body = labeled ? labeled[2] : line;
  const parts = body.split(/\s*[,;|•·●]\s*/).map(clean).filter(Boolean);
  return {label: labeled ? labeled[1] : '', chips: parts.length >= 2 ? parts : null};
}

function blocks(lines, kind) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const sh = line.match(/^###\s+(.+)$/);
    if (sh) { out.push({type: 'subhead', text: sh[1]}); continue; }
    const b = line.match(BULLET);
    if (b) { out.push({type: 'bullet', text: b[1]}); continue; }
    const next = lines.slice(i + 1).find(Boolean) || '';
    const date = line.match(DATE);
    const entryish = kind === 'cv' && (line.length <= 110 && (date || (BULLET.test(next) && line.length <= 80)));
    if (entryish) {
      const title = date ? clean(line.replace(date[0], '').replace(/[|,·–—-]\s*$/, '')) : line;
      out.push({type: 'entry', title: title || line, date: date ? clean(date[0]) : ''});
      const after = lines[i + 1];
      if (after && !BULLET.test(after) && after.length <= 90 && !DATE.test(after)) { out.push({type: 'sub', text: after}); i++; }
      continue;
    }
    out.push({type: 'text', text: line});
  }
  return out;
}

export function parseCV(input) {
  const text = normalize(input);
  const lines = text.split('\n');
  const {head, sections} = splitSections(lines, CV_HEAD);
  const header = head.filter(Boolean);
  const name = header[0] || '';
  const rest = header.slice(1);
  let headline = '';
  const contacts = [];
  const extras = [];
  for (const line of rest) {
    if (EMAIL.test(line) || PHONE.test(line) || URL.test(line)) {
      line.split(/\s*[|·•●]\s*|\s{3,}/).map(clean).filter(Boolean).forEach(p => contacts.push(p));
    } else if (!headline && line.length <= 80) headline = line;
    else if (line.length <= 60) contacts.push(line);
    else extras.push(line);
  }
  const body = sections.map(s => {
    const skillish = /skill|competenc|language|interest|tools|technolog/i.test(s.title);
    if (skillish) {
      const items = [];
      for (const l of s.lines.filter(Boolean)) {
        const bl = l.match(BULLET);
        const {label, chips} = chipsFrom(bl ? bl[1] : l);
        items.push(chips ? {type: 'chips', label, chips} : {type: bl ? 'bullet' : 'text', text: bl ? bl[1] : l});
      }
      return {title: s.title, items};
    }
    return {title: s.title, items: blocks(s.lines, 'cv')};
  });
  const words = (text.match(/\S+/g) || []).length;
  return {name, headline, contacts, extras, sections: body, words, stats: {words, sections: body.length, email: EMAIL.test(text), phone: PHONE.test(text), bullets: lines.filter(l => BULLET.test(l)).length}, empty: !text};
}

export function parseJob(input) {
  const text = tidyJob(normalize(input));
  const lines = text.split('\n');
  const {head, sections} = splitSections(lines, JOB_HEAD);
  const intro = head.filter(Boolean);
  const body = sections.map(s => ({title: s.title, items: blocks(s.lines, 'job')}));
  const words = (text.match(/\S+/g) || []).length;
  return {intro: blocks(intro, 'job'), sections: body, stats: {words, sections: body.length, bullets: lines.filter(l => BULLET.test(l)).length}, empty: !text};
}
