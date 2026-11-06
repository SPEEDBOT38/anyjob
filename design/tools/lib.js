// Shared screen factory for the v2 art directions. Each Screen() emits one command.batch step.
const steps = [];
let idx = 0;
const COLS = 3;

function Screen(num, name, label, bg, opts = {}) {
  const gx = (idx % COLS) * 1600, gy = Math.floor(idx / COLS) * 1100 + 60;
  idx++;
  const cmds = [];
  const push = (type, p, props) => cmds.push({ command: 'node.create', params: { type, ...p, props } });
  push('text', { text: `${num} · ${label}`, x: gx, y: gy - 44 }, { fontSize: 20, fontStyle: 'Bold', fill: '#222222' });
  push('frame', { name: `${num} ${name}`, x: gx, y: gy, width: 1440, height: 900 }, { fill: bg, clip: true, ...(opts.stroke ? { stroke: opts.stroke, strokeWeight: 2 } : {}) });
  const P = { $step: 1 };
  const s = {};
  const paint = (o) => o.grad ? { fills: [{ type: o.grad.t || 'linearGradient', stops: o.grad.stops, ...(o.grad.from ? { from: o.grad.from, to: o.grad.to } : {}) }] } : { fill: o.fill ?? '#FFFFFF' };
  s.r = (x, y, w, h, o = {}) => push(o.type || 'rectangle', { name: o.name || 'box', parent: P, x, y, width: w, height: h }, {
    ...paint(o),
    ...(o.stroke ? { stroke: o.stroke, strokeWeight: o.sw || 1 } : {}), ...(o.r != null ? { cornerRadius: o.r } : {}), ...(o.dash ? { dashes: o.dash } : {}),
    ...(o.op != null ? { opacity: o.op } : {}), ...(o.rot ? { rotation: o.rot } : {}),
    ...(o.shadow ? { effects: [{ type: 'dropShadow', color: o.shadow.c || '#00000033', offset: [0, o.shadow.y ?? 8], radius: o.shadow.b ?? 24 }] } : {}),
  });
  s.t = (text, x, y, o = {}) => push('text', { text, parent: P, x, y, ...(o.w ? { width: o.w } : {}) }, {
    fontSize: o.size || 12, fill: o.c || '#222222', ...(o.f ? { fontFamily: o.f.split("|")[0], ...(o.f.includes("|") ? { fontStyle: o.f.split("|")[1] } : {}) } : {}), ...(o.st ? { fontStyle: o.st } : {}),
    ...(o.lh ? { lineHeight: o.lh } : {}), ...(o.ls != null ? { letterSpacing: o.ls } : {}), ...(o.al ? { textAlign: o.al } : {}),
    ...(o.op != null ? { opacity: o.op } : {}), ...(o.rot ? { rotation: o.rot } : {}),
  });
  s.hl = (x, y, len, c, th = 1, op) => s.r(x, y, len, th, { fill: c, op, name: 'rule' });
  s.vl = (x, y, len, c, th = 1, op) => s.r(x, y, th, len, { fill: c, op, name: 'rule' });
  s.cross = (x, y, c, n = 5) => { s.r(x - n, y, n * 2 + 1, 1, { fill: c, name: 'cross' }); s.r(x, y - n, 1, n * 2 + 1, { fill: c, name: 'cross' }); };
  s.dimH = (x1, x2, y, label, c, o = {}) => { s.hl(x1, y, x2 - x1, c); s.vl(x1, y - 5, 11, c); s.vl(x2, y - 5, 11, c); s.t(label, x1, y - 18, { w: x2 - x1, al: 'center', size: 9, c, f: o.f, ls: 1 }); };
  s.dimV = (x, y1, y2, label, c, o = {}) => { s.vl(x, y1, y2 - y1, c); s.hl(x - 5, y1, 11, c); s.hl(x - 5, y2, 11, c); s.t(label, x + 8, y1 + 6, { size: 9, c, f: o.f, ls: 1 }); };
  // generic resume skeleton; pal: {paper, stroke, name, sec, line, add:[bg,ln,bar], del:[..], sel:[..]}
  s.paper = (x, y, w, h, pal, hl = {}, o = {}) => {
    const k = w / 440;
    s.r(x, y, w, h, { fill: pal.paper, stroke: pal.stroke, sw: pal.sw || 1, r: pal.r || 0, shadow: pal.shadow, name: 'paper' });
    s.r(x + w * .16, y + h * .055, w * .68, 20 * k, { fill: pal.name, r: 2, name: 'name' });
    s.r(x + w * .28, y + h * .055 + 32 * k, w * .44, 6 * k, { fill: pal.line, r: 2, name: 'contact' });
    for (let i = 0; i < 4; i++) {
      const sy = y + h * (0.2 + 0.19 * i);
      s.r(x + w * .07, sy, w * .26, 8 * k, { fill: pal.sec, r: 2, name: 'section' });
      const m = pal[hl[i]];
      if (m) s.r(x + w * .04, sy + 14 * k, w * .92, 54 * k, { fill: m[0], stroke: m[1], sw: pal.hsw || 2, r: pal.hr ?? 3, name: 'highlight' });
      const f = [1, .88, .95];
      for (let j = 0; j < 3; j++) s.r(x + w * .07, sy + 22 * k + j * 15 * k, w * .86 * f[j], 6 * k, { fill: m ? m[2] : pal.line, r: 2, name: 'line' });
    }
  };
  s.done = () => steps.push({ command: 'command.batch', params: { label: `${num} ${name}`, commands: cmds } });
  return s;
}
module.exports = { Screen, steps };
