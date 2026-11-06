// v3 — five Hallmark-dealt directions (Wayfind, Ribbon, Kiln, Darkroom, Vellum), three screens each.
// Hallmark Floor applied where it translates to static frames: no eyebrows or tracked-caps labels, no invented
// metrics/testimonials/logos, no middle-dot meta, no card-in-card, one signal colour, short heroes.
const { Screen } = require('./lib');

const { btn, resume, code } = require('./kit');

// ───────────────────────── 1 · WAYFIND — the edit board ─────────────────────────
{
  const K = { paper: '#EDF0F4', p2: '#E1E5EB', p3: '#FCFDFE', ink: '#0E121B', ink2: '#2A2F3A', mute: '#5B6271', rule: '#C3C8D0', inkRule: '#343A46', co: '#2F5BE7', coSoft: '#DCE4FB', am: '#F3B526', dim: '#9AA1AE' };
  const M = 'Consolas', MB = 'Consolas|Bold';
  const P = { head: MB, body: M, ink: K.ink, ink2: K.ink2, mute: K.mute, rule: K.rule };
  const nav = (s) => {
    s.r(0, 0, 1440, 56, { fill: K.ink, name: 'nav' }); s.t('AnyJob', 40, 16, { size: 18, f: MB, c: K.p3 });
    [['Templates', 1004], ['Pricing', 1110], ['Log in', 1200]].forEach(([l, x]) => s.t(l, x, 19, { size: 13, f: M, c: K.p3 }));
    btn(s, 1290, 12, 112, 32, 'Start free', { stroke: K.p3, sw: 2, c: K.p3, f: MB, size: 12 });
  };
  const status = (s, x, y, st) => st === 'Live' ? btn(s, x, y, 64, 24, 'Live', { fill: K.co, c: K.p3, f: MB, size: 11, r: 12 })
    : s.t(st, x, y + 5, { size: 12, f: M, c: st === 'Done' ? K.dim : K.am, w: 64, al: 'center' });
  const EDITS = [['L6', 'Summary', 'Tighten to one line', 'Live'], ['L12', 'Experience', 'Lead with the result', 'Next'], ['L19', 'Experience', 'Name the three banks', 'Next'], ['L23', 'Skills', 'Put Go and Postgres first', 'Done']];

  { // 01 Welcome
    const s = Screen('H1-01', 'Wayfind Welcome', 'Wayfind — Welcome (Hallmark dealt 1/3)', K.paper); nav(s);
    s.t('Every edit,\non the board.', 64, 196, { size: 74, f: MB, lh: 76, ls: -2, c: K.ink });
    s.t('Drop a DOCX or PDF. Watch the AI\nrewrite it, line by line.', 64, 372, { size: 17, f: M, lh: 27, c: K.ink2 });
    btn(s, 64, 458, 230, 50, 'Import a resume', { fill: K.co, c: K.p3, f: MB, size: 14 });
    btn(s, 308, 458, 180, 50, 'See a sample', { stroke: K.ink, sw: 2, c: K.ink, f: MB, size: 14 });
    s.t('Takes .docx, .pdf and .tex', 64, 530, { size: 12, f: M, c: K.mute });
    s.r(900, 92, 440, 622, { fill: K.p3, stroke: K.ink, sw: 2, name: 'page' });
    const rz = resume(s, 900, 92, 440, { ...P, marks: { 3: { fill: K.coSoft } } }); s.r(rz.L - 6, rz.ys[3] - 3, 3, 15, { fill: K.co });
    s.r(620, 290, 420, 330, { fill: K.ink, stroke: K.ink, sw: 2, shadow: { c: '#0E121B66', y: 24, b: 40 }, name: 'board' });
    s.t('Edits for Backend engineer, Stripe', 640, 308, { size: 13, f: MB, c: K.p3 }); s.hl(620, 338, 420, K.inkRule, 2);
    EDITS.forEach((e, i) => {
      const y = 350 + i * 66; s.t(e[0], 640, y + 10, { size: 22, f: MB, c: K.am });
      s.t(e[1], 712, y + 6, { size: 13, f: MB, c: K.p3 }); s.t(e[2], 712, y + 26, { size: 11, f: M, c: K.dim });
      status(s, 956, y + 12, e[3]); if (i < 3) s.hl(620, y + 60, 420, K.inkRule);
    });
    s.r(620, 634, 420, 70, { fill: K.am, stroke: K.ink, sw: 2, name: 'plate' });
    s.t('Fits on one page', 640, 648, { size: 20, f: MB, c: K.ink }); s.t('Page 1 of 1 after these edits', 640, 677, { size: 11, f: M, c: K.ink2 });
    s.done();
  }
  { // 02 Import — the conversion as a line with stations
    const s = Screen('H1-02', 'Wayfind Import', 'Wayfind — Import, conversion as a route', K.paper); nav(s);
    s.t('Drop it here.', 64, 104, { size: 60, f: MB, ls: -2, c: K.ink });
    s.t('One file. We read it, then set it in LaTeX.', 64, 184, { size: 15, f: M, c: K.ink2 });
    s.r(64, 240, 560, 320, { fill: K.p3, stroke: K.ink, sw: 2, dash: [10, 6], name: 'drop zone' });
    s.t('.docx  .pdf  .tex', 64, 350, { w: 560, al: 'center', size: 30, f: MB, c: K.ink });
    btn(s, 254, 420, 180, 46, 'Choose a file', { fill: K.co, c: K.p3, f: MB, size: 13 });
    s.r(64, 590, 560, 76, { fill: K.ink, name: 'file plate' });
    s.t('resume_final_v3.docx', 88, 606, { size: 17, f: MB, c: K.p3 }); s.t('Word document, 2 pages', 88, 634, { size: 12, f: M, c: K.dim });
    s.t('2 → 1', 500, 612, { w: 100, al: 'right', size: 26, f: MB, c: K.am });
    const X = 760, ST = [['Open the file', 'Word document, 2 pages', 'Done'], ['Find the sections', 'Summary, Experience, Projects, Skills', 'Done'], ['Write LaTeX', 'Section 2 of 4', 'Now'], ['Typeset', 'One page, fonts kept', 'Next'], ['Show both', 'Old and new, side by side', 'Next']];
    s.t('Line to LaTeX', X, 110, { size: 22, f: MB, c: K.ink }); s.hl(X, 146, 616, K.ink, 2);
    s.r(X + 11, 196, 8, 236, { fill: K.co, name: 'line done' }); s.r(X + 11, 432, 8, 236, { fill: K.rule, name: 'line ahead' });
    ST.forEach((st, i) => {
      const y = 184 + i * 118, now = st[2] === 'Now';
      s.r(X, y, 30, 30, { type: 'ellipse', fill: now ? K.co : K.p3, stroke: st[2] === 'Next' ? K.rule : K.ink, sw: 4, name: 'station' });
      s.t(st[0], X + 56, y - 2, { size: 20, f: MB, c: st[2] === 'Next' ? K.mute : K.ink }); s.t(st[1], X + 56, y + 26, { size: 12, f: M, c: K.mute });
      if (now) btn(s, 1300, y + 2, 76, 26, 'Now', { fill: K.co, c: K.p3, f: MB, size: 12, r: 13 });
      else s.t(st[2], 1300, y + 6, { w: 76, al: 'center', size: 12, f: M, c: st[2] === 'Done' ? K.mute : K.ink });
    });
    s.r(1080, 400, 196, 104, { fill: K.ink, name: 'live code plate' });
    ['\\section{Experience}', '\\role{Backend Eng…', '\\begin{bullets}'].forEach((l, i) => s.t(l, 1094, 414 + i * 22, { size: 11, f: M, c: K.p3 }));
    s.r(1210, 458, 8, 14, { fill: K.co, name: 'cursor' });
    s.done();
  }
  { // 03 Editor
    const s = Screen('H1-03', 'Wayfind Editor', 'Wayfind — Editor, code / page / board', K.p2);
    s.r(0, 0, 1440, 56, { fill: K.ink }); s.t('AnyJob', 24, 16, { size: 18, f: MB, c: K.p3 }); s.t('Backend engineer, Stripe', 148, 20, { size: 13, f: M, c: K.dim });
    btn(s, 1040, 14, 64, 28, 'Live', { fill: K.co, c: K.p3, f: MB, size: 12, r: 14 });
    btn(s, 1120, 12, 136, 32, 'Accept all', { stroke: K.p3, sw: 2, c: K.p3, f: MB, size: 12 });
    btn(s, 1268, 12, 148, 32, 'Export PDF', { fill: K.am, c: K.ink, f: MB, size: 12 });
    s.r(0, 56, 470, 844, { fill: K.p3, name: 'code panel' }); s.vl(470, 56, 844, K.ink, 2);
    s.t('main.tex', 24, 72, { size: 12, f: MB, c: K.ink }); s.hl(0, 98, 470, K.ink, 2);
    code(s, 24, 116, { lh: 24, size: 12.5, f: M, c: K.ink, num: K.dim, w: 446 }, { 6: { bg: K.coSoft, bar: K.co }, 7: { bg: K.coSoft, bar: K.co }, 12: { bar: K.am }, 13: { bar: K.am }, 19: { bar: K.am } });
    s.r(400, 232, 50, 20, { fill: K.co, name: 'live tag' }); s.t('Live', 400, 235, { w: 50, al: 'center', size: 11, f: MB, c: K.p3 });
    s.r(520, 84, 480, 679, { fill: K.p3, stroke: K.ink, sw: 2, name: 'page' });
    const rz = resume(s, 520, 84, 480, { ...P, marks: { 3: { fill: K.coSoft } } }); s.r(rz.L - 6 * rz.k, rz.ys[3] - 3, 3, 16, { fill: K.co });
    s.r(520, 792, 480, 56, { fill: K.p3, stroke: K.ink, sw: 2, name: 'prompt' }); s.t('Tell the AI what to change', 540, 811, { size: 13, f: M, c: K.mute });
    btn(s, 900, 802, 88, 36, 'Send', { fill: K.co, c: K.p3, f: MB, size: 13 });
    s.r(1050, 56, 390, 844, { fill: K.ink, name: 'board' });
    s.t('Edits', 1072, 78, { size: 24, f: MB, c: K.p3 }); s.t('Four for this job', 1072, 112, { size: 12, f: M, c: K.dim }); s.hl(1050, 140, 390, K.inkRule, 2);
    EDITS.forEach((e, i) => {
      const y = 156 + i * 112; s.t(e[0], 1072, y + 6, { size: 26, f: MB, c: K.am });
      s.t(e[1], 1150, y + 4, { size: 14, f: MB, c: K.p3 }); s.t(e[2], 1150, y + 26, { size: 12, f: M, c: K.dim, w: 200 }); status(s, 1352, y + 6, e[3]);
      if (e[3] === 'Live') { btn(s, 1150, y + 54, 90, 30, 'Accept', { fill: K.p3, c: K.ink, f: MB, size: 12 }); btn(s, 1250, y + 54, 72, 30, 'Skip', { stroke: K.dim, c: K.p3, f: M, size: 12 }); }
      s.hl(1050, y + 100, 390, K.inkRule);
    });
    s.r(1072, 790, 346, 76, { fill: K.am, name: 'plate' }); s.t('Fits on one page', 1092, 804, { size: 20, f: MB, c: K.ink }); s.t('Page 1 of 1 after these edits', 1092, 834, { size: 11, f: M, c: K.ink2 });
    s.done();
  }
}

