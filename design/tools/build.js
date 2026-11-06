// Generates the AnyJob wireframe screens as a figcraft-cli script. Run: node build.js > script.json
const C = { ink: '#222222', mute: '#777777', soft: '#999999', line: '#CCCCCC', acc: '#5B5BD6', accBg: '#EEEEFF', accSoft: '#F6F6FF', accLn: '#B9B9F0', good: '#2E8B57', goodBg: '#E9F7EF', goodLn: '#9BD3B3', bad: '#D9534F', badBg: '#FDECEC', badLn: '#F0B4B2', gray: '#E6E6E2', bg: '#FAFAF8', white: '#FFFFFF', warn: '#B8860B', warnBg: '#FFFBEA', canvas: '#EFEFEC' };
const steps = [];
let idx = 0;

function Screen(num, name, label) {
  const gx = (idx % 3) * 1600, gy = Math.floor(idx / 3) * 1100 + 60;
  idx++;
  const cmds = [];
  const push = (type, p, props) => cmds.push({ command: 'node.create', params: { type, ...p, props } });
  push('text', { text: `${num} · ${label}`, x: gx, y: gy - 44 }, { fontSize: 20, fontStyle: 'Bold', fill: C.ink });
  push('frame', { name: `${num} ${name}`, x: gx, y: gy, width: 1440, height: 900 }, { fill: C.bg, stroke: C.ink, strokeWeight: 2, clip: true });
  const P = { $step: 1 };
  const s = {};
  s.r = (x, y, w, h, o = {}) => push(o.type || 'rectangle', { name: o.name || 'box', parent: P, x, y, width: w, height: h },
    { fill: o.fill ?? C.white, ...(o.stroke ? { stroke: o.stroke, strokeWeight: o.sw || 1 } : {}), ...(o.r ? { cornerRadius: o.r } : {}), ...(o.dash ? { dashes: [6, 6] } : {}), ...(o.shadow ? { effects: [{ type: 'dropShadow', color: '#00000022', offset: [0, 4], radius: 12 }] } : {}) });
  s.t = (text, x, y, o = {}) => push('text', { text, parent: P, x, y, ...(o.w ? { width: o.w } : {}) },
    { fontSize: o.size || 12, fill: o.c || C.ink, ...(o.b ? { fontStyle: 'Bold' } : {}), ...(o.lh ? { lineHeight: o.lh } : {}), ...(o.al ? { textAlign: o.al } : {}) });
  s.btn = (x, y, w, h, label, kind = 'out') => {
    const k = { dark: [C.ink, null, C.white], acc: [C.acc, null, C.white], out: [C.white, C.ink, C.ink], good: [C.good, null, C.white], soft: [C.accBg, C.acc, C.acc] }[kind];
    s.r(x, y, w, h, { fill: k[0], stroke: k[1], r: 6, name: 'btn ' + label });
    s.t(label, x, y + (h - 14) / 2, { w, al: 'center', c: k[2] });
  };
  s.chip = (x, y, label, kind = 'gray', w) => {
    w = w || Math.round(label.length * 6.3 + 20);
    const k = { gray: [C.gray, null, C.ink], acc: [C.accBg, C.acc, C.acc], good: [C.goodBg, C.good, C.good], bad: [C.badBg, C.bad, C.bad], warn: [C.warnBg, C.warn, C.warn] }[kind];
    s.r(x, y, w, 22, { fill: k[0], stroke: k[1], r: 11, name: 'chip' });
    s.t(label, x, y + 4, { w, al: 'center', size: 11, c: k[2] });
    return w;
  };
  s.seg = (x, y, labels, active, sw, h = 34) => {
    s.r(x, y, sw * labels.length, h, { stroke: C.ink, r: h / 2, name: 'segmented' });
    labels.forEach((l, i) => {
      if (i === active) s.r(x + 3 + i * sw, y + 3, sw - 6, h - 6, { fill: C.ink, r: (h - 6) / 2 });
      s.t(l, x + i * sw, y + (h - 14) / 2, { w: sw, al: 'center', c: i === active ? C.white : C.ink });
    });
  };
  s.toggle = (x, y, on = true) => { s.r(x, y, 38, 22, { fill: on ? C.acc : C.gray, r: 11, name: 'toggle' }); s.r(on ? x + 18 : x + 2, y + 2, 18, 18, { type: 'ellipse', fill: C.white }); };
  s.bars = (x, y, w, n, o = {}) => { const f = [1, .88, .95, .7, .9, .8]; for (let i = 0; i < n; i++) s.r(x, y + i * (o.gap || 16), w * f[i % 6], o.h || 7, { fill: o.fill || '#DDDDDD', r: 3, name: 'line' }); };
  // paper skeleton; hl = {sectionIndex: 'add'|'del'|'sel'}
  s.paper = (x, y, w, h, hl = {}) => {
    const k = w / 440;
    s.r(x, y, w, h, { fill: C.white, stroke: '#BBBBBB', shadow: true, name: 'paper' });
    s.r(x + w * .16, y + h * .05, w * .68, 20 * k, { fill: '#333333', r: 3, name: 'name' });
    s.r(x + w * .28, y + h * .05 + 32 * k, w * .44, 7 * k, { fill: '#CCCCCC', r: 3, name: 'contact' });
    for (let i = 0; i < 4; i++) {
      const sy = y + h * (0.19 + 0.2 * i);
      s.r(x + w * .07, sy, w * .26, 9 * k, { fill: '#555555', r: 3, name: 'section' });
      const m = { add: [C.goodBg, C.good, C.goodLn], del: [C.badBg, C.bad, C.badLn], sel: [C.accBg, C.acc, C.accLn] }[hl[i]];
      if (m) s.r(x + w * .04, sy + 16 * k, w * .92, 56 * k, { fill: m[0], stroke: m[1], sw: 2, r: 4, name: 'highlight' });
      s.bars(x + w * .07, sy + 24 * k, w * .86, 3, { gap: 16 * k, h: 7 * k, fill: m ? m[2] : '#DDDDDD' });
    }
  };
  s.nav = (active, settings) => {
    s.r(0, 0, 232, 900, { stroke: C.ink, name: 'left nav' });
    s.t('◆ AnyJob  ▾', 18, 20, { size: 15, b: 1 });
    s.r(14, 56, 204, 32, { fill: '#F3F3F0', stroke: C.line, r: 6, name: 'search' });
    s.t('🔍 Search            ⌘K', 26, 65, { c: C.soft });
    const items = ['⌂  Home', '▤  Applications', '▣  Resumes', '✉  Cover letters', '▦  Templates', '⬆  Imports'], cnt = [null, '12', '4', '3', null, null];
    if (active != null) s.r(8, 106 + 32 * active + 2, 216, 28, { fill: C.accBg, r: 6, name: 'nav active' });
    items.forEach((t, i) => { s.t(t, 22, 106 + 32 * i + 10, { size: 13 }); if (cnt[i]) s.t(cnt[i], 196, 106 + 32 * i + 10, { c: C.mute }); });
    s.t('FAVORITES', 18, 324, { size: 11, b: 1, c: C.mute });
    s.t('★  Master resume\n★  Stripe — Backend\n★  Notion — PM', 22, 348, { size: 13, lh: 28 });
    s.r(14, 770, 204, 60, { fill: C.accSoft, stroke: C.acc, r: 8, name: 'usage' });
    s.t('✦ 42 / 100 AI edits used\nUpgrade for unlimited', 26, 782, { size: 11, c: C.acc, lh: 18 });
    if (settings) s.r(8, 852, 216, 32, { fill: C.accBg, r: 6, name: 'nav active' });
    s.t('●  Divya A.                    ⚙', 22, 862, { size: 13 });
  };
  s.head = (title, sub, btnLabel) => {
    s.t(title, 256, 24, { size: 20, b: 1 });
    if (sub) s.t(sub, 256, 56, { c: C.mute });
    if (btnLabel) s.btn(1408 - 150, 18, 150, 34, btnLabel, 'dark');
  };
  s.editorTop = (mode) => {
    s.r(0, 0, 1440, 52, { stroke: C.ink, name: 'topbar' });
    s.t('←  Applications   /   Stripe — Backend Engineer', 20, 18, { size: 13, b: 1 });
    s.seg(520, 9, ['Edit', 'Compare', '</> Code'], mode, 100);
    s.t('Saved ✓', 1130, 19, { c: C.mute });
    s.chip(1190, 15, 'v3 ▾', 'acc', 60);
    s.btn(1290, 10, 130, 32, 'Export  ▾', 'dark');
  };
  s.agent = (x, y, w, h) => {
    s.r(x, y, w, h, { fill: C.accSoft, stroke: C.acc, sw: 2, name: 'agent panel' });
    s.t('✦ AI Agent', x + 20, y + 16, { size: 14, b: 1, c: C.acc });
    s.r(x + 20, y + 48, w - 40, 56, { stroke: C.line, r: 8, name: 'context' });
    s.t('Context:  📄 old_resume.docx   🎯 job_posting.pdf   📝 main.tex\n＋ Add context (file, link, LinkedIn)', x + 34, y + 58, { size: 11, c: C.mute, lh: 20 });
    s.r(x + 100, y + 124, w - 120, 60, { stroke: C.ink, r: 10, name: 'user bubble' });
    s.t('Tailor for this job. Keep my voice,\nno fake numbers.', x + 114, y + 136, { lh: 20 });
    s.r(x + 20, y + 194, w - 40, 250, { stroke: C.acc, r: 10, name: 'run log' });
    s.t('Run #4  ·  00:21\n\n✓  Parsed DOCX → 12 sections\n✓  Read job_posting.pdf\n✓  Planned 7 edits\n✓  Edited summary.tex\n⟳  Editing experience.tex…\n○  Compile + check 1 page\n○  Create v4', x + 36, y + 208, { lh: 26 });
    s.r(x + 20, y + 464, w - 40, 110, { fill: C.warnBg, stroke: C.warn, r: 10, name: 'question' });
    s.t('? AI needs a quick answer\nNo number found for Acme latency. Use\n40% (your old CV) or leave it out?\n[ Use 40% ]   [ Leave out ]   [ Type my own ]', x + 36, y + 476, { lh: 22 });
    s.r(x + 20, y + h - 108, w - 40, 92, { stroke: C.acc, sw: 2, r: 12, name: 'agent input' });
    s.t('Steer the agent…  (it keeps working while you type)', x + 36, y + h - 92, { c: C.soft });
    s.t('＋ Attach          ■ Stop          ↵ Send', x + 36, y + h - 42, { size: 11, c: C.mute });
  };
  s.done = () => { steps.push({ command: 'command.batch', params: { label: `${num} ${name}`, commands: cmds } }); };
  return s;
}

