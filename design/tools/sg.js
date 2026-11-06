// v5 — the whole AnyJob app in Signal (Wayfind, cobalt colourway): screens 00–13 from the v1 app map.
// Shell: a cobalt rail on the left (app pages: navigation; editor: sections, versions or files), paper content,
// ink plates for boards, amber for figures on ink, cobalt only for what is live or primary.
const { Screen } = require('./lib');
const { resume, code } = require('./kit');
const { M, MB, PL, SG, PAGE, EDITS, T, B, live, seg, page, diff } = require('./wayfind');

const W = '#FFFFFF', INKW = { line: W, txt: W, onFill: W, onTxt: SG.co };
const RAIL = 248, X0 = 296, X1 = 1392; // app content runs X0..X1
const wTxt = (l, size = 13) => l.length * size * 0.55;

const tag = (s, x, y, l, kind = 'out') => {
  const w = wTxt(l) + 28, k = { out: [null, PL.ink, PL.ink], am: [PL.am, null, PL.ink], outW: [null, W, W], ink: [PL.ink, null, W], soft: [PL.coSoft, null, SG.co] }[kind];
  s.r(x, y, w, 30, { fill: k[0] || '#00000000', stroke: k[1], sw: 2, name: 'tag' }); T(s, l, x, y + 8, 13, k[2], false, { w, al: 'center' }); return w;
};
const toggle = (s, x, y, on) => { s.r(x, y, 52, 28, { fill: on ? SG.co : PL.p3, stroke: PL.ink, sw: 2, name: 'toggle' }); s.r(on ? x + 28 : x + 4, y + 4, 20, 20, { fill: on ? W : PL.ink, name: 'knob' }); };
const check = (s, x, y, on, c = PL.ink) => { s.r(x, y, 20, 20, { fill: on ? SG.co : '#00000000', stroke: on ? SG.co : c, sw: 2, name: 'check' }); if (on) s.r(x + 6, y + 6, 8, 8, { fill: W, name: 'tick' }); };
const signPlate = (s, x, y, w, h, n, title, detail, fill, txt, numBg, numTxt) => {
  s.r(x, y, w, h, { fill, stroke: PL.ink, sw: 2, name: 'sign' }); const q = h - 32; s.r(x + 16, y + 16, q, q, { fill: numBg, name: 'number' });
  T(s, n, x + 16, y + h / 2 - 26, 48, numTxt, true, { w: q, al: 'center' }); T(s, title, x + q + 36, y + 24, 20, txt, true, { w: w - q - 52 }); T(s, detail, x + q + 36, y + 58, 13, txt, false, { w: w - q - 52, lh: 19, op: .85 });
};
const ask = (s, x, y, w, hint) => { s.r(x, y, w, 52, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'ask' }); T(s, hint, x + 18, y + 17, 14, PL.mute); B(s, x + w - 96, y + 9, 84, 34, 'Send', 'co'); };

// Tex, the mascot: the ASCII page from design/mascot/tex.html. Body in one text node, the edited line in amber,
// the L6 sign on an amber plate. mood: idle | happy | working | confused | sleepy.
const TEX_FACE = { idle: ['o     o', ' - '], happy: ['^     ^', '\\_/'], working: ['o     o', ' o '], confused: ['o     O', ' ~ '], sleepy: ['-     -', ' - '] };
function tex(s, x, y, fs, o = {}) {
  const [eyes, mouth] = TEX_FACE[o.mood || 'idle'], c = o.c || W, cw = fs * 0.55, lh = fs * 1.15;
  const l6 = o.l6 ?? (o.mood === 'working' ? '=====_' : o.mood === 'happy' ? '=========' : '======');
  const lines = [' .------------,', ` |  ${eyes}   |\\`, ` |    ${mouth}     |_\\`, ' |              |' + (o.sign ? '--' : ''), ' |  ==========  |', ' |              |', ' |  ========    |', " '--------------'", '     |      |', '    _|      |_'];
  if (o.above) T(s, o.above, x + 7 * cw, y - lh * 1.2, fs, c, true);
  T(s, lines.join('\n'), x, y, fs, c, true, { lh });
  T(s, l6, x + 4 * cw, y + 5 * lh, fs, o.edit || PL.am, true);
  if (o.sign) {
    s.r(x + 19 * cw, y + 2 * lh + 2, 6 * cw, 3 * lh - 4, { fill: PL.am, name: 'tex sign' });
    T(s, 'L6', x + 20 * cw, y + 3 * lh, fs, PL.ink, true, { w: 4 * cw, al: 'center' });
  }
}

// App shell: cobalt navigation rail
function appRail(s, active) {
  s.r(0, 0, RAIL, 900, { fill: SG.co, name: 'rail' }); T(s, 'AnyJob', 24, 24, 21, W, true);
  B(s, 24, 74, 200, 44, 'New application', 'ink');
  [['Home', 0], ['Applications', 6], ['Resumes', 4], ['Templates', 0], ['Import', 0]].forEach(([l, n], i) => {
    const y = 146 + i * 52, on = l === active; if (on) s.r(12, y, 224, 44, { fill: W, name: 'active' });
    T(s, l, 28, y + 14, 15, on ? SG.co : W, on); if (n) { s.r(192, y + 10, 32, 24, { fill: PL.am, name: 'count' }); T(s, String(n), 192, y + 15, 12, PL.ink, true, { w: 32, al: 'center' }); }
  });
  s.r(12, 724, 224, 84, { fill: SG.deep, name: 'usage' }); T(s, 'AI edits this month', 28, 738, 12, W, false, { op: .85 }); T(s, '42 of 100', 28, 758, 18, W, true);
  s.r(28, 788, 192, 4, { fill: SG.line, op: .5, name: 'track' }); s.r(28, 788, 81, 4, { fill: PL.am, name: 'used' });
  const on = active === 'Settings'; if (on) s.r(12, 830, 224, 44, { fill: W, name: 'active' });
  T(s, 'Divya A.', 28, 844, 14, on ? SG.co : W, true); T(s, 'Settings', 150, 845, 13, on ? SG.co : W, false, { w: 70, al: 'right' });
}
const head = (s, title, sub, cta) => { T(s, title, X0, 40, 40, PL.ink, true, { ls: -1.5 }); if (sub) T(s, sub, X0, 96, 15, PL.ink2); if (cta) B(s, X1 - cta.w, 44, cta.w, 44, cta.l, 'co'); };

// Editor shell: paper top bar + cobalt rail
function editorTop(s, mode, o = {}) {
  s.r(0, 0, 1440, 64, { fill: PL.p3, name: 'top bar' }); s.hl(0, 64, 1440, PL.ink, 2);
  s.r(0, 0, 280, 64, { fill: SG.co, name: 'rail top' }); T(s, 'AnyJob', 24, 22, 21, W, true); T(s, 'Applications', 150, 25, 13, W, false, { op: .85 });
  T(s, 'Backend engineer, Stripe', 304, 23, 16, PL.ink, true);
  seg(s, 640, 12, 330, ['Edit', 'Compare', 'Code'], mode);
  if (o.live !== false) live(s, 1000, 19); T(s, 'Saved', 1080, 24, 13, PL.mute); tag(s, 1140, 17, 'v3');
  B(s, 1252, 12, 164, 40, 'Export PDF', 'ink');
}
const railHead = (s, l, y) => T(s, l, 24, y, 13, W, false, { op: .8 });

