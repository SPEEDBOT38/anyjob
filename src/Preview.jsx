import React from 'react';
import {FileText, ScanText, Check, Mail, Phone, Link2, MapPin, ExternalLink} from 'lucide-react';
import {parseCV, parseJob} from './structure';

function Items({items}) {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.type === 'bullet') {
      const list = [];
      while (i < items.length && items[i].type === 'bullet') list.push(items[i++].text);
      i--;
      out.push(<ul key={i}>{list.map((t, k) => <li key={k}>{t}</li>)}</ul>);
    } else if (it.type === 'entry') {
      out.push(<div className="doc-entry" key={i}><b>{it.title}</b>{it.date && <span>{it.date}</span>}</div>);
    } else if (it.type === 'subhead') {
      out.push(<h5 className="doc-subhead" key={i}>{it.text}</h5>);
    } else if (it.type === 'sub') {
      out.push(<div className="doc-sub" key={i}>{it.text}</div>);
    } else if (it.type === 'chips') {
      out.push(<div className="doc-chips" key={i}>{it.label && <em>{it.label}</em>}{it.chips.map((c, k) => <span key={k}>{c}</span>)}</div>);
    } else out.push(<p key={i}>{it.text}</p>);
  }
  return <>{out}</>;
}

const contactIcon = c => /@/.test(c) ? Mail : /^\+?\d[\d\s().-]{8,}$/.test(c) ? Phone : /https?:|www\.|linkedin|github|\.(com|io|dev|me|net|org)/i.test(c) ? Link2 : MapPin;

export function CVDocument({text}) {
  const cv = parseCV(text);
  return <article className="doc" aria-label="Extracted CV preview">
    {cv.name && <h3 className="doc-name">{cv.name}</h3>}
    {cv.headline && <p className="doc-headline">{cv.headline}</p>}
    {cv.contacts.length > 0 && <div className="doc-contacts">{cv.contacts.map((c, i) => {const Icon = contactIcon(c);return <span key={i}><Icon/>{c}</span>})}</div>}
    {cv.sections.map((s, i) => <section key={i}><h4>{s.title}</h4><Items items={s.items}/></section>)}
    {!cv.sections.length && <p className="doc-note">No section headings found, so the text is shown as written. Add headings such as Experience and Skills for a cleaner layout.</p>}
  </article>;
}

export function JobDocument({text, title, company, location, url}) {
  const job = parseJob(text);
  return <article className="doc job" aria-label="Job post preview">
    {(title || company) && <header className="doc-jobhead">{title && <h3 className="doc-name">{title}</h3>}<p className="doc-headline">{[company, location].filter(Boolean).join(' · ')}</p>{/^https?:\/\//i.test(url || '') && <a className="link" href={url} target="_blank" rel="noreferrer">Original posting <ExternalLink/></a>}</header>}
    {job.intro.length > 0 && <section><Items items={job.intro}/></section>}
    {job.sections.map((s, i) => <section key={i}><h4>{s.title}</h4><Items items={s.items}/></section>)}
  </article>;
}

function Stat({ok, children}) {return <span className={ok ? 'ok' : ''}>{ok && <Check/>}{children}</span>}

// Extracted text, shown as a document first, with the raw text one click away.
export function Extracted({kind, value, onChange, placeholder, label, meta}) {
  const cv = kind === 'cv';
  const parsed = cv ? parseCV(value) : parseJob(value);
  const hasText = !!value.trim();
  return <div className="extracted">
    {hasText ? <>
      <div className="extract-bar" role="status">
        <span className="extract-title">{cv ? <FileText/> : <ScanText/>}{cv ? 'CV read' : 'Job post read'}</span>
        <Stat ok>{parsed.stats.words} words</Stat>
        <Stat ok={parsed.stats.sections > 0}>{parsed.stats.sections} sections</Stat>
        {cv ? <><Stat ok={parsed.stats.email}>{parsed.stats.email ? 'Email found' : 'No email'}</Stat><Stat ok={parsed.stats.phone}>{parsed.stats.phone ? 'Phone found' : 'No phone'}</Stat></> : <Stat ok={parsed.stats.bullets > 0}>{parsed.stats.bullets} points</Stat>}
      </div>
      <div className="doc-frame">{cv ? <CVDocument text={value}/> : <JobDocument text={value} {...meta}/>}</div>
    </> : <p className="doc-empty">{cv ? 'Upload your CV above and it will appear here as a formatted document.' : 'Pick a job from Discover and it will appear here.'}</p>}
    <details className="raw"><summary>{hasText ? 'Fix the text' : 'Or paste the text'}</summary><label>{label}<textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/></label></details>
  </div>;
}

// On-screen paper for the chosen resume template: same structure as the exported PDF and LaTeX.
export function ResumePaper({text, template = 'Classic', mini = false}) {
  const cv = parseCV(text);
  const cls = 'rp rp-' + template.toLowerCase().replace(/\s+/g, '') + (mini ? ' mini' : '');
  return <article className={cls}>
    {cv.name && <h3 className="rp-name">{cv.name}</h3>}
    {cv.headline && <p className="rp-headline">{cv.headline}</p>}
    {cv.contacts.length > 0 && <p className="rp-contacts">{cv.contacts.join('  |  ')}</p>}
    {cv.extras.map((x, i) => <p key={i}>{x}</p>)}
    {cv.sections.map((s, i) => <section key={i}><h4>{s.title}</h4><Items items={s.items}/></section>)}
  </article>;
}
