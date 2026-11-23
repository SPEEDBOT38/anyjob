export const access = 'public';
export const methods = ['GET'];

export default async function (req, res) {
  return res.json({ ok: true });
}
