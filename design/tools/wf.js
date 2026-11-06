// v4 — five takes on Hallmark's Wayfind theme: Platform, Night, Signal, Line map, Signage. Three screens each.
// Wayfind rules kept: mono throughout, 2px ink borders, square corners (pills only for status), ink plates,
// cobalt only for what is live, amber for figures on ink, sentence-case labels, no invented proof.
const { Screen } = require('./lib');
const { btn, resume, code } = require('./kit');

const { M, MB, PL, NI, SG, PAGE, EDITS, T, B, live, status, seg, page, diff, navTop, navApp } = require('./wayfind');

// ═════════════════════ A · PLATFORM — the refined original ═════════════════════
{
  { // A-01 Welcome
    const s = Screen('W1-01', 'Platform Welcome', 'A · Platform — Welcome', PL.paper); navTop(s);
    T(s, 'Every edit,\non the board.', 64, 132, 80, PL.ink, true, { lh: 80, ls: -3 });
    T(s, 'Drop a DOCX or PDF. Watch the AI\nrewrite it, line by line.', 64, 316, 18, PL.ink2, false, { lh: 28 });
    B(s, 64, 396, 232, 52, 'Import a resume', 'co'); B(s, 310, 396, 184, 52, 'See a sample', 'out');
    T(s, 'Takes .docx, .pdf and .tex', 64, 470, 13, PL.mute);
    const rz = page(s, 930, 104, 400, { 3: { fill: PL.coSoft } }); s.r(rz.L - 6, rz.ys[3] - 3, 3, 15, { fill: PL.co });
    // station card
    const cx = 660, cy = 150; s.r(cx, cy, 280, 372, { fill: PL.p3, stroke: PL.ink, sw: 2, shadow: { c: '#0E121B55', y: 24, b: 40 }, name: 'station card' });
    T(s, 'Summary, line 6', cx + 16, cy + 16, 14, PL.ink, true); s.hl(cx, cy + 46, 280, PL.ink, 2);
    diff(s, cx + 12, cy + 60, 256, EDITS[0]);
    s.r(cx + 12, cy + 200, 256, 100, { fill: PL.am, name: 'plate' }); T(s, 'Nine words\nshorter', cx + 26, cy + 214, 22, PL.ink, true, { lh: 24 }); T(s, 'Still on one page', cx + 26, cy + 270, 12, PL.ink2);
    T(s, 'Live', cx + 16, cy + 330, 13, PL.co, true); T(s, 'Updated now', cx + 150, cy + 330, 12, PL.mute, false, { w: 114, al: 'right' });
    // board band
    s.r(0, 600, 1440, 300, { fill: PL.ink, name: 'board band' }); s.hl(64, 614, 1312, PL.inkRule, 2);
    T(s, 'Four edits for this job.', 64, 636, 30, '#FFFFFF', true);
    seg(s, 1040, 632, 336, ['Stripe', 'Notion', 'Figma'], 0, { line: '#FFFFFF', txt: '#FFFFFF', onFill: '#FFFFFF', onTxt: PL.ink });
    [['Line', 64], ['Section', 200], ['Change', 440], ['Words', 940], ['Status', 1250]].forEach(([l, x]) => T(s, l, x, 700, 13, PL.dim, false, l === 'Words' ? { w: 100, al: 'right' } : {}));
    s.hl(64, 722, 1312, '#FFFFFF', 2);
    EDITS.slice(0, 3).forEach((e, i) => {
      const y = 732 + i * 54; T(s, e.ln, 64, y + 8, 30, PL.am, true); T(s, e.sec, 200, y + 15, 16, '#FFFFFF', true); T(s, e.chg, 440, y + 16, 15, PL.soft);
      T(s, e.w, 940, y + 8, 30, PL.am, true, { w: 100, al: 'right' }); status(s, 1250, y + 13, e.st); if (i < 2) s.hl(64, y + 52, 1312, PL.inkRule);
    });
    s.done();
  }
  { // A-02 Home — applications as departures
    const s = Screen('W1-02', 'Platform Home', 'A · Platform — Home, applications as departures', PL.paper); navApp(s, 'Applications');
    T(s, 'Your applications.', 64, 100, 52, PL.ink, true, { ls: -2 }); T(s, 'Six jobs, each with its own tailored resume.', 64, 168, 15, PL.ink2);
    seg(s, 856, 110, 520, ['All', 'Drafts', 'Sent', 'Interviews'], 0);
    s.r(64, 214, 1312, 610, { fill: PL.ink, name: 'board' });
    [['Company', 88], ['Role', 300], ['Resume', 600], ['Fit', 720], ['Next step', 850], ['Status', 1210]].forEach(([l, x]) => T(s, l, x, 234, 13, PL.dim));
    s.hl(64, 258, 1312, '#FFFFFF', 2);
    [['Stripe', 'Backend engineer', 'v6', '91', 'Interview Thu, 10:00', 'Interview'], ['Notion', 'Product engineer', 'v3', '84', 'AI is editing line 12', 'Live'],
      ['Razorpay', 'Senior backend', 'v2', '78', 'Send by Friday', 'Draft'], ['Figma', 'Infra engineer', 'v4', '88', 'Waiting to hear back', 'Sent'],
      ['Zerodha', 'Platform engineer', 'v1', '72', 'Add two keywords', 'Draft'], ['Atlassian', 'SDE II', 'v5', '80', 'Offer call booked', 'Interview']].forEach((r, i) => {
      const y = 268 + i * 92; T(s, r[0], 88, y + 22, 22, '#FFFFFF', true); T(s, r[1], 300, y + 27, 15, PL.soft); T(s, r[2], 600, y + 27, 15, '#FFFFFF');
      T(s, r[3], 720, y + 16, 40, PL.am, true); T(s, r[4], 850, y + 27, 15, '#FFFFFF');
      if (r[5] === 'Interview') { s.r(1210, y + 22, 132, 32, { fill: PL.am, name: 'plate' }); T(s, 'Interview', 1210, y + 29, 13, PL.ink, true, { w: 132, al: 'center' }); }
      else if (r[5] === 'Live') live(s, 1210, y + 25);
      else T(s, r[5], 1210, y + 29, 14, r[5] === 'Draft' ? PL.soft : PL.dim);
      if (i < 5) s.hl(88, y + 90, 1264, PL.inkRule);
    });
    T(s, 'Fit compares your resume with the job post. It is a guide, not a grade.', 64, 846, 13, PL.mute);
    s.done();
  }
  { // A-03 Editor
    const s = Screen('W1-03', 'Platform Editor', 'A · Platform — Editor', PL.p2);
    s.r(0, 0, 1440, 64, { fill: PL.ink }); T(s, 'AnyJob', 24, 20, 21, '#FFFFFF', true); T(s, 'Backend engineer, Stripe', 150, 24, 14, PL.dim);
    seg(s, 560, 12, 330, ['Edit', 'Compare', 'Code'], 0, { line: '#FFFFFF', txt: '#FFFFFF', onFill: '#FFFFFF', onTxt: PL.ink });
    B(s, 1092, 12, 140, 40, 'Accept all', 'outW'); B(s, 1244, 12, 172, 40, 'Export PDF', 'am');
    s.r(0, 64, 440, 836, { fill: PL.p3, name: 'code' }); s.vl(440, 64, 836, PL.ink, 2);
    T(s, 'main.tex', 24, 80, 13, PL.ink, true); T(s, 'Compiled', 320, 80, 12, PL.mute, false, { w: 96, al: 'right' }); s.hl(0, 106, 440, PL.ink, 2);
    code(s, 24, 124, { lh: 24, size: 13, f: M, c: PL.ink, num: PL.dim, w: 416 }, { 6: { bg: PL.coSoft, bar: PL.co }, 7: { bg: PL.coSoft, bar: PL.co }, 12: { bar: PL.am }, 13: { bar: PL.am }, 19: { bar: PL.am } });
    const rz = page(s, 490, 90, 500, { 3: { fill: PL.coSoft } }); s.r(rz.L - 7, rz.ys[3] - 3, 3, 17, { fill: PL.co });
    s.r(490, 818, 500, 56, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'ask' }); T(s, 'Tell the AI what to change', 510, 837, 14, PL.mute); B(s, 892, 828, 88, 36, 'Send', 'co');
    s.r(1040, 64, 400, 836, { fill: PL.ink, name: 'board' }); T(s, 'Edits', 1064, 86, 28, '#FFFFFF', true); T(s, 'Four for this job', 1064, 124, 13, PL.dim); s.hl(1040, 152, 400, PL.inkRule, 2);
    const e = EDITS[0]; T(s, e.ln, 1064, 170, 32, PL.am, true); T(s, e.sec, 1144, 172, 16, '#FFFFFF', true); T(s, e.chg, 1144, 194, 13, PL.soft); live(s, 1350, 174);
    diff(s, 1064, 230, 352, e); B(s, 1064, 372, 120, 36, 'Accept', 'paper'); B(s, 1194, 372, 90, 36, 'Skip', 'outW');
    s.hl(1040, 428, 400, PL.inkRule);
    EDITS.slice(1).forEach((e, i) => { const y = 444 + i * 84; T(s, e.ln, 1064, y + 4, 26, PL.am, true); T(s, e.sec, 1144, y + 4, 15, '#FFFFFF', true); T(s, e.chg, 1144, y + 26, 13, PL.soft); status(s, 1350, y + 4, e.st); s.hl(1040, y + 70, 400, PL.inkRule); });
    s.r(1064, 800, 352, 76, { fill: PL.am, name: 'plate' }); T(s, 'Fits on one page', 1084, 814, 20, PL.ink, true); T(s, 'Page 1 of 1 after these edits', 1084, 844, 12, PL.ink2);
    s.done();
  }
}

