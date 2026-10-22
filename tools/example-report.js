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

// The two text formats stamp the export time with toLocaleString(), so the
// timestamp would otherwise be rendered in whatever timezone the machine
// happens to be in, and the golden files in examples/ would change every time
// somebody in another timezone regenerates them. Pin the timezone so the
// files are the same on every machine. A student exporting in Hong Kong still
// sees their own local time in the browser; only this reference copy is fixed.
process.env.TZ = 'UTC';

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
// The report must list its sections in this order, with these numbers. The
// conclusion screen uses the same numbers, so "Section 3" means the same
// thing on screen and in the export (issue #35).
const SECTION_ORDER = [
  ['venture', '1. THE VENTURE'],
  ['ledger', '2. Score ledger'],
  ['trail', '3. Decision trail'],
  ['debrief', '4. Ending debrief']
];
function assertSectionOrder(report, prefix) {
  const at = SECTION_ORDER.map(function (pair) {
    return report.indexOf(prefix + pair[1]);
  });
  at.forEach(function (pos, i) {
    if (pos < 0) {
      throw new Error('the report is missing the section: ' + SECTION_ORDER[i][1]);
    }
    if (i > 0 && pos <= at[i - 1]) {
      throw new Error('the sections are out of order: ' + SECTION_ORDER[i][1] +
                      ' must come after ' + SECTION_ORDER[i - 1][1]);
    }
  });
  return at;
}
const docxText = docx.toString('utf8');
const mdAt = assertSectionOrder(md, '## ');
const docxAt = assertSectionOrder(docxText, '');
// The venture section carries a plain title. The opening card keeps its
// instruction ("READ THIS FIRST"), but that line is an instruction for the
// player at the start of the game, not a section name in the report, so it
// must not appear in either export. Checked exactly, not as a prefix: a
// prefix check would pass for the old, longer heading too.
const VENTURE_HEADING = '1. THE VENTURE';
if (md.indexOf('## ' + VENTURE_HEADING + '\n') < 0 ||
    md.indexOf('READ THIS FIRST') >= 0) {
  throw new Error('the Markdown report must head the venture section with the plain ' +
                  'title "' + VENTURE_HEADING + '"');
}
if (docxText.indexOf('<w:t xml:space="preserve">' + VENTURE_HEADING + '</w:t>') < 0 ||
    docxText.indexOf('READ THIS FIRST') >= 0) {
  throw new Error('the Word report must head the venture section with the plain ' +
                  'title "' + VENTURE_HEADING + '"');
}
// The outcome quadrant is the result of the run, so it goes at the front of
// the report, ahead of the first section (issue #33).
if (JSON.stringify(jsonData.endingQuadrant) !== JSON.stringify(expectedQuadrant) ||
    md.indexOf(quadrantLine) > mdAt[0] ||
    docxText.indexOf(quadrantLine) > docxAt[0] ||
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
