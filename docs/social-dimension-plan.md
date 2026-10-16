# 加入社会维度 — 修改方法

> **状态：已排期施工（2026-10-15 用户确认）。** 用户已决定：社会维度须在学生于 2026-10-29
> 上课使用前完成并部署。本文件即施工说明。
> **代码基线：** `main` @ `5601652`（2026-10-10）。文中行号对应该提交，改动后请自行重新定位。
> **讲义来源：** 课程文件以 OneDrive 为准 ——
> `.../GEL2026 TEAS/02-NOTES/GEL2026-L0*.pptx`。仓库内的 `GEL2026/` 副本已过期（L06/L07 停留在 10-08）。
> **目标：** 补上"社会期待"这一条工具线，使游戏与 GEL2026 的三工具模型（法律 provision · 伦理 judgement · **社会 expectation**）及 ASM3 评分项 "Social, Ethical, and Legal Issues" 对齐。
> **配套文档：** `../../choices-社会维度建议.md`（设计理由，本文只讲怎么做）

### 已定：社会维度沿用"风险"命名

> **优先级复核（2026-10-15）：本项已是 L07 的硬需求，不是加分项。**
> L07 第 23 页 **Framework #3「Legal / Ethical / Social」** 把三者明确分开——social 一栏问的是
> *"What do the people affected expect?"*，与 ethical 的 *"Is the distribution of cost fair?"* 不是一回事；
> 第 24 页 Activity (3) 进一步要求学生 **"Explain a concern under each perspective"**，
> 且必须引用**自己那一局**的 run report。
>
> **现状：run report 只有 `legal` / `ethics` / `national_security` 三根风险线，没有任何社会数据。**
> 也就是说，作业强制要求的三栏里有一栏，学生在游戏里找不到证据可引。
> 这份改动要解决的是一个正在被批改的作业缺口。

刻度统一叫**风险**，不引入"落差 / gap"这一新词：

| 键 | label | 图标 |
|---|---|---|
| `national_security` | 国家安全风险 / National security risk | 🛡️ |
| `legal` | 法律合规风险 / Legal compliance risk | ⚖️ |
| `ethics` | 伦理与信任风险 / Ethics and trust risk | 🧐 |
| `social` | **社会期待风险 / Social expectation risk** | 🗣 |

仪表盘上四根条同一种东西，学生不需要先理解一个新词才能读数字。代价是**"社会风险和其他三条不一样"这件事，界面上没有任何提示**，只能在复盘里讲。

→ 因此阶段 4 的新结局与 debrief 文案从"加分项"变成**必做项**，见 §4.3 与 §3.1。

---

## 0. 前置：四个已从代码确认的事实

动手前必须知道这四条，它们决定了改动是否安全。

| # | 事实 | 出处 | 含义 |
|---|---|---|---|
| F1 | `applyEffects` 只遍历 `effects` 里出现的 key，缺省不动 | `engine.js:88-97` | **加维度不会破坏任何现有选项**——没写 `social` 的选项就是不变 |
| F2 | `matchAll` 用 `dims[key] \|\| 0` 取值 | `engine.js:43` | 条件里引用一个 state 里不存在的维度会当 0，**不会崩，但会静默给出错误结局** |
| F3 | `selectEnding` 按**声明顺序取第一个满足**的结局 | `engine.js:104-111` | 结局顺序 = 优先级。**新结局插错位置会被吃掉或吃掉别人** |
| F4 | `validate.js` 用 BFS 遍历所有可达状态，**每个终局状态都必须匹配到某个结局** | `validate.js:114-165` | 加一根维度 = 状态空间变大。**新增结局的条件必须覆盖新出现的组合**，否则报死路 |

> F2 + F3 合起来是最危险的一条，见陷阱 W1。

---

## 1. 阶段 1 — 数据层（先做，风险最低）

### 1.1 给 6 个 scenario 加 `social` 维度

对 `scenarios/` 下这 6 个文件各改一处（`dimensions` 块内）：

