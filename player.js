/*
 * Choices 静态播放器（player.js）
 * --------------------------------------------------------------------------
 * 纯前端 UI：fetch 加载场景 JSON -> 引擎推进 -> 渲染节点/选项/风险条/结局/决策轨迹。
 * 支持中英双语：同一版面左右双栏对照（中文 | EN），点击任一语言按钮推进同一状态。
 * 无任何构建步骤、无依赖。引擎逻辑全在 engine.js，校验在 validate.js。
 */
(function () {
  'use strict';

  var scenario = null;
  var state = null;

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

  function loadScenario(path, cb) {
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
      var label = textEl('span', pick(d.label, 'zh') + ' / ' + pick(d.label, 'en'), 'dim-label');
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

  // 渲染某一语言栏：叙事 + 选项
  function langCol(cls, label, node, lang) {
    var col = textEl('div', '', 'lang-col ' + cls);
    col.appendChild(textEl('div', label, 'lang-label'));
    col.appendChild(textEl('div', pick(node.text, lang), 'node-text'));
    col.appendChild(textEl('div', lang === 'zh' ? '你的选择' : 'Your choice', 'choices-head'));
    var cw = textEl('div', '', 'choices');
    ChoicesEngine.availableChoices(scenario, state).forEach(function (c) {
      var btn = textEl('button', pick(c.text, lang), 'choice');
      btn.disabled = !c.enabled;
      btn.onclick = function () { onChoose(c.index); };
      cw.appendChild(btn);
    });
    col.appendChild(cw);
    return col;
  }

  function renderNode() {
    var node = ChoicesEngine.currentNode(scenario, state);
    if (state.finished) { renderEnding(); return; }
    var bc = $('bilingual');
    bc.innerHTML = '';
    bc.appendChild(langCol('zh', '中文', node, 'zh'));
    bc.appendChild(langCol('en', 'EN', node, 'en'));
  }

  function onChoose(i) {
    try { ChoicesEngine.choose(scenario, state, i); }
    catch (e) { showBanner('错误: ' + e.message, 'error'); return; }
    renderDims();
    renderNode();
  }

  function typeLabel(t) {
    return t === 'success' ? '成功 / Success' : t === 'fail' ? '失败 / Fail' : t === 'compromise' ? '妥协 / Compromise' : '未知 / Unknown';
  }

  function renderEnding() {
    var ending = ChoicesEngine.getEnding(scenario, state.endingId);
    var box = $('ending');
    box.className = 'ending type-' + (ending ? ending.type : 'unknown');
    box.innerHTML = '';
    if (!ending) {
      box.appendChild(textEl('h2', '未定义结局 / Undefined ending'));
      box.appendChild(textEl('p', '当前状态未匹配任何结局，场景需补全（见校验器）。'));
    } else {
      box.appendChild(textEl('div', '结局 · ' + typeLabel(ending.type), 'ending-tag'));
      box.appendChild(textEl('h2', pick(ending.title, 'zh')));
      box.appendChild(textEl('h2', pick(ending.title, 'en'), 'en-sub'));
      box.appendChild(textEl('p', pick(ending.text, 'zh')));
      box.appendChild(textEl('p', pick(ending.text, 'en'), 'en-sub'));
      if (ending.reflection) {
        box.appendChild(textEl('div', '(反思) ' + pick(ending.reflection, 'zh'), 'reflection'));
        box.appendChild(textEl('div', '(Reflection) ' + pick(ending.reflection, 'en'), 'reflection en-sub'));
      }
    }
    var restart = textEl('button', '重新开始 / Restart', 'btn-restart');
    restart.onclick = restartGame;
    box.appendChild(restart);
    box.classList.remove('hidden');
    $('stage').classList.add('hidden');
    renderTrace();
  }

  function renderTrace() {
    var panel = $('trace-panel');
    panel.classList.remove('hidden');
    var list = $('trace-list');
    list.innerHTML = '';
    state.history.forEach(function (h) {
      var li = textEl('li', '');
      li.appendChild(textEl('div', '选择了 / Chose: ' + pick(h.choiceText, 'zh')));
      li.appendChild(textEl('div', pick(h.choiceText, 'en'), 'en-sub'));
      if (h.effects && Object.keys(h.effects).length) {
        var parts = [];
        for (var k in h.effects) {
          parts.push(pick(scenario.dimensions[k].label, 'zh') + ' ' + (h.effects[k] >= 0 ? '+' : '') + h.effects[k]);
        }
        li.appendChild(textEl('div', '→ ' + parts.join('，'), 'en-sub'));
      }
      list.appendChild(li);
    });
    list.appendChild(textEl('li', '最终风险 / Final risk: ' + dimSummary(), 'trace-final'));
  }

  function dimSummary() {
    var parts = [];
    for (var k in scenario.dimensions) {
      parts.push(pick(scenario.dimensions[k].label, 'zh') + '=' + (state.dims[k] || 0));
    }
    return parts.join('，');
  }

  function restartGame() {
    state = ChoicesEngine.createState(scenario);
    $('ending').className = 'ending hidden';
    $('stage').classList.remove('hidden');
    $('trace-panel').classList.add('hidden');
    renderDims();
    renderNode();
  }

  function init() {
    var params = new URLSearchParams(location.search);
    var path = params.get('scenario') || 'scenarios/student-startup.json';
    loadScenario(path, function (err, json) {
      if (err) {
        showBanner('无法加载场景 ' + path + '：' + err.message + '（请用静态服务器打开，例如 python -m http.server）', 'error');
        return;
      }
      scenario = json;
      var res = ChoicesValidate.validate(scenario);
      if (res.errors.length) showBanner('场景校验未通过：' + res.errors.join('；'), 'error');
      else if (res.warnings.length) showBanner('场景校验通过（提示：' + res.warnings.join('；') + '）', 'warn');
      else showBanner('场景校验通过 ✓', 'ok');

      $('scenario-title').textContent = pick(scenario.title, 'zh') + '  ·  ' + pick(scenario.title, 'en');
      $('scenario-theme').textContent = pick(scenario.theme, 'zh') + ' / ' + pick(scenario.theme, 'en');
      state = ChoicesEngine.createState(scenario);
      renderDims();
      renderNode();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
