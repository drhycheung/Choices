/*
 * 结局分布统计：枚举每个题材全部可达终局状态，按十一个结局计数。
 * 用法：node --stack-size=6000 tools/outcome-counts.js            > table.md
 *       node --stack-size=6000 tools/outcome-counts.js --json     > counts.json
 *   状态空间很大（每题几十万），必须加大栈，否则 Math.min(...arr) 之类会爆栈。
 * 产物不入库，改完 scenarios 重跑一次，README「How many outcomes each story
 *   can reach」那张表由这里生成。
 */
const fs = require('fs'), path = require('path');
const REPO = path.resolve(__dirname, '..');
const E = require(path.join(REPO, 'engine.js'));
const endings = JSON.parse(fs.readFileSync(path.join(REPO, 'scenarios/endings-core.json'), 'utf8')).endings;
const manifest = JSON.parse(fs.readFileSync(path.join(REPO, 'scenarios/manifest.json'), 'utf8'));

const files = manifest.scenarios.map(s => path.join(REPO, 'scenarios', s.file));
const out = {};
for (const f of files) {
  const s = JSON.parse(fs.readFileSync(f, 'utf8'));
  s.endings = endings;
  const st = E.createState(s), seen = new Set(), stack = [st], T = [];
  while (stack.length) {
    const c = stack.pop(), k = c.current + '|' + JSON.stringify(c.dims);
    if (seen.has(k)) continue; seen.add(k);
    if (c.finished) { T.push(c.endingId); continue; }
    for (const ch of E.availableChoices(s, c)) {
      if (ch.enabled) { const n = JSON.parse(JSON.stringify(c)); E.choose(s, n, ch.index); stack.push(n); }
    }
  }
  const m = {};
  T.forEach(e => m[e] = (m[e] || 0) + 1);
  out[s.id] = { total: T.length, counts: m, title: s.title.en };
  process.stderr.write('done ' + s.id + ' ' + T.length + '\n');
}
const asJson = process.argv.includes('--json');
if (asJson) {
  console.log(JSON.stringify(out, null, 1));
} else {
  const ORDER = ['boom_ns','bust_ns','boom_legal','bust_legal','boom_ethics','bust_ethics',
                 'boom_social','bust_social','win_resilient','stalled','win_clean'];
  const scen = Object.keys(out), grand = scen.reduce((a,s)=>a+out[s].total,0);
  console.log('| Ending | ' + scen.map(s=>'`'+s+'`').join(' | ') + ' | All six |');
  console.log('|---|' + '---|'.repeat(scen.length+1));
  for (const k of ORDER) {
    const cells = scen.map(s => {
      const c = out[s].counts[k] || 0;
      return c.toLocaleString('en-US') + ' (' + (100*c/out[s].total).toFixed(2) + '%)';
    });
    const g = scen.reduce((a,s)=>a+(out[s].counts[k]||0), 0);
    console.log('| ' + k + ' | ' + cells.join(' | ') + ' | ' +
                g.toLocaleString('en-US') + ' (' + (100*g/grand).toFixed(2) + '%) |');
  }
  console.log('| **Total** | ' + scen.map(s=>'**'+out[s].total.toLocaleString('en-US')+'**').join(' | ') +
              ' | **' + grand.toLocaleString('en-US') + '** |');
}