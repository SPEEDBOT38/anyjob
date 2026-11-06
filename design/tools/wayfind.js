// Wayfind design tokens and drawing helpers, shared by wf.js and sg.js.
const { btn, resume } = require('./kit');
const M = 'Consolas', MB = 'Consolas|Bold';
const PL = { paper: '#EDF0F4', p2: '#E1E5EB', p3: '#FCFDFE', ink: '#0E121B', ink2: '#2A2F3A', mute: '#5B6271', rule: '#C3C8D0', inkRule: '#343A46', co: '#2F5BE7', coSoft: '#DCE4FB', am: '#F3B526', amSoft: '#FCE9B6', dim: '#9AA1AE', soft: '#C9CED8', plate: '#1A2130' };
const NI = { paper: '#0B0F17', p2: '#121826', p3: '#1A2130', ink: '#F1F3F7', ink2: '#C9CED8', mute: '#8A92A3', rule: '#2B3240', co: '#4F7BFF', coSoft: '#1C2A55', am: '#F3B526' };
const SG = { co: '#2F5BE7', deep: '#2449C4', line: '#8FA6F2', white: '#FFFFFF' };
const PAGE = { head: MB, body: M, ink: PL.ink, ink2: PL.ink2, mute: PL.mute, rule: PL.rule };
const EDITS = [
  { ln: 'L6', sec: 'Summary', chg: 'Tighten to one line', w: '−9', st: 'Live', before: 'who ships payment systems', after: 'for payment systems' },
  { ln: 'L12', sec: 'Experience', chg: 'Lead with the result', w: '+2', st: 'Next', before: 'Cut payout API p95 latency', after: 'p95 latency, 420 to 180 ms' },
  { ln: 'L19', sec: 'Experience', chg: 'Say what you ran', w: '+2', st: 'Next', before: 'Built the card ledger', after: 'Built and ran the card ledger' },
  { ln: 'L23', sec: 'Skills', chg: 'Put Go and Postgres first', w: '0', st: 'Done', before: 'Go, Postgres, Kafka', after: 'Go, Postgres, then Kafka' },
];
const T = (s, text, x, y, size, c, bold, o = {}) => s.t(text, x, y, { size, c, f: bold ? MB : M, ...o });
const B = (s, x, y, w, h, l, kind, P = PL) => {
  const k = { co: { fill: P.co, c: '#FFFFFF' }, am: { fill: PL.am, c: PL.ink }, ink: { fill: PL.ink, c: '#FFFFFF' }, paper: { fill: PL.p3, c: PL.ink },
    out: { stroke: P.ink, sw: 2, c: P.ink }, outW: { stroke: '#FFFFFF', sw: 2, c: '#FFFFFF' } }[kind];
  btn(s, x, y, w, h, l, { ...k, f: MB, size: h > 44 ? 15 : 13 });
};
const live = (s, x, y, P = PL) => btn(s, x, y, 66, 26, 'Live', { fill: P.co, c: '#FFFFFF', r: 13, f: MB, size: 12 });
const status = (s, x, y, st, P = PL, onInk = true) => st === 'Live' ? live(s, x, y, P) : T(s, st, x, y + 5, 13, st === 'Done' ? (onInk ? PL.dim : PL.mute) : (onInk ? PL.am : PL.ink), st !== 'Done', { w: 66, al: 'center' });
const seg = (s, x, y, w, labels, on, c = { line: PL.ink, txt: PL.ink, onFill: PL.ink, onTxt: '#FFFFFF' }, h = 40) => labels.forEach((l, i) => {
  const cw = w / labels.length, a = i === on; s.r(x + i * cw, y, cw, h, { fill: a ? c.onFill : '#00000000', stroke: c.line, sw: 2, name: 'segment' });
  T(s, l, x + i * cw, y + h / 2 - 8, 13, a ? c.onTxt : c.txt, a, { w: cw, al: 'center' });
});
const page = (s, x, y, w, marks = {}, o = {}) => { s.r(x, y, w, w * 1.414, { fill: PL.p3, stroke: o.stroke || PL.ink, sw: 2, shadow: o.shadow, name: 'page' }); return resume(s, x, y, w, { ...PAGE, marks }); };
const navTop = (s, P = PL, o = {}) => {
  if (o.bar !== false) s.r(0, 0, 1440, 64, { fill: o.bar || PL.ink, name: 'nav' });
  const c = o.c || '#FFFFFF'; T(s, 'AnyJob', 64, 20, 21, c, true);
  [['How it works', 880], ['Templates', 1018], ['Pricing', 1132]].forEach(([l, x]) => T(s, l, x, 23, 14, c));
  B(s, 1240, 14, 136, 36, 'Start free', o.btn || 'outW', P);
};
const navApp = (s, active, o = {}) => {
  s.r(0, 0, 1440, 64, { fill: PL.ink, name: 'nav' }); T(s, 'AnyJob', 32, 20, 21, '#FFFFFF', true);
  [['Applications', 190], ['Resumes', 340], ['Templates', 450]].forEach(([l, x]) => { T(s, l, x, 23, 14, l === active ? '#FFFFFF' : PL.dim, l === active); if (l === active) s.r(x, 60, l.length * 7.7, 4, { fill: PL.am, name: 'active' }); });
  B(s, 1216, 14, 192, 36, o.cta || 'New application', 'co');
};
// Before/after diff block on ink
const diff = (s, x, y, w, e, P = PL) => {
  s.r(x, y, w, 128, { fill: P === NI ? NI.p3 : PL.plate, name: 'diff' });
  T(s, 'Before', x + 14, y + 12, 12, PL.dim); T(s, e.before, x + 14, y + 32, 14, PL.dim); s.hl(x + 14, y + 41, e.before.length * 7.7, PL.dim, 1);
  T(s, 'After', x + 14, y + 66, 12, PL.am, true); T(s, e.after, x + 14, y + 86, 14, '#FFFFFF');
};
module.exports = { M, MB, PL, NI, SG, PAGE, EDITS, T, B, live, status, seg, page, diff, navTop, navApp };