// ═════════════════════ B · NIGHT — the timetable after dark ═════════════════════
{
  const navN = (s) => { T(s, 'AnyJob', 64, 22, 21, NI.ink, true); [['How it works', 880], ['Templates', 1018], ['Pricing', 1132]].forEach(([l, x]) => T(s, l, x, 25, 14, NI.ink2)); B(s, 1240, 16, 136, 36, 'Start free', 'co', NI); s.hl(0, 70, 1440, NI.rule, 2); };
  { // B-01 Welcome
    const s = Screen('W2-01', 'Night Welcome', 'B · Night — Welcome', NI.paper); navN(s);
    T(s, 'Live edits.\nNo surprises.', 64, 168, 84, NI.ink, true, { lh: 84, ls: -3 });
    T(s, 'Every change the AI makes arrives\non the board first.', 64, 364, 18, NI.ink2, false, { lh: 28 });
    B(s, 64, 446, 232, 52, 'Import a resume', 'co', NI); B(s, 310, 446, 184, 52, 'See a sample', 'out', NI);
    T(s, 'Sample resume, sample job.', 64, 830, 12, NI.mute);
    const X = 700, Y = 118; s.r(X, Y, 676, 650, { fill: NI.p2, stroke: NI.rule, sw: 2, name: 'board' });
    T(s, 'Backend engineer, Stripe', X + 28, Y + 24, 18, NI.ink, true); T(s, 'Updated now', X + 500, Y + 28, 13, NI.mute, false, { w: 148, al: 'right' }); s.hl(X, Y + 64, 676, NI.ink, 2);
    [['Line', 28], ['Change', 150], ['Words', 430], ['Status', 576]].forEach(([l, x]) => T(s, l, X + x, Y + 80, 13, NI.mute, false, l === 'Words' ? { w: 110, al: 'right' } : {})); s.hl(X, Y + 104, 676, NI.rule);
    EDITS.forEach((e, i) => {
      const y = Y + 112 + i * 124; if (e.st === 'Live') s.r(X + 2, y - 4, 672, 120, { fill: NI.coSoft, name: 'live row' });
      T(s, e.ln, X + 28, y + 22, 46, NI.am, true); T(s, e.sec, X + 150, y + 26, 18, NI.ink, true); T(s, e.chg, X + 150, y + 54, 15, NI.ink2);
      T(s, e.w, X + 430, y + 22, 46, NI.am, true, { w: 110, al: 'right' }); status(s, X + 580, y + 34, e.st, NI);
      if (i < 3) s.hl(X, y + 118, 676, NI.rule);
    });
    T(s, 'Page 1 of 1 after these edits', X + 28, Y + 616, 13, NI.ink2);
    s.done();
  }
  { // B-02 Import — arrivals
    const s = Screen('W2-02', 'Night Import', 'B · Night — Import, files as arrivals', NI.paper); navN(s);
    T(s, 'Arrivals.', 64, 104, 72, NI.ink, true, { ls: -3 }); T(s, 'Drop a file. Watch it come in, section by section.', 64, 196, 16, NI.ink2);
    s.r(64, 256, 520, 370, { fill: NI.p2, stroke: NI.mute, sw: 2, dash: [10, 6], name: 'drop zone' });
    T(s, '.docx  .pdf  .tex', 64, 390, 32, NI.ink, true, { w: 520, al: 'center' }); B(s, 234, 456, 180, 46, 'Choose a file', 'co', NI);
    s.r(64, 650, 520, 110, { fill: PL.am, name: 'plate' }); T(s, 'Your words stay yours.', 88, 670, 22, PL.ink, true); T(s, 'We change the layout, not the wording,\nuntil you ask.', 88, 704, 13, PL.ink2, false, { lh: 19 });
    const X = 640; s.r(X, 256, 736, 504, { fill: NI.p2, stroke: NI.rule, sw: 2, name: 'board' });
    [['File', 24], ['Stage', 330], ['Progress', 500], ['', 650]].forEach(([l, x]) => T(s, l, X + x, 276, 13, NI.mute)); s.hl(X, 300, 736, NI.ink, 2);
    [['resume_final_v3.docx', 'Word, 2 pages', 'Writing LaTeX', 2, 'Live'], ['cover_letter.pdf', 'PDF, 1 page', 'Waiting', 0, ''], ['old_resume.pdf', 'PDF, 3 pages', 'Done', 4, 'Open']].forEach((r, i) => {
      const y = 316 + i * 148; if (r[4] === 'Live') s.r(X + 2, y - 12, 732, 144, { fill: NI.coSoft, name: 'live row' });
      T(s, r[0], X + 24, y + 26, 17, NI.ink, true); T(s, r[1], X + 24, y + 54, 13, NI.mute); T(s, r[2], X + 330, y + 30, 14, r[3] === 4 ? NI.mute : NI.ink);
      for (let c = 0; c < 4; c++) s.r(X + 500 + c * 30, y + 28, 24, 24, { fill: c < r[3] ? NI.co : c === r[3] && r[4] === 'Live' ? '#4F7BFF55' : '#00000000', stroke: NI.mute, sw: c < r[3] ? 0 : 1, name: 'cell' });
      T(s, `${r[3]}/4`, X + 500, y + 62, 14, NI.am, true);
      if (r[4] === 'Live') live(s, X + 650, y + 28, NI); else if (r[4] === 'Open') B(s, X + 646, y + 24, 70, 32, 'Open', 'out', NI);
      if (i < 2) s.hl(X, y + 132, 736, NI.rule);
    });
    s.done();
  }
  { // B-03 Editor — board left, code right
    const s = Screen('W2-03', 'Night Editor', 'B · Night — Editor, timetable / page / code', NI.paper);
    s.r(0, 0, 1440, 64, { fill: NI.p2 }); s.hl(0, 64, 1440, NI.rule, 2); T(s, 'AnyJob', 24, 20, 21, NI.ink, true); T(s, 'Backend engineer, Stripe', 150, 24, 14, NI.mute);
    seg(s, 560, 12, 330, ['Edit', 'Compare', 'Code'], 0, { line: NI.ink, txt: NI.ink, onFill: NI.ink, onTxt: NI.paper });
    B(s, 1092, 12, 140, 40, 'Accept all', 'out', NI); B(s, 1244, 12, 172, 40, 'Export PDF', 'am');
    s.r(0, 66, 380, 834, { fill: NI.p2, name: 'timetable' }); s.vl(380, 66, 834, NI.rule, 2);
    T(s, 'Edits', 24, 86, 28, NI.ink, true); T(s, 'Four for this job', 24, 124, 13, NI.mute); s.hl(0, 152, 380, NI.ink, 2);
    EDITS.forEach((e, i) => {
      const live1 = e.st === 'Live', y = 168 + (i ? 268 + (i - 1) * 96 : 0);
      if (live1) s.r(0, y - 12, 380, 268, { fill: NI.coSoft, name: 'live row' });
      T(s, e.ln, 24, y, 34, NI.am, true); T(s, e.sec, 110, y + 2, 16, NI.ink, true); T(s, e.chg, 110, y + 24, 13, NI.ink2); status(s, 296, y + 4, e.st, NI);
      if (live1) { diff(s, 24, y + 60, 332, e, NI); B(s, 24, y + 202, 120, 36, 'Accept', 'co', NI); B(s, 154, y + 202, 90, 36, 'Skip', 'out', NI); }
      s.hl(0, y + (live1 ? 256 : 84), 380, NI.rule);
    });
    s.r(24, 806, 332, 70, { fill: PL.am, name: 'plate' }); T(s, 'Fits on one page', 42, 818, 19, PL.ink, true); T(s, 'Page 1 of 1', 42, 846, 12, PL.ink2);
    const rz = page(s, 420, 92, 520, { 3: { fill: PL.coSoft } }, { stroke: NI.rule }); s.r(rz.L - 7, rz.ys[3] - 3, 3, 17, { fill: PL.co });
    s.r(420, 840, 520, 44, { fill: NI.p2, stroke: NI.mute, sw: 2, name: 'ask' }); T(s, 'Tell the AI what to change', 438, 853, 14, NI.mute); B(s, 852, 845, 80, 34, 'Send', 'co', NI);
    s.r(980, 66, 460, 834, { fill: NI.p2, name: 'code' }); s.vl(980, 66, 834, NI.rule, 2); T(s, 'main.tex', 1004, 84, 13, NI.ink, true); s.hl(980, 110, 460, NI.rule, 2);
    code(s, 1004, 128, { lh: 24, size: 12.5, f: M, c: NI.ink2, num: '#4A5262', w: 436 }, { 6: { bg: NI.coSoft, bar: NI.co, c: NI.ink }, 7: { bg: NI.coSoft, bar: NI.co, c: NI.ink }, 12: { bar: NI.am }, 13: { bar: NI.am }, 19: { bar: NI.am } });
    s.done();
  }
}

