import React, {useEffect, useRef, useState} from 'react';
import {Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Loader2, X, Check, GripVertical} from 'lucide-react';
import {toModel, toText, uid} from './cvText';
import {ai} from './api';

function Grow({value, onChange, placeholder, className = '', label}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 2 + 'px'; }
  }, [value]);
  return <textarea ref={ref} rows={1} aria-label={label || placeholder} className={'grow-area ' + className} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}/>;
}

const move = (list, i, d) => {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const copy = list.slice();
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
};

function Tools({onUp, onDown, onDelete, label}) {
  return <span className="row-tools">
    <button className="icon" onClick={onUp} aria-label={'Move ' + label + ' up'}><ArrowUp/></button>
    <button className="icon" onClick={onDown} aria-label={'Move ' + label + ' down'}><ArrowDown/></button>
    <button className="icon danger" onClick={onDelete} aria-label={'Delete ' + label}><Trash2/></button>
  </span>;
}

function Bullets({bullets, onChange, aiContext}) {
  const [open, setOpen] = useState(null); // {id, busy, options, error}
  const set = (i, patch) => onChange(bullets.map((b, k) => (k === i ? {...b, ...patch} : b)));
  async function improve(b) {
    setOpen({id: b.id, busy: true, options: [], error: ''});
    try {
      const out = await ai('bullet', {cv: aiContext.cv(), jd: aiContext.jd, bullet: b.text});
      setOpen({id: b.id, busy: false, options: out.options || [], error: out.options && out.options.length ? '' : 'No safe rewrite found for this bullet.'});
    } catch (e) {
      setOpen({id: b.id, busy: false, options: [], error: e.message});
    }
  }
  return <div className="bullets">
    {bullets.map((b, i) => <div className="bullet-row" key={b.id}>
      <span className="dot" aria-hidden="true">•</span>
      <div className="bullet-main">
        <Grow value={b.text} onChange={v => set(i, {text: v})} placeholder="Achievement: what you did, how, and the result" label={'Bullet ' + (i + 1)}/>
        {open && open.id === b.id && <div className="ai-pop">
          {open.busy ? <p><Loader2 className="spin"/> Writing three honest rewrites…</p> : <>
            {open.error && <p className="hint">{open.error}</p>}
            {open.options.map((o, k) => <button key={k} className="ai-option" onClick={() => { set(i, {text: o}); setOpen(null); }}><Check/>{o}</button>)}
            <button className="ghost small" onClick={() => setOpen(null)}><X/>Close</button>
          </>}
        </div>}
      </div>
      <span className="row-tools">
        {aiContext && aiContext.jd && <button className="icon ai" onClick={() => improve(b)} aria-label="Rewrite this bullet with AI" title="Rewrite for this job (AI)"><Sparkles/></button>}
        <button className="icon" onClick={() => onChange(move(bullets, i, -1))} aria-label="Move bullet up"><ArrowUp/></button>
        <button className="icon" onClick={() => onChange(move(bullets, i, 1))} aria-label="Move bullet down"><ArrowDown/></button>
        <button className="icon danger" onClick={() => onChange(bullets.filter((_, k) => k !== i))} aria-label="Delete bullet"><Trash2/></button>
      </span>
    </div>)}
    <button className="add" onClick={() => onChange([...bullets, {id: uid(), text: ''}])}><Plus/>Bullet</button>
  </div>;
}

function Item({it, onChange, aiContext}) {
  const set = patch => onChange({...it, ...patch});
  if (it.kind === 'entry') return <div className="entry-edit">
    <div className="entry-grid">
      <input value={it.title} onChange={e => set({title: e.target.value})} placeholder="Role, Organisation" aria-label="Role and organisation"/>
      <input value={it.date} onChange={e => set({date: e.target.value})} placeholder="Jan 2022 - Present" aria-label="Dates" className="date"/>
    </div>
    <input value={it.sub} onChange={e => set({sub: e.target.value})} placeholder="Team, location or degree details (optional)" aria-label="Subtitle" className="sub"/>
    {(it.details || []).map((d, i) => <Grow key={i} value={d} onChange={v => set({details: it.details.map((x, k) => (k === i ? v : x)).filter((x, k) => x || k !== i)})} placeholder="Detail line" className="detail"/>)}
    <Bullets bullets={it.bullets} onChange={bullets => set({bullets})} aiContext={aiContext}/>
  </div>;
  if (it.kind === 'bullets') return <Bullets bullets={it.bullets} onChange={bullets => set({bullets})} aiContext={aiContext}/>;
  if (it.kind === 'skill') return <div className="skill-edit">
    <input value={it.label} onChange={e => set({label: e.target.value})} placeholder="Category" aria-label="Skill category"/>
    <Grow value={it.items} onChange={v => set({items: v})} placeholder="Comma-separated skills" label="Skills"/>
  </div>;
  if (it.kind === 'subhead') return <input className="subhead-edit" value={it.text} onChange={e => set({text: e.target.value})} placeholder="Sub-heading"/>;
  return <Grow value={it.text} onChange={v => set({text: v})} placeholder="Paragraph" label="Paragraph"/>;
}

