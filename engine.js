/*
 * Choices 核心引擎（engine.js）
 * --------------------------------------------------------------------------
 * 纯逻辑、无 DOM 依赖。可在浏览器与 Node 中运行（UMD 包装）。
 *
 * 设计目标（对应项目硬约束）：
 *  1. 静态站：本文件是普通 JS，被 player.js 在浏览器里直接 <script> 引入，无需构建。
 *  2. 确定性因果：选择 -> 确定性效果(effects) -> 维度状态 -> 状态门控结局。
 *     全程无随机数；相同选择序列永远得到相同结局，因果链可追溯。
 *  3. 可插拔数据包：场景是独立 JSON，引擎只认 schema，不认识任何具体内容。
 *
 * 注意：UI（渲染、事件）全部在 player.js，引擎只管状态机与因果计算。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ChoicesEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- 条件表达式解析与求值 ---------- */

  // 解析单个维度条件，如 ">=5" "<=2" "==0" ">3" "<10" "=0"
  function parseCondition(expr) {
    const m = String(expr).match(/^\s*(>=|<=|==|!=|>|<|=)\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (!m) throw new Error('非法条件表达式: ' + expr);
    const op = m[1] === '=' ? '==' : m[1];
    return { op: op, value: parseFloat(m[2]) };
  }

  function evalCondition(dimValue, cond) {
    switch (cond.op) {
      case '>=': return dimValue >= cond.value;
      case '<=': return dimValue <= cond.value;
      case '>':  return dimValue > cond.value;
      case '<':  return dimValue < cond.value;
      case '==': return dimValue === cond.value;
      case '!=': return dimValue !== cond.value;
    }
    return false;
  }

  // 一组条件（AND）：所有维度表达式都满足才为真
  function matchAll(dims, conditions) {
    if (!conditions) return true;
    for (const key in conditions) {
      if (!evalCondition(dims[key] || 0, parseCondition(conditions[key]))) return false;
    }
    return true;
  }

  /* ---------- 维度状态辅助 ---------- */

  function dimBounds(scenario, key) {
    const def = (scenario.dimensions && scenario.dimensions[key]) || {};
    const min = (typeof def.min === 'number') ? def.min : 0;
    const max = (typeof def.max === 'number') ? def.max : 999;
    return { min: min, max: max };
  }

  function clampDim(scenario, key, val) {
    const b = dimBounds(scenario, key);
    if (val < b.min) return b.min;
    if (val > b.max) return b.max;
    return val;
  }

  /* ---------- 状态创建 ---------- */

  function createState(scenario) {
    const dims = {};
    for (const k in scenario.dimensions) dims[k] = scenario.dimensions[k].initial || 0;
    return {
      current: scenario.start,   // 当前节点 id
      dims: dims,                // 各维度当前值
      history: [],              // 因果轨迹（决策记录）
      finished: false,
      endingId: null
    };
  }

  // 应用确定性效果，返回本次实际生效的增量（用于轨迹展示）
  function applyEffects(scenario, dims, effects) {
    const applied = {};
    if (!effects) return applied;
    for (const k in effects) {
      const before = dims[k] || 0;
      const after = clampDim(scenario, k, before + effects[k]);
      dims[k] = after;
      applied[k] = after - before;
    }
    return applied;
  }

  /* ---------- 结局选择 ---------- */

  // 在当前维度状态下，按声明顺序选第一个满足条件的结局；都不满足返回 null
  function selectEnding(scenario, dims, endingsMap) {
    const map = endingsMap || scenario.endings;
    if (!map) return null;
    for (const id in map) {
      if (matchAll(dims, map[id].condition)) return id;
    }
    return null;
  }

  function getEnding(scenario, id) {
    return (scenario.endings && scenario.endings[id]) || null;
  }

  // 当前节点是否为终局（无可选选项）
  function isTerminal(scenario, state) {
    const node = scenario.nodes[state.current];
    if (!node) return true;
    const choices = (node.choices || []).filter(function (c) {
      return matchAll(state.dims, c.requirements);
    });
    return choices.length === 0;
  }

  // 到达终局时结算结局
  function settleEnding(scenario, state) {
    const endingId = selectEnding(scenario, state.dims);
    state.finished = true;
    state.endingId = endingId; // 可能为 null（校验不充分时），由校验器兜底
    return endingId;
  }

  /* ---------- 选择推进 ---------- */

  // 返回当前节点下“可见且可点”的选项（已应用 requirements 门控）
  function availableChoices(scenario, state) {
    const node = scenario.nodes[state.current];
    if (!node || !node.choices) return [];
    return node.choices.map(function (c, i) {
      return {
        index: i,
        text: c.text,
        enabled: matchAll(state.dims, c.requirements)
      };
    });
  }

  function currentNode(scenario, state) {
    return scenario.nodes[state.current] || null;
  }

  // 做出第 index 个选择（确定性推进）
  function choose(scenario, state, index) {
    if (state.finished) throw new Error('故事已结束，无法继续选择');
    const node = scenario.nodes[state.current];
    if (!node) throw new Error('当前节点不存在: ' + state.current);
    const choices = node.choices || [];
    const choice = choices[index];
    if (!choice) throw new Error('选项索引越界: ' + index);

    // requirements 门控：不满足则视为非法操作
    if (!matchAll(state.dims, choice.requirements)) {
      throw new Error('该选项不满足前置条件，不可选');
    }

    // 确定性效果（无随机）
    const applied = applyEffects(scenario, state.dims, choice.effects);

    // 记录因果轨迹：哪一步、选了什么、维度如何变化
    // choiceIndex 保留原始索引，播放器可据此取回该选项的 why / 复盘等扩展字段
    state.history.push({
      nodeId: state.current,
      choiceText: choice.text,
      choiceIndex: index,
      effects: applied,
      dimsAfter: Object.assign({}, state.dims)
    });

    // 跳转
    if (!choice.next) throw new Error('选项缺少 next 目标: ' + choice.text);
    state.current = choice.next;

    // 若到达终局节点，结算结局
    if (isTerminal(scenario, state)) settleEnding(scenario, state);
    return state;
  }

  return {
    parseCondition: parseCondition,
    matchAll: matchAll,
    createState: createState,
    applyEffects: applyEffects,
    selectEnding: selectEnding,
    getEnding: getEnding,
    isTerminal: isTerminal,
    availableChoices: availableChoices,
    currentNode: currentNode,
    choose: choose
  };
});