// ---------- 00 App map ----------
{
  const s = Screen('00', 'App map', 'App map — how the screens connect');
  const box = (x, y, n, t, sub, kind = 'out') => {
    const st = { out: [C.white, C.ink], acc: [C.accBg, C.acc], good: [C.goodBg, C.good] }[kind];
    s.r(x, y, 250, 86, { fill: st[0], stroke: st[1], sw: 2, r: 10, name: 'screen ' + n });
    s.t(n, x + 14, y + 12, { size: 11, b: 1, c: C.mute });
    s.t(t, x + 14, y + 30, { size: 14, b: 1 });
    s.t(sub, x + 14, y + 54, { size: 11, c: C.mute });
  };
  const arrow = (x, y) => s.t('→', x, y, { size: 24, c: C.mute });
  s.t('LANE 1 · FIRST RUN', 60, 60, { size: 12, b: 1, c: C.mute });
  box(60, 90, '01', 'Welcome / Sign in', 'Google · LinkedIn · email'); arrow(325, 115);
  box(370, 90, '05', 'Import', 'DOCX · PDF · LaTeX · paste'); arrow(635, 115);
  box(680, 90, '06', 'Convert & fidelity check', 'DOCX/PDF → LaTeX'); arrow(945, 115);
  box(990, 90, '07', 'Editor · Edit', 'AI edits live', 'acc');
  s.t('LANE 2 · DAILY USE  (left-nav shell)', 60, 240, { size: 12, b: 1, c: C.mute });
  box(60, 270, '02', 'Home', 'Quick actions · stats'); arrow(325, 295);
  box(370, 270, '03', 'Applications', 'List + detail pane'); arrow(635, 295);
  box(680, 270, '04', 'New application', 'Paste job → match analysis'); arrow(945, 295);
  box(990, 270, '07', 'Editor · Edit', 'Tailored resume opens', 'acc');
  s.t('Other left-nav pages', 60, 395, { size: 12, c: C.mute });
  box(60, 420, '11', 'Resumes', 'Master + versions'); box(370, 420, '12', 'Templates', 'Re-flow with AI'); box(680, 420, '13', 'Settings', 'AI prefs · truth guard · billing');
  s.t('LANE 3 · INSIDE THE EDITOR  (top-bar mode switch)', 60, 560, { size: 12, b: 1, c: C.mute });
  box(60, 590, '07', 'Edit', 'Paper + inline AI + agent', 'acc'); s.t('⇄', 325, 612, { size: 24, c: C.mute });
  box(370, 590, '08', 'Compare', 'Timeline · diff · review changes', 'acc'); s.t('⇄', 635, 612, { size: 24, c: C.mute });
  box(680, 590, '09', 'Code', 'LaTeX + live PDF', 'acc'); arrow(945, 615);
  box(990, 590, '10', 'Export', 'PDF · DOCX · TEX · TXT', 'good');
  s.r(60, 740, 1180, 110, { fill: C.accSoft, stroke: C.acc, r: 10, name: 'note' });
  s.t('Always present:  ✦ AI agent panel (editor)  ·  ⌘K command bar  ·  Version timeline  ·  Drop DOCX / PDF anywhere to import\nPrinciple: the user never has to see LaTeX — Code mode is optional. AI proposes, user accepts (or turns on auto-apply in Settings).', 80, 762, { lh: 28 });
  s.done();
}

