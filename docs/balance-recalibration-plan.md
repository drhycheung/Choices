# 平衡重校方案 — 加入社会维度之前先修

> **状态：未执行。** 施工说明，改动留给后续人工执行。
> **代码基线：** `main` @ `5601652`（2026-10-10）
> **前置文档：** `social-dimension-plan.md`（社会维度怎么加）· `../../choices-社会维度建议.md`（设计理由）
> **结论先行：加社会维度之前，平衡问题已经存在，而且不在社会维度上。先修这个，否则加第四根条只会把缺陷放大。**

---

## 1. 怎么量的

直接驱动仓库里真实的 `engine.js`，BFS 枚举全部可达的 `(节点, 各维度值)` 终局状态，统计九个结局的占比。**不是重写一遍逻辑**，所以数字和 `validate.js` / `test.js` 认可的状态空间一致。

测量脚本见 §7，可直接存为 `tools/balance-report.js` 使用。

---

## 2. 基线（六个题材，全量终局状态）

| 题材 | 终局数 | boom_legal | boom_ns | boom_ethics | win_resilient | **stalled** | **win_clean** | business 终局最小值 |
|---|---|---|---|---|---|---|---|---|
| ai-fitness | 12,975 | 35.75% | 29.03% | 24.45% | 10.57% | **0.11%** | **0.02%** | 5 |
| ai-hiring | 12,975 | 35.75% | 29.03% | 24.45% | 10.57% | **0.11%** | **0.02%** | 5 |
| ai-avatar | 6,607 | 41.53% | 22.82% | 20.69% | 14.23% | **0.51%** | **0.03%** | 4 |
| edu-analytics | 12,975 | 35.75% | 29.03% | 24.45% | 10.57% | **0.11%** | **0.02%** | 5 |
| drone-inspection | 12,975 | 35.75% | 29.03% | 24.45% | 10.57% | **0.11%** | **0.02%** | 5 |
| trade-doc-ai | 14,618 | 31.74% | 35.79% | 22.83% | 9.45% | **0.10%** | **0.01%** | 5 |

**全部失败结局合计约 89%。**

### 2.1 课堂证据：GEL2026 L07 会按这个分布打分（2026-10-15 补）

L07 第 18 页 **Value-Risk Matrix** 把终局空间画成四格，学生按此定位自己的那一局：

| | 低风险 | 高风险 |
|---|---|---|
| **强价值** | 😎 Sustainable success（= `win_resilient`） | 😭 Boom-then-bust |
| **弱价值** | 😫 **Over-cautious — every risk avoided, no runway left**（= `stalled`） | ☠️ Double loss |

L07 第 24 页 Activity (3) 要求学生 **"Justify the quadrant with game evidence"**，即凭自己的 run report 说明为什么落在这一格。

> **所以「左下角缺失」不是设计洁癖，是课堂断点：** 讲义承诺四格可达，游戏的 `stalled` 只有 0.10%–0.51%，学生几乎撞不到 😫，而批改要求他们给这一格举证。**修复 ① 因此是 L07 的硬需求，不是可选优化。**
>
> 附带收益：第 18 页已经把「可持续的成功 / 负责任的做法成为别人的标准」绑在**低风险+强价值**这一格，也就是 `win_resilient`。修复 ③ 的方向与讲义已一致，剩下的是让局内复盘用上同样四个名字。

---

## 3. 三个发现

### 发现 A —「弱势 venture」那半张图基本不存在

`business` 的终局最小值是 **4–5**，也就是说**没有任何一条路径能把这门生意真正做砸**。

`stalled`（Clean, But Going Nowhere）的条件是 `business: "<=5"`，于是它在六个题材里都只有 **0.10%–0.51%**。

> 后果：四象限左下角那一格——「过度谨慎、什么都没做成」——学生几乎撞不到。而这正是 AGENTS.md §3.3 里"**过度谨慎是陷阱、不是美德**"唯一的体验来源。

### 发现 B —「守住了风险」几乎等于「做成了生意」

把终局按"三条风险线是否都 ≤4"分组：

| 题材 | 三线都 ≤4 的终局 | 其中 `business ≥6` |
|---|---|---|
| ai-fitness / ai-hiring / edu-analytics / drone-inspection | 1,387 | 1,373（**99%**） |
| ai-avatar | 976 | 942（**97%**） |
| trade-doc-ai | 1,398 | 1,384（**99%**） |

