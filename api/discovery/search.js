import { saveJob, stripHtml } from 'lib/jobs.js';

export const access = 'public';
export const methods = ['POST'];

async function remotive(query, limit) {
  const r = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=${limit}`);
  if (!r.ok) throw new Error('remotive ' + r.status);
  const data = await r.json();
  return (data.jobs || []).map((j) => ({
    id: 'remotive:' + j.id,
    source: 'remotive',
    title: j.title || '',
    company: j.company_name || '',
    location: j.candidate_required_location || 'Remote',
    description: stripHtml(j.description),
    source_url: j.url || '',
    posted_date: j.publication_date || null,
  }));
}

async function arbeitnow(query) {
  const r = await fetch('https://www.arbeitnow.com/api/job-board-api');
  if (!r.ok) throw new Error('arbeitnow ' + r.status);
  const data = await r.json();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return (data.data || [])
    .map((j) => ({
      id: 'arbeitnow:' + j.slug,
      source: 'arbeitnow',
      title: j.title || '',
      company: j.company_name || '',
      location: j.location || (j.remote ? 'Remote' : ''),
      description: stripHtml(j.description),
      source_url: j.url || '',
      posted_date: j.created_at ? new Date(j.created_at * 1000).toISOString() : null,
    }))
    .filter((j) => {
      const hay = (j.title + ' ' + j.description).toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
}

export default async function (req, res) {
  const body = req.body || {};
  const query = typeof body.query === 'string' ? body.query.trim() : '';
  const location = typeof body.location === 'string' ? body.location.trim().toLowerCase() : '';
  const wanted = Math.min(Math.max(parseInt(body.results_wanted, 10) || 12, 1), 50);
  if (!query) return res.status(400).json({ error: 'Enter a role to search.' });

  const settled = await Promise.allSettled([remotive(query, 50), arbeitnow(query)]);
  if (settled.every((s) => s.status === 'rejected')) {
    return res.status(502).json({ error: 'The job boards could not complete this search.' });
  }
  let jobs = settled.flatMap((s) => (s.status === 'fulfilled' ? s.value : []));
  if (location) {
    jobs = jobs.filter((j) => j.location.toLowerCase().includes(location) || /remote|anywhere|worldwide/i.test(j.location));
  }
  jobs = jobs.filter((j) => j.title && /^https?:\/\//.test(j.source_url)).slice(0, wanted);
  for (const job of jobs) await saveJob(job);
  return res.json({ count: jobs.length, jobs, query, location: body.location || '' });
}
