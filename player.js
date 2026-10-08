/*
 * Choices 静态播放器（player.js）
 * --------------------------------------------------------------------------
 * 纯前端 UI：fetch 加载场景 JSON -> 引擎推进 -> 渲染节点/选项/风险条/结局/决策轨迹。
 * 支持中英双语：版面右上角开关随时切换中/英，整页内容（叙事/选项/结局/轨迹/界面）随切换即时更新。
 * 无任何构建步骤、无依赖。引擎逻辑全在 engine.js，校验在 validate.js。
 */
(function () {
  'use strict';

  var scenario = null;
  var state = null;
  var lang = 'zh';   // 当前界面语言：'zh' | 'en'

  // 界面固定文案（随语言切换）
  var UI = {
    zh: {
      traceTitle: '决策轨迹',
      traceDesc: '每一步选择如何改变风险，因果链一目了然。',
      choicesHead: '你的选择',
      restart: '重新开始',
      undefined: '未定义结局',
      undefinedDesc: '当前状态未匹配任何结局，场景需补全（见校验器）。',
      finalRisk: '最终风险'
    },
    en: {
      traceTitle: 'Decision Trail',
      traceDesc: 'How each choice changes the risks — the causal chain at a glance.',
      choicesHead: 'Your choice',
      restart: 'Restart',
      undefined: 'Undefined ending',
      undefinedDesc: 'No ending matched the current state; the scenario needs completion (see validator).',
      finalRisk: 'Final risk'
    }
  };
  var TYPE = {
    zh: { success: '成功', fail: '失败', compromise: '妥协', unknown: '未知' },
    en: { success: 'Success', fail: 'Fail', compromise: 'Compromise', unknown: 'Unknown' }
  };

  function $(id) { return document.getElementById(id); }
  function textEl(tag, txt, cls) {
    var el = document.createElement(tag);
    if (txt !== undefined && txt !== null) el.textContent = txt;
    if (cls) el.className = cls;
    return el;
  }

  // 双语取值：v 可能是 {zh,en} 或纯字符串（兼容性）
  function pick(v, lang) {
    if (v && typeof v === 'object' && (v.zh || v.en)) return v[lang] || v.zh;
    return v;
  }

  // 读取内嵌场景（用于 file:// 直接双击打开 HTML，无需服务器）
  function readEmbedded() {
    var block = document.getElementById('embedded-scenario');
    if (!block || !block.textContent.trim()) return null;
    try { return JSON.parse(block.textContent); } catch (e) { return null; }
  }

  function fetchJSON(path, cb) {
    fetch(path)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) { cb(null, json); })
      .catch(function (e) { cb(e); });
  }

  function showBanner(msg, kind) {
    var b = $('banner');
    b.textContent = msg;
    b.className = 'banner ' + (kind || 'info');
  }

  function riskColor(ratio) {
    if (ratio <= 0.2) return '#2e9e5b';
    if (ratio <= 0.5) return '#e0a106';
    return '#d6453d';
  }

  function renderDims() {
    var wrap = $('dims');
    wrap.innerHTML = '';
    for (var k in scenario.dimensions) {
      var d = scenario.dimensions[k];
      var val = state.dims[k] || 0;
      var max = (typeof d.max === 'number') ? d.max : 10;
      var ratio = Math.max(0, Math.min(1, max ? val / max : 0));
      var bar = textEl('div', '', 'dim');
      var label = textEl('span', pick(d.label, lang), 'dim-label');
      var track = textEl('div', '', 'dim-track');
      var fill = textEl('div', '', 'dim-fill');
      fill.style.width = (ratio * 100) + '%';
      fill.style.background = riskColor(ratio);
      var valspan = textEl('span', val + ' / ' + max, 'dim-val');
      track.appendChild(fill);
      bar.appendChild(label); bar.appendChild(track); bar.appendChild(valspan);
      wrap.appendChild(bar);
    }
  }

  // 渲染当前语言下的单语节点：叙事 + 选项
  function renderStage(node) {
    var frag = document.createDocumentFragment();
    frag.appendChild(textEl('div', pick(node.text, lang), 'node-text'));
    frag.appendChild(textEl('div', UI[lang].choicesHead, 'choices-head'));
    var cw = textEl('div', '', 'choices');
    ChoicesEngine.availableChoices(scenario, state).forEach(function (c) {
      var btn = textEl('button', pick(c.text, lang), 'choice');
      btn.disabled = !c.enabled;
      btn.onclick = function () { onChoose(c.index); };
      cw.appendChild(btn);
    });
    frag.appendChild(cw);
    return frag;
  }

  function renderNode() {
    var node = ChoicesEngine.currentNode(scenario, state);
    if (state.finished) { renderEnding(); return; }
    var bc = $('bilingual');
    bc.innerHTML = '';
    bc.appendChild(renderStage(node));
  }

  function onChoose(i) {
    try { ChoicesEngine.choose(scenario, state, i); }
    catch (e) { showBanner('错误: ' + e.message, 'error'); return; }
    renderDims();
    renderNode();
  }

  function typeLabel(t) {
    return (TYPE[lang] && TYPE[lang][t]) || t || '';
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
      box.appendChild(textEl('div', '结局 · ' + typeLabel(ending.type), 'ending-tag'));
      box.appendChild(textEl('h2', pick(ending.title, lang)));
      box.appendChild(textEl('p', pick(ending.text, lang)));
      if (ending.reflection) {
        var rf = (lang === 'zh' ? '(反思) ' : '(Reflection) ') + pick(ending.reflection, lang);
        box.appendChild(textEl('div', rf, 'reflection'));
      }
    }
    var restart = textEl('button', UI[lang].restart, 'btn-restart');
    restart.onclick = restartGame;
    box.appendChild(restart);
    box.classList.remove('hidden');
    $('stage').classList.add('hidden');
    renderTrace();
  }

  function renderTrace() {
    var panel = $('trace-panel');
    panel.classList.remove('hidden');
    $('trace-title').textContent = UI[lang].traceTitle;
    $('trace-desc').textContent = UI[lang].traceDesc;
    var list = $('trace-list');
    list.innerHTML = '';
    state.history.forEach(function (h) {
      var li = textEl('li', '');
      li.appendChild(textEl('div', (lang === 'zh' ? '选择了：' : 'Chose: ') + pick(h.choiceText, lang)));
      if (h.effects && Object.keys(h.effects).length) {
        var parts = [];
        for (var k in h.effects) {
          parts.push(pick(scenario.dimensions[k].label, lang) + ' ' + (h.effects[k] >= 0 ? '+' : '') + h.effects[k]);
        }
        li.appendChild(textEl('div', '→ ' + parts.join(lang === 'zh' ? '，' : ', '), 'trace-effect'));
      }
      list.appendChild(li);
    });
    list.appendChild(textEl('li', UI[lang].finalRisk + '：' + dimSummary(), 'trace-final'));
  }

  function dimSummary() {
    var parts = [];
    for (var k in scenario.dimensions) {
      parts.push(pick(scenario.dimensions[k].label, lang) + '=' + (state.dims[k] || 0));
    }
    return parts.join(lang === 'zh' ? '，' : ', ');
  }

  function restartGame() {
    state = ChoicesEngine.createState(scenario);
    $('ending').className = 'ending hidden';
    $('stage').classList.remove('hidden');
    $('trace-panel').classList.add('hidden');
    renderDims();
    renderNode();
  }

  function start(err, json) {
    if (err) {
      showBanner('无法加载场景：' + err.message + '（请用静态服务器打开，例如 python -m http.server）', 'error');
      return;
    }
    scenario = json;
    var res = ChoicesValidate.validate(scenario);
    if (res.errors.length) showBanner('场景校验未通过：' + res.errors.join('；'), 'error');
    // 校验通过时不显示横幅，避免打扰玩家；仅在校验出错时才提示。

    $('scenario-title').textContent = pick(scenario.title, lang);
    $('scenario-theme').textContent = pick(scenario.theme, lang);
    state = ChoicesEngine.createState(scenario);
    renderDims();
    renderNode();
  }

  // 切换语言：更新开关高亮并即时重渲染当前可见视图
  function setLang(l) {
    lang = l;
    if (!scenario) {  // 场景尚未加载完成，仅更新高亮
      var btns0 = document.querySelectorAll('#lang-toggle button');
      for (var z = 0; z < btns0.length; z++) {
        btns0[z].classList.toggle('active', btns0[z].getAttribute('data-lang') === l);
      }
      return;
    }
    var btns = document.querySelectorAll('#lang-toggle button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-lang') === l);
    }
    renderDims();
    if (state && state.finished) renderEnding();
    else renderNode();
  }

  function init() {
    var params = new URLSearchParams(location.search);
    var langParam = params.get('lang');
    if (langParam === 'en' || langParam === 'zh') lang = langParam;

    // 绑定右上角语言切换开关
    var btns = document.querySelectorAll('#lang-toggle button');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
      })(btns[i]);
    }
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.toggle('active', btns[j].getAttribute('data-lang') === lang);
    }

    var scenarioParam = params.get('scenario');
    var isFile = location.protocol === 'file:';

    if (scenarioParam) {
      // 指定了 ?scenario=：尝试加载独立 JSON 数据包（file:// 下会失败 → 内嵌兜底）
      fetchJSON(scenarioParam, function (err, json) {
        if (!err) return start(null, json);
        var emb = readEmbedded();
        if (emb) return start(null, emb);
        start(err, null);
      });
      return;
    }

    if (isFile) {
      // 直接双击打开 HTML（file:// 协议）：浏览器禁止 fetch 本地文件，使用内嵌场景
      var emb = readEmbedded();
      if (emb) return start(null, emb);
      showBanner('无法通过 file:// 加载场景：未找到内嵌场景（请用静态服务器打开，例如 python -m http.server）', 'error');
      return;
    }

    // 静态服务器 / GitHub Pages：加载独立 JSON 数据包（数据驱动，便于 AI 新增场景）
    fetchJSON('scenarios/student-startup.json', start);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
