# Example report

One playthrough of **明眼 HireSight** (`ai-hiring`), exported in all three
formats the player offers. These files are here so you can see exactly what a
student receives after finishing a run, without playing fourteen rounds first.

| File | What it is |
|---|---|
| `report-ai-hiring-boom_ethics.md` | The Markdown report, as downloaded |
| `report-ai-hiring-boom_ethics.docx` | The Word report, as downloaded |
| `report-ai-hiring-boom_ethics.json` | The JSON export, for scripts and marking |

All three come from the same fourteen choices, so they can be compared
section by section. The run ends at `boom_ethics` (用户终于知道自己被卖了),
which is a useful example because it exercises the stakeholder table, the
"谁该管" line on every step, and a score change of zero.

## The run

Fourteen choices, in this order:

| Step | Node | Choice |
|---|---|---|
| 1 | `intro` | 接下这笔试点合同，正式成立团队 |
| 2 | `c1_segment` | 深耕中小科技企业的技术岗，把一个岗位类型做透 |
| 3 | `c1_problem` | 做 AI 综合评分与人才榜单，让决策一键完成 |
| 4 | `c2_product` | 候选人搜索与评分榜单：企业可以直接「搜人」 |
| 5 | `c2_keyresource` | 自建本地化词库，用公开的行业分类标准起步 |
| 6 | `c2_training` | 用试点企业书面授权的数据，接受样本量小的现实 |
| 7 | `ai-hiring_b1_clean` | 对外宣称算法合规，评分依据只在被投诉时给 |
| 8 | `ai-hiring_b1_clean_money` | 企业按席位订阅，并书面承诺不转售候选人数据 |
| 9 | `ai-hiring_b1_clean_channel` | 靠 HR 社群与行业口碑慢慢铺，每月只接能服务的客户 |
| 10 | `ai-hiring_b1_clean_deploy` | 不在候选人侧披露，企业对外的说法是「系统综合评估」 |
| 11 | `c3_harm` | 先上线，把适用人群写成「毕业于重点院校的技术岗」 |
| 12 | `ai-hiring_b2_paper` | 补做评分依据说明与人工复核通道，公开已知局限 |
| 13 | `ai-hiring_b2_paper_funding` | 接受本地产业基金，扩张慢一些但数据留在本地 |
| 14 | `c4_incident` | 委托第三方算法审计并公开摘要，建立评分可解释机制 |

There is no randomness in a run. The ending follows from the scores these
fourteen choices produce, so this table reproduces the outcome exactly.

## Regenerating

These files are generated, not written by hand:

```
node tools/example-report.js            # rewrite this folder
node tools/example-report.js --check    # exit 1 if the files are stale
```

The script replays the fourteen choices above through the real engine
(`engine.js`) and the real export code (`player.js`), so it will fail loudly if
either stops working. Run `--check` after changing them to see whether the
output moved.

Using the engine rather than adding the effects up is deliberate. Each dimension
has a declared maximum of 10, and the engine stops a value at that maximum. On
this run the business score would pass 10 at step 9 if the effects were simply
added, and would reach 13 by the last step. The engine holds it at 10 from step
9, and the run finishes on 9. Adding the numbers by hand produces a report
showing scores that the game cannot actually reach.

The export timestamp is frozen at 2026-10-16 17:12:35 (`.421Z`) so the files do
not change on every run and `--check` stays meaningful. With the clock frozen,
the three files here are byte-for-byte what the running app produced for this
run. To record a genuinely new run, change `FIXED_MS` in the script at the same
time.
