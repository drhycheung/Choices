/*
 * Choices 静态播放器（player.js）
 * --------------------------------------------------------------------------
 * 纯前端 UI：加载场景数据包 -> 引擎推进 -> 渲染叙事/选项/双轨仪表盘/结局/因果轨迹。
 *
 * 三条硬约束在 UI 层的体现：
 *  1. 静态站：无构建、无依赖；file:// 直接打开时读取 index.html 内嵌的场景副本。
 *  2. 确定性因果：UI 只做展示，不做任何随机；随机仅用于「开局随机抽一个创业题材」，
 *     玩法内部零随机——同一题材 + 同一串选择 = 同一结局。
 *  3. 可插拔数据包：题材由 scenarios/manifest.json 声明，结局复盘由共享文件提供。
 */
(function () {
  'use strict';

  var scenario = null;        // 当前题材（含 dimensions / nodes / endingFlavor）
  var coreEndings = null;     // 共享结局表（含详细复盘）
  var manifest = null;        // 题材清单
  var state = null;
  var lang = 'en';
  var busy = false;           // 防止连点：移动端按下反馈期间不接受第二次点击
  var pendingId = null;       // 已抽中但尚未加载完的题材（用于首屏先渲染题材卡）

  var UI = {
    zh: {
      traceTitle: '决策轨迹',
      traceDesc: '每一步选择如何同时改变风险与公司，以及为什么会这样变。',
      choicesHead: '你的选择',
      restart: '再玩一次',
      shuffle: '换一个题材',
      thisRound: '本局题材',
      briefTitle: '企划简报 · 先看清楚这门生意',
      briefProduct: '做什么',
      briefCustomer: '卖给谁',
      briefStanding: '现在走到哪',
      briefData: '会碰到什么数据',
      undefined: '未定义结局',
      undefinedDesc: '当前状态未匹配任何结局，场景需补全（见校验器）。',
      finalScore: '终局分数',
      brandSub: '文字交互式分支叙事模拟器',
      hudTitle: '双轨仪表盘 · DUAL-TRACK DASHBOARD',
      groupScope: '范围轨 · 能走多远',
      groupInstrument: '工具轨 · 什么在约束你',
      groupValue: '价值轨 · 愈高愈好',
      whyPrefix: '为什么：',
      actorPrefix: '谁该管：',
      actor: { design: '设计', policy: '公司政策', law: '法律' },
      stepPrefix: '第',
      stepSuffix: '步',
      locked: '未解锁',
      whyHeading: '为什么会触发这个结局',
      tradeoffHeading: '你做了什么取舍',
      stakeholdersHeading: '谁受到了影响',
      mitigationHeading: '本来可以怎么做',
      canvasHeading: '用 Lean Canvas 复盘',
      legalHeading: '法例与规范线索',
      footnote: '以上法律线索仅用于课堂讨论，请以最新条文为准。',
      canvasAttrNote: '这些格子是被下面这几步改动的',
      riskAttrNote: '风险是被这几步抬起来的',
      ledgerTitle: '分数总账 · 哪一项升了、哪一项降了',
      ledgerNote: '每一项从开局到终局的净变化，以及是哪几步把它推动的。正负号是分数的加减，颜色是这件事的好坏。',
      ledgerMovedBy: '改动来源（按幅度排序）',
      ledgerUntouched: '整局没有任何一步改变这一项',
      ledgerStart: '开局',
      ledgerFinal: '终局',
      exportBtn: '导出学习报告',
      exportTitle: '导出这一局的复盘报告',
      exportMd: '下载 Markdown 报告',
      exportJson: '下载 JSON 数据',
      exportDocx: '下载 Word 报告（.docx）',
      exportError: '无法生成 Word 文件：',
      exportNote: '报告含本局全部决策、每步的分数增减与理由、分数总账与结局复盘，可直接提交或打印。',
      exported: '已开始下载',
      resumedNote: '已恢复上一次未完成的这一局（第',
      resumedNoteEnd: '步）。接着玩即可，或点「重新开始」清空存档。',
      clearSaves: '清除全部存档',
      clearedNote: '已清除全部存档。',
      perfectBadge: '完美通关',
      perfectNote: '三条风险线全部为零，价值三格全部在 7 分以上——这是这个题材里唯一的一条路径。',
      footer: '核心引擎通用 · 场景为独立 JSON 数据包 · 纯静态站：可部署 GitHub Pages，亦可双击本地打开',
      actionError: '错误: ',
      loadError: '无法加载场景：',
      loadHint: '（请用静态服务器打开，例如 python -m http.server）',
      validateError: '场景校验未通过：',
      fileError: '无法通过 file:// 加载场景：未找到内嵌场景'
    },
    en: {
      traceTitle: 'Decision trail',
      traceDesc: 'How each choice moved risk and the business at the same time — and why.',
      choicesHead: 'Your choice',
      restart: 'Play again',
      shuffle: 'Another scenario',
      thisRound: 'This round',
      briefTitle: 'THE VENTURE · READ THIS FIRST',
      briefProduct: 'What it does',
      briefCustomer: 'Who buys it',
      briefStanding: 'Where it stands',
      briefData: 'Data it touches',
      undefined: 'Undefined ending',
      undefinedDesc: 'No ending matched the current state; the scenario needs completion (see validator).',
      finalScore: 'Final scores',
      brandSub: 'Interactive Branching Narrative Simulator',
      hudTitle: 'DUAL-TRACK DASHBOARD',
      groupScope: 'Scope · how far it reaches',
      groupInstrument: 'Instruments · what constrains you',
      groupValue: 'Value track · higher is better',
      whyPrefix: 'Why: ',
      actorPrefix: 'Who can act: ',
      actor: { design: 'design', policy: 'company policy', law: 'law' },
      stepPrefix: '',
      stepSuffix: '',
      locked: 'locked',
      whyHeading: 'Why this ending fired',
      tradeoffHeading: 'The trade-off you made',
      stakeholdersHeading: 'Who was affected',
      mitigationHeading: 'What you could have done',
      canvasHeading: 'Through the Lean Canvas',
      legalHeading: 'Legal and regulatory hooks',
      footnote: 'Legal pointers are for classroom discussion only; always check the current texts.',
      canvasAttrNote: 'These boxes were moved by these decisions',
      riskAttrNote: 'The risk was raised by these decisions',
      ledgerTitle: 'Score ledger — what went up, what went down',
      ledgerNote: 'Every dimension from its starting value to its final value, and which steps moved it. The sign is the arithmetic (+ / −); the colour is whether that change was good or bad for you.',
      ledgerMovedBy: 'Moved by (largest first)',
      ledgerUntouched: 'No step in this run changed it',
      ledgerStart: 'start',
      ledgerFinal: 'final',
      perfectBadge: 'PERFECT RUN',
      exportBtn: 'Export study report',
      exportTitle: 'Export this run for review',
      exportMd: 'Download Markdown report',
      exportJson: 'Download JSON data',
      exportDocx: 'Download Word report (.docx)',
      exportError: 'Could not build the Word file: ',
      exportNote: 'The report contains every decision, the score change and the reason behind each step, the score ledger and the ending debrief — ready to submit or print.',
      exported: 'Download started',
      resumedNote: 'Resumed your unfinished run (at step',
      resumedNoteEnd: '). Carry on, or press restart to clear the save.',
      clearSaves: 'Clear all saved runs',
      clearedNote: 'All saved runs cleared.',
      perfectNote: 'All three risk lines at zero and all three value boxes at 7 or above — the only path in this venture that does it.',
      footer: 'Universal engine · scenarios are standalone JSON data packs · pure static site: deploy to GitHub Pages or open this HTML directly',
      actionError: 'Error: ',
      loadError: 'Could not load the scenario: ',
      loadHint: ' (open it through a static server, e.g. python -m http.server)',
      validateError: 'Scenario validation failed: ',
      fileError: 'Cannot load the scenario over file://: no embedded scenario found'
    }
  };

  /* ============ 街机音效（Web Audio 合成；仅开场播放） ============ */
  var audioCtx = null;
  var muted = false;
  function ensureAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }
  function beep(freq, dur, type, when, vol) {
    if (!audioCtx || muted) return;
    var t = audioCtx.currentTime + (when || 0);
    var o = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function playStart() { ensureAudio(); beep(523, 0.09, 'square', 0); beep(659, 0.09, 'square', 0.10); beep(784, 0.12, 'square', 0.20); beep(1046, 0.18, 'square', 0.32); }
  // 选择时的轻点音（issue #8）：很短、很轻的一个软音，只用来确认"按到了"，
  // 不用方块波、音量压到 0.05，避免连续做十几个选择时变得嘈杂。
  function playClick() { ensureAudio(); beep(620, 0.04, 'triangle', 0, 0.05); }

  var TYPE = {
    zh: { success: '成功', fail: '失败', compromise: '待完善', unknown: '未知' },
    en: { success: 'Success', fail: 'Fail', compromise: 'Incomplete', unknown: 'Unknown' }
  };

  function $(id) { return document.getElementById(id); }
  function textEl(tag, txt, cls) {
    var el = document.createElement(tag);
    if (txt !== undefined && txt !== null) el.textContent = txt;
    if (cls) el.className = cls;
    return el;
  }
  function pick(v, l) {
    if (v && typeof v === 'object' && (v.zh || v.en)) return v[l || lang] || v.zh;
    return v;
  }

  /* ============ 数据加载：静态服务器 / file:// 内嵌双模式 ============ */

  function fetchJSON(p, cb) {
    fetch(p)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) { cb(null, json); })
      .catch(function (e) { cb(e); });
  }

  /* ---- 离线副本读取 ----
     index.html 只内嵌 manifest（~2KB），其余数据放在 embed/*.js，
     因为浏览器要解析完整个 HTML 才触发 DOMContentLoaded：把 284KB JSON 塞进
     index.html 会把首屏可交互时间拖到 1.5s 以上（实测 domInteractive 1493ms）。
     file:// 下不能 fetch 本地 JSON，但可以动态注入 <script src>（已实测），
     所以用普通 <script> 而非 ES module（module 在 file:// 下会被 CORS 拦掉）。 */

  // 动态注入 embed/<name>.js；注入后数据挂在 window.CHOICES_EMBEDDED 上。
  // 每个数据文件自带幂等初始化（见 tools/embed-scenarios.py），所以任何一个
  // 都可以是第一个被注入的，不依赖单独的引导文件。
  var embedCache = {};
  function injectScript(name, cb) {
    if (embedCache[name]) { cb(true); return; }
    var s = document.createElement('script');
    s.src = 'embed/' + name + '.js';
    s.async = false;
    s.onload = function () { embedCache[name] = true; cb(true); };
    s.onerror = function () { cb(false); };
    document.head.appendChild(s);
  }
  // 串行化：并发调用时，第二个请求会在第一个的数据真正写入 window 之前就读它
  // （embedCache[name] 已置位但脚本尚未执行完），于是 beginPlay 拿到空结局去校验，
  // 报「endings 缺少 condition」。排队执行可彻底避免这个竞态。
  var embedQueue = Promise.resolve();
  function loadEmbedScript(name, cb) {
    embedQueue = embedQueue.then(function () {
      return new Promise(function (resolve) {
        injectScript(name, function (ok) {
          if (!ok) { cb(null); resolve(); return; }
          var bucket = window.CHOICES_EMBEDDED;
          if (!bucket) { cb(null); resolve(); return; }
          cb(name === 'endings' ? bucket.endings : (bucket.scenarios || {})[name]);
          resolve();
        });
      });
    });
  }

  function readEmbeddedManifest() {
    var b = $('embedded-manifest');
    if (!b || !b.textContent.trim()) return null;
    try { return JSON.parse(b.textContent); } catch (e) { return null; }
  }

  function showBanner(msg, kind) {
    var b = $('banner');
    b.textContent = msg;
    b.className = 'banner ' + (kind || 'info');
  }

  /* ============ 仪表盘（双轨：风险轨 / 价值轨） ============ */

  function riskColor(ratio) {
    if (ratio <= 0.2) return '#2e9e5b';
    if (ratio <= 0.5) return '#e0a106';
    return '#d6453d';
  }

  // 正向维度（愈高愈好）时把比例反过来映射：分数高 -> 绿色
  function trackColor(val, max, higherIsRisk) {
    var ratio = Math.max(0, Math.min(1, max ? val / max : 0));
    return riskColor(higherIsRisk ? ratio : 1 - ratio);
  }

  function renderDimRow(key) {
    var d = scenario.dimensions[key];
    var val = state.dims[key] || 0;
    var max = (typeof d.max === 'number') ? d.max : 10;
    var higherIsRisk = d.higherIsRisk !== false;
    var ratio = Math.max(0, Math.min(1, max ? val / max : 0));
    var alarm = higherIsRisk && ratio >= 0.5;   // 风险轨过半才报警；价值轨永不报警
    var color = trackColor(val, max, higherIsRisk);

    var row = textEl('div', '', 'dim' + (alarm ? ' danger' : ''));
    var head = textEl('div', '', 'dim-head');
    head.appendChild(textEl('span', (d.icon ? d.icon + ' ' : '') + pick(d.label, lang), 'dim-label'));
    head.appendChild(textEl('span', val + ' / ' + max, 'dim-val'));
    row.appendChild(head);

    var track = textEl('div', '', 'dim-track');
    for (var i = 0; i < max; i++) {
      var seg = textEl('div', '', 'dim-seg');
      if (i < val) {
        seg.className = 'dim-seg on';
        seg.style.background = color;
        if (alarm) seg.style.boxShadow = '0 0 8px ' + color;
      }
      track.appendChild(seg);
    }
    row.appendChild(track);
    return row;
  }

  function renderDims() {
    var wrap = $('dims');
    wrap.innerHTML = '';
    groupOrder().forEach(function (g) {
      var keys = Object.keys(scenario.dimensions).filter(function (k) {
        return (scenario.dimensions[k].group || 'instrument') === g[0];
      });
      if (!keys.length) return;
      var section = textEl('div', '', 'dim-group');
      section.appendChild(textEl('div', g[1], 'dim-group-title'));
      keys.forEach(function (k) { section.appendChild(renderDimRow(k)); });
      wrap.appendChild(section);
    });
  }

  // 三族：范围（能走多远）/ 工具（什么在约束你）/ 创业（愈高愈好）。
  // showScope 供 GEL1032 隐藏国安线（该课程没有国安维度）。
  function groupOrder() {
    var GROUPS = [
      ['scope', UI[lang].groupScope],
      ['instrument', UI[lang].groupInstrument],
      ['value', UI[lang].groupValue]
    ];
    var showScope = scenario.showScope !== false;
    return GROUPS.filter(function (g) { return g[0] !== 'scope' || showScope; });
  }

  /* ============ 叙事与选项 ============ */

  function actTitle(node) {
    if (!node || !node.act || !scenario.acts) return null;
    return pick(scenario.acts[node.act], lang);
  }

  /* ---- 企划简报：开局先讲清楚「这门生意到底是什么」，再进情节 ----
   * 简报是场景数据里的 brief 字段。支持两种形态：
   *   结构化（推荐）：{ product, customer, standing, data } 四行，对应 Lean Canvas 的
   *   方案 / 客群 / 关键资源与现状 / 数据（风险源头）。
   *   纯字符串：老格式，直接整段渲染。
   */
  var BRIEF_ROWS = [
    ['product', 'briefProduct'],
    ['customer', 'briefCustomer'],
    ['standing', 'briefStanding'],
    ['data', 'briefData']
  ];

  /* 开始画面没有语言切换按钮（语言在进入后才有），所以那一屏的题材卡必须中英双行。
   * biEl：把 { zh, en } 字段渲染成上下两行，中文在上、英文在下。 */
  function biEl(tag, value, cls) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (typeof value === 'string') { el.appendChild(textEl('span', value, 'zh')); return el; }
    var zh = pick(value, 'zh');
    var en = pick(value, 'en');
    if (zh) el.appendChild(textEl('span', zh, 'zh'));
    if (en) el.appendChild(textEl('span', en, 'en'));
    return el;
  }

  function renderBrief() {
    if (!scenario || !scenario.brief) return null;
    var b = scenario.brief;
    var box = textEl('div', '', 'brief');
    box.appendChild(textEl('div', UI[lang].briefTitle, 'brief-title'));

    if (typeof b === 'string') {
      box.appendChild(textEl('div', b, 'brief-para'));
      return box;
    }
    BRIEF_ROWS.forEach(function (pair) {
      var v = b[pair[0]];
      if (!v) return;
      var row = textEl('div', '', 'brief-row');
      row.appendChild(textEl('span', UI[lang][pair[1]], 'brief-key'));
      row.appendChild(textEl('span', pick(v, lang), 'brief-val'));
      box.appendChild(row);
    });
    return box.children.length > 1 ? box : null;
  }

  function renderStage(node, withBrief) {
    var frag = document.createDocumentFragment();
    if (withBrief) {
      var brief = renderBrief();
      if (brief) frag.appendChild(brief);
    }
    frag.appendChild(textEl('div', pick(node.text, lang), 'node-text'));
    frag.appendChild(textEl('div', UI[lang].choicesHead, 'choices-head'));
    var cw = textEl('div', '', 'choices');
    ChoicesEngine.availableChoices(scenario, state).forEach(function (c) {
      var raw = (node.choices || [])[c.index];
      var btn = textEl('button', pick(c.text, lang), 'choice');
      btn.disabled = !c.enabled;
      if (!c.enabled && raw && raw.lockedHint) {
        btn.appendChild(textEl('span', UI[lang].locked + ' · ' + pick(raw.lockedHint, lang), 'choice-lock'));
      }
      // 触屏上 click 要等到手指离开才触发（约 100ms 延迟），
      // 所以在 pointerdown 时就给出按下反馈；推进仍由 click 负责。
      btn.addEventListener('pointerdown', function () {
        if (!btn.disabled) btn.classList.add('is-pressed');
      });
      btn.addEventListener('pointerup', function () { btn.classList.remove('is-pressed'); });
      btn.addEventListener('pointercancel', function () { btn.classList.remove('is-pressed'); });
      btn.onclick = function () { pressThenChoose(btn, c.index); };
      cw.appendChild(btn);
    });
    frag.appendChild(cw);
    return frag;
  }

  // 移动端没有 hover，若按下立刻翻页会让人怀疑自己有没有点到。
  // 这里给出 180ms 的按下反馈，让手指得到回应后再推进故事。
  function pressThenChoose(btn, index) {
    if (busy || state.finished) return;
    busy = true;
    playClick();
    btn.classList.add('is-pressed');
    setTimeout(function () {
      busy = false;
      onChoose(index);
    }, 180);
  }

  function renderNode() {
    var node = ChoicesEngine.currentNode(scenario, state);
    if (state.finished) { renderEnding(); return; }
    var bc = $('bilingual');
    bc.innerHTML = '';
    // 开局第一步：先把这门生意交代清楚，再讲情节。
    bc.appendChild(renderStage(node, state.history.length === 0));
  }

  // 每次做出选择后，立即把"改了什么、为什么"显示出来，让因果在学习的当下就可见
  function dimDeltaLabel(key, delta) {
    var d = scenario.dimensions[key];
    if (!d) return { bad: false, word: '' };
    var higherIsRisk = d.higherIsRisk !== false;
    var bad = higherIsRisk ? delta > 0 : delta < 0;   // 风险维上升或创业维下降都算变坏
    var w;
    if (higherIsRisk) w = delta > 0 ? (lang === 'zh' ? '（更糟）' : ' (worse)') : (delta < 0 ? (lang === 'zh' ? '（更稳）' : ' (safer)') : '');
    else w = delta > 0 ? (lang === 'zh' ? '（更好）' : ' (better)') : (delta < 0 ? (lang === 'zh' ? '（更弱）' : ' (weaker)') : '');
    return { bad: bad, word: w };
  }

  function renderFeedback() {
    var box = $('feedback');
    if (!box) return;
    if (!state.history.length) { box.classList.add('hidden'); box.innerHTML = ''; return; }
    var h = state.history[state.history.length - 1];
    var node = scenario.nodes[h.nodeId];
    var choice = (node && node.choices) ? node.choices[h.choiceIndex] : null;
    box.innerHTML = '';
    box.appendChild(textEl('div', (lang === 'zh' ? '刚刚的选择 · ' : 'Just chose · ') + stepLabel(state.history.length) + ' · ' + pick(h.choiceText, lang), 'fb-choice'));
    var keys = Object.keys(h.effects || {});
    if (keys.length) {
      var chips = textEl('div', '', 'fb-effects');
      keys.forEach(function (k) {
        var dl = dimDeltaLabel(k, h.effects[k]);
        chips.appendChild(textEl('span', pick(scenario.dimensions[k].label, lang) + ' ' + (h.effects[k] >= 0 ? '+' : '') + h.effects[k] + dl.word, 'chip' + (dl.bad ? ' bad' : ' good')));
      });
      box.appendChild(chips);
    }
    if (choice && choice.why) box.appendChild(textEl('div', UI[lang].whyPrefix + pick(choice.why, lang), 'fb-why'));
    if (choice && choice.actor && UI[lang].actor[choice.actor]) {
      box.appendChild(textEl('div', UI[lang].actorPrefix + UI[lang].actor[choice.actor], 'fb-actor'));
    }
    box.classList.remove('hidden');
  }

  function onChoose(i) {
    try { ChoicesEngine.choose(scenario, state, i); }
    catch (e) { showBanner(UI[lang].actionError + e.message, 'error'); return; }
    saveRun();
    renderDims();
    renderFeedback();
    renderNode();
  }

  function typeLabel(t) { return (TYPE[lang] && TYPE[lang][t]) || t || ''; }
  function stepLabel(n) { return lang === 'zh' ? '第 ' + n + ' 步' : 'Step ' + n; }

  /* ============ 结局 + 详细复盘 ============ */

  function debriefSection(title, body, extra) {
    if (!body) return null;
    var box = textEl('section', '', 'debrief');
    box.appendChild(textEl('h3', title, 'debrief-title'));
    box.appendChild(textEl('p', pick(body, lang), 'debrief-body'));
    if (extra) box.appendChild(extra);
    return box;
  }

  /* ---- 归因：把复盘的结论对回玩家真实走过的第几步（数据全部来自 history，不猜测） ---- */

  // 单个维度上按 |delta| 排序的改动来源。返回 [{ step, text, delta, act }]，只含该维度的实际增减。
  function dimMoves(dimKey, limit) {
    if (!state || !state.history) return [];
    var out = [];
    state.history.forEach(function (h, idx) {
      var d = h.effects && h.effects[dimKey];
      if (!d) return;                       // 这一步没碰这个维度
      var node = scenario.nodes[h.nodeId];
      out.push({ step: idx + 1, text: pick(h.choiceText, lang), delta: d, act: actTitle(node) });
    });
    out.sort(function (a, b) { return Math.abs(b.delta) - Math.abs(a.delta); });
    return out.slice(0, limit || 3);
  }

  /* 改动来源的一行：章节标签（若有）+ 步骤 + 选项文字 + 该维度的增减。
     章节标签是必要的——不同章节可能有字面完全相同的选项（如两次「不融资，靠订阅收入自然增长」），
     没有章节就无法分辨是哪一步。 */
  function moveRow(dimKey, m) {
    var dl = dimDeltaLabel(dimKey, m.delta);
    var li = textEl('li', '', 'attr-move');
    if (m.act) li.appendChild(textEl('span', m.act, 'attr-act'));
    li.appendChild(textEl('span', stepLabel(m.step), 'attr-step'));
    li.appendChild(textEl('span', m.text, 'attr-choice'));
    li.appendChild(textEl('span',
      (m.delta > 0 ? '+' : '') + m.delta + dl.word,
      'attr-delta ' + (dl.bad ? 'bad' : 'good')));
    return li;
  }

  // 该维度在本局的净变化 = 终局值 − 开局值（开局值取 schema 的 initial）
  function netChange(dimKey) {
    var d = scenario.dimensions[dimKey];
    if (!d) return 0;
    var init = (typeof d.initial === 'number') ? d.initial : (d.min || 0);
    return (state.dims[dimKey] || 0) - init;
  }

  /* 分数总账：六个维度逐行列出「开局 → 终局、净加减、好坏配色、是哪几步推动的」。
     这是结局页对「分数怎么变的」给出的完整答案，不再把风险三维加总成一个数字。 */
  function scoreLedger() {
    var box = textEl('section', '', 'debrief ledger');
    box.appendChild(textEl('h3', UI[lang].ledgerTitle, 'debrief-title'));
    box.appendChild(textEl('p', UI[lang].ledgerNote, 'ledger-note'));

    groupOrder().forEach(function (g) {
      var keys = Object.keys(scenario.dimensions).filter(function (k) {
        return (scenario.dimensions[k].group || 'instrument') === g[0];
      });
      if (!keys.length) return;

      var grp = textEl('div', '', 'ledger-group');
      grp.appendChild(textEl('div', g[1], 'dim-group-title'));
      var ul = textEl('ul', '', 'ledger-rows');

      keys.forEach(function (k) {
        var d = scenario.dimensions[k];
        var init = (typeof d.initial === 'number') ? d.initial : (d.min || 0);
        var finalVal = state.dims[k] || 0;
        var net = netChange(k);
        var dl = dimDeltaLabel(k, net);        // 方向好坏按 higherIsRisk 判定，与仪表盘一致
        var li = textEl('li', '', 'ledger-row');

        var head = textEl('div', '', 'ledger-head');
        head.appendChild(textEl('span', (d.icon ? d.icon + ' ' : '') + pick(d.label, lang), 'ledger-label'));
        head.appendChild(textEl('span',
          UI[lang].ledgerStart + ' ' + init + '  →  ' + UI[lang].ledgerFinal + ' ' + finalVal,
          'ledger-journey'));
        // 净变化：正负号 + 绝对值 + 好坏词 + 好坏配色（不再只用一个裸数字）
        head.appendChild(textEl('span',
          (net > 0 ? '+' : '') + net + dl.word,
          'ledger-net ' + (net === 0 ? 'flat' : (dl.bad ? 'bad' : 'good'))));
        li.appendChild(head);

        // 列出全部改动来源（不截断）：列出的每一步增减相加必须正好等于上面的净变化，
        // 否则学生核对总账时会发现"对不上"，误以为分数算错了。
        var moves = dimMoves(k, 99);
        if (!moves.length) {
          li.appendChild(textEl('div', UI[lang].ledgerUntouched, 'ledger-none'));
        } else {
          var mv = textEl('div', '', 'ledger-moves');
          mv.appendChild(textEl('span', UI[lang].ledgerMovedBy, 'ledger-moves-label'));
          var ml = textEl('ul', '', 'attr-moves');
          moves.forEach(function (m) { ml.appendChild(moveRow(k, m)); });
          mv.appendChild(ml);
          li.appendChild(mv);
        }
        ul.appendChild(li);
      });

      grp.appendChild(ul);
      box.appendChild(grp);
    });
    return box;
  }

  // Lean Canvas 复盘：逐格列出「是哪几步把它改成了现在的样子」
  var CANVAS_BOX = {
    pmf: { zh: 'Canvas 1–4 · 客群、问题与方案', en: 'Canvas 1–4 · Customers, problem, solution' },
    business: { zh: 'Canvas 5–7 · 渠道、收入与成本', en: 'Canvas 5–7 · Channels, revenue, cost' },
    moat: { zh: 'Canvas 8–9 · 关键指标与不公平优势', en: 'Canvas 8–9 · Key metrics, unfair advantage' }
  };

  function canvasAttribution() {
    var keys = Object.keys(scenario.dimensions).filter(function (k) {
      return scenario.dimensions[k].group === 'value';
    });
    if (!keys.length) return null;
    var box = textEl('div', '', 'attribution');
    box.appendChild(textEl('p', UI[lang].canvasAttrNote, 'attribution-note'));
    var ul = textEl('ul', '', 'attr-boxes');
    var any = false;
    keys.forEach(function (k) {
      // 逐维度取：这一格里被改动最多的那几步（价值轨分数越高越好，配色按好坏）
      var moves = dimMoves(k, 2);
      if (!moves.length) return;
      any = true;
      var li = textEl('li', '', 'attr-box');
      var label = CANVAS_BOX[k] ? CANVAS_BOX[k][lang] : pick(scenario.dimensions[k].label, lang);
      li.appendChild(textEl('strong', label, 'attr-box-name'));
      li.appendChild(dimMovesList(k, moves));
      ul.appendChild(li);
    });
    return any ? (box.appendChild(ul), box) : null;
  }

  // 风险归因：每条风险线各自列出「是哪几步把它推高的」，不再加总成一个数字。
  // 用 group !== 'value' 而不是 === 'risk'：国安线归在 scope 族，用 'risk' 会把它整个漏掉。
  function riskAttribution() {
    var keys = Object.keys(scenario.dimensions).filter(function (k) {
      return scenario.dimensions[k].group !== 'value';
    });
    var box = textEl('div', '', 'attribution');
    box.appendChild(textEl('p', UI[lang].riskAttrNote, 'attribution-note'));
    var ul = textEl('ul', '', 'attr-boxes');
    var any = false;
    keys.forEach(function (k) {
      // 只看把这条风险线推高的步骤（delta > 0）
      var moves = dimMoves(k, 8).filter(function (m) { return m.delta > 0; }).slice(0, 2);
      if (!moves.length) return;                // 这一条风险线整局都是 0
      any = true;
      var li = textEl('li', '', 'attr-box');
      var d = scenario.dimensions[k];
      li.appendChild(textEl('strong', (d.icon ? d.icon + ' ' : '') + pick(d.label, lang), 'attr-box-name'));
      li.appendChild(dimMovesList(k, moves));
      ul.appendChild(li);
    });
    if (!any) return null;
    box.appendChild(ul);
    return box;
  }

  // 单个维度的改动列表：章节 + 步骤 + 选项 + 该维度的增减（符号与好坏词/好坏色同时给出）
  function dimMovesList(dimKey, moves) {
    var ul = textEl('ul', '', 'attr-moves');
    moves.forEach(function (m) { ul.appendChild(moveRow(dimKey, m)); });
    return ul;
  }

  // 完美通关徽章：三条风险线全为零 + 创业三格全在 7 分以上（每个题材只有唯一一条路径）
  function isPerfectRun() {
    if (!state || !state.dims) return false;
    var keys = Object.keys(scenario.dimensions);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i], d = scenario.dimensions[k];
      if (d.higherIsRisk) { if (state.dims[k] !== d.min) return false; }
      else if (state.dims[k] < 7) return false;
    }
    return true;
  }

  /* ============ 导出学习报告（issue #4） ============
     纯静态站，没有后端：全部在浏览器里生成文件，用 Blob + <a download> 触发下载。
     两种格式：
       .md   给学生看/打印/提交作业——人可读的完整复盘叙事
       .json 给老师批改/做二次分析——机器可读的全量决策轨迹
     两者都必须只依赖玩家真实走过的 history，不掺任何重新计算的结论。 */

  function exportStamp() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }

  function exportBaseName() {
    return 'choices-' + (scenario ? scenario.id : 'run') + '-' + exportStamp();
  }

  // 每一步的完整明细，Markdown 与 JSON 共用同一份事实来源
  function exportSteps() {
    if (!state || !state.history) return [];
    return state.history.map(function (h, idx) {
      var node = scenario.nodes[h.nodeId];
      var choice = (node && node.choices) ? node.choices[h.choiceIndex] : null;
      var effects = [];
      Object.keys(h.effects || {}).forEach(function (k) {
        var d = scenario.dimensions[k];
        if (!d) return;
        var delta = h.effects[k];
        var dl = dimDeltaLabel(k, delta);
        effects.push({
          key: k,
          label: pick(d.label, lang),
          delta: delta,
          bad: dl.bad,
          word: dl.word.trim()
        });
      });
      return {
        step: idx + 1,
        act: actTitle(node) || '',
        nodeId: h.nodeId,
        nodeText: pick(node && node.text, lang),
        choiceText: pick(h.choiceText, lang),
        why: (choice && choice.why) ? pick(choice.why, lang) : '',
        actor: (choice && choice.actor && UI[lang].actor) ? UI[lang].actor[choice.actor] : '',
        effects: effects
      };
    });
  }

  // 分数总账：逐维度的开局/终局/净变化/改动来源
  function exportLedger() {
    if (!state) return [];
    return Object.keys(scenario.dimensions).map(function (k) {
      var d = scenario.dimensions[k];
      var init = (typeof d.initial === 'number') ? d.initial : (d.min || 0);
      var finalVal = state.dims[k] || 0;
      var net = finalVal - init;
      var dl = dimDeltaLabel(k, net);
      return {
        key: k,
        label: pick(d.label, lang),
        group: d.group || 'risk',
        higherIsRisk: d.higherIsRisk !== false,
        start: init,
        final: finalVal,
        net: net,
        netWord: dl.word.trim(),
        bad: dl.bad,
        movedBy: dimMoves(k, 99).map(function (m) {
          var mdl = dimDeltaLabel(k, m.delta);
          return { step: m.step, choiceText: m.text, delta: m.delta, word: mdl.word.trim(), bad: mdl.bad };
        })
      };
    });
  }

  // 导出用的企划简报：与开局渲染同源，避免两处各写一份。
  // 学生拿到报告时应当知道自己在玩哪门生意——issue #13。
  function exportBrief() {
    if (!scenario || !scenario.brief) return [];
    var b = scenario.brief;
    var rows = [];
    if (typeof b === 'string') {
      rows.push({ key: 'brief', label: UI[lang].briefTitle, text: b });
      return rows;
    }
    BRIEF_ROWS.forEach(function (pair) {
      var v = b[pair[0]];
      if (!v) return;
      rows.push({ key: pair[0], label: UI[lang][pair[1]], text: pick(v, lang) });
    });
    return rows;
  }

  // 一个增减值的「好坏」措辞。0 不是「变好」，是持平。
  // 分数总账（净变化）与每一步的效果表都用它，两处不再各写一遍。
  function verdictWord(delta, bad) {
    if (delta === 0) return lang === 'zh' ? '持平' : 'unchanged';
    return bad ? (lang === 'zh' ? '变差' : 'worse') : (lang === 'zh' ? '变好' : 'better');
  }

  function buildMarkdown() {
    var ending = ChoicesEngine.getEnding(scenario, state.endingId);
    var an = (ending && ending.analysis) || {};
    var steps = exportSteps();
    var ledger = exportLedger();
    var brief = exportBrief();
    var L = [];

    L.push('# ' + (lang === 'zh' ? '一念之差 · 本局复盘报告' : 'Choices · Run Report'));
    L.push('');
    L.push('**' + pick(scenario.title, lang) + '**  ');
    if (scenario.theme) L.push('*' + pick(scenario.theme, lang) + '*  ');
    L.push(lang === 'zh' ? '导出于 ' + new Date().toLocaleString('zh-CN')
                        : 'Exported ' + new Date().toLocaleString('en-GB'));
    if (ending) {
      L.push('');
      L.push((lang === 'zh' ? '**结局：' : '**Ending: ') + pick(ending.title, lang) + '**  ');
      L.push(lang === 'zh' ? '类型：' + typeLabel(ending.type) : 'Type: ' + typeLabel(ending.type));
    }
    L.push('');
    L.push('---');
    L.push('');

    // 企划简报：让学生在报告上就能看出自己玩的是哪门生意
    var CN = ['一', '二', '三', '四', '五', '六'];
    var sec = 0;
    function heading(zh, en) {
      sec++;
      L.push('## ' + (lang === 'zh' ? CN[sec - 1] + '、' + zh : sec + '. ' + en));
    }
    if (brief.length) {
      heading(UI[lang].briefTitle, UI[lang].briefTitle);
      L.push('');
      brief.forEach(function (r) {
        L.push('- **' + r.label + '**: ' + r.text);
      });
      L.push('');
      L.push('---');
      L.push('');
    }

    // 分数总账
    heading('分数总账', 'Score ledger');
    L.push('');
    L.push('| ' + (lang === 'zh' ? '维度' : 'Dimension') + ' | ' +
           (lang === 'zh' ? '开局 → 终局' : 'Start → Final') + ' | ' +
           (lang === 'zh' ? '净变化' : 'Net') + ' | ' +
           (lang === 'zh' ? '好坏' : 'Verdict') + ' |');
    L.push('| --- | --- | --- | --- |');
    ledger.forEach(function (r) {
      var verdict = verdictWord(r.net, r.bad);
      L.push('| ' + r.label + ' | ' + r.start + ' → ' + r.final + ' | ' +
             (r.net > 0 ? '+' : '') + r.net + ' | ' + verdict + ' |');
    });
    L.push('');

    // 决策链
    L.push('## ' + (lang === 'zh' ? CN[sec] + '、决策链（共 ' + steps.length + ' 步）' : (sec + 1) + '. Decision trail (' + steps.length + ' steps)')); sec++;
    L.push('');
    steps.forEach(function (s) {
      L.push('### ' + (lang === 'zh' ? '第 ' + s.step + ' 步' : 'Step ' + s.step) + (s.act ? ' · ' + s.act : ''));
      L.push('');
      if (s.nodeText) L.push('> ' + s.nodeText.replace(/\n+/g, ' ') + '');
      if (s.nodeText) L.push('');
      L.push('**' + (lang === 'zh' ? '你的选择：' : 'Your choice:') + '** ' + s.choiceText);
      L.push('');
      if (s.effects.length) {
        L.push('| ' + (lang === 'zh' ? '受影响维度' : 'Dimension') + ' | ' +
               (lang === 'zh' ? '增减' : 'Change') + ' | ' +
               (lang === 'zh' ? '好坏' : 'Verdict') + ' |');
        L.push('| --- | --- | --- |');
        s.effects.forEach(function (e) {
          // 增减为 0 时不能说「变好」：分数没动。这是每一步的效果表，
          // 与分数总账用同一套判断。
          L.push('| ' + e.label + ' | ' + (e.delta > 0 ? '+' : '') + e.delta + ' | ' +
                 verdictWord(e.delta, e.bad) + ' |');
        });
        L.push('');
      }
      if (s.why) {
        L.push('**' + UI[lang].whyPrefix.trim() + '** ' + s.why);
        L.push('');
      }
      if (s.actor) {
        L.push('**' + UI[lang].actorPrefix.trim() + '** ' + s.actor);
        L.push('');
      }
    });

    // 结局复盘
    if (ending) {
      L.push('---');
      L.push('');
      L.push('## ' + (lang === 'zh' ? CN[sec] + '、结局复盘' : (sec + 1) + '. Ending debrief')); sec++;
      L.push('');
      if (ending.text) { L.push(pick(ending.text, lang)); L.push(''); }
      var fl = scenario.endingFlavor && scenario.endingFlavor[state.endingId];
      if (fl) { L.push('*' + pick(fl, lang) + '*'); L.push(''); }
      var secs = [
        [lang === 'zh' ? '为什么会触发这个结局' : 'Why this ending fired', an.trigger],
        [lang === 'zh' ? '你做了什么取舍' : 'The trade-off you made', an.tradeoff],
        [lang === 'zh' ? '用 Lean Canvas 复盘' : 'Through the Lean Canvas', an.canvas],
        [lang === 'zh' ? '法例与规范线索' : 'Legal and regulatory hooks', an.legal]
      ];
      secs.forEach(function (pair) {
        if (!pair[1]) return;
        L.push('### ' + pair[0]);
        L.push('');
        L.push(pick(pair[1], lang));
        L.push('');
      });
      if (an.stakeholders && an.stakeholders.length) {
        L.push('### ' + (lang === 'zh' ? '谁受到了影响' : 'Who was affected'));
        L.push('');
        // 与 Word 版一致：用两列表格，不要破折号列表。
        L.push('| ' + (lang === 'zh' ? '谁' : 'Who') + ' | ' +
               (lang === 'zh' ? '受到什么影响' : 'Impact') + ' |');
        L.push('| --- | --- |');
        an.stakeholders.forEach(function (sh) {
          L.push('| ' + pick(sh.who, lang) + ' | ' + pick(sh.impact, lang) + ' |');
        });
        L.push('');
      }
      if (an.mitigation && an.mitigation.length) {
        L.push('### ' + (lang === 'zh' ? '本来可以怎么做' : 'What you could have done'));
        L.push('');
        an.mitigation.forEach(function (it, i) { L.push((i + 1) + '. ' + pick(it, lang)); });
        L.push('');
      }
      if (ending.reflection) {
        L.push('### ' + (lang === 'zh' ? '反思' : 'Reflection'));
        L.push('');
        L.push(pick(ending.reflection, lang));
        L.push('');
      }
    }

    L.push('---');
    L.push('');
    L.push('*' + (lang === 'zh'
      ? '本局无任何随机数：结局完全由上面这 ' + steps.length + ' 个选择决定。'
      : 'No randomness in this run: the ending is fully determined by the ' + steps.length + ' choices above.') + '*');
    return L.join('\n');
  }

  function buildJSON() {
    var ending = ChoicesEngine.getEnding(scenario, state.endingId);
    return JSON.stringify({
      game: 'Choices',
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      theme: scenario.theme || null,
      ventureBrief: exportBrief().reduce(function (acc, r) { acc[r.key] = r.text; return acc; }, {}),
      exportedAt: new Date().toISOString(),
      language: lang,
      endingId: state.endingId,
      endingTitle: ending ? ending.title : null,
      endingType: ending ? ending.type : null,
      perfect: isPerfectRun(),
      finalScores: exportLedger().reduce(function (acc, r) { acc[r.key] = r.final; return acc; }, {}),
      scoreLedger: exportLedger(),
      steps: exportSteps(),
      // 结局正文、场景专属 flavour、反思题：Markdown 与 Word 都会输出，
      // JSON 以前漏了，脚本读不到。保持 {zh,en} 原样，与 endingTitle 一致。
      endingText: ending ? (ending.text || null) : null,
      endingFlavor: (scenario.endingFlavor && state.endingId)
        ? (scenario.endingFlavor[state.endingId] || null) : null,
      endingReflection: ending ? (ending.reflection || null) : null,
      debrief: ending ? ending.analysis : null
    }, null, 2);
  }

  /* ---- .docx 导出（issue #14） ----
     .docx 不是文本格式，而是一个 ZIP 包（OOXML），所以现有的 Blob 下载路径用不上：
     浏览器没有内置的 ZIP 写入器（DecompressionStream 只能读不能写）。
     这里手写一个「不压缩」的 ZIP 写入器——ZIP 的 stored 模式是合法格式，
     Word / Pages / LibreOffice 都能打开，而且不需要任何外部依赖，
     离线副本（file:// 双击打开）也照常可用。 */

  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function utf8(str) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
    var out = [], i, c;
    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F));
      else out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F));
    }
    return new Uint8Array(out);
  }

  // files: [{ name, data: Uint8Array }] → ZIP（stored，无压缩）
  function zipStore(files) {
    var parts = [], central = [], offset = 0;
    files.forEach(function (f) {
      var name = utf8(f.name);
      var crc = crc32(f.data);
      var local = new Uint8Array(30 + name.length);
      var dv = new DataView(local.buffer);
      dv.setUint32(0, 0x04034b50, true);   // local file header signature
      dv.setUint16(4, 20, true);           // version needed
      dv.setUint16(6, 0x0800, true);       // flags: UTF-8 filename
      dv.setUint16(8, 0, true);            // method 0 = stored
      dv.setUint16(10, 0, true);           // mod time
      dv.setUint16(12, 0x21, true);        // mod date (1996-01-01, fixed → 导出结果可复现)
      dv.setUint32(14, crc, true);
      dv.setUint32(18, f.data.length, true);
      dv.setUint32(22, f.data.length, true);
      dv.setUint16(26, name.length, true);
      dv.setUint16(28, 0, true);
      local.set(name, 30);
      parts.push(local, f.data);

      var cen = new Uint8Array(46 + name.length);
      var cv = new DataView(cen.buffer);
      cv.setUint32(0, 0x02014b50, true);   // central directory signature
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0x21, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, f.data.length, true);
      cv.setUint32(24, f.data.length, true);
      cv.setUint16(28, name.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      cen.set(name, 46);
      central.push(cen);
      offset += local.length + f.data.length;
    });

    var centralSize = central.reduce(function (a, c) { return a + c.length; }, 0);
    var end = new Uint8Array(22);
    var ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);     // end of central directory
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);

    var all = parts.concat(central, [end]);
    var total = all.reduce(function (a, c) { return a + c.length; }, 0);
    var out = new Uint8Array(total), pos = 0;
    all.forEach(function (c) { out.set(c, pos); pos += c.length; });
    return out;
  }

  function xmlEsc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function wp(text, style) {
    return '<w:p><w:pPr><w:pStyle w:val="' + (style || 'Normal') + '"/></w:pPr>' +
      '<w:r><w:t xml:space="preserve">' + xmlEsc(text) + '</w:t></w:r></w:p>';
  }

  function wtbl(rows) {
    var body = rows.map(function (r) {
      return '<w:tr>' + r.map(function (c) {
        return '<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr>' + wp(c, 'TableText') + '</w:tc>';
      }).join('') + '</w:tr>';
    }).join('');
    return '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="9638" w:type="dxa"/></w:tblPr>' +
      body + '</w:tbl>';
  }

  var DOCX_CT = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
    '</Types>';

  var DOCX_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>';

  var DOCX_DOC_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '</Relationships>';

  function docxStyles() {
    function st(id, name, sz, bold, rpr) {
      return '<w:style w:type="paragraph" w:styleId="' + id + '"><w:name w:val="' + name + '"/>' +
        '<w:pPr><w:spacing w:before="120" w:after="60"/></w:pPr>' +
        '<w:rPr>' + (bold ? '<w:b/>' : '') + (rpr || '') +
        '<w:sz w:val="' + sz + '"/></w:rPr></w:style>';
    }
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="PingFang SC"/><w:sz w:val="21"/></w:rPr></w:rPrDefault></w:docDefaults>' +
      st('Title', 'Title', '40', true) +
      st('Heading1', 'heading 1', '30', true) +
      st('Heading2', 'heading 2', '25', true) +
      st('Normal', 'Normal', '21', false) +
      st('Story', 'Story', '21', false, '<w:i/>') +
      st('Flavour', 'Flavour', '20', false, '<w:i/>') +
      st('Choice', 'Choice', '22', true) +
      st('TableText', 'Table Text', '19', false) +
      '<w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/>' +
      '<w:tblPr><w:tblBorders>' +
      ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(function (s) {
        return '<w:' + s + ' w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>';
      }).join('') + '</w:tblBorders></w:tblPr></w:style>' +
      '</w:styles>';
  }

  // 与 Markdown / JSON 同源：都只读玩家真实走过的 history，不重新计算结论。
  function buildDocxBytes() {
    var ending = ChoicesEngine.getEnding(scenario, state.endingId);
    var steps = exportSteps();
    var ledger = exportLedger();
    var brief = exportBrief();
    var B = [];

    // 一级标题的编号与 Markdown 完全一致（buildMarkdown 里的 CN / sec），
    // 两份报告要能逐节对照，所以编号和用词都取同一处。
    var CN = ['一', '二', '三', '四', '五', '六'];
    var sec = 0;
    function h1(zh, en) {
      sec++;
      B.push(wp(lang === 'zh' ? CN[sec - 1] + '、' + zh : sec + '. ' + en, 'Heading1'));
    }
    function h1n(zh, en) {           // 与 h1 相同，但 sec 由调用方自行加一（与 Markdown 同）
      B.push(wp(lang === 'zh' ? CN[sec] + '、' + zh : (sec + 1) + '. ' + en, 'Heading1'));
      sec++;
    }

    B.push(wp(lang === 'zh' ? '一念之差 · 本局复盘报告' : 'Choices · Run Report', 'Title'));
    B.push(wp(pick(scenario.title, lang), 'Heading2'));
    if (scenario.theme) B.push(wp(pick(scenario.theme, lang), 'Normal'));
    B.push(wp(lang === 'zh' ? '导出于 ' + new Date().toLocaleString('zh-CN')
                            : 'Exported ' + new Date().toLocaleString('en-GB'), 'Normal'));
    if (ending) {
      B.push(wp((lang === 'zh' ? '结局：' : 'Ending: ') + pick(ending.title, lang), 'Heading1'));
      B.push(wp((lang === 'zh' ? '类型：' : 'Type: ') + typeLabel(ending.type), 'Normal'));
    }

    if (brief.length) {
      h1(UI[lang].briefTitle, UI[lang].briefTitle);
      B.push(wtbl(brief.map(function (r) { return [r.label, r.text]; })));
    }

    h1('分数总账', 'Score ledger');
    B.push(wtbl([[lang === 'zh' ? '维度' : 'Dimension', lang === 'zh' ? '开局 → 终局' : 'Start → Final',
                  lang === 'zh' ? '净变化' : 'Net', lang === 'zh' ? '好坏' : 'Verdict']].concat(
      ledger.map(function (r) {
        return [r.label, r.start + ' → ' + r.final, (r.net > 0 ? '+' : '') + r.net,
                verdictWord(r.net, r.bad)];
      }))));

    h1n('决策链（共 ' + steps.length + ' 步）',
         'Decision trail (' + steps.length + ' steps)');
    steps.forEach(function (s) {
      // 与 Markdown 保持一致：先步数，再章节
      B.push(wp(stepLabel(s.step) + (s.act ? ' · ' + s.act : ''), 'Heading2'));
      if (s.nodeText) B.push(wp(s.nodeText.replace(/\s*\n+\s*/g, ' '), 'Story'));
      B.push(wp((lang === 'zh' ? '你的选择：' : 'Your choice: ') + s.choiceText, 'Choice'));
      if (s.effects && s.effects.length) {
        B.push(wtbl([[lang === 'zh' ? '受影响维度' : 'Dimension', lang === 'zh' ? '增减' : 'Change',
                      lang === 'zh' ? '好坏' : 'Verdict']].concat(s.effects.map(function (e) {
          return [e.label, (e.delta > 0 ? '+' : '') + e.delta, verdictWord(e.delta, e.bad)];
        }))));
      }
      if (s.why) B.push(wp(UI[lang].whyPrefix + s.why, 'Normal'));
      if (s.actor) B.push(wp(UI[lang].actorPrefix + s.actor, 'Normal'));
    });

    if (ending) {
      var an = ending.analysis || {};
      h1n('结局复盘', 'Ending debrief');
      if (ending.text) B.push(wp(pick(ending.text, lang), 'Story'));
      var fl = scenario.endingFlavor && scenario.endingFlavor[state.endingId];
      if (fl) B.push(wp(pick(fl, lang), 'Flavour'));

      var secs = [
        [lang === 'zh' ? '为什么会触发这个结局' : 'Why this ending fired', an.trigger],
        [lang === 'zh' ? '你做了什么取舍' : 'The trade-off you made', an.tradeoff],
        [lang === 'zh' ? '用 Lean Canvas 复盘' : 'Through the Lean Canvas', an.canvas],
        [lang === 'zh' ? '法例与规范线索' : 'Legal and regulatory hooks', an.legal]
      ];
      secs.forEach(function (pair) {
        if (!pair[1]) return;
        B.push(wp(pair[0], 'Heading2'));
        B.push(wp(pick(pair[1], lang), 'Normal'));
      });

      if (an.stakeholders && an.stakeholders.length) {
        B.push(wp(lang === 'zh' ? '谁受到了影响' : 'Who was affected', 'Heading2'));
        B.push(wtbl([[lang === 'zh' ? '谁' : 'Who', lang === 'zh' ? '受到什么影响' : 'Impact']].concat(
          an.stakeholders.map(function (sh) { return [pick(sh.who, lang), pick(sh.impact, lang)]; }))));
      }
      if (an.mitigation && an.mitigation.length) {
        B.push(wp(lang === 'zh' ? '本来可以怎么做' : 'What you could have done', 'Heading2'));
        an.mitigation.forEach(function (it, i) {
          B.push(wp((i + 1) + '. ' + pick(it, lang), 'Normal'));
        });
      }
      if (ending.reflection) {
        B.push(wp(lang === 'zh' ? '反思' : 'Reflection', 'Heading2'));
        B.push(wp(pick(ending.reflection, lang), 'Normal'));
      }
    }

    B.push(wp(lang === 'zh'
      ? '本局无任何随机数：结局完全由上面这 ' + steps.length + ' 个选择决定。'
      : 'No randomness in this run: the ending is fully determined by the ' +
        steps.length + ' choices above.', 'Flavour'));

    var doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:body>' + B.join('') +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>' +
      '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr>' +
      '</w:body></w:document>';

    return zipStore([
      { name: '[Content_Types].xml', data: utf8(DOCX_CT) },
      { name: '_rels/.rels', data: utf8(DOCX_RELS) },
      { name: 'word/_rels/document.xml.rels', data: utf8(DOCX_DOC_RELS) },
      { name: 'word/styles.xml', data: utf8(docxStyles()) },
      { name: 'word/document.xml', data: utf8(doc) }
    ]);
  }

  function downloadBytes(filename, mime, bytes) {
    var blob = new Blob([bytes], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function download(filename, mime, text) {
    var blob = new Blob([text], { type: mime + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function exportBox() {
    var box = textEl('div', '', 'export-box');
    box.appendChild(textEl('div', UI[lang].exportTitle, 'export-title'));
    box.appendChild(textEl('p', UI[lang].exportNote, 'export-note'));
    var row = textEl('div', '', 'export-actions');
    var md = textEl('button', UI[lang].exportMd, 'btn-export');
    md.onclick = function () { download(exportBaseName() + '.md', 'text/markdown', buildMarkdown()); };
    var js = textEl('button', UI[lang].exportJson, 'btn-export alt');
    js.onclick = function () { download(exportBaseName() + '.json', 'application/json', buildJSON()); };
    var dx = textEl('button', UI[lang].exportDocx, 'btn-export alt');
    dx.onclick = function () {
      try {
        downloadBytes(exportBaseName() + '.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          buildDocxBytes());
      } catch (e) { showBanner(UI[lang].exportError + e.message, 'error'); }
    };
    row.appendChild(md);
    row.appendChild(js);
    row.appendChild(dx);
    box.appendChild(row);
    return box;
  }

  function renderEnding() {
    var ending = ChoicesEngine.getEnding(scenario, state.endingId);
    var box = $('ending');
    box.className = 'ending type-' + (ending ? ending.type : 'unknown');
    box.innerHTML = '';

    if (!ending) {
      box.appendChild(textEl('h2', UI[lang].undefined));
      box.appendChild(textEl('p', UI[lang].undefinedDesc));
    } else {
      var tagRow = textEl('div', '', 'ending-tag-row');
      tagRow.appendChild(textEl('div', (lang === 'zh' ? '结局 · ' : 'Ending · ') + typeLabel(ending.type), 'ending-tag'));
      if (isPerfectRun()) {
        var badge = textEl('div', '★ ' + UI[lang].perfectBadge, 'perfect-badge');
        badge.title = UI[lang].perfectNote;
        tagRow.appendChild(badge);
      }
      box.appendChild(tagRow);
      if (isPerfectRun()) box.appendChild(textEl('p', UI[lang].perfectNote, 'perfect-note'));
      box.appendChild(textEl('h2', pick(ending.title, lang)));
      box.appendChild(textEl('p', pick(ending.text, lang)));
      var flavor = scenario.endingFlavor && scenario.endingFlavor[state.endingId];
      if (flavor) box.appendChild(textEl('p', pick(flavor, lang), 'ending-flavor'));

      var an = ending.analysis || {};
      var secs = [
        scoreLedger(),   // 分数总账放最前：先看清六项分数各自怎么变的，再读复盘
        debriefSection(UI[lang].whyHeading, an.trigger, riskAttribution()),
        debriefSection(UI[lang].tradeoffHeading, an.tradeoff),
        debriefSection(UI[lang].canvasHeading, an.canvas, canvasAttribution())
      ];

      if (an.stakeholders && an.stakeholders.length) {
        var s = textEl('section', '', 'debrief');
        s.appendChild(textEl('h3', UI[lang].stakeholdersHeading, 'debrief-title'));
        var ul = textEl('ul', '', 'stakeholders');
        an.stakeholders.forEach(function (sh) {
          var li = textEl('li', '', 'stakeholder');
          li.appendChild(textEl('strong', pick(sh.who, lang), 'sh-who'));
          li.appendChild(textEl('span', pick(sh.impact, lang), 'sh-impact'));
          ul.appendChild(li);
        });
        s.appendChild(ul);
        secs.push(s);
      }

      if (an.mitigation && an.mitigation.length) {
        var m = textEl('section', '', 'debrief');
        m.appendChild(textEl('h3', UI[lang].mitigationHeading, 'debrief-title'));
        var ol = textEl('ol', '', 'mitigations');
        an.mitigation.forEach(function (it) { ol.appendChild(textEl('li', pick(it, lang), 'mitigation')); });
        m.appendChild(ol);
        secs.push(m);
      }

      secs.push(debriefSection(UI[lang].legalHeading, an.legal));
      secs.forEach(function (s) { if (s) box.appendChild(s); });
      if (an.legal) box.appendChild(textEl('p', UI[lang].footnote, 'footnote'));

      if (ending.reflection) {
        box.appendChild(textEl('div', (lang === 'zh' ? '（反思）' : '(Reflection) ') + pick(ending.reflection, lang), 'reflection'));
      }
    }

    var row = textEl('div', '', 'ending-actions');
    var restart = textEl('button', UI[lang].restart, 'btn-restart');
    restart.onclick = restartGame;
    var shuffle = textEl('button', UI[lang].shuffle, 'btn-shuffle');
    // 换题材前先把当前这一局存下来，否则它会被 loadAndStart → beginPlay
    // 里的 createState 直接覆盖掉。L07 要求学生连跑两局，这一步不能丢。
    shuffle.onclick = function () { saveRun(); pendingId = pickScenarioId(true); loadAndStart(pendingId); };
    row.appendChild(restart);
    row.appendChild(shuffle);
    box.appendChild(row);

    // 导出学习报告：结局页最下方，与上面复盘一起构成可提交的材料
    if (state.finished) box.appendChild(exportBox());

    box.classList.remove('hidden');
    $('stage').classList.add('hidden');
    $('trace-panel').classList.remove('hidden');
    renderTrace();
  }

  /* ============ 决策轨迹：每一步 + 为什么这样变 ============ */

  function scoreSummary() {
    var parts = [];
    Object.keys(scenario.dimensions).forEach(function (k) {
      parts.push(pick(scenario.dimensions[k].label, lang) + '=' + (state.dims[k] || 0));
    });
    return parts.join(lang === 'zh' ? '，' : ', ');
  }

  function renderTrace() {
    var list = $('trace-list');
    list.innerHTML = '';

    state.history.forEach(function (h, idx) {
      var node = scenario.nodes[h.nodeId];
      var choice = (node && node.choices) ? node.choices[h.choiceIndex] : null;
      var li = textEl('li', '', 'trace-item');

      var act = actTitle(node);
      if (act) li.appendChild(textEl('div', act, 'trace-act'));
      li.appendChild(textEl('div', (lang === 'zh' ? UI[lang].stepPrefix + (idx + 1) + UI[lang].stepSuffix : 'Step ' + (idx + 1)) + ' · ' + pick(h.choiceText, lang), 'trace-choice'));

      var keys = Object.keys(h.effects || {});
      if (keys.length) {
        var chips = textEl('div', '', 'trace-effects');
        keys.forEach(function (k) {
          var d = scenario.dimensions[k];
          if (!d) return;
          var delta = h.effects[k];
          var dl = dimDeltaLabel(k, delta);
          chips.appendChild(textEl('span', pick(d.label, lang) + ' ' + (delta >= 0 ? '+' : '') + delta + dl.word, 'chip' + (dl.bad ? ' bad' : ' good')));
        });
        li.appendChild(chips);
      }

      if (choice && choice.why) {
        li.appendChild(textEl('div', UI[lang].whyPrefix + pick(choice.why, lang), 'trace-why'));
      }
      if (choice && choice.actor && UI[lang].actor[choice.actor]) {
        li.appendChild(textEl('div', UI[lang].actorPrefix + UI[lang].actor[choice.actor], 'trace-actor'));
      }
      list.appendChild(li);
    });

    var fbox = $('trace-final');
    if (fbox) {
      fbox.classList.remove('hidden');
      $('trace-final-label').textContent = UI[lang].finalScore;
      $('trace-final-value').textContent = scoreSummary();
    }
  }

  /* ============ 启动流程 ============ */

  function restartGame() {
    state = ChoicesEngine.createState(scenario);
    clearRun();          // 重开是玩家明确的动作，所以这一局的存档也一并清掉，
                          // 否则下次进入会恢复一个「已重开」的局。
    $('ending').className = 'ending hidden';
    $('stage').classList.remove('hidden');
    $('trace-panel').classList.add('hidden');
    renderDims();
    renderNode();
    renderFeedback();
  }

  /* ---- 存档：一局必须活过一次「换题材」 ----
   L07 第 15 页要求学生跑两局：第一局用指定的题材，第二局换一个题材。
   而「换一个题材」这个按钮会直接开始新的一局，旧的一局随之消失——
   存档就是为这个场景存在的。
   键名：choices.run.<scenario id>；只存 state，不存 scenario 本身。 */

var SAVE_PREFIX = 'choices.run.';
var SAVE_VERSION = 1;

function saveKey() { return SAVE_PREFIX + (scenario ? scenario.id : 'run'); }

function saveRun() {
  if (!state || !scenario) return;
  // 只在 state 真的指向一个还存在节点时才存：场景被改过之后，
  // 指向已删除节点的存档会被丢弃，而不是恢复成一个坏状态。
  var node = scenario.nodes && scenario.nodes[state.current];
  if (!node) { clearRun(); return; }
  try {
    localStorage.setItem(saveKey(), JSON.stringify({
      v: SAVE_VERSION,
      savedAt: Date.now(),
      scenarioId: scenario.id,
      state: state
    }));
  } catch (e) { /* 隐私模式或配额满：存档失败不该影响正常游戏 */ }
}

function readRun() {
  try {
    var raw = localStorage.getItem(saveKey());
    if (!raw) return null;
    var saved = JSON.parse(raw);
    if (!saved || saved.v !== SAVE_VERSION || !saved.state) return null;
    var st = saved.state;
    if (!st.current || !scenario.nodes || !scenario.nodes[st.current]) return null;
    if (!st.dims) return null;
    return saved;
  } catch (e) { return null; }
}

function clearRun() {
  try { localStorage.removeItem(saveKey()); } catch (e) {}
}

function clearAllRuns() {
  try {
    var kill = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(SAVE_PREFIX) === 0) kill.push(k);
    }
    kill.forEach(function (k) { localStorage.removeItem(k); });
  } catch (e) {}
}

function restoreRun() {
  var saved = readRun();
  if (!saved) { clearRun(); return false; }
  state = saved.state;
  return true;
}

  function beginPlay() {
    if (!scenario.endings) scenario.endings = coreEndings;
    // 只做结构检查：可达性搜索要遍历整个状态空间，开局前同步跑会卡死页面。
    // 完整检查（无死路、每个结局可达）由 node validate.js 在开发期负责。
    var res = ChoicesValidate.validate(scenario, { endings: coreEndings, deep: false });
    if (res.errors.length) showBanner(UI[lang].validateError + res.errors.join(lang === 'zh' ? '；' : '; '), 'error');
    applyChrome();
    state = ChoicesEngine.createState(scenario);
    var restored = restoreRun();     // 有存档就用存档，而不是刚建好的新局
    $('ending').className = 'ending hidden';
    $('stage').classList.remove('hidden');
    $('trace-panel').classList.add('hidden');
    renderDims();
    renderNode();
    renderFeedback();
    updateStartCard();
    // 恢复了一局必须说出来：否则它看起来像 bug，学生会去点「重新开始」把它弄掉。
    if (restored && state.history && state.history.length) {
      showBanner(UI[lang].resumedNote + ' ' + state.history.length + UI[lang].resumedNoteEnd, 'info');
    }
  }

  // 随机抽取一个创业题材（这是全局唯一的随机点，且可用 ?scenario= 指定）
  function pickScenarioId(reroll) {
    if (!manifest || !manifest.scenarios || !manifest.scenarios.length) return null;
    var params = new URLSearchParams(location.search);
    var forced = params.get('scenario');
    if (forced && manifest.scenarios.some(function (s) { return s.id === forced; })) return forced;
    var pool = manifest.scenarios;
    // reroll 时排除当前题材，保证「换一个」真的换了一个
    if (reroll && scenario) {
      var filtered = pool.filter(function (s) { return s.id !== scenario.id; });
      if (filtered.length) pool = filtered;
    }
    return pool[Math.floor(Math.random() * pool.length)].id;
  }

  function metaOf(id) {
    if (!manifest || !manifest.scenarios) return null;   // manifest 尚未加载完（首屏 applyChrome 会先跑一次）
    for (var i = 0; i < manifest.scenarios.length; i++) if (manifest.scenarios[i].id === id) return manifest.scenarios[i];
    return null;
  }

  function updateStartCard() {
    var card = $('scenario-card');
    if (!card) return;
    // 封面只给「中英对照的题材名 + 一句钩子」，企划简报留给进游戏后的开篇，
    // 否则开始画面被大段文字占满，反而盖住了 PRESS START。
    var title = (scenario && scenario.title) ? scenario.title : (metaOf(pendingId) || {}).title;
    var hook = (scenario && metaOf(scenario.id) && metaOf(scenario.id).hook)
      ? metaOf(scenario.id).hook : (metaOf(pendingId) || {}).hook;
    if (!title) return;
    var sig = pick(title, 'zh') + '|' + pick(title, 'en') + '|' + pick(hook, 'zh');
    if (card.getAttribute('data-sig') === sig) return;   // 已渲染过，别反复清空重画
    card.setAttribute('data-sig', sig);
    card.innerHTML = '';
    card.appendChild(biEl('div', title, 'scenario-card-title'));
    if (hook) card.appendChild(biEl('div', hook, 'scenario-card-hook'));
  }

  // 加载指定题材（http 下 fetch，file:// 下按需注入 embed/<id>.js）
  function loadAndStart(id) {
    var isFile = location.protocol === 'file:';
    if (isFile) {
      loadEmbedScript(id, function (json) {
        if (!json) { showBanner(UI[lang].fileError + UI[lang].loadHint, 'error'); return; }
        scenario = json;
        if (coreEndings) { beginPlay(); return; }
        loadEmbedScript('endings', function (ends) {
          coreEndings = ends || {};
          beginPlay();
        });
      });
      return;
    }
    var m = metaOf(id);
    fetchJSON('scenarios/' + m.file, function (err, json) {
      if (err) { showBanner(UI[lang].loadError + err.message, 'error'); return; }
      scenario = json;
      if (!coreEndings) {
        fetchJSON('scenarios/' + manifest.endings, function (e2, js2) {
          coreEndings = e2 ? {} : (js2.endings || {});
          beginPlay();
        });
      } else beginPlay();
    });
  }

  function applyChrome() {
    var bs = $('brand-sub'); if (bs) bs.textContent = UI[lang].brandSub;
    var ft = $('app-footer'); if (ft) ft.textContent = UI[lang].footer;
    var ht = $('hud-title'); if (ht) ht.textContent = UI[lang].hudTitle;
    var tt = $('trace-title'); if (tt) tt.textContent = UI[lang].traceTitle;
    var td = $('trace-desc'); if (td) td.textContent = UI[lang].traceDesc;
    if (scenario) {
      var st = $('scenario-title'); if (st) st.textContent = pick(scenario.title, lang);
      var sth = $('scenario-theme'); if (sth) sth.textContent = pick(scenario.theme, lang);
    }
    updateStartCard();
  }

  function setLang(l) {
    lang = l;
    markToggles();
    applyChrome();
    if (!scenario) return;
    renderDims();
    if (state) {
      if (state.finished) renderEnding();
      else {
        renderNode();
        renderFeedback();
      }
    }
  }

  function markToggles() {
    var btns = document.querySelectorAll('#lang-toggle button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-lang') === lang);
    }
  }

  /* ============ 彩蛋（easter egg） ============
   * 桌面：开始画面按下 ↑↑↓↓←→←→BA（Konami 指令）
   * 手机：连点开场 LOGO 七次
   * 找到之后会在页眉留一颗 ★，并用 localStorage 记住。
   * 说明：彩蛋只做展示，不改动任何状态与结局，因此不影响确定性。
   */
  var KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  function playEggJingle() {
    ensureAudio();
    beep(659, 0.08, 'square', 0);
    beep(784, 0.08, 'square', 0.09);
    beep(1046, 0.08, 'square', 0.18);
    beep(1318, 0.10, 'square', 0.27);
    beep(1568, 0.22, 'square', 0.36);
  }

  function markEggStar() {
    var star = $('egg-star');
    if (star) star.classList.remove('hidden');
  }

  function openEgg() {
    var panel = $('egg-panel');
    if (!panel || !panel.classList.contains('hidden')) return;
    playEggJingle();
    panel.classList.remove('hidden');
    markEggStar();
    try { localStorage.setItem('choices.eggFound', '1'); } catch (e) { /* 隐私模式下忽略 */ }
  }

  function initEgg() {
    try { if (localStorage.getItem('choices.eggFound') === '1') markEggStar(); } catch (e) { /* noop */ }

    var seq = [];
    document.addEventListener('keydown', function (e) {
      var key = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
      seq.push(key);
      if (seq.length > KONAMI.length) seq.shift();
      if (seq.length === KONAMI.length && seq.every(function (k, i) { return k === KONAMI[i]; })) {
        seq = [];
        openEgg();
      }
    });

    var taps = 0, last = 0;
    var logo = document.querySelector('.start-logo');
    if (logo) {
      logo.addEventListener('click', function () {
        var now = Date.now();
        taps = (now - last < 1200) ? taps + 1 : 1;
        last = now;
        if (taps >= 7) { taps = 0; openEgg(); }
      });
    }

    var close = $('egg-close');
    if (close) close.addEventListener('click', function () { $('egg-panel').classList.add('hidden'); });
    var panel = $('egg-panel');
    if (panel) panel.addEventListener('click', function (e) { if (e.target === panel) panel.classList.add('hidden'); });
  }

  function init() {
    var params = new URLSearchParams(location.search);
    var langParam = params.get('lang');
    if (langParam === 'en' || langParam === 'zh') lang = langParam;
    // Default language is English. A Chinese-browser environment no longer
    // auto-switches to Chinese; pin a demo with ?lang=zh / ?lang=en, or use
    // the header toggle at runtime.

    document.querySelectorAll('#lang-toggle button').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
    });
    markToggles();
    applyChrome();
    initEgg();

    var soundBtn = $('sound-toggle');
    if (soundBtn) soundBtn.addEventListener('click', function () {
      muted = !muted;
      soundBtn.textContent = muted ? '🔇' : '🔊';
      if (!muted) ensureAudio();
    });

    var startBtn = $('start-btn');
    if (startBtn) startBtn.addEventListener('click', function () {
      ensureAudio();
      playStart();
      var s = $('start-screen'); if (s) s.classList.add('hidden');
      // 场景数据到这一刻才加载：首屏不必为它多等两次往返（issue #7）。
      if (!scenario && pendingId) loadAndStart(pendingId);
    });

    var shuffleBtn = $('shuffle-btn');
    if (shuffleBtn) shuffleBtn.addEventListener('click', function () {
      if (!manifest) return;
      saveRun();                  // 换题材不能毁掉还没跑完的一局
      scenario = null;            // 换题材要丢掉上一份
      pendingId = pickScenarioId(true);
      updateStartCard();
      if (!$('start-screen').classList.contains('hidden')) return;  // 还在封面就先不加载
      loadAndStart(pendingId);
    });

    // 共用的机房里需要能把存档清干净，所以给一个出口。
    var clearBtn = $('clear-saves-btn');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      clearAllRuns();
      state = null;
      if (scenario) state = ChoicesEngine.createState(scenario);
      showBanner(UI[lang].clearedNote, 'info');
    });

    if (location.protocol === 'file:') {
      // 首屏只读内嵌 manifest（~2KB）——题材卡的内容全在里面（title + hook），
      // 不需要任何场景数据就能画出来。场景与结局等玩家真的按下 START 再加载。
      manifest = readEmbeddedManifest();
      if (!manifest) { showBanner(UI[lang].loadError + 'manifest' + UI[lang].loadHint, 'error'); return; }
      pendingId = pickScenarioId(false);
      if (!pendingId) { showBanner(UI[lang].loadError + 'manifest' + UI[lang].loadHint, 'error'); return; }
      updateStartCard();
      return;
    }

    fetchJSON('scenarios/manifest.json', function (err, json) {
      if (err) { showBanner(UI[lang].loadError + err.message + UI[lang].loadHint, 'error'); return; }
      manifest = json;
      pendingId = pickScenarioId(false);
      if (!pendingId) { showBanner(UI[lang].loadError + 'manifest' + UI[lang].loadHint, 'error'); return; }
      updateStartCard();      // 封面立刻可读；场景同样等到 START 再取
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