// ═════════════ 00 App map — the screens as a transit network ═════════════
{
  const s = Screen('S-00', 'App map', 'Signal — 00 App map, the screens as a network', PL.paper);
  T(s, 'How the screens connect.', 64, 48, 40, PL.ink, true, { ls: -1.5 }); T(s, 'Three lines. They all meet at the editor.', 64, 104, 15, PL.ink2);
  const IX = 1220; // interchange: 07 Editor
  const line = (y, color, label, labelTxt, stops) => {
    s.r(64, y - 20, 196, 40, { fill: color, stroke: PL.ink, sw: 2, name: 'line name' }); T(s, label, 64, y - 8, 15, labelTxt, true, { w: 196, al: 'center' });
    s.r(300, y - 6, IX - 300, 12, { fill: color, name: 'line' });
    stops.forEach(([n, name, d], i) => {
      const x = 320 + i * 300; if (x >= IX - 10) return;
      s.r(x - 16, y - 16, 32, 32, { type: 'ellipse', fill: W, stroke: PL.ink, sw: 4, name: 'station' });
      T(s, n, x - 30, y - 46, 14, PL.ink, true, { w: 60, al: 'center' }); T(s, name, x - 110, y + 28, 16, PL.ink, true, { w: 220, al: 'center' }); T(s, d, x - 120, y + 52, 12, PL.mute, false, { w: 240, al: 'center' });
    });
  };
  line(250, SG.co, 'First run', W, [['01', 'Welcome', 'Sign in or just drop a file'], ['05', 'Import', 'DOCX, PDF, LaTeX, paste'], ['06', 'Converting', 'Rebuilt as LaTeX, checked']]);
  line(450, PL.ink, 'Daily use', W, [['02', 'Home', 'What needs you today'], ['03', 'Applications', 'Every job and its resume'], ['04', 'New application', 'Paste a job, check the fit']]);
  line(650, PL.am, 'In the editor', PL.ink, [['10', 'Export', 'PDF, DOCX, LaTeX, text'], ['09', 'Code', 'LaTeX with live preview'], ['08', 'Compare', 'Versions, before and after']]);
  s.r(IX - 26, 222, 52, 456, { fill: W, stroke: PL.ink, sw: 4, name: 'interchange' });
  [250, 450, 650].forEach(y => s.r(IX - 10, y - 10, 20, 20, { type: 'ellipse', fill: PL.ink, name: 'platform' }));
  s.r(IX + 46, 400, 150, 100, { fill: SG.co, stroke: PL.ink, sw: 2, name: 'editor sign' }); T(s, '07', IX + 62, 412, 14, PL.am, true); T(s, 'Editor', IX + 62, 434, 22, W, true); T(s, 'AI edits live', IX + 62, 466, 12, W);
  s.hl(64, 760, 1312, PL.ink, 2); T(s, 'Always one click from the rail', 64, 780, 13, PL.mute);
  [['11', 'Resumes', 'Master and versions'], ['12', 'Templates', 'Re-flow, nothing lost'], ['13', 'Settings', 'Truth guard, tone, export']].forEach(([n, l, d], i) => {
    const x = 64 + i * 330; s.r(x, 808, 310, 64, { fill: PL.ink, name: 'sign' }); T(s, n, x + 16, 828, 20, PL.am, true); T(s, l, x + 64, 818, 16, W, true); T(s, d, x + 64, 842, 12, PL.soft);
  });
  s.r(1064, 808, 312, 64, { fill: PL.amSoft, stroke: PL.ink, sw: 2, name: 'rule' }); T(s, 'The AI proposes. You accept.\nLaTeX stays optional.', 1080, 818, 13, PL.ink, true, { lh: 20 });
  s.done();
}

// ═════════════ 01 Welcome / Sign in ═════════════
{
  const s = Screen('S-01', 'Welcome', 'Signal — 01 Welcome and sign in', SG.co);
  T(s, 'AnyJob', 64, 30, 21, W, true);
  T(s, 'Tailor it.\nLine by line.', 64, 150, 84, W, true, { lh: 86, ls: -3 });
  T(s, 'Drop your DOCX or PDF. AnyJob rebuilds it\nin LaTeX and tailors it to each job.', 64, 352, 18, W, false, { lh: 28 });
  [['L6', 'Summary tightened'], ['L12', 'Leads with the result'], ['L23', 'Go and Postgres first']].forEach(([n, t], i) => {
    const y = 470 + i * 72; s.r(64, y, 420, 56, { fill: PL.ink, name: 'sign' }); T(s, n, 82, y + 15, 22, PL.am, true); T(s, t, 152, y + 19, 14, W, true);
  });
  T(s, 'A sample of what the board shows.', 64, 700, 12, W, false, { op: .8 });
  tex(s, 520, 470, 17, { mood: 'happy', sign: true });
  s.r(0, 800, 760, 100, { fill: SG.deep, name: 'strip' }); ['Takes .docx, .pdf, .tex', 'Every edit waits for your yes'].forEach((t, i) => T(s, t, 64 + i * 340, 840, 14, W));
  s.r(760, 0, 680, 900, { fill: PL.paper, name: 'auth side' });
  s.r(860, 140, 480, 620, { fill: PL.p3, stroke: PL.ink, sw: 2, shadow: { c: '#0E121B55', y: 24, b: 40 }, name: 'auth plate' });
  T(s, 'Get started', 892, 168, 28, PL.ink, true); s.hl(860, 220, 480, PL.ink, 2);
  B(s, 892, 248, 416, 50, 'Continue with Google', 'out'); B(s, 892, 310, 416, 50, 'Continue with LinkedIn', 'out');
  T(s, 'or with email', 892, 384, 13, PL.mute, false, { w: 416, al: 'center' });
  s.r(892, 412, 416, 50, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'email' }); T(s, 'you@email.com', 910, 429, 14, PL.mute);
  B(s, 892, 474, 416, 50, 'Continue', 'co');
  s.r(892, 560, 416, 168, { fill: PL.paper, stroke: PL.ink, sw: 2, dash: [8, 6], name: 'try it' });
  T(s, 'Just trying it?', 892, 592, 18, PL.ink, true, { w: 416, al: 'center' }); T(s, 'Drop a resume here. No account needed.', 892, 624, 13, PL.ink2, false, { w: 416, al: 'center' });
  T(s, '.docx  .pdf  .tex', 892, 672, 15, SG.co, true, { w: 416, al: 'center' });
  s.done();
}

