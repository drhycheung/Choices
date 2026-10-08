/*
 * Choices 冒烟测试（test.js）
 * 纯 Node 运行，不依赖浏览器。验证：场景校验通过 + 确定性因果（同序列必得同结局）。
 * 运行：node test.js
 */
const fs = require('fs');
const path = require('path');
const Engine = require('./engine.js');
const Validate = require('./validate.js');

const scenario = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'scenarios', 'student-startup.json'), 'utf8')
);

// 双语取值：v 可能是 {zh,en} 或纯字符串
function pick(v, lang) {
  if (v && typeof v === 'object' && (v.zh || v.en)) return v[lang] || v.zh;
  return v;
}

const res = Validate.validate(scenario);
console.log('=== 场景校验 ===');
console.log(res.ok ? '结果：通过 ✓' : '结果：未通过 ✗');
if (res.errors.length) console.log('错误：\n - ' + res.errors.join('\n - '));
if (res.warnings.length) console.log('警告：\n - ' + res.warnings.join('\n - '));

// 各节点选项索引：intro[0] -> overseas[0/1/2] -> data[0/1/2] -> ip[0/1] -> funding[0/1/2]
function play(seq) {
  const s = Engine.createState(scenario);
  seq.forEach((i) => Engine.choose(scenario, s, i));
  return s;
}
function dims(s) {
  return Object.keys(scenario.dimensions).map((k) => pick(scenario.dimensions[k].label, 'zh') + '=' + s.dims[k]).join(' ');
}

console.log('\n=== 确定性因果演示（相同选择序列 = 相同结局）===');
const cases = [
  ['全安全', [0, 0, 0, 0, 0]],
  ['技术外泄', [0, 2, 0, 0, 1]],
  ['法律纠纷', [0, 0, 1, 1, 1]],
  ['伦理争议', [0, 0, 1, 0, 2]],
  ['灰色地带', [0, 2, 0, 0, 0]]
];
let allOk = res.ok;
cases.forEach(([name, seq]) => {
  const s = play(seq);
  const e = Engine.getEnding(scenario, s.endingId);
  console.log(`[${name}] 结局：${e ? pick(e.title, 'zh') : '（无）'}  |  ${dims(s)}`);

  // 确定性：再跑一次应完全一致
  const s2 = play(seq);
  if (s2.endingId !== s.endingId) {
    console.log('  !! 确定性被破坏'); allOk = false;
  }
});

console.log('\n总判定：' + (allOk ? '全部通过 ✓' : '存在问题 ✗'));
process.exit(allOk ? 0 : 1);
