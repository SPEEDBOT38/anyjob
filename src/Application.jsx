import React, {useMemo, useState} from 'react';
import {ArrowLeft, ArrowRight, Sparkles, Target, Wand2, PenLine, Mail, Download, Check, X, Trash2, ExternalLink, ShieldCheck, FileText, FileArchive, Code2, Type, Lightbulb, CircleCheck, AlertTriangle, Copy, ListChecks, Eye} from 'lucide-react';
import {Heading, Ring, Tabs, Spinner, go, link} from './ui';
import {statuses, tailor, assess} from './engine';
import {ai, compileLatex, download, safeName} from './api';
import {generateLatex, templateById, cvModel} from './templates';
import {CvEditor} from './CvEditor';
import {LatexStudio, downloadProject} from './LatexEditor';
import {TemplatePicker, LivePreview} from './ResumeTools';
import {JobDocument} from './Preview';
import {replaceBullet, setSummary, setHeadline} from './cvText';
import {builtinPDF, wordFile, letterFile} from './documents';

const TABS = [['fit', 'Fit', Target], ['tailor', 'Tailor', Wand2], ['resume', 'Resume', PenLine], ['letter', 'Cover letter', Mail], ['export', 'Export', Download]];

function AiNeeded({ctx}) {
  if (ctx.aiOn) return null;
  return <p className="hint">{ctx.services.kilo ? 'AI is switched off in Settings (local only).' : 'AI is not configured on the server yet.'} {link('settings', 'Settings')}</p>;
}