// ───────────────────────── 2 · RIBBON (dawn) — the tailoring instrument ─────────────────────────
{
  const K = { paper: '#FBF8F2', p2: '#F4EFE6', p3: '#ECE6DB', white: '#FFFFFF', ink: '#1C1A17', ink2: '#38342E', mute: '#6E685F', rule: '#E2DBCF', ac: '#1F6063', acSoft: '#D6ECEA', band: '#123A3C', bandInk: '#F0EBE2', hi: '#FAF8F4', lo: '#CFCAC2' };
  const D = 'Segoe UI|Semilight', B = 'Corbel', MO = 'Consolas';
  const P = { head: D, headB: 'Segoe UI|Semibold', body: B, bodyB: 'Corbel|Bold', ink: K.ink, ink2: K.ink2, mute: K.mute, rule: K.rule };
  const pill = (s, x, y, w, h, l, kind) => btn(s, x, y, w, h, l, kind === 'ac' ? { fill: K.ac, c: K.bandInk, r: h / 2, f: B, size: 15 } : kind === 'ink' ? { fill: K.ink, c: K.paper, r: h / 2, f: B, size: 14 } : kind === 'soft' ? { fill: K.acSoft, c: K.ac, r: h / 2, f: B, size: 14 } : { stroke: K.lo, c: K.ink, r: h / 2, f: B, size: 14 });
  const fader = (s, x, y, h, v, label) => { // x = column centre
    s.t(String(v), x - 30, y - 30, { w: 60, al: 'center', size: 20, f: D, c: K.ink });
    for (let i = 0; i <= 8; i++) { s.hl(x - 22, y + i * h / 8, 8, K.lo); s.hl(x + 14, y + i * h / 8, 8, K.lo); }
    s.r(x - 3, y, 6, h, { fill: K.lo, r: 3, name: 'slot' }); const ky = y + h * (1 - v / 100);
    s.r(x - 1, ky, 2, y + h - ky, { fill: K.ac, name: 'level' });
    s.r(x - 18, ky - 10, 36, 20, { grad: { stops: [K.hi, K.lo], from: [0, 0], to: [0, 1] }, r: 4, stroke: '#00000026', shadow: { c: '#1C1A1740', y: 6, b: 10 }, name: 'knob' });
    s.hl(x - 10, ky - 1, 20, K.ac, 2);
    s.t(label, x - 40, y + h + 14, { w: 80, al: 'center', size: 13, f: B, c: K.mute });
  };
  const nav = (s) => { s.t('AnyJob', 56, 26, { size: 21, f: 'Segoe UI|Semibold', c: K.ink }); [['How it works', 900], ['Templates', 1020], ['Pricing', 1120]].forEach(([l, x]) => s.t(l, x, 31, { size: 15, f: B, c: K.ink2 })); pill(s, 1290, 20, 96, 38, 'Start', 'ink'); };

  { // 01 Welcome
    const s = Screen('H2-01', 'Ribbon Welcome', 'Ribbon (dawn) — Welcome (Hallmark dealt, reroll 1/3)', K.paper); nav(s);
    s.t('Set the tone.\nThe resume follows.', 56, 196, { size: 80, f: D, lh: 88, ls: -2.5, c: K.ink });
    s.t('Move a fader and AnyJob rewrites your\nLaTeX as you watch.', 56, 400, { size: 19, f: B, lh: 29, c: K.mute });
    pill(s, 56, 484, 220, 52, 'Import your resume', 'ac'); pill(s, 290, 484, 160, 52, 'See it work');
    s.r(0, 744, 1440, 156, { fill: K.band, name: 'night band' });
    s.r(-200, 760, 1100, 300, { type: 'ellipse', grad: { t: 'radialGradient', stops: [{ position: 0, color: '#6FB7B044' }, { position: 1, color: '#6FB7B000' }] }, name: 'slow light' });
    s.r(700, 800, 900, 260, { type: 'ellipse', grad: { t: 'radialGradient', stops: [{ position: 0, color: '#E9C88A33' }, { position: 1, color: '#E9C88A00' }] }, name: 'slow light' });
    s.t('Takes .docx, .pdf and .tex. Your words stay yours.', 56, 812, { size: 15, f: B, c: K.bandInk });
    s.r(800, 110, 580, 590, { fill: K.p2, stroke: K.rule, r: 20, shadow: { c: '#1C1A1740', y: 24, b: 48 }, name: 'instrument' });
    s.t('Tailor for Product designer, Figma', 828, 134, { size: 18, f: 'Segoe UI|Semibold', c: K.ink }); s.t('Sample job', 1260, 138, { w: 92, al: 'right', size: 13, f: B, c: K.mute });
    s.r(824, 180, 532, 300, { fill: K.p3, r: 14, stroke: '#00000010', name: 'well' });
    [['Length', 40], ['Formality', 65], ['Keywords', 80], ['Detail', 30]].forEach(([l, v], i) => fader(s, 890 + i * 133, 240, 170, v, l));
    s.t('Rewriting now', 828, 504, { size: 13, f: B, c: K.mute }); s.hl(828, 528, 524, K.rule);
    s.t('Product designer who turns messy research\ninto flows that ship.', 828, 540, { size: 19, f: D, lh: 26, c: K.ink });
    s.r(1180, 568, 2, 22, { fill: K.ac, name: 'caret' });
    pill(s, 828, 628, 524, 48, 'Apply to resume', 'ink');
    s.done();
  }
  { // 02 Import
    const s = Screen('H2-02', 'Ribbon Import', 'Ribbon (dawn) — Import', K.paper); nav(s);
    s.t('Bring the one you have.', 0, 120, { w: 1440, al: 'center', size: 62, f: D, ls: -2, c: K.ink });
    s.t('Word or PDF. We keep your words and rebuild the layout.', 0, 212, { w: 1440, al: 'center', size: 19, f: B, c: K.mute });
    s.r(320, 278, 800, 250, { fill: K.p2, stroke: K.lo, dash: [6, 6], r: 20, name: 'drop well' });
    s.t('Drop a file here', 320, 352, { w: 800, al: 'center', size: 28, f: D, c: K.ink }); pill(s, 640, 418, 160, 46, 'Choose a file');
    [['resume_2024.pdf', 'PDF, 2 pages', 'Rebuilding the layout', .7], ['resume_old.docx', 'Word, 1 page', 'Waiting', 0]].forEach((f, i) => {
      const y = 580 + i * 74; s.hl(320, y - 14, 800, K.rule);
      s.t(f[0], 320, y, { size: 19, f: D, c: K.ink }); s.t(f[1], 320, y + 28, { size: 13, f: B, c: K.mute });
      s.r(760, y + 12, 220, 2, { fill: K.rule, name: 'rail' }); if (f[3]) s.r(760, y + 12, 220 * f[3], 2, { fill: K.ac, name: 'progress' });
      s.t(f[2], 990, y + 3, { w: 130, al: 'right', size: 13, f: B, c: f[3] ? K.ac : K.mute });
    });
    s.hl(320, 714, 800, K.rule);
    s.t('Found so far', 320, 750, { size: 13, f: B, c: K.mute });
    ['Summary', 'Experience', 'Projects', 'Skills'].forEach((l, i) => pill(s, 430 + i * 128, 740, 116, 36, l, 'soft'));
    s.done();
  }
  { // 03 Editor
    const s = Screen('H2-03', 'Ribbon Editor', 'Ribbon (dawn) — Editor, levels / page / code', K.paper);
    s.t('AnyJob', 28, 22, { size: 19, f: 'Segoe UI|Semibold', c: K.ink }); s.t('Product designer, Figma', 140, 25, { size: 15, f: B, c: K.ink2 });
    pill(s, 1000, 16, 72, 34, 'Edit', 'soft'); pill(s, 1080, 16, 96, 34, 'Compare'); pill(s, 1184, 16, 70, 34, 'Code'); pill(s, 1268, 14, 148, 38, 'Export PDF', 'ink');
    s.hl(0, 66, 1440, K.rule);
    s.r(24, 88, 304, 790, { fill: K.p2, r: 20, stroke: K.rule, name: 'levels' });
    s.t('Levels', 48, 110, { size: 22, f: D, c: K.ink }); s.t('Move one and the page follows.', 48, 142, { size: 13, f: B, c: K.mute });
    s.r(44, 182, 264, 330, { fill: K.p3, r: 14, name: 'well' });
    [['Length', 40], ['Formal', 65], ['Keywords', 80], ['Detail', 30]].forEach(([l, v], i) => fader(s, 78 + i * 65, 236, 220, v, l));
    s.t('Presets', 48, 540, { size: 13, f: B, c: K.mute });
    [['Recruiter skim', 1], ['Deep technical', 0], ['Keep my voice', 0]].forEach(([l, on], i) => pill(s, 48, 566 + i * 50, 256, 40, l, on ? 'soft' : 'out'));
    pill(s, 48, 810, 256, 46, 'Apply levels', 'ac');
    s.r(356, 88, 520, 735, { fill: K.white, shadow: { c: '#1C1A1733', y: 20, b: 44 }, name: 'page' });
    const rz = resume(s, 356, 88, 520, { ...P, marks: { 3: { fill: K.acSoft, r: 3 } } }); s.r(rz.R - 34, rz.ys[3] - 2, 2, 14, { fill: K.ac, name: 'caret' });
    s.r(904, 88, 512, 735, { fill: K.p2, r: 20, stroke: K.rule, name: 'code' });
    s.t('main.tex', 928, 108, { size: 13, f: MO, c: K.mute }); s.hl(904, 136, 512, K.rule);
    code(s, 928, 154, { lh: 22, size: 12, f: MO, c: K.ink2, num: K.lo, w: 480 }, { 6: { bg: K.acSoft, bar: K.ac, c: K.ac }, 7: { bg: K.acSoft, bar: K.ac, c: K.ac } });
    s.r(356, 840, 1060, 44, { fill: K.p2, stroke: K.rule, r: 22, name: 'ask' }); s.t('Ask for a change, or move a fader', 380, 852, { size: 15, f: B, c: K.mute });
    pill(s, 1320, 845, 90, 34, 'Send', 'ac');
    s.done();
  }
}

