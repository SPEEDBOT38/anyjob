// Direction 2 — NOIR (Grail / DeepBook inspired): cinematic dark, high-contrast serif caps, one electric-blue accent
const { Screen } = require('./lib');
const K = { bg: '#07070A', glass: '#FFFFFF0D', glass2: '#FFFFFF17', edge: '#FFFFFF26', tx: '#F3F0EA', mute: '#8D8B96', blue: '#3D6BFF', blue2: '#8FA9FF', cream: '#F4EFE4', ink: '#14141A' };
const DISP = 'Bodoni MT', SANS = 'Inter', MONO = 'Cascadia Mono';
const pal = { paper: K.cream, stroke: null, name: K.ink, sec: '#3A3A44', line: '#D9D3C4', shadow: { c: '#3D6BFF66', y: 0, b: 70 }, r: 4, add: ['#DCE5FF', K.blue, '#9DB4FF'], sel: ['#DCE5FF', K.blue, '#9DB4FF'], del: ['#EEE9DC', '#9A9484', '#CFC8B6'], hsw: 1.5, hr: 3 };
const dim = { ...pal, paper: '#CFCABD', name: '#55535A', sec: '#6A6860', line: '#B9B3A4', shadow: null };

const glow = (s, cx, cy, w, h, c = '#3D6BFF', a = '55') => s.r(cx - w / 2, cy - h / 2, w, h, { type: 'ellipse', grad: { t: 'radialGradient', stops: [{ position: 0, color: c + a }, { position: 1, color: c + '00' }] }, name: 'glow' });
const stars = (s, n = 70) => { let a = 7; for (let i = 0; i < n; i++) { a = (a * 9301 + 49297) % 233280; const x = (a / 233280) * 1440; a = (a * 9301 + 49297) % 233280; const y = (a / 233280) * 900; s.r(x, y, 2, 2, { type: 'ellipse', fill: '#FFFFFF', op: .12 + (i % 5) * .08, name: 'star' }); } };
const glass = (s, x, y, w, h, r = 18, o = {}) => s.r(x, y, w, h, { fill: o.fill || K.glass, stroke: o.stroke || K.edge, r, shadow: o.shadow, name: 'glass' });
const pill = (s, x, y, w, h, label, kind = 'white') => { s.r(x, y, w, h, { fill: kind === 'white' ? K.tx : kind === 'blue' ? K.blue : '#00000000', stroke: kind === 'ghost' ? '#FFFFFF55' : null, r: h / 2, name: 'pill', shadow: kind === 'blue' ? { c: '#3D6BFF88', y: 6, b: 24 } : null }); s.t(label, x, y + h / 2 - 8, { w, al: 'center', size: 13, c: kind === 'white' ? K.ink : K.tx, st: 'SemiBold' }); };
const eyebrow = (s, text, x, y, c = K.mute) => s.t(text, x, y, { size: 10, f: MONO, c, ls: 2 });

