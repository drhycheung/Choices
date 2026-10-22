# Example report

One English-language playthrough of **HireSight** (`ai-hiring`), exported in all
three formats the player offers. These files show what a student receives after
finishing a run, without playing fourteen rounds first.

| File | What it is |
|---|---|
| `report-ai-hiring-boom_ethics.md` | The Markdown report, as downloaded |
| `report-ai-hiring-boom_ethics.docx` | The Word report, as downloaded |
| `report-ai-hiring-boom_ethics.json` | The JSON export, for scripts and marking |

All three come from the same fourteen choices, so they can be compared
section by section. The run ends at `boom_ethics` (“Users Finally Find Out They
Were Sold”), which exercises the stakeholder table, the “Who can act” line on
every step, and a score change of zero.

Each file opens with the outcome quadrant and then lists the same four numbered
sections in the same order: 1 the venture, 2 the score ledger, 3 the decision
trail, 4 the ending debrief. The conclusion page on screen uses these numbers
too, so a section can be cited by number across all of them.

The opening card on the start screen carries a longer title for the same
venture brief — "THE VENTURE · READ THIS FIRST" — because there it is an
instruction to the player. In the report and on the conclusion page the
section is simply "THE VENTURE".

## The run

Fourteen choices, in this order:

| Step | Node | Choice |
|---|---|---|
| 1 | `intro` | Sign the pilot contract and form the team |
| 2 | `c1_segment` | Go deep on technical roles at small and mid-sized tech firms |
| 3 | `c1_problem` | Ship an AI score and talent leaderboard so decisions take one click |
| 4 | `c2_product` | Candidate search with a scoring leaderboard so companies can 'shop' people |
| 5 | `c2_keyresource` | Build a local taxonomy on published industry classification standards |
| 6 | `c2_training` | Use only data the pilot covered in writing and accept a small sample |
| 7 | `ai-hiring_b1_clean` | Claim algorithmic compliance; release the basis only after a complaint |
| 8 | `ai-hiring_b1_clean_money` | Per-seat subscription with a written promise never to resell candidate data |
| 9 | `ai-hiring_b1_clean_channel` | Grow through HR communities and referrals, taking only clients you can serve |
| 10 | `ai-hiring_b1_clean_deploy` | No candidate-facing disclosure; externally it is a 'system assessment' |
| 11 | `c3_harm` | Ship now and declare the intended population as 'graduates of leading institutions' |
| 12 | `ai-hiring_b2_paper` | Add score explanations and a human review channel; publish the known limitations |
| 13 | `ai-hiring_b2_paper_funding` | Take a local industry fund: slower expansion, data stays local |
| 14 | `c4_incident` | Commission an independent algorithm audit, publish a summary, build explainability |

There is no randomness in a run. The ending follows from the scores these
fourteen choices produce, so this table reproduces the outcome exactly.

## Regenerating

These files are generated, not written by hand:

```
node tools/example-report.js            # rewrite this folder
node tools/example-report.js --check    # exit 1 if the files are stale
```

The script replays the fourteen choices above through the current engine
(`engine.js`) and export code (`player.js`), so it will fail loudly if either
stops working. Run `--check` after changing them to see whether the output moved.

Using the engine rather than adding the effects up is deliberate. Each dimension
has a declared maximum of 10, and the engine stops a value at that maximum. On
this run the business score would pass 10 at step 9 if the effects were simply
added, and would reach 13 by the last step. The engine holds it at 10 from step
9, and the run finishes on 9. Adding the numbers by hand produces a report
showing scores that the game cannot actually reach.

The export timestamp is frozen at 2026-10-16 09:12:35 (`.421Z`) so the files do
not change on every run and `--check` stays meaningful. The two text formats
stamp the time with `toLocaleString()`, so the script pins the timezone to UTC:
without that, the same frozen instant would be written as a different clock
time on every machine and the files would never match. With the clock frozen,
the three files here are byte-for-byte what the running app produced for this
run. To record a genuinely new run, change `FIXED_MS` in the script at the same
time.
