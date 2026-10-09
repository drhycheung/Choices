/*
 * Choices 冒烟测试（test.js）
 * 纯 Node 运行，不依赖浏览器。
 *
 * 验证三件事（对应项目硬约束）：
 *  A. 场景校验通过（因果完整、无死路、结局均可达）。
 *  B. 每个结局都能被某条选择序列触发（由测试自动搜索，不用手抄路径）。
 *  C. 确定性因果：同一题材 + 同一选择序列，重放必然得到同一结局（全程无随机）。
 *
 * 运行：node test.js
 */
const fs = require('fs');
const path = require('path');
const Engine = require('./engine.js');
const Validate = require('./validate.js');

const SCEN_DIR = path.join(__dirname, 'scenarios');
const manifest = JSON.parse(fs.readFileSync(path.join(SCEN_DIR, 'manifest.json'), 'utf8'));
const coreEndings = JSON.parse(fs.readFileSync(path.join(SCEN_DIR, manifest.endings), 'utf8')).endings;

function load(file) {
  const json = JSON.parse(fs.readFileSync(path.join(SCEN_DIR, file), 'utf8'));
  // 场景自身可声明结局，否则沿用共享复盘结局表
  if (!json.endings) json.endings = coreEndings;
  return json;
}

function pick(v, lang) {
  if (v && typeof v === 'object' && (v.zh || v.en)) return v[lang] || v.zh;
  return v;
}

// 深度优先搜索：为每个结局找出一条可行选择序列
function findPaths(scenario) {
  const found = {};
  const total = Object.keys(scenario.endings).length;
  const seen = {};

  function walk(state, seq) {
    if (Object.keys(found).length === total) return true;
    const node = scenario.nodes[state.current];
    const choices = (node && node.choices) || [];
    const enabled = choices.filter((c) => Engine.matchAll(state.dims, c.requirements));

    if (enabled.length === 0) {
      const eid = Engine.selectEnding(scenario, state.dims, scenario.endings);
      if (eid && !found[eid]) found[eid] = seq.slice();
      return Object.keys(found).length === total;
    }

    // 保持原索引，按 options 的实际下标回放
    for (let i = 0; i < choices.length; i++) {
      if (!Engine.matchAll(state.dims, choices[i].requirements)) continue;
      const ns = {
        current: choices[i].next,
        dims: Object.assign({}, state.dims),
        history: [], finished: false, endingId: null
      };
      Engine.applyEffects(scenario, ns.dims, choices[i].effects);
      const key = ns.current + '|' + JSON.stringify(ns.dims);
      if (seen[key]) continue;
      seen[key] = true;
      seq.push(i);
      if (walk(ns, seq)) return true;
      seq.pop();
    }
    return false;
  }

  walk(Engine.createState(scenario), []);
  return found;
}

function play(scenario, seq) {
  const s = Engine.createState(scenario);
  seq.forEach((i) => Engine.choose(scenario, s, i));
  return s;
}

let allOk = true;
let totalEndings = 0;

console.log('=== 一念之差 · Choices 回归测试 ===\n');
console.log('共享结局表: ' + manifest.endings + '（' + Object.keys(coreEndings).length + ' 个结局）\n');

manifest.scenarios.forEach(function (meta) {
  console.log('--- ' + meta.id + ' · ' + pick(meta.title, 'zh') + ' ---');
  const scenario = load(meta.file);

  const res = Validate.validate(scenario, { endings: coreEndings });
  if (!res.ok) {
    console.log('  校验未通过 ✗: ' + res.errors.join('; '));
    allOk = false;
    return;
  }
  if (res.warnings.length) {
    console.log('  警告: ' + res.warnings.join('; '));
  }
  console.log('  校验通过 ✓  最长决策链路 ' + res.maxDepth + ' 步');

  const paths = findPaths(scenario);
  Object.keys(scenario.endings).forEach(function (eid) {
    const seq = paths[eid];
    totalEndings++;
    if (!seq) {
      console.log('  ✗ 结局不可达: ' + eid);
      allOk = false;
      return;
    }
    const a = play(scenario, seq);
    const b = play(scenario, seq);   // 确定性：完全相同的序列必须完全一致
    const same = a.endingId === b.endingId && JSON.stringify(a.dims) === JSON.stringify(b.dims);
    const ok送达 = a.endingId === eid;
    if (!same || !ok送达) allOk = false;
    const title = pick(scenario.endings[eid].title, 'zh');
    console.log('  ' + (same && ok送达 ? '✓' : '✗') + ' ' + eid + ' → ' + title +
      '（' + seq.length + ' 步，重放一致=' + same + '）');
  });
  console.log('');
});

console.log('=== 总计：' + manifest.scenarios.length + ' 个题材 / ' + totalEndings + ' 个结局样本 ===');
console.log(allOk ? '全部通过 ✓' : '存在问题 ✗');
process.exit(allOk ? 0 : 1);