> 后果：只要学生把风险管住，**几乎必然拿到一家成功的公司**。地图的右上角和左下角之间的对比没有被游戏兑现——因为左下角不存在。

### 发现 C — 六个题材实际只有三套机制

`ai-fitness`、`ai-hiring`、`edu-analytics`、`drone-inspection` 的**选项数（43）、节点数（21）、effects 多重集完全相同**。它们是同一款游戏换了故事皮。

`ai-avatar`（40 选项）和 `trade-doc-ai`（43 选项）各有自己的 effects 分布。

> **两个后果：**
> 1. **工作量**：平衡重校要写三遍，不是六遍。
> 2. **教学**：README 说的「六种题材，重玩不会重复」在**故事层面**成立，在**机制层面**不成立。课堂上如果用 `?scenario=` 锁定一个题材，全班玩的就是 profile A；学生私下换着玩，玩到的还是同一个游戏。这个要说清楚——不是 bug，是需要在讲义里讲明的事实。

---

## 4. 根因

看 `ai-fitness` 的 26 种 effects 签名，问题一目了然：

**让 `business` 下降的选项只有 3 个**，而且幅度都很小：

```
(business -1, moat +1)                 ×2
(business -1, moat +2)                 ×1
(business -1, ethics -1, legal -1, pmf +1)  ×1
```

**而这 3 个，恰恰也是唯一能把风险线压低的选项。**

于是形成机械耦合：**压风险 = 放弃商业分**，两者由"稀缺"绑死，不是有意设计。叠加另两个事实：

- `national_security` 几乎只升不降，全场只有 1 个带 `requirements` 闸门的选项（Act IV 的审计）能压它；
- 因此"低风险"这个区域本身就窄（1,387 / 12,975 ≈ 10.7%），而这窄窄的区域里 99% 都是强商业分。

**结论：这不是阈值问题，是选项供给问题。阈值怎么调都救不回来（见 §6）。**

---

## 5. 修复方案（按优先级）

### ① 补「能把生意做砸」的选项 —— 最高优先

每个 effects profile 补 3–5 个**明确让 `business` 掉 2–4** 的选项：

| 类型 | 建议 effects | 语义 |
|---|---|---|
| 转型失败 | `{business:-3, pmf:-2}` | 追热点换赛道，老客户流失 |
| 跑道烧完 | `{business:-2, moat:-2}` | 在没有 PMF 的方向上继续烧钱 |
| 核心客户走 | `{business:-4, pmf:-1, ethics:1}` | 单一 B 端客户断供 |
| 监管过渡期 | `{business:-2, legal:1}` | 合规期内订单冻结 |

**目标：`business` 终局最小值降到 1–2。**

### ② 补「不抬风险也能长大」的选项 —— 次高优先

这才是打破耦合的关键。现在能干净地加商业分的只有 `pmf` / `moat` 单项，效果太小（+1/+2），撑不起一门生意。

建议补**真正的"负责任的增长"**：

| 类型 | 建议 effects | 语义 |
|---|---|---|
| 公开方法论 | `{business:+2, moat:+1, social:-2}` | 把踩坑经验公开，换来信任与转化 |
| 隐私友好设计 | `{business:+1, pmf:+1, legal:-1, social:-1}` | 用"我们不卖你的数据"做差异化 |
| 社区合作 | `{business:+2, ethics:-1, social:-2}` | 与用户共治，换留存与口碑 |
| 监管先沟通 | `{legal:-2, business:-1, social:-1}` | 主动申报，短期掉单、长期清障 |

**关键：第 3、4 条的 `social` 只在做完社会维度那一步才存在；在那之前先写 `ethics` / `legal`。**

**目标：「三线都 ≤4」的终局里，`business ≥6` 的占比从 99% 降到 70–80%。** 这样右上格和左下格都有人走。

### ③ 改称呼，不改阈值

几何上右上角是 `win_resilient`（10.4%，"带伤存活"），`win_clean`（0.2%，"干净通关"）只是它的子集。**但你告诉学生瞄准的是「可持续的成功」，而大多数人拿到的是"带伤存活"。**

