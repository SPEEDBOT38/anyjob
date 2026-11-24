import React, {useEffect, useMemo, useState} from 'react';
import {Loader2, RefreshCw, AlertTriangle, Check} from 'lucide-react';
import {TEMPLATES, ACCENTS, templateById, generateLatex} from './templates';
import {compileLatex} from './api';
import {PdfView} from './PdfView';
import {ResumePaper} from './Preview';
import {useDebounced} from './ui';

export function TemplatePicker({template, accent, pageSize, onChange, compact = false}) {
  const t = templateById(template);
  return <div className={'template-picker' + (compact ? ' compact' : '')}>
    <div className="template-strip" role="radiogroup" aria-label="Resume template">
      {TEMPLATES.map(x => <button key={x.id} role="radio" aria-checked={x.id === t.id} className={'tpl' + (x.id === t.id ? ' on' : '')} onClick={() => onChange({template: x.id})}>
        <img src={'/assets/templates/' + x.id + '.jpg'} alt="" loading="lazy"/>
        <span><b>{x.name}</b><small>{x.bestFor[0]}</small></span>
        {x.id === t.id && <Check className="tick"/>}
      </button>)}
    </div>
    <div className="picker-options">
      {t.accent && <div className="swatches" role="radiogroup" aria-label="Accent colour">
        {ACCENTS.map(a => <button key={a.id} role="radio" aria-checked={accent === a.id} aria-label={a.label} title={a.label} className={'swatch' + (accent === a.id ? ' on' : '')} style={{background: '#' + a.hex}} onClick={() => onChange({accent: a.id})}/>)}
      </div>}
      <div className="seg" role="radiogroup" aria-label="Page size">
        {['A4', 'Letter'].map(s => <button key={s} role="radio" aria-checked={pageSize === s} className={pageSize === s ? 'on' : ''} onClick={() => onChange({pageSize: s})}>{s}</button>)}
      </div>
    </div>
  </div>;
}

// Compiles the resume with the chosen LaTeX template and shows the real PDF pages.
export function LivePreview({text, template, accent, pageSize, tex, onPdf}) {
  const source = useMemo(() => tex || generateLatex(text, template, {accent, pageSize}), [text, template, accent, pageSize, tex]);
  const debounced = useDebounced(source, 1800);
  const [state, setState] = useState({pdf: null, busy: true, error: '', errors: []});
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let live = true;
    setState(s => ({...s, busy: true}));
    compileLatex(templateById(template).id, debounced)
      .then(out => { if (live) { setState({pdf: out.bytes, busy: false, error: '', errors: []}); onPdf && onPdf(out.bytes); } })
      .catch(e => { if (live) setState(s => ({...s, busy: false, error: e.message, errors: e.errors || []})); });
    return () => { live = false; };
  }, [debounced, nonce]);
  const stale = source !== debounced;
  return <div className="live-preview">
    <div className="pdf-head">
      <span>{templateById(template).name}</span>
      {state.busy || stale ? <span className="busy"><Loader2 className="spin"/>Updating…</span> : state.error ? <span className="warn"><AlertTriangle/>Preview failed</span> : <span className="ok"><Check/>Exact PDF</span>}
      <button className="icon" onClick={() => setNonce(n => n + 1)} aria-label="Recompile preview"><RefreshCw/></button>
    </div>
    {state.error && <div className="tex-errors" role="status"><b><AlertTriangle/>{state.error}</b>{state.errors.slice(0, 3).map((e, i) => <span key={i}>{e.line ? 'Line ' + e.line + ': ' : ''}{e.message}</span>)}<span>Showing a quick layout instead. Open the LaTeX tab to fix the source, or try again.</span></div>}
    {state.pdf && !state.error ? <PdfView bytes={state.pdf}/> : state.error ? <div className="paper-frame"><ResumePaper text={text} template={template === 'jake' || template === 'mcdowell' ? 'Classic' : 'Modern'}/></div> : <div className="pdf-empty"><Loader2 className="spin"/>Compiling with TeX Live…</div>}
  </div>;
}
