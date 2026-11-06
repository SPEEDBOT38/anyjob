// Direction 1 — BLUEPRINT (Heron AI / engineering-drawing inspired)
const { Screen } = require('./lib');
const K = { bg: '#EFE8DD', card: '#F7F2E9', ink: '#1C1B19', mute: '#7A7367', rule: '#CFC6B6', or: '#FF4A1C', orBg: '#FFE3D8', paper: '#FBF8F2' };
const DISP = 'Bahnschrift|SemiBold Condensed', MONO = 'Consolas';
const pal = { paper: K.paper, stroke: K.ink, name: K.ink, sec: '#55504A', line: '#D9D1C3', shadow: null, add: [K.orBg, K.or, '#FFA68C'], del: ['#EDE6DA', K.mute, '#C9C0B0'], sel: [K.orBg, K.or, '#FFA68C'], hr: 0, hsw: 1.5 };

function chrome(s, sheet, title = 'ANYJOB ® RESUME STUDIO') {
  s.r(14, 14, 1412, 872, { fill: '#00000000', stroke: K.ink, op: .35, dash: [2, 4], name: 'inset frame' });
  [[14, 14], [1426, 14], [14, 886], [1426, 886]].forEach(c => s.cross(c[0], c[1], K.ink, 7));
  s.t(title, 36, 28, { size: 10, f: MONO, c: K.ink, ls: 1.5 });
  s.t(`SHEET ${sheet} / 05  ·  REV C`, 1160, 28, { size: 10, f: MONO, c: K.mute, ls: 1.5, w: 244, al: 'right' });
}
const tag = (s, x, y, w, id, text, o = {}) => { s.r(x, y, w, o.h || 52, { fill: K.or, name: 'tag ' + id }); s.t(id, x + 10, y + 8, { size: 9, f: MONO, c: '#FFFFFF', ls: 1, op: .8 }); s.t(text, x + 10, y + 22, { size: 11, f: MONO, c: '#FFFFFF', lh: 13, ls: .5 }); };
const leader = (s, x1, y1, x2, y2) => { if (y1 === y2) s.hl(Math.min(x1, x2), y1, Math.abs(x2 - x1), K.or, 1); else s.vl(x1, Math.min(y1, y2), Math.abs(y2 - y1), K.or, 1); s.r(x2 - 3, y2 - 3, 7, 7, { fill: K.or, name: 'leader end' }); };
const btn = (s, x, y, w, h, label, kind = 'or') => { s.r(x, y, w, h, { fill: kind === 'or' ? K.or : kind === 'ink' ? K.ink : '#00000000', stroke: kind === 'out' ? K.ink : null, name: 'btn' }); s.t(label, x, y + h / 2 - 7, { w, al: 'center', size: 11, f: MONO, c: kind === 'out' ? K.ink : '#FFFFFF', ls: 1.2 }); };

