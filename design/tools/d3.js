// Direction 3 — POP (Neutomni / Format / OFFF inspired): giant type, flat colour blocks, stickers, hard shadows
const { Screen } = require('./lib');
const K = { cream: '#F2ECE0', red: '#E8341C', ink: '#111111', yel: '#FFC832', white: '#FFFFFF', mute: '#6B665C', rule: '#111111' };
const IMP = 'Impact', COND = 'Franklin Gothic Demi Cond', SERIF = 'Georgia|Italic', MONO = 'Cascadia Mono';
const pal = { paper: K.white, stroke: K.ink, sw: 2, name: K.ink, sec: K.ink, line: '#D5CFC0', add: ['#FFE9A0', K.ink, K.yel], sel: ['#FFE9A0', K.ink, K.yel], del: ['#FFD6CF', K.ink, K.red], hsw: 2, hr: 0 };

const hard = (s, x, y, w, h, off = 10, c = K.ink, r = 0) => s.r(x + off, y + off, w, h, { fill: c, r, name: 'hard shadow' });
const pill = (s, x, y, w, h, label, kind = 'ink', size = 14) => {
  const k = { ink: [K.ink, null, K.cream], cream: [K.cream, K.ink, K.ink], yel: [K.yel, K.ink, K.ink], red: [K.red, K.ink, K.cream], out: ['#00000000', K.cream, K.cream] }[kind];
  s.r(x, y, w, h, { fill: k[0], stroke: k[1], sw: 2, r: h / 2, name: 'pill' }); s.t(label, x, y + h / 2 - size * .6, { w, al: 'center', size, c: k[2], f: COND, ls: 1 });
};
const sticker = (s, x, y, w, h, label, fill, tc = K.ink, rot = -6, size = 22) => { s.r(x, y, w, h, { fill, stroke: K.ink, sw: 2, r: 10, rot, name: 'sticker' }); s.t(label, x, y + h / 2 - size * .62, { w, al: 'center', size, f: IMP, c: tc, rot }); };
const marquee = (s, y, h, bg, fg, text) => { s.r(0, y, 1440, h, { fill: bg, name: 'marquee' }); s.t(text, -20, y + h / 2 - 20, { size: 36, f: IMP, c: fg, ls: 1 }); };
const nav = (s, active, onRed) => {
  const c = onRed ? K.cream : K.ink;
  s.t('ANYJOB®', 40, 26, { size: 30, f: IMP, c });
  ['HOME', 'APPLICATIONS', 'RESUMES', 'TEMPLATES', 'SETTINGS'].forEach((l, i) => { const x = 360 + i * 150; if (i === active) s.r(x, 24, 138, 40, { fill: K.ink, r: 20 }); s.t(l, x, 34, { w: 138, al: 'center', size: 15, f: COND, c: i === active ? K.cream : c, ls: 1 }); });
  pill(s, 1236, 24, 164, 40, '＋ NEW  ↗', 'yel');
};

