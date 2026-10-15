#!/usr/bin/env node
/*
 * balance-report.js — 平衡报告
 * --------------------------------------------------------------------------
 * 枚举每个题材全部可达的 (节点, 各维度值) 终局状态，统计各结局占比。
 * 直接驱动真实的 engine.js，状态空间与 validate.js / test.js 认可的一致。
 *
 * 用法：
 *   node tools/balance-report.js                  → 跑 manifest 里全部题材
 *   node tools/balance-report.js scenarios/ai-fitness.json
 *   node tools/balance-report.js scenarios/ai-fitness.json scenarios/ai-avatar.json
 *
 * 用途：改 scenarios/*.json 之后跑一次，看九个结局的占比怎么动。
 * 验收标准见 docs/balance-recalibration-plan.md §8。
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const E = require(path.join(REPO, 'engine.js'));

const endings = JSON.parse(
  fs.readFileSync(path.join(REPO, 'scenarios/endings-core.json'), 'utf8')
).endings;

const argv = process.argv.slice(2);
const files = argv.length
  ? argv
  : JSON.parse(fs.readFileSync(path.join(REPO, 'scenarios/manifest.json'), 'utf8'))
      .scenarios.map(s => 'scenarios/' + s.file);

// 报告列顺序：失败结局在前，成功/妥协在后，与 endings-core 的声明顺序一致
const COLUMNS = [
  'boom_legal', 'boom_ns', 'boom_ethics',
  'bust_legal', 'bust_ethics', 'bust_ns',
  'boom_social', 'bust_social',
  'win_resilient', 'stalled', 'win_clean'
];

function sweep(scenario) {
  const start = E.createState(scenario);
  const seen = new Set();
  const stack = [start];
  const terminal = [];
  while (stack.length) {
    const c = stack.pop();
    const k = c.current + '|' + JSON.stringify(c.dims);
    if (seen.has(k)) continue;
    seen.add(k);
    if (c.finished) {
      terminal.push({ e: c.endingId, d: JSON.parse(JSON.stringify(c.dims)) });
      continue;
    }
    for (const ch of E.availableChoices(scenario, c)) {
      if (!ch.enabled) continue;
      const n = JSON.parse(JSON.stringify(c));
      E.choose(scenario, n, ch.index);
      stack.push(n);
    }
  }
  return terminal;
}

function pct(n, d) { return d ? ((100 * n / d).toFixed(2) + '%').padStart(8) : '       -'; }

// seed 必须是 0：strong/fail 用 Math.max 累加，seed=1 会让结果永远不小于 100%
let worst = { clean: 1, stall: 1, bmin: 99, strong: 0, fail: 0 };
const rows = [];

for (const f of files) {
  const s = JSON.parse(fs.readFileSync(path.join(REPO, f), 'utf8'));
  s.endings = endings;
  const T = sweep(s);
  const N = T.length;
  if (!N) { console.log(f + '  —— 无可达终局，跳过'); continue; }

  const m = {};
  T.forEach(t => { m[t.e] = (m[t.e] || 0) + 1; });

  const bmin = Math.min(...T.map(t => t.d.business));
  const low = T.filter(t => t.d.national_security <= 4 && t.d.legal <= 4 && t.d.ethics <= 4);
  const strong = low.filter(t => t.d.business >= 6).length;
  const fail = Object.keys(m)
    .filter(k => k.indexOf('boom') === 0 || k.indexOf('bust') === 0)
    .reduce((a, k) => a + m[k], 0);

  rows.push({ f, N, m, bmin, lowN: low.length, strong });

  worst.clean = Math.min(worst.clean, (m.win_clean || 0) / N);
  worst.stall = Math.min(worst.stall, (m.stalled || 0) / N);
  worst.bmin = Math.min(worst.bmin, bmin);
  worst.fail = Math.max(worst.fail, fail / N);
  if (low.length) worst.strong = Math.max(worst.strong, strong / low.length);
}

console.log('\n' + '='.repeat(96));
console.log('平衡报告  ' + new Date().toISOString().slice(0, 10) + '  （' + rows.length + ' 个题材）');
console.log('='.repeat(96));
for (const r of rows) {
  console.log('\n' + r.f + '   终局 ' + r.N + '   business 最小值 ' + r.bmin);
  for (const k of COLUMNS) {
    if (r.m[k] === undefined && (k === 'boom_social' || k === 'bust_social')) continue;
    console.log('   ' + k.padEnd(15) + pct(r.m[k] || 0, r.N));
  }
  console.log('   三线<=4 中 business>=6 :  ' +
    (r.lowN ? r.strong + '/' + r.lowN + '  (' + (100 * r.strong / r.lowN).toFixed(0) + '%)' : '-'));
}

console.log('\n' + '-'.repeat(96));
console.log('【验收】对照 docs/balance-recalibration-plan.md §8');
console.log('   business 终局最小值        现状 ' + String(worst.bmin).padStart(2) + '   目标 1-2');
console.log('   stalled 最低占比           现状 ' + (100 * worst.stall).toFixed(2) + '%   目标 3%-8%');
console.log('   win_clean 最低占比         现状 ' + (100 * worst.clean).toFixed(2) + '%   目标 0.2%-1%');
console.log('   三线<=4 中 business>=6    现状 ' + (100 * worst.strong).toFixed(0) + '%   目标 70%-80%');
console.log('   失败结局最高占比           现状 ' + (100 * worst.fail).toFixed(1) + '%   目标 80%-85%');
console.log('-'.repeat(96) + '\n');
