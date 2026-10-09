/*
 * Choices 场景校验器（validate.js）
 * --------------------------------------------------------------------------
 * 纯逻辑、无 DOM 依赖，可在浏览器与 Node 中运行（UMD 包装）。
 *
 * 目的：用 AI 辅助写场景时，引擎无法保证作者“因果完整”。校验器在运行前
 * 证明三件事（对应项目硬约束“选择↔结局必须有确定性因果关系”）：
 *   A. 结构合法：start 存在、所有 next 指向真实节点、非终局节点有出口、
 *      结局条件引用合法维度与表达式。
 *   B. 无死路：每条可达路径最终都落在一个“合法结局”上（不会卡住或无结局）。
 *   C. 因果可达：每个声明过的结局，都存在至少一条选择序列能触发它。
 *
 * 用法（Node）：
 *   node validate.js scenarios/student-startup.json
 * 浏览器：ChoicesValidate.validate(scenario) -> { ok, errors[], warnings[] }
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./engine.js'));
  else root.ChoicesValidate = factory(root.ChoicesEngine);
})(typeof self !== 'undefined' ? self : this, function (Engine) {
  'use strict';

  // validate(scenario) 或 validate(scenario, { endings: <共享结局表> })
  // opts.endings 用于「多个场景共用一套结局」的情形（见 scenarios/endings-core.json）。
  function validate(scenario, opts) {
    const errors = [];
    const warnings = [];

    if (!scenario || typeof scenario !== 'object') {
      return { ok: false, errors: ['场景不是合法对象'], warnings: warnings };
    }

    const dims = scenario.dimensions || {};
    const nodes = scenario.nodes || {};
    const endings = (opts && opts.endings) || scenario.endings || {};

    /* ---- A. 结构合法 ---- */

    if (!scenario.start) errors.push('缺少 start（起始节点）');
    else if (!nodes[scenario.start]) errors.push('start 指向不存在的节点: ' + scenario.start);

    if (Object.keys(dims).length === 0) errors.push('未定义任何维度(dimensions)');
    for (const k in dims) {
      if (typeof dims[k].initial !== 'number') errors.push('维度缺少 initial: ' + k);
      if (typeof dims[k].min !== 'number' || typeof dims[k].max !== 'number') {
        errors.push('维度未定义 min/max（校验器需要有限范围做可达性搜索）: ' + k);
      }
      if (typeof dims[k].higherIsRisk !== 'boolean') {
        warnings.push('维度 ' + k + ' 未声明 higherIsRisk(true/false)，HUD 无法判断方向');
      }
      if (dims[k].group !== 'risk' && dims[k].group !== 'venture') {
        warnings.push('维度 ' + k + ' 未声明 group(risk/venture)，HUD 无法分组显示');
      }
    }

    for (const nid in nodes) {
      const node = nodes[nid];
      const choices = node.choices || [];
      if (choices.length === 0) continue; // 终局节点，无选项正常
      choices.forEach(function (c, i) {
        if (!c.next) errors.push('节点 ' + nid + ' 的选项[' + i + '] 缺少 next');
        else if (!nodes[c.next]) errors.push('节点 ' + nid + ' 的选项[' + i + '] 指向不存在的节点: ' + c.next);
        if (c.effects) {
          for (const dk in c.effects) {
            if (!(dk in dims)) errors.push('节点 ' + nid + ' 选项[' + i + '] 的 effects 引用了未定义维度: ' + dk);
          }
        }
        if (c.requirements) {
          for (const dk in c.requirements) {
            if (!(dk in dims)) errors.push('节点 ' + nid + ' 选项[' + i + '] 的 requirements 引用了未定义维度: ' + dk);
            try { Engine.parseCondition(c.requirements[dk]); }
            catch (e) { errors.push('节点 ' + nid + ' 选项[' + i + '] requirements 表达式错误: ' + e.message); }
          }
        }
        // 教学完整性：带影响的选项必须解释「为什么」；被锁定的选项必须提示解锁条件
        if (c.effects && !c.why) {
          warnings.push('节点 ' + nid + ' 选项[' + i + '] 有影响但缺少 why 解释（总结页需要说明因果）');
        }
        if (c.requirements && !c.lockedHint) {
          warnings.push('节点 ' + nid + ' 选项[' + i + '] 有解锁条件但缺少 lockedHint（玩家看不懂为何不可选）');
        }
      });
      if ((node.choices || []).length > 0 && !node.act) {
        warnings.push('节点 ' + nid + ' 未声明 act（章节标签）');
      }
    }

    for (const eid in endings) {
      const e = endings[eid];
      if (!e.condition) errors.push('结局 ' + eid + ' 缺少 condition');
      else {
        for (const dk in e.condition) {
          if (!(dk in dims)) errors.push('结局 ' + eid + ' 的 condition 引用了未定义维度: ' + dk);
          try { Engine.parseCondition(e.condition[dk]); }
          catch (err) { errors.push('结局 ' + eid + ' condition 表达式错误: ' + err.message); }
        }
      }
      if (!e.type) warnings.push('结局 ' + eid + ' 未声明 type(success/fail/compromise)');
      const an = e.analysis || {};
      ['trigger', 'tradeoff', 'stakeholders', 'mitigation', 'canvas'].forEach(function (f) {
        if (!an[f]) warnings.push('结局 ' + eid + ' 的复盘缺少 ' + f + '（总结页需要详细复盘）');
      });
    }

    if (errors.length > 0) {
      return { ok: false, errors: errors, warnings: warnings };
    }

    /* ---- B & C. 状态空间可达性搜索（BFS） ---- */
    // 状态 = (节点, 维度向量)。维度被钳制在 [min,max]，范围有限 -> 状态数有限。
    const startState = Engine.createState(scenario);
    const visited = {};
    const queue = [{ state: startState, depth: 0 }];
    const keyOf = function (st) { return st.current + '|' + JSON.stringify(st.dims); };
    visited[keyOf(startState)] = true;
    let maxDepth = 0;   // 最长决策链路：用于检查「每局至少十轮抉择」

    const reachableEndings = {};
    let deadEndPaths = 0;

    while (queue.length > 0) {
      const item = queue.shift();
      const st = item.state;
      maxDepth = Math.max(maxDepth, item.depth);
      const node = nodes[st.current];
      const choices = (node && node.choices) || [];
      const enabled = choices.filter(function (c, i) {
        return Engine.matchAll(st.dims, c.requirements);
      });

      if (enabled.length === 0) {
        // 到达终局：必须能选出一个合法结局，否则即为“死路/无结局”
        const eid = Engine.selectEnding(scenario, st.dims, endings);
        if (!eid) {
          deadEndPaths++;
          errors.push('存在无合法结局的终局状态 @节点 ' + st.current + ' 维度=' + JSON.stringify(st.dims));
        } else {
          reachableEndings[eid] = true;
        }
        continue;
      }

      enabled.forEach(function (c, i) {
        // 复制状态并推进
        const ns = {
          current: c.next,
          dims: Object.assign({}, st.dims),
          history: [],
          finished: false,
          endingId: null
        };
        Engine.applyEffects(scenario, ns.dims, c.effects);
        const k = keyOf(ns);
        if (!visited[k]) {
          visited[k] = true;
          queue.push({ state: ns, depth: item.depth + 1 });
        }
      });
    }

    // C. 每个声明结局都应可达
    for (const eid in endings) {
      if (!reachableEndings[eid]) warnings.push('结局不可达（没有任何选择序列能触发）: ' + eid);
    }
    if (deadEndPaths > 0) errors.push(deadEndPaths + ' 条路径落在无合法结局的状态（死路）');
    if (maxDepth < 10) warnings.push('最长决策链路只有 ' + maxDepth + ' 步，建议至少 10 轮抉择');

    return { ok: errors.length === 0, errors: errors, warnings: warnings, maxDepth: maxDepth };
  }

  return { validate: validate };
});

