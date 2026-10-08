# Choices · 文字交互式分支叙事模拟器

开源教育工具：学生阅读故事 → 做出选择 → 触发不同分支与结局。
核心引擎**通用**，场景作为**独立 JSON 数据包**，可不断新增（首个场景：学生创业，植入国家安全 / 法律 / 伦理风险抉择；后续可扩展实习、科研等）。

## 设计硬约束（已锁定）

1. **静态站为最高优先级**：无后端、无构建步骤，可部署 GitHub Pages / 任意静态托管。
   运行时引擎是纯 JS，在浏览器中运行；Python 仅用于开发期校验，不进运行时。
2. **选择 ↔ 结局必须存在确定性因果关系**：每个选择对风险维度有**明确、可见、可追踪**的效果（无随机骰子）；
   结局由累积状态阈值门控触发。相同选择序列永远得到同一结局，因果链可追溯。
3. **场景 = 独立 JSON 数据包**：新增场景 = 新增一个 JSON 文件，`fetch` 加载，零配置插拔。
4. **反思层可选**：教师可在课堂上补充；schema 中 `reflection` 为可选字段，缺省不阻断运行。
5. **场景内容可由 AI 辅助生成**：因此 schema 设计得对 LLM 友好，并由 `validate.js` 兜底保证因果完整。

## 目录结构

```
Choices/
├── index.html            # 静态播放器页面
├── styles.css            # 样式（阅读式 UI、风险条、结局/轨迹面板）
├── engine.js             # 核心引擎（纯逻辑，无 DOM，确定性因果 + 决策轨迹）
├── validate.js           # 因果/路径校验器（无死路、结局可达、引用合法）
├── player.js             # 静态 UI 控制器（fetch 场景 -> 渲染 -> 引擎推进）
├── test.js               # Node 冒烟测试（无需浏览器）
├── scenarios/
│   └── student-startup.json   # 首个场景：学生创业
└── README.md
```

## 运行

### 本地预览（必须用静态服务器，不能直接 file:// 打开）

```bash
# 任选其一，在项目根目录执行
python3 -m http.server 8000
# 或
npx serve .
```

然后浏览器打开 `http://localhost:8000/`。

### 自测（Node，无需浏览器）

```bash
node test.js
```

会输出场景校验结果与若干条“确定性因果”演示路径（同一序列必得同一结局）。

### 指定其他场景

```
http://localhost:8000/?scenario=scenarios/your-scenario.json
```

## 场景 Schema（数据包规范）

一个场景 = 一个 JSON 对象，引擎只认 schema，不认识任何具体内容：

```jsonc
{
  "id": "student-startup",
  "title": "学生创业：风险抉择",
  "theme": "国家安全 / 法律 / 伦理",
  "dimensions": {                       // 风险维度（确定性状态）
    "<key>": { "label": "国家安全风险", "initial": 0, "min": 0, "max": 10, "higherIsRisk": true }
  },
  "start": "intro",                    // 起始节点 id
  "nodes": {
    "<nodeId>": {
      "text": "叙事文本",
      "choices": [
        {
          "text": "选项文案",
          "next": "<nodeId>",           // 跳转目标（必须存在）
          "effects": { "<dimKey>": 2 }, // 确定性效果（可正可负，无随机）
          "requirements": { "<dimKey>": ">=2" }, // 可选：前置条件门控（不满足则不可选）
          "oneshot": true               // 可选：选后消失
        }
      ]
      // choices 为空数组 = 终局节点
    }
  },
  "endings": {                         // 状态门控结局（按声明顺序求值，命中即止）
    "<endingId>": {
      "title": "结局标题",
      "type": "success | fail | compromise",
      "condition": { "<dimKey>": ">=5" },  // 多维为 AND；空对象 {} 表示默认/兜底
      "text": "结局叙事",
      "reflection": "可选反思提示（教师亦可在课堂补充）"
    }
  }
}
```

### 因果是如何被强制保证的

- **选择 → 效果 → 维度 → 结局**全部确定性：引擎对 `effects` 做加减（无随机数），结局由 `condition` 对维度求值触发。
- **结局按声明顺序求值、命中即止**：把“兜底/妥协”结局放在最后、用空 `condition: {}` 承接所有未被具体结局覆盖的状态。
- **`validate.js` 在运行前证明三件事**：① 结构合法（start/next 引用、维度与表达式合法）；② 无死路（每条可达路径都落在一个合法结局上）；③ 因果可达（每个声明结局都存在至少一条选择序列能触发）。
  用 AI 生成场景后，先跑 `node test.js` / `node validate.js scenarios/xxx.json` 即可确认因果完整。

## 新增一个场景

1. 复制 `scenarios/student-startup.json`，改 `id` / 维度 / 节点 / 结局。
2. 跑 `node test.js`（或单独校验：`node -e "console.log(require('./validate.js').validate(require('./scenarios/xxx.json')))"`）确认无错误。
3. 用 `?scenario=scenarios/xxx.json` 打开预览。
4. 部署：把整个仓库推到 GitHub 并开启 Pages，即得可分享的静态站。

## 引擎 / UI 解耦

- `engine.js`：纯状态机与因果计算，无 DOM，可在 Node 单测。
- `player.js`：仅负责渲染与事件。
- 这保证“核心引擎通用、场景可插拔”的架构目标，也便于未来替换 UI（如接入微信/小程序 WebView）而不动引擎。
