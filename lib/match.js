// Role and location matching for job search results.
// A title matches a role when every part of the role is present, either as the same word or as a close synonym
// ("Front End Engineer" and "React Developer" for "Frontend Developer"), and the title is not a different job
// (a "UI Designer" is not a "Frontend Developer"). Exact phrases rank first.

const STOP = new Set(['a', 'an', 'the', 'and', 'of', 'for', 'to', 'in', 'at', 'with', 'on', 'i', 'ii', 'iii', 'iv', 'jr', 'sr', 'senior', 'junior', 'lead', 'principal', 'staff', 'trainee', 'fresher', 'graduate', 'entry', 'level', 'mid', 'remote', 'hybrid', 'contract', 'full', 'time', 'part', 'temporary', 'permanent', 'registered', 'certified', 'licensed']);

// Multi-word terms are joined before matching so "front end", "front-end" and "frontend" are the same word.
const PHRASES = [
  [/\bfront[\s-]*end\b/g, 'frontend'], [/\bback[\s-]*end\b/g, 'backend'], [/\bfull[\s-]*stack\b/g, 'fullstack'],
  [/\bmachine learning\b/g, 'ml'], [/\bartificial intelligence\b/g, 'ai'], [/\bgen(?:erative)?[\s-]*ai\b/g, 'ai'],
  [/\buser experience\b/g, 'ux'], [/\buser interface\b/g, 'ui'], [/\bui\s*\/\s*ux\b|\bux\s*\/\s*ui\b/g, 'ux ui'],
  [/\bhuman resources?\b/g, 'hr'], [/\bquality assurance\b/g, 'qa'], [/\breact[\s-]*native\b/g, 'reactnative'],
  [/\bsite reliability\b/g, 'sre'], [/\bbusiness intelligence\b/g, 'bi'], [/\.net\b/g, ' dotnet'], [/\bnode\.?js\b/g, 'nodejs'],
  [/\breact\.?js\b/g, 'react'], [/\bnext\.?js\b/g, 'nextjs'], [/\bvue\.?js\b/g, 'vue'], [/\bangular\.?js\b/g, 'angular'],
  [/\btalent acquisition\b/g, 'recruiter'], [/\bcustomer success\b/g, 'customersuccess'], [/\bsales development\b/g, 'sdr'],
  [/\bsoftware development engineer\b/g, 'software engineer'], [/\bdevelopment engineer\b/g, 'engineer'], [/\bsde\b/g, 'software engineer'],
  [/\bdata entry\b/g, 'dataentry'], [/\bcall cent(?:er|re)\b/g, 'callcenter'], [/\bhelp\s*desk\b/g, 'helpdesk'],
];

// Words that can stand in for each other inside a role.
const GROUPS = [
  ['developer', 'engineer', 'programmer', 'dev', 'coder'],
  ['frontend', 'ui', 'react', 'angular', 'vue', 'nextjs', 'javascript', 'typescript', 'web'],
  ['backend', 'server', 'nodejs', 'java', 'golang', 'python', 'django', 'spring', 'dotnet', 'php', 'ruby', 'rails', 'api'],
  ['fullstack', 'mern', 'mean'],
  ['mobile', 'ios', 'android', 'flutter', 'reactnative', 'swift', 'kotlin'],
  ['devops', 'sre', 'platform', 'infrastructure', 'reliability'],
  ['qa', 'quality', 'test', 'testing', 'sdet', 'tester'],
  ['ml', 'ai', 'deep', 'nlp', 'llm'],
  ['manager', 'head', 'lead'],
  ['representative', 'rep', 'executive', 'associate', 'agent'],
  ['specialist', 'executive', 'expert'],
  ['doctor', 'physician', 'mbbs'],
  ['nurse', 'rn', 'nursing'],
  ['hr', 'people'],
  ['recruiter', 'recruitment', 'recruiting', 'sourcer'],
  ['accountant', 'accounts', 'accounting'],
  ['teacher', 'educator', 'faculty', 'instructor'],
  ['writer', 'author'],
  ['support', 'service', 'helpdesk'],
  ['customer', 'client'],
  ['marketing', 'marketer'],
  ['analyst', 'analytics'],
];
const SOFTWARE = new Set(['software', 'web', 'frontend', 'backend', 'fullstack', 'mobile', 'ios', 'android', 'game', 'blockchain', 'embedded', 'devops', 'cloud', 'ml', 'ai', 'data', 'qa', 'test', 'automation', 'sre', 'platform', 'react', 'angular', 'java', 'python', 'nodejs', 'dotnet', 'php', 'salesforce', 'wordpress', 'security', 'site', 'solutions', 'mlops', 'nlp', 'computer', 'vision', 'analytics', 'application', 'systems']);