**做法（纯文案，不动条件）：**
- 复盘里明确：右上角有**两个名字**，`win_resilient` 是大多数人能到的（带伤的成功），`win_clean` 是几乎无人能走的满分路线；
- 把「可持续的成功 / 负责任的做法成为别人的标准」这句话**绑到 `win_resilient`**；
- `win_clean` 定位成稀有徽章（`isPerfectRun()` 也是这么用的）。

### ④ 社会维度的校准起点

做完 ①② 之后再加社会维度。扫描结果（`social ≈ λ × ethics` 的代理模型，仅作初值参考）：

| λ | boom_social + bust_social 占比 | 判断 |
|---|---|---|
| 0.3 | ~0% | 太弱，新结局形同虚设 |
| **0.5** | **2.65%** | **建议起点** |
| 0.7 | 4%+ | 开始挤压既有格局 |
| 1.0 | 6%+ | 喧宾夺主 |

> ⚠️ **这个代理模型不能直接照抄。** 若真按 `social = λ × ethics` 赋值，你会得到一根**冗余的第四个条**。
> `ai-fitness` 43 个选项里，只有 40% 带 `ethics`、**49% 三条风险线都没碰**（只动商业分）。
> **要让社会线"不可被伦理线替代"，至少 60% 的选项要手写 social**，并且必须存在 social 动而 ethics 不动（反之亦然）的选项。详见 `social-dimension-plan.md`。

---

## 6. 试过但无效的假设（留着省得重试）

| 假设 | 实测 | 结论 |
|---|---|---|
| 把 `stalled` 的 `business` 从 `"<=5"` 放宽到 `"<=7"` 能放人出来 | 14 → **14**，完全没变 | 瓶颈是风险线不是商业分 |
| 把 `win_clean` 三条线从 `"<=0"` 放宽到 `"<=1"` | 2 → 26（0.02% → 0.20%） | 有效但仍极稀有；且被 `social:"<=0"` 一加就归零 |
| 风险线与商业分强相关 | Pearson：ns 0.49 / legal 0.18 / ethics 0.08 | **相关很弱**。耦合不是统计上的，是"低风险选项太少"造成的 |

---

## 7. 测量脚本

脚本已入库：`tools/balance-report.js`（2026-10-15，输出与本文件 §2 基线表逐位一致）。每次改完 scenarios 跑一次，直接看九个结局的占比变化。

```js
#!/usr/bin/env node
// 平衡报告：枚举全部可达终局状态，统计各结局占比
// 用法：node tools/balance-report.js [scenario.json ...]
//      node tools/balance-report.js            → 跑 manifest 里全部题材
const fs = require('fs'), path = require('path');
const REPO = path.resolve(__dirname, '..');
const E = require(path.join(REPO, 'engine.js'));

const endings = JSON.parse(fs.readFileSync(path.join(REPO, 'scenarios/endings-core.json'), 'utf8')).endings;
const argv = process.argv.slice(2);
const files = argv.length
  ? argv
  : JSON.parse(fs.readFileSync(path.join(REPO, 'scenarios/manifest.json'), 'utf8'))
      .scenarios.map(s => 'scenarios/' + s.file);

const SHORT = ['boom_legal','boom_ns','boom_ethics','win_resilient','stalled',
               'win_clean','bust_ns','bust_legal','bust_social','boom_social'];

function sweep(s) {
  const st = E.createState(s), seen = new Set(), stack = [st], T = [];
  while (stack.length) {
    const c = stack.pop(), k = c.current + '|' + JSON.stringify(c.dims);
    if (seen.has(k)) continue; seen.add(k);
    if (c.finished) { T.push({ e: c.endingId, d: JSON.parse(JSON.stringify(c.dims)) }); continue; }
    for (const ch of E.availableChoices(s, c)) {
      if (ch.enabled) { const n = JSON.parse(JSON.stringify(c)); E.choose(s, n, ch.index); stack.push(n); }
    }
  }
  return T;
}

let worstClean = 1, worstStall = 1;
for (const f of files) {
  const s = JSON.parse(fs.readFileSync(path.join(REPO, f), 'utf8'));
  s.endings = endings;
  const T = sweep(s), N = T.length;
  const m = {}; T.forEach(t => m[t.e] = (m[t.e] || 0) + 1);
  const bmin = Math.min(...T.map(t => t.d.business));
  const low  = T.filter(t => t.d.national_security <= 4 && t.d.legal <= 4 && t.d.ethics <= 4);
  const strong = low.filter(t => t.d.business >= 6).length;
  const pct = k => ((100 * (m[k] || 0) / N).toFixed(2) + '%').padStart(8);
  console.log('\n' + f + '   终局 ' + N + '   business 最小值 ' + bmin);
  SHORT.forEach(k => console.log('   ' + k.padEnd(14) + pct(k)));
  console.log('   三线<=4 中 business>=6 : ' + strong + '/' + low.length +
              (low.length ? ' (' + (100 * strong / low.length).toFixed(0) + '%)' : ''));
  const c = (m.win_clean || 0) / N, stl = (m.stalled || 0) / N;
  if (c < worstClean) worstClean = c;
  if (stl < worstStall) worstStall = stl;
}
console.log('\n【验收】win_clean 最低占比 ' + (100*worstClean).toFixed(2) + '%   stalled 最低占比 ' + (100*worstStall).toFixed(2) + '%');
```