```
ai-fitness.json  ai-hiring.json  ai-avatar.json
edu-analytics.json  drone-inspection.json  trade-doc-ai.json
```

```jsonc
"dimensions": {
  "national_security": { ..., "group": "scope" },     // ← 由 "risk" 改为 "scope"（见 1.2）
  "legal":             { ..., "group": "instrument" },
  "ethics":            { ..., "group": "instrument" },
  "social": {                                          // ← 新增
    "label": { "zh": "社会期待风险", "en": "Social expectation risk" },
    "initial": 1,
    "min": 0,
    "max": 10,             // ← 必须写。dimBounds 缺省 max=999，条会爆
    "higherIsRisk": true,
    "group": "instrument",
    "icon": "🗣"
  },
  "pmf": ..., "business": ..., "moat": ...
}
```

**`min` / `max` / `initial` 三个字段一个都不能省** —— `validate.js:44-46` 明确报 `维度未定义 min/max`（可达性搜索需要有限范围）。

### 1.2 为什么要改 `national_security` 的 group

不改成 `scope`，四根条就还是"四根并排的条"，仪表盘会重新教"把四根都压低"——正是 README 里点名要避免的避险倾向。改成 `scope` 之后，版面上自然分成"一根问多远 / 三根问什么在管我"。

⚠️ 这一改会**静默破坏结局页的风险归因**，见陷阱 W2，必须同时改 `player.js`。

### 1.3 改 `intro` 散文（6 个文件，zh + en）

每个 scenario 的 `start` 节点正文都点了"国家安全、法律与伦理"三线，例如 `ai-fitness.json` 的 `intro`：

> 接下来的一连串抉择，每一个都会同时改变两件事：公司的前途，以及它可能碰到的**国家安全、法律与伦理**红线。

不改的话，开场白和仪表盘直接矛盾。建议改成把工具线显式列出来：

> ……以及它可能碰到的**国家安全、法律、伦理与社会期待**红线。

> ⚠️ **陷阱：结论性判定 `win_clean` 的条件会随阶段 4 一起变，但 `intro` 文字现在就改，会在中间阶段出现短暂不一致——这是正常的，阶段 1 与阶段 4 一起收尾即可。**

### 1.4 平衡复核（阶段 4 完成后做，这里先记着）

四根风险条会让 `stalled`（clean but going nowhere）大幅变容易、`win_clean` 变难。**每个结局的阈值都要重算**，目标：

- `win_clean` 仍然可达（每条线都能压到 0）
- `stalled` 仍然可达（否则"过度谨慎"这一格教不出来）
- **不能出现"负责任＝输"** —— 若最优解只剩 `stalled`，说明社会性手段的商业回报给得太低

---

## 2. 阶段 2 — 仪表盘按族渲染

分组渲染在 `player.js` 里**硬编码了只有两组**，改两处：

**`player.js:282`（仪表盘）**

```js
// 现状
[['risk', UI[lang].groupRisk], ['venture', UI[lang].groupVenture]].forEach(function (g) {

// 改为
[[UI[lang].groupScope], [UI[lang].groupInstrument], [UI[lang].groupVenture]].forEach(function (g) {
  g = [g];   // 保持原 forEach 回调签名
```

更干净的做法是改成三元组数组，避免改回调体：

```js
[['scope', UI[lang].groupScope], ['instrument', UI[lang].groupInstrument],
 ['venture', UI[lang].groupVenture]].forEach(function (g) { /* 回调体不动 */ });
```

**`player.js:502`（分数账 ledger）** —— 同一段逻辑，同一处改法。

**新增 UI 文案**（`player.js` 的 `UI.zh` 约 `:41-42`，`UI.en` 约 `:94-95`）：

```js
groupScope:     '范围轨 · 能走多远',   // 或 '范围 · 波及到哪一层'
groupInstrument:'工具轨 · 什么在约束你',
groupVenture:   '创业轨 · 愈高愈好',
```
```js
groupScope:     'Scope · how far it reaches',
groupInstrument:'Instruments · what constrains you',
groupVenture:   'Venture · higher is better',
```

