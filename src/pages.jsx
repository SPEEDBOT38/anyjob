import React, {useState} from 'react';
import {Search, MapPin, Building2, Clock, ExternalLink, Sparkles, ArrowRight, Plus, BriefcaseBusiness, FileText, Layers, Target, Trash2, Download, Upload, ShieldCheck, Wallet, Users, ChevronDown, ChevronUp, Compass, Star, CircleCheck, Wand2, Gauge, Send, Award} from 'lucide-react';
import {Heading, Ring, Empty, Spinner, FileDrop, go, link, ago} from './ui';
import {RolePicker, LocationPicker, locationQuery} from './Pick';
import {suggestRole, findLocation} from './data';
import {searchJobs, ai, download} from './api';
import {Extracted, JobDocument} from './Preview';
import {tidyJob} from './structure';
import {statuses} from './engine';
import {TEMPLATES, ACCENTS, templateById} from './templates';
import {CvEditor} from './CvEditor';
import {LivePreview} from './ResumeTools';

const hello = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

export function Onboarding({ctx}) {
  const [master, setMaster] = useState(ctx.db.master || '');
  const [role, setRole] = useState(ctx.prefs.role || 'Software Engineer');
  const [area, setArea] = useState(findLocation(ctx.prefs.location) ? ctx.prefs.location : '');
  return <>
    <Heading title="Set up your workspace">Three quick choices. You can change all of them later.</Heading>
    <div className="onboard">
      <section className="panel step"><span className="num">1</span><div>
        <h2>Your CV</h2><p>Upload it once. It stays in this browser.</p>
        <FileDrop run={ctx.run} onText={t => { setMaster(t); const g = suggestRole(t); if (g) setRole(g); }}/>
        <Extracted kind="cv" value={master} onChange={setMaster} label="CV text" placeholder="…or paste your CV text"/>
      </div></section>
      <section className="panel step"><span className="num">2</span><div>
        <h2>What are you looking for?</h2>
        <div className="grid2 tight"><RolePicker label="Target role" value={role} onChange={setRole}/><LocationPicker label="Where" value={area} onChange={setArea}/></div>
      </div></section>
      <section className="panel step"><span className="num">3</span><div>
        <h2>Pick a resume style</h2><p>Six proven LaTeX templates. Jake's Resume is the safest default for online applications.</p>
        <div className="mini-templates">{TEMPLATES.map(t => <button key={t.id} className={'tpl small' + (ctx.prefs.template === t.id ? ' on' : '')} onClick={() => ctx.updatePrefs({template: t.id})}><img src={'/assets/templates/' + t.id + '.jpg'} alt=""/><span><b>{t.name}</b><small>{t.bestFor[0]}</small></span></button>)}</div>
      </div></section>
    </div>
    <div className="row end">
      <button className="primary big" onClick={() => { ctx.persist({entered: true, master: master.trim(), prefs: {...ctx.prefs, role, location: area}}); go('jobs'); }}>Find jobs<ArrowRight/></button>
    </div>
  </>;
}

export function Home({ctx}) {
  const recs = ctx.db.records;
  const count = s => recs.filter(r => r.status === s).length;
  const avg = recs.length ? Math.round(recs.reduce((n, r) => n + (r.aiFit ? r.aiFit.score : r.fit.score), 0) / recs.length) : 0;
  return <>
    <Heading title={hello()} actions={<a className="primary" href="#/new"><Plus/>New application</a>}>Here is where your job search stands.</Heading>
    <div className="kpis">
      <div className="kpi"><BriefcaseBusiness/><b>{recs.length}</b><span>Applications</span></div>
      <div className="kpi"><Send/><b>{count('Applied')}</b><span>Applied</span></div>
      <div className="kpi"><Users/><b>{count('Interview')}</b><span>Interviews</span></div>
      <div className="kpi"><Gauge/><b>{avg}%</b><span>Average fit</span></div>
    </div>
    <div className="grid-main">
      <section>
        <div className="row between"><h2>Continue where you left off</h2>{link('applications', 'All applications')}</div>
        {recs.length ? <div className="cards">{recs.slice(0, 4).map(r => <RecordCard key={r.id} r={r}/>)}</div> : <Empty icon={Compass} title="No applications yet">Find a job or paste a job post to start. {link('jobs', 'Find jobs')}</Empty>}
      </section>
      <aside className="stack">
        <a className="cta-card" href="#/jobs"><Search/><div><b>Jobs for you</b><span>{ctx.prefs.role || 'Pick a role'}{ctx.prefs.location ? ' · ' + (findLocation(ctx.prefs.location) || {label: ''}).label : ''}</span></div><ArrowRight/></a>
        <div className="panel checklist">
          <h3>Your setup</h3>
          {[['cv', 'Master CV saved', !!ctx.db.master], ['templates', 'Template: ' + templateById(ctx.prefs.template).name, true], ['settings', ctx.aiOn ? 'AI assistant ready' : 'AI assistant off', ctx.aiOn], ['jobs', ctx.services.apify ? 'LinkedIn search ready' : 'LinkedIn search needs a token', !!ctx.services.apify]].map(([p, t, ok]) => <a key={p} href={'#/' + p} className={ok ? 'ok' : ''}>{ok ? <CircleCheck/> : <Target/>}{t}</a>)}
        </div>
      </aside>
    </div>
  </>;
}

