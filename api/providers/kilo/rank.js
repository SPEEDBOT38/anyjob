import { chatJson } from 'lib/ai.js';

export const access = 'public';
export const methods = ['POST'];

function parseOrder(order, count) {
  if (!Array.isArray(order) || !order.length) throw new Error('bad order');
  return [...new Set(order.filter((i) => Number.isInteger(i) && i >= 0 && i < count))];
}

// Rank CV lines by relevance to a job posting (used to reorder bullets without changing them).
export default async function (req, res) {
  const body = req.body || {};
  const cv = typeof body.cv === 'string' ? body.cv : '';
  const jd = typeof body.jd === 'string' ? body.jd : '';
  if (!cv.trim() || cv.length > 80000 || !jd.trim() || jd.length > 50000) {
    return res.status(400).json({ error: 'Send a CV (max 80000 characters) and a job description (max 50000).' });
  }
  const lines = cv.split('\n');
  try {
    const { json } = await chatJson([
      { role: 'system', content: 'Rank CV line numbers by relevance to the job posting. Return only JSON of the form {"order":[0,1]}. Never change CV text.' },
      { role: 'user', content: JSON.stringify({ lines: lines.map((l, i) => [i, l]), job: jd }) },
    ], { maxTokens: 1500 });
    return res.json({ order: parseOrder(json.order, lines.length) });
  } catch (e) {
    return res.status(e.status === 503 ? 503 : 502).json({ error: e.status === 503 ? e.message : 'AI ranking failed. Try again or choose local preparation.' });
  }
}