// ---------- 01 Welcome ----------
{
  const s = Screen('01', 'Welcome', 'Welcome / Sign in');
  s.t('◆ AnyJob', 60, 50, { size: 20, b: 1 });
  s.t('Your resume,\nedited by AI — live.', 60, 200, { size: 44, b: 1, lh: 56 });
  s.t('Drop the DOCX or PDF you already have. AI turns it into clean\nLaTeX, tailors it to any job, and you watch every change happen.', 60, 360, { size: 16, c: C.mute, lh: 26 });
  s.t('✓  Keeps your layout — imports DOCX & PDF\n✓  Tailor to a job in one click\n✓  Export PDF, DOCX or LaTeX anytime', 60, 450, { size: 15, lh: 34 });
  s.r(720, 0, 720, 900, { fill: C.white, stroke: C.ink, name: 'auth side' });
  s.r(830, 150, 500, 600, { stroke: C.ink, sw: 2, r: 16, name: 'auth card', shadow: true });
  s.t('Get started', 870, 190, { size: 22, b: 1 });
  s.btn(870, 250, 420, 46, 'Continue with Google', 'out');
  s.btn(870, 308, 420, 46, 'Continue with LinkedIn', 'out');
  s.t('────────────  or  ────────────', 870, 376, { w: 420, al: 'center', c: C.soft });
  s.r(870, 410, 420, 44, { stroke: C.line, r: 8, name: 'email' }); s.t('you@email.com', 886, 424, { c: C.soft, size: 13 });
  s.btn(870, 466, 420, 46, 'Continue with email', 'dark');
  s.r(870, 560, 420, 130, { stroke: C.soft, r: 12, dash: 1, name: 'try dropzone' });
  s.t('⬆  Just want to try it?\nDrop your resume here — no sign-up needed', 870, 596, { w: 420, al: 'center', c: C.mute, lh: 26, size: 13 });
  s.t('DOCX · PDF · LaTeX', 870, 660, { w: 420, al: 'center', size: 11, c: C.soft });
  s.done();
}

// ---------- 02 Home ----------
{
  const s = Screen('02', 'Home', 'Home dashboard');
  s.nav(0); s.head('Good morning, Divya', 'Pick up where you left off, or start something new.', '＋ New application');
  const cards = [['⬆', 'Import a resume', 'Drop a DOCX or PDF — AI rebuilds it as editable LaTeX.', 'Import →'], ['🎯', 'Tailor to a job', 'Paste a job link. AI rewrites your resume to match it.', 'New application →'], ['▦', 'Start from a template', 'Pick a design, AI fills it with your content.', 'Browse templates →']];
  cards.forEach((c, i) => { const x = 256 + i * 392; s.r(x, 100, 368, 150, { stroke: C.ink, r: 12, name: 'action card' }); s.t(c[0] + '  ' + c[1], x + 20, 120, { size: 16, b: 1 }); s.t(c[2], x + 20, 154, { w: 330, c: C.mute, lh: 20 }); s.t(c[3], x + 20, 212, { c: C.acc, b: 1 }); });
  [['12', 'Applications'], ['78%', 'Avg. match'], ['2', 'Interviews'], ['42/100', 'AI edits used']].forEach((c, i) => { const x = 256 + i * 293; s.r(x, 276, 272, 80, { stroke: C.line, r: 10, name: 'stat' }); s.t(c[0], x + 18, 292, { size: 24, b: 1 }); s.t(c[1], x + 18, 328, { c: C.mute }); });
  s.t('Continue editing', 256, 384, { size: 14, b: 1 }); s.t('View all →', 1330, 386, { c: C.acc });
  [['Stripe — Backend', 'v3 · edited 2h ago'], ['Notion — PM', 'v2 · draft'], ['Master resume', 'v5 · yesterday']].forEach((c, i) => { const x = 256 + i * 392; s.r(x, 414, 368, 260, { fill: C.canvas, stroke: C.line, r: 10, name: 'recent card' }); s.paper(x + 114, 428, 140, 190, i === 0 ? { 1: 'add' } : {}); s.t(c[0], x + 16, 628, { b: 1, size: 13 }); s.t(c[1], x + 16, 648, { c: C.mute, size: 11 }); });
  s.r(256, 700, 1152, 150, { fill: C.accSoft, stroke: C.acc, r: 12, name: 'ai suggestions' });
  s.t('✦ AI suggestions for you', 276, 716, { b: 1, c: C.acc, size: 13 });
  s.t('Notion — PM is at 74% match. Add 2 missing keywords.                                                 [ Fix with AI ]\nYour Master resume spills 4 lines onto page 2.                                                                     [ Fit to 1 page ]\nAtlassian interview is in 3 days — generate prep notes from your resume?                       [ Prepare ]', 276, 748, { lh: 30 });
  s.done();
}