// ═════════════ 02 Home ═════════════
{
  const s = Screen('S-02', 'Home', 'Signal — 02 Home', PL.paper); appRail(s, 'Home');
  head(s, 'Good morning, Divya.', 'Pick up where you left off.');
  signPlate(s, X0, 140, 352, 132, '1', 'Import a resume', 'DOCX or PDF, rebuilt as LaTeX', PL.ink, W, PL.am, PL.ink);
  signPlate(s, X0 + 372, 140, 352, 132, '2', 'Tailor to a job', 'Paste a link, check the fit', SG.co, W, W, SG.co);
  signPlate(s, X0 + 744, 140, 352, 132, '3', 'Use a template', 'Pick a design, keep your words', PL.p3, PL.ink, PL.ink, PL.am);
  s.r(X0, 304, 700, 330, { fill: PL.ink, name: 'board' }); T(s, 'Continue editing', X0 + 24, 324, 20, W, true); s.hl(X0, 360, 700, PL.inkRule, 2);
  [['Stripe', 'Backend engineer', 'v3', 'Edited 2 h ago', 1], ['Notion', 'Product engineer', 'v2', 'Draft', 0], ['Master resume', 'Your source of truth', 'v5', 'Edited yesterday', 0]].forEach((r, i) => {
    const y = 372 + i * 86; T(s, r[2], X0 + 24, y + 18, 30, PL.am, true); T(s, r[0], X0 + 100, y + 16, 18, W, true); T(s, r[1], X0 + 100, y + 42, 13, PL.soft);
    T(s, r[3], X0 + 400, y + 26, 13, PL.soft); if (r[4]) live(s, X0 + 530, y + 22); B(s, X0 + 600, y + 18, 76, 36, 'Open', 'outW'); if (i < 2) s.hl(X0, y + 80, 700, PL.inkRule);
  });
  const RX = X0 + 724, RW = 372; T(s, 'Needs you', RX, 310, 20, PL.ink, true);
  [['Notion, product engineer', 'Two keywords from the post are missing.', 'Fix it'], ['Master resume', 'Runs four lines onto page two.', 'Fit to one page'], ['Atlassian, Thursday', 'Prep notes from your own resume.', 'Prepare']].forEach((r, i) => {
    const y = 348 + i * 96; s.r(RX, y, RW, 84, { fill: PL.amSoft, stroke: PL.ink, sw: 2, name: 'needs you' });
    T(s, r[0], RX + 16, y + 12, 14, PL.ink, true); T(s, r[1], RX + 16, y + 34, 12, PL.ink2, false, { w: 190, lh: 17 }); B(s, RX + RW - 156, y + 24, 140, 36, r[2], 'out');
  });
  s.r(X0, 664, 1096, 196, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'this week' }); T(s, 'This week', X0 + 24, 684, 16, PL.ink, true); s.hl(X0, 714, 1096, PL.ink, 2);
  [['6', 'applications'], ['2', 'interviews'], ['84', 'average fit'], ['31', 'edits accepted']].forEach(([n, l], i) => {
    const x = X0 + 24 + i * 270; T(s, n, x, 734, 56, PL.ink, true); T(s, l, x, 806, 14, PL.ink2); if (i) s.vl(x - 24, 714, 146, PL.rule);
  });
  s.done();
}

// ═════════════ 03 Applications — list and detail ═════════════
{
  const s = Screen('S-03', 'Applications', 'Signal — 03 Applications, list and detail', PL.paper); appRail(s, 'Applications');
  T(s, 'Applications', 272, 32, 30, PL.ink, true); seg(s, 272, 86, 464, ['All', 'Draft', 'Sent', 'Interview'], 0);
  [['Stripe', 'Backend engineer', '91', 'Interview'], ['Notion', 'Product engineer', '84', 'Live'], ['Razorpay', 'Senior backend', '78', 'Draft'], ['Figma', 'Infra engineer', '88', 'Sent'], ['Zerodha', 'Platform engineer', '72', 'Draft'], ['Atlassian', 'SDE II', '80', 'Interview']].forEach((r, i) => {
    const y = 146 + i * 82, on = i === 0; if (on) { s.r(266, y, 476, 74, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'selected' }); s.r(266, y, 6, 74, { fill: SG.co }); }
    T(s, r[0], 290, y + 14, 18, PL.ink, true); T(s, r[1], 290, y + 42, 13, PL.mute); T(s, r[2], 520, y + 18, 30, PL.ink, true, { w: 60, al: 'right' });
    if (r[3] === 'Interview') tag(s, 600, y + 22, 'Interview', 'am'); else if (r[3] === 'Live') live(s, 600, y + 24); else T(s, r[3], 600, y + 29, 13, r[3] === 'Draft' ? PL.ink : PL.mute, r[3] === 'Draft');
    if (!on && i < 5) s.hl(272, y + 78, 464, PL.rule);
  });
  s.r(272, 652, 464, 200, { fill: PL.p3, stroke: PL.ink, sw: 2, dash: [8, 6], name: 'drop' });
  T(s, 'Drop a resume or\npaste a job link', 272, 704, 18, PL.ink, true, { w: 464, al: 'center', lh: 24 }); T(s, '.docx  .pdf  .tex  or a URL', 272, 772, 13, PL.mute, false, { w: 464, al: 'center' });
  s.r(760, 0, 680, 900, { fill: PL.p3, name: 'detail' }); s.vl(760, 0, 900, PL.ink, 2);
  T(s, 'Stripe', 788, 26, 28, PL.ink, true); T(s, 'Backend engineer, Bengaluru', 788, 66, 13, PL.mute); B(s, 1236, 26, 180, 44, 'Open in editor', 'co');
  seg(s, 788, 100, 628, ['Resume', 'Cover letter', 'Job post', 'Notes'], 0);
  page(s, 788, 164, 360, { 3: { fill: PL.amSoft }, 6: { fill: PL.amSoft } });
  s.r(1172, 164, 244, 168, { fill: PL.ink, name: 'fit' }); T(s, 'Fit', 1190, 180, 13, PL.dim); T(s, '91', 1190, 198, 60, PL.am, true); T(s, 'Up from 78', 1290, 222, 12, PL.soft); T(s, 'Missing: Go, Kubernetes', 1190, 282, 12, W, false, { w: 210 });
  ['Tailor again', 'Shorten to one page', 'Write a cover letter', 'Interview prep'].forEach((l, i) => B(s, 1172, 348 + i * 52, 244, 42, l, 'out'));
  T(s, 'Download', 1172, 562, 13, PL.mute); ['PDF', 'DOCX', 'TEX'].forEach((l, i) => B(s, 1172 + i * 84, 586, 76, 38, l, i ? 'out' : 'ink'));
  ask(s, 788, 822, 628, 'Ask about this application');
  s.done();
}

// ═════════════ 04 New application ═════════════
{
  const s = Screen('S-04', 'New application', 'Signal — 04 New application, job to fit', PL.paper); appRail(s, 'Applications');
  head(s, 'New application.');
  // three-stop route
  s.r(X0 + 520, 62, 440, 8, { fill: PL.rule }); s.r(X0 + 520, 62, 0, 8, { fill: SG.co });
  [['Job', 1], ['Resume', 0], ['Tailor', 0]].forEach(([l, on], i) => { const x = X0 + 520 + i * 220; s.r(x - 14, 52, 28, 28, { type: 'ellipse', fill: on ? SG.co : PL.p3, stroke: on ? PL.ink : PL.rule, sw: 4 }); T(s, l, x - 50, 90, 13, on ? PL.ink : PL.mute, true, { w: 100, al: 'center' }); });
  T(s, 'Job post', X0, 140, 15, PL.ink, true);
  s.r(X0, 168, 520, 230, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'job text' });
  T(s, 'Backend Engineer, Payments\nStripe, Bengaluru\n\nYou will build the APIs that move money\nfor millions of businesses. You know Go\nor Java, Postgres, and have run services\nin production on Kubernetes.', X0 + 18, 184, 13, PL.ink2, false, { lh: 22 });
  s.r(X0, 412, 420, 46, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'url' }); T(s, 'stripe.com/jobs/backend-payments', X0 + 16, 427, 13, PL.mute); B(s, X0 + 432, 412, 88, 46, 'Fetch', 'out');
  T(s, 'Base resume', X0, 490, 15, PL.ink, true);
  [['Master resume', 'v5, one page', 1], ['Stripe', 'v3', 0], ['old_resume.docx', 'Imported', 0]].forEach((r, i) => {
    const x = X0 + i * 176, on = r[2]; s.r(x, 518, 168, 86, { fill: on ? PL.ink : PL.p3, stroke: PL.ink, sw: 2, name: 'base' });
    T(s, r[0], x + 14, 536, 14, on ? W : PL.ink, true, { w: 146 }); T(s, r[1], x + 14, 562, 12, on ? PL.am : PL.mute, on);
  });
  B(s, X0, 636, 520, 54, 'Check the fit', 'co');
  const R = X0 + 560, RW = 536; s.r(R, 140, RW, 720, { fill: PL.ink, name: 'fit board' });
  T(s, 'Fit for Backend engineer, Stripe', R + 24, 160, 16, W, true); s.hl(R, 194, RW, PL.inkRule, 2);
  T(s, '78', R + 24, 210, 110, PL.am, true); T(s, 'out of 100', R + 184, 262, 14, PL.soft);
  T(s, 'Strong on backend and APIs. Two\nkeywords are missing, and the AI can\nadd them truthfully.', R + 24, 344, 14, W, false, { lh: 22 });
  T(s, 'Strengths', R + 24, 424, 13, PL.dim); let tx = R + 24; ['Python', 'REST APIs', 'Postgres', 'Led a team of four'].forEach(l => { tx += tag(s, tx, 446, l, 'outW') + 8; });
  T(s, 'Gaps', R + 24, 494, 13, PL.dim); tx = R + 24; ['Go', 'Kubernetes', 'Distributed systems'].forEach(l => { tx += tag(s, tx, 516, l, 'am') + 8; });
  s.hl(R, 568, RW, PL.inkRule); T(s, 'What the AI will do', R + 24, 584, 14, W, true);
  [['Rewrite the summary for backend work', 1], ['Put Go and Postgres first in skills', 1], ['Reword three bullets with your real numbers', 1], ['Draft a matching cover letter', 0], ['Keep it to one page', 1]].forEach(([l, on], i) => { const y = 614 + i * 32; check(s, R + 24, y, on, W); T(s, l, R + 58, y + 2, 13, on ? W : PL.dim); });
  B(s, R + 24, 790, RW - 48, 50, 'Tailor and open the editor', 'am');
  s.done();
}