### 2.1 顺带确认（大概率不用改，但要跑一遍看）

| 位置 | 现状 | 加了 social 之后 |
|---|---|---|
| `player.js:245-261` `trackColor` / alarm | `higherIsRisk && ratio>=0.5` 才变红 | social 会自动参与，`higherIsRisk:true` → 5 分起报警。**若不想要社会条报警**，需在这里特判 |
| `player.js:402-407` `dimDeltaLabel` | 按 `higherIsRisk` 判好坏 | 自动正确，**无需改** |
| `player.js:554-558` `CANVAS_BOX` | 只映射 pmf/business/moat | social 属风险轨，**不受影响** |
| `player.js:679-689` 报告导出 | 遍历全部维度 | 自动包含 social，**无需改** |

---

## 3. 阶段 3 — `actor` 标签（零引擎改动）

对齐 L06 第三问「谁能行动」。好消息：**引擎一行都不用动。**

`choose()` 把 `choiceIndex` 存进 `history`（`engine.js:145-151`），播放器用 `scenario.nodes[h.nodeId].choices[h.choiceIndex]` 取回原始选项对象（`player.js:417-418`、`648-649`、`964-965`）——`why` 就是这么读的。`actor` 照抄这个套路即可。

### 3.1 在 choice 上加字段

```jsonc
{ "text": {...}, "next": "c3", "effects": { "business": 2, "social": 2 },
  "actor": "design",                                   // ← 新增
  "why": { "zh": "...", "en": "..." } }
```

取值：`design` | `policy` | `law`

### 3.2 渲染

在 `player.js:430`（`why` 渲染处）后面加一行同类渲染：

```js
if (choice && choice.actor) {
  box.appendChild(textEl('div', UI[lang].actorPrefix + UI[lang].actor[choice.actor], 'fb-actor'));
}
```

UI 文案加：

```js
actorPrefix: '谁该管：',
actor: { design: '设计', policy: '公司政策', law: '法律' },
```
```js
actorPrefix: 'Who acts: ',
actor: { design: 'design', policy: 'company policy', law: 'law' },
```

### 3.3 让 `why` 承担教学

`why` 的模板（zh / en 各一份）建议统一成三段，把"这一步推高的是哪一条、哪一类人能管"说出来：

> 这一步把**社会期待风险**推高了 2 —— 你的用户开始被围观，但没有一个人被问过。
> 这一类伤害 **公司政策** 能管（事前告知 + 选择加入），法律管不了，因为它还不违法。

### 3.4 因为沿用"风险"命名，这句话必须由复盘来说

刻度统一叫"风险"之后，**界面上没有任何地方告诉学生"社会风险和另外三条不一样"**。而这恰恰是要教的东西：

> 法律风险可以归零——合规就是 0。
> 伦理风险没有标准答案，只能辩。
> **社会期待风险没有"零"**。你可以把落差压到可管理的程度，但"没有人期待为零"这件事本身就是这个维度的定义。

**这句话必须落在三个地方之一（建议三处都放）：**

1. **结局 debrief** —— `analysis.tradeoff` 或新增一段 `analysis` 文案。
2. **`why` 模板**（3.3）—— 在推高社会线的选项上顺带说一句。
3. **L08 课堂复盘** —— 游戏的复盘环节问"你最后用的那个手段压得住哪几条"。

> ⚠️ **不要在仪表盘上加说明文字。** 四根条保持同一种东西，学生的第一眼是"四条都在压低"；把这个纠偏留到复盘，效果比一开始就解释好得多——因为他们已经先犯了一遍。

---

## 4. 阶段 4 — 社会性收尾手段 + 新结局

### 4.1 三个带价格的社会性收尾

在 Act IV 的收尾节点（`audit` 那一组）加三个选项。**关键：给它们的商业回报要各不相同，否则又变成"全都要"的清单。**