/* 命令行入口：
 *   node validate.js <scenario.json> [endings.json]
 * 场景声明了 endingsShared 时，请传入共享结局文件（多个题材共用一套结局）。 */
if (typeof require !== 'undefined' && require.main === module) {
  const fs = require('fs');
  const path = require('path');
  const p = process.argv[2];
  if (!p) { console.error('用法: node validate.js <scenario.json> [endings.json]'); process.exit(2); }
  try {
    const sc = JSON.parse(fs.readFileSync(p, 'utf8'));
    let opts = null;
    // 未显式传入 endings 时，自动沿用场景里 endingsShared 指向的共享结局文件
    const shared = process.argv[3] || sc.endingsShared;
    if (shared) {
      const sharedPath = path.isAbsolute(shared) ? shared : path.join(path.dirname(p), shared);
      opts = { endings: JSON.parse(fs.readFileSync(sharedPath, 'utf8')).endings };
    }
    const r = module.exports.validate(sc, opts);
    console.log(r.ok ? '校验通过 ✓' : '校验未通过 ✗');
    if (typeof r.maxDepth === 'number') console.log('最长决策链路: ' + r.maxDepth + ' 步');
    if (r.errors.length) console.log('错误:\n - ' + r.errors.join('\n - '));
    if (r.warnings.length) console.log('警告:\n - ' + r.warnings.join('\n - '));
    process.exit(r.ok ? 0 : 1);
  } catch (e) {
    console.error('读取/解析失败: ' + e.message);
    process.exit(2);
  }
}