// ═════════════ 05 Import ═════════════
{
  const s = Screen('S-05', 'Import', 'Signal — 05 Import, choose a source', PL.paper); appRail(s, 'Import');
  head(s, 'Import a resume.', 'We keep your layout and turn it into LaTeX.');
  s.r(X0, 140, 1096, 280, { fill: PL.p3, stroke: PL.ink, sw: 2, dash: [10, 6], name: 'drop zone' });
  T(s, '.docx  .pdf  .tex  .zip', X0, 210, 44, PL.ink, true, { w: 1096, al: 'center', ls: -1 });
  B(s, X0 + 448, 290, 200, 50, 'Choose a file', 'co');
  T(s, 'Scanned PDFs are read with OCR. You check anything unclear.', X0, 372, 13, PL.mute, false, { w: 1096, al: 'center' });
  T(s, 'Other ways in', X0, 456, 18, PL.ink, true);
  [['Paste text', 'From a doc or your LinkedIn about section'], ['LinkedIn profile', 'Paste your profile link'], ['Google Drive', 'Pick a Doc or PDF'], ['Start from scratch', 'Answer five questions']].forEach(([t, d], i) => {
    const x = X0 + i * 280; s.r(x, 492, 256, 112, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'source' }); T(s, t, x + 18, 510, 16, PL.ink, true); T(s, d, x + 18, 540, 12, PL.mute, false, { w: 220, lh: 18 });
  });
  s.r(X0, 636, 1096, 228, { fill: PL.ink, name: 'recent' }); T(s, 'Recent imports', X0 + 24, 654, 16, W, true);
  T(s, 'Layout match', X0 + 760, 658, 13, PL.dim, false, { w: 140, al: 'right' }); s.hl(X0, 686, 1096, PL.inkRule, 2);
  [['old_resume.docx', 'Word, 3 days ago', '97'], ['resume_2023.pdf', 'PDF, last week', '91'], ['cv_academic.tex', 'LaTeX, last month', '100']].forEach((r, i) => {
    const y = 696 + i * 56; T(s, r[0], X0 + 24, y + 16, 16, W, true); T(s, r[1], X0 + 360, y + 18, 13, PL.soft); T(s, r[2], X0 + 760, y + 10, 28, PL.am, true, { w: 140, al: 'right' });
    B(s, X0 + 996, y + 10, 76, 36, 'Open', 'outW'); if (i < 2) s.hl(X0, y + 54, 1096, PL.inkRule);
  });
  s.done();
}

// ═════════════ 06 Converting ═════════════
{
  const s = Screen('S-06', 'Converting', 'Signal — 06 Converting, with a fidelity check', PL.paper); appRail(s, 'Import');
  head(s, 'Importing old_resume.docx', 'Rebuilding your layout in LaTeX.');
  const stops = ['Upload', 'Read', 'Sections', 'Rebuild', 'Compile', 'Compare'], x0 = X0 + 20, gap = 1056 / 5, cur = 3;
  s.r(x0, 160, gap * 5, 10, { fill: PL.rule }); s.r(x0, 160, gap * cur, 10, { fill: SG.co });
  stops.forEach((l, i) => { const x = x0 + i * gap; s.r(x - 14, 151, 28, 28, { type: 'ellipse', fill: i === cur ? SG.co : PL.p3, stroke: i > cur ? PL.rule : PL.ink, sw: 4 }); T(s, l, x - 60, 192, 14, i > cur ? PL.mute : PL.ink, true, { w: 120, al: 'center' }); });
  T(s, 'Before, your DOCX', X0, 240, 13, PL.mute, true); T(s, 'After, LaTeX', X0 + 400, 240, 13, PL.ink, true);
  s.r(X0, 264, 370, 523, { fill: PL.p2, stroke: PL.rule, sw: 2, name: 'before' }); resume(s, X0, 264, 370, { ...PAGE, head: M, ink: PL.mute, ink2: PL.mute });
  page(s, X0 + 400, 264, 370, { 3: { fill: PL.coSoft } }); const cut = 264 + 523 * .52;
  s.r(X0 + 402, cut, 366, 787 - cut - 2, { fill: PL.p2, name: 'not yet' }); s.hl(X0 + 392, cut, 386, SG.co, 3);
  tex(s, X0 + 470, cut + 26, 12, { mood: 'working', c: PL.ink, edit: SG.co });
  T(s, 'Typesetting the rest', X0 + 400, cut + 200, 14, SG.co, true, { w: 370, al: 'center' });
  const R = X0 + 810, RW = 286; s.r(R, 240, RW, 200, { fill: PL.ink, name: 'fidelity' });
  T(s, 'Layout match', R + 20, 258, 13, PL.dim); T(s, '97', R + 20, 280, 80, PL.am, true); T(s, 'Checked against\nyour original', R + 150, 312, 12, PL.soft, false, { lh: 18 });
  T(s, 'Two things changed', R, 468, 14, PL.ink, true);
  [['Skills table became a list', 'Keeps it ATS-safe'], ['Garamond Pro became EB Garamond', 'Closest free match']].forEach(([a, b], i) => {
    const y = 496 + i * 92; s.r(R, y, RW, 80, { fill: PL.amSoft, stroke: PL.ink, sw: 2, name: 'note' }); T(s, a, R + 16, y + 14, 13, PL.ink, true, { w: RW - 32 }); T(s, b, R + 16, y + 50, 12, PL.ink2);
  });
  B(s, R, 690, RW, 46, 'Fix with AI', 'out'); B(s, R, 746, RW, 50, 'Open the editor', 'co');
  s.done();
}