// 01 Welcome
{
  const s = Screen('D3-01', 'Pop Welcome', 'Pop — Welcome', K.red);
  s.t('ANYJOB®', 40, 28, { size: 26, f: IMP, c: K.cream }); s.t('PRODUCT   TEMPLATES   PRICING   LOG IN', 420, 34, { size: 14, f: COND, c: K.cream, ls: 2 }); pill(s, 1216, 22, 184, 44, 'START FREE  ↗', 'ink');
  s.t('ANYJOB', 30, 60, { size: 470, f: IMP, c: K.cream, lh: 470, ls: -6 });
  sticker(s, 1120, 150, 220, 90, 'AI EDITS LIVE ✦', K.yel, K.ink, 10, 30);
  s.t('Resumes\nthat edit', 48, 540, { size: 78, f: COND, c: K.cream, lh: 74 }); s.t('themselves.', 48, 690, { size: 92, f: SERIF, c: K.cream, lh: 92 });
  pill(s, 560, 590, 300, 64, 'DROP YOUR RESUME  ↗', 'ink', 20); pill(s, 876, 590, 260, 64, 'WATCH A DEMO  ▷', 'out', 20);
  s.t('DOCX · PDF · LATEX  →  CLEAN LATEX  →  PDF · DOCX', 560, 676, { size: 12, f: MONO, c: K.cream, ls: 1.5 });
  hard(s, 1140, 410, 230, 310, 12); s.paper(1140, 410, 230, 310, pal, { 1: 'sel', 2: 'sel' }); s.r(1140, 410, 230, 310, { fill: '#00000000' });
  s.r(1010, 420, 190, 56, { fill: K.cream, stroke: K.ink, sw: 2, r: 28, name: 'bubble' }); s.t('“make it punchier”', 1010, 438, { w: 190, al: 'center', size: 15, f: SERIF, c: K.ink });
  s.t('LOCAL TIME  15:32  ·  ● OPEN FOR RESUMES', 640, 776, { size: 12, f: MONO, c: K.cream, ls: 1.5 });
  marquee(s, 810, 90, K.ink, K.yel, 'DROP DOCX ✦ DROP PDF ✦ TAILOR TO ANY JOB ✦ EXPORT ANYWHERE ✦ DROP DOCX ✦ DROP PDF ✦ TAILOR');
  s.done();
}
// 02 Home
{
  const s = Screen('D3-02', 'Pop Home', 'Pop — Home', K.cream); nav(s, 0);
  s.hl(0, 88, 1440, K.ink, 2);
  s.t('HELLO,\nDIVYA.', 40, 104, { size: 150, f: IMP, c: K.ink, lh: 140, ls: -2 });
  s.t('what are we\nediting today?', 440, 150, { size: 38, f: SERIF, c: K.ink, lh: 40 });
  s.r(760, 120, 640, 250, { fill: K.red, name: 'stat block' });
  [['12', 'APPLICATIONS'], ['78%', 'AVG MATCH'], ['2', 'INTERVIEWS']].forEach((c, i) => { const x = 780 + i * 210; s.t(c[0], x, 130, { size: 110, f: IMP, c: K.cream, lh: 110 }); s.t(c[1], x, 250, { size: 14, f: COND, c: K.cream, ls: 2 }); });
  s.t('42/100 AI EDITS USED  ·  RESETS IN 12 DAYS', 780, 320, { size: 12, f: MONO, c: K.cream, ls: 1 }); s.r(780, 346, 600, 8, { fill: K.cream, op: .3 }); s.r(780, 346, 252, 8, { fill: K.yel });
  [['01', 'IMPORT A RESUME', 'DOCX · PDF · LATEX', 1], ['02', 'TAILOR TO A JOB', 'PASTE A LINK → MATCH', 0], ['03', 'START FROM A TEMPLATE', 'AI FILLS YOUR DATA', 0]].forEach((r, i) => {
    const y = 410 + i * 100; s.hl(0, y, 1440, K.ink, 2); if (r[3]) s.r(0, y + 2, 1440, 98, { fill: K.yel });
    s.t(r[0], 40, y + 28, { size: 24, f: MONO, c: K.ink }); s.t(r[1], 120, y + 10, { size: 70, f: IMP, c: K.ink, lh: 80 }); s.t(r[2], 900, y + 38, { size: 13, f: MONO, c: K.ink, ls: 1 }); s.t('↗', 1330, y + 6, { size: 70, f: IMP });
  });
  s.hl(0, 710, 1440, K.ink, 2);
  sticker(s, 60, 740, 190, 110, 'STRIPE\nBACKEND · V3', K.white, K.ink, -4, 22); sticker(s, 270, 746, 190, 110, 'NOTION\nPM · V2', K.yel, K.ink, 3, 22); sticker(s, 480, 740, 190, 110, 'MASTER\nRESUME · V5', K.red, K.cream, -2, 22);
  s.t('CONTINUE EDITING →', 720, 770, { size: 14, f: COND, c: K.ink, ls: 2 });
  s.t('✦ Notion — PM is at 74% match. Add 2 missing keywords?', 720, 800, { size: 16, c: K.ink }); pill(s, 1216, 786, 184, 44, 'FIX WITH AI  ↗', 'ink');
  s.done();
}
// 03 Import
{
  const s = Screen('D3-03', 'Pop Import', 'Pop — Import + convert', K.cream); nav(s, null);
  s.hl(0, 88, 1440, K.ink, 2);
  s.r(40, 118, 1360, 520, { fill: '#00000000', stroke: K.ink, sw: 4, dash: [14, 10], name: 'dropzone' });
  s.t('DROP IT.', 0, 130, { w: 1440, al: 'center', size: 360, f: IMP, c: K.ink, lh: 360, ls: -4 });
  s.t('your DOCX, PDF or LaTeX — we’ll handle the rest.', 0, 520, { w: 1440, al: 'center', size: 34, f: SERIF, c: K.ink });
  sticker(s, 90, 150, 130, 64, 'DOCX', K.yel, K.ink, -12, 32); sticker(s, 1190, 168, 110, 64, 'PDF', K.red, K.cream, 9, 32); sticker(s, 1230, 440, 130, 64, '.TEX', K.ink, K.cream, -7, 32); sticker(s, 120, 430, 150, 64, '+ SCAN', K.white, K.ink, 6, 28);
  pill(s, 40, 664, 200, 44, 'PASTE TEXT', 'cream'); pill(s, 254, 664, 200, 44, 'FROM LINKEDIN', 'cream'); pill(s, 468, 664, 200, 44, 'GOOGLE DRIVE', 'cream'); pill(s, 682, 664, 240, 44, '✦ START WITH AI', 'yel');
  s.r(0, 740, 1440, 160, { fill: K.ink, name: 'progress band' });
  s.t('old_resume.docx', 40, 760, { size: 14, f: MONO, c: K.cream }); s.t('REBUILDING LAYOUT', 40, 782, { size: 56, f: IMP, c: K.yel, lh: 56 });
  s.r(560, 796, 640, 30, { fill: K.cream, op: .18 }); s.r(560, 796, 460, 30, { fill: K.red }); s.t('72%', 1216, 780, { size: 70, f: IMP, c: K.cream, lh: 70 });
  s.t('✓ READ   ✓ 6 SECTIONS   ⟳ REBUILD   ○ COMPILE   ○ COMPARE          97% LAYOUT MATCH · 2 FLAGGED', 40, 856, { size: 12, f: MONO, c: K.cream, ls: 1 });
  s.done();
}
// 04 Editor
{
  const s = Screen('D3-04', 'Pop Editor', 'Pop — Editor (Edit)', K.cream);
  s.r(0, 0, 1440, 88, { fill: K.cream }); s.t('←  STRIPE — BACKEND', 40, 26, { size: 28, f: IMP, c: K.ink });
  s.r(500, 22, 440, 46, { fill: K.cream, stroke: K.ink, sw: 2, r: 23 }); s.r(504, 26, 140, 38, { fill: K.ink, r: 19 });
  s.t('EDIT', 504, 36, { w: 140, al: 'center', size: 16, f: COND, c: K.cream, ls: 1 }); s.t('COMPARE', 650, 36, { w: 140, al: 'center', size: 16, f: COND, c: K.ink, ls: 1 }); s.t('</> CODE', 796, 36, { w: 140, al: 'center', size: 16, f: COND, c: K.ink, ls: 1 });
  s.t('SAVED ✓   V3 ▾', 1000, 36, { size: 13, f: MONO, c: K.mute }); pill(s, 1236, 24, 164, 44, 'EXPORT  ↗', 'ink');
  s.hl(0, 88, 1440, K.ink, 2);
  s.r(0, 90, 340, 810, { fill: K.cream }); s.vl(340, 90, 810, K.ink, 2);
  s.r(0, 190, 340, 74, { fill: K.red }); s.t('01\n02\n03\n04\n05\n06', 24, 112, { size: 15, f: MONO, c: K.ink, lh: 74 });
  ['HEADER', 'SUMMARY', 'EXPERIENCE', 'PROJECTS', 'EDUCATION', 'SKILLS'].forEach((l, i) => s.t(l, 70, 112 + i * 74, { size: 46, f: IMP, c: i === 1 ? K.cream : K.ink, lh: 74 }));
  hard(s, 420, 110, 480, 660, 14); s.paper(420, 110, 480, 660, pal, { 1: 'sel', 2: 'sel' });
  sticker(s, 760, 90, 190, 50, 'AI EDITED THIS ✦', K.yel, K.ink, 5, 20); sticker(s, 300, 430, 170, 50, 'WAS: “WORKED ON…”', K.red, K.cream, -5, 15);
  s.r(980, 110, 420, 680, { fill: K.ink, r: 28, name: 'agent panel' }); s.t('AGENT', 1008, 128, { size: 44, f: IMP, c: K.yel, lh: 44 }); s.t('RUN #4 · 00:21', 1290, 144, { size: 12, f: MONO, c: K.cream });
  s.r(1100, 196, 270, 62, { fill: K.cream, r: 18 }); s.t('Tailor for this job. Keep my voice, no fake numbers.', 1114, 210, { size: 13, w: 244, c: K.ink, lh: 18 });
  s.t('✓ PARSED DOCX → 12 SECTIONS\n✓ EDITED SUMMARY.TEX\n⟳ EDITING EXPERIENCE…\n○ COMPILE · CHECK 1 PAGE', 1008, 282, { size: 13, f: MONO, c: K.cream, lh: 28 });
  s.r(1008, 410, 364, 150, { fill: K.red, r: 18 }); s.t('? QUICK QUESTION', 1026, 424, { size: 22, f: IMP, c: K.cream }); s.t('No latency number found for Acme.\nUse 40% from your old CV?', 1026, 456, { size: 14, c: K.cream, lh: 20 });
  pill(s, 1026, 506, 100, 36, 'USE 40%', 'yel', 14); pill(s, 1134, 506, 110, 36, 'LEAVE OUT', 'cream', 14); pill(s, 1252, 506, 100, 36, 'TYPE…', 'cream', 14);
  s.r(1008, 700, 364, 62, { fill: K.cream, r: 31 }); s.t('Steer the agent…', 1032, 722, { size: 14, c: K.mute }); s.r(1314, 708, 46, 46, { type: 'ellipse', fill: K.yel }); s.t('↑', 1314, 716, { w: 46, al: 'center', size: 24, f: IMP, c: K.ink });
  s.t('1 PAGE ✓   ATS 92   MATCH 91%', 420, 806, { size: 13, f: MONO, c: K.ink, ls: 1 });
  marquee(s, 836, 64, K.yel, K.ink, 'AI PROPOSES ✦ YOU DECIDE ✦ AI PROPOSES ✦ YOU DECIDE ✦ AI PROPOSES ✦ YOU DECIDE ✦ AI');
  s.done();
}
// 05 Compare
{
  const s = Screen('D3-05', 'Pop Compare', 'Pop — Compare (before / after)', K.ink);
  s.r(720, 0, 720, 900, { fill: K.red, name: 'after half' });
  
  s.t('←  STRIPE — BACKEND', 40, 26, { size: 24, f: IMP, c: K.cream });
  s.r(500, 22, 440, 46, { fill: K.cream, stroke: K.ink, sw: 2, r: 23 }); s.r(654, 26, 140, 38, { fill: K.ink, r: 19 });
  s.t('EDIT', 504, 36, { w: 140, al: 'center', size: 16, f: COND, c: K.ink, ls: 1 }); s.t('COMPARE', 654, 36, { w: 140, al: 'center', size: 16, f: COND, c: K.cream, ls: 1 }); s.t('</> CODE', 796, 36, { w: 140, al: 'center', size: 16, f: COND, c: K.ink, ls: 1 });
  pill(s, 1236, 24, 164, 44, 'EXPORT  ↗', 'ink');
  hard(s, 150, 312, 400, 440, 12, K.cream); s.paper(150, 312, 400, 440, pal, { 1: 'del' });
  hard(s, 890, 312, 400, 440, 12, K.ink); s.paper(890, 312, 400, 440, pal, { 1: 'add', 2: 'add' });
  sticker(s, 590, 400, 220, 60, 'SUMMARY REWRITTEN →', K.yel, K.ink, -4, 22); sticker(s, 600, 500, 200, 60, '3 BULLETS ✦', K.white, K.ink, 4, 24); sticker(s, 590, 600, 230, 60, 'SKILLS REORDERED →', K.yel, K.ink, -3, 22);
  s.t('AFTER', 860, 100, { size: 190, f: IMP, c: K.cream, lh: 190, ls: -3 });
  s.r(0, 100, 720, 190, { fill: K.ink, name: 'mask' }); s.t('BEFORE', 40, 100, { size: 190, f: IMP, c: K.cream, lh: 190, ls: -3 });
  s.t('V2 · SHORTENED · 1 PAGE', 150, 282, { size: 13, f: MONO, c: K.cream, ls: 1.5 }); s.t('V3 · TAILORED · 7 CHANGES · MATCH 91%', 890, 282, { size: 13, f: MONO, c: K.cream, ls: 1.5 });
  [[0, 'V1 IMPORTED', K.ink, K.cream], [360, 'V2 SHORTENED', K.ink, K.cream], [720, 'V3 TAILORED ✦', K.yel, K.ink], [1080, 'V4 · AI WORKING…', K.cream, K.ink]].forEach((v, i) => { s.r(v[0], 830, 360, 70, { fill: v[2], stroke: K.cream, sw: 2, name: 'timeline seg' }); s.t(v[1], v[0], 848, { w: 360, al: 'center', size: 30, f: IMP, c: v[3], ls: 1 }); });
  pill(s, 1100, 768, 290, 48, 'ACCEPT SELECTED  ↗', 'yel', 18); pill(s, 890, 768, 190, 48, 'REJECT ALL', 'out', 18);
  s.done();
}
// 00 Style board
{
  const s = Screen('D3-00', 'Pop Style', 'Pop — style board', K.cream);
  s.t('POP', 40, 20, { size: 400, f: IMP, c: K.red, lh: 400, ls: -6 }); s.t('Neutomni-, Format- and OFFF-inspired: flat colour, giant type, hard shadows, stickers. Loud on purpose — AI is a tomato-red or sun-yellow moment.', 560, 90, { w: 520, size: 16, lh: 26, c: K.ink });
  [['CREAM', K.cream], ['TOMATO', K.red], ['INK', K.ink], ['SUN', K.yel], ['WHITE', K.white]].forEach((c, i) => { s.r(40 + i * 170, 440, 150, 150, { fill: c[1], stroke: K.ink, sw: 2 }); s.t(c[0] + '\n' + c[1], 40 + i * 170, 600, { size: 12, f: MONO, lh: 18 }); });
  s.t('Aa', 40, 660, { size: 200, f: IMP, c: K.ink, lh: 200 }); s.t('Impact — display\nFranklin Gothic Cond — labels\nGeorgia Italic — voice\nCascadia Mono — data', 330, 690, { size: 14, f: MONO, lh: 26 });
  s.t('PRINCIPLES', 900, 440, { size: 34, f: IMP }); s.hl(900, 484, 500, K.ink, 2);
  s.t('01  Type is the interface. Make it huge.\n02  Black outlines + hard offset shadows, never soft.\n03  Red = AI/danger, yellow = AI/highlight.\n04  A serif italic word adds the human voice.', 900, 500, { size: 14, lh: 30, w: 500 });
  pill(s, 900, 660, 170, 52, 'PRIMARY ↗', 'ink', 16); pill(s, 1084, 660, 170, 52, 'SECONDARY', 'cream', 16); pill(s, 1268, 660, 132, 52, 'AI ✦', 'yel', 16);
  sticker(s, 900, 740, 200, 70, 'STICKER', K.red, K.cream, -5, 30); sticker(s, 1130, 744, 250, 70, 'AI EDITED THIS ✦', K.yel, K.ink, 4, 26);
  s.done();
}