// ---------- 03 Applications (E) ----------
{
  const s = Screen('03', 'Applications', 'Applications — list + detail (from E)');
  s.nav(1); s.t('Applications', 256, 22, { size: 18, b: 1 }); s.btn(610, 16, 130, 34, '＋ New resume', 'dark');
  s.t('All  |  Draft  |  Applied  |  Interview  |  Offer                    ⧖ Filter    ⇅ Sort', 256, 66, { c: C.mute });
  s.r(232, 96, 528, 1, { fill: C.ink });
  const rows = [['Backend Engineer · Stripe', 'Resume v3 · tailored 2h ago', '91%', '● Applied', C.good], ['Product Manager · Notion', 'Resume v2 · draft', '74%', '○ Draft', C.mute], ['SDE II · Atlassian', 'Resume v1 · imported from DOCX', '82%', '● Interview', C.warn], ['Data Analyst · Razorpay', 'Resume v2 · tailored 3d ago', '68%', '○ Draft', C.mute], ['ML Engineer · Swiggy', 'Resume v1', '59%', '○ Draft', C.mute]];
  rows.forEach((r, i) => { const y = 108 + i * 76; if (i === 0) s.r(240, y, 512, 68, { fill: C.accBg, stroke: C.acc, r: 8, name: 'row selected' }); s.r(254, y + 16, 36, 36, { fill: '#D5D5D5', r: 8, name: 'logo' }); s.t(r[0] + '\n' + r[1], 304, y + 16, { size: 13, lh: 20 }); s.t(r[2] + '    ' + r[3], 640, y + 26, { b: 1, c: r[4] }); });
  s.r(248, 520, 496, 140, { fill: C.white, stroke: C.soft, r: 12, dash: 1, name: 'dropzone' });
  s.t('⬆  Drop your resume here\nDOCX · PDF · LaTeX · or paste a LinkedIn / job link\nWe convert it to editable LaTeX automatically', 248, 556, { w: 496, al: 'center', c: C.mute, lh: 24, size: 13 });
  s.r(760, 0, 680, 900, { stroke: C.ink, name: 'detail pane' });
  s.t('Backend Engineer · Stripe', 784, 22, { size: 16, b: 1 }); s.btn(1250, 14, 170, 34, 'Open in editor  →', 'acc');
  s.t('Resume   |   Cover letter   |   Job post   |   Notes', 784, 60, { c: C.mute });
  s.r(784, 90, 400, 700, { fill: C.canvas, name: 'preview bg' }); s.paper(784, 100, 380, 560, { 1: 'add' });
  s.r(1184, 100, 236, 560, { fill: C.accSoft, stroke: C.acc, r: 10, name: 'ai panel' });
  s.t('✦ AI actions\n\nMatch   78% → 91%\nMissing: Go, K8s\n\n▸ Tailor again\n▸ Shorten to 1 page\n▸ Write cover letter\n▸ Interview prep\n▸ Fix ATS issues\n\nDownload\n[ PDF ]  [ DOCX ]  [ TEX ]', 1200, 118, { lh: 24 });
  s.r(784, 800, 636, 56, { stroke: C.acc, sw: 2, r: 12, name: 'ask bar' }); s.t('✦  Ask AI about this application…  (“make it punchier”, “add my Go project”)', 804, 820, { c: C.soft, size: 13 });
  s.done();
}