// ═════════════ 07 Editor — Edit ═════════════
{
  const s = Screen('S-07', 'Editor Edit', 'Signal — 07 Editor, Edit mode', PL.p2); editorTop(s, 0);
  s.r(0, 66, 280, 834, { fill: SG.co, name: 'rail' }); railHead(s, 'Sections', 86);
  [['Header', 0], ['Summary', 1], ['Experience', 2], ['Projects', 0], ['Education', 0], ['Skills', 1]].forEach(([l, n], i) => {
    const y = 110 + i * 52, on = l === 'Summary'; if (on) s.r(12, y, 256, 44, { fill: W, name: 'active' });
    T(s, l, 28, y + 13, 15, on ? SG.co : W, on); if (n) { s.r(220, y + 10, 32, 24, { fill: PL.am }); T(s, String(n), 220, y + 15, 12, PL.ink, true, { w: 32, al: 'center' }); }
  });
  T(s, 'Add a section', 28, 432, 13, W, true);
  s.hl(12, 470, 256, SG.line, 1, .6); railHead(s, 'Design', 488);
  [['Template', 'Classic'], ['Font', 'Inter'], ['Spacing', 'Normal'], ['Margins', 'Narrow']].forEach(([a, b], i) => { T(s, a, 28, 518 + i * 34, 13, W); T(s, b, 150, 518 + i * 34, 13, W, true); });
  s.hl(12, 670, 256, SG.line, 1, .6); railHead(s, 'Versions', 688);
  [['v3', 'Tailored for Stripe', 1], ['v2', 'One page', 0], ['v1', 'Imported', 0]].forEach(([v, l, on], i) => { T(s, v, 28, 716 + i * 32, 14, on ? PL.am : W, true); T(s, l, 70, 717 + i * 32, 13, W, false, { op: on ? 1 : .8 }); });
  const rz = page(s, 330, 92, 520, { 3: { fill: PL.amSoft } }); s.r(rz.L - 7, rz.ys[3] - 3, 3, 17, { fill: PL.am });
  const py = rz.ys[6] + 18; s.r(rz.L - 10, py, 470, 96, { fill: PL.ink, shadow: { c: '#0E121B55', y: 16, b: 30 }, name: 'inline ai' });
  let cx = rz.L + 4; ['Add a metric', 'Shorter', 'Match the job'].forEach(l => { cx += tag(s, cx, py + 14, l, 'outW') + 8; });
  T(s, 'p95 latency down from 420 to 180 ms', rz.L + 4, py + 60, 13, W);
  T(s, 'Accept', rz.L + 340, py + 60, 13, PL.am, true); T(s, 'Retry', rz.L + 410, py + 60, 13, PL.soft);
  s.r(330, 846, 520, 40, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'status' });
  [['One page', 346], ['ATS check passed', 470], ['Fit 91', 680]].forEach(([l, x]) => T(s, l, x, 858, 13, PL.ink2));
  // right: section panel + agent
  const R = 900, RW = 540; s.r(R, 66, RW, 834, { fill: PL.p3, name: 'panel' }); s.vl(R, 66, 834, PL.ink, 2);
  T(s, 'Summary', R + 28, 86, 26, PL.ink, true); T(s, 'Line 6, one edit', R + 28, 124, 13, PL.mute); live(s, R + RW - 94, 92); s.hl(R, 150, RW, PL.ink, 2);
  s.r(R + 28, 168, RW - 56, 60, { fill: PL.p2, name: 'before' }); T(s, 'Backend engineer who ships payment\nsystems that stay up.', R + 44, 178, 13, PL.mute, false, { lh: 20 });
  s.r(R + 28, 236, RW - 56, 60, { fill: PL.ink, name: 'after' }); T(s, 'Backend engineer for payment\nsystems that stay up.', R + 44, 246, 13, W, false, { lh: 20 });
  B(s, R + 28, 312, 140, 42, 'Accept', 'co'); B(s, R + 180, 312, 100, 42, 'Skip', 'out'); T(s, 'Why: the post asks for a short summary.', R + 296, 325, 12, PL.mute, false, { w: 220 });
  s.hl(R, 376, RW, PL.rule); T(s, 'Agent, run 4', R + 28, 394, 16, PL.ink, true); T(s, '0:21', R + RW - 100, 396, 13, PL.mute, false, { w: 72, al: 'right' });
  [['Read old_resume.docx', 2], ['Read the Stripe post', 2], ['Planned four edits', 2], ['Editing the summary', 1], ['Check it fits one page', 0], ['Save as v4', 0]].forEach(([l, st], i) => {
    const y = 428 + i * 34; s.r(R + 28, y, 18, 18, { fill: st === 2 ? PL.ink : st === 1 ? SG.co : '#00000000', stroke: st ? null : PL.rule, sw: 2, name: 'step' });
    T(s, l, R + 60, y + 1, 13, st ? PL.ink : PL.mute, st === 1);
  });
  s.r(R + 28, 646, RW - 56, 104, { fill: PL.amSoft, stroke: PL.ink, sw: 2, name: 'question' });
  T(s, 'One question', R + 44, 660, 13, PL.ink, true); T(s, 'No number for the Zeta ledger volume.\nLeave it out, or add your own?', R + 44, 682, 13, PL.ink2, false, { lh: 19 });
  B(s, R + RW - 248, 708, 104, 32, 'Leave out', 'out'); B(s, R + RW - 136, 708, 92, 32, 'Add mine', 'ink');
  ask(s, R + 28, 820, RW - 56, 'Steer the agent');
  s.done();
}

// ═════════════ 08 Editor — Compare ═════════════
{
  const s = Screen('S-08', 'Editor Compare', 'Signal — 08 Editor, Compare mode', PL.paper); editorTop(s, 1);
  s.r(0, 66, 280, 834, { fill: SG.co, name: 'rail' }); railHead(s, 'Versions', 86);
  s.r(44, 130, 8, 450, { fill: W, op: .5, name: 'line' });
  [['v1', 'Imported', 'old_resume.docx', 0], ['v2', 'One page', 'Shortened', 0], ['v3', 'Tailored, Stripe', 'Four changes', 1], ['v4', 'AI working', 'Started 0:21 ago', 2]].forEach(([v, l, d, st], i) => {
    const y = 130 + i * 140; if (st === 1) s.r(12, y - 18, 256, 84, { fill: W, name: 'active' });
    s.r(34, y - 6, 28, 28, { type: 'ellipse', fill: st === 1 ? SG.co : st === 2 ? PL.am : W, stroke: PL.ink, sw: 3, name: 'station' });
    T(s, v + '  ' + l, 76, y - 6, 15, st === 1 ? SG.co : W, true); T(s, d, 76, y + 18, 12, st === 1 ? PL.ink2 : W, false, { op: st === 1 ? 1 : .8 });
  });
  B(s, 24, 640, 232, 44, 'Branch for another job', 'outW');
  T(s, 'Before, v1', 312, 92, 13, PL.mute, true); T(s, 'After, v3', 1092, 92, 13, PL.ink, true);
  s.r(312, 116, 330, 467, { fill: PL.p2, stroke: PL.rule, sw: 2, name: 'before' }); resume(s, 312, 116, 330, { ...PAGE, head: M, ink: PL.mute, ink2: PL.mute });
  page(s, 1092, 116, 330, { 3: { fill: PL.amSoft }, 6: { fill: PL.amSoft }, 10: { fill: PL.amSoft }, 17: { fill: PL.amSoft } });
  s.r(668, 116, 400, 467, { fill: PL.ink, name: 'changes' }); T(s, 'Four changes', 688, 134, 18, W, true); s.hl(668, 166, 400, PL.inkRule, 2);
  EDITS.forEach((e, i) => {
    const y = 176 + i * 84; check(s, 688, y + 6, i !== 2, W); T(s, e.ln, 720, y + 2, 20, PL.am, true); T(s, e.sec, 782, y + 5, 13, W, true);
    T(s, e.before, 720, y + 32, 12, PL.dim); s.hl(720, y + 39, e.before.length * 6.6, PL.dim); T(s, e.after, 720, y + 52, 12, W);
    if (i < 3) s.hl(668, y + 78, 400, PL.inkRule);
  });
  B(s, 688, 526, 176, 40, 'Accept selected', 'am'); B(s, 876, 526, 172, 40, 'Reject all', 'outW');
  s.r(280, 610, 1160, 290, { fill: PL.ink, name: 'code drawer' }); T(s, 'main.tex, v3', 304, 626, 14, W, true);
  T(s, '38 lines added', 480, 627, 13, PL.am); T(s, '12 removed', 620, 627, 13, PL.dim); T(s, 'Compiles cleanly', 1240, 627, 13, PL.soft, false, { w: 176, al: 'right' }); s.hl(280, 652, 1160, PL.inkRule, 2);
  [['−', 'Backend engineer who ships payment systems that stay up.', 0], ['+', 'Backend engineer for payment systems that stay up.', 1], ['−', '\\item Cut payout API p95 latency from 420\\,ms to 180\\,ms', 0], ['+', '\\item p95 latency down from 420\\,ms to 180\\,ms on payouts', 1], [' ', '\\item Moved 40 services to Postgres 15', 2], [' ', '\\item Mentored four new engineers', 2]].forEach(([m, l, k], i) => {
    const y = 668 + i * 34; if (k === 1) s.r(304, y - 4, 1112, 30, { fill: '#2F5BE733', name: 'added' });
    T(s, m, 312, y + 2, 14, k === 1 ? PL.am : PL.dim, true); T(s, l, 340, y + 2, 13, k === 0 ? PL.dim : W); if (k === 0) s.hl(340, y + 10, l.length * 7.15, PL.dim);
  });
  s.done();
}