| 选项 | `effects` 建议 | 语义 |
|---|---|---|
| 事前告知 + 选择加入 | `{ "social": -3, "legal": -1, "business": -1 }` | 便宜，但要你真的改产品 |
| 社区共管（用户 panel / 本地协商） | `{ "social": -4, "ethics": -1, "business": -2 }` | 贵，且慢 |
| 重构定价（少收数据、少收钱） | `{ "social": -4, "national_security": -2, "business": -3 }` | **唯一同时动两个工具的选项，代价是商业模式本身** |

第三个是整份改动的教学核心：**同时动两个工具的唯一办法，是改商业模式。**

### 4.2 新结局（`scenarios/endings-core.json`）

#### ⚠️ 结局顺序 = 优先级（F3）

`selectEnding` 取**声明顺序里第一个**满足的。现有顺序是：ns → legal → ethics → 三个 success/compromise。**`social` 必须插在 `bust_ethics` 之后、`win_clean` 之前**，否则：

- 插在前面 → NS 结局会被 social 结局抢走
- 插在后面 → 永远轮不到（因为 `win_clean` / `stalled` 会先命中）

新顺序（9 → 11）：

```jsonc
"endings": {
  "boom_ns":       { "national_security": ">=5", "business": ">=6" },   // 不变
  "bust_ns":       { "national_security": ">=5" },                        // 不变
  "boom_legal":    { "legal": ">=5", "business": ">=6" },                 // 不变
  "bust_legal":    { "legal": ">=5" },                                    // 不变
  "boom_ethics":   { "ethics": ">=5", "business": ">=6" },                // 不变
  "bust_ethics":   { "ethics": ">=5" },                                   // 不变
  "boom_social":   { "social": ">=5", "business": ">=6" },                // ★ 新增
  "bust_social":   { "social": ">=5" },                                   // ★ 新增
  "win_clean":     { "national_security": "<=0", "legal": "<=0",
                     "ethics": "<=0", "social": "<=0", "business": ">=6" },// ★ 补 social
  "win_resilient": { "national_security": "<=4", "legal": "<=4",
                     "ethics": "<=4", "social": "<=4", "business": ">=6" },// ★ 补 social
  "stalled":       { "national_security": "<=4", "legal": "<=4",
                     "ethics": "<=4", "social": "<=4", "business": "<=5" } // ★ 补 social
}
```

#### ⚠️ 不补 `social` 条件会怎样（这就是陷阱 W1）

假设 `social` 维度已存在，但三个 success 条件没补。一局跑出 `ns=0, legal=0, ethics=0, social=8, business=6`：

```
boom_ns     ns>=5?   否
bust_ns     ns>=5?   否
boom_legal  否  bust_legal 否  boom_ethics 否  bust_ethics 否
win_clean   ns<=0 ✓ legal<=0 ✓ ethics<=0 ✓ business>=6 ✓  →  命中「A Clean Win」
```

**一个社会期待彻底崩掉的局，会被判成"干净的成功"。** 不报错、不警告、静默给错答案。这是最需要小心的一个改动。

#### 更尖锐的一个格子（可选）

如果想要"合规、站得住、但没人要"这个**感觉像成功的失败**，把 `boom_social` 换成：

```jsonc
"boom_social": { "legal": "<=2", "ethics": "<=2", "social": ">=6", "business": ">=6" }
```

这样它只在"法律伦理都干净、唯独社会期待失分"时命中，指向性比单纯的 `social>=5` 强得多。位置仍在 `bust_ethics` 之后。

#### 为什么这两个结局从"可选"变成"必做"

沿用"风险"命名之后，学生看到的是四条同类的条，**唯一能让他们学到"社会风险不可归零"的，就是一个只有社会线炸、其余全干净、却依然失败的结局。**

没有它，一局 `ns=0, legal=0, ethics=0, social=8, business=6`（见 W1）只会被判成 `win_clean`——界面和结局都在说"你赢了"，而这正是要纠正的直觉。**有了它，学生会亲手撞上：四条全压到最低，还是输了。**

`bust_social` 的 `reflection` 就是这句话的落点，建议直接写：