// Nouns that name the job itself. A title with a different one of these is a different job.
const HEADS = new Set(['developer', 'engineer', 'programmer', 'designer', 'manager', 'analyst', 'scientist', 'architect', 'consultant', 'specialist', 'director', 'intern', 'associate', 'executive', 'officer', 'coordinator', 'administrator', 'technician', 'writer', 'recruiter', 'assistant', 'representative', 'agent', 'accountant', 'auditor', 'teacher', 'nurse', 'doctor', 'physician', 'pharmacist', 'tester', 'owner', 'master', 'strategist', 'planner', 'researcher', 'editor', 'producer', 'marketer', 'clerk', 'operator', 'driver', 'chef', 'cook', 'controller', 'actuary', 'lawyer', 'counsel', 'paralegal', 'therapist', 'trainer', 'tutor', 'professor', 'lecturer', 'principal', 'advisor', 'adviser', 'electrician', 'plumber', 'carpenter', 'welder', 'mechanic', 'guard', 'receptionist', 'bookkeeper', 'cashier', 'supervisor', 'head', 'lead', 'dev']);

const stem = (w) => (w.length > 4 && /[^s]s$/.test(w) ? w.slice(0, -1) : w);

export function words(text) {
  let t = ' ' + String(text || '').toLowerCase() + ' ';
  for (const [re, to] of PHRASES) t = t.replace(re, ' ' + to + ' ');
  return t.replace(/[^\p{L}\p{N}+#]+/gu, ' ').split(' ').filter(Boolean).map(stem);
}

// Broad role words that also accept narrower ones ("Software Engineer" includes "Backend Engineer"), not the reverse.
const NARROWER = { software: ['backend', 'frontend', 'fullstack', 'application', 'platform', 'systems'], web: ['frontend', 'fullstack'] };

function equivalents(word, softwareRole) {
  const set = new Set([word, ...(NARROWER[word] || [])]);
  for (const g of GROUPS) {
    if (!g.includes(word)) continue;
    if (g[0] === 'developer' && !softwareRole) continue;
    g.forEach((w) => set.add(w));
  }
  return set;
}

// Returns {score, kind} where kind is 'exact' or 'similar'; score 0 means no match.
export function roleMatch(title, role) {
  const wanted = words(role).filter((w) => !STOP.has(w));
  const all = words(title);
  const have = all.filter((w) => !STOP.has(w));
  if (!wanted.length || !have.length) return { score: 0, kind: '' };
  const softwareRole = wanted.some((w) => SOFTWARE.has(w)) || /software|developer|programmer/i.test(role);
  // exact phrase, in order
  for (let i = 0; i + wanted.length <= have.length; i++) {
    if (wanted.every((w, k) => have[i + k] === w)) return { score: 1 / (1 + (have.length - wanted.length) * 0.05), kind: 'exact' };
  }
  const heads = wanted.filter((w) => HEADS.has(w));
  const mods = wanted.filter((w) => !HEADS.has(w));
  const used = new Set();
  let synonyms = 0;
  for (const w of mods) {
    const eq = equivalents(w, softwareRole);
    const hit = have.find((h) => eq.has(h) && !used.has(h));
    if (!hit) return { score: 0, kind: '' };
    used.add(hit);
    if (hit !== w) synonyms++;
  }
  const titleHeads = have.filter((h) => HEADS.has(h) && !used.has(h));
  let headOk = !heads.length;
  for (const w of heads) {
    const eq = equivalents(w, softwareRole);
    if (have.some((h) => eq.has(h))) { headOk = true; if (!have.includes(w)) synonyms++; }
    // the job noun that ends the title decides what the job is: "Nursing Assistant" is not a nurse
    const last = [...all].reverse().find((h) => HEADS.has(h));
    if (headOk && last && !eq.has(last)) return { score: 0, kind: '' };
  }
  if (!headOk) {
    // "Senior Frontend Angular" names no job noun at all: still the same kind of job, ranked lower.
    if (titleHeads.length) return { score: 0, kind: '' };
    return { score: 0.55, kind: 'similar' };
  }
  return { score: synonyms ? 0.75 - synonyms * 0.05 : 0.85, kind: synonyms ? 'similar' : 'exact' };
}

export function roleScore(title, role) { return roleMatch(title, role).score; }

function pad(s) { return ' ' + String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim() + ' '; }

// A job location matches when it names one of the chosen place's names.
export function locationMatches(jobLocation, match) {
  const hay = pad(jobLocation);
  return (match || []).some((m) => hay.includes(pad(m)));
}

export const WORLDWIDE = /\b(worldwide|anywhere|global|remote)\b/i;
