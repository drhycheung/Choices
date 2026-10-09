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
      groupRisk: '风险轨 · 愈低愈好',
      groupVenture: '创业轨 · 愈高愈好',
      whyPrefix: '为什么：',
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
      perfectBadge: '完美通关',
      perfectNote: '三条风险线全部为零，创业三格全部在 7 分以上——这是这个题材里唯一的一条路径。',
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
      groupRisk: 'Risk track · lower is better',
      groupVenture: 'Venture track · higher is better',
      whyPrefix: 'Why: ',
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
      perfectBadge: 'PERFECT RUN',
      perfectNote: 'All three risk lines at zero and all three venture boxes at 7 or above — the only path in this venture that does it.',
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

  // file:// 下读取内嵌副本：<script type="application/json" data-scenario-id="xxx">
  function readEmbeddedScenario(id) {
    var blocks = document.querySelectorAll('script[type="application/json"][data-scenario-id]');
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].getAttribute('data-scenario-id') === id) {
        try { return JSON.parse(blocks[i].textContent); } catch (e) { return null; }
      }
    }
    return null;
  }
  function readEmbeddedEndings() {
    var b = document.getElementById('embedded-endings');
    if (!b || !b.textContent.trim()) return null;
    try { return JSON.parse(b.textContent).endings; } catch (e) { return null; }
  }
  function readEmbeddedManifest() {
    var b = document.getElementById('embedded-manifest');
    if (!b || !b.textContent.trim()) return null;
    try { return JSON.parse(b.textContent); } catch (e) { return null; }
  }

  function showBanner(msg, kind) {
    var b = $('banner');
    b.textContent = msg;
    b.className = 'banner ' + (kind || 'info');
  }

  /* ============ 仪表盘（双轨：风险轨 / 创业轨） ============ */

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
    var alarm = higherIsRisk && ratio >= 0.5;   // 风险轨过半才报警；创业轨永不报警
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
    [['risk', UI[lang].groupRisk], ['venture', UI[lang].groupVenture]].forEach(function (g) {
      var keys = Object.keys(scenario.dimensions).filter(function (k) {
        return (scenario.dimensions[k].group || 'risk') === g[0];
      });
      if (!keys.length) return;
      var section = textEl('div', '', 'dim-group');
      section.appendChild(textEl('div', g[1], 'dim-group-title'));
      keys.forEach(function (k) { section.appendChild(renderDimRow(k)); });
      wrap.appendChild(section);
    });
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

  function onChoose(i) {
    try { ChoicesEngine.choose(scenario, state, i); }
    catch (e) { showBanner(UI[lang].actionError + e.message, 'error'); return; }
    renderDims();
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

  // sign: 1 只看把维度推高的步骤；-1 只看拉低的；0 两个方向都看（按绝对值排序）
  function topMoves(dimKeys, sign, limit) {
    if (!state || !state.history) return [];
    var out = [];
    state.history.forEach(function (h, idx) {
      var sum = 0, parts = [];
      dimKeys.forEach(function (k) {
        var d = h.effects && h.effects[k];
        if (!d) return;
        sum += d;
        parts.push({ k: k, d: d });
      });
      if (!parts.length) return;
      if (sign > 0 && sum <= 0) return;
      if (sign < 0 && sum >= 0) return;
      out.push({ step: idx + 1, text: pick(h.choiceText, lang), sum: sum, parts: parts });
    });
    out.sort(function (a, b) { return Math.abs(b.sum) - Math.abs(a.sum); });
    return out.slice(0, limit || 2);
  }

  function movesList(moves) {
    var ul = textEl('ul', '', 'attr-moves');
    moves.forEach(function (m) {
      var li = textEl('li', '', 'attr-move');
      li.appendChild(textEl('span', stepLabel(m.step), 'attr-step'));
      li.appendChild(textEl('span', m.text, 'attr-choice'));
      li.appendChild(textEl('span', (m.sum >= 0 ? '+' : '') + m.sum, 'attr-delta ' + (m.sum >= 0 ? 'up' : 'down')));
      ul.appendChild(li);
    });
    return ul;
  }

  // Lean Canvas 复盘：逐格列出「是哪几步把它改成了现在的样子」
  var CANVAS_BOX = {
    pmf: { zh: 'Canvas 1–4 · 客群、问题与方案', en: 'Canvas 1–4 · Customers, problem, solution' },
    business: { zh: 'Canvas 5–7 · 渠道、收入与成本', en: 'Canvas 5–7 · Channels, revenue, cost' },
    moat: { zh: 'Canvas 8–9 · 关键指标与不公平优势', en: 'Canvas 8–9 · Key metrics, unfair advantage' }
  };

  function canvasAttribution() {
    var keys = Object.keys(scenario.dimensions).filter(function (k) {
      return scenario.dimensions[k].group === 'venture';
    });
    if (!keys.length) return null;
    var box = textEl('div', '', 'attribution');
    box.appendChild(textEl('p', UI[lang].canvasAttrNote, 'attribution-note'));
    var ul = textEl('ul', '', 'attr-boxes');
    var any = false;
    keys.forEach(function (k) {
      var moves = topMoves([k], 0, 2);
      if (!moves.length) return;
      any = true;
      var li = textEl('li', '', 'attr-box');
      var label = CANVAS_BOX[k] ? CANVAS_BOX[k][lang] : pick(scenario.dimensions[k].label, lang);
      li.appendChild(textEl('strong', label, 'attr-box-name'));
      li.appendChild(movesList(moves));
      ul.appendChild(li);
    });
    return any ? (box.appendChild(ul), box) : null;
  }

  // 触发原因：风险是被哪几步抬起来的
  function riskAttribution() {
    var keys = Object.keys(scenario.dimensions).filter(function (k) {
      return scenario.dimensions[k].group === 'risk';
    });
    var moves = topMoves(keys, 1, 2);
    if (!moves.length) return null;
    var box = textEl('div', '', 'attribution');
    box.appendChild(textEl('p', UI[lang].riskAttrNote, 'attribution-note'));
    box.appendChild(movesList(moves));
    return box;
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
    shuffle.onclick = function () { loadAndStart(pickScenarioId(true)); };
    row.appendChild(restart);
    row.appendChild(shuffle);
    box.appendChild(row);

    box.classList.remove('hidden');
    $('stage').classList.add('hidden');
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
          var higherIsRisk = d.higherIsRisk !== false;
          var delta = h.effects[k];
          var bad = higherIsRisk ? delta > 0 : delta < 0;   // 风险维上升或创业维下降都算变坏
          chips.appendChild(textEl('span', pick(d.label, lang) + ' ' + (delta >= 0 ? '+' : '') + delta, 'chip' + (bad ? ' bad' : ' good')));
        });
        li.appendChild(chips);
      }

      if (choice && choice.why) {
        li.appendChild(textEl('div', UI[lang].whyPrefix + pick(choice.why, lang), 'trace-why'));
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
    $('ending').className = 'ending hidden';
    $('stage').classList.remove('hidden');
    $('trace-panel').classList.add('hidden');
    renderDims();
    renderNode();
  }

  function beginPlay() {
    if (!scenario.endings) scenario.endings = coreEndings;
    var res = ChoicesValidate.validate(scenario, { endings: coreEndings });
    if (res.errors.length) showBanner(UI[lang].validateError + res.errors.join(lang === 'zh' ? '；' : '; '), 'error');
    applyChrome();
    state = ChoicesEngine.createState(scenario);
    $('ending').className = 'ending hidden';
    $('stage').classList.remove('hidden');
    $('trace-panel').classList.add('hidden');
    renderDims();
    renderNode();
    updateStartCard();
  }

  // 随机抽取一个创业题材（这是全局唯一的随机点，且可用 ?scenario= 指定）
  function pickScenarioId(reroll) {
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
    for (var i = 0; i < manifest.scenarios.length; i++) if (manifest.scenarios[i].id === id) return manifest.scenarios[i];
    return null;
  }

  function updateStartCard() {
    var card = $('scenario-card');
    if (!card || !scenario) return;
    card.innerHTML = '';
    // 封面只给「中英对照的题材名 + 一句钩子」，企划简报留给进游戏后的开篇，
    // 否则开始画面被大段文字占满，反而盖住了 PRESS START。
    card.appendChild(biEl('div', scenario.title, 'scenario-card-title'));
    var m = metaOf(scenario.id);
    if (m && m.hook) card.appendChild(biEl('div', m.hook, 'scenario-card-hook'));
  }

  // 加载指定题材（http 下 fetch，file:// 下读内嵌副本）
  function loadAndStart(id) {
    var isFile = location.protocol === 'file:';
    if (isFile) {
      coreEndings = coreEndings || readEmbeddedEndings();
      var emb = readEmbeddedScenario(id);
      if (!emb) { showBanner(UI[lang].fileError + UI[lang].loadHint, 'error'); return; }
      scenario = emb;
      beginPlay();
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
      else renderNode();
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
    // 未显式指定 ?lang= 时，跟随浏览器语言：中文环境开局直接进中文，
    // 否则仍是英文（课堂演示可用 ?lang=zh / ?lang=en 锁定）。
    else if (navigator.language && navigator.language.toLowerCase().indexOf('zh') === 0) lang = 'zh';

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
    });

    var shuffleBtn = $('shuffle-btn');
    if (shuffleBtn) shuffleBtn.addEventListener('click', function () {
      if (!manifest) return;
      loadAndStart(pickScenarioId(true));
    });

    if (location.protocol === 'file:') {
      manifest = readEmbeddedManifest();
      if (!manifest) { showBanner(UI[lang].loadError + 'manifest' + UI[lang].loadHint, 'error'); return; }
      loadAndStart(pickScenarioId(false));
      return;
    }

    fetchJSON('scenarios/manifest.json', function (err, json) {
      if (err) { showBanner(UI[lang].loadError + err.message + UI[lang].loadHint, 'error'); return; }
      manifest = json;
      fetchJSON('scenarios/' + json.endings, function (e2, js2) {
        coreEndings = e2 ? {} : (js2.endings || {});
        loadAndStart(pickScenarioId(false));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
