import { config } from 'hatchable';
import { optional } from 'lib/secrets.js';

export const access = 'public';
export const methods = ['POST'];

function parseOrder(content, count) {
  const cleaned = content.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
  const order = JSON.parse(cleaned).order;
  if (!Array.isArray(order) || !order.length) throw new Error('bad order');
  for (const i of order) {
    if (!Number.isInteger(i) || i < 0 || i >= count) throw new Error('bad index');
  }
  return [...new Set(order)];
}

export default async function (req, res) {
  const body = req.body || {};
  const cv = typeof body.cv === 'string' ? body.cv : '';
  const jd = typeof body.jd === 'string' ? body.jd : '';
  const tone = typeof body.tone === 'string' ? body.tone.slice(0, 40) : 'Balanced';
  if (!cv.trim() || cv.length > 80000 || !jd.trim() || jd.length > 50000) {
    return res.status(400).json({ error: 'Send a CV (max 80000 characters) and a job description (max 50000).' });
  }
  const key = await optional('KILO_API_KEY');
  if (!key) return res.status(503).json({ error: 'Set KILO_API_KEY on the project Setup page.' });

  let model = 'kilo-auto';
  try { model = (await config.get('kilo_model')) || model; } catch { /* use default */ }

  const lines = cv.split('\n');
  try {
    const r = await fetch('https://ai-gateway.kilo.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          { role: 'system', content: 'Rank CV line numbers by relevance to the posting. Return only JSON of the form {"order":[0,1]}. Never change CV text.' },
          { role: 'user', content: JSON.stringify({ lines: lines.map((l, i) => [i, l]), job: jd, tone }) },
        ],
      }),
    });
    if (!r.ok) throw new Error('kilo ' + r.status);
    const data = await r.json();
    return res.json({ order: parseOrder(data.choices[0].message.content, lines.length) });
  } catch {
    return res.status(502).json({ error: 'Kilo could not rank this CV. Check credentials, model and credits, or choose local preparation.' });
  }
}