// ---------- 04 New application ----------
{
  const s = Screen('04', 'New application', 'New application — job → match analysis');
  s.nav(1); s.head('New application', '1 Job   →   2 Resume   →   3 Tailor');
  s.r(256, 96, 544, 310, { stroke: C.ink, r: 12, name: 'job input' });
  s.t('Paste a job link or description', 276, 114, { b: 1, size: 13 });
  s.r(276, 144, 504, 200, { fill: '#FCFCFB', stroke: C.line, r: 8, name: 'textarea' });
  s.bars(292, 162, 460, 6, { gap: 22, fill: C.gray });
  s.r(276, 356, 400, 36, { stroke: C.line, r: 8, name: 'url' }); s.t('🔗  https://stripe.com/jobs/…', 290, 366, { c: C.soft });
  s.btn(690, 356, 90, 36, 'Fetch', 'out');
  s.t('Base resume', 256, 430, { b: 1, size: 13 });
  [['Master resume', 'v5 · 1 page', 1], ['Stripe — Backend', 'v3', 0], ['old_resume.docx', 'imported', 0]].forEach((c, i) => { const x = 256 + i * 184; s.r(x, 458, 172, 90, { fill: c[2] ? C.accBg : C.white, stroke: c[2] ? C.acc : C.line, sw: c[2] ? 2 : 1, r: 10, name: 'resume option' }); s.t((c[2] ? '◉ ' : '○ ') + c[0] + '\n' + c[1], x + 14, x && 476, { lh: 22, size: 12 }); });
  s.btn(256, 580, 544, 46, 'Analyze match  →', 'acc');
  s.r(832, 96, 576, 700, { stroke: C.ink, r: 12, name: 'analysis' });
  s.t('Match analysis  ·  Backend Engineer, Stripe', 852, 114, { b: 1, size: 14 });
  s.r(860, 160, 120, 120, { type: 'ellipse', fill: C.white, stroke: C.acc, sw: 10, name: 'score ring' }); s.t('78%', 860, 205, { w: 120, al: 'center', size: 28, b: 1 });
  s.t('Strong fit on backend and APIs.\nA few keywords are missing —\nAI can add them truthfully.', 1010, 180, { lh: 24, c: C.mute, size: 13 });
  s.t('✓ Strengths', 852, 316, { b: 1, c: C.good }); s.chip(852, 344, 'Python', 'good'); s.chip(930, 344, 'REST APIs', 'good'); s.chip(1026, 344, 'Postgres', 'good'); s.chip(1112, 344, 'Led team of 4', 'good');
  s.t('✗ Gaps', 852, 390, { b: 1, c: C.bad }); s.chip(852, 418, 'Go', 'bad'); s.chip(900, 418, 'Kubernetes', 'bad'); s.chip(992, 418, 'Distributed systems', 'bad');
  s.t('What the AI will do', 852, 470, { b: 1 });
  s.t('☑  Rewrite summary for backend focus\n☑  Reorder skills (Go, Postgres first)\n☑  Reword 3 Acme bullets with your real metrics\n☐  Draft a matching cover letter\n☑  Keep it to 1 page', 852, 498, { lh: 28 });
  s.t('Truth guard on — AI won’t invent skills you don’t have.', 852, 650, { c: C.mute, size: 11 });
  s.btn(852, 700, 536, 46, '✦ Tailor & open editor  →', 'acc');
  s.done();
}

// ---------- 05 Import ----------
{
  const s = Screen('05', 'Import', 'Import — choose a source');
  s.nav(5); s.head('Import a resume', 'We keep your layout and turn it into editable LaTeX.');
  s.r(256, 96, 1152, 300, { fill: C.white, stroke: C.soft, sw: 2, r: 16, dash: 1, name: 'dropzone' });
  s.t('⬆', 256, 140, { w: 1152, al: 'center', size: 40 });
  s.t('Drop your resume here', 256, 200, { w: 1152, al: 'center', size: 20, b: 1 });
  s.t('or  [ Choose file ]', 256, 236, { w: 1152, al: 'center', c: C.acc, size: 14 });
  s.chip(560, 290, 'DOCX', 'gray', 70); s.chip(640, 290, 'PDF', 'gray', 70); s.chip(720, 290, 'LaTeX .tex / .zip', 'gray', 130); s.chip(860, 290, 'Image / scan', 'gray', 100);
  s.t('Scanned PDFs are read with OCR — you’ll review anything uncertain.', 256, 344, { w: 1152, al: 'center', c: C.mute, size: 11 });
  s.t('Other ways to start', 256, 430, { b: 1, size: 14 });
  [['📋', 'Paste text', 'Paste resume text or a LinkedIn “About”'], ['in', 'From LinkedIn', 'Import your profile URL'], ['☁', 'Google Drive', 'Pick a Doc or PDF from Drive'], ['✦', 'Start with AI', 'Answer 5 questions — AI writes it']].forEach((c, i) => { const x = 256 + i * 293; s.r(x, 462, 273, 130, { stroke: C.ink, r: 12, name: 'source card' }); s.t(c[0] + '  ' + c[1], x + 18, 480, { b: 1, size: 14 }); s.t(c[2], x + 18, 514, { w: 240, c: C.mute, lh: 20 }); });
  s.t('Recent imports', 256, 630, { b: 1, size: 14 });
  s.r(256, 660, 1152, 150, { stroke: C.line, r: 10, name: 'recent' });
  s.t('📄  old_resume.docx\n📄  resume_2023.pdf\n📄  cv_academic.tex', 276, 680, { lh: 38 });
  s.t('DOCX · imported 3 days ago · 97% layout match\nPDF · imported last week · 91% layout match\nLaTeX · imported last month', 560, 680, { lh: 38, c: C.mute });
  s.t('[ Open ]\n[ Open ]\n[ Open ]', 1330, 680, { lh: 38, c: C.acc });
  s.done();
}

// ---------- 06 Converting ----------
{
  const s = Screen('06', 'Converting', 'Import — converting + fidelity check');
  s.nav(5); s.head('Importing old_resume.docx', 'Rebuilding your layout as LaTeX — about 20 seconds.');
  s.t('ORIGINAL', 300, 100, { size: 11, b: 1, c: C.bad }); s.t('REBUILT AS LaTeX', 760, 100, { size: 11, b: 1, c: C.good });
  s.r(270, 124, 400, 560, { fill: C.canvas, name: 'bg' }); s.paper(300, 140, 340, 500, {});
  s.r(300, 380, 340, 3, { fill: C.acc, name: 'scan line' });
  s.t('→', 690, 380, { size: 36, c: C.mute });
  s.r(740, 124, 400, 560, { fill: C.canvas, name: 'bg' }); s.paper(770, 140, 340, 500, { 1: 'sel' });
  s.r(770, 400, 340, 240, { fill: '#FAFAF8CC', name: 'not yet built' }); s.t('building…  ▒▒▒▒', 770, 500, { w: 340, al: 'center', c: C.acc });
  s.r(1170, 96, 238, 600, { stroke: C.ink, r: 12, name: 'steps' });
  s.t('Progress\n\n✓  Uploaded\n✓  Read text & fonts\n✓  Found 6 sections\n⟳  Rebuilding layout\n○  Compile PDF\n○  Compare to original', 1190, 114, { lh: 30 });
  s.r(256, 716, 1152, 150, { fill: C.accSoft, stroke: C.acc, r: 12, name: 'fidelity' });
  s.t('Fidelity report', 276, 732, { b: 1, c: C.acc, size: 13 }); s.t('97% layout match', 1230, 732, { b: 1, c: C.good });
  s.t('⚠  Skills table simplified to a list (keeps ATS-friendly)\n⚠  Custom font “Garamond Pro” replaced with “EB Garamond”', 276, 762, { lh: 26 });
  s.btn(1000, 810, 130, 34, 'Fix with AI', 'out'); s.btn(1140, 810, 252, 34, 'Looks good — open editor  →', 'acc');
  s.done();
}

