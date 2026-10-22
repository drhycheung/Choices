// Regenerate the example report set in examples/ from the real export code.
//
// The three files there are one playthrough of ai-hiring, exported in all three
// formats the player offers. They exist so a reader can see what a student
// actually receives without playing fourteen rounds, and so a change to the
// export code can be checked against them.
//
//   node tools/example-report.js          → rewrite examples/
//   node tools/example-report.js --check  → exit 1 if the files are out of date
//
// The run is fixed by PATH below: fourteen (nodeId, choice index) pairs. It
// ends at boom_ethics, which is a useful example because it exercises the
// stakeholder table, the actor line and a score change of zero.
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const OUT = path.join(REPO, 'examples');
const BASE = 'report-ai-hiring-boom_ethics';

const PATH_PICKS = [
  ['intro', 0],                    // 接下这笔试点合同，正式成立团队
  ['c1_segment', 0],               // 深耕中小科技企业的技术岗
  ['c1_problem', 1],               // 做 AI 综合评分与人才榜单
  ['c2_product', 1],               // 候选人搜索与评分榜单
  ['c2_keyresource', 0],           // 自建本地化词库
  ['c2_training', 0],              // 用书面授权的数据，接受样本量小
  ['ai-hiring_b1_clean', 1],       // 对外宣称合规，评分依据只在被投诉时给
  ['ai-hiring_b1_clean_money', 0], // 按席位订阅，不转售候选人数据
  ['ai-hiring_b1_clean_channel',0],// 靠 HR 社群慢慢铺
  ['ai-hiring_b1_clean_deploy', 1],// 不在候选人侧披露
  ['c3_harm', 1],                  // 先上线，适用人群写成重点院校技术岗
  ['ai-hiring_b2_paper', 0],       // 补做评分依据说明与人工复核
  ['ai-hiring_b2_paper_funding',0],// 接受本地产业基金
  ['c4_incident', 1]               // 委托第三方算法审计并公开摘要
];

const lang = 'en';
const scenario = JSON.parse(fs.readFileSync(path.join(REPO, 'scenarios/ai-hiring.json'), 'utf8'));
scenario.endings = JSON.parse(fs.readFileSync(path.join(REPO, 'scenarios/endings-core.json'), 'utf8')).endings;

// ---- replay the fixed run, through the real engine -------------------------
// The engine is used rather than adding the effects up here, because it clamps
// each dimension to its declared range. A step that would push a dimension past
// its maximum therefore contributes less than the raw effect, and the report
// shows the difference actually applied. Adding the numbers by hand would give
// a different run from the one a student plays.
const Engine = require(path.join(REPO, 'engine.js'));

const state = Engine.createState(scenario);
PATH_PICKS.forEach(function (step, i) {
  const [nodeId, idx] = step;
  if (state.current !== nodeId) {
    throw new Error('step ' + (i + 1) + ': expected to be at node ' + nodeId +
                    ' but the run is at ' + state.current);
  }
  Engine.choose(scenario, state, idx);   // throws if the choice is gated out
});
if (!state.finished || !state.endingId) {
  throw new Error('the run did not reach a settled ending');
}
const endingId = state.endingId;
const history = state.history;

// ---- drive the real export functions --------------------------------------
// player.js is a browser IIFE; take the export region and the two constant
// tables it needs, then supply the few globals the export path touches.
const src = fs.readFileSync(path.join(REPO, 'player.js'), 'utf8');
const uiRegion = src.slice(src.indexOf('  var UI = {'), src.indexOf('  };', src.indexOf('  var UI = {')) + 4);
const typeRegion = src.slice(src.indexOf('  var TYPE = {'), src.indexOf('};', src.indexOf('  var TYPE = {')) + 2);
const exportRegion = src.slice(
  src.indexOf('  function pick(v, l) {'),
  src.indexOf('  function download(filename, mime, text) {')
).replace(/^ {2}/gm, '');

// Only ChoicesEngine is genuinely missing: it is a separate file in the browser
// (<script src="engine.js">), not part of player.js. The functions the exporters
// call — pick, actTitle, dimDeltaLabel, typeLabel, stepLabel, dimMoves,
// isPerfectRun, exportBrief/Steps/Ledger — all come from the slice below.
const harness = `
var ChoicesEngine = ENGINE;
`;