// ═════════════ 09 Editor — Code ═════════════
{
  const s = Screen('S-09', 'Editor Code', 'Signal — 09 Editor, Code mode', PL.p2); editorTop(s, 2);
  s.r(0, 66, 280, 834, { fill: SG.co, name: 'rail' }); railHead(s, 'Files', 86);
  [['main.tex', 0, 1], ['sections/', 0, 0], ['summary.tex', 1, 0], ['experience.tex', 1, 0], ['skills.tex', 1, 0], ['imports/', 0, 0], ['old_resume.docx', 1, 0], ['job_post.pdf', 1, 0]].forEach(([l, ind, on], i) => {
    const y = 110 + i * 40; if (on) s.r(12, y, 256, 34, { fill: W, name: 'active' }); T(s, l, 28 + ind * 20, y + 9, 13, on ? SG.co : W, on || l.endsWith('/'));
  });
  s.hl(12, 446, 256, SG.line, 1, .6); railHead(s, 'Outline', 464);
  ['Header', 'Summary', 'Experience', '  Razorpay', '  Zeta', 'Projects', 'Education', 'Skills'].forEach((l, i) => T(s, l, 28, 492 + i * 30, 13, W, false, { op: .9 }));
  s.r(280, 66, 620, 770, { fill: PL.p3, name: 'code' }); s.vl(900, 66, 770, PL.ink, 2);
  s.r(280, 66, 150, 44, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'tab' }); T(s, 'main.tex', 300, 80, 13, PL.ink, true); T(s, 'experience.tex', 452, 80, 13, PL.mute);
  B(s, 740, 72, 148, 32, 'Edit selection', 'out'); s.hl(280, 110, 620, PL.ink, 2);
  code(s, 304, 128, { lh: 26, size: 13, f: M, c: PL.ink, num: PL.dim, w: 596 }, { 6: { bg: PL.coSoft, bar: SG.co }, 7: { bg: PL.coSoft, bar: SG.co } }, 11);
  const y0 = 128 + 11 * 26;
  s.r(296, y0 - 3, 596, 26, { fill: PL.p2, name: 'removed' }); T(s, '−', 304, y0, 13, PL.mute, true); T(s, '  \\item Cut payout API p95 latency', 340, y0, 13, PL.mute); s.hl(356, y0 + 8, 260, PL.mute);
  s.r(296, y0 + 23, 596, 26, { fill: PL.amSoft, name: 'added' }); T(s, '+', 304, y0 + 26, 13, PL.ink, true); T(s, '  \\item p95 latency, 420 to 180\\,ms', 340, y0 + 26, 13, PL.ink); T(s, 'Accept  Reject', 760, y0 + 26, 12, SG.co, true);
  T(s, '  \\item Led the Go migration for payouts', 340, y0 + 52, 13, PL.dim); tag(s, 724, y0 + 46, 'Tab to accept', 'soft');
  ['  \\item Moved 40 services to Postgres 15', '  \\item Mentored four new engineers', '\\end{bullets}'].forEach((l, i) => { T(s, String(14 + i), 304, y0 + 78 + i * 26, 13, PL.dim); T(s, l, 338, y0 + 78 + i * 26, 13, PL.ink); });
  T(s, 'Two AI changes in this file', 304, 792, 13, SG.co, true); T(s, 'Accept all   Reject all', 640, 792, 13, PL.ink, true, { w: 240, al: 'right' });
  B(s, 924, 82, 140, 36, 'Recompile', 'out'); T(s, 'Compiled in 0.9 s', 1080, 92, 13, PL.mute);
  page(s, 960, 140, 440, { 6: { fill: PL.amSoft } }); T(s, 'Synced with line 12', 960, 778, 13, SG.co, true);
  s.r(280, 836, 1160, 64, { fill: PL.ink, name: 'status' });
  [['No errors', 304], ['412 words', 470], ['Auto-compile on', 630], ['One page', 850]].forEach(([l, x]) => T(s, l, x, 858, 13, x === 304 ? PL.am : W, x === 304));
  s.done();
}

// ═════════════ 10 Export ═════════════
{
  const s = Screen('S-10', 'Export', 'Signal — 10 Export dialog', PL.p2); editorTop(s, 0, { live: false });
  s.r(0, 66, 280, 834, { fill: SG.co }); page(s, 460, 92, 520, {});
  s.r(0, 0, 1440, 900, { fill: '#0E121B99', name: 'scrim' });
  const X = 340, Y = 80, Wd = 760; s.r(X, Y, Wd, 740, { fill: PL.p3, stroke: PL.ink, sw: 2, shadow: { c: '#0E121B88', y: 30, b: 60 }, name: 'modal' });
  T(s, 'Export', X + 32, Y + 28, 30, PL.ink, true); B(s, X + Wd - 104, Y + 28, 72, 36, 'Close', 'out'); s.hl(X, Y + 84, Wd, PL.ink, 2);
  [['PDF', 'For applying', 1], ['DOCX', 'Edit in Word', 0], ['LaTeX', 'Source as .zip', 0], ['Plain text', 'For web forms', 0]].forEach(([t, d, on], i) => {
    const x = X + 32 + i * 178; s.r(x, Y + 108, 164, 116, { fill: on ? PL.ink : PL.p3, stroke: PL.ink, sw: 2, name: 'format' });
    T(s, t, x + 16, Y + 126, 20, on ? W : PL.ink, true); T(s, d, x + 16, Y + 160, 12, on ? PL.soft : PL.mute); if (on) T(s, 'Recommended', x + 16, Y + 192, 12, PL.am, true);
  });
  T(s, 'Options', X + 32, Y + 256, 15, PL.ink, true);
  [['ATS-safe mode', 1], ['Embed fonts', 1], ['Clickable links', 1]].forEach(([l, on], i) => { const y = Y + 290 + i * 52; T(s, l, X + 32, y + 6, 14, PL.ink); toggle(s, X + 262, y, on); });
  T(s, 'Page size', X + 32, Y + 452, 14, PL.ink); seg(s, X + 154, Y + 444, 160, ['Letter', 'A4'], 1);
  T(s, 'File name', X + 380, Y + 256, 15, PL.ink, true);
  s.r(X + 380, Y + 286, 348, 44, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'filename' }); T(s, 'Aarav_Mehta_Stripe.pdf', X + 396, Y + 300, 14, PL.ink);
  s.r(X + 380, Y + 346, 348, 160, { fill: PL.p2, name: 'preview' }); page(s, X + 504, Y + 356, 100, {});
  s.r(X + 32, Y + 540, Wd - 64, 56, { fill: PL.amSoft, stroke: PL.ink, sw: 2, name: 'attach' }); check(s, X + 50, Y + 558, 1);
  T(s, 'Attach to Stripe, Backend engineer and mark it sent', X + 84, Y + 560, 14, PL.ink);
  T(s, 'The PDF is built from your latest LaTeX. What you see is what you send.', X + 32, Y + 620, 12, PL.mute);
  B(s, X + 32, Y + 660, 200, 50, 'Copy a share link', 'out'); B(s, X + Wd - 252, Y + 660, 220, 50, 'Download PDF', 'co');
  s.done();
}