// ═════════════════════ C · SIGNAL — cobalt ground, signs on the page ═════════════════════
{
  { // C-01 Welcome
    const s = Screen('W3-01', 'Signal Welcome', 'C · Signal — Welcome', SG.co); navTop(s, PL, { bar: false, btn: 'ink' });
    T(s, 'Tailor it.\nLine by line.', 64, 140, 84, SG.white, true, { lh: 86, ls: -3 });
    T(s, 'Paste a job link. AnyJob rewrites\nyour LaTeX to match.', 64, 352, 18, SG.white, false, { lh: 28 });
    B(s, 64, 434, 246, 52, 'Paste a job link', 'ink'); B(s, 324, 434, 210, 52, 'Import a resume', 'outW');
    const rz = page(s, 960, 96, 400, { 3: { fill: PL.amSoft }, 6: { fill: PL.amSoft }, 17: { fill: PL.amSoft } }, { shadow: { c: '#0E121B66', y: 30, b: 50 } });
    [[3, 'L6', 'Tighten'], [6, 'L12', 'Lead with the result'], [17, 'L23', 'Go and Postgres first']].forEach(([row, ln, t], i) => {
      const y = [190, 300, 520][i], ty = rz.ys[row] + 4;
      s.r(700, y, 230, 60, { fill: PL.ink, name: 'sign' }); T(s, ln, 716, y + 16, 24, PL.am, true); T(s, t, 784, y + 21, 13, SG.white, true, { w: 140 });
      s.hl(930, y + 30, 0, PL.ink, 2); s.vl(930, Math.min(y + 30, ty), Math.abs(ty - y - 30) + 2, PL.ink, 2); s.hl(930, ty, rz.L - 940, PL.ink, 2);
    });
    s.r(0, 800, 1440, 100, { fill: SG.deep, name: 'strip' });
    ['Takes .docx, .pdf and .tex', 'Exports PDF and LaTeX', 'Every edit waits for your yes'].forEach((t, i) => T(s, t, 64 + i * 460, 838, 15, SG.white));
    s.done();
  }
  { // C-02 Compare — then and now
    const s = Screen('W3-02', 'Signal Compare', 'C · Signal — Compare, before and after', PL.paper);
    s.r(0, 0, 1440, 196, { fill: SG.co, name: 'band' }); navTop(s, PL, { bar: false, btn: 'ink' });
    T(s, 'Before and after.', 64, 104, 48, SG.white, true, { ls: -2 });
    seg(s, 1000, 112, 376, ['Side by side', 'Changes only'], 0, { line: SG.white, txt: SG.white, onFill: SG.white, onTxt: SG.co });
    T(s, 'Before, your DOCX', 64, 214, 13, PL.mute, true); T(s, 'After, typeset in LaTeX', 976, 214, 13, PL.ink, true);
    s.r(64, 240, 400, 566, { fill: PL.p2, stroke: PL.rule, sw: 2, name: 'before page' }); resume(s, 64, 240, 400, { ...PAGE, head: M, ink: PL.mute, ink2: PL.mute });
    page(s, 976, 240, 400, { 3: { fill: PL.amSoft }, 6: { fill: PL.amSoft }, 10: { fill: PL.amSoft }, 17: { fill: PL.amSoft } });
    s.r(500, 240, 440, 566, { fill: PL.ink, name: 'changes' }); T(s, 'Four changes', 524, 260, 20, SG.white, true); s.hl(500, 296, 440, PL.inkRule, 2);
    EDITS.forEach((e, i) => {
      const y = 308 + i * 112; T(s, e.ln, 524, y + 4, 26, PL.am, true); T(s, e.sec, 600, y + 8, 14, SG.white, true);
      T(s, e.before, 600, y + 36, 13, PL.dim); s.hl(600, y + 44, e.before.length * 7.15, PL.dim); T(s, e.after, 600, y + 60, 13, SG.white);
      if (i < 3) s.hl(500, y + 100, 440, PL.inkRule);
    });
    s.r(500, 760, 440, 46, { fill: PL.am, name: 'plate' }); T(s, 'Two pages down to one', 524, 773, 15, PL.ink, true);
    B(s, 976, 830, 200, 48, 'Accept all', 'co'); B(s, 1190, 830, 186, 48, 'Undo all', 'out'); T(s, 'Nothing is applied until you accept.', 64, 846, 13, PL.mute);
    s.done();
  }
  { // C-03 Editor — cobalt section rail
    const s = Screen('W3-03', 'Signal Editor', 'C · Signal — Editor, sections as signs', PL.p2);
    s.r(0, 0, 300, 900, { fill: SG.co, name: 'rail' }); T(s, 'AnyJob', 24, 22, 21, SG.white, true);
    T(s, 'Sections', 24, 92, 13, SG.white, false, { op: .8 });
    [['Header', 0], ['Summary', 1], ['Experience', 2], ['Projects', 0], ['Education', 0], ['Skills', 1]].forEach(([l, n], i) => {
      const y = 118 + i * 60, on = l === 'Summary'; if (on) s.r(12, y, 276, 52, { fill: SG.white, name: 'active' });
      T(s, l, 28, y + 16, 16, on ? SG.co : SG.white, on); if (n) { s.r(236, y + 13, 36, 26, { fill: PL.am, name: 'count' }); T(s, String(n), 236, y + 18, 13, PL.ink, true, { w: 36, al: 'center' }); }
      s.hl(12, y + 56, 276, SG.line, 1, .5);
    });
    B(s, 24, 772, 252, 48, 'Export PDF', 'ink'); B(s, 24, 830, 252, 44, 'Share a link', 'outW');
    s.r(300, 0, 1140, 64, { fill: PL.p3 }); s.hl(300, 64, 1140, PL.ink, 2); T(s, 'Backend engineer, Stripe', 324, 22, 16, PL.ink, true);
    seg(s, 860, 12, 330, ['Edit', 'Compare', 'Code'], 0); live(s, 1230, 19);
    const rz = page(s, 340, 96, 520, { 3: { fill: PL.amSoft } }); s.r(rz.L - 7, rz.ys[3] - 3, 3, 17, { fill: PL.am });
    s.r(900, 66, 540, 834, { fill: PL.p3, name: 'section panel' }); s.vl(900, 66, 834, PL.ink, 2);
    T(s, 'Summary', 928, 92, 32, PL.ink, true); T(s, 'Line 6, one edit', 928, 136, 13, PL.mute); s.hl(900, 168, 540, PL.ink, 2);
    T(s, 'Before', 928, 192, 12, PL.mute); s.r(928, 214, 484, 74, { fill: PL.p2, name: 'before' }); T(s, 'Backend engineer who ships payment\nsystems that stay up.', 944, 228, 14, PL.mute, false, { lh: 22 });
    T(s, 'After', 928, 308, 12, PL.ink, true); s.r(928, 330, 484, 74, { fill: PL.ink, name: 'after' }); T(s, 'Backend engineer for payment\nsystems that stay up.', 944, 344, 14, SG.white, false, { lh: 22 });
    s.r(928, 424, 484, 72, { fill: PL.amSoft, name: 'why' }); T(s, 'Why: the Stripe post asks for a short\nsummary. This saves nine words.', 944, 438, 13, PL.ink2, false, { lh: 20 });
    B(s, 928, 516, 160, 48, 'Accept', 'co'); B(s, 1100, 516, 120, 48, 'Skip', 'out');
    s.hl(900, 600, 540, PL.rule); T(s, 'Ask about this section', 928, 624, 13, PL.mute);
    s.r(928, 650, 484, 56, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'ask' }); T(s, 'Make it sound less formal', 946, 669, 14, PL.mute); B(s, 1316, 660, 84, 36, 'Send', 'co');
    s.done();
  }
}

