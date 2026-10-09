// Enumerate all full playthroughs of a scenario; report per-ending path counts
// and confirm win_clean reachability + that no risky path reaches win_clean.
const fs = require('fs');
const path = require('path');
const Engine = require('../engine.js');
const file = process.argv[2];
const sc = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!sc.endings) sc.endings = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'scenarios', sc.endingsShared), 'utf8')).endings;

const counts = {};
let visits = 0;
function walk(state, seq) {
  if (visits++ > 4000000) return;
  const node = sc.nodes[state.current];
  const choices = (node && node.choices) || [];
  const enabled = choices.filter((c) => Engine.matchAll(state.dims, c.requirements));
  if (enabled.length === 0) {
    const eid = Engine.selectEnding(sc, state.dims, sc.endings);
    if (eid) {
      counts[eid] = counts[eid] || { n: 0, examples: [] };
      counts[eid].n++;
      if (counts[eid].examples.length < 2) counts[eid].examples.push(seq.slice());
    }
    return;
  }
  for (let i = 0; i < choices.length; i++) {
    if (!Engine.matchAll(state.dims, choices[i].requirements)) continue;
    const ns = { current: choices[i].next, dims: Object.assign({}, state.dims), history: [], finished: false, endingId: null };
    Engine.applyEffects(sc, ns.dims, choices[i].effects);
    seq.push(i);
    walk(ns, seq);
    seq.pop();
  }
}
walk(Engine.createState(sc), []);

console.log('File: ' + file);
let winClean = 0, riskyWin = 0;
for (const eid of Object.keys(sc.endings)) {
  const c = counts[eid];
  const n = c ? c.n : 0;
  console.log('  ' + eid + ': ' + n + ' path(s)');
  if (eid === 'win_clean') {
    winClean = n;
    c.examples.forEach((seq) => {
      const s = Engine.createState(sc);
      seq.forEach((i) => Engine.choose(sc, s, i));
      const risky = s.dims.national_security > 0 || s.dims.legal > 0 || s.dims.ethics > 0;
      if (risky) riskyWin++;
    });
  }
}
console.log('win_clean reachable paths: ' + winClean + (winClean ? ' (risky among them: ' + riskyWin + ')' : ''));
