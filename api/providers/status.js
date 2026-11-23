import { optional } from 'lib/secrets.js';

export const access = 'public';
export const methods = ['GET'];

export default async function (req, res) {
  return res.json({
    kilo: Boolean(await optional('KILO_API_KEY')),
    apify: Boolean(await optional('APIFY_API_TOKEN')),
  });
}