// The export timestamp is the only thing that would change between runs, so the
// clock is frozen for the build. Passing Date as a parameter shadows the global
// inside the generated function; all three builders then stamp the same moment.
// The millisecond is the one the run was captured at, so the files reproduce the
// browser's output byte for byte.
const FIXED_MS = Date.parse('2026-10-16T09:12:35.421Z');
class FrozenDate extends Date {
  constructor(...args) { super(...(args.length ? args : [FIXED_MS])); }
  static now() { return FIXED_MS; }
}

const build = new Function(
  'lang', 'scenario', 'state', 'Date', 'ENGINE',
  typeRegion + '\n' + uiRegion + '\n' + harness + exportRegion +
  '\nreturn { buildMarkdown: buildMarkdown, buildDocxBytes: buildDocxBytes, buildJSON: buildJSON, getEndingQuadrant: getEndingQuadrant };'
)(lang, scenario, state, FrozenDate, Engine);

const md = build.buildMarkdown();
const docx = Buffer.from(build.buildDocxBytes());
// No trailing newline on the JSON: the downloaded file has none either, and
// these three files are meant to be exactly what a student receives.
const json = build.buildJSON();
const jsonData = JSON.parse(json);
const expectedQuadrant = {
  id: 'high_risk_strong_value',
  label: 'High risk × strong value · 😭 Boom-then-bust'
};
const quadrantLine = 'Outcome quadrant: ' + expectedQuadrant.label;
function assertSectionOrder(report, prefix) {
  const ending = report.indexOf(prefix + '3. Ending debrief');
  const trail = report.indexOf(prefix + '4. Decision trail');
  if (ending < 0 || trail < 0 || ending > trail) {
    throw new Error('the ending debrief must be Section 3 before the decision trail');
  }
  return ending;
}
const docxText = docx.toString('utf8');
const mdEnding = assertSectionOrder(md, '## ');
const docxEnding = assertSectionOrder(docxText, '');
if (JSON.stringify(jsonData.endingQuadrant) !== JSON.stringify(expectedQuadrant) ||
    md.indexOf(quadrantLine) < mdEnding ||
    docxText.indexOf(quadrantLine) < docxEnding ||
    json.indexOf('"endingQuadrant":') > json.indexOf('"scenarioId":')) {
  throw new Error('the exported reports do not identify the ending quadrant');
}

const savedDims = Object.assign({}, state.dims);
const riskKeys = Object.keys(scenario.dimensions).filter(function (key) {
  return scenario.dimensions[key].higherIsRisk !== false;
});
[
  [4, 6, 'low_risk_strong_value'],
  [4, 5, 'low_risk_weak_value'],
  [5, 6, 'high_risk_strong_value'],
  [5, 5, 'high_risk_weak_value']
].forEach(function (test) {
  riskKeys.forEach(function (key) { state.dims[key] = test[0]; });
  state.dims.business = test[1];
  const actual = build.getEndingQuadrant();
  if (!actual || actual.id !== test[2]) {
    throw new Error('quadrant threshold mismatch: expected ' + test[2] +
                    ', got ' + (actual && actual.id));
  }
});
Object.keys(state.dims).forEach(function (key) { state.dims[key] = savedDims[key]; });

const wanted = {
  [BASE + '.md']: Buffer.from(md, 'utf8'),
  [BASE + '.json']: Buffer.from(json, 'utf8'),
  [BASE + '.docx']: docx
};

const check = process.argv.includes('--check');
let stale = 0;
fs.mkdirSync(OUT, { recursive: true });

for (const [name, buf] of Object.entries(wanted)) {
  const p = path.join(OUT, name);
  const have = fs.existsSync(p) ? fs.readFileSync(p) : null;
  const same = have && have.equals(buf);
  if (!same) {
    stale++;
    console.log((check ? '  OUT OF DATE  ' : '  wrote        ') + 'examples/' + name);
    if (!check) fs.writeFileSync(p, buf);
  } else {
    console.log('  unchanged    examples/' + name);
  }
}

console.log('ending: ' + endingId + '   steps: ' + history.length + '   language: ' + lang);
if (check) {
  console.log(stale ? stale + ' file(s) out of date' : 'examples/ is up to date');
  process.exit(stale ? 1 : 0);
}
