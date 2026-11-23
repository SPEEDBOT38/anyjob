// Turn a typed or picked location into the names a job post might use for it.
// [country, [country aliases], [[city, alias...], ...]]
const PLACES = [
  ['India', ['india'], [['Bengaluru', 'bangalore'], ['Mumbai', 'bombay'], ['Delhi', 'new delhi'], ['Hyderabad'], ['Chennai', 'madras'], ['Pune'], ['Kolkata', 'calcutta'], ['Ahmedabad'], ['Gurugram', 'gurgaon'], ['Noida'], ['Jaipur'], ['Kochi', 'cochin'], ['Chandigarh'], ['Indore']]],
  ['United States', ['united states', 'usa', 'us', 'u s', 'america'], [['New York', 'nyc'], ['San Francisco', 'bay area'], ['Los Angeles'], ['Chicago'], ['Seattle'], ['Austin'], ['Boston'], ['Atlanta'], ['Dallas'], ['Denver'], ['Washington', 'washington dc'], ['Miami'], ['San Jose'], ['Houston'], ['Philadelphia'], ['Phoenix']]],
  ['United Kingdom', ['united kingdom', 'uk', 'england', 'scotland', 'wales', 'great britain'], [['London'], ['Manchester'], ['Birmingham'], ['Edinburgh'], ['Bristol'], ['Leeds'], ['Glasgow'], ['Cambridge']]],
  ['Canada', ['canada'], [['Toronto'], ['Vancouver'], ['Montreal', 'montréal'], ['Calgary'], ['Ottawa']]],
  ['Australia', ['australia'], [['Sydney'], ['Melbourne'], ['Brisbane'], ['Perth'], ['Adelaide']]],
  ['Germany', ['germany', 'deutschland'], [['Berlin'], ['Munich', 'münchen'], ['Hamburg'], ['Frankfurt'], ['Cologne', 'köln']]],
  ['France', ['france'], [['Paris'], ['Lyon'], ['Toulouse']]],
  ['Netherlands', ['netherlands', 'nederland', 'holland'], [['Amsterdam'], ['Rotterdam'], ['Utrecht']]],
  ['Spain', ['spain', 'españa'], [['Madrid'], ['Barcelona'], ['Valencia']]],
  ['Italy', ['italy', 'italia'], [['Milan', 'milano'], ['Rome', 'roma']]],
  ['Ireland', ['ireland'], [['Dublin']]],
  ['Switzerland', ['switzerland'], [['Zurich', 'zürich'], ['Geneva']]],
  ['Sweden', ['sweden'], [['Stockholm']]],
  ['Poland', ['poland'], [['Warsaw'], ['Krakow', 'kraków']]],
  ['Portugal', ['portugal'], [['Lisbon']]],
  ['Singapore', ['singapore'], []],
  ['United Arab Emirates', ['united arab emirates', 'uae'], [['Dubai'], ['Abu Dhabi']]],
  ['Saudi Arabia', ['saudi arabia', 'ksa'], [['Riyadh']]],
  ['Pakistan', ['pakistan'], [['Karachi'], ['Lahore'], ['Islamabad']]],
  ['Bangladesh', ['bangladesh'], [['Dhaka']]],
  ['Sri Lanka', ['sri lanka'], [['Colombo']]],
  ['Philippines', ['philippines'], [['Manila']]],
  ['Indonesia', ['indonesia'], [['Jakarta']]],
  ['Malaysia', ['malaysia'], [['Kuala Lumpur']]],
  ['Japan', ['japan'], [['Tokyo'], ['Osaka']]],
  ['South Korea', ['south korea', 'korea'], [['Seoul']]],
  ['China', ['china'], [['Shanghai'], ['Beijing'], ['Shenzhen']]],
  ['Hong Kong', ['hong kong'], []],
  ['New Zealand', ['new zealand'], [['Auckland']]],
  ['Brazil', ['brazil', 'brasil'], [['São Paulo', 'sao paulo'], ['Rio de Janeiro']]],
  ['Mexico', ['mexico', 'méxico'], [['Mexico City', 'ciudad de méxico']]],
  ['Argentina', ['argentina'], [['Buenos Aires']]],
  ['South Africa', ['south africa'], [['Johannesburg'], ['Cape Town']]],
  ['Nigeria', ['nigeria'], [['Lagos']]],
  ['Kenya', ['kenya'], [['Nairobi']]],
  ['Egypt', ['egypt'], [['Cairo']]],
];

const norm = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// "Berlin" -> "Berlin Germany": add the country when a job location only names a known city.
export function withCountry(jobLocation) {
  const hay = ' ' + norm(jobLocation) + ' ';
  const found = [];
  for (const [country, , cities] of PLACES) {
    for (const [city, ...alts] of cities) {
      if ([city, ...alts].some((c) => hay.includes(' ' + norm(c) + ' '))) found.push(country);
    }
  }
  return found.length ? jobLocation + ', ' + [...new Set(found)].join(', ') : String(jobLocation || '');
}

// Returns { query, match[], remote } for any location text, or null when it is empty.
export function resolveLocation(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  const n = norm(raw);
  if (/^(remote|work from home|wfh|anywhere|worldwide)$/.test(n)) return { query: 'Remote', match: [], remote: true, label: 'Remote' };
  const parts = raw.split(',').map(norm).filter(Boolean);
  for (const [country, names, cities] of PLACES) {
    for (const [city, ...alts] of cities) {
      const cityNames = [city, ...alts].map(norm);
      if (parts.some((p) => cityNames.includes(p)) || cityNames.includes(n)) {
        return { query: city + ', ' + country, match: [city, ...alts], remote: false, label: city + ', ' + country };
      }
    }
  }
  for (const [country, names] of PLACES) {
    const all = [country, ...names].map(norm);
    if (parts.some((p) => all.includes(p)) || all.includes(n)) {
      return { query: country, match: [country, ...names], remote: false, label: country };
    }
  }
  // Unknown place: match the text itself (first part of "City, Region").
  return { query: raw, match: [parts[0] || raw], remote: false, label: raw };
}
