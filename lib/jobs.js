import { db } from 'hatchable';

export const columns = 'id, source, title, company, location, description, source_url, posted_date, is_active';

export function stripHtml(html) {
  let t = String(html || '');
  // Some boards send entity-encoded HTML (&lt;div&gt;): decode tags first so they can be stripped.
  if (/&lt;\/?[a-z]/i.test(t)) t = t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  return t
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<(br|\/p|\/li|\/h[1-6]|\/div|\/ul)\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function saveJob(job) {
  await db.query(
    `INSERT INTO job_postings (id, source, title, company, location, description, source_url, posted_date, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE)
     ON CONFLICT (id) DO UPDATE SET is_active = TRUE, description = EXCLUDED.description`,
    [job.id, job.source, job.title, job.company, job.location, job.description, job.source_url, job.posted_date || null]
  );
}
