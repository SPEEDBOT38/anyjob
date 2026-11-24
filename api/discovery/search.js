import { saveJob, stripHtml } from 'lib/jobs.js';
import { optional } from 'lib/secrets.js';
import { resolveLocation, withCountry } from 'lib/places.js';
import { roleMatch, locationMatches, WORLDWIDE } from 'lib/match.js';

export const access = 'public';
export const methods = ['POST'];

// Job search: LinkedIn through two Apify scrapers plus two free boards, all in parallel,
// then a strict role + location filter, de-duplication and ranking.

async function apify(token, actor, input, secs) {
  const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?timeout=${secs}&clean=true`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout((secs + 6) * 1000),
  });
  if (!r.ok) throw new Error(actor + ' ' + r.status);
  const items = await r.json();
  if (!Array.isArray(items)) throw new Error(actor + ' shape');
  return items;
}

const money = (s) => (s && !/^n\/?a$/i.test(String(s).trim()) ? String(s).trim().slice(0, 80) : '');

// valig/linkedin-jobs-scraper: up to 60 LinkedIn postings with full descriptions, cheap per result.
async function linkedin(token, role, where, remoteOnly) {
  const items = await apify(token, 'valig~linkedin-jobs-scraper', {
    keywords: remoteOnly ? role + ' remote' : role,
    location: where,
    limit: 60,
    datePosted: 'r2592000',
  }, 38);
  return items.map((j) => ({
    id: 'linkedin:' + j.id,
    source: 'linkedin',
    via: 'LinkedIn',
    title: j.title || '',
    company: j.companyName || '',
    location: j.location || '',
    description: stripHtml(j.descriptionHtml) || j.description || '',
    source_url: j.url || j.applyUrl || '',
    posted_date: j.postedDate || null,
    salary: money(j.salary),
    level: j.experienceLevel || '',
    type: j.contractType || '',
    applicants: j.applicationsCount || '',
  }));
}

// orgupdate/linkedin-jobs-scraper: LinkedIn listings by keyword + city + country (10 per run on free Apify plans).
const COUNTRY_CODE = { 'united states': 'usa', 'united kingdom': 'uk' };
function ago(text) {
  const m = /(\d+)\s*(minute|hour|day|week|month)/i.exec(text || '');
  if (!m) return null;
  const unit = { minute: 60e3, hour: 3600e3, day: 86400e3, week: 604800e3, month: 2592000e3 }[m[2].toLowerCase()];
  return new Date(Date.now() - Number(m[1]) * unit).toISOString();
}
async function orgupdate(token, role, query, remoteOnly) {
  const parts = String(query || '').split(',').map((s) => s.trim()).filter(Boolean);
  const country = (parts.length > 1 ? parts[parts.length - 1] : parts[0] || '').toLowerCase();
  const items = await apify(token, 'orgupdate~linkedin-jobs-scraper', {
    includeKeyword: role,
    locationName: remoteOnly ? 'Remote' : parts[0] || 'Remote',
    countryName: remoteOnly || !country ? 'all' : COUNTRY_CODE[country] || country,
    pagesToFetch: 1,
    datePosted: 'month',
  }, 38);
  return items.map((j) => {
    const link = String(j.URL || '').split('?')[0];
    return {
      id: 'linkedin:' + ((/(\d{6,})$/.exec(link) || [])[1] || link),
      source: 'linkedin',
      via: j.posted_via || 'LinkedIn',
      title: j.job_title || '',
      company: j.company_name || '',
      location: j.location || '',
      description: stripHtml(j.description) || '',
      source_url: link,
      posted_date: ago(j.date),
      salary: money(j.salary),
    };
  });
}

async function remotive(role) {
  // Remotive's own search is loose, so also ask for the role's last word ("analyst") and filter titles ourselves.
  const lastWord = role.trim().split(/\s+/).pop();
  const terms = [...new Set([role, lastWord])];
  const pages = await Promise.all(terms.map(async (t) => {
    const r = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(t)}&limit=150`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error('remotive ' + r.status);
    return (await r.json()).jobs || [];
  }));
  const seen = new Set();
  return pages.flat().filter((j) => !seen.has(j.id) && seen.add(j.id)).map((j) => ({
    id: 'remotive:' + j.id,
    source: 'remotive',
    via: 'Remotive',
    title: j.title || '',
    company: j.company_name || '',
    location: j.candidate_required_location || 'Remote',
    description: stripHtml(j.description),
    source_url: j.url || '',
    posted_date: j.publication_date || null,
    salary: money(j.salary),
    type: j.job_type ? String(j.job_type).replace(/_/g, ' ') : '',
  }));
}

