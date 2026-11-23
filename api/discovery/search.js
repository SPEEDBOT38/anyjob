import { saveJob, stripHtml } from 'lib/jobs.js';
import { optional } from 'lib/secrets.js';
import { resolveLocation, withCountry } from 'lib/places.js';
import { roleScore, titlePhrases, locationMatches, WORLDWIDE } from 'lib/match.js';

export const access = 'public';
export const methods = ['POST'];

const ACTOR = 'valig~linkedin-jobs-scraper';

async function linkedin(token, role, query, wanted) {
  const url = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?timeout=48&clean=true`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      keywords: role,
      location: query,
      limit: Math.min(wanted * 3, 60),
      titleInclude: titlePhrases(role),
      datePosted: 'r2592000',
    }),
  });
  if (!r.ok) throw new Error('apify ' + r.status);
  const items = await r.json();
  if (!Array.isArray(items)) throw new Error('apify shape');
  return items.map((j) => ({
    id: 'linkedin:' + j.id,
    source: 'linkedin',
    title: j.title || '',
    company: j.companyName || '',
    location: j.location || '',
    description: stripHtml(j.descriptionHtml) || j.description || '',
    source_url: j.url || j.applyUrl || '',
    posted_date: j.postedDate || null,
  }));
}

async function remotive(role) {
  // Remotive's own search is loose, so also ask for the role's last word ("analyst") and filter titles ourselves.
  const lastWord = role.trim().split(/\s+/).pop();
  const terms = [...new Set([role, lastWord])];
  const pages = await Promise.all(terms.map(async (t) => {
    const r = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(t)}&limit=150`);
    if (!r.ok) throw new Error('remotive ' + r.status);
    return (await r.json()).jobs || [];
  }));
  const seen = new Set();
  const all = pages.flat().filter((j) => !seen.has(j.id) && seen.add(j.id));
  return all.map((j) => ({
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

async function arbeitnow() {
  const pages = await Promise.all([1, 2, 3].map(async (p) => {
    const r = await fetch('https://www.arbeitnow.com/api/job-board-api?page=' + p);
    if (!r.ok) throw new Error('arbeitnow ' + r.status);
    return (await r.json()).data || [];
  }));
  return pages.flat().map((j) => ({
    id: 'arbeitnow:' + j.slug,
    source: 'arbeitnow',
    title: j.title || '',
    company: j.company_name || '',
    location: (j.location || '') + (j.remote ? ' (Remote)' : ''),
    description: stripHtml(j.description),
    source_url: j.url || '',
    posted_date: j.created_at ? new Date(j.created_at * 1000).toISOString() : null,
  }));
}

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export default async function (req, res) {
  const body = req.body || {};
  const role = clean(body.role || body.query, 80);
  const given = body.location;
  const loc = given && typeof given === 'object'
    ? { query: clean(given.query, 120), remote: given.remote === true, label: clean(given.label, 120), match: Array.isArray(given.match) ? given.match.map((m) => clean(m, 60)).filter(Boolean).slice(0, 12) : [] }
    : resolveLocation(clean(given, 120));
  const query = loc ? loc.query : '';
  const remoteOnly = Boolean(loc && loc.remote);
  const match = loc ? loc.match : [];
  const wanted = Math.min(Math.max(parseInt(body.results_wanted, 10) || 15, 1), 30);
  if (!role) return res.status(400).json({ error: 'Choose a role to search.' });

  const token = await optional('APIFY_API_TOKEN');
  let raw = [];
  let source = 'public boards';
  const problems = [];

  if (token) {
    try {
      raw = await linkedin(token, role, remoteOnly ? 'Remote' : query || 'Worldwide', wanted);
      source = 'LinkedIn via Apify';
    } catch (e) {
      problems.push('Apify search failed');
    }
  }
  if (!raw.length) {
    const settled = await Promise.allSettled([remotive(role), arbeitnow()]);
    if (settled.every((s) => s.status === 'rejected') && problems.length) {
      return res.status(502).json({ error: 'The job search could not complete. Try again in a moment.' });
    }
    raw = settled.flatMap((s) => (s.status === 'fulfilled' ? s.value : []));
    if (token) source = 'public boards (Apify returned nothing)';
  }

  let roleMatched = 0;
  const jobs = raw
    .map((j) => ({ j, score: roleScore(j.title, role) }))
    .filter((x) => x.score > 0 && /^https?:\/\//.test(x.j.source_url))
    .filter((x) => {
      roleMatched += 1;
      if (remoteOnly) return x.j.source === 'remotive' || WORLDWIDE.test(x.j.location) || /remote/i.test(x.j.title);
      return !match.length || locationMatches(withCountry(x.j.location), match);
    })
    .sort((a, b) => b.score - a.score || String(b.j.posted_date).localeCompare(String(a.j.posted_date)))
    .map((x) => x.j)
    .slice(0, wanted);

  for (const job of jobs) await saveJob(job);

  let note = '';
  if (!jobs.length) {
    note = token
      ? 'No matching openings found for this role and location. Try the whole country or a nearby city.'
      : 'No matches on the free boards, which mostly list remote roles. Add an Apify token for live LinkedIn results in any city.';
  }
  return res.json({ count: jobs.length, jobs, source, role, location: loc ? loc.label : 'Anywhere', role_matches: roleMatched, note });
}