// ---------- 07 Editor: Edit ----------
{
  const s = Screen('07', 'Editor Edit', 'Editor — Edit mode');
  s.editorTop(0);
  s.r(0, 52, 200, 848, { stroke: C.ink, name: 'sections rail' });
  s.t('SECTIONS', 16, 68, { size: 11, b: 1, c: C.mute });
  s.r(8, 124, 184, 26, { fill: C.accBg, r: 6, name: 'active section' });
  s.t('⋮⋮  👁  Header\n⋮⋮  👁  Summary\n⋮⋮  👁  Experience\n⋮⋮  👁  Projects\n⋮⋮  👁  Education\n⋮⋮  👁  Skills\n\n＋ Add section', 16, 94, { size: 12, lh: 30 });
  s.t('DESIGN', 16, 372, { size: 11, b: 1, c: C.mute });
  s.t('Template      Classic ▾\nFont             Inter ▾\nAccent          ● ● ● ● ○\nSpacing        ◉─────\nMargins        ◉─────', 16, 398, { lh: 34, size: 12 });
  s.t('VERSIONS', 16, 600, { size: 11, b: 1, c: C.mute });
  s.t('● v3  Tailored · Stripe\n○ v2  Shortened to 1 page\n○ v1  Imported', 16, 624, { lh: 26 });
  s.r(200, 52, 800, 848, { fill: C.canvas, stroke: C.ink, name: 'canvas' });
  s.t('⊖  100%  ⊕          Page 1 / 1', 220, 66, { c: C.mute });
  s.paper(330, 92, 540, 700, { 1: 'sel', 2: 'add' });
  s.r(350, 430, 500, 126, { fill: C.white, stroke: C.acc, sw: 2, r: 10, shadow: true, name: 'inline AI' });
  s.t('✦ Ask AI about this bullet…', 366, 444, { c: C.soft, size: 13 });
  s.t('[ Add metric ]  [ Shorten ]  [ Stronger verb ]  [ Match job ]  [ ⋯ ]', 366, 478, { c: C.acc, size: 11 });
  s.t('→ “Cut p95 latency 40% by redesigning the caching layer”      [ Accept ↵ ]  [ Retry ]', 366, 512, { c: C.good, size: 11 });
  s.r(400, 830, 480, 48, { fill: C.ink, r: 24, shadow: true, name: 'cmd bar' }); s.t('✦  Ask AI anything…                              ⌘K', 430, 846, { c: C.white, size: 13 });
  s.t('1 page ✓ · ATS 92 · Match 91%', 220, 856, { c: C.mute, size: 11 });
  s.agent(1000, 52, 440, 848);
  s.done();
}

// ---------- 08 Editor: Compare (F) ----------
{
  const s = Screen('08', 'Editor Compare', 'Editor — Compare mode (from F)');
  s.editorTop(1);
  s.r(0, 52, 1000, 96, { stroke: C.ink, name: 'timeline' }); s.r(60, 112, 880, 2, { fill: C.ink });
  [[60, 'v1 · Imported\nold_resume.docx'], [330, 'v2 · Shortened\n1 page']].forEach(n => { s.r(n[0], 104, 18, 18, { type: 'ellipse', fill: C.white, stroke: C.ink, sw: 2 }); s.t(n[1], n[0] - 14, 56, { size: 11, c: C.mute, lh: 16 }); });
  s.r(600, 102, 22, 22, { type: 'ellipse', fill: C.acc, stroke: C.acc, sw: 2 }); s.t('v3 · Tailored: Stripe  (viewing)\n7 changes · match 91%', 560, 56, { size: 11, b: 1, c: C.acc, lh: 16 });
  s.r(870, 104, 18, 18, { type: 'ellipse', fill: C.accBg, stroke: C.acc, sw: 2, dash: 1 }); s.t('✦ v4 · AI working…', 840, 56, { size: 11, c: C.acc });
  s.t('⑂ Branch for another job', 60, 130, { size: 11, c: C.mute });
  s.t('ORIGINAL  ·  old_resume.docx', 60, 168, { size: 11, b: 1, c: C.bad }); s.t('AI EDITED  ·  v3', 440, 168, { size: 11, b: 1, c: C.good });
  s.paper(40, 192, 340, 480, { 1: 'del' }); s.paper(420, 192, 340, 480, { 1: 'add', 2: 'add' });
  s.t('↔  Scroll & zoom linked', 340, 690, { size: 11, c: C.mute });
  s.r(780, 168, 204, 504, { stroke: C.ink, r: 10, name: 'changes inbox' });
  s.t('CHANGES  (7)\n\n☑  Summary rewritten\n☑  Skills reordered\n☑  Acme: 3 bullets\n☐  Beta: add metric\n☑  Date format fixed\n☐  Hide older role\n☑  Margins tightened\n\n[ Accept selected ]\n[ Reject all ]', 796, 184, { lh: 28 });
  s.r(0, 760, 1000, 140, { stroke: C.ink, name: 'code drawer' });
  s.t('▴  </> main.tex  (v3)  ·  214 lines  ·  +38 −12            Compile ✓   ·   Logs (0)', 20, 774, { c: C.mute });
  s.r(20, 806, 600, 20, { fill: C.goodBg, stroke: C.good, r: 3 }); s.r(20, 832, 480, 20, { fill: C.badBg, stroke: C.bad, r: 3 }); s.r(20, 862, 400, 10, { fill: C.gray, r: 3 });
  s.agent(1000, 52, 440, 848);
  s.done();
}