// ───────────────────────── 3 · KILN — where the heat went ─────────────────────────
{
  const K = { paper: '#140D0A', p2: '#1E1612', p3: '#2A211C', ink: '#F3ECDF', ink2: '#DDD1BF', mute: '#B3A391', rule: '#F3ECDF22', ac: '#F2681E', acInk: '#160E0B', cream: '#F1E8D8', pageInk: '#24180F', pageMute: '#7A6A58', pageRule: '#D9CCB6' };
  const H = ['#3A1514', '#7A1F1C', '#C2361E', '#F2862B', '#FBD38A'];
  const DS = 'Baskerville Old Face', BD = 'Segoe UI', MO = 'Consolas';
  const P = { head: DS, body: BD, bodyB: 'Segoe UI|Semibold', ink: K.pageInk, ink2: K.pageInk, mute: K.pageMute, rule: K.pageRule };
  const pill = (s, x, y, w, h, l, kind) => btn(s, x, y, w, h, l, kind === 'ac' ? { fill: K.ac, c: K.acInk, r: h / 2, f: 'Segoe UI|Semibold', size: 14 } : { stroke: '#F3ECDF55', c: K.ink, r: h / 2, f: BD, size: 14 });
  const ramp = (s, x, y, w) => H.forEach((c, i) => s.r(x + i * w / 5, y, w / 5, 8, { fill: c, name: 'heat' }));
  // heat per resume row: 3 summary, 6 & 7 bullets, 10 bank bullet, 17 skills
  const HEAT = { 3: 4, 6: 3, 7: 1, 10: 2, 17: 3 };
  const heatPage = (s, x, y, w) => { s.r(x, y, w, w * 1.414, { fill: K.cream, r: 4, shadow: { c: '#00000099', y: 40, b: 70 }, name: 'page' }); const rz = resume(s, x, y, w, { ...P, marks: Object.fromEntries(Object.entries(HEAT).map(([i, h]) => [i, { fill: H[h], op: .32, r: 2 }])) }); Object.entries(HEAT).forEach(([i, h]) => { s.r(rz.L - 16 * rz.k, rz.ys[i] - 2 * rz.k, 4 * rz.k, 13 * rz.k, { fill: H[h], r: 2, name: 'heat tick' }); }); return rz; };
  const nav = (s) => { s.t('AnyJob', 48, 24, { size: 24, f: DS, c: K.ink }); [['How it works', 1020], ['Pricing', 1140], ['Log in', 1226]].forEach(([l, x]) => s.t(l, x, 30, { size: 14, f: BD, c: K.ink2 })); pill(s, 1300, 20, 92, 38, 'Start'); };

  { // 01 Welcome
    const s = Screen('H3-01', 'Kiln Welcome', 'Kiln — Welcome (Hallmark dealt, reroll 3/3)', K.paper); nav(s);
    s.t('See where the\nheat went.', 48, 214, { size: 92, f: DS, lh: 94, ls: -2, c: K.ink });
    s.t('Every line glows by how much the AI\nrewrote it.', 48, 432, { size: 18, f: BD, lh: 28, c: K.ink2 });
    pill(s, 48, 512, 200, 50, 'Import a resume', 'ac'); pill(s, 262, 512, 150, 50, 'See a sample');
    s.r(700, 96, 620, 660, { fill: K.p2, r: 28, name: 'stage' });
    s.r(760, 260, 500, 500, { type: 'ellipse', grad: { t: 'radialGradient', stops: [{ position: 0, color: '#F2681E33' }, { position: 1, color: '#F2681E00' }] }, name: 'heat glow' });
    heatPage(s, 780, 136, 400);
    s.r(1150, 420, 250, 250, { fill: K.p3, r: 16, stroke: K.rule, shadow: { c: '#00000088', y: 30, b: 50 }, name: 'well' });
    s.t('Rewrite for Product designer, Figma', 1170, 440, { size: 12, f: BD, c: K.mute, w: 210 });
    s.t('5 lines', 1170, 480, { size: 54, f: DS, c: K.ink }); s.t('rewritten, the rest kept as you wrote it', 1170, 550, { size: 13, f: BD, c: K.ink2, w: 210, lh: 18 });
    ramp(s, 1170, 610, 210); s.t('kept', 1170, 626, { size: 11, f: BD, c: K.mute }); s.t('rewritten', 1290, 626, { w: 90, al: 'right', size: 11, f: BD, c: K.mute });
    s.done();
  }
  { // 02 Import — conversion as a firing curve
    const s = Screen('H3-02', 'Kiln Import', 'Kiln — Import, conversion as a firing curve', K.paper); nav(s);
    s.t('Bring your\nDOCX or PDF.', 48, 120, { size: 72, f: DS, lh: 76, ls: -1.5, c: K.ink });
    s.t('We read it slowly, then set it in LaTeX.', 48, 290, { size: 17, f: BD, c: K.ink2 });
    s.r(48, 360, 560, 320, { fill: K.p2, r: 16, stroke: '#F3ECDF33', dash: [6, 6], name: 'drop well' });
    s.t('Drop a file', 48, 470, { w: 560, al: 'center', size: 40, f: DS, c: K.ink }); pill(s, 248, 548, 160, 44, 'or choose one');
    s.r(680, 96, 712, 620, { fill: K.p2, r: 28, name: 'curve card' });
    s.t('resume_2024.docx', 716, 128, { size: 15, f: 'Segoe UI|Semibold', c: K.ink }); s.t('Converting', 1240, 130, { w: 116, al: 'right', size: 14, f: BD, c: K.ac });
    s.t('Step 3 of 5', 716, 164, { size: 64, f: DS, c: K.ink });
    const X0 = 716, Y0 = 640, steps = [['Read', 520], ['Sections', 440], ['LaTeX', 360], ['Typeset', 290], ['Proof', 250]];
    [0, 1, 2, 3].forEach(i => s.hl(X0, 300 + i * 110, 640, K.rule));
    let px = X0, py = Y0;
    steps.forEach(([l, ty], i) => {
      const hx = X0 + 40 + i * 124, done = i < 3, c = done ? H[i + 1] : '#F3ECDF33';
      s.hl(px, py, hx - px, c, 3); s.vl(hx, Math.min(py, ty), Math.abs(py - ty), c, 3); s.hl(hx, ty, 84, c, 3);
      s.t(l, hx, ty - 24, { size: 13, f: BD, c: done ? K.ink2 : K.mute }); px = hx + 84; py = ty;
    });
    s.r(X0 + 40 + 2 * 124 + 84 - 8, 360 - 8, 16, 16, { type: 'ellipse', fill: K.ac, stroke: K.ink, sw: 2, name: 'now' });
    s.r(716, 664, 640, 1, { fill: K.rule });
    s.t('Found five sections and five bullets. Keeping your fonts.', 716, 676, { size: 14, f: BD, c: K.ink2 });
    s.done();
  }
  { // 03 Editor
    const s = Screen('H3-03', 'Kiln Editor', 'Kiln — Editor, heat-mapped page', K.paper);
    s.t('AnyJob', 24, 20, { size: 22, f: DS, c: K.ink }); s.t('Product designer, Figma', 140, 26, { size: 14, f: BD, c: K.ink2 });
    ramp(s, 860, 30, 120); s.t('kept', 820, 24, { size: 11, f: BD, c: K.mute }); s.t('rewritten', 990, 24, { size: 11, f: BD, c: K.mute });
    pill(s, 1120, 14, 130, 38, 'Accept all'); pill(s, 1262, 14, 154, 38, 'Export PDF', 'ac');
    s.r(24, 76, 420, 800, { fill: K.p2, r: 16, name: 'code well' });
    s.t('main.tex', 48, 96, { size: 12, f: MO, c: K.mute }); s.hl(24, 122, 420, K.rule);
    code(s, 48, 140, { lh: 23, size: 12, f: MO, c: K.ink2, num: '#6B5C4E', w: 388 }, { 6: { bar: H[4], bg: '#F2862B22' }, 7: { bar: H[4], bg: '#F2862B22' }, 12: { bar: H[3] }, 13: { bar: H[3] }, 14: { bar: H[1] }, 19: { bar: H[2] }, 23: { bar: H[3] } });
    heatPage(s, 476, 84, 500);
    s.r(1004, 76, 412, 800, { fill: K.p2, r: 16, name: 'changes' });
    s.t('5 lines', 1028, 96, { size: 64, f: DS, c: K.ink }); s.t('rewritten for this job', 1028, 176, { size: 14, f: BD, c: K.ink2 }); s.hl(1004, 216, 412, K.rule);
    [[4, 'Summary', 'Rewritten around product work'], [3, 'Razorpay, first bullet', 'Leads with the result'], [2, 'Zeta, ledger', 'Names the banks'], [3, 'Skills', 'Figma and research moved up']].forEach(([h, t, d], i) => {
      const y = 236 + i * 108; s.r(1028, y + 4, 10, 40, { fill: H[h], r: 3, name: 'heat swatch' });
      s.t(t, 1054, y, { size: 16, f: 'Segoe UI|Semibold', c: K.ink }); s.t(d, 1054, y + 24, { size: 13, f: BD, c: K.mute });
      pill(s, 1054, y + 52, 84, 32, 'Accept'); pill(s, 1148, y + 52, 72, 32, 'Undo'); s.hl(1004, y + 98, 412, K.rule);
    });
    s.r(1028, 804, 364, 48, { fill: K.p3, r: 24, stroke: K.rule, name: 'ask' }); s.t('Ask for a change', 1050, 818, { size: 14, f: BD, c: K.mute });
    pill(s, 1310, 810, 74, 36, 'Send', 'ac');
    s.done();
  }
}