// 01 Welcome
{
  const s = Screen('D2-01', 'Noir Welcome', 'Noir — Welcome', K.bg); stars(s);
  glow(s, 720, 640, 1300, 760); glow(s, 720, 0, 900, 520, '#8FA9FF', '22');
  s.t('◆  ANYJOB', 48, 38, { size: 14, c: K.tx, st: 'Bold', ls: 3 });
  s.t('Product        Templates        Pricing        Docs', 520, 40, { size: 13, c: K.mute });
  s.t('Log in', 1180, 40, { size: 13, c: K.tx }); pill(s, 1262, 26, 130, 40, 'Get started');
  s.t('AI RESUME STUDIO  ·  DOCX · PDF · LATEX', 0, 120, { w: 1440, al: 'center', size: 10, f: MONO, c: K.blue2, ls: 3 });
  s.t('WRITE THE RESUME\nTHAT GETS THE CALL', 0, 148, { w: 1440, al: 'center', size: 88, f: DISP, lh: 88, c: K.tx, ls: -1 });
  s.t('Drop the DOCX or PDF you already have. Watch AI rebuild it, tailor it to any job, and edit it live — line by line.', 440, 346, { w: 560, al: 'center', size: 16, c: K.mute, lh: 25 });
  pill(s, 500, 420, 210, 52, 'Drop your resume  ↗'); pill(s, 724, 420, 220, 52, '▷  Watch it edit live', 'ghost');
  s.paper(250, 540, 250, 330, dim, {}, {}); s.r(250, 540, 250, 330, { fill: K.bg, op: .0 });
  s.paper(940, 540, 250, 330, dim, {});
  s.paper(560, 500, 320, 420, pal, { 1: 'sel', 2: 'sel' });
  glass(s, 800, 560, 210, 44, 22, { fill: '#0E1230E6', stroke: K.blue }); s.t('✦  Rewriting summary…', 800, 573, { w: 210, al: 'center', size: 12, c: K.blue2 });
  glass(s, 300, 520, 230, 44, 22, { fill: '#0E1230E6', stroke: K.blue }); s.t('✓  Added metric · p95 −40%', 300, 533, { w: 230, al: 'center', size: 12, c: K.tx });
  s.r(0, 780, 1440, 120, { grad: { stops: ['#07070A00', '#07070AFF'], from: [0, 0], to: [0, 1] }, name: 'fade' });
  s.done();
}
// 02 Home
{
  const s = Screen('D2-02', 'Noir Home', 'Noir — Home', K.bg); stars(s, 40); glow(s, 420, 380, 900, 600, '#3D6BFF', '2E');
  glass(s, 24, 150, 64, 520, 32); s.t('◆\n\n⌂\n▤\n▣\n✉\n▦\n⬆', 24, 176, { w: 64, al: 'center', size: 17, lh: 52, c: K.tx }); s.r(34, 284, 44, 44, { type: 'ellipse', fill: K.blue, op: .22 });
  s.t('⚙', 24, 700, { w: 64, al: 'center', size: 18, c: K.mute }); s.r(36, 760, 40, 40, { type: 'ellipse', fill: K.glass2, stroke: K.edge }); s.t('D', 36, 770, { w: 40, al: 'center', size: 15, c: K.tx });
  eyebrow(s, 'FRIDAY · 6 NOV', 130, 56); s.t('Good evening,\nDivya.', 130, 78, { size: 62, f: DISP, lh: 62, c: K.tx });
  glass(s, 980, 80, 270, 44, 22); s.t('🔍   Search            ⌘K', 996, 93, { size: 12, c: K.mute }); pill(s, 1264, 80, 148, 44, '＋ New application');
  s.t('Continue editing', 130, 238, { size: 14, c: K.tx, st: 'SemiBold' }); s.t('View all →', 1320, 240, { size: 12, c: K.blue2 });
  [['Stripe — Backend', 'v3 · edited 2h ago', 1], ['Notion — PM', 'v2 · draft', 0], ['Master resume', 'v5 · yesterday', 0]].forEach((c, i) => {
    const x = 130 + i * 424; glass(s, x, 270, 400, 300, 24, { stroke: i ? K.edge : K.blue, shadow: i ? null : { c: '#3D6BFF44', y: 0, b: 40 } });
    s.r(x + 20, 290, 150, 200, { fill: K.cream, r: 4, rot: [-5, 0, 5][i], name: 'tilted paper', shadow: { c: '#00000066', y: 10, b: 30 } }); s.r(x + 40, 312, 110, 10, { fill: K.ink, r: 2, rot: [-5, 0, 5][i] });
    s.r(x + 190, 300, 190, 8, { fill: K.glass2, r: 4 }); s.r(x + 190, 320, 150, 8, { fill: K.glass2, r: 4 }); s.r(x + 190, 340, 170, 8, { fill: K.glass2, r: 4 });
    s.t(c[0], x + 24, 508, { size: 17, c: K.tx, st: 'SemiBold' }); s.t(c[1], x + 24, 534, { size: 12, c: K.mute }); if (c[2]) { s.r(x + 300, 506, 76, 26, { fill: K.blue, r: 13 }); s.t('● 91%', x + 300, 512, { w: 76, al: 'center', size: 11, c: '#FFFFFF' }); }
  });
  [['12', 'Applications', [3, 5, 4, 7, 6, 9, 12]], ['78%', 'Average match', [5, 6, 6, 7, 7, 8, 8]], ['2', 'Interviews', [0, 0, 1, 1, 1, 2, 2]], ['42', 'AI edits this month', [2, 5, 8, 12, 20, 31, 42]]].forEach((c, i) => {
    const x = 130 + i * 320; glass(s, x, 600, 296, 120, 20); s.t(c[0], x + 22, 614, { size: 48, f: DISP, c: K.tx }); s.t(c[1], x + 22, 684, { size: 12, c: K.mute });
    c[2].forEach((v, j) => { const mx = Math.max(...c[2]) || 1, h = 6 + (v / mx) * 40; s.r(x + 190 + j * 13, 700 - h, 7, h, { fill: j === 6 ? K.blue : K.glass2, r: 3 }); });
  });
  glass(s, 130, 750, 1280, 92, 24, { fill: '#10153A66', stroke: '#3D6BFF88' }); s.r(158, 786, 14, 14, { type: 'ellipse', fill: K.blue, shadow: { c: '#3D6BFFCC', y: 0, b: 16 } });
  s.t('Notion — PM is at 74% match. Two keywords are missing — AI can add them truthfully.', 190, 776, { size: 15, c: K.tx }); s.t('Also: your Master resume spills 4 lines onto page 2.', 190, 804, { size: 12, c: K.mute }); pill(s, 1240, 778, 150, 38, 'Fix with AI', 'blue');
  s.done();
}
// 03 Convert
{
  const s = Screen('D2-03', 'Noir Convert', 'Noir — Import / convert', K.bg); stars(s, 50); glow(s, 720, 450, 1100, 640, '#3D6BFF', '38');
  s.t('IMPORTING  ·  OLD_RESUME.DOCX', 0, 64, { w: 1440, al: 'center', size: 10, f: MONO, c: K.blue2, ls: 3 });
  s.t('Rebuilding your layout', 0, 92, { w: 1440, al: 'center', size: 48, f: DISP, c: K.tx });
  glass(s, 100, 200, 340, 460, 22); s.paper(130, 226, 280, 360, dim, {}); s.t('old_resume.docx  ·  DOCX', 130, 606, { size: 12, c: K.mute });
  s.r(130, 400, 280, 2, { fill: K.blue, shadow: { c: '#3D6BFF', y: 0, b: 18 } });
  for (let i = 0; i < 22; i++) { const y = 250 + i * 18, a = Math.abs(11 - i), len = 440 - a * 12; s.r(460 + a * 6, y, len, 2, { grad: { stops: ['#3D6BFF00', '#3D6BFFCC', '#3D6BFF00'], from: [0, 0], to: [1, 0] }, name: 'stream' }); }
  s.r(640, 330, 160, 160, { type: 'ellipse', grad: { t: 'radialGradient', stops: [{ position: 0, color: '#3D6BFFFF' }, { position: .55, color: '#3D6BFF88' }, { position: 1, color: '#3D6BFF00' }] } });
  s.t('72%', 640, 386, { w: 160, al: 'center', size: 44, f: DISP, c: '#FFFFFF' });
  s.paper(1000, 210, 340, 440, pal, { 1: 'sel' }); s.r(1000, 430, 340, 220, { grad: { stops: ['#07070A00', '#07070AE6'], from: [0, 0], to: [0, 1] }, name: 'unbuilt fade' });
  s.t('LaTeX  ·  rebuilt', 1000, 666, { size: 12, c: K.blue2 });
  glass(s, 100, 720, 1240, 120, 24); s.t('✓  Read text & fonts      ✓  Found 6 sections      ⟳  Rebuilding layout      ○  Compile PDF      ○  Compare to original', 130, 742, { size: 13, c: K.tx });
  s.r(130, 780, 640, 4, { fill: K.glass2, r: 2 }); s.r(130, 780, 460, 4, { fill: K.blue, r: 2, shadow: { c: '#3D6BFF', y: 0, b: 12 } });
  s.t('97% layout match  ·  2 items flagged', 130, 800, { size: 12, c: K.mute }); pill(s, 940, 760, 170, 44, 'Fix flagged', 'ghost'); pill(s, 1124, 760, 190, 44, 'Open editor  ↗', 'blue');
  s.done();
}
// 04 Editor
{
  const s = Screen('D2-04', 'Noir Editor', 'Noir — Editor (Edit)', K.bg); stars(s, 40); glow(s, 710, 440, 900, 820, '#3D6BFF', '28');
  s.t('←   Stripe — Backend Engineer', 32, 34, { size: 14, c: K.tx, st: 'SemiBold' }); s.t('Saved ✓', 32, 58, { size: 11, c: K.mute });
  glass(s, 1204, 26, 70, 36, 18); s.t('v3 ▾', 1204, 36, { w: 70, al: 'center', size: 12, c: K.blue2 }); pill(s, 1286, 26, 122, 36, 'Export  ↗');
  glass(s, 28, 110, 220, 500, 22); eyebrow(s, 'SECTIONS', 48, 130);
  s.r(40, 200, 196, 38, { fill: K.blue, op: .22, r: 12 }); s.r(40, 200, 3, 38, { fill: K.blue, r: 2 });
  s.t('⋮⋮  Header\n⋮⋮  Summary\n⋮⋮  Experience\n⋮⋮  Projects\n⋮⋮  Education\n⋮⋮  Skills', 56, 172, { size: 13, lh: 38, c: K.tx }); s.t('＋  Add section', 56, 412, { size: 12, c: K.blue2 });
  eyebrow(s, 'DESIGN', 48, 456); s.t('Template        Classic ▾\nAccent           ● ● ● ○\nSpacing         ──●──', 48, 482, { size: 12, c: K.mute, lh: 32 });
  s.paper(480, 90, 480, 680, pal, { 1: 'sel', 2: 'add' });
  glass(s, 500, 380, 440, 128, 20, { fill: '#0C0E22F2', stroke: K.blue, shadow: { c: '#3D6BFF55', y: 12, b: 40 } });
  s.t('✦  Ask AI about this bullet…', 524, 398, { size: 13, c: K.mute }); ['Add metric', 'Shorten', 'Stronger verb', 'Match job'].forEach((l, i) => { const w = [90, 74, 102, 84][i], x = 524 + [0, 100, 184, 296][i]; s.r(x, 432, w, 26, { fill: K.glass2, r: 13 }); s.t(l, x, 438, { w, al: 'center', size: 11, c: K.blue2 }); });
  s.t('→  “Cut p95 latency 40% via caching redesign”', 524, 474, { size: 12, c: '#7BE0A8' }); s.t('Accept ↵', 868, 474, { size: 11, c: K.tx });
  glass(s, 1056, 90, 356, 700, 26, { shadow: { c: '#00000088', y: 20, b: 50 } });
  s.r(1078, 114, 10, 10, { type: 'ellipse', fill: K.blue, shadow: { c: '#3D6BFFCC', y: 0, b: 14 } }); s.t('Agent', 1098, 108, { size: 15, c: K.tx, st: 'SemiBold' }); s.t('Run #4 · 00:21', 1296, 111, { size: 11, c: K.mute });
  glass(s, 1160, 150, 230, 52, 16, { fill: K.glass2 }); s.t('Tailor for this job. Keep my\nvoice, no fake numbers.', 1174, 160, { size: 12, c: K.tx, lh: 17 });
  s.t('Reading job posting…\nPlanned 7 edits across 3 sections.\nRewriting your Acme bullets — I found\nno latency number, so I’ll ask first.', 1078, 226, { size: 13, c: K.tx, lh: 21 }); s.r(1078, 316, 7, 15, { fill: K.blue });
  s.t('✓  Parsed DOCX → 12 sections\n✓  Edited summary.tex\n⟳  Editing experience.tex\n○  Compile · check 1 page', 1078, 356, { size: 12, c: K.mute, lh: 28 });
  glass(s, 1078, 484, 312, 120, 18, { fill: '#2A210C66', stroke: '#B8860B88' }); s.t('? Quick question', 1094, 498, { size: 12, c: '#F2C14E', st: 'SemiBold' }); s.t('Use 40% from your old CV,\nor leave the number out?', 1094, 520, { size: 12, c: K.tx, lh: 18 });
  [['Use 40%', 0, 78], ['Leave out', 88, 80], ['Type…', 178, 62]].forEach(b => { s.r(1094 + b[1], 566, b[2], 26, { fill: K.glass2, r: 13 }); s.t(b[0], 1094 + b[1], 572, { w: b[2], al: 'center', size: 11, c: K.tx }); });
  glass(s, 1078, 700, 312, 66, 20, { stroke: K.blue }); s.t('Steer the agent…', 1096, 722, { size: 13, c: K.mute }); s.r(1348, 714, 34, 34, { type: 'ellipse', fill: K.blue, shadow: { c: '#3D6BFFAA', y: 0, b: 16 } }); s.t('↑', 1348, 722, { w: 34, al: 'center', size: 15, c: '#FFFFFF' });
  glass(s, 440, 818, 560, 58, 29, { fill: '#10121CE6', shadow: { c: '#000000AA', y: 12, b: 36 } });
  s.r(452, 826, 118, 42, { fill: K.tx, r: 21 }); s.t('Edit', 452, 838, { w: 118, al: 'center', size: 13, c: K.ink, st: 'SemiBold' }); s.t('Compare', 578, 838, { w: 118, al: 'center', size: 13, c: K.mute }); s.t('</>  Code', 700, 838, { w: 118, al: 'center', size: 13, c: K.mute });
  s.vl(826, 836, 22, K.edge); s.t('✦  Ask AI   ⌘K', 836, 838, { w: 156, al: 'center', size: 13, c: K.blue2 });
  s.done();
}
// 05 Compare
{
  const s = Screen('D2-05', 'Noir Compare', 'Noir — Compare (before / after)', K.bg); stars(s, 40); glow(s, 700, 430, 1000, 700, '#3D6BFF', '2A');
  s.t('←   Stripe — Backend Engineer', 32, 34, { size: 14, c: K.tx, st: 'SemiBold' }); pill(s, 1286, 26, 122, 36, 'Export  ↗');
  glass(s, 560, 22, 320, 44, 22, { fill: '#10121CE6' }); s.t('Edit', 566, 34, { w: 100, al: 'center', size: 13, c: K.mute }); s.r(668, 26, 108, 36, { fill: K.tx, r: 18 }); s.t('Compare', 668, 35, { w: 108, al: 'center', size: 13, c: K.ink, st: 'SemiBold' }); s.t('</>  Code', 780, 34, { w: 96, al: 'center', size: 13, c: K.mute });
  eyebrow(s, 'BEFORE  ·  v2', 250, 106); eyebrow(s, 'AFTER  ·  v3  ·  7 CHANGES', 700, 106, K.blue2);
  s.paper(250, 130, 400, 560, dim, { 1: 'del' }); s.paper(710, 130, 400, 560, pal, { 1: 'add', 2: 'add' });
  s.r(679, 120, 2, 590, { grad: { stops: ['#3D6BFF00', '#8FA9FF', '#3D6BFF00'], from: [0, 0], to: [0, 1] }, name: 'wipe line' });
  s.r(662, 396, 36, 36, { type: 'ellipse', fill: K.tx, shadow: { c: '#3D6BFFAA', y: 0, b: 24 } }); s.t('⇄', 662, 404, { w: 36, al: 'center', size: 16, c: K.ink });
  glass(s, 1140, 130, 270, 420, 22); eyebrow(s, 'CHANGES · 7', 1160, 150);
  s.t('☑  Summary rewritten\n☑  Skills reordered\n☑  Acme · 3 bullets\n☐  Beta · add metric\n☑  Date format fixed\n☐  Hide older role\n☑  Margins tightened', 1160, 178, { size: 13, lh: 36, c: K.tx });
  pill(s, 1160, 452, 230, 42, 'Accept selected', 'blue'); s.t('Reject all', 1160, 508, { w: 230, al: 'center', size: 12, c: K.mute });
  glass(s, 30, 130, 190, 150, 20); eyebrow(s, 'MATCH', 48, 148); s.t('91%', 48, 168, { size: 54, f: DISP, c: K.tx }); s.t('was 78%  ↑', 48, 240, { size: 12, c: '#7BE0A8' });
  glass(s, 270, 770, 900, 78, 39, { fill: '#10121CE6', shadow: { c: '#000000AA', y: 12, b: 36 } });
  s.r(330, 807, 750, 2, { fill: K.edge }); s.r(330, 807, 500, 2, { fill: K.blue });
  [[330, 'v1', 'Imported'], [580, 'v2', 'Shortened'], [830, 'v3', 'Tailored · Stripe'], [1080, 'v4', 'AI working…']].forEach((v, i) => { s.r(v[0] - 7, 801, 14, 14, { type: 'ellipse', fill: i === 2 ? K.blue : i === 3 ? K.bg : K.tx, stroke: i === 3 ? K.blue : null, shadow: i === 2 ? { c: '#3D6BFFCC', y: 0, b: 18 } : null }); s.t(v[1] + ' · ' + v[2], v[0] - 80, 824, { w: 160, al: 'center', size: 11, c: i === 2 ? K.blue2 : K.mute }); });
  s.done();
}
// 00 Style board
{
  const s = Screen('D2-00', 'Noir Style', 'Noir — style board', K.bg); stars(s, 60); glow(s, 1000, 300, 900, 600, '#3D6BFF', '2E');
  eyebrow(s, 'DIRECTION 2', 60, 60, K.blue2); s.t('NOIR', 60, 80, { size: 150, f: DISP, c: K.tx, lh: 150, ls: -3 });
  s.t('Grail- and DeepBook-inspired: a darkroom for your resume. The page is the only lit object; AI is a single electric-blue light.', 64, 270, { w: 560, size: 15, c: K.mute, lh: 24 });
  [['VOID', K.bg], ['GLASS', '#1A1A22'], ['CREAM PAGE', K.cream], ['TEXT', K.tx], ['AI BLUE', K.blue], ['AI GLOW', K.blue2]].forEach((c, i) => { s.r(60 + i * 140, 360, 120, 120, { fill: c[1], stroke: K.edge, r: 18 }); s.t(c[0] + '\n' + c[1], 60 + i * 140, 490, { size: 10, f: MONO, c: K.mute, lh: 15 }); });
  s.t('Aa', 60, 570, { size: 170, f: DISP, c: K.tx, lh: 170 }); s.t('Bodoni MT — display, caps\nInter — interface\nCascadia Mono — labels', 340, 600, { size: 13, c: K.mute, lh: 26 });
  eyebrow(s, 'PRINCIPLES', 860, 360); s.t('01  The page is the only light source.\n02  Blue appears only where AI is working or has changed something.\n03  Glass panels float; nothing is boxed in.\n04  Motion: glow travels from the agent to the line it edits.', 860, 390, { w: 520, size: 14, c: K.tx, lh: 30 });
  eyebrow(s, 'COMPONENTS', 860, 560); pill(s, 860, 590, 160, 46, 'Primary'); pill(s, 1034, 590, 160, 46, 'Secondary', 'ghost'); pill(s, 1208, 590, 160, 46, 'AI action', 'blue');
  glass(s, 860, 660, 250, 48, 24, { stroke: K.blue }); s.t('Ask the agent…', 884, 675, { size: 13, c: K.mute }); glass(s, 1130, 660, 238, 48, 24, { fill: '#0C0E22F2', stroke: K.blue }); s.t('✦  Rewriting…', 1130, 675, { w: 238, al: 'center', size: 13, c: K.blue2 });
  s.done();
}
