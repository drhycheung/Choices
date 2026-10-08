/*
 * Choices 静态播放器（player.js）
 * --------------------------------------------------------------------------
 * 纯前端 UI：fetch 加载场景 JSON -> 引擎推进 -> 渲染节点/选项/风险条/结局/决策轨迹。
 * 无任何构建步骤、无依赖。引擎逻辑全在 engine.js，校验在 validate.js。
 */
(function () {
  'use strict';

  var scenario = null;
  var state = null;

  function $(id) { return document.getElementById(id); }
  function textEl(tag, txt, cls) {
    var el = document.createElement(tag);
    el.textContent = txt;
    if (cls) el.className = cls;
    return el;
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
      var label = textEl('span', d.label, 'dim-label');
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

  function renderNode() {
    var node = ChoicesEngine.currentNode(scenario, state);
    $('node-text').textContent = node ? node.text : '';
    var cw = $('choices');
    cw.innerHTML = '';
    if (state.finished) { renderEnding(); return; }
    ChoicesEngine.availableChoices(scenario, state).forEach(function (c) {
      var btn = textEl('button', c.text, 'choice');
      btn.disabled = !c.enabled;
      btn.onclick = function () { onChoose(c.index); };
      cw.appendChild(btn);
    });
  }

  function onChoose(i) {
    try { ChoicesEngine.choose(scenario, state, i); }
    catch (e) { showBanner('错误: ' + e.message, 'error'); return; }
    renderDims();
    renderNode();
  }

  function typeLabel(t) {
    return t === 'success' ? '成功' : t === 'fail' ? '失败' : t === 'compromise' ? '妥协' : '未知';
  }

  function renderEnding() {
    var ending = ChoicesEngine.getEnding(scenario, state.endingId);
    var box = $('ending');
    box.className = 'ending type-' + (ending ? ending.type : 'unknown');
    box.innerHTML = '';
    if (!ending) {
      box.appendChild(textEl('h2', '未定义结局'));
      box.appendChild(textEl('p', '当前状态未匹配任何结局，场景需补全（见校验器）。'));
    } else {
      box.appendChild(textEl('div', '结局 · ' + typeLabel(ending.type), 'ending-tag'));
      box.appendChild(textEl('h2', ending.title));
      box.appendChild(textEl('p', ending.text));
      if (ending.reflection) box.appendChild(textEl('div', '(反思) ' + ending.reflection, 'reflection'));
    }
    var restart = textEl('button', '重新开始', 'btn-restart');
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
      var li = textEl('li', '选择了：' + h.choiceText);
      if (h.effects && Object.keys(h.effects).length) {
        var parts = [];
        for (var k in h.effects) {
          parts.push(scenario.dimensions[k].label + ' ' + (h.effects[k] >= 0 ? '+' : '') + h.effects[k]);
        }
        li.textContent += '  →  ' + parts.join('，');
      }
      list.appendChild(li);
    });
    list.appendChild(textEl('li', '最终风险：' + dimSummary(), 'trace-final'));
  }

  function dimSummary() {
    var parts = [];
    for (var k in scenario.dimensions) parts.push(scenario.dimensions[k].label + '=' + (state.dims[k] || 0));
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

      $('scenario-title').textContent = scenario.title || '未命名场景';
      $('scenario-theme').textContent = scenario.theme || '';
      state = ChoicesEngine.createState(scenario);
      renderDims();
      renderNode();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
