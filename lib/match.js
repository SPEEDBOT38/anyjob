// Strict role and location matching for job search results.

const STOP = new Set(['a', 'an', 'the', 'and', 'of', 'for', 'to', 'in', 'at', 'jr', 'sr']);
const SOFTWARE_FAMILY = /\b(software|web|frontend|front-end|backend|back-end|full stack|full-stack|mobile|ios|android|game|blockchain|embedded|salesforce|wordpress|devops|cloud|machine learning|ai|data)\b/;

function words(text) {
  return String(text || '').toLowerCase().replace(/[^\p{L}\p{N}+#]+/gu, ' ').split(' ').filter((w) => w && !STOP.has(w));
}

function stem(w) {
  return w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w;
}

// Words in a role that a title may legitimately swap for another.
function variants(word, role) {
  const set = new Set([word, stem(word)]);
  if ((word === 'engineer' || word === 'developer') && SOFTWARE_FAMILY.test(role.toLowerCase())) {
    set.add('engineer'); set.add('developer'); set.add('programmer');
  }
  if (word === 'rep') set.add('representative');
  if (word === 'representative') set.add('rep');
  if (word === 'doctor') set.add('physician');
  if (word === 'physician') set.add('doctor');
  if (word === 'nurse') set.add('rn');
  return set;
}

export function titlePhrases(role) {
  const r = String(role || '').trim();
  const out = [r];
  const lower = r.toLowerCase();
  if (SOFTWARE_FAMILY.test(lower)) {
    if (lower.endsWith('engineer')) out.push(r.replace(/engineer$/i, 'Developer'));
    if (lower.endsWith('developer')) out.push(r.replace(/developer$/i, 'Engineer'));
  }
  return [...new Set(out)];
}

// The role's words must appear together, in order, in the title (plural and engineer/developer swaps allowed).
// "Data Analyst" matches "Senior Data Analyst" but not "Data Science Analyst" or "Business Analyst".
export function roleScore(title, role) {
  const wanted = words(role);
  const have = words(title).map(stem);
  if (!wanted.length || have.length < wanted.length) return 0;
  const options = wanted.map((w) => variants(w, role));
  for (let i = 0; i + wanted.length <= have.length; i++) {
    if (options.every((set, k) => set.has(have[i + k]))) {
      const extra = have.length - wanted.length;
      return 1 / (1 + extra * 0.1);
    }
  }
  return 0;
}

function pad(s) { return ' ' + String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim() + ' '; }

// A job location matches when it names one of the chosen place's names.
export function locationMatches(jobLocation, match) {
  const hay = pad(jobLocation);
  return (match || []).some((m) => hay.includes(pad(m)));
}

export const WORLDWIDE = /\b(worldwide|anywhere|global|remote)\b/i;