export function RecordCard({r}) {
  return <a className="record-card" href={'#/application/' + r.id + '/' + (r.approved ? 'export' : r.aiTailor ? 'resume' : 'fit')}>
    <Ring value={r.aiFit ? r.aiFit.score : r.fit.score} size="sm"/>
    <span className="grow"><b>{r.role || r.title}</b><small>{[r.company, r.location].filter(Boolean).join(' · ') || 'Added ' + ago(r.date)}</small></span>
    <span className={'status s-' + r.status.toLowerCase()}>{r.status}</span>
  </a>;
}

function JobCard({j, ctx, open, onToggle}) {
  return <article className={'job-card' + (open ? ' open' : '')}>
    <div className="job-top">
      <div className="logo">{(j.company || '?').slice(0, 1).toUpperCase()}</div>
      <div className="grow">
        <h3>{j.title}</h3>
        <p className="job-meta"><span><Building2/>{j.company || 'Company'}</span><span><MapPin/>{j.location || '—'}</span>{j.posted_date && <span><Clock/>{ago(j.posted_date)}</span>}</p>
      </div>
      <span className={'match ' + (j.match === 'exact' ? 'exact' : 'similar')}>{j.match === 'exact' ? 'Exact title' : 'Similar title'}</span>
    </div>
    <div className="job-tags">
      <span className="tag">{j.via || j.source}</span>
      {j.salary && <span className="tag good"><Wallet/>{j.salary}</span>}
      {j.level && <span className="tag">{j.level}</span>}
      {j.type && <span className="tag">{j.type}</span>}
      {j.applicants && <span className="tag"><Users/>{j.applicants}</span>}
    </div>
    {open && <div className="job-body"><JobDocument text={tidyJob(j.description || '')}/></div>}
    <div className="job-actions">
      <button className="ghost small" onClick={onToggle}>{open ? <><ChevronUp/>Hide details</> : <><ChevronDown/>Read the post</>}</button>
      {/^https?:\/\//.test(j.source_url || '') && <a className="ghost small" href={j.source_url} target="_blank" rel="noreferrer"><ExternalLink/>Original</a>}
      <span className="grow"/>
      <button className="primary small" onClick={() => ctx.startFromJob(j)}><Sparkles/>Tailor my CV</button>
    </div>
  </article>;
}

export function Discover({ctx}) {
  const [role, setRole] = useState(ctx.prefs.role || 'Software Engineer');
  const [area, setArea] = useState(findLocation(ctx.prefs.location) ? ctx.prefs.location : '');
  const [res, setRes] = useState(ctx.lastSearch || null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState('all');
  async function search() {
    setBusy(true); setErr('');
    ctx.updatePrefs({role, location: area});
    try {
      const data = await searchJobs(role, locationQuery(area));
      setRes(data); ctx.setLastSearch(data);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  const jobs = (res && res.jobs || []).filter(j => filter === 'all' || j.match === filter);
  return <>
    <Heading title="Find jobs">Live openings from LinkedIn, Remotive and Arbeitnow. Only jobs with your role in the title, in your chosen place.</Heading>
    <section className="panel search-panel">
      <RolePicker label="Job role" value={role} onChange={setRole}/>
      <LocationPicker label="Location" value={area} onChange={setArea}/>
      <button className="primary big" onClick={search} disabled={busy}>{busy ? <Spinner>Searching…</Spinner> : <><Search/>Search jobs</>}</button>
    </section>
    {!ctx.services.apify && <p className="notice-inline"><ShieldCheck/>LinkedIn search is off until the site owner adds an Apify token. Remote and German jobs still work.</p>}
    {err && <p className="error">{err}</p>}
    {busy && <div className="skeletons">{[0, 1, 2].map(i => <div className="job-card skeleton" key={i}><span/><span/><span/></div>)}<p className="hint center">Searching LinkedIn and job boards. This takes about 20 seconds.</p></div>}
    {!busy && res && <>
      <div className="row between wrap results-head">
        <p><b>{res.count}</b> {res.count === 1 ? 'job' : 'jobs'} · {res.role} · {res.location}<small> · {res.source}</small></p>
        <div className="seg">{[['all', 'All'], ['exact', 'Exact title'], ['similar', 'Similar']].map(([id, l]) => <button key={id} className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>{l}</button>)}</div>
      </div>
      {!res.count && <Empty icon={Search} title="No matching openings">{res.note}</Empty>}
      <div className="job-list">{jobs.map(j => <JobCard key={j.id} j={j} ctx={ctx} open={open === j.id} onToggle={() => setOpen(open === j.id ? null : j.id)}/>)}</div>
    </>}
    {!busy && !res && <Empty icon={Compass} title="Pick a role and a place">Then press Search. You can also {link('new', 'paste any job post')}.</Empty>}
  </>;
}

export function NewApplication({ctx}) {
  const [cv, setCv] = useState(ctx.db.master || '');
  const [jd, setJd] = useState(ctx.draftJob ? tidyJob(ctx.draftJob.description || '') : '');
  const [title, setTitle] = useState(ctx.draftJob ? ctx.draftJob.title : '');
  const [company, setCompany] = useState(ctx.draftJob ? ctx.draftJob.company : '');
  return <>
    <Heading title="New application">Your CV and the job post. AnyJob checks the fit, then helps you tailor and design the resume.</Heading>
    <div className="grid2">
      <section className="panel">
        <h2><FileText/>Your CV</h2>
        {ctx.db.master && cv !== ctx.db.master && <button className="secondary small" onClick={() => setCv(ctx.db.master)}>Use my saved CV</button>}
        <FileDrop run={ctx.run} onText={setCv}/>
        <Extracted kind="cv" value={cv} onChange={setCv} label="CV text" placeholder="Paste your CV text…"/>
      </section>
      <section className="panel">
        <h2><BriefcaseBusiness/>The job</h2>
        <div className="grid2 tight">
          <label>Job title<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Frontend Developer"/></label>
          <label>Company<input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme"/></label>
        </div>
        <Extracted kind="job" value={jd} onChange={setJd} label="Job description" placeholder="Paste the responsibilities and requirements…" meta={{title, company}}/>
        {link('jobs', 'Or find a job')}
      </section>
    </div>
    <div className="row end"><button className="primary big" onClick={() => ctx.run('Checking your fit', async () => {
      if (cv.trim().length < 40) throw Error('Add your CV first (upload or paste).');
      if (jd.trim().length < 40) throw Error('Add the job description.');
      ctx.createRecord({cv: cv.trim(), jd: jd.trim(), title: title.trim(), company: company.trim(), ...(ctx.draftJob && tidyJob(ctx.draftJob.description || '') === jd ? {location: ctx.draftJob.location, url: ctx.draftJob.source_url} : {})});
    })}><Target/>Check my fit</button></div>
  </>;
}

export function Applications({ctx}) {
  const [filter, setFilter] = useState('All');
  const list = ctx.db.records.filter(r => filter === 'All' || r.status === filter);
  return <>
    <Heading title="Applications" actions={<a className="primary" href="#/new"><Plus/>New</a>}>Every job you are working on, with the resume you made for it.</Heading>
    <div className="chips">{['All', ...statuses].map(s => <button key={s} className={'chip' + (filter === s ? ' on' : '')} onClick={() => setFilter(s)}>{s}<small>{ctx.db.records.filter(r => s === 'All' || r.status === s).length}</small></button>)}</div>
    {list.length ? <div className="cards">{list.map(r => <RecordCard key={r.id} r={r}/>)}</div> : <Empty icon={BriefcaseBusiness} title={filter === 'All' ? 'No applications yet' : 'Nothing at this stage'}>{link('jobs', 'Find a job')} or {link('new', 'paste one')}.</Empty>}
  </>;
}

export function MyCv({ctx}) {
  const [text, setText] = useState(ctx.db.master || '');
  const [view, setView] = useState('edit');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const dirty = text !== (ctx.db.master || '');
  async function tidy() {
    setBusy(true); setMsg('');
    try { const out = await ai('clean', {cv: text}); setText(out.cv); setMsg('Tidied: ' + out.kept + '% of your words kept exactly. Check it, then Save.'); } catch (e) { setMsg(e.message); }
    setBusy(false);
  }
  return <>
    <Heading title="My CV" actions={<><button className="secondary" onClick={tidy} disabled={busy || !text.trim() || !ctx.aiOn}>{busy ? <Spinner>Tidying…</Spinner> : <><Wand2/>Fix formatting (AI)</>}</button><button className="primary" disabled={!dirty} onClick={() => { ctx.persist({master: text.trim()}); ctx.notify('Master CV saved.'); }}>Save CV</button></>}>
      Your master CV. Every new application starts from a copy of it.
    </Heading>
    {msg && <p className="notice-inline">{msg}</p>}
    {!text.trim() ? <div className="panel"><FileDrop run={ctx.run} onText={setText}/><Extracted kind="cv" value={text} onChange={setText} label="CV text" placeholder="…or paste your CV text"/></div> : <>
      <div className="row between wrap">
        <FileDrop run={ctx.run} onText={setText} label="Replace with a new file"/>
        <div className="seg mobile-only"><button className={view === 'edit' ? 'on' : ''} onClick={() => setView('edit')}>Edit</button><button className={view === 'preview' ? 'on' : ''} onClick={() => setView('preview')}>Preview</button></div>
      </div>
      <div className={'editor-split show-' + view}>
        <div className="editor-col"><CvEditor text={text} onText={setText}/></div>
        <div className="preview-col"><LivePreview text={text} template={ctx.prefs.template} accent={ctx.prefs.accent} pageSize={ctx.prefs.pageSize}/></div>
      </div>
      <details className="panel"><summary>Edit as plain text</summary><textarea className="plain-cv" value={text} onChange={e => setText(e.target.value)} aria-label="CV as plain text"/></details>
    </>}
  </>;
}

export function Templates({ctx}) {
  const [preview, setPreview] = useState(null);
  const sample = ctx.db.master || SAMPLE;
  return <>
    <Heading title="Resume templates">Six open-source LaTeX templates, compiled on a real TeX Live server. Pick the one that suits the job.</Heading>
    <div className="template-grid">
      {TEMPLATES.map(t => <article key={t.id} className={'template-card' + (ctx.prefs.template === t.id ? ' on' : '')}>
        <button className="thumb" onClick={() => setPreview(t.id)} aria-label={'Preview ' + t.name + ' with your CV'}><img src={'/assets/templates/' + t.id + '.jpg'} alt={t.name + ' example'} loading="lazy"/></button>
        <div className="template-info">
          <div className="row between"><h2>{t.name}</h2>{ctx.prefs.template === t.id && <span className="tag good"><Star/>Default</span>}</div>
          <p>{t.blurb}</p>
          <div className="kw">{t.bestFor.map(b => <span key={b} className="tag">{b}</span>)}</div>
          <dl className="facts"><div><dt>ATS</dt><dd>{t.ats}</dd></div><div><dt>Columns</dt><dd>{t.columns}</dd></div><div><dt>Engine</dt><dd>{t.engine === 'xelatex' ? 'XeLaTeX' : 'pdfLaTeX'}</dd></div></dl>
          <p className="credit">By {t.author} · <a href={t.repo} target="_blank" rel="noreferrer">source</a> · {t.license}</p>
          <div className="row">
            <button className="secondary small" onClick={() => setPreview(t.id)}>Preview with my CV</button>
            {ctx.prefs.template !== t.id && <button className="primary small" onClick={() => ctx.updatePrefs({template: t.id})}>Make default</button>}
          </div>
        </div>
      </article>)}
    </div>
    {preview && <div className="modal" role="dialog" aria-modal="true" aria-label="Template preview" onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}>
      <div className="modal-box">
        <div className="row between"><h2>{templateById(preview).name}</h2><div className="row"><button className="primary small" onClick={() => { ctx.updatePrefs({template: preview}); setPreview(null); }}>Use this template</button><button className="ghost small" onClick={() => setPreview(null)}>Close</button></div></div>
        <LivePreview text={sample} template={preview} accent={ctx.prefs.accent} pageSize={ctx.prefs.pageSize}/>
      </div>
    </div>}
  </>;
}

export function Settings({ctx}) {
  const p = ctx.prefs;
  function exportData() { download(new Blob([JSON.stringify(ctx.db, null, 2)], {type: 'application/json'}), 'anyjob-backup.json'); }
  function importData(file) {
    if (!file) return;
    file.text().then(t => { const d = JSON.parse(t); if (!d || !Array.isArray(d.records)) throw Error(); ctx.persist(d); ctx.notify('Backup restored.'); }).catch(() => ctx.notify('That file is not an AnyJob backup.'));
  }
  return <>
    <Heading title="Settings">How AnyJob works for you. Everything is saved in this browser.</Heading>
    <div className="grid2">
      <section className="panel">
        <h2><Sparkles/>AI assistant</h2>
        <p>Server AI: <b className={ctx.services.kilo ? 'good-text' : 'warn-text'}>{ctx.services.kilo ? 'ready' : 'not configured'}</b>. It sends your CV and the job post to the Kilo AI gateway when you press an AI button, and never adds facts your CV does not contain.</p>
        <label className="check"><input type="checkbox" checked={p.provider !== 'Local'} onChange={e => ctx.updatePrefs({provider: e.target.checked ? 'Auto' : 'Local'})}/>Use AI features</label>
        <label>Writing tone<select value={p.tone} onChange={e => ctx.updatePrefs({tone: e.target.value})}>{['Concise', 'Balanced', 'Bold'].map(x => <option key={x}>{x}</option>)}</select></label>
      </section>
      <section className="panel">
        <h2><Layers/>Resume defaults</h2>
        <label>Template<select value={p.template} onChange={e => ctx.updatePrefs({template: e.target.value})}>{TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <label>Accent colour<select value={p.accent} onChange={e => ctx.updatePrefs({accent: e.target.value})}>{ACCENTS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}</select></label>
        <label>Page size<select value={p.pageSize} onChange={e => ctx.updatePrefs({pageSize: e.target.value})}><option>A4</option><option>Letter</option></select></label>
      </section>
      <section className="panel">
        <h2><Search/>Job search</h2>
        <p>LinkedIn search: <b className={ctx.services.apify ? 'good-text' : 'warn-text'}>{ctx.services.apify ? 'ready' : 'needs an Apify token on the server'}</b>.</p>
        <RolePicker label="Default role" value={p.role || 'Software Engineer'} onChange={v => ctx.updatePrefs({role: v})}/>
        <LocationPicker label="Default location" value={p.location || ''} onChange={v => ctx.updatePrefs({location: v})}/>
      </section>
      <section className="panel">
        <h2><ShieldCheck/>Your data</h2>
        <p>{ctx.db.records.length} applications and your CV are stored only in this browser.</p>
        <div className="row wrap">
          <button className="secondary small" onClick={exportData}><Download/>Download backup</button>
          <label className="secondary small file-btn"><Upload/>Restore backup<input type="file" accept="application/json" onChange={e => importData(e.target.files[0])}/></label>
          <button className="ghost small danger" onClick={() => { if (window.confirm('Delete your CV and all applications from this browser?')) { localStorage.removeItem('anyjob.sky.v1'); location.hash = '/welcome'; location.reload(); } }}><Trash2/>Erase everything</button>
        </div>
      </section>
    </div>
  </>;
}

export const SAMPLE = 'Alex Morgan\nProduct Designer\nalex.morgan@email.com | +44 7700 900123 | linkedin.com/in/alexmorgan | London, UK\n\nSummary\nProduct designer with six years of experience shipping accessible mobile products.\n\nExperience\nProduct Designer, North Studio  Jan 2021 - Present\nLead Designer, Mobile\n- Designed accessible mobile interfaces used by 400k people.\n- Led usability research for account setup, cutting drop-off by 18%.\nUX Designer, Brightside  Jun 2018 - Dec 2020\nLondon, UK\n- Redesigned onboarding, raising activation by 12%.\n- Built the first design system with 40 components.\n\nEducation\nBSc Design, University of Leeds  2014 - 2017\n\nSkills\nDesign: Figma, prototyping, user research, accessibility\nTools: HTML, CSS, SQL';
