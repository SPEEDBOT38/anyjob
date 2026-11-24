import React, {useState, useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Feather, ArrowRight, FileText, House, Plus, BriefcaseBusiness, Layers, Settings as Cog, Search, LockKeyhole, Menu, X, ScanText, Sparkles, Target, Wand2, Code2, Compass, Loader2} from 'lucide-react';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import './style.css';
import {assess, defaults} from './engine';
import {tidyJob} from './structure';
import {TEMPLATES, normalizeTemplate} from './templates';
import {status as fetchStatus, ai, backend} from './api';
import {go, link} from './ui';
import {Application} from './Application';
import {Onboarding, Home, Discover, NewApplication, Applications, MyCv, Templates, Settings} from './pages';

const KEY = 'anyjob.sky.v1';
const NAV = [['home', 'Home', House], ['jobs', 'Find jobs', Search], ['applications', 'Applications', BriefcaseBusiness], ['cv', 'My CV', FileText], ['templates', 'Templates', Layers], ['settings', 'Settings', Cog]];
const STATUS_MAP = {Checked: 'Draft', Sent: 'Applied'};

function load() {
  let d = {};
  try { d = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { d = {}; }
  const prefs = {...defaults, ...(d.prefs || {})};
  prefs.template = normalizeTemplate(prefs.template);
  if (prefs.provider === 'Kilo' || prefs.provider === 'Gemini') prefs.provider = 'Auto';
  const records = (d.records || []).map(r => ({
    ...r,
    status: STATUS_MAP[r.status] || r.status || 'Draft',
    template: normalizeTemplate(r.template || prefs.template),
    accent: r.accent || prefs.accent,
    pageSize: r.pageSize || prefs.pageSize,
    draft: r.draft || r.cv,
    approved: !!r.approved,
    fit: r.fit || {rows: [], score: 0},
    aiFitPending: false,
  }));
  return {entered: false, master: '', ...d, prefs, records};
}
const path = () => location.hash.replace(/^#\/?/, '') || 'welcome';

function Brand() { return <a className="brand" href="#/welcome"><span className="logo-mark"><Feather/></span>AnyJob</a>; }

function Public({page, entered}) {
  const target = entered ? 'home' : 'onboarding';
  const [menu, setMenu] = useState(false);
  const links = <>{link('how', 'How it works')}{link('privacy', 'Privacy')}{link(target, entered ? 'Open app' : 'Get started', 'primary small')}</>;
  return <div className="public">
    <header className="sitebar"><Brand/><nav className="desktop-only">{links}</nav><button className="icon mobile-only" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Menu">{menu ? <X/> : <Menu/>}</button></header>
    {menu && <nav className="menulist">{links}</nav>}
    <main>{page === 'welcome' ? <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles/>AI that never invents your experience</span>
          <h1>Find the job. <em>Fit the resume.</em> Send it today.</h1>
          <p>Search live LinkedIn jobs by role and city, see exactly how your CV matches, tailor it with honest AI edits, and download a beautiful LaTeX resume.</p>
          <div className="row">{link(target, <>{entered ? 'Open your workspace' : 'Start free'}<ArrowRight/></>, 'primary big')}{link('how', 'See how it works', 'secondary big')}</div>
          <small className="trust"><LockKeyhole/>Your CV stays in your browser. No account needed.</small>
        </div>
        <div className="hero-art" aria-hidden="true">
          <img className="sheet s1" src="/assets/templates/awesome.jpg" alt=""/>
          <img className="sheet s2" src="/assets/templates/jake.jpg" alt=""/>
          <div className="float-card fc1"><Target/><b>86% fit</b><small>Frontend Developer · Bengaluru</small></div>
          <div className="float-card fc2"><Wand2/><b>3 edits accepted</b><small>Same facts, sharper wording</small></div>
        </div>
      </section>
      <section className="features">
        {[[Compass, 'Live jobs that match', 'LinkedIn, Remotive and Arbeitnow, filtered to your exact role and city.'], [ScanText, 'Honest fit check', 'Requirement-by-requirement evidence from your own CV, plus AI strengths and gaps.'], [Wand2, 'Tailor without lying', 'AI suggests sharper bullets and a summary. Every number must already be in your CV.'], [Code2, 'Real LaTeX resumes', "Jake's Resume, Awesome CV, Deedy, ModernCV, AltaCV and McDowell, compiled with TeX Live."]].map(([Icon, t, d]) => <article key={t}><Icon/><h3>{t}</h3><p>{d}</p></article>)}
      </section>
      <section className="showcase">
        <h2>Six proven templates, one click apart</h2>
        <div className="showcase-strip">{TEMPLATES.map(t => <figure key={t.id}><img src={'/assets/templates/' + t.id + '.jpg'} alt={t.name} loading="lazy"/><figcaption><b>{t.name}</b><span>{t.bestFor[0]}</span></figcaption></figure>)}</div>
      </section>
      <Steps/>
    </> : page === 'how' ? <section className="reading"><h1>How AnyJob works</h1><Steps/><p>{link(target, 'Get started', 'primary')}</p></section> : <section className="reading">
      <h1>Privacy and trust</h1>
      <h2>Your documents</h2><p>Your CV, applications and cover letters are saved in this browser only (local storage). Clearing site data or using Settings → Erase everything removes them.</p>
      <h2>When data leaves your browser</h2><p>Job searches send only the role and location you pick. AI buttons send your CV and the job post to the Kilo AI gateway to produce that one answer. Compiling a PDF sends the LaTeX source of your resume to a public TeX Live service (latex.ytotech.com, or texlive.net as a backup). You can turn AI off in Settings.</p>
      <h2>Truth guard</h2><p>AI suggestions may only rephrase what your CV says. Rewrites that introduce numbers not found in your CV are dropped, and nothing changes until you accept it. You confirm the final resume before downloading.</p>
      <p>{link(target, 'Open app', 'primary')}</p>
    </section>}</main>
    <footer className="sitefoot"><Brand/><span>AI does the fuzzy jobs. Code does the exact jobs. You decide.</span>{link('privacy', 'Privacy')}</footer>
  </div>;
}

function Steps() {
  return <section className="steps">{[[Search, '1. Find a job', 'Pick a role and a city from the lists, or paste any job post.'], [Target, '2. Check your fit', 'See which requirements your CV proves and which it misses.'], [Wand2, '3. Tailor honestly', 'Accept or skip each AI edit. Edit anything yourself.'], [FileText, '4. Design & download', 'Choose a LaTeX template, preview the exact PDF, download PDF, Word or LaTeX.']].map(([Icon, t, d]) => <article key={t}><Icon/><h3>{t}</h3><p>{d}</p></article>)}</section>;
}

function App() {
  const [db, setDb] = useState(load);
  const live = useRef(db);
  const [url, setUrl] = useState(path);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [services, setServices] = useState({kilo: false, apify: false});
  const [lastSearch, setLastSearch] = useState(null);
  const [draftJob, setDraftJob] = useState(null);
  const [menu, setMenu] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => { fetchStatus().then(setServices); }, []);
  useEffect(() => {
    const route = () => { setUrl(path()); setMenu(false); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', route);
    return () => window.removeEventListener('hashchange', route);
  }, []);
  useEffect(() => { if (!message) return; const h = setTimeout(() => setMessage(''), 7000); return () => clearTimeout(h); }, [message]);

  function persist(changes) {
    const next = {...live.current, ...changes};
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { setMessage('Your browser storage is full; recent changes may not be saved.'); }
    live.current = next;
    setDb(next);
  }
  const updatePrefs = p => persist({prefs: {...live.current.prefs, ...p}});
  const changeById = (id, changes) => persist({records: live.current.records.map(x => (x.id === id ? {...x, ...changes} : x))});
  const changeRecord = (r, changes) => changeById(r.id, changes);
  const removeRecord = r => persist({records: live.current.records.filter(x => x.id !== r.id)});
  async function run(label, fn) {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(label); setMessage('');
    try { await fn(); } catch (e) { setMessage(e.message || 'Something went wrong. Try again.'); } finally { setBusy(''); inFlight.current = false; }
  }
  const prefs = db.prefs;
  const aiOn = services.kilo && prefs.provider !== 'Local';

  function createRecord({cv, jd, title, company, location, url: jobUrl}) {
    let fit;
    try { fit = assess(cv, jd); } catch { fit = {rows: [], score: 0}; }
    const firstLine = jd.split('\n').find(l => l.trim()) || 'New application';
    const r = {id: crypto.randomUUID(), title: [title || firstLine.slice(0, 70), company].filter(Boolean).join(' · '), role: title || '', company: company || '', location: location || '', url: jobUrl || '', cv, jd, draft: cv, fit, status: 'Draft', date: new Date().toISOString(), template: live.current.prefs.template, accent: live.current.prefs.accent, pageSize: live.current.prefs.pageSize, approved: false, aiFitPending: aiOn};
    persist({entered: true, records: [r, ...live.current.records]});
    setDraftJob(null);
    go('application/' + r.id + '/fit');
    if (aiOn) ai('fit', {cv, jd}).then(aiFit => changeById(r.id, {aiFit, aiFitPending: false})).catch(() => changeById(r.id, {aiFitPending: false}));
  }
  function startFromJob(j) {
    const jd = tidyJob(j.description || '');
    if (live.current.master && jd.length > 40) createRecord({cv: live.current.master, jd, title: j.title, company: j.company, location: j.location, url: j.source_url});
    else { setDraftJob(j); go('new'); if (!live.current.master) setMessage('Add your CV to start this application.'); }
  }

  const ctx = {db, prefs, persist, updatePrefs, changeRecord, removeRecord, createRecord, startFromJob, run, notify: setMessage, services, aiOn, backend, lastSearch, setLastSearch, draftJob};
  const [page, id, tab] = url.split('/');
  useEffect(() => { document.title = ({welcome: 'Find the job, fit the resume', jobs: 'Find jobs', cv: 'My CV'}[page] || (page || '').replace(/^./, c => c.toUpperCase())) + ' · AnyJob'; }, [page]);

  if (['welcome', 'how', 'privacy'].includes(page)) return <Public page={page} entered={db.entered}/>;
  const record = db.records.find(x => x.id === id);
  let screen;
  switch (page) {
    case 'onboarding': screen = <Onboarding ctx={ctx}/>; break;
    case 'home': screen = <Home ctx={ctx}/>; break;
    case 'jobs': case 'discover': screen = <Discover ctx={ctx}/>; break;
    case 'new': screen = <NewApplication key={draftJob ? draftJob.id : 'new'} ctx={ctx}/>; break;
    case 'applications': screen = <Applications ctx={ctx}/>; break;
    case 'application': screen = record ? <Application key={record.id} r={record} tab={tab} ctx={ctx}/> : <Missing/>; break;
    case 'cv': case 'resumes': screen = <MyCv ctx={ctx}/>; break;
    case 'templates': screen = <Templates ctx={ctx}/>; break;
    case 'settings': screen = <Settings ctx={ctx}/>; break;
    default: screen = <Missing/>;
  }
  const current = page === 'application' ? 'applications' : page === 'discover' ? 'jobs' : page === 'resumes' ? 'cv' : page;
  const navItem = ([p, t, Icon]) => <a key={p} href={'#/' + p} aria-current={current === p ? 'page' : undefined}><Icon/><span>{t}</span>{p === 'applications' && db.records.length > 0 && <small>{db.records.length}</small>}</a>;
  return <div className={'workspace page-' + page}>
    <aside className="rail">
      <Brand/>
      <a className="primary new-btn" href="#/new"><Plus/>New application</a>
      <nav>{NAV.map(navItem)}</nav>
      <div className="rail-status">
        <span className={aiOn ? 'on' : ''}><Sparkles/>AI {aiOn ? 'ready' : 'off'}</span>
        <span className={services.apify ? 'on' : ''}><Search/>LinkedIn {services.apify ? 'ready' : 'off'}</span>
      </div>
    </aside>
    <header className="topbar mobile-only"><Brand/><button className="icon" onClick={() => setMenu(true)} aria-label="More"><Menu/></button></header>
    <main className="canvas">{screen}</main>
    <nav className="bottom mobile-only">
      {[NAV[0], NAV[1]].map(navItem)}
      <a href="#/new" className="fab" aria-label="New application"><Plus/></a>
      {[NAV[2], NAV[3]].map(navItem)}
    </nav>
    {menu && <div className="sheet-menu" onClick={e => { if (e.target === e.currentTarget) setMenu(false); }}><nav><button className="icon" onClick={() => setMenu(false)} aria-label="Close"><X/></button>{NAV.map(navItem)}{link('privacy', 'Privacy and trust')}</nav></div>}
    {(busy || message) && <div role="status" className="toast">{busy ? <><Loader2 className="spin"/>{busy}…</> : message}{!busy && <button className="icon" aria-label="Dismiss" onClick={() => setMessage('')}><X/></button>}</div>}
  </div>;
}

function Missing() {
  return <div className="empty"><Compass/><h3>Page not found</h3><p>This link may belong to another browser.</p>{link('home', 'Go home', 'primary')}</div>;
}

createRoot(document.getElementById('root')).render(<App/>);