function Fit({r: rec, ctx, save}) {
  // Keyword coverage follows the current draft, so tailoring edits show up here.
  const fit = useMemo(() => { try { return assess(rec.draft || rec.cv, rec.jd); } catch { return rec.fit; } }, [rec.draft, rec.jd]);
  const r = {...rec, fit};
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function analyse() {
    setBusy(true); setErr('');
    try { save({aiFit: await ai('fit', {cv: r.draft || r.cv, jd: r.jd})}); } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  const f = r.aiFit;
  return <div className="stack">
    <section className="panel hero-fit">
      <div className="fit-scores">
        <div><Ring value={r.fit.score} size="lg" label="Keyword coverage"/><small>Keyword coverage</small></div>
        {f && <div><Ring value={f.score} size="lg" label="AI fit"/><small>AI fit score</small></div>}
      </div>
      <div className="fit-copy">
        <h2>{f ? f.verdict : 'How well does your CV match?'}</h2>
        <p>{f ? 'Based only on what your CV says. Use the gaps to decide what to emphasise; never claim experience you do not have.' : 'Keyword coverage is computed on your device. The AI analysis reads the whole post and your CV and explains strengths and gaps.'}</p>
        <div className="row">
          <button className="primary" onClick={analyse} disabled={busy || r.aiFitPending || !ctx.aiOn}>{busy || r.aiFitPending ? <Spinner>Analysing… (about 15s)</Spinner> : <><Sparkles/>{f ? 'Analyse again' : 'Analyse with AI'}</>}</button>
          <button className="secondary" onClick={() => go('application/' + r.id + '/tailor')}>Tailor my CV<ArrowRight/></button>
        </div>
        {err && <p className="error">{err}</p>}
        <AiNeeded ctx={ctx}/>
      </div>
    </section>
    {f && <div className="grid2">
      <section className="panel">
        <h3 className="good-h"><CircleCheck/>Strengths</h3>
        {f.strengths.length ? <ul className="evidence">{f.strengths.map((s, i) => <li key={i}><b>{s.requirement}</b>{s.evidence && <q>{s.evidence}</q>}</li>)}</ul> : <p className="hint">No clear matches found.</p>}
      </section>
      <section className="panel">
        <h3 className="warn-h"><AlertTriangle/>Gaps</h3>
        {f.gaps.length ? <ul className="evidence">{f.gaps.map((s, i) => <li key={i}><b>{s.requirement}</b><span>{s.advice}</span></li>)}</ul> : <p className="hint">No major gaps found.</p>}
      </section>
      <section className="panel">
        <h3>Keywords</h3>
        <div className="kw">{f.keywords.map(k => <span key={k} className="tag good"><Check/>{k}</span>)}{f.missing_keywords.map(k => <span key={k} className="tag warn">{k}</span>)}</div>
        <p className="hint">Green: already in your CV. Amber: in the job post but not your CV. Add them only if they are true for you.</p>
      </section>
      {f.questions.length > 0 && <section className="panel">
        <h3><Lightbulb/>Worth adding, if true</h3>
        <ul className="plain">{f.questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
      </section>}
    </div>}
    <section className="panel">
      <h3>Requirement by requirement</h3>
      <div className="req-table">{r.fit.rows.slice(0, 40).map((row, i) => <div key={i} className={'req ' + (row.words.length ? 'hit' : 'miss')}>
        <span className="req-q">{row.requirement}</span>
        <span className="req-a">{row.evidence ? <><Check/>{row.evidence}</> : <><X/>No matching words in your CV</>}</span>
      </div>)}</div>
    </section>
  </div>;
}

function Tailor({r, ctx, save}) {
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const t = r.aiTailor;
  const accepted = r.accepted || {};
  async function suggest() {
    setBusy('ai'); setErr('');
    try { save({aiTailor: await ai('tailor', {cv: r.draft, jd: r.jd, tone: ctx.prefs.tone}), accepted: {}}); } catch (e) { setErr(e.message); }
    setBusy('');
  }
  async function reorder() {
    setBusy('order'); setErr('');
    try {
      const draft = await tailor({cv: r.draft, jd: r.jd}, ctx.prefs, '', ctx.aiOn ? 'Kilo' : 'Local', ctx.backend);
      save({draft, tex: null});
      ctx.notify(draft === r.draft ? 'Your bullets are already in the best order.' : 'Bullets reordered: the most relevant now come first in each role.');
    } catch (e) { setErr(e.message); }
    setBusy('');
  }
  function accept(key, fn) { save({draft: fn(r.draft), tex: null, accepted: {...accepted, [key]: 'yes'}}); }
  function skip(key) { save({accepted: {...accepted, [key]: 'no'}}); }
  const bulletKeys = t ? t.bullets.map((_, i) => 'b' + i) : [];
  const pending = t ? [t.headline && !accepted.h, t.summary && !accepted.s, ...bulletKeys.map(k => !accepted[k])].filter(Boolean).length : 0;
  return <div className="stack">
    <section className="panel">
      <div className="row between">
        <div><h2>Tailor your CV to this job</h2><p>AI proposes edits. Each one keeps your facts and numbers; nothing is applied until you accept it.</p></div>
        <div className="row">
          <button className="secondary" onClick={reorder} disabled={!!busy}>{busy === 'order' ? <Spinner>Ordering…</Spinner> : <><ListChecks/>Reorder bullets</>}</button>
          <button className="primary" onClick={suggest} disabled={!!busy || !ctx.aiOn}>{busy === 'ai' ? <Spinner>Writing suggestions… (~20s)</Spinner> : <><Sparkles/>{t ? 'New suggestions' : 'Suggest edits'}</>}</button>
        </div>
      </div>
      {err && <p className="error">{err}</p>}
      <AiNeeded ctx={ctx}/>
    </section>
    {t && <>
      {pending > 1 && <div className="row end"><button className="secondary small" onClick={() => {
        let draft = r.draft; const acc = {...accepted};
        if (t.headline && !acc.h) { draft = setHeadline(draft, t.headline); acc.h = 'yes'; }
        if (t.summary && !acc.s) { draft = setSummary(draft, t.summary); acc.s = 'yes'; }
        t.bullets.forEach((b, i) => { if (!acc['b' + i]) { const o = replaceBullet(draft, b.original, b.improved); draft = o.text; acc['b' + i] = o.done ? 'yes' : 'missing'; } });
        save({draft, tex: null, accepted: acc});
      }}><Check/>Accept all {pending}</button></div>}
      {t.headline && <Suggestion title="Headline" before={cvModel(r.draft).headline || '(none)'} after={t.headline} state={accepted.h} onAccept={() => accept('h', d => setHeadline(d, t.headline))} onSkip={() => skip('h')}/>}
      {t.summary && <Suggestion title="Summary" before={(cvModel(r.draft).sections.find(s => s.kind === 'summary') || {blocks: []}).blocks.map(b => b.text || '').join(' ') || '(no summary yet)'} after={t.summary} state={accepted.s} onAccept={() => accept('s', d => setSummary(d, t.summary))} onSkip={() => skip('s')}/>}
      {t.bullets.map((b, i) => <Suggestion key={i} title={'Bullet · ' + b.why} before={b.original} after={b.improved} state={accepted['b' + i]} onAccept={() => {
        const o = replaceBullet(r.draft, b.original, b.improved);
        if (!o.done) { save({accepted: {...accepted, ['b' + i]: 'missing'}}); return; }
        save({draft: o.text, tex: null, accepted: {...accepted, ['b' + i]: 'yes'}});
      }} onSkip={() => skip('b' + i)}/>)}
      {t.skills_first.length > 0 && <section className="panel"><h3>Lead with these skills</h3><div className="kw">{t.skills_first.map(s => <span className="tag good" key={s}>{s}</span>)}</div><p className="hint">Move these to the front of your skills lines in the Resume tab.</p></section>}
      {!t.bullets.length && !t.summary && <p className="hint">No safe rewrites came back. Try again, or edit the resume directly.</p>}
    </>}
    <div className="row end"><button className="primary" onClick={() => go('application/' + r.id + '/resume')}>Edit & design resume<ArrowRight/></button></div>
  </div>;
}

function Suggestion({title, before, after, state, onAccept, onSkip}) {
  return <section className={'panel suggestion ' + (state || '')}>
    <header><b>{title}</b>{state === 'yes' ? <span className="tag good"><Check/>Applied</span> : state === 'no' ? <span className="tag">Skipped</span> : state === 'missing' ? <span className="tag warn">Original text not found — edit it in the Resume tab</span> : null}</header>
    {state === 'yes' ? <div className="diff one"><div className="after"><small>In your resume now</small><p>{after}</p></div></div> : <div className="diff">
      <div className="before"><small>Now</small><p>{before}</p></div>
      <div className="after"><small>Suggested</small><p>{after}</p></div>
    </div>}
    {!state && <div className="row end"><button className="ghost small" onClick={onSkip}><X/>Skip</button><button className="primary small" onClick={onAccept}><Check/>Accept</button></div>}
  </section>;
}

function Resume({r, ctx, save}) {
  const [mode, setMode] = useState('content');
  const [view, setView] = useState('edit');
  const opts = {accent: r.accent, pageSize: r.pageSize};
  const generated = useMemo(() => generateLatex(r.draft, r.template, opts), [r.draft, r.template, r.accent, r.pageSize]);
  const tex = r.tex || generated;
  return <div className="stack">
    <TemplatePicker template={r.template} accent={r.accent} pageSize={r.pageSize} onChange={p => save({...p, tex: null})}/>
    <div className="row between wrap">
      <div className="seg big" role="tablist">
        <button className={mode === 'content' ? 'on' : ''} onClick={() => setMode('content')}><Type/>Edit content</button>
        <button className={mode === 'latex' ? 'on' : ''} onClick={() => setMode('latex')}><Code2/>LaTeX source</button>
      </div>
      {mode === 'content' && <div className="seg mobile-only">
        <button className={view === 'edit' ? 'on' : ''} onClick={() => setView('edit')}><PenLine/>Edit</button>
        <button className={view === 'preview' ? 'on' : ''} onClick={() => setView('preview')}><Eye/>Preview</button>
      </div>}
    </div>
    {r.tex && mode === 'content' && <p className="notice-inline"><AlertTriangle/>This resume uses LaTeX you edited by hand, so content edits are not shown in the PDF. <button className="link" onClick={() => save({tex: null})}>Rebuild from content</button></p>}
    {mode === 'content' ? <div className={'editor-split show-' + view}>
      <div className="editor-col"><CvEditor text={r.draft} onText={draft => save({draft})} aiContext={ctx.aiOn ? {jd: r.jd} : null}/></div>
      <div className="preview-col"><LivePreview text={r.draft} template={r.template} accent={r.accent} pageSize={r.pageSize} tex={r.tex}/></div>
    </div> : <LatexStudio templateId={r.template} tex={tex} generated={generated} title={r.title} onTex={v => save({tex: v === generated ? null : v})}/>}
    <div className="row end"><button className="primary" onClick={() => go('application/' + r.id + '/export')}>Review & export<ArrowRight/></button></div>
  </div>;
}

function Letter({r, ctx, save}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function write() {
    setBusy(true); setErr('');
    try { const out = await ai('cover', {cv: r.draft, jd: r.jd, company: r.company, role: r.role || r.title, tone: ctx.prefs.tone}); save({letter: out.letter}); } catch (e) { setErr(e.message); }
    setBusy(false);
  }
  return <div className="stack">
    <section className="panel">
      <div className="row between">
        <div><h2>Cover letter</h2><p>Written from your tailored CV and this job post. Edit freely before you send it.</p></div>
        <button className="primary" onClick={write} disabled={busy || !ctx.aiOn}>{busy ? <Spinner>Writing…</Spinner> : <><Sparkles/>{r.letter ? 'Write again' : 'Write with AI'}</>}</button>
      </div>
      {err && <p className="error">{err}</p>}
      <AiNeeded ctx={ctx}/>
    </section>
    <section className="panel letter">
      <textarea value={r.letter || ''} onChange={e => save({letter: e.target.value})} placeholder="Dear Hiring Manager, …" aria-label="Cover letter"/>
      <div className="row end">
        <span className="hint grow">{(r.letter || '').trim().split(/\s+/).filter(Boolean).length} words</span>
        <button className="ghost small" disabled={!r.letter} onClick={() => navigator.clipboard.writeText(r.letter).then(() => ctx.notify('Copied to clipboard.'))}><Copy/>Copy</button>
        <button className="ghost small" disabled={!r.letter} onClick={() => download(new Blob([r.letter], {type: 'text/plain'}), safeName(r.title) + '-cover-letter.txt')}><FileText/>.txt</button>
        <button className="secondary small" disabled={!r.letter} onClick={() => ctx.run('Preparing Word file', async () => download(await letterFile(r.letter), safeName(r.title) + '-cover-letter.docx'))}><Download/>Word</button>
      </div>
    </section>
  </div>;
}

function Export({r, ctx, save}) {
  const m = cvModel(r.draft);
  const t = templateById(r.template);
  const tex = r.tex || generateLatex(r.draft, r.template, {accent: r.accent, pageSize: r.pageSize});
  const checks = [
    [m.name && m.name !== 'Your Name', 'Name at the top'],
    [!!m.contact.email, 'Email address'],
    [!!m.contact.phone, 'Phone number'],
    [m.sections.some(s => s.kind === 'experience' || s.kind === 'projects'), 'Experience or projects'],
    [m.sections.some(s => s.kind === 'skills'), 'Skills section'],
    [m.sections.reduce((n, s) => n + s.blocks.reduce((k, b) => k + (b.bullets ? b.bullets.length : 0), 0), 0) >= 3, 'At least 3 achievement bullets'],
  ];
  const name = safeName(r.title);
  async function pdf() {
    await ctx.run('Compiling PDF with TeX Live', async () => {
      try {
        const out = await compileLatex(t.id, tex);
        download(new Blob([out.bytes], {type: 'application/pdf'}), name + '.pdf');
      } catch (e) {
        download(await builtinPDF(r.draft, r.template, r.pageSize), name + '.pdf');
        ctx.notify('The LaTeX service failed (' + e.message + '), so you got the built-in layout instead.');
      }
    });
  }
  return <div className="stack">
    <div className="grid2">
      <section className="panel">
        <h2><ListChecks/>Final check</h2>
        <ul className="checks">{checks.map(([ok, label]) => <li key={label} className={ok ? 'ok' : 'no'}>{ok ? <CircleCheck/> : <AlertTriangle/>}{label}</li>)}</ul>
        <label className="check big"><input type="checkbox" checked={!!r.approved} onChange={e => save({approved: e.target.checked, status: e.target.checked && ['Draft'].includes(r.status) ? 'Ready' : r.status})}/>I have read this resume and everything in it is true.</label>
      </section>
      <section className="panel">
        <h2><Download/>Download</h2>
        <p className="hint">{t.name} · {r.pageSize}. The PDF is compiled with real LaTeX, so it matches the preview exactly.</p>
        <div className="downloads">
          <button className="primary" disabled={!r.approved} onClick={pdf}><FileText/>PDF</button>
          <button className="secondary" disabled={!r.approved} onClick={() => ctx.run('Preparing Word file', async () => download(await wordFile(r.draft, r.template, r.pageSize), name + '.docx'))}><FileText/>Word (.docx)</button>
          <button className="secondary" disabled={!r.approved} onClick={() => ctx.run('Packing LaTeX project', () => downloadProject(t.id, tex, r.title))}><FileArchive/>LaTeX project (.zip)</button>
          <button className="ghost" disabled={!r.approved} onClick={() => download(new Blob([r.draft], {type: 'text/plain'}), name + '.txt')}><Type/>Plain text</button>
        </div>
        {!r.approved && <p className="hint"><ShieldCheck/>Tick the check on the left to enable downloads.</p>}
      </section>
    </div>
    <section className="panel">
      <h2>Application status</h2>
      <div className="status-row">{statuses.map(s => <button key={s} className={'chip' + (r.status === s ? ' on' : '')} onClick={() => save({status: s})}>{s}</button>)}</div>
      {r.url && <a className="secondary inline" href={r.url} target="_blank" rel="noreferrer"><ExternalLink/>Open the job post to apply</a>}
    </section>
  </div>;
}

export function Application({r, tab, ctx}) {
  const save = changes => ctx.changeRecord(r, changes);
  const active = TABS.some(x => x[0] === tab) ? tab : 'fit';
  return <>
    <a className="back" href="#/applications"><ArrowLeft/>Applications</a>
    <header className="app-head">
      <Ring value={r.aiFit ? r.aiFit.score : r.fit.score} size="md"/>
      <div className="grow">
        <h1>{r.role || r.title}</h1>
        <p>{[r.company, r.location].filter(Boolean).join(' · ') || 'Job you added'}{r.url && <> · <a href={r.url} target="_blank" rel="noreferrer">Job post <ExternalLink/></a></>}</p>
      </div>
      <select className="status-select" value={r.status} onChange={e => save({status: e.target.value})} aria-label="Status">{statuses.map(s => <option key={s}>{s}</option>)}</select>
      <button className="icon danger" aria-label="Delete application" onClick={() => { if (window.confirm('Delete this application?')) { ctx.removeRecord(r); go('applications'); } }}><Trash2/></button>
    </header>
    <Tabs value={active} onChange={id => go('application/' + r.id + '/' + id)} items={TABS.map(([id, label, Icon]) => [id, label, Icon, id === 'tailor' && r.aiTailor ? Object.values(r.accepted || {}).filter(v => v === 'yes').length + '/' + ((r.aiTailor.bullets || []).length + (r.aiTailor.summary ? 1 : 0) + (r.aiTailor.headline ? 1 : 0)) : id === 'export' && r.approved ? '✓' : ''])}/>
    {active === 'fit' && <Fit r={r} ctx={ctx} save={save}/>}
    {active === 'tailor' && <Tailor r={r} ctx={ctx} save={save}/>}
    {active === 'resume' && <Resume r={r} ctx={ctx} save={save}/>}
    {active === 'letter' && <Letter r={r} ctx={ctx} save={save}/>}
    {active === 'export' && <Export r={r} ctx={ctx} save={save}/>}
    <details className="panel jd-fold"><summary>Job post</summary><JobDocument text={r.jd} title={r.role || r.title} company={r.company} location={r.location} url={r.url}/></details>
  </>;
}