// 01 Welcome
{
  const s = Screen('D1-01', 'Blueprint Welcome', 'Blueprint — Welcome', K.bg); chrome(s, '01');
  s.t('PRODUCT     TEMPLATES     PRICING     LOG IN', 640, 62, { size: 10, f: MONO, ls: 1.5 }); btn(s, 1250, 52, 150, 32, 'START ↗');
  s.r(300, 108, 840, 440, { fill: '#00000000', stroke: K.or, op: .55, dash: [4, 4], name: 'drafting frame' });
  [[300, 108], [1140, 108], [300, 548], [1140, 548]].forEach(c => s.cross(c[0], c[1], K.or, 6));
  s.paper(560, 128, 320, 400, pal, { 0: 'sel', 2: 'sel' });
  s.dimH(560, 880, 114, '210 MM', K.ink, { f: MONO }); s.dimV(902, 128, 528, '297 MM', K.ink, { f: MONO });
  tag(s, 330, 236, 200, 'A1', 'REWRITE SUMMARY\nFOR BACKEND ROLE'); leader(s, 530, 259, 592, 259);
  tag(s, 930, 330, 190, 'A2', 'ADD METRIC · P95\n−40% LATENCY'); leader(s, 930, 353, 852, 353);
  tag(s, 330, 430, 200, 'A3', 'REORDER SKILLS\nGO · POSTGRES FIRST'); leader(s, 530, 453, 592, 453);
  s.t('AN AI THAT EDITS\nYOUR RESUME — LIVE.', 40, 590, { size: 88, f: DISP, lh: 86, ls: -1, c: K.ink });
  s.t('Drop the DOCX or PDF you already have. AnyJob turns it into clean LaTeX, proposes every change as a marked-up annotation, and applies only what you approve.', 900, 612, { size: 14, w: 440, lh: 22, c: '#3A372F' });
  btn(s, 900, 716, 210, 44, 'DROP DOCX / PDF ↗'); btn(s, 1124, 716, 200, 44, 'SEE HOW IT WORKS', 'out');
  s.hl(40, 824, 1360, K.ink, 1);
  ['→ FASTER TAILORING', '→ NO INVENTED NUMBERS', '→ KEEPS YOUR LAYOUT', '→ EXPORT PDF · DOCX · TEX'].forEach((t, i) => s.t(t, 40 + i * 340, 842, { size: 10, f: MONO, ls: 1.5 }));
  s.done();
}
// 02 Home — drawing register
{
  const s = Screen('D1-02', 'Blueprint Home', 'Blueprint — Home / register', K.bg); chrome(s, '02');
  s.t('01  HOME  ●\n02  APPLICATIONS\n03  RESUMES\n04  TEMPLATES\n05  IMPORTS\n06  SETTINGS', 40, 100, { size: 11, f: MONO, lh: 30, ls: 1 });
  s.r(36, 106, 3, 18, { fill: K.or });
  s.t('USAGE  42/100', 40, 780, { size: 10, f: MONO, c: K.mute, ls: 1 }); s.r(40, 800, 180, 4, { fill: K.rule }); s.r(40, 800, 76, 4, { fill: K.or });
  s.vl(260, 70, 790, K.rule);
  s.t('GOOD MORNING,\nDIVYA.', 300, 80, { size: 68, f: DISP, lh: 64, ls: -1 });
  s.t('DRAWING REGISTER · 12 ACTIVE SHEETS', 300, 226, { size: 10, f: MONO, c: K.mute, ls: 1.5 });
  [['S-01', 'IMPORT\nA RESUME', 'DOCX · PDF · TEX', 1], ['S-02', 'TAILOR\nTO A JOB', 'PASTE LINK → MATCH', 0], ['S-03', 'START FROM\nTEMPLATE', 'AI FILLS YOUR DATA', 0]].forEach((c, i) => {
    const x = 300 + i * 232; s.r(x, 262, 216, 168, { fill: c[3] ? K.or : K.card, stroke: c[3] ? null : K.ink, name: 'sheet card' });
    s.t(c[0], x + 14, 274, { size: 10, f: MONO, c: c[3] ? '#FFFFFF' : K.mute, ls: 1 }); s.t(c[1], x + 14, 300, { size: 30, f: DISP, lh: 30, c: c[3] ? '#FFFFFF' : K.ink });
    s.t(c[2], x + 14, 378, { size: 9, f: MONO, c: c[3] ? '#FFFFFF' : K.mute, ls: 1 }); s.t('↗', x + 180, 270, { size: 18, c: c[3] ? '#FFFFFF' : K.ink });
  });
  s.t('ID        ROLE                           COMPANY         MATCH           STATUS         REV', 300, 470, { size: 10, f: MONO, c: K.mute, ls: 1 }); s.hl(300, 492, 700, K.ink, 1);
  [['A-014', 'BACKEND ENGINEER', 'STRIPE', 91, '[APPLIED]', 'C'], ['A-013', 'PRODUCT MANAGER', 'NOTION', 74, '[DRAFT]', 'B'], ['A-012', 'SDE II', 'ATLASSIAN', 82, '[INTERVIEW]', 'A'], ['A-011', 'DATA ANALYST', 'RAZORPAY', 68, '[DRAFT]', 'B'], ['A-010', 'ML ENGINEER', 'SWIGGY', 59, '[DRAFT]', 'A']].forEach((r, i) => {
    const y = 506 + i * 52; s.t(r[0], 300, y + 6, { size: 11, f: MONO }); s.t(r[1], 372, y + 4, { size: 15, f: DISP, ls: .5 }); s.t(r[2], 560, y + 6, { size: 11, f: MONO });
    s.r(660, y + 12, 90, 3, { fill: K.rule }); s.r(660, y + 12, 90 * r[3] / 100, 3, { fill: K.or }); s.t(r[3] + '%', 760, y + 6, { size: 11, f: MONO });
    s.t(r[4], 830, y + 6, { size: 11, f: MONO, c: r[4] === '[APPLIED]' ? K.or : K.ink }); s.t(r[5], 970, y + 6, { size: 11, f: MONO }); s.hl(300, y + 38, 700, K.rule);
  });
  s.r(1060, 100, 340, 690, { fill: K.card, stroke: K.ink, name: 'markup queue' });
  s.t('MARKUP QUEUE · 3', 1078, 118, { size: 10, f: MONO, ls: 1.5 }); s.hl(1060, 142, 340, K.ink);
  [['M1', 'NOTION · PM', 'ADD 2 MISSING KEYWORDS'], ['M2', 'MASTER RESUME', 'SPILLS 4 LINES TO PAGE 2'], ['M3', 'ATLASSIAN', 'INTERVIEW IN 3 DAYS — PREP NOTES?']].forEach((m, i) => {
    const y = 162 + i * 128; s.r(1078, y, 304, 108, { fill: K.paper, stroke: K.or, name: 'note' }); s.t(m[0], 1090, y + 10, { size: 9, f: MONO, c: K.or, ls: 1 }); s.t(m[1], 1090, y + 26, { size: 10, f: MONO, c: K.mute, ls: 1 });
    s.t(m[2], 1090, y + 44, { size: 17, f: DISP, w: 280, lh: 18 }); s.t('[ APPLY ]   [ PREVIEW ]   [ DISMISS ]', 1090, y + 84, { size: 9, f: MONO, ls: 1 });
  });
  s.done();
}
// 03 Convert
{
  const s = Screen('D1-03', 'Blueprint Convert', 'Blueprint — Import / convert', K.bg); chrome(s, '03');
  s.t('IMPORTING OLD_RESUME.DOCX', 40, 62, { size: 12, f: MONO, ls: 2 });
  s.t('READING  →  RECONSTRUCTING  →  COMPILING', 40, 84, { size: 10, f: MONO, c: K.mute, ls: 1.5 });
  s.paper(120, 130, 340, 490, { ...pal, paper: '#F0EBE0', stroke: K.mute, name: '#8A8479', sec: '#8A8479' }, {}); s.r(110, 340, 360, 2, { fill: K.or }); s.r(110, 342, 360, 40, { fill: K.or, op: .12 });
  s.t('ORIGINAL · SCANNED', 120, 114, { size: 9, f: MONO, c: K.mute, ls: 1.5 });
  s.t('OCR  ·  LAYOUT  ·  LATEX\n→', 480, 350, { size: 10, f: MONO, ls: 1.5, w: 130, al: 'center', lh: 20 });
  s.r(630, 130, 340, 490, { fill: K.paper, stroke: K.ink, name: 'rebuilt' });
  s.r(650, 150, 300, 450, { fill: '#00000000', stroke: K.or, op: .6, dash: [3, 3], name: 'construction' });
  s.hl(650, 215, 300, K.or, 1, .5); s.hl(650, 330, 300, K.or, 1, .5); s.vl(800, 150, 450, K.or, 1, .4);
  s.r(690, 172, 220, 18, { fill: K.ink }); s.r(720, 198, 160, 5, { fill: K.rule });
  [[240, 3], [350, 3]].forEach(b => { s.r(668, b[0], 80, 8, { fill: '#55504A' }); for (let j = 0; j < b[1]; j++) s.r(668, b[0] + 22 + j * 15, 264 - j * 20, 5, { fill: K.rule }); });
  s.r(630, 440, 340, 180, { fill: K.bg, op: .88, name: 'not built yet' }); s.t('BUILDING ▒▒▒░░░', 630, 520, { w: 340, al: 'center', size: 11, f: MONO, c: K.or, ls: 2 });
  s.t('REBUILT · LATEX', 630, 114, { size: 9, f: MONO, c: K.or, ls: 1.5 }); s.dimH(630, 970, 628, '210 MM', K.ink, { f: MONO });
  s.t('97%', 1020, 100, { size: 190, f: DISP, c: K.or, ls: -4, lh: 190 }); s.t('LAYOUT MATCH', 1026, 292, { size: 12, f: MONO, ls: 2 }); s.hl(1020, 320, 380, K.ink);
  s.t('FLAGGED · 2\n\n⚠  SKILLS TABLE → LIST\n    KEEPS ATS-FRIENDLY\n\n⚠  GARAMOND PRO → EB GARAMOND', 1020, 336, { size: 11, f: MONO, lh: 18, ls: .5 });
  btn(s, 1020, 520, 180, 40, 'FIX WITH AI', 'out'); btn(s, 1212, 520, 188, 40, 'OPEN EDITOR ↗');
  s.hl(120, 740, 1280, K.ink, 1); for (let i = 0; i <= 40; i++) s.vl(120 + i * 32, 740, i % 5 ? 6 : 12, K.ink);
  s.r(120, 736, 32 * 29, 4, { fill: K.or }); s.t('▲ 72% · REBUILDING LAYOUT', 120 + 32 * 29 - 70, 762, { size: 10, f: MONO, c: K.or, ls: 1.5 }); s.t('00:14 ELAPSED', 1250, 762, { size: 10, f: MONO, c: K.mute, ls: 1.5 });
  s.done();
}
// 04 Editor
{
  const s = Screen('D1-04', 'Blueprint Editor', 'Blueprint — Editor (Edit)', K.bg); chrome(s, '04', '←  APPLICATIONS  /  STRIPE — BACKEND ENGINEER');
  s.t('EDIT', 560, 54, { size: 12, f: MONO, ls: 2 }); s.r(558, 76, 34, 2, { fill: K.or }); s.t('COMPARE     CODE', 616, 54, { size: 12, f: MONO, ls: 2, c: K.mute });
  btn(s, 1250, 48, 150, 32, 'EXPORT ↗'); s.t('REV C ▾    SAVED ✓', 1060, 56, { size: 10, f: MONO, c: K.mute, ls: 1.5 });
  s.hl(36, 96, 1368, K.ink);
  s.t('SHEETS', 40, 116, { size: 10, f: MONO, c: K.mute, ls: 2 }); s.r(36, 172, 190, 28, { fill: K.orBg }); s.r(36, 172, 3, 28, { fill: K.or });
  s.t('01  HEADER\n02  SUMMARY\n03  EXPERIENCE\n04  PROJECTS\n05  EDUCATION\n06  SKILLS', 48, 150, { size: 12, f: MONO, lh: 28, ls: 1 });
  s.t('PARAMETERS', 40, 350, { size: 10, f: MONO, c: K.mute, ls: 2 }); s.hl(40, 372, 186, K.rule);
  s.t('TEMPLATE      CLASSIC\nFONT          INTER\nACCENT        ● ● ● ○\nSPACING       ─●────\nMARGIN        ──●───', 40, 384, { size: 10, f: MONO, lh: 26, ls: .5 });
  s.t('REVISIONS', 40, 560, { size: 10, f: MONO, c: K.mute, ls: 2 }); s.hl(40, 582, 186, K.rule);
  s.t('● C  TAILORED · STRIPE\n○ B  SHORTENED\n○ A  IMPORTED', 40, 594, { size: 10, f: MONO, lh: 24, ls: .5 });
  s.vl(250, 96, 790, K.rule); s.vl(1080, 96, 790, K.rule);
  s.dimH(420, 910, 128, '8.5 IN', K.ink, { f: MONO });
  s.paper(420, 144, 490, 680, pal, { 1: 'sel', 2: 'sel' });
  s.dimV(940, 144, 824, '11 IN', K.ink, { f: MONO });
  tag(s, 264, 262, 128, 'A1', 'REWRITE\nSUMMARY'); leader(s, 392, 285, 442, 285);
  tag(s, 940, 392, 130, 'A2', 'ADD METRIC\nP95 −40%'); leader(s, 940, 415, 884, 415);
  tag(s, 264, 520, 128, 'A3', 'REORDER\nSKILLS'); leader(s, 392, 543, 442, 543);
  s.t('MARKUP · 3 OPEN', 1100, 116, { size: 10, f: MONO, ls: 2 });
  [['A1', 'SUMMARY', 'Lead with backend + scale. Removes generic opener.'], ['A2', 'EXPERIENCE', '“Worked on backend things” → “Cut p95 latency 40%”.'], ['A3', 'SKILLS', 'Reordered to match the job posting.']].forEach((m, i) => {
    const y = 144 + i * 140; s.r(1100, y, 290, 124, { fill: K.card, stroke: K.ink, name: 'markup' }); s.r(1100, y, 36, 22, { fill: K.or }); s.t(m[0], 1100, y + 5, { w: 36, al: 'center', size: 10, f: MONO, c: '#FFFFFF' });
    s.t(m[1], 1146, y + 6, { size: 10, f: MONO, c: K.mute, ls: 1.5 }); s.t(m[2], 1112, y + 36, { size: 12, w: 266, lh: 17 }); s.t('[ ACCEPT ]   [ REJECT ]   [ EDIT ]', 1112, y + 96, { size: 9, f: MONO, ls: 1 });
  });
  s.r(1100, 700, 290, 100, { fill: K.paper, stroke: K.or, sw: 2, name: 'prompt' }); s.t('> make it punchier, no fake numbers_', 1112, 716, { size: 11, f: MONO, c: K.ink }); s.t('⌘K   ⏎ SEND   ■ STOP', 1112, 772, { size: 9, f: MONO, c: K.mute, ls: 1 });
  s.t('1 PAGE ✓    ATS 92    MATCH 91%', 270, 850, { size: 10, f: MONO, c: K.mute, ls: 1.5 });
  s.done();
}
// 05 Compare
{
  const s = Screen('D1-05', 'Blueprint Compare', 'Blueprint — Compare revisions', K.bg); chrome(s, '05', '←  APPLICATIONS  /  STRIPE — BACKEND ENGINEER');
  s.t('EDIT', 560, 54, { size: 12, f: MONO, ls: 2, c: K.mute }); s.t('COMPARE', 650, 54, { size: 12, f: MONO, ls: 2 }); s.t('CODE', 770, 54, { size: 12, f: MONO, ls: 2, c: K.mute }); s.r(648, 76, 66, 2, { fill: K.or });
  btn(s, 1250, 48, 150, 32, 'EXPORT ↗'); s.hl(36, 96, 1368, K.ink);
  s.t('REVISION TABLE', 40, 116, { size: 10, f: MONO, c: K.mute, ls: 2 }); s.hl(40, 138, 230, K.ink);
  [['A', 'IMPORTED', 'OLD_RESUME.DOCX', 0], ['B', 'SHORTENED', '1 PAGE', 0], ['C', 'TAILORED', 'STRIPE · 7 CHANGES', 1], ['D', 'AI WORKING…', '', 0]].forEach((r, i) => {
    const y = 150 + i * 70; if (r[3]) s.r(40, y, 230, 58, { fill: K.orBg }); if (r[3]) s.r(40, y, 3, 58, { fill: K.or });
    s.t('REV ' + r[0], 54, y + 10, { size: 10, f: MONO, c: r[3] ? K.or : K.mute, ls: 1.5 }); s.t(r[1], 54, y + 26, { size: 17, f: DISP, ls: .5, c: i === 3 ? K.or : K.ink }); s.t(r[2], 54, y + 44, { size: 8, f: MONO, c: K.mute, ls: 1 });
  });
  s.btn = null; s.t('⑂  BRANCH FOR ANOTHER JOB', 40, 450, { size: 10, f: MONO, c: K.mute, ls: 1 });
  s.vl(290, 96, 790, K.rule); s.vl(1120, 96, 790, K.rule);
  s.paper(360, 150, 400, 560, { ...pal, paper: '#F0EBE0', stroke: K.mute, sec: '#8A8479', name: '#8A8479' }, { 1: 'del' }); s.t('REV B', 360, 126, { size: 10, f: MONO, c: K.mute, ls: 2 });
  s.paper(560, 120, 400, 560, pal, { 1: 'add', 2: 'add' }); s.t('REV C  ·  OVERLAY', 560, 96 + 4, { size: 10, f: MONO, c: K.or, ls: 2 });
  tag(s, 980, 232, 120, 'Δ1', 'SUMMARY\nREWRITTEN'); leader(s, 980, 255, 942, 255);
  tag(s, 980, 372, 120, 'Δ2', 'ACME · 3\nBULLETS'); leader(s, 980, 395, 942, 395);
  s.t('WIPE  ◄──●──►', 560, 720, { size: 10, f: MONO, c: K.mute, ls: 2, w: 400, al: 'center' });
  s.t('CHANGES · 7', 1140, 116, { size: 10, f: MONO, ls: 2 }); s.hl(1140, 138, 250, K.ink);
  s.t('☑  SUMMARY REWRITTEN\n☑  SKILLS REORDERED\n☑  ACME · 3 BULLETS\n☐  BETA · ADD METRIC\n☑  DATE FORMAT FIXED\n☐  HIDE OLDER ROLE\n☑  MARGINS TIGHTENED', 1140, 154, { size: 11, f: MONO, lh: 34, ls: .5 });
  btn(s, 1140, 420, 250, 40, 'ACCEPT SELECTED ↗'); btn(s, 1140, 470, 250, 40, 'REJECT ALL', 'out');
  s.t('AI AGENT · RUN #4', 1140, 560, { size: 10, f: MONO, ls: 2 }); s.hl(1140, 582, 250, K.ink);
  s.t('✓ PARSED DOCX\n✓ READ JOB POSTING\n✓ EDITED SUMMARY.TEX\n⟳ EDITING EXPERIENCE…\n○ COMPILE · CHECK PAGE', 1140, 594, { size: 10, f: MONO, lh: 24, ls: .5 });
  s.hl(60, 800, 1020, K.ink); [60, 330, 600, 870].forEach((x, i) => { s.r(x - 6, 794, 12, 12, { type: 'ellipse', fill: i === 2 ? K.or : i === 3 ? K.bg : K.ink, stroke: i === 3 ? K.or : null, dash: i === 3 ? [2, 2] : null }); s.t('REV ' + 'ABCD'[i], x - 20, 818, { size: 9, f: MONO, c: i === 2 ? K.or : K.mute, ls: 1.5, w: 40, al: 'center' }); });
  s.done();
}
// 00 Style board
{
  const s = Screen('D1-00', 'Blueprint Style', 'Blueprint — style board', K.bg); chrome(s, '00', 'DIRECTION 1 · BLUEPRINT');
  s.t('BLUEPRINT', 60, 70, { size: 120, f: DISP, ls: -2, lh: 120 }); s.t('Heron-AI-inspired: warm paper, engineering-drawing marks, one hot-orange accent used only for AI annotations.', 64, 200, { size: 14, w: 560, lh: 22, c: '#3A372F' });
  [['PAPER', K.bg], ['CARD', K.card], ['INK', K.ink], ['RULE', K.rule], ['AI ORANGE', K.or]].forEach((c, i) => { s.r(60 + i * 150, 290, 134, 134, { fill: c[1], stroke: K.ink }); s.t(c[0] + '\n' + c[1], 60 + i * 150, 434, { size: 10, f: MONO, lh: 15, ls: 1 }); });
  s.t('Aa', 60, 520, { size: 150, f: DISP, lh: 150 }); s.t('BAHNSCHRIFT CONDENSED — DISPLAY\nCONSOLAS — LABELS, DATA, MARKUP\nINTER — BODY', 330, 548, { size: 12, f: MONO, lh: 22, ls: 1 });
  s.t('PRINCIPLES', 780, 290, { size: 10, f: MONO, c: K.mute, ls: 2 }); s.hl(780, 312, 600, K.ink);
  s.t('01  The resume is a drawing. AI edits are annotations, never silent changes.\n02  Orange means “the AI touched this”. Nothing else is orange.\n03  Hairlines, crosshairs and dimension marks replace boxes and shadows.\n04  Mono micro-labels for data; condensed caps for emotion.', 780, 330, { size: 13, w: 600, lh: 30 });
  s.t('COMPONENTS', 780, 500, { size: 10, f: MONO, c: K.mute, ls: 2 }); s.hl(780, 522, 600, K.ink);
  btn(s, 780, 548, 160, 40, 'PRIMARY ↗'); btn(s, 954, 548, 160, 40, 'SECONDARY', 'out'); tag(s, 1128, 546, 150, 'A1', 'AI ANNOTATION');
  s.r(780, 620, 300, 44, { fill: K.paper, stroke: K.or, sw: 2 }); s.t('> ask the agent_', 792, 635, { size: 11, f: MONO }); s.t('[ACCEPT]  [REJECT]  [APPLIED]', 1100, 635, { size: 11, f: MONO, ls: 1 });
  s.done();
}
