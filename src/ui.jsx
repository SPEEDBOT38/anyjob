import React, {useEffect, useRef, useState} from 'react';
import {Upload, Loader2, FileText} from 'lucide-react';
import {readCV} from './documents';

export const go = path => { location.hash = '/' + path; };
export const link = (to, text, kind = 'link') => <a className={kind} href={'#/' + to}>{text}</a>;

export function Heading({title, children, actions}) {
  return <header className="page-head">
    <div><h1>{title}</h1>{children && <p>{children}</p>}</div>
    {actions && <div className="page-actions">{actions}</div>}
  </header>;
}

export function Ring({value, size = 'md', label}) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));
  const tone = v >= 70 ? 'good' : v >= 45 ? 'mid' : 'low';
  return <span className={'ring ring-' + size + ' ring-' + tone} style={{'--v': v}} role="img" aria-label={(label || 'Fit') + ' ' + v + '%'}><b>{v}<small>%</small></b></span>;
}

export function Empty({icon: Icon = FileText, title, children}) {
  return <div className="empty"><Icon/><h3>{title}</h3>{children}</div>;
}

export function Spinner({children}) {
  return <span className="spinner"><Loader2 className="spin"/>{children}</span>;
}

export function Tabs({value, onChange, items}) {
  return <div className="tabs" role="tablist">
    {items.map(([id, label, Icon, badge]) => <button key={id} role="tab" aria-selected={value === id} onClick={() => onChange(id)}>
      {Icon && <Icon/>}<span>{label}</span>{badge ? <small className="badge">{badge}</small> : null}
    </button>)}
  </div>;
}

export function FileDrop({onText, run, label = 'Upload your CV'}) {
  const [over, setOver] = useState(false);
  async function read(file) {
    if (file) await run('Reading ' + file.name, async () => onText(await readCV(file)));
  }
  return <label className={'drop' + (over ? ' over' : '')} onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={e => { e.preventDefault(); setOver(false); read(e.dataTransfer.files[0]); }}>
    <Upload/><span><b>{label}</b><small>PDF, Word (.docx) or text · drag and drop or tap to choose</small></span>
    <input type="file" aria-label={label} accept=".pdf,.docx,.txt" onChange={e => read(e.target.files[0])}/>
  </label>;
}

export function ago(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return days + ' days ago';
  if (days < 31) return Math.floor(days / 7) + (days < 14 ? ' week ago' : ' weeks ago');
  return d.toLocaleDateString(undefined, {day: 'numeric', month: 'short'});
}

// Run a callback a short while after the last change.
export function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => { const h = setTimeout(() => setV(value), ms); return () => clearTimeout(h); }, [value, ms]);
  return v;
}

export function useOnce(fn) {
  const done = useRef(false);
  useEffect(() => { if (!done.current) { done.current = true; fn(); } }, []);
}