// ---------- 09 Editor: Code ----------
{
  const s = Screen('09', 'Editor Code', 'Editor — Code mode (Overleaf-style)');
  s.editorTop(2);
  s.r(0, 52, 200, 848, { stroke: C.ink, name: 'file tree' });
  s.t('FILES                  ⬆  ＋', 14, 66, { size: 11, b: 1, c: C.mute });
  s.r(8, 246, 184, 24, { fill: C.accBg, r: 4 });
  s.t('▾ 📁 sections\n      summary.tex\n      experience.tex\n      skills.tex\n▸ 📁 imports\n   📄 old_resume.docx\n   📄 job_posting.pdf\n   main.tex  ●', 14, 90, { size: 12, lh: 24 });
  s.t('OUTLINE', 14, 330, { size: 11, b: 1, c: C.mute }); s.t('Header\nSummary\nExperience\n   Acme Corp\n   Beta Labs\nProjects\nEducation\nSkills', 14, 352, { size: 12, lh: 24 });
  s.r(200, 52, 500, 770, { stroke: C.ink, name: 'editor' });
  s.t('main.tex  ×      experience.tex  ×                 ✦ Edit selection', 216, 66, { c: C.mute });
  s.t('1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12', 222, 104, { size: 11, c: '#AAAAAA', lh: 22 });
  [[108, 180, '#CFE0F5'], [130, 240, '#CFE0F5'], [152, 280, C.gray], [174, 170, '#CFE0F5']].forEach(b => s.r(266, b[0], b[1], 10, { fill: b[2], r: 3 }));
  s.r(256, 192, 430, 22, { fill: C.badBg, stroke: C.bad, r: 3 }); s.t('−  \\item Worked on backend things', 266, 197, { size: 11, c: C.bad });
  s.r(256, 218, 430, 22, { fill: C.goodBg, stroke: C.good, r: 3 }); s.t('+  \\item Cut p95 latency 40% by redesigning caching', 266, 223, { size: 11, c: C.good }); s.t('✓ ✕', 660, 223, { size: 11 });
  s.r(256, 244, 430, 22, { fill: C.accSoft, stroke: '#9A9AE0', r: 3 }); s.t('   \\item Led migration of 12 services to Go        ⇥ Tab', 266, 249, { size: 11, c: '#9A9AE0' });
  [[284, 300], [306, 140], [328, 360]].forEach(b => s.r(266, b[0], b[1], 10, { fill: C.gray, r: 3 }));
  s.t('AI changes in this file: 2   ·   ✓ Accept all   ✕ Reject all', 216, 790, { size: 11, c: C.acc });
  s.r(700, 52, 340, 770, { fill: C.canvas, stroke: C.ink, name: 'preview' });
  s.btn(716, 62, 110, 28, '⟳ Recompile', 'good'); s.t('Compiled ✓ 0.9s', 840, 69, { c: C.mute, size: 11 });
  s.paper(730, 110, 280, 420, { 1: 'add' }); s.t('↔ synced with line 8', 740, 560, { size: 10, c: C.good });
  s.r(0, 822, 1040, 78, { stroke: C.ink, name: 'status' }); s.t('Logs & errors (0)    |    Word count 412    |    Auto-compile ON    |    1 page ✓', 20, 852, { c: C.mute });
  s.agent(1040, 52, 400, 848);
  s.done();
}

// ---------- 10 Export modal ----------
{
  const s = Screen('10', 'Export', 'Export dialog');
  s.editorTop(0); s.r(0, 52, 1440, 848, { fill: C.canvas, name: 'bg' }); s.paper(450, 80, 540, 760, {});
  s.r(0, 0, 1440, 900, { fill: '#00000073', name: 'scrim' });
  s.r(340, 90, 760, 700, { fill: C.white, stroke: C.ink, sw: 2, r: 16, shadow: true, name: 'modal' });
  s.t('Export resume', 372, 118, { size: 20, b: 1 }); s.t('✕', 1060, 120, { size: 16 });
  [['PDF', 'Best for applying\n★ Recommended', 1], ['DOCX', 'Editable in Word\nGoogle Docs', 0], ['LaTeX', '.zip with all\nsource files', 0], ['Plain text', 'Paste into forms\nATS-safe', 0]].forEach((c, i) => { const x = 372 + i * 178; s.r(x, 168, 166, 120, { fill: c[2] ? C.accBg : C.white, stroke: c[2] ? C.acc : C.line, sw: c[2] ? 2 : 1, r: 10, name: 'format' }); s.t(c[0], x + 14, 184, { b: 1, size: 15 }); s.t(c[1], x + 14, 220, { c: C.mute, lh: 20 }); });
  s.t('Options', 372, 316, { b: 1, size: 13 });
  s.t('ATS-safe mode\nEmbed fonts\nClickable links\nPage size', 372, 348, { lh: 44, size: 13 });
  s.toggle(560, 359); s.toggle(560, 403); s.toggle(560, 447); s.seg(520, 487, ['Letter', 'A4'], 0, 62, 30);
  s.t('File name', 700, 316, { b: 1, size: 13 });
  s.r(700, 342, 372, 38, { stroke: C.line, r: 8 }); s.t('Divya_Arora_Stripe_Backend.pdf', 714, 353, { size: 13 });
  s.r(700, 398, 372, 150, { fill: C.canvas, stroke: C.line, r: 8, name: 'preview' }); s.paper(830, 408, 112, 130, {});
  s.r(372, 580, 700, 52, { fill: C.accSoft, stroke: C.acc, r: 10, name: 'attach' });
  s.t('☑  Attach to “Stripe — Backend Engineer” and mark as Applied', 390, 597, { size: 13 });
  s.btn(372, 700, 190, 44, '🔗 Copy share link', 'out'); s.btn(780, 700, 292, 44, '⬇  Download PDF', 'acc');
  s.t('PDF is generated from your latest LaTeX — what you see is what you get.', 372, 656, { size: 11, c: C.mute });
  s.done();
}