> 四条线你都压到最低了，还是没有做成。
> ——因为"社会期待风险为零"不是一个可达状态。别人对你总有些期待，你只能选择承担多少，而不是归零。

#### 每个新结局的字段要求

`validate.js:100` 强制要求 `analysis` 必须含这五个字段：

```
trigger   tradeoff   stakeholders   mitigation   canvas
```

（现有结局还多一个可选的 `legal`，新结局可照抄。）

`text` / `reflection` 都要 `{zh, en}` 双语。

#### `endingFlavor` 也要补

`endingsShared` 指向共享的 `endings-core.json`，但 `endingFlavor` 是**按题材各自存**的。**6 个 scenario 都要为两个新结局各补一条 flavor**，否则新结局在非默认题材下没有那句收尾。

---

## 5. 五个陷阱（都是从代码里读出来的，不是推测）

### W1 — 结局顺序与缺失条件会静默给出错误结局 ⚠️ 最高危
见 4.2。`matchAll` 对未知维度当 0（F2）+ `selectEnding` 取第一个匹配（F3），两者叠加的后果是**不报错、给错答案**。
**自检：** 改完后手工验一局 `ns=0, legal=0, ethics=0, social=8, business=6`，必须落到 `boom_social` 或 `bust_social`，不能是 `win_clean`。

### W2 — 风险归因会悄悄丢掉国安线
`player.js:583-586`：

```js
var keys = Object.keys(scenario.dimensions).filter(function (k) {
  return scenario.dimensions[k].group === 'risk';        // ← 硬编码 'risk'
});
```

1.2 把 `national_security` 改成 `group:"scope"` 之后，**国安线会从结局页的「是哪几步把它推高的」列表里整个消失**。
**改法：**

```js
return scenario.dimensions[k].group !== 'venture';        // 范围 + 工具都算
```

同样的思路检查 `player.js:561-562`（canvas 归因，筛 `=== 'venture'`，**不用改**）。

### W3 — 死路检查会因状态空间变大而失败
`validate.js:114-165` 用 BFS 遍历 `(节点, 全部维度值)` 的组合。加一根 0–10 的维度 = 状态数显著上升。**新结局的条件若没覆盖新组合，validate 会报死路。**
这是好事——它会告诉你缺哪一格。**不要绕过，要补条件。**

### W4 — 完美通关徽章会变难拿
`player.js:614-622` `isPerfectRun()`：要求**所有 `higherIsRisk` 维度等于 `min`**，且创业三格 ≥7。加了 `social`（`initial:1`）之后，必须有选项能把它压到 0，否则徽章不可达。
**自检：** 跑一局最优路径，看 `social` 最终是否为 0。

附带一个语义问题：徽章要求 `social == 0`，而刻度名叫"社会期待风险"。**"社会期待风险为零"在现实中不存在**——这是游戏约定，不是事实主张。复盘里点一句"这是记分板的约定"，避免学生把它带走当结论。

### W5 — 离线副本忘了重建
`tools/embed-scenarios.py` 的产物是 `index.html`（内嵌 manifest）、`embed/endings.js`、`embed/<id>.js`。**改完 scenarios 一定要重跑并提交这三个**，否则 `file://` 双击打开的版本还是旧的（README 已说明：两个产物都必须提交）。

---

## 6. 验证

按顺序跑，任何一步失败都停下来修：

```bash
# 1) 每个题材单独校验（无死路、每个结局可达、局数 ≥10）
for f in scenarios/ai-*.json scenarios/edu-analytics.json \
         scenarios/drone-inspection.json scenarios/trade-doc-ai.json; do
  # 第二个参数是相对于场景文件所在目录解析的，所以只写文件名
  node validate.js "$f" endings-core.json || echo "FAIL $f"
done

# 2) 触发全部结局 + 重放两次确认确定性
node test.js

# 3) 重建离线副本并提交
python3 tools/embed-scenarios.py

# 4) 手工验收三件事
#    a. 仪表盘分三族，social 条在「工具」族里
#    b. 结局页风险归因里国安线仍然在（W2）
#    c. W1 的那局判对、W4 的最优路径 social 归零
```