// ═════════════ 11 Resumes ═════════════
{
  const s = Screen('S-11', 'Resumes', 'Signal — 11 Resumes library', PL.paper); appRail(s, 'Resumes');
  head(s, 'Resumes.', 'One master, many tailored versions.', { l: 'New resume', w: 168 });
  [['Master resume', 'v5, edited yesterday', 'Master', 'ink'], ['Stripe', 'v3, edited 2 h ago', 'Sent', 'out'], ['Notion', 'v2, draft', 'Draft', 'out'], ['Atlassian', 'v1, imported', 'Interview', 'am']].forEach(([t, d, st, k], i) => {
    const x = X0 + i * 280, on = i === 1; s.r(x, 140, 256, 366, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'resume card' });
    s.r(x + 2, 142, 252, 250, { fill: on ? PL.coSoft : PL.p2, name: 'thumb bg' }); page(s, x + 50, 156, 156, i === 1 ? { 3: { fill: PL.amSoft } } : {});
    s.hl(x, 392, 256, PL.ink, 2); T(s, t, x + 16, 408, 17, PL.ink, true); T(s, d, x + 16, 436, 12, PL.mute); tag(s, x + 16, 462, st, k);
  });
  s.r(X0, 540, 1096, 320, { fill: PL.ink, name: 'history' }); T(s, 'Versions of Stripe, Backend engineer', X0 + 24, 558, 16, W, true); s.hl(X0, 592, 1096, PL.inkRule, 2);
  [['v3', 'Tailored for Stripe, four changes', '2 h ago', 1], ['v2', 'Shortened to one page', 'Yesterday', 0], ['v1', 'Imported from old_resume.docx', '3 days ago', 0]].forEach(([v, d, t, on], i) => {
    const y = 604 + i * 84; if (on) s.r(X0 + 2, y - 6, 1092, 80, { fill: '#2F5BE744', name: 'current' });
    T(s, v, X0 + 24, y + 12, 34, PL.am, true); T(s, d, X0 + 110, y + 22, 15, W, on); T(s, t, X0 + 560, y + 23, 13, PL.soft);
    ['Open', 'Compare', 'Restore'].forEach((l, j) => B(s, X0 + 760 + j * 110, y + 14, 100, 38, l, 'outW')); if (i < 2) s.hl(X0, y + 76, 1096, PL.inkRule);
  });
  s.done();
}

// ═════════════ 12 Templates ═════════════
{
  const s = Screen('S-12', 'Templates', 'Signal — 12 Templates', PL.paper); appRail(s, 'Templates');
  head(s, 'Templates.', 'Switching re-flows your content. Nothing is lost.');
  seg(s, X1 - 600, 44, 600, ['All', 'ATS-safe', 'Academic', 'Compact', 'Creative'], 0);
  const pals = [['#0E121B', '#2A2F3A', '#C3C8D0'], ['#2F5BE7', '#2A2F3A', '#C3C8D0'], ['#5B6271', '#5B6271', '#D9DDE3'], ['#0E121B', '#0E121B', '#9AA1AE']];
  [['Classic', 'ATS-safe', 1], ['Modern', 'ATS-safe', 0], ['Academic CV', 'Academic', 0], ['Compact', 'Compact', 0], ['Executive', 'Classic', 0], ['Sidebar', 'Creative', 0], ['Minimal', 'ATS-safe', 0], ['Tech', 'ATS-safe', 0]].forEach(([t, c, on], i) => {
    const x = X0 + (i % 4) * 280, y = 140 + Math.floor(i / 4) * 370, p = pals[i % 4];
    s.r(x, y, 256, 346, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'template' }); s.r(x + 2, y + 2, 252, 252, { fill: on ? PL.coSoft : PL.p2, name: 'thumb bg' });
    s.paper(x + 60, y + 18, 136, 192 + 0, { paper: PL.p3, stroke: PL.ink, sw: 1, name: p[0], sec: p[1], line: p[2] });
    if (i === 5) s.r(x + 60, y + 18, 40, 192, { fill: SG.co, op: .25, name: 'sidebar' });
    s.hl(x, y + 254, 256, PL.ink, 2); T(s, t, x + 16, y + 272, 17, PL.ink, true); T(s, c, x + 16, y + 300, 12, PL.mute);
    if (on) tag(s, x + 168, y + 280, 'In use', 'ink'); else B(s, x + 172, y + 278, 68, 36, 'Use', 'out');
  });
  s.done();
}

// ═════════════ 13 Settings ═════════════
{
  const s = Screen('S-13', 'Settings', 'Signal — 13 Settings, AI preferences', PL.paper); appRail(s, 'Settings');
  head(s, 'Settings.');
  ['Profile', 'AI preferences', 'Integrations', 'Billing'].forEach((l, i) => { const y = 132 + i * 52, on = i === 1; s.r(X0, y, 200, 44, { fill: on ? PL.ink : '#00000000', stroke: on ? null : PL.rule, sw: 2, name: 'subnav' }); T(s, l, X0 + 16, y + 14, 14, on ? W : PL.ink, on); });
  const P = X0 + 224, PW = 872; s.r(P, 132, PW, 728, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'panel' });
  T(s, 'AI preferences', P + 28, 152, 22, PL.ink, true); s.hl(P, 196, PW, PL.ink, 2);
  const row = (i, title, desc) => { const y = 216 + i * 96; T(s, title, P + 28, y, 16, PL.ink, true); T(s, desc, P + 28, y + 26, 13, PL.mute, false, { w: 470, lh: 19 }); if (i < 5) s.hl(P + 28, y + 80, PW - 56, PL.rule); return y; };
  let y = row(0, 'Truth guard', 'The AI never invents employers, dates, skills or numbers. When unsure, it asks you.'); toggle(s, P + PW - 80, y + 4, 1);
  y = row(1, 'Review changes', 'Accept each change yourself, or let them apply.'); seg(s, P + PW - 300, y, 272, ['Review', 'Auto-apply'], 0);
  y = row(2, 'Writing tone', 'How bullets and summaries are phrased.'); seg(s, P + PW - 380, y, 352, ['Concise', 'Balanced', 'Bold'], 1);
  y = row(3, 'Locked sections', 'The AI will not touch these.'); let tx = P + PW - 330; ['Header', 'Education'].forEach(l => { tx += tag(s, tx, y, l, 'ink') + 8; }); B(s, P + PW - 108, y, 80, 30, 'Add', 'out');
  y = row(4, 'Default export', 'Used by Download.'); s.r(P + PW - 252, y - 4, 224, 40, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'select' }); T(s, 'PDF, Letter', P + PW - 236, y + 7, 14, PL.ink);
  y = row(5, 'Language', 'For suggestions and spell-check.'); s.r(P + PW - 252, y - 4, 224, 40, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'select' }); T(s, 'English (US)', P + PW - 236, y + 7, 14, PL.ink);
  B(s, P + PW - 196, 790, 168, 48, 'Save changes', 'co');
  s.done();
}

