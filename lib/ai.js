import { config } from 'hatchable';
import { optional } from 'lib/secrets.js';

// Chat completions through the Kilo AI gateway, using FREE models only.
// The kilo_model setting is honoured only when it names a free model (ends in "/free" or ":free");
// anything else is ignored, so a paid model can never be billed.
const GATEWAY = 'https://ai-gateway.kilo.ai/api/v1/chat/completions';
const FREE = 'kilo-auto/free';
const BACKUP = 'openrouter/free';
export const isFreeModel = (m) => typeof m === 'string' && /(^|[/:])free$/i.test(m.trim());

export async function aiReady() {
  return Boolean(await optional('KILO_API_KEY'));
}

async function call(key, model, messages, maxTokens, signal) {
  const r = await fetch(GATEWAY, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: maxTokens }),
    signal,
  });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

export async function chat(messages, { maxTokens = 1800, timeoutMs = 50000 } = {}) {
  const key = await optional('KILO_API_KEY');
  if (!key) { const e = new Error('AI is not configured. Add KILO_API_KEY on the Setup page.'); e.status = 503; throw e; }
  let model = FREE;
  try { const m = await config.get('kilo_model'); if (isFreeModel(m)) model = m.trim(); } catch { /* default */ }
  const signal = AbortSignal.timeout(timeoutMs);
  // Try the chosen free model, then the other free routers if it is busy or unavailable.
  const models = [...new Set([model, FREE, BACKUP])];
  let res;
  for (const m of models) {
    res = await call(key, m, messages, maxTokens, signal);
    if (res.status === 200 || res.status === 400 || res.status === 401) break;
  }
  if (res.status !== 200) {
    const e = new Error((res.data && res.data.error && (res.data.error.message || res.data.error.title)) || 'The AI service returned ' + res.status);
    e.status = 502;
    throw e;
  }
  const content = res.data.choices && res.data.choices[0] && res.data.choices[0].message && res.data.choices[0].message.content;
  return { text: String(content || ''), model: res.data.model || model };
}

// Pull the first JSON object out of a model reply (tolerates code fences and chatter).
export function parseJson(text) {
  const t = String(text || '').replace(/```(?:json)?/gi, '');
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error('no json');
  return JSON.parse(t.slice(a, b + 1));
}

export async function chatJson(messages, opts) {
  const first = await chat(messages, opts);
  try { return { json: parseJson(first.text), model: first.model }; } catch {
    const again = await chat([...messages, { role: 'assistant', content: first.text.slice(0, 4000) }, { role: 'user', content: 'That was not valid JSON. Reply again with only the JSON object.' }], opts);
    return { json: parseJson(again.text), model: again.model };
  }
}
