// Shared drawing helpers: buttons, the sample resume, the sample LaTeX.
const btn = (s, x, y, w, h, label, o = {}) => {
  s.r(x, y, w, h, { fill: o.fill || '#00000000', stroke: o.stroke, sw: o.sw || 1, r: o.r ?? 0, name: 'button' });
  s.t(label, x, y + h / 2 - (o.size || 14) * 0.62, { w, al: 'center', size: o.size || 14, f: o.f, c: o.c });
};

// Sample resume as real text; returns row y positions so callers can mark lines.
const RESUME = [
  ['name', 'Aarav Mehta'], ['contact', 'aarav@mail.com     Bengaluru     github.com/aarav'],
  ['head', 'Summary'], ['text', 'Backend engineer who ships payment systems that stay up.'],
  ['head', 'Experience'], ['role', 'Backend Engineer, Razorpay', '2023 to now'],
  ['bullet', 'Cut payout API p95 latency from 420 ms to 180 ms'], ['bullet', 'Moved 40 services to Postgres 15 with no downtime'],
  ['bullet', 'Mentored four new engineers through their first launch'],
  ['role', 'Software Engineer, Zeta', '2021 to 2023'], ['bullet', 'Built the card ledger used by three bank partners'],
  ['bullet', 'Wrote the on-call runbook the team still uses'],
  ['head', 'Projects'], ['text', 'pgwatch-lite, a small Postgres monitor written in Go'],
  ['head', 'Education'], ['role', 'B.Tech Computer Science, VIT', '2021'],
  ['head', 'Skills'], ['text', 'Go, Postgres, Kafka, Kubernetes, TypeScript'],
];
function resume(s, x, y, w, p) {
  const k = w / 440, L = x + 34 * k, R = x + w - 34 * k, ys = [];
  let cy = y + 36 * k; const mk = p.marks || {};
  for (const [kind, a, b] of RESUME) {
    const m = mk[ys.length]; if (m) s.r(L - 6 * k, cy - 3 * k, R - L + 12 * k, 15 * k, { fill: m.fill, op: m.op, r: m.r ?? 0, name: 'mark' });
    ys.push(cy);
    if (kind === 'name') { s.t(a, L, cy, { size: 20 * k, f: p.head, c: p.ink }); cy += 28 * k; }
    else if (kind === 'contact') { s.t(a, L, cy, { size: 7.5 * k, f: p.body, c: p.mute }); cy += 22 * k; }
    else if (kind === 'head') { cy += 6 * k; ys[ys.length - 1] = cy; s.t(a, L, cy, { size: 9.5 * k, f: p.headB || p.head, c: p.ink }); s.hl(L, cy + 14 * k, R - L, p.rule); cy += 21 * k; }
    else if (kind === 'role') { s.t(a, L, cy, { size: 8.5 * k, f: p.bodyB || p.body, c: p.ink }); s.t(b, R - 90 * k, cy, { w: 90 * k, al: 'right', size: 7.5 * k, f: p.body, c: p.mute }); cy += 15 * k; }
    else if (kind === 'bullet') { s.r(L + 3 * k, cy + 5 * k, 2.5 * k, 2.5 * k, { fill: p.ink, name: 'bullet' }); s.t(a, L + 12 * k, cy, { size: 8 * k, f: p.body, c: p.ink2 || p.ink }); cy += 14 * k; }
    else { s.t(a, L, cy, { size: 8 * k, f: p.body, c: p.ink2 || p.ink }); cy += 15 * k; }
  }
  return { ys, L, R, k };
}

const TEX = [
  '\\documentclass[11pt]{anyjob}', '\\name{Aarav Mehta}', '\\contact{aarav@mail.com}{Bengaluru}', '',
  '\\section{Summary}', 'Backend engineer who ships payment', 'systems that stay up.', '',
  '\\section{Experience}', '\\role{Backend Engineer}{Razorpay}{2023--}', '\\begin{bullets}',
  '  \\item Cut payout API p95 latency', '        from 420\\,ms to 180\\,ms', '  \\item Moved 40 services to Postgres 15',
  '  \\item Mentored four new engineers', '\\end{bullets}', '\\role{Software Engineer}{Zeta}{2021--23}',
  '\\begin{bullets}', '  \\item Built the card ledger for 3 banks', '\\end{bullets}', '', '\\section{Skills}', 'Go, Postgres, Kafka, Kubernetes',
];
// marks: {lineNo(1-based): {bg, bar, c}}
function code(s, x, y, p, marks = {}, n = TEX.length) {
  for (let i = 0; i < n; i++) {
    const ly = y + i * p.lh, m = marks[i + 1];
    if (m) { s.r(x - 8, ly - 3, p.w, p.lh, { fill: m.bg || '#00000000', name: 'line mark' }); if (m.bar) s.r(x - 8, ly - 3, 3, p.lh, { fill: m.bar, name: 'gutter' }); }
    s.t(String(i + 1).padStart(2, ' '), x, ly, { size: p.size, f: p.f, c: p.num });
    s.t(TEX[i], x + p.size * 2.6, ly, { size: p.size, f: p.f, c: m?.c || p.c });
  }
}

module.exports = { btn, resume, code, RESUME, TEX };