// ───────────────────────── 4 · DARKROOM — develop the print ─────────────────────────
{
  const K = { paper: '#0F0C0A', p2: '#17130F', p3: '#211C17', ink: '#ECE6DA', ink2: '#C9C3B8', mute: '#9A938A', rule: '#3A342E', am: '#F0A044', print: '#E9E4DA', pInk: '#17130F', pMute: '#6E675E', pRule: '#C9C2B6', neg: '#2A2520' };
  const DC = 'Bahnschrift|Light Condensed', DCR = 'Bahnschrift|Condensed', B = 'Bahnschrift|Light', BR = 'Bahnschrift', MO = 'Consolas';
  const P = { head: DCR, body: B, bodyB: BR, ink: K.pInk, ink2: K.pInk, mute: K.pMute, rule: K.pRule };
  const b = (s, x, y, w, h, l, am) => btn(s, x, y, w, h, l, am ? { fill: K.am, c: K.paper, f: DCR, size: 17 } : { stroke: K.ink2, c: K.ink, f: DCR, size: 17 });
  const negative = (s, x, y, w) => { s.r(x, y, w, w * 1.414, { fill: K.neg, name: 'negative' }); s.paper(x, y, w, w * 1.414, { paper: '#00000000', name: '#D8D0C488', sec: '#D8D0C466', line: '#D8D0C433' }); };
  const nav = (s) => { s.t('ANYJOB', 48, 22, { size: 24, f: DCR, c: K.ink }); [['Templates', 1060], ['Pricing', 1150]].forEach(([l, x]) => s.t(l, x, 28, { size: 14, f: B, c: K.mute })); b(s, 1272, 16, 120, 38, 'START'); s.hl(0, 70, 1440, K.rule); };

  { // 01 Welcome — poster
    const s = Screen('H4-01', 'Darkroom Welcome', 'Darkroom — Welcome, poster hero (Hallmark dealt 3/3)', K.paper); nav(s);
    negative(s, 600, 140, 290); s.t('Plate 01, your DOCX', 600, 560, { size: 12, f: B, c: K.mute });
    s.r(910, 100, 420, 594, { fill: K.print, name: 'print' }); resume(s, 910, 100, 420, P);
    s.t('Plate 02, typeset in LaTeX', 910, 706, { size: 12, f: B, c: K.mute }); s.hl(910, 694, 420, K.am, 2);
    s.t('DEVELOP\nYOUR RESUME', 40, 470, { size: 200, f: DC, lh: 176, ls: -2, c: K.ink });
    s.t('Your old DOCX goes in. A typeset\nLaTeX print comes out.', 1010, 742, { size: 18, f: B, lh: 27, c: K.ink2 });
    b(s, 1010, 816, 190, 46, 'IMPORT A RESUME', true); b(s, 1212, 816, 150, 46, 'SEE THE PLATES');
    s.done();
  }
  { // 02 Import — in the tray
    const s = Screen('H4-02', 'Darkroom Import', 'Darkroom — Import, negative to print', K.paper); nav(s);
    s.t('IN THE TRAY', 48, 92, { size: 96, f: DC, c: K.ink });
    negative(s, 120, 240, 400); s.t('Plate 01, resume_2024.docx', 120, 818, { size: 13, f: B, c: K.mute });
    s.r(920, 240, 400, 566, { grad: { stops: [K.print, K.print, K.p3], from: [0, 0], to: [0, 1] }, name: 'developing print' });
    s.r(920, 240, 400, 566, { grad: { stops: ['#E9E4DA00', '#E9E4DA00', '#211C17FF'], from: [0, .5], to: [0, .78] }, name: 'still dark' });
    const rz = resume(s, 920, 240, 400, P);
    s.r(920, 240 + 566 * .55, 400, 566 * .45, { grad: { stops: ['#211C1700', '#211C17F5', '#211C17FF'], from: [0, 0], to: [0, .5] }, name: 'undeveloped' });
    s.hl(900, 240 + 566 * .55, 440, K.am, 1); s.t('Developing, section 3 of 5', 920, 818, { size: 13, f: B, c: K.am });
    const X = 580; s.t('THE PROCESS', X, 240, { size: 30, f: DCR, c: K.ink });
    [['Read the file', 1], ['Find the sections', 1], ['Write LaTeX', 2], ['Typeset', 0], ['Proof against the original', 0]].forEach(([l, st], i) => {
      const y = 300 + i * 64; s.hl(X, y, 280, K.rule);
      s.t(String(i + 1).padStart(2, '0'), X, y + 18, { size: 22, f: DC, c: st === 2 ? K.am : st ? K.ink2 : K.mute });
      s.t(l, X + 46, y + 22, { size: 15, f: B, c: st === 2 ? K.am : st ? K.ink : K.mute, w: 230 });
    });
    b(s, X, 680, 200, 44, 'DROP ANOTHER FILE');
    s.done();
  }
  { // 03 Editor — print + contact sheet
    const s = Screen('H4-03', 'Darkroom Editor', 'Darkroom — Editor, notes / print / code / contact sheet', K.paper);
    s.t('ANYJOB', 24, 18, { size: 22, f: DCR, c: K.ink }); s.t('Backend engineer, Stripe', 130, 24, { size: 14, f: B, c: K.ink2 });
    b(s, 1086, 12, 150, 38, 'ACCEPT ALL'); b(s, 1248, 12, 168, 38, 'EXPORT PDF', true); s.hl(0, 62, 1440, K.rule);
    s.r(0, 63, 372, 757, { fill: K.p2, name: 'notes' }); s.t('NOTES', 24, 80, { size: 44, f: DC, c: K.ink });
    [['Summary', 'One line, built around payments', 1], ['Razorpay, first bullet', 'Leads with the latency result', 0], ['Zeta, ledger', 'Names the three banks', 0], ['Skills', 'Go and Postgres first', 0]].forEach(([t, d, on], i) => {
      const y = 152 + i * 132; s.hl(0, y, 372, K.rule); if (on) s.r(0, y, 3, 132, { fill: K.am });
      s.t(String(i + 1).padStart(2, '0'), 24, y + 18, { size: 28, f: DC, c: on ? K.am : K.mute });
      s.t(t, 74, y + 20, { size: 16, f: BR, c: K.ink }); s.t(d, 74, y + 44, { size: 13, f: B, c: K.mute });
      s.t('Accept', 74, y + 84, { size: 14, f: BR, c: on ? K.am : K.ink2 }); s.t('Skip', 150, y + 84, { size: 14, f: B, c: K.mute });
    });
    s.r(420, 84, 520, 735, { fill: K.print, name: 'print' }); const rz = resume(s, 420, 84, 520, P);
    s.r(rz.L - 14, rz.ys[3] - 2, 3, 16, { fill: K.am }); s.hl(rz.L, rz.ys[3] + 14, 340, K.am, 2);
    s.r(988, 63, 452, 757, { fill: K.p2, name: 'code' }); s.t('main.tex', 1012, 82, { size: 12, f: MO, c: K.mute }); s.hl(988, 106, 452, K.rule);
    code(s, 1012, 124, { lh: 23, size: 11.5, f: MO, c: K.ink2, num: '#5B544C', w: 420 }, { 6: { bar: K.am, c: K.am }, 7: { bar: K.am, c: K.am } });
    s.r(0, 820, 1440, 80, { fill: K.p3, name: 'contact sheet' }); s.t('Versions', 24, 850, { size: 14, f: B, c: K.mute });
    for (let i = 0; i < 6; i++) {
      const x = 120 + i * 76, cur = i === 5; s.r(x, 832, 40, 56, { fill: K.print, op: cur ? 1 : .55, stroke: cur ? K.am : null, sw: 2, name: 'thumb' });
      s.paper(x, 832, 40, 56, { paper: '#00000000', name: '#17130F', sec: '#6E675E', line: '#C9C2B6' }); s.t('v' + (i + 1), x + 46, 852, { size: 12, f: B, c: cur ? K.am : K.mute });
    }
    s.done();
  }
}