// ═════════════════════ D · LINE MAP — the resume as a route ═════════════════════
{
  const route = (s, x0, x1, y, stops, cur, o = {}) => { // stops: [label, detail]
    const gap = (x1 - x0) / (stops.length - 1), r = o.r || 18;
    s.r(x0, y - 6, x1 - x0, 12, { fill: PL.rule, name: 'line ahead' }); s.r(x0, y - 6, gap * cur, 12, { fill: PL.co, name: 'line done' });
    stops.forEach(([l, d], i) => {
      const x = x0 + i * gap, done = i < cur, now = i === cur;
      s.r(x - r, y - r, r * 2, r * 2, { type: 'ellipse', fill: now ? PL.co : PL.p3, stroke: i > cur ? PL.rule : PL.ink, sw: 4, name: 'station' });
      if (o.num) T(s, String(i + 1).padStart(2, '0'), x - 40, y - r - 30, 14, i > cur ? PL.mute : PL.ink, true, { w: 80, al: 'center' });
      T(s, l, x - 90, y + r + 14, o.size || 20, i > cur ? PL.mute : PL.ink, true, { w: 180, al: 'center' });
      if (d) T(s, d, x - 100, y + r + 44, 13, PL.mute, false, { w: 200, al: 'center' });
      if (now && o.here) { s.r(x - 60, y - r - 66, 120, 34, { fill: PL.ink, name: 'here' }); T(s, o.here, x - 60, y - r - 57, 13, '#FFFFFF', true, { w: 120, al: 'center' }); }
    });
  };
  const STOPS = [['Import', '.docx .pdf .tex'], ['Rebuild', 'Clean LaTeX'], ['Tailor', 'To one job post'], ['Check', 'Every edit approved'], ['Export', 'PDF or .tex']];
  { // D-01 Welcome
    const s = Screen('W4-01', 'Line map Welcome', 'D · Line map — Welcome', PL.paper); navTop(s);
    T(s, 'One line from\nDOCX to done.', 64, 128, 76, PL.ink, true, { lh: 78, ls: -3 });
    T(s, 'Five stops. You only step off\nto approve an edit.', 64, 312, 18, PL.ink2, false, { lh: 28 });
    B(s, 64, 392, 232, 52, 'Import a resume', 'co'); B(s, 310, 392, 184, 52, 'See the route', 'out');
    page(s, 1060, 96, 300, { 3: { fill: PL.coSoft } }); s.vl(1209, 520, 64, PL.ink, 2);
    route(s, 140, 1210, 640, STOPS, 2, { num: true, here: 'You are here' });
    s.r(0, 800, 1440, 100, { fill: PL.ink, name: 'strip' });
    T(s, 'Takes about as long as reading your resume once.', 64, 838, 15, '#FFFFFF');
    s.done();
  }
  { // D-02 Import — the route in progress
    const s = Screen('W4-02', 'Line map Import', 'D · Line map — Import, rebuilding', PL.paper); navApp(s, 'Resumes', { cta: 'Import a file' });
    T(s, 'Rebuilding your resume.', 64, 96, 44, PL.ink, true, { ls: -2 }); T(s, 'Stop 2 of 5', 1176, 108, 15, PL.mute, false, { w: 200, al: 'right' });
    route(s, 100, 1340, 210, STOPS.map(([l]) => [l, '']), 1, { r: 14, size: 16 });
    s.r(64, 300, 420, 116, { fill: PL.ink, name: 'file' }); T(s, 'resume_final_v3.docx', 88, 322, 18, '#FFFFFF', true); T(s, 'Word, 2 pages, 38 KB', 88, 352, 13, PL.dim); T(s, 'Opened', 88, 378, 13, PL.am, true);
    s.r(64, 436, 420, 400, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'found' }); T(s, 'Found', 88, 454, 16, PL.ink, true); s.hl(64, 484, 420, PL.ink, 2);
    [['Header', 'Name, email, city'], ['Summary', 'One paragraph'], ['Experience', 'Two roles, five bullets'], ['Projects', 'One item'], ['Education', 'One item'], ['Skills', 'Five items']].forEach(([a, b], i) => {
      const y = 496 + i * 56; T(s, a, 88, y + 14, 15, PL.ink, true); T(s, b, 230, y + 15, 13, PL.mute); if (i < 5) s.hl(88, y + 50, 372, PL.rule);
    });
    s.r(520, 300, 440, 536, { fill: PL.ink, name: 'live code' }); T(s, 'main.tex, writing', 544, 318, 14, '#FFFFFF', true); live(s, 870, 314); s.hl(520, 350, 440, PL.inkRule, 2);
    code(s, 544, 368, { lh: 24, size: 12.5, f: M, c: PL.soft, num: '#4A5262', w: 416 }, { 13: { bar: PL.co, c: '#FFFFFF' } }, 13);
    s.r(888, 655, 9, 16, { fill: PL.co, name: 'cursor' });
    page(s, 1000, 300, 376, {}); s.r(1002, 300 + 376 * 1.414 * .55, 372, 376 * 1.414 * .45 - 2, { fill: PL.p2, name: 'not yet' });
    T(s, 'Typeset comes next', 1000, 300 + 376 * 1.414 * .55 + 100, 14, PL.mute, false, { w: 376, al: 'center' });
    s.done();
  }
  { // D-03 Editor — sections as stations
    const s = Screen('W4-03', 'Line map Editor', 'D · Line map — Editor, sections as stations', PL.p2);
    s.r(0, 0, 1440, 64, { fill: PL.ink }); T(s, 'AnyJob', 24, 20, 21, '#FFFFFF', true); T(s, 'Backend engineer, Stripe', 150, 24, 14, PL.dim);
    seg(s, 560, 12, 330, ['Edit', 'Compare', 'Code'], 0, { line: '#FFFFFF', txt: '#FFFFFF', onFill: '#FFFFFF', onTxt: PL.ink });
    B(s, 1244, 12, 172, 40, 'Export PDF', 'am');
    s.r(0, 64, 320, 836, { fill: PL.p3, name: 'line rail' }); s.vl(320, 64, 836, PL.ink, 2); T(s, 'Your resume', 24, 84, 18, PL.ink, true);
    const SECS = [['Header', 0], ['Summary', 1], ['Experience', 2], ['Projects', 0], ['Education', 0], ['Skills', 1]];
    s.r(48, 150, 10, 600, { fill: PL.co, name: 'line' });
    SECS.forEach(([l, n], i) => {
      const y = 150 + i * 120, on = l === 'Summary'; if (on) s.r(0, y - 20, 318, 82, { fill: PL.coSoft, name: 'active' });
      s.r(39, y - 6, 28, 28, { type: 'ellipse', fill: on ? PL.co : PL.p3, stroke: PL.ink, sw: 4, name: 'station' });
      T(s, l, 88, y - 4, 17, PL.ink, true); T(s, n ? (n === 1 ? 'One edit' : 'Two edits') : 'No edits', 88, y + 20, 13, n ? PL.ink2 : PL.mute);
      if (n) { s.r(250, y - 4, 40, 30, { fill: PL.am, name: 'count' }); T(s, String(n), 250, y + 2, 15, PL.ink, true, { w: 40, al: 'center' }); }
    });
    const rz = page(s, 360, 90, 520, { 3: { fill: PL.coSoft } }); s.r(rz.L - 7, rz.ys[3] - 3, 3, 17, { fill: PL.co });
    s.r(360, 840, 520, 44, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'ask' }); T(s, 'Tell the AI what to change', 378, 853, 14, PL.mute); B(s, 792, 845, 80, 34, 'Send', 'co');
    s.r(920, 64, 520, 836, { fill: PL.ink, name: 'stop panel' }); T(s, 'Stop 2, Summary', 944, 86, 26, '#FFFFFF', true); T(s, 'One edit waiting', 944, 124, 13, PL.dim); s.hl(920, 152, 520, PL.inkRule, 2);
    const e = EDITS[0]; T(s, e.ln, 944, 172, 34, PL.am, true); T(s, e.chg, 1030, 178, 16, '#FFFFFF', true); T(s, e.w + ' words', 1300, 178, 16, PL.am, true, { w: 116, al: 'right' });
    diff(s, 944, 232, 472, e); B(s, 944, 376, 140, 44, 'Accept', 'paper'); B(s, 1096, 376, 100, 44, 'Skip', 'outW');
    s.hl(920, 448, 520, PL.inkRule); T(s, 'Next stop', 944, 470, 13, PL.dim); T(s, 'Experience, two edits', 944, 494, 18, '#FFFFFF', true);
    B(s, 944, 534, 220, 44, 'Go to next stop', 'outW');
    s.r(944, 800, 472, 76, { fill: PL.am, name: 'plate' }); T(s, 'Fits on one page', 964, 814, 20, PL.ink, true); T(s, 'Page 1 of 1 after these edits', 964, 844, 12, PL.ink2);
    s.done();
  }
}