const NEW = {
  entry: () => ({kind: 'entry', id: uid(), title: '', date: '', sub: '', details: [], bullets: [{id: uid(), text: ''}]}),
  bullets: () => ({kind: 'bullets', id: uid(), bullets: [{id: uid(), text: ''}]}),
  text: () => ({kind: 'text', id: uid(), text: ''}),
  skill: () => ({kind: 'skill', id: uid(), label: '', items: ''}),
};
const SECTION_IDEAS = ['Summary', 'Experience', 'Projects', 'Education', 'Skills', 'Certifications', 'Awards', 'Publications', 'Languages', 'Volunteering', 'Interests'];

// Structured, fully editable CV. Every change is written back as plain CV text.
export function CvEditor({text, onText, aiContext}) {
  const [model, setModel] = useState(() => toModel(text));
  const emitted = useRef(text);
  useEffect(() => {
    if (text !== emitted.current) { setModel(toModel(text)); emitted.current = text; }
  }, [text]);
  function update(next) {
    setModel(next);
    const t = toText(next);
    emitted.current = t;
    onText(t);
  }
  const setSection = (i, patch) => update({...model, sections: model.sections.map((s, k) => (k === i ? {...s, ...patch} : s))});
  const ctx = aiContext ? {...aiContext, cv: () => emitted.current} : null;

  return <div className="cv-editor">
    <section className="edit-card head-card">
      <input className="name-input" value={model.name} onChange={e => update({...model, name: e.target.value})} placeholder="Your name" aria-label="Your name"/>
      <input className="headline-input" value={model.headline} onChange={e => update({...model, headline: e.target.value})} placeholder="Headline, e.g. Senior Frontend Engineer" aria-label="Headline"/>
      <div className="contacts-edit">
        {model.contacts.map((c, i) => <span className="contact-chip" key={i}>
          <input value={c} onChange={e => update({...model, contacts: model.contacts.map((x, k) => (k === i ? e.target.value : x))})} aria-label={'Contact ' + (i + 1)} size={Math.max(8, c.length)}/>
          <button className="icon" onClick={() => update({...model, contacts: model.contacts.filter((_, k) => k !== i)})} aria-label="Remove contact"><X/></button>
        </span>)}
        <button className="add" onClick={() => update({...model, contacts: [...model.contacts, '']})}><Plus/>Contact</button>
      </div>
    </section>
    {model.sections.map((s, si) => <section className="edit-card" key={s.id}>
      <header className="section-edit-head">
        <GripVertical className="grip" aria-hidden="true"/>
        <input className="section-title" value={s.title} onChange={e => setSection(si, {title: e.target.value})} aria-label="Section title"/>
        <Tools label="section" onUp={() => update({...model, sections: move(model.sections, si, -1)})} onDown={() => update({...model, sections: move(model.sections, si, 1)})} onDelete={() => { if (confirmDelete(s.title)) update({...model, sections: model.sections.filter((_, k) => k !== si)}); }}/>
      </header>
      {s.items.map((it, ii) => <div className={'item item-' + it.kind} key={it.id}>
        <Item it={it} aiContext={ctx} onChange={next => setSection(si, {items: s.items.map((x, k) => (k === ii ? next : x))})}/>
        <Tools label="item" onUp={() => setSection(si, {items: move(s.items, ii, -1)})} onDown={() => setSection(si, {items: move(s.items, ii, 1)})} onDelete={() => setSection(si, {items: s.items.filter((_, k) => k !== ii)})}/>
      </div>)}
      <div className="add-row">
        <button className="add" onClick={() => setSection(si, {items: [...s.items, NEW.entry()]})}><Plus/>Role / degree</button>
        <button className="add" onClick={() => setSection(si, {items: [...s.items, NEW.bullets()]})}><Plus/>Bullets</button>
        <button className="add" onClick={() => setSection(si, {items: [...s.items, NEW.text()]})}><Plus/>Paragraph</button>
        <button className="add" onClick={() => setSection(si, {items: [...s.items, NEW.skill()]})}><Plus/>Skill line</button>
      </div>
    </section>)}
    <div className="add-section">
      <span>Add section</span>
      {SECTION_IDEAS.filter(x => !model.sections.some(s => s.title.toLowerCase() === x.toLowerCase())).map(x => <button key={x} className="chip" onClick={() => update({...model, sections: [...model.sections, {id: uid(), title: x, items: [x === 'Skills' ? NEW.skill() : x === 'Summary' ? NEW.text() : NEW.entry()]}]})}><Plus/>{x}</button>)}
      <button className="chip" onClick={() => update({...model, sections: [...model.sections, {id: uid(), title: 'New section', items: [NEW.text()]}]})}><Plus/>Custom</button>
    </div>
  </div>;
}

function confirmDelete(title) {
  return window.confirm('Delete the "' + (title || 'untitled') + '" section and everything in it?');
}
