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
  var lang = 'en';   // 当前界面语言：'en' | 'zh'（默认英文）

  // 界面固定文案（随语言切换）
  var UI = {
    zh: {
      traceTitle: '决策轨迹',
      traceDesc: '每一步选择如何改变风险，因果链一目了然。',
      choicesHead: '你的选择',
      restart: '重新开始',
      undefined: '未定义结局',
      undefinedDesc: '当前状态未匹配任何结局，场景需补全（见校验器）。',
      finalRisk: '最终风险',
      brandSub: '文字交互式分支叙事模拟器',
      hudTitle: '⚠ 风险监测 · RISK MONITOR',
      footer: '核心引擎通用 · 场景为独立 JSON 数据包 · 纯静态站：可部署 GitHub Pages，亦可双击本地打开',
      actionError: '错误: ',
      loadError: '无法加载场景：',
      loadHint: '（请用静态服务器打开，例如 python -m http.server）',
      validateError: '场景校验未通过：',
      fileError: '无法通过 file:// 加载场景：未找到内嵌场景'
    },
    en: {
      traceTitle: 'Decision Trail',
      traceDesc: 'How each choice changes the risks — the causal chain at a glance.',
      choicesHead: 'Your choice',
      restart: 'Restart',
      undefined: 'Undefined ending',
      undefinedDesc: 'No ending matched the current state; the scenario needs completion (see validator).',
      finalRisk: 'Final risk',
      brandSub: 'Interactive Branching Narrative Simulator',
      hudTitle: '⚠ RISK MONITOR',
      footer: 'Universal engine · scenarios are standalone JSON data packs · pure static site: deploy to GitHub Pages or open this HTML directly',
      actionError: 'Error: ',
      loadError: 'Could not load the scenario: ',
      loadHint: ' (open it through a static server, e.g. python -m http.server)',
      validateError: 'Scenario validation failed: ',
      fileError: 'Cannot load the scenario over file://: no embedded scenario found'
    }
  };

  /* ============ 街机音效（Web Audio 合成，无需音频文件） ============ */
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
    var ht = $('hud-title'); if (ht) ht.textContent = UI[lang].hudTitle;
    for (var k in scenario.dimensions) {
      var d = scenario.dimensions[k];
      var val = state.dims[k] || 0;
      var max = (typeof d.max === 'number') ? d.max : 10;
      var ratio = Math.max(0, Math.min(1, max ? val / max : 0));
      var danger = ratio >= 0.5;            // 过半即进入“危险区”，HUD 发光警示
      var color = riskColor(ratio);
      var row = textEl('div', '', 'dim' + (danger ? ' danger' : ''));
      var head = textEl('div', '', 'dim-head');
      var icon = d.icon ? d.icon + ' ' : '';
      head.appendChild(textEl('span', icon + pick(d.label, lang), 'dim-label'));
      head.appendChild(textEl('span', val + ' / ' + max, 'dim-val'));
      row.appendChild(head);
      var track = textEl('div', '', 'dim-track');
      for (var i = 0; i < max; i++) {
        var seg = textEl('div', '', 'dim-seg');
        if (i < val) {
          seg.className = 'dim-seg on';
          seg.style.background = color;
          if (danger) seg.style.boxShadow = '0 0 8px ' + color;
        }
        track.appendChild(seg);
      }
      row.appendChild(track);
      wrap.appendChild(row);
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
    catch (e) { showBanner(UI[lang].actionError + e.message, 'error'); return; }
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
      box.appendChild(textEl('div', (lang === 'zh' ? '结局 · ' : 'Ending · ') + typeLabel(ending.type), 'ending-tag'));
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

    // 最终风险独立成块（不再是列表项），避免与上方条目挤在一起导致文字重叠
    var fbox = $('trace-final');
    if (fbox) {
      fbox.classList.remove('hidden');
      $('trace-final-label').textContent = UI[lang].finalRisk;
      $('trace-final-value').textContent = dimSummary();
    }
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
      var ss = $('start-screen'); if (ss) ss.classList.add('hidden');
      showBanner(UI[lang].loadError + err.message + UI[lang].loadHint, 'error');
      return;
    }
    scenario = json;
    var res = ChoicesValidate.validate(scenario);
    if (res.errors.length) showBanner(UI[lang].validateError + res.errors.join(lang === 'zh' ? '；' : '; '), 'error');
    // 校验通过时不显示横幅，避免打扰玩家；仅在校验出错时才提示。

    applyChrome();
    state = ChoicesEngine.createState(scenario);
    renderDims();
    renderNode();
  }

  // 同步页眉副标题、页脚、HUD 标题，以及场景标题/主题（随语言切换即时更新）
  function applyChrome() {
    var bs = $('brand-sub'); if (bs) bs.textContent = UI[lang].brandSub;
    var ft = $('app-footer'); if (ft) ft.textContent = UI[lang].footer;
    var ht = $('hud-title'); if (ht) ht.textContent = UI[lang].hudTitle;
    // 场景标题与主题（如 "Student Startup" / "National Security / Law / Ethics"）
    // 必须在这里更新：切换语言时只有 applyChrome() 会被调用，
    // 若只在首次加载时写入，切到中文后标题仍会停留在英文。
    if (scenario) {
      var st = $('scenario-title'); if (st) st.textContent = pick(scenario.title, lang);
      var sth = $('scenario-theme'); if (sth) sth.textContent = pick(scenario.theme, lang);
    }
  }

  // 切换语言：更新开关高亮并即时重渲染当前可见视图
  function setLang(l) {
    lang = l;
    markToggles();
    applyChrome();
    if (!scenario) return;  // 场景尚未加载，仅记录语言偏好
    renderDims();
    if (state && state.finished) renderEnding();
    else renderNode();
  }

  // 同步页眉语言开关的高亮状态
  function markToggles() {
    var sel = '#lang-toggle button';
    var btns = document.querySelectorAll(sel);
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-lang') === lang);
    }
  }

  function init() {
    var params = new URLSearchParams(location.search);
    var langParam = params.get('lang');
    if (langParam === 'en' || langParam === 'zh') lang = langParam;

    // 绑定页眉语言切换开关
    var allToggles = document.querySelectorAll('#lang-toggle button');
    for (var i = 0; i < allToggles.length; i++) {
      (function (b) {
        b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
      })(allToggles[i]);
    }
    markToggles();
    applyChrome();

    // 静音键
    var soundBtn = $('sound-toggle');
    if (soundBtn) soundBtn.addEventListener('click', function () {
      muted = !muted;
      soundBtn.textContent = muted ? '🔇' : '🔊';
      if (!muted) { ensureAudio(); }
    });

    var scenarioParam = params.get('scenario');
    var isFile = location.protocol === 'file:';

    // PRESS START 开场画面：点击进入 + 播放街机开机音效
    var startBtn = $('start-btn');
    if (startBtn) startBtn.addEventListener('click', function () {
      ensureAudio();
      playStart();
      var s = $('start-screen'); if (s) s.classList.add('hidden');
    });

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
      showBanner(UI[lang].fileError + UI[lang].loadHint, 'error');
      return;
    }

    // 静态服务器 / GitHub Pages：加载独立 JSON 数据包（数据驱动，便于 AI 新增场景）
    fetchJSON('scenarios/student-startup.json', start);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