---

## 8. 验收标准

跑 `node tools/balance-report.js` 后，六个题材都应满足：

| 指标 | 现状 | 目标 |
|---|---|---|
| `business` 终局最小值 | 4–5 | **1–2** |
| `stalled` 占比 | 0.10%–0.51% | **3%–8%** |
| 「三线≤4」中 `business≥6` 占比 | 97%–99% | **70%–80%** |
| `win_clean` 占比 | 0.01%–0.03% | **0.2%–1%**（稀有徽章，非主目标） |
| 全部失败结局合计 | ~89% | **80%–85%** |
| 全部题材 `node validate.js` | 通过 | 仍通过 |
| 全部题材 `node test.js` | 确定性 | 仍确定 |

> **不要为了达标把失败率压太低。** 游戏的主结论是"负责任是要付代价的"，所以失败结局占多数是对的（现状 89% 并不算离谱）。真正要修的是**左下角缺失**和**右上角名字错位**，不是让游戏变简单。

---

## 9. 顺序

| 步 | 做什么 | 触及 | 为什么这个顺序 |
|---|---|---|---|
| 1 | 把 §7 脚本存为 `tools/balance-report.js` | 新增一个工具 | 没有尺子就没法判断改动好坏 |
| 2 | 补 ①「做砸」选项 × 3 个 profile | scenarios × 6 | 左下角是当前唯一完全缺失的格 |
| 3 | 补 ②「干净地长大」选项 × 3 个 profile | scenarios × 6 | 打破机械耦合 |
| 4 | 跑报告，确认 §8 前四项达标 | — | — |
| 5 | ③ 改复盘称呼 | 结局文案 + README + `dual-track-endings.svg` | 纯文案，此时做最省事 |
| 6 | 才进入 `social-dimension-plan.md` 的阶段 1 | scenarios × 6 | **社会维度必须最后加** |

> 第 6 步的顺序是硬约束：在 ①② 之前加社会维度，只会再加一根被稀缺绑死的条。

---

## 10. 清单

- [x] `tools/balance-report.js` 入库，记录当前基线数字（基线 = 本文 §2；2026-10-15 复跑确认一致）
- [ ] 记录发现 C：四个题材共用同一套 effects（讲义/README 是否要写明）
- [ ] profile A（ai-fitness / ai-hiring / edu-analytics / drone-inspection）补 3–5 个 `business` 大幅下降的选项
- [ ] profile B（ai-avatar）同上
- [ ] profile C（trade-doc-ai）同上
- [ ] 三个 profile 各补 3–4 个「不抬风险也能长大」的选项
- [ ] 跑报告，确认 `business` 最小值 ≤ 2、`stalled` ≥ 3%
- [ ] 复盘文案：把「可持续的成功」绑到 `win_resilient`，说明 `win_clean` 是稀有徽章
- [ ] 更新 `docs/dual-track-endings.svg`（若格子分布变了）
- [ ] `node validate.js` × 6 通过
- [ ] `node test.js` 确定性保持
- [ ] `python3 tools/embed-scenarios.py` 并提交产物
- [ ] **然后**再按 `social-dimension-plan.md` 加社会维度
