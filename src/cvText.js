// Editable CV model <-> plain CV text. The text form is what AnyJob stores and what every
// template, export and AI call reads, so the editor serialises back to it after each change.
import {parseCV, isCvHeading} from './structure';
import {blocks} from './templates';

let n = 0;
export const uid = () => 'k' + (++n).toString(36) + Math.random().toString(36).slice(2, 6);

export function toModel(text) {
  const m = parseCV(text || '');
  const sections = m.sections.map(s => ({
    id: uid(),
    title: s.title,
    items: blocks(s.items).map(b => {
      if (b.kind === 'entry') return {kind: 'entry', id: uid(), title: b.title, date: b.date, sub: [b.sub, b.place].filter(Boolean).join(' · '), details: b.notes, bullets: b.bullets.map(t => ({id: uid(), text: t}))};
      if (b.kind === 'bullets') return {kind: 'bullets', id: uid(), bullets: b.bullets.map(t => ({id: uid(), text: t}))};
      if (b.kind === 'chips') return {kind: 'skill', id: uid(), label: b.label, items: b.chips.join(', ')};
      if (b.kind === 'subhead') return {kind: 'subhead', id: uid(), text: b.text};
      return {kind: 'text', id: uid(), text: b.text};
    }),
  }));
  if (m.extras.length) sections.unshift({id: uid(), title: 'Summary', items: m.extras.map(t => ({kind: 'text', id: uid(), text: t}))});
  return {name: m.name, headline: m.headline, contacts: m.contacts.slice(), sections};
}

const one = s => String(s || '').replace(/\s*\n\s*/g, ' ').trim();

export function toText(model) {
  const out = [];
  out.push(one(model.name) || 'Your Name');
  if (one(model.headline)) out.push(one(model.headline));
  const contacts = (model.contacts || []).map(one).filter(Boolean);
  if (contacts.length) out.push(contacts.join(' | '));
  for (const s of model.sections || []) {
    const title = one(s.title) || 'Section';
    out.push('', isCvHeading(title) ? title : '## ' + title);
    for (const it of s.items) {
      if (it.kind === 'entry') {
        const title2 = one(it.title);
        if (title2) out.push(one(it.date) ? title2 + '  ' + one(it.date) : title2);
        else if (one(it.date)) out.push(one(it.date));
        if (one(it.sub)) out.push(one(it.sub).replace(/ · /g, ', '));
        (it.details || []).map(one).filter(Boolean).forEach(d => out.push(d));
        it.bullets.map(b => one(b.text)).filter(Boolean).forEach(b => out.push('- ' + b));
      } else if (it.kind === 'bullets') {
        it.bullets.map(b => one(b.text)).filter(Boolean).forEach(b => out.push('- ' + b));
      } else if (it.kind === 'skill') {
        const items = one(it.items);
        if (items) out.push(one(it.label) ? one(it.label) + ': ' + items : items);
      } else if (it.kind === 'subhead') {
        if (one(it.text)) out.push('### ' + one(it.text));
      } else if (one(it.text)) out.push(one(it.text));
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

// Replace one bullet's text everywhere it appears in a CV text (used when accepting AI rewrites).
export function replaceBullet(text, original, improved) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const target = norm(original);
  let done = false;
  const lines = String(text).split('\n').map(line => {
    if (done) return line;
    const m = line.match(/^(\s*(?:[-•*–·▪●]|\d{1,2}[.)])\s+)(.*)$/);
    const body = m ? m[2] : line;
    if (norm(body) === target || (target.length > 30 && norm(body).startsWith(target.slice(0, 40)))) {
      done = true;
      return (m ? m[1] : '- ') + improved;
    }
    return line;
  });
  return {text: lines.join('\n'), done};
}

// Put a new summary paragraph into the Summary section (creating it if needed).
export function setSummary(text, summary) {
  const model = toModel(text);
  let s = model.sections.find(x => /summary|profile|objective|about/i.test(x.title));
  if (!s) { s = {id: uid(), title: 'Summary', items: []}; model.sections.unshift(s); }
  s.items = [{kind: 'text', id: uid(), text: summary}];
  return toText(model);
}

export function setHeadline(text, headline) {
  const model = toModel(text);
  model.headline = headline;
  return toText(model);
}
