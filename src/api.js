// Calls to the AnyJob backend (Hatchable functions).
export const backend = window.ANYJOB_API_BASE || (location.origin === 'http://127.0.0.1:8129' ? 'http://127.0.0.1:8130' : location.origin);

export async function post(path, body, timeout = 60000) {
  let r;
  try {
    r = await fetch(backend + path, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body), signal: AbortSignal.timeout(timeout)});
  } catch (e) {
    throw Error(e && e.name === 'TimeoutError' ? 'The server took too long to answer. Try again.' : 'Could not reach the AnyJob server. Check your connection.');
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = Error(data.error || 'The request failed (' + r.status + ').');
    err.data = data;
    throw err;
  }
  return data;
}

export async function get(path, timeout = 8000) {
  const r = await fetch(backend + path, {signal: AbortSignal.timeout(timeout)});
  if (!r.ok) throw Error('The request failed (' + r.status + ').');
  return r.json();
}

export const status = () => get('/api/providers/status', 5000).catch(() => ({kilo: false, apify: false}));

// AI tasks: fit, tailor, cover, bullet, clean. The server keeps every answer to facts in the CV.
export const ai = (task, payload) => post('/api/ai/assist', {task, ...payload}, 58000);

export const searchJobs = (role, location) => post('/api/discovery/search', {role, location}, 60000);

const pdfCache = new Map();
// Compile LaTeX to PDF bytes. Identical sources are served from memory.
export async function compileLatex(template, tex) {
  const key = template + '\u0000' + tex;
  if (pdfCache.has(key)) return pdfCache.get(key);
  let data;
  try {
    data = await post('/api/latex/compile', {template, tex}, 58000);
  } catch (e) {
    const err = Error(e.message);
    err.errors = (e.data && e.data.errors) || [];
    err.log = (e.data && e.data.log) || '';
    throw err;
  }
  const bin = atob(data.pdf);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const out = {bytes, service: data.service, ms: data.ms};
  pdfCache.set(key, out);
  if (pdfCache.size > 20) pdfCache.delete(pdfCache.keys().next().value);
  return out;
}

export function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export const safeName = s => String(s || 'resume').replace(/[^\p{L}\p{N}_-]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'resume';
