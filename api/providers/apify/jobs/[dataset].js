import { optional } from 'lib/secrets.js';

export const access = 'public';
export const methods = ['GET'];

const str = (v) => (typeof v === 'string' ? v : '');

export default async function (req, res) {
  const dataset = String(req.params.dataset || '');
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(dataset)) {
    return res.status(400).json({ error: 'Enter an Apify dataset ID.' });
  }
  const key = await optional('APIFY_API_TOKEN');
  if (!key) return res.status(503).json({ error: 'Set APIFY_API_TOKEN on the project Setup page.' });

  let items;
  try {
    const r = await fetch(`https://api.apify.com/v2/datasets/${dataset}/items?clean=true&limit=50`, {
      headers: { Authorization: 'Bearer ' + key },
    });
    if (!r.ok) throw new Error('apify ' + r.status);
    items = await r.json();
    if (!Array.isArray(items)) throw new Error('not a list');
  } catch {
    return res.status(502).json({ error: 'Could not read this Apify dataset. Check its ID and token permissions.' });
  }

  const jobs = [];
  items.forEach((row, i) => {
    if (!row || typeof row !== 'object') return;
    const title = row.title || row.jobTitle;
    if (typeof title !== 'string' || !title.trim()) return;
    const url = str(row.jobUrl || row.url || row.link);
    jobs.push({
      id: `apify:${dataset}:${i}`,
      title,
      company: str(row.companyName || row.company),
      location: str(row.location),
      description: str(row.descriptionText || row.description),
      source_url: /^https?:\/\//.test(url) ? url : '',
      source: 'apify',
    });
  });
  return res.json({ jobs });
}
