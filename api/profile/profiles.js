import { db } from 'hatchable';

export const access = 'public';
export const methods = ['GET'];

export default async function (req, res) {
  const result = await db.query('SELECT id, full_name, data FROM profiles ORDER BY created_at DESC LIMIT 50');
  return res.json(result.rows.map((r) => ({ ...r.data, id: r.id, full_name: r.full_name })));
}