// ═════════════════════ E · SIGNAGE — hanging station signs ═════════════════════
{
  const sign = (s, x, y, w, h, n, title, detail, fill, txt, numBg, numTxt) => {
    s.vl(x + 40, 64, y - 64, PL.ink, 2); s.vl(x + w - 40, 64, y - 64, PL.ink, 2);
    s.r(x, y, w, h, { fill, stroke: PL.ink, sw: 2, name: 'sign' }); s.r(x + 16, y + 16, h - 32, h - 32, { fill: numBg, name: 'number' });
    T(s, n, x + 16, y + h / 2 - 34, 60, numTxt, true, { w: h - 32, al: 'center' }); T(s, title, x + h, y + 26, 30, txt, true); T(s, detail, x + h, y + 72, 14, txt, false, { op: .85 });
  };
  { // E-01 Welcome
    const s = Screen('W5-01', 'Signage Welcome', 'E · Signage — Welcome', PL.paper); navTop(s);
    sign(s, 64, 120, 420, 128, '1', 'Import', '.docx  .pdf  .tex', PL.ink, '#FFFFFF', PL.am, PL.ink);
    sign(s, 510, 120, 420, 128, '2', 'Tailor', 'To the job you want', PL.co, '#FFFFFF', '#FFFFFF', PL.co);
    sign(s, 956, 120, 420, 128, '3', 'Export', 'PDF or LaTeX', PL.am, PL.ink, PL.ink, PL.am);
    T(s, 'Follow the signs\nto one page.', 64, 316, 72, PL.ink, true, { lh: 74, ls: -3 });
    T(s, 'Import, tailor, export. The AI does\nthe rewriting in between.', 64, 488, 18, PL.ink2, false, { lh: 28 });
    B(s, 64, 568, 232, 52, 'Import a resume', 'co'); B(s, 310, 568, 184, 52, 'See a sample', 'out');
    const rz = page(s, 920, 320, 420, { 3: { fill: PL.coSoft } }, { shadow: { c: '#0E121B44', y: 20, b: 40 } });
    s.r(700, rz.ys[3] - 26, 190, 56, { fill: PL.ink, name: 'sign' }); T(s, 'L6', 714, rz.ys[3] - 13, 22, PL.am, true); T(s, 'Tightened', 770, rz.ys[3] - 8, 14, '#FFFFFF', true);
    s.hl(890, rz.ys[3] + 2, rz.L - 896, PL.ink, 2);
    s.done();
  }
  { // E-02 Home — each application is a platform
    const s = Screen('W5-02', 'Signage Home', 'E · Signage — Home, each application a platform', PL.paper); navApp(s, 'Applications');
    T(s, 'Six jobs, six platforms.', 64, 96, 44, PL.ink, true, { ls: -2 }); seg(s, 856, 100, 520, ['All', 'Drafts', 'Sent', 'Interviews'], 0);
    [['Stripe', 'Backend engineer', 'v6', '91', 'Interview'], ['Notion', 'Product engineer', 'v3', '84', 'Live'], ['Razorpay', 'Senior backend', 'v2', '78', 'Draft'],
      ['Figma', 'Infra engineer', 'v4', '88', 'Sent'], ['Zerodha', 'Platform engineer', 'v1', '72', 'Draft'], ['Atlassian', 'SDE II', 'v5', '80', 'Interview']].forEach((a, i) => {
      const x = 64 + (i % 3) * 444, y = 176 + Math.floor(i / 3) * 352, w = 424;
      s.r(x, y, w, 330, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'platform' }); s.r(x, y, w, 104, { fill: PL.ink, name: 'sign' });
      s.r(x + 14, y + 14, 76, 76, { fill: PL.am, name: 'number' }); T(s, String(i + 1), x + 14, y + 22, 52, PL.ink, true, { w: 76, al: 'center' });
      T(s, a[0], x + 108, y + 22, 26, '#FFFFFF', true); T(s, a[1], x + 108, y + 60, 14, PL.dim);
      T(s, 'Resume', x + 24, y + 128, 13, PL.mute); T(s, a[2], x + 24, y + 150, 22, PL.ink, true);
      T(s, 'Fit', x + 160, y + 128, 13, PL.mute); T(s, a[3], x + 160, y + 144, 40, PL.ink, true);
      s.hl(x, y + 208, w, PL.rule);
      if (a[4] === 'Interview') { s.r(x + 24, y + 236, 150, 36, { fill: PL.am, name: 'plate' }); T(s, 'Interview', x + 24, y + 245, 14, PL.ink, true, { w: 150, al: 'center' }); }
      else if (a[4] === 'Live') { live(s, x + 24, y + 241); T(s, 'Editing line 12', x + 104, y + 245, 13, PL.ink2); }
      else T(s, a[4], x + 24, y + 245, 15, a[4] === 'Draft' ? PL.ink : PL.mute, a[4] === 'Draft');
      B(s, x + w - 120, y + 232, 96, 42, 'Open', 'out');
    });
    s.done();
  }
  { // E-03 Editor — signs in the margin
    const s = Screen('W5-03', 'Signage Editor', 'E · Signage — Editor, edits as margin signs', PL.paper);
    s.r(0, 0, 1440, 64, { fill: PL.ink }); T(s, 'AnyJob', 24, 20, 21, '#FFFFFF', true); T(s, 'Backend engineer, Stripe', 150, 24, 14, PL.dim);
    seg(s, 560, 12, 330, ['Edit', 'Compare', 'Code'], 0, { line: '#FFFFFF', txt: '#FFFFFF', onFill: '#FFFFFF', onTxt: PL.ink });
    s.r(1196, 8, 220, 48, { fill: PL.am, name: 'exit sign' }); s.r(1204, 16, 32, 32, { fill: PL.ink }); T(s, '3', 1204, 21, 18, PL.am, true, { w: 32, al: 'center' }); T(s, 'Export PDF', 1250, 22, 16, PL.ink, true);
    s.r(0, 64, 400, 836, { fill: PL.p3, name: 'code' }); s.vl(400, 64, 836, PL.ink, 2); T(s, 'main.tex', 24, 82, 13, PL.ink, true); s.hl(0, 106, 400, PL.ink, 2);
    code(s, 24, 124, { lh: 24, size: 12.5, f: M, c: PL.ink, num: PL.dim, w: 376 }, { 6: { bg: PL.coSoft, bar: PL.co }, 7: { bg: PL.coSoft, bar: PL.co }, 12: { bar: PL.am }, 13: { bar: PL.am }, 19: { bar: PL.am }, 23: { bar: PL.dim } });
    const rz = page(s, 440, 90, 520, { 3: { fill: PL.coSoft }, 6: { fill: PL.amSoft }, 10: { fill: PL.amSoft }, 17: { fill: '#E9ECF1' } });
    const rows = [3, 6, 10, 17], ys = [120, 330, 470, 610];
    EDITS.forEach((e, i) => {
      const y = ys[i], ty = rz.ys[rows[i]] + 4, isLive = e.st === 'Live', h = isLive ? 186 : 112, fill = isLive ? PL.co : e.st === 'Done' ? PL.p2 : PL.ink, tx = e.st === 'Done' ? PL.mute : '#FFFFFF';
      s.hl(rz.R + 34, ty, 1000 - rz.R - 34 + 10, PL.ink, 2); s.vl(1010, Math.min(ty, y + 30), Math.abs(y + 30 - ty) + 2, PL.ink, 2); s.hl(1010, y + 30, 14, PL.ink, 2);
      s.r(1024, y, 392, h, { fill, stroke: PL.ink, sw: 2, name: 'sign' });
      s.r(1038, y + 14, 64, 34, { fill: e.st === 'Done' ? PL.rule : PL.am, name: 'number' }); T(s, e.ln, 1038, y + 21, 15, PL.ink, true, { w: 64, al: 'center' });
      T(s, e.sec, 1116, y + 14, 15, tx, true); T(s, e.chg, 1116, y + 36, 13, tx, false, { op: .9 }); T(s, e.st === 'Done' ? 'Done' : e.w + ' words', 1300, y + 16, 13, e.st === 'Done' ? PL.mute : PL.am, true, { w: 100, al: 'right' });
      if (isLive) { s.r(1038, y + 64, 364, 62, { fill: SG.deep, name: 'after' }); T(s, 'Backend engineer for payment\nsystems that stay up.', 1052, y + 74, 13, '#FFFFFF', false, { lh: 20 }); B(s, 1038, y + 138, 110, 36, 'Accept', 'paper'); B(s, 1158, y + 138, 80, 36, 'Skip', 'outW'); }
      else if (e.st === 'Next') B(s, 1038, y + 64, 110, 34, 'Preview', 'outW');
    });
    s.r(440, 840, 520, 44, { fill: PL.p3, stroke: PL.ink, sw: 2, name: 'ask' }); T(s, 'Tell the AI what to change', 458, 853, 14, PL.mute); B(s, 872, 845, 80, 34, 'Send', 'co');
    s.r(1024, 790, 392, 86, { fill: PL.am, stroke: PL.ink, sw: 2, name: 'plate' }); T(s, 'Fits on one page', 1044, 806, 20, PL.ink, true); T(s, 'Page 1 of 1 after these edits', 1044, 840, 12, PL.ink2);
    s.done();
  }
}