// ---------- 11 Resumes ----------
{
  const s = Screen('11', 'Resumes', 'Resumes library');
  s.nav(2); s.head('Resumes', 'One master resume, many tailored versions.', '＋ New resume');
  [['Master resume', 'v5 · edited yesterday', 'MASTER'], ['Stripe — Backend', 'v3 · edited 2h ago', 'Applied'], ['Notion — PM', 'v2 · draft', 'Draft'], ['Atlassian — SDE II', 'v1 · imported', 'Interview']].forEach((c, i) => { const x = 256 + i * 294; s.r(x, 100, 268, 340, { stroke: i ? C.line : C.acc, sw: i ? 1 : 2, r: 12, name: 'resume card' }); s.r(x + 8, 108, 252, 230, { fill: C.canvas, r: 8 }); s.paper(x + 66, 118, 136, 210, i === 1 ? { 1: 'add' } : {}); s.t(c[0], x + 14, 352, { b: 1, size: 13 }); s.t(c[1], x + 14, 374, { c: C.mute, size: 11 }); s.chip(x + 14, 400, c[2], i === 0 ? 'acc' : i === 1 ? 'good' : i === 3 ? 'warn' : 'gray'); });
  s.t('Version history  ·  Stripe — Backend', 256, 480, { b: 1, size: 14 });
  s.r(256, 512, 1152, 250, { stroke: C.line, r: 10, name: 'versions' });
  s.t('●  v3   Tailored for Stripe — 7 changes                        2h ago              [ Open ]  [ Compare ]  [ Restore ]\n○  v2   Shortened to 1 page                                           yesterday          [ Open ]  [ Compare ]  [ Restore ]\n○  v1   Imported from old_resume.docx                              3 days ago         [ Open ]  [ Compare ]  [ Restore ]', 276, 540, { lh: 56 });
  s.done();
}

// ---------- 12 Templates ----------
{
  const s = Screen('12', 'Templates', 'Templates');
  s.nav(4); s.head('Templates', 'Switching template re-flows your content with AI — nothing is lost.');
  s.t('All   |   ATS-friendly   |   Academic   |   Creative   |   Compact', 256, 90, { c: C.mute });
  [['Classic', 'ATS-friendly', 'In use'], ['Modern', 'ATS-friendly', ''], ['Academic CV', 'Academic', ''], ['Compact', 'Compact', ''], ['Executive', 'Classic', ''], ['Sidebar', 'Creative', ''], ['Minimal', 'ATS-friendly', ''], ['Tech', 'ATS-friendly', '']].forEach((c, i) => {
    const x = 256 + (i % 4) * 294, y = 126 + Math.floor(i / 4) * 370;
    s.r(x, y, 268, 346, { stroke: i ? C.line : C.acc, sw: i ? 1 : 2, r: 12, name: 'template' }); s.r(x + 8, y + 8, 252, 266, { fill: C.canvas, r: 8 }); s.paper(x + 56, y + 20, 156, 244, {});
    s.t(c[0], x + 14, y + 286, { b: 1, size: 13 }); s.t(c[1], x + 14, y + 308, { c: C.mute, size: 11 });
    if (c[2]) s.chip(x + 190, y + 284, c[2], 'acc', 66); else s.btn(x + 170, y + 282, 82, 28, 'Use', 'out');
  });
  s.done();
}

// ---------- 13 Settings ----------
{
  const s = Screen('13', 'Settings', 'Settings — AI preferences');
  s.nav(null, true); s.head('Settings');
  s.r(256, 80, 200, 200, { stroke: C.line, r: 10, name: 'subnav' }); s.r(264, 124, 184, 34, { fill: C.accBg, r: 6 });
  s.t('Profile\nAI preferences\nIntegrations\nBilling', 276, 94, { size: 13, lh: 38 });
  s.r(480, 80, 928, 760, { stroke: C.ink, r: 12, name: 'panel' });
  s.t('AI preferences', 504, 104, { size: 18, b: 1 });
  const row = (y, title, desc) => { s.t(title, 504, y, { b: 1, size: 13 }); s.t(desc, 504, y + 22, { c: C.mute, w: 520, lh: 18 }); s.r(504, y + 64, 880, 1, { fill: C.gray }); };
  row(160, 'Truth guard', 'AI never invents employers, dates, skills or numbers. If it’s unsure, it asks you instead.'); s.toggle(1330, 160);
  row(250, 'Review before applying', 'Show AI changes for you to accept, or apply them automatically.'); s.seg(1100, 250, ['Review', 'Auto-apply'], 0, 100, 32);
  row(340, 'Writing tone', 'How the AI phrases bullets and summaries.'); s.seg(1060, 340, ['Concise', 'Balanced', 'Bold'], 1, 100, 32);
  row(430, 'Locked sections', 'AI won’t touch these parts of your resume.'); s.chip(1130, 432, 'Header  ×', 'gray', 80); s.chip(1220, 432, 'Education  ×', 'gray', 92); s.chip(1320, 432, '＋ Add', 'acc', 60);
  row(520, 'Default export', 'Format and page size used by “Download”.'); s.r(1200, 518, 184, 34, { stroke: C.line, r: 8 }); s.t('PDF · Letter  ▾', 1214, 528);
  row(610, 'Language', 'Language for AI suggestions and spell-check.'); s.r(1200, 608, 184, 34, { stroke: C.line, r: 8 }); s.t('English (US)  ▾', 1214, 618);
  s.btn(1244, 770, 140, 40, 'Save changes', 'dark');
  s.done();
}

process.stdout.write(JSON.stringify(steps));