// ═════════════ 14 Tex states — empty, working, done, error ═════════════
{
  const s = Screen('S-14', 'Tex states', 'Signal — 14 Tex in every state', PL.paper);
  T(s, 'Tex, in every state.', 64, 48, 40, PL.ink, true, { ls: -1.5 }); T(s, 'Empty, working, done and error screens all use the same page with a face.', 64, 104, 15, PL.ink2);
  const plate = (i, fill, txt, mood, title, body, o = {}) => {
    const x = 64 + i * 332, y = 160; s.r(x, y, 312, 660, { fill, stroke: PL.ink, sw: 2, name: 'state' });
    tex(s, x + 50, y + 90, 15, { mood, c: txt, sign: o.sign, above: o.above, edit: o.edit });
    s.hl(x, y + 360, 312, txt === W ? PL.inkRule : PL.ink, 2);
    T(s, title, x + 24, y + 384, 22, txt, true, { w: 264, lh: 28 }); T(s, body, x + 24, y + 450, 14, txt, false, { w: 264, lh: 21, op: .9 });
    if (o.btn) B(s, x + 24, y + 580, 264, 50, o.btn[0], o.btn[1]);
    if (o.cells) for (let c = 0; c < 4; c++) s.r(x + 24 + c * 40, y + 586, 32, 32, { fill: c < 2 ? W : '#00000000', stroke: W, sw: 2, name: 'cell' });
  };
  plate(0, PL.p3, PL.ink, 'sleepy', 'No applications yet', 'Paste a job post and your CV. Tex reads both and tells you whether to apply.', { above: 'z', btn: ['New application', 'co'] });
  plate(1, SG.co, W, 'working', 'Reading your CV', 'Matching every requirement in the job post. This takes about ten seconds.', { cells: 1 });
  plate(2, PL.ink, W, 'happy', 'Honesty check passed', 'Every name and number in the new CV is in your CV or your answers.', { sign: 1, btn: ['Download as Word', 'am'] });
  plate(3, PL.amSoft, PL.ink, 'confused', 'Gemini limit reached', 'Wait 60 seconds or switch the model.', { above: '?', edit: PL.ink, btn: ['Try again', 'out'] });
  s.done();
}

// ═════════════ 15 Mobile — 390 wide ═════════════
{
  const s = Screen('S-15', 'Mobile', 'Signal — 15 Mobile at 390 wide', PL.p2);
  const phone = (i) => { const x = 45 + i * 480, y = 28; s.r(x, y, 390, 844, { fill: PL.paper, stroke: PL.ink, sw: 2, name: 'phone' }); return [x, y]; };
  const bar = (x, y) => { s.r(x, y, 390, 56, { fill: SG.co, name: 'bar' }); T(s, 'AnyJob', x + 20, y + 17, 18, W, true); tag(s, x + 318, y + 13, 'v1.0', 'am'); };
  { const [x, y] = phone(0); s.r(x, y, 390, 844, { fill: SG.co, stroke: PL.ink, sw: 2 }); T(s, 'AnyJob', x + 24, y + 24, 18, W, true);
    T(s, 'Tailor it.\nLine by line.', x + 24, y + 96, 44, W, true, { lh: 46, ls: -1.5 });
    T(s, 'Paste your CV and one job. Tex says\nwhether to apply and rewrites it\nhonestly.', x + 24, y + 210, 14, W, false, { lh: 22 });
    tex(s, x + 70, y + 330, 14, { mood: 'happy', sign: true });
    B(s, x + 24, y + 660, 342, 54, 'Start', 'ink'); B(s, x + 24, y + 726, 342, 50, 'Upload a .docx', 'outW'); }
  { const [x, y] = phone(1); bar(x, y); T(s, 'Your fit', x + 20, y + 76, 26, PL.ink, true);
    s.r(x + 20, y + 120, 350, 150, { fill: PL.ink, name: 'fit' }); T(s, '78', x + 40, y + 134, 72, PL.am, true); T(s, 'Partial fit', x + 180, y + 156, 20, W, true); T(s, 'APM, Kiranaly', x + 180, y + 188, 13, PL.soft);
    [['SQL for your own analysis', 'Must', 'yes', '"Wrote SQL to track…"'], ['Ran A/B tests', 'Must', 'partial', 'Not found in your CV'], ['Writes PRDs', 'Must', 'yes', '"Wrote the PRD for…"'], ['Mixpanel or Amplitude', 'Nice', 'no', 'None']].forEach((r, j) => {
      const yy = y + 290 + j * 104; s.r(x + 20, yy, 350, 92, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'req' }); T(s, r[0], x + 34, yy + 12, 14, PL.ink, true);
      tag(s, x + 34, yy + 38, r[1], r[1] === 'Must' ? 'ink' : 'out'); tag(s, x + 110, yy + 38, r[2], r[2] === 'yes' ? 'soft' : r[2] === 'partial' ? 'am' : 'out');
      T(s, r[3], x + 34, yy + 72, 11, r[3].startsWith('Not') ? '#B42318' : PL.mute);
    });
    s.r(x, y + 760, 390, 84, { fill: PL.p3, name: 'sticky' }); s.hl(x, y + 760, 390, PL.ink, 2); B(s, x + 20, y + 776, 350, 52, 'Answer three questions', 'co'); }
  { const [x, y] = phone(2); bar(x, y); T(s, 'Review and approve', x + 20, y + 76, 24, PL.ink, true);
    seg(s, x + 20, y + 120, 350, ['Before', 'Proposed'], 1);
    s.r(x + 20, y + 176, 350, 250, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'md' });
    T(s, '# Ananya Rao\n## Summary\nAnalyst who runs experiments and\nwrites specs engineers build from.\n## Experience\n### Analyst | Haulwise | 2023\n- Wrote SQL to track weekly\n  conversion for the growth team\n- Ran two pricing A/B tests', x + 34, y + 190, 12, PL.ink, false, { lh: 25 });
    T(s, 'Changes', x + 20, y + 446, 14, PL.ink, true);
    s.r(x + 20, y + 472, 350, 52, { fill: PL.p2, name: 'was' }); T(s, 'Was: Worked on data for the team', x + 32, y + 490, 12, PL.mute); s.hl(x + 72, y + 497, 220, PL.mute);
    s.r(x + 20, y + 532, 350, 52, { fill: PL.amSoft, name: 'now' }); T(s, 'Now: Wrote SQL to track weekly…', x + 32, y + 550, 12, PL.ink);
    check(s, x + 20, y + 610, 1); T(s, 'Every line is true and I can\nexplain it in an interview.', x + 52, y + 608, 13, PL.ink, false, { lh: 19 });
    s.r(x, y + 760, 390, 84, { fill: PL.p3 }); s.hl(x, y + 760, 390, PL.ink, 2); B(s, x + 20, y + 776, 350, 52, 'Approve and score', 'co'); }
  s.done();
}