确定性（`test.js` 重放一致）对教学是硬要求：老师要能问出"你是在第几步变成这样的"并得到真答案。**任何改动都不得破坏它。**

---

## 7. 分阶段停靠点

| 阶段 | 改动 | 触及文件 | 风险 | 建议 |
|---|---|---|---|---|
| **1** | 加 `social` + 改 group + 改 intro 散文 | 6 × `scenarios/*.json` | 低 | 与阶段 4 一起收尾 |
| **2** | 仪表盘三族渲染 | `player.js`（282 / 502 / UI 文案） | 低（纯渲染） | 可独立验证 |
| **3** | `actor` 标签 | 6 × scenarios + `player.js`（430 附近） | 中（撰写量大） | 课堂增益最大 |
| **4** | 三个社会性收尾 + 2 个新结局 + 条件 | scenarios ×6 + `endings-core.json` + 平衡 | 中 | 收尾阶段 |

**建议先做 1 + 2**：这两步已经补齐 ASM3 的措辞缺口，并让"范围 vs 工具"在版面上成立，而 3、4 可以在课程间隙慢慢做。
**若只做一件事**：做阶段 1 的 1.1 + 4.2（含 W1 自检）——这是唯一能让"社会维度真的存在"的一步，其余都是加分。

---

## 8. 兼容性：GEL1032

同一套 scenario 也供 GEL1032（无国安线）使用。把 `national_security` 单独归为 `scope` 族之后，GEL1032 那边可以直接隐藏该族。

**改 UI 分组时请留一个开关位**，不要把 `scope` 硬编码成必显示。建议：

```js
var GROUPS = [
  ['scope',       UI[lang].groupScope],
  ['instrument',  UI[lang].groupInstrument],
  ['venture',     UI[lang].groupVenture]
].filter(function (g) { return g[0] !== 'scope' || showScope; });
```

其中 `showScope` 由 URL 参数或 manifest 字段控制（GEL2026 走 GEL1032 入口时置 false）。

---

## 9. 改动清单（打勾用）

- [ ] 6 × `scenarios/*.json`：`dimensions` 加 `social`（label 用**社会期待风险 / Social expectation risk**，含 `initial` / `min` / `max`）
- [ ] 6 × `scenarios/*.json`：`national_security.group` 改 `"scope"`
- [ ] 6 × `scenarios/*.json`：另外三条风险线 `group` 改 `"instrument"`
- [ ] 6 × `scenarios/*.json`：`intro` 正文（zh + en）补"社会期待"
- [ ] 6 × `scenarios/*.json`：choice 加 `actor`；`why` 模板改写（阶段 3）
- [ ] 6 × `scenarios/*.json`：Act IV 加三个社会性收尾（阶段 4）
- [ ] 6 × `scenarios/*.json`：`endingFlavor` 为两个新结局各补一条（阶段 4）
- [ ] `scenarios/endings-core.json`：加 `boom_social` / `bust_social`，插在 `bust_ethics` 之后
- [ ] `scenarios/endings-core.json`：`win_clean` / `win_resilient` / `stalled` 补 `social` 条件
- [ ] `scenarios/endings-core.json`：两个新结局的 `analysis` 齐五个必填字段
- [ ] `scenarios/endings-core.json`：**"社会期待风险不可归零"写进新结局的 `tradeoff` / `reflection`**
- [ ] `player.js:282` / `:502`：分组数组扩到三族
- [ ] `player.js` UI 文案：`groupScope` / `groupInstrument`（zh + en）
- [ ] `player.js:583-586`：风险归因筛选改为 `group !== 'venture'`
- [ ] `player.js:430` 附近：`actor` 渲染 + UI 文案
- [ ] 平衡复核：`win_clean` 可达、`stalled` 可达、不出现"负责＝输"
- [ ] `node validate.js` × 6 全过
- [ ] `node test.js` 确定性保持
- [ ] `python3 tools/embed-scenarios.py` 并提交产物
- [ ] W1 / W4 手工自检
