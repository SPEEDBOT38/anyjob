import { db } from 'hatchable';
import { columns } from 'lib/jobs.js';

export const access = 'public';
export const methods = ['GET'];

export default async function (req, res) {
  const result = await db.query(
    `SELECT ${columns} FROM job_postings WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 100`
  );
  return res.json(result.rows);
}