async function arbeitnow() {
  const pages = await Promise.all([1, 2, 3].map(async (p) => {
    const r = await fetch('https://www.arbeitnow.com/api/job-board-api?page=' + p, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error('arbeitnow ' + r.status);
    return (await r.json()).data || [];
  }));
  return pages.flat().map((j) => ({
    id: 'arbeitnow:' + j.slug,
    source: 'arbeitnow',
    via: 'Arbeitnow',
    title: j.title || '',
    company: j.company_name || '',
    location: (j.location || '') + (j.remote ? ' (Remote)' : ''),
    description: stripHtml(j.description),
    source_url: j.url || '',
    posted_date: j.created_at ? new Date(j.created_at * 1000).toISOString() : null,
  }));
}

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const key = (j) => (j.title + '|' + j.company).toLowerCase().replace(/[^a-z0-9|]+/g, '');

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
  const wanted = Math.min(Math.max(parseInt(body.results_wanted, 10) || 30, 1), 60);
  if (!role) return res.status(400).json({ error: 'Choose a role to search.' });

  const token = await optional('APIFY_API_TOKEN');
  const where = remoteOnly ? 'Worldwide' : query || 'Worldwide';
  const tasks = [
    ['LinkedIn', token ? linkedin(token, role, where, remoteOnly) : null],
    ['LinkedIn (OrgUpdate)', token ? orgupdate(token, role, query, remoteOnly) : null],
    ['Remotive', remotive(role)],
    ['Arbeitnow', arbeitnow()],
  ].filter(([, p]) => p);
  const settled = await Promise.allSettled(tasks.map(([, p]) => p));
  const sources = {};
  let raw = [];
  settled.forEach((s, i) => {
    const name = tasks[i][0];
    if (s.status === 'fulfilled') { raw = raw.concat(s.value); sources[name] = s.value.length; }
    else sources[name] = 'failed';
  });
  if (settled.every((s) => s.status === 'rejected')) {
    return res.status(502).json({ error: 'The job search could not complete. Try again in a moment.' });
  }

  // Strict filter: the title must be this role (same words or close synonyms), in the chosen place. Duplicates dropped.
  let roleMatched = 0;
  const seen = new Set();
  const jobs = raw
    .map((j) => ({ j, m: roleMatch(j.title, role) }))
    .filter((x) => x.m.score > 0 && /^https?:\/\//.test(x.j.source_url))
    .filter((x) => {
      roleMatched += 1;
      if (remoteOnly) return x.j.source === 'remotive' || WORLDWIDE.test(x.j.location) || /remote/i.test(x.j.title);
      return !match.length || locationMatches(withCountry(x.j.location), match);
    })
    .filter((x) => {
      const k1 = x.j.id, k2 = key(x.j);
      if (seen.has(k1) || seen.has(k2)) return false;
      seen.add(k1); seen.add(k2);
      return true;
    })
    .sort((a, b) => b.m.score - a.m.score || String(b.j.posted_date).localeCompare(String(a.j.posted_date)))
    .slice(0, wanted)
    .map((x) => ({ ...x.j, match: x.m.kind }));

  for (const job of jobs) await saveJob(job);

  let note = '';
  if (!jobs.length) {
    note = token
      ? 'No openings with this job title in this place right now. Try the whole country, a nearby city or a related role.'
      : 'City searches need LinkedIn results, which are switched off until the site owner saves an Apify token under Setup (hatchable.com console, AnyJob project).';
  }
  const used = Object.entries(sources).filter(([, n]) => typeof n === 'number' && n > 0).map(([k]) => k);
  return res.json({ count: jobs.length, jobs, source: used.join(' + ') || 'none', sources, role, location: loc ? loc.label : 'Anywhere', role_matches: roleMatched, note });
}
