import { chat, chatJson } from 'lib/ai.js';

export const access = 'public';
export const methods = ['POST'];

// AI helpers for one application. The CV is the only source of facts: nothing here may add employers,
// titles, dates, degrees, tools or numbers that the CV does not already contain.
const RULES = 'You help a job seeker present their OWN experience for a specific job. Hard rules: never invent employers, job titles, dates, degrees, certifications, tools, metrics or achievements that are not in the CV. You may rephrase, reorder, merge, tighten and choose words from the job post only where the CV supports them. Write in plain, specific English without buzzwords or clichés.';

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const nums = (s) => (String(s).match(/\d+(?:[.,]\d+)?%?/g) || []).map((n) => n.replace(',', '.'));
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// A rewrite may only use numbers that already appear in the CV.
function honest(text, cv) {
  const have = new Set(nums(cv));
  return nums(text).every((n) => have.has(n));
}

const TASKS = {
  async fit({ cv, jd }) {
    const { json, model } = await chatJson([
      { role: 'system', content: RULES + ' Return only JSON.' },
      { role: 'user', content: 'Assess how well this CV fits the job. Return JSON: {"score": integer 0-100, "verdict": "one sentence", "strengths": [{"requirement": "...", "evidence": "short quote from the CV"}] (max 6), "gaps": [{"requirement": "...", "advice": "honest, practical advice"}] (max 5), "keywords": [job keywords the CV already shows] (max 12), "missing_keywords": [important job keywords absent from the CV] (max 10), "questions": [questions to ask the candidate that could reveal relevant experience not written down] (max 3)}.\n\nJOB POST:\n' + jd + '\n\nCV:\n' + cv },
    ], { maxTokens: 1400 });
    const out = {
      score: Math.max(0, Math.min(100, parseInt(json.score, 10) || 0)),
      verdict: str(json.verdict, 400),
      strengths: (Array.isArray(json.strengths) ? json.strengths : []).slice(0, 6).map((s) => ({ requirement: str(s.requirement, 200), evidence: str(s.evidence, 300) })).filter((s) => s.requirement),
      gaps: (Array.isArray(json.gaps) ? json.gaps : []).slice(0, 5).map((s) => ({ requirement: str(s.requirement, 200), advice: str(s.advice, 300) })).filter((s) => s.requirement),
      keywords: (Array.isArray(json.keywords) ? json.keywords : []).slice(0, 12).map((k) => str(k, 40)).filter(Boolean),
      missing_keywords: (Array.isArray(json.missing_keywords) ? json.missing_keywords : []).slice(0, 10).map((k) => str(k, 40)).filter(Boolean),
      questions: (Array.isArray(json.questions) ? json.questions : []).slice(0, 3).map((k) => str(k, 200)).filter(Boolean),
    };
    return { ...out, model };
  },

  async tailor({ cv, jd, tone }) {
    const { json, model } = await chatJson([
      { role: 'system', content: RULES + ' Return only JSON.' },
      { role: 'user', content: 'Suggest edits that make this CV fit the job better. Tone: ' + (tone || 'Balanced') + '. Return JSON: {"headline": "a headline for the top of the CV using a title the candidate has actually held or is clearly qualified for", "summary": "2-3 sentence professional summary built only from CV facts, aimed at this job", "bullets": [{"original": "the exact bullet text copied from the CV", "improved": "a stronger version of the same bullet: lead with impact, use the job\'s vocabulary where true, keep every number unchanged", "why": "under 12 words"}] (only bullets worth changing, max 8), "skills_first": [skills from the CV to list first for this job] (max 10)}.\n\nJOB POST:\n' + jd + '\n\nCV:\n' + cv },
    ], { maxTokens: 2200 });
    const cvNorm = norm(cv);
    const bullets = (Array.isArray(json.bullets) ? json.bullets : []).map((b) => ({ original: str(b.original, 500).replace(/^\s*[-•*]\s*/, ''), improved: str(b.improved, 500).replace(/^\s*[-•*]\s*/, ''), why: str(b.why, 120) }))
      .filter((b) => b.original && b.improved && b.original !== b.improved && cvNorm.includes(norm(b.original).slice(0, 60)) && honest(b.improved, cv))
      .slice(0, 8);
    const summary = str(json.summary, 900);
    return {
      headline: str(json.headline, 120),
      summary: honest(summary, cv) ? summary : '',
      bullets,
      skills_first: (Array.isArray(json.skills_first) ? json.skills_first : []).slice(0, 10).map((k) => str(k, 40)).filter((k) => k && cvNorm.includes(norm(k))),
      model,
    };
  },

  async cover({ cv, jd, company, role, tone }) {
    const { text, model } = await chat([
      { role: 'system', content: RULES + ' Write only the letter text.' },
      { role: 'user', content: 'Write a cover letter (230-320 words, 4 short paragraphs) for the ' + (role || 'role') + (company ? ' at ' + company : '') + '. Tone: ' + (tone || 'Balanced') + '. Open with why this role, connect 2-3 concrete CV achievements to the job\'s main needs, close with a confident, polite call to action. Start with "Dear Hiring Manager," unless a name is in the job post. End with "Sincerely," and the candidate\'s name from the CV. No placeholders in brackets.\n\nJOB POST:\n' + jd + '\n\nCV:\n' + cv },
    ], { maxTokens: 1200 });
    return { letter: text.trim().replace(/^```\w*\n?|```$/g, '').trim(), model };
  },

  async bullet({ cv, jd, bullet }) {
    const { json, model } = await chatJson([
      { role: 'system', content: RULES + ' Return only JSON.' },
      { role: 'user', content: 'Rewrite this CV bullet three different ways for the job below. Keep its facts and numbers; do not add new ones. Each under 30 words, starting with a strong verb. Return JSON {"options": ["...", "...", "..."]}.\n\nBULLET: ' + bullet + '\n\nJOB POST:\n' + jd.slice(0, 6000) + '\n\nCV (for context only):\n' + cv.slice(0, 8000) },
    ], { maxTokens: 500 });
    const options = (Array.isArray(json.options) ? json.options : []).map((o) => str(o, 300).replace(/^\s*[-•*]\s*/, '')).filter((o) => o && honest(o, cv + ' ' + bullet)).slice(0, 3);
    return { options, model };
  },

  async clean({ cv }) {
    const { text, model } = await chat([
      { role: 'system', content: 'You reformat CV text that was extracted from a PDF or Word file. Keep every fact and keep the wording; only fix broken lines and layout. Output only the CV text.' },
      { role: 'user', content: 'Rewrite this CV text in this exact plain-text layout:\nLine 1: full name\nLine 2: current title or headline (if present)\nLine 3: contact details separated by " | " (email | phone | links | city)\nThen sections separated by a blank line. Each section starts with its heading alone on a line (Summary, Experience, Projects, Education, Skills, Certifications, Awards, Languages, ...).\nFor each job or degree: "Role, Organisation  Start - End" on one line (two spaces before the dates), then an optional line with team or location, then each bullet on its own line starting with "- ".\nSkills as lines like "Category: item, item, item".\nDo not drop, add or invent anything.\n\nCV TEXT:\n' + cv },
    ], { maxTokens: 3500 });
    const cleaned = text.trim().replace(/^```\w*\n?|```$/g, '').trim();
    // Guard: the cleaned CV must keep nearly all of the original words.
    const before = new Set(norm(cv).split(' ').filter((w) => w.length > 3));
    const after = new Set(norm(cleaned).split(' '));
    const kept = [...before].filter((w) => after.has(w)).length / Math.max(1, before.size);
    if (kept < 0.9) { const e = new Error('The AI tidy-up dropped too much of your CV, so it was discarded. Edit the text manually instead.'); e.status = 422; throw e; }
    return { cv: cleaned, kept: Math.round(kept * 100), model };
  },
};

export default async function (req, res) {
  const body = req.body || {};
  const task = str(body.task, 20);
  if (!TASKS[task]) return res.status(400).json({ error: 'Unknown task.' });
  const cv = str(body.cv, 40000);
  const jd = str(body.jd, 30000);
  if (!cv.trim()) return res.status(400).json({ error: 'Add your CV first.' });
  if (['fit', 'tailor', 'cover', 'bullet'].includes(task) && !jd.trim()) return res.status(400).json({ error: 'Add the job post first.' });
  try {
    const out = await TASKS[task]({ cv, jd, tone: str(body.tone, 20), company: str(body.company, 120), role: str(body.role, 120), bullet: str(body.bullet, 600) });
    return res.json(out);
  } catch (e) {
    return res.status(e.status || 502).json({ error: e.status ? e.message : 'The AI request failed. Try again in a moment.' });
  }
}