// ───────────────────────── 5 · VELLUM — the proof sheet ─────────────────────────
{
  const K = { paper: '#F2E9D8', p2: '#E8DCC4', p3: '#DDCFB4', ink: '#2E2117', ink2: '#3E3127', mute: '#6B5D4E', rule: '#BFAE91', ul: '#2B44B0', ulSoft: '#D9DDF0', acInk: '#F2E9D8', page: '#FBF6EC' };
  const BL = 'Old English Text MT', RO = 'Goudy Old Style', BO = 'Franklin Gothic Book', MO = 'Consolas';
  const P = { head: RO, headB: 'Goudy Old Style|Bold', body: BO, bodyB: 'Franklin Gothic Medium', ink: K.ink, ink2: K.ink2, mute: K.mute, rule: K.rule };
  const dbl = (s, x, y, w, c = K.ink) => { s.hl(x, y, w, c); s.hl(x, y + 3, w, c); };
  const b = (s, x, y, w, h, l, kind) => btn(s, x, y, w, h, l, kind === 'ul' ? { fill: K.ul, c: K.acInk, r: 2, f: BO, size: 15 } : kind === 'paper' ? { fill: K.paper, c: K.ul, r: 2, f: BO, size: 15 } : { stroke: K.ink, c: K.ink, r: 2, f: BO, size: 15 });
  const marks = (s, rz, notes) => notes.forEach(([i, note, kind], n) => {
    const y = rz.ys[i] + 5 * rz.k;
    if (kind === 'strike') s.hl(rz.L + 12 * rz.k, y, 150 * rz.k, K.ul, 1.5);
    if (kind === 'caret') { s.t('^', rz.L + 200 * rz.k, rz.ys[i] + 6 * rz.k, { size: 14, f: RO, c: K.ul }); }
    if (kind === 'box') s.r(rz.L - 4, rz.ys[i] - 3, rz.R - rz.L + 8, 15 * rz.k, { fill: '#00000000', stroke: K.ul, sw: 1.2, name: 'mark' });
    s.hl(rz.R + 8, y, 30, K.ul); s.t(note, rz.R + 44, y - 10, { size: 17, f: RO, c: K.ul, w: 150 });
  });
  const nav = (s) => { s.t('How it works', 64, 30, { size: 14, f: BO, c: K.ink }); s.t('AnyJob', 0, 18, { w: 1440, al: 'center', size: 36, f: BL, c: K.ink }); s.t('Log in', 1220, 30, { size: 14, f: BO, c: K.ink }); b(s, 1290, 20, 92, 36, 'Start', 'ul'); dbl(s, 0, 74, 1440); };

  { // 01 Welcome
    const s = Screen('H5-01', 'Vellum Welcome', 'Vellum — Welcome, proof sheet (outside the deal: typesetting heritage fits LaTeX)', K.paper); nav(s);
    s.t('Set in type,\nproofed by AI.', 64, 170, { size: 90, f: BL, lh: 92, c: K.ink });
    s.t('Your DOCX or PDF, reset in LaTeX and\nmarked like a proof.', 64, 384, { size: 19, f: BO, lh: 29, c: K.ink2 });
    b(s, 64, 466, 200, 50, 'Import a resume', 'ul'); b(s, 278, 466, 150, 50, 'See a proof');
    s.r(740, 110, 440, 622, { fill: K.page, stroke: K.rule, name: 'proof page' }); const rz = resume(s, 740, 110, 440, P);
    marks(s, rz, [[3, 'tighten', 'box'], [6, 'lead with the result', 'strike'], [10, 'name the banks', 'caret'], [17, 'stet', 'box']]);
    dbl(s, 64, 800, 1312); s.t('Takes .docx, .pdf and .tex', 64, 822, { size: 14, f: BO, c: K.mute });
    s.done();
  }
  { // 02 Import — ultramarine order field
    const s = Screen('H5-02', 'Vellum Import', 'Vellum — Import, the order of work', K.ul); s.r(0, 0, 1440, 78, { fill: K.paper }); nav(s);
    s.t('Bring the manuscript.', 64, 120, { size: 60, f: BL, c: K.acInk });
    const lab = (t, x, y) => s.t(t, x, y, { size: 13, f: BO, c: K.acInk, op: .85 });
    lab('File', 64, 222); s.r(64, 246, 560, 170, { fill: '#00000000', stroke: K.acInk, op: .6, name: 'drop' });
    s.t('Drop a .docx, .pdf or .tex', 64, 296, { w: 560, al: 'center', size: 20, f: BO, c: K.acInk }); b(s, 264, 340, 160, 42, 'Choose a file', 'paper');
    const seg = (x, y, w, opts) => opts.forEach((o, i) => { const cw = w / opts.length, on = i === 0; s.r(x + i * cw, y, cw, 44, { fill: on ? K.paper : '#00000000', stroke: K.acInk, name: 'segment' }); s.t(o, x + i * cw, y + 12, { w: cw, al: 'center', size: 15, f: BO, c: on ? K.ul : K.acInk }); });
    lab('Layout', 64, 446); seg(64, 470, 560, ['Keep my layout', 'Use a template']);
    lab('Pages', 64, 540); seg(64, 564, 270, ['One', 'Two']);
    lab('Tone', 354, 540); seg(354, 564, 270, ['As written', 'Sharper']);
    const X = 760; s.r(X, 222, 616, 4, { fill: K.acInk, op: .5, name: 'rule' });
    s.t('Your proof', X, 246, { size: 13, f: BO, c: K.acInk, op: .85 });
    s.t('One page', X, 282, { size: 72, f: RO, c: K.acInk }); s.t('from resume.docx, two pages in Word', X, 370, { size: 22, f: RO, c: K.acInk });
    [['Sections', 'Summary, Experience, Projects, Skills'], ['Fonts', 'Kept as close as LaTeX allows'], ['Marks', 'Shown in the margin, nothing applied yet']].forEach(([a, v], i) => {
      const y = 434 + i * 48; s.hl(X, y, 616, K.acInk, 1, .35); s.t(a, X, y + 15, { size: 14, f: BO, c: K.acInk, op: .85 }); s.t(v, X + 180, y + 15, { size: 14, f: BO, c: K.acInk });
    });
    s.hl(X, 578, 616, K.acInk, 1, .35); b(s, X, 604, 616, 50, 'Set it in type', 'paper');
    s.done();
  }
  { // 03 Editor — galley / proof / marks
    const s = Screen('H5-03', 'Vellum Editor', 'Vellum — Editor, galley / proof / marks', K.paper);
    s.t('AnyJob', 32, 16, { size: 30, f: BL, c: K.ink }); s.t('Backend engineer, Stripe', 160, 28, { size: 14, f: BO, c: K.ink2 });
    b(s, 1050, 16, 170, 40, 'Accept all marks'); b(s, 1232, 16, 176, 40, 'Pass for press', 'ul'); dbl(s, 0, 70, 1440);
    s.r(32, 98, 404, 778, { fill: K.p2, name: 'galley' }); s.t('Galley, main.tex', 52, 114, { size: 13, f: BO, c: K.mute }); s.hl(32, 140, 404, K.rule);
    code(s, 52, 156, { lh: 22.5, size: 11.5, f: MO, c: K.ink2, num: K.rule, w: 380 }, { 6: { bg: K.ulSoft, c: K.ul }, 7: { bg: K.ulSoft, c: K.ul }, 12: { c: K.ul }, 19: { c: K.ul } });
    s.r(466, 98, 520, 735, { fill: K.page, stroke: K.rule, name: 'proof page' }); const rz = resume(s, 466, 98, 520, P);
    [[3, 'box'], [6, 'strike'], [10, 'caret'], [17, 'box']].forEach(([i, kind], n) => {
      if (kind === 'box') s.r(rz.L - 4, rz.ys[i] - 3, rz.R - rz.L + 8, 16 * rz.k, { fill: '#00000000', stroke: K.ul, sw: 1.2, name: 'mark' });
      if (kind === 'strike') s.hl(rz.L + 12 * rz.k, rz.ys[i] + 5 * rz.k, 150 * rz.k, K.ul, 1.5);
      if (kind === 'caret') s.t('^', rz.L + 200 * rz.k, rz.ys[i] + 6 * rz.k, { size: 14, f: RO, c: K.ul });
      s.t(String(n + 1), rz.R + 6, rz.ys[i] - 4, { size: 18, f: RO, c: K.ul });
    });
    s.t('Marks', 1020, 92, { size: 48, f: BL, c: K.ink }); dbl(s, 1020, 158, 388);
    [['Summary', 'Cut to one line'], ['Razorpay', 'Lead with the result'], ['Zeta', 'Name the three banks'], ['Skills', 'Leave as written']].forEach(([a, d], i) => {
      const y = 176 + i * 140; s.t(String(i + 1), 1020, y, { size: 40, f: RO, c: K.ul });
      s.t(a, 1066, y + 6, { size: 16, f: 'Franklin Gothic Medium', c: K.ink }); s.t(d, 1066, y + 30, { size: 17, f: RO, c: K.ink2 });
      b(s, 1066, y + 66, 88, 34, 'Accept'); b(s, 1164, y + 66, 84, 34, 'Reject'); s.hl(1020, y + 124, 388, K.rule);
    });
    s.r(1020, 804, 388, 48, { fill: K.page, stroke: K.ink, name: 'ask' }); s.t('Mark something else', 1036, 818, { size: 15, f: BO, c: K.mute });
    b(s, 1322, 810, 78, 36, 'Send', 'ul');
    s.done();
  }
}
