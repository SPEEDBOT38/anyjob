import { db } from 'hatchable';

export const columns = 'id, source, title, company, location, description, source_url, posted_date, is_active';

export function stripHtml(html) {
  return String(html || '')
    .replace(/<(br|\/p|\/li|\/h[1-6])\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
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
