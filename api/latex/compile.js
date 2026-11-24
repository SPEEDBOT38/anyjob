export const access = 'public';
export const methods = ['POST'];

// Compile a LaTeX resume to PDF on a public TeX Live service: LaTeX-on-HTTP (latex.ytotech.com) first,
// texlive.net as a fallback when the first is busy or over quota. Only the class files of the known
// templates are attached, read from this site's /assets/latex/.
const TEMPLATES = {
  jake: { engine: 'pdflatex', files: [] },
  moderncv: { engine: 'pdflatex', files: [] },
  altacv: { engine: 'pdflatex', files: ['altacv/altacv.cls'] },
  awesome: { engine: 'xelatex', files: ['awesome/awesomecv-anyjob.cls'] },
  mcdowell: { engine: 'xelatex', files: ['mcdowell/mcdowellcv-anyjob.cls'] },
  deedy: { engine: 'xelatex', files: ['deedy/deedy-resume-anyjob.cls'] },
};
const ENGINES = ['pdflatex', 'xelatex', 'lualatex'];
const cache = new Map();

async function classFile(origin, f) {
  if (cache.has(f)) return cache.get(f);
  const r = await fetch(origin + '/assets/latex/' + f, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error('missing ' + f);
  const text = await r.text();
  cache.set(f, text);
  return text;
}

function base64(buf) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// Turn a TeX log into a few readable errors with line numbers.
function errors(log) {
  const lines = String(log || '').split('\n');
  const out = [];
  for (let i = 0; i < lines.length && out.length < 6; i++) {
    if (!lines[i].startsWith('!') || /==> Fatal error/.test(lines[i])) continue;
    let line = null;
    for (let j = i + 1; j < Math.min(lines.length, i + 12); j++) {
      const m = lines[j].match(/^l\.(\d+)/);
      if (m) { line = Number(m[1]); break; }
    }
    const msg = lines[i].replace(/^!\s*/, '').trim();
    if (!out.some((e) => e.message === msg && e.line === line)) out.push({ message: msg, line });
  }
  return out;
}

async function ytotech(engine, tex, files) {
  const r = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compiler: engine, resources: [{ main: true, content: tex }, ...files.map(([path, content]) => ({ path, content }))] }),
    signal: AbortSignal.timeout(30000),
  });
  if (r.ok && (r.headers.get('content-type') || '').includes('pdf')) return { pdf: await r.arrayBuffer() };
  const text = await r.text();
  let log = text;
  try { const j = JSON.parse(text); log = j.logs || j.error || text; } catch { /* plain text */ }
  return { log: String(log) };
}

async function texlivenet(engine, tex, files) {
  const B = '----anyjob' + Date.now().toString(36);
  const part = (name, val) => `--${B}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${val}\r\n`;
  const body = part('filecontents[]', tex) + part('filename[]', 'document.tex')
    + files.map(([n, c]) => part('filecontents[]', c) + part('filename[]', n)).join('')
    + part('engine', engine) + part('return', 'pdf') + `--${B}--\r\n`;
  const r = await fetch('https://texlive.net/cgi-bin/latexcgi', {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data; boundary=' + B },
    body,
    signal: AbortSignal.timeout(22000),
  });
  if ((r.headers.get('content-type') || '').includes('pdf')) return { pdf: await r.arrayBuffer() };
  return { log: await r.text() };
}

export default async function (req, res) {
  const body = req.body || {};
  const tex = typeof body.tex === 'string' ? body.tex : '';
  const t = TEMPLATES[body.template] || TEMPLATES.jake;
  const engine = ENGINES.includes(body.engine) ? body.engine : t.engine;
  if (!tex.includes('\\begin{document}') || tex.length > 300000) {
    return res.status(400).json({ error: 'Send a complete LaTeX document (under 300 KB).' });
  }
  const host = (req.headers && (req.headers.host || req.headers.Host)) || 'anyjob.hatchable.site';
  const origin = 'https://' + String(host).replace(/[^a-z0-9.:-]/gi, '');
  let files;
  try {
    files = await Promise.all(t.files.map(async (f) => [f.replace(/^[^/]+\//, ''), await classFile(origin, f)]));
  } catch {
    return res.status(502).json({ error: 'Could not load the template files. Try again.', errors: [] });
  }
  const started = Date.now();
  let out = null, service = 'latex.ytotech.com';
  try { out = await ytotech(engine, tex, files); } catch { out = null; }
  // A real LaTeX error is reported straight away; a busy or failing service falls back to texlive.net.
  if (!out || (!out.pdf && !errors(out.log).length)) {
    service = 'texlive.net';
    try { out = await texlivenet(engine, tex, files); } catch { out = null; }
  }
  if (!out) return res.status(504).json({ error: 'The LaTeX compilers are busy. Try again in a minute.', errors: [] });
  if (out.pdf) return res.json({ ok: true, pdf: base64(out.pdf), bytes: out.pdf.byteLength, engine, service, ms: Date.now() - started });
  const list = errors(out.log);
  return res.status(422).json({ ok: false, error: list.length ? 'LaTeX found ' + list.length + ' problem' + (list.length > 1 ? 's' : '') + ' in this document.' : 'The LaTeX compiler could not finish. Try again in a minute.', errors: list, log: out.log.slice(-6000), engine, service });
}
