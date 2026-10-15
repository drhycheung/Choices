# Work plan — all outstanding tasks in one place

**Status:** active. **Updated:** 2026-10-15.
**Code baseline:** `main` @ `9fca04d`.

This file consolidates every outstanding task from three sources: the three
construction plans in `docs/`, the four open GitHub issues, and the requirements
introduced by the GEL2026 L07 slides. It does not replace the construction
plans — those remain the detailed specification for each area.

**Source of truth for slides:**
`.../GEL2026 TEAS/02-NOTES/GEL2026-L07.pptx` (OneDrive). The copy of `GEL2026/`
inside this repository is out of date (L06 and L07 both dated 2026-10-08) and must
not be used. L08 and L09 are still being revised and are out of scope.

---

## 1. What the L07 slides require

Read on 2026-10-15 from `GEL2026-L07.pptx`. Three requirements in that deck
convert open issues and planned features into teaching requirements.

| Slide | Requirement | Consequence |
|---|---|---|
| 15 — Activity (2) | Students play the assigned AI Fitness scenario first, then choose another scenario for a second run | The scenario-switch button currently destroys a run in progress (task D1). The lesson cannot be completed as written without a fix or without students exporting between every screen. |
| 18 — Value-Risk Matrix | Four quadrants are named, including "Over-cautious — every risk avoided, no runway left" | This quadrant is the `stalled` ending, currently reachable in 0.10–0.51% of runs. Activity (3) on slide 24 grades "justify the quadrant with game evidence", so students are asked to supply evidence for a quadrant the game almost never produces. Task B1 is therefore required, not optional. |
| 23 — Framework #3 | Legal, ethical and social are defined as three separate questions; social is "what do the people affected expect?" | Activity (3) requires an answer under each perspective, citing the student's own run report. The run report currently contains no social data. Task C is therefore required. |

---

## 2. Completed

- [x] Three construction plans committed (`balance-recalibration-plan.md`, `run-persistence-plan.md`, `social-dimension-plan.md`).
- [x] Measurement script committed (`tools/balance-report.js`). Its output reproduces the baseline table in the balance plan exactly, confirmed 2026-10-15.
- [x] L07 requirements recorded in the balance and social plans.

---

## 3. Tasks

### A. Documentation

| # | Task | Source | Files |
|---|---|---|---|
| A1 | Record that four scenarios share an identical mechanics profile, so "six scenarios, no repeats" is true of the stories but not of the mechanics | balance plan, Finding C | `README.md`, teaching notes |

### B. Scenario content

| # | Task | Source | Files | Acceptance |
|---|---|---|---|---|
| B1 | Add 3–5 choices per effect profile that reduce `business` by 2–4, so a venture can genuinely fail | balance plan ① | `scenarios/*.json` × 6 | `business` minimum falls from 4–5 to 1–2 |
| B2 | Add 3–4 choices per effect profile that grow the venture without raising any risk line | balance plan ② | `scenarios/*.json` × 6 | `stalled` rises to 3–8%; among runs with all three risk lines ≤4, those with `business` ≥6 fall from 97–99% to 70–80% |
| B3 | Add the `actor` field to every choice, with values `design`, `policy` or `law`, and render it beside the `why` text | social plan, stage 3 | `scenarios/*.json` × 6, `player.js` | Each choice shows who can act on the harm it caused |
| B4 | Add three social closure choices to the Act IV audit node in each scenario, with deliberately different commercial returns | social plan 4.1 | `scenarios/*.json` × 6 | The three options have different business outcomes; one moves two dimensions at once |
| B5 | Rewrite the AI Fitness scenario around the Strava heatmap case, so it matches the case taught in L06 and recalled on L07 slide 14 | GitHub issue #12 | `scenarios/ai-fitness.json` | — |
| B6 | Rewrite `why` texts so that every dimension changed by a choice is explained, not only the most conspicuous one | GitHub issue #11 | `scenarios/*.json` × 6 | 68 English and 102 Chinese texts currently under 160 and 60 characters respectively despite changing two or more dimensions |

**Ordering note.** B5 should be completed before B1 and B2 are applied to
`ai-fitness.json`, otherwise that file is written twice and the measured state
space changes part-way through. B6 is best done last, because B1, B2 and B4 all
create new choices whose `why` texts must be written anyway.

### C. Social dimension

Stages 1, 2 and 4 only. Stage 3 is task B3 above and carries no engine changes.

| # | Task | Source | Files |
|---|---|---|---|
| C1 | Add the `social` dimension to all six scenarios, with `initial`, `min` and `max` stated explicitly | social plan 1.1 | `scenarios/*.json` × 6 |
| C2 | Change `national_security` to group `scope` and the other three risk dimensions to group `instrument`, so the dashboard separates "how far it reaches" from "what constrains you" | social plan 1.2 | `scenarios/*.json` × 6 |
| C3 | Update the `intro` text in both languages to name the social expectation dimension | social plan 1.3 | `scenarios/*.json` × 6 |
| C4 | Add `boom_social` and `bust_social` after `bust_ethics`, and add the `social` condition to `win_clean`, `win_resilient` and `stalled` | social plan 4.2 | `scenarios/endings-core.json` |
| C5 | Write the five required analysis fields and both-language text for the two new endings, including the statement that social expectation risk cannot be reduced to zero | social plan 4.2 | `scenarios/endings-core.json` |
| C6 | Add one ending flavour for each new ending, in every scenario | social plan 4.2 | `scenarios/*.json` × 6 |
| C7 | Render the dashboard and the score ledger in three groups instead of two | social plan 2 | `player.js:282`, `player.js:502` |
| C8 | Add the two new group labels in both languages, with a switch to hide the scope group for GEL1032 | social plan 2, §8 | `player.js` |
| C9 | Change the ending-page risk attribution filter from `group === 'risk'` to `group !== 'venture'`, or the national security line disappears from the ending page | social plan W2 | `player.js:583-586` |

**Two ordering constraints are mandatory and are stated in the social plan:**

- C must be completed **after** B1 and B2. Adding a fourth dimension before the
  choice supply is corrected only adds a fourth bar tied to the same scarcity.
- C4 and C5 must be written so that ending order remains priority order. The
  engine takes the first matching ending in declaration order.

### D. Application code (`player.js`)

| # | Task | Source | Notes |
|---|---|---|---|
| D1 | Save each run under `choices.run.<scenario id>`, restore it on load, never destroy a run silently on scenario switch, and add a control to clear all saved runs | run-persistence plan | Save only when the run changes, not on every redraw. Do not save in `beginPlay()` or `restartGame()`. The export format must not change while this is done. |
| D2 | Add the venture description to both exported report formats | GitHub issue #13 | The `brief` field already exists and is displayed in the application, but appears in neither export. |
| D3 | Add a `.docx` export alongside Markdown and JSON | GitHub issue #14 | A `.docx` file is a ZIP archive, so the existing `Blob` download cannot produce one. Requires a ZIP writer. Must consume `exportSteps()` and `exportLedger()` like the other two formats. |

### E. Wording in the ending debrief

| # | Task | Source |
|---|---|---|
| E1 | Bind "sustainable success" to `win_resilient`, and present `win_clean` as a rare distinction rather than the main target | balance plan ③ |

Note: slide 18 of the L07 deck already makes this distinction correctly, so the
remaining work is to make the in-application debrief use the same four names as
the slide.

---

## 4. Verification — required after every change

Run in this order. Stop at the first failure.

```bash
# 1. Schema and reachability for all six scenarios
for f in scenarios/ai-*.json scenarios/edu-analytics.json \
         scenarios/drone-inspection.json scenarios/trade-doc-ai.json; do
  node validate.js "$f" scenarios/endings-core.json || echo "FAIL $f"
done

# 2. Every ending reachable, and replays identical (required: the teacher must be
#    able to ask "which step made this unavoidable" and get a true answer)
node test.js

# 3. Ending distribution against the acceptance targets in the balance plan §8
node tools/balance-report.js

# 4. Rebuild the offline copy and commit the artefacts
python3 tools/embed-scenarios.py
```

The offline copy in `embed/` and the embedded data in `index.html` must be
regenerated and committed whenever a scenario file changes, or the version opened
by double-clicking the folder remains stale.

### Manual checks required by the social dimension

- **Ending selection.** A run ending at `national_security: 0, legal: 0, ethics: 0, social: 8, business: 6` must be judged `boom_social` or `bust_social`, never `win_clean`. The engine treats an unknown dimension as zero and takes the first matching ending, so a missing condition produces a wrong answer with no error message.
- **Perfect-run badge.** Confirm an optimal path can reduce `social` to 0. If it cannot, the badge becomes unreachable.
- **Dashboard.** Confirm the social bar appears in the instrument group.
- **Ending page.** Confirm the national security line is still listed.

---

## 5. Constraints

- The site must remain static, with no backend and no build step.
- Determinism must not be broken. There is no random element during play.
- `GEL2026/` course material is local only and must never be committed. Its contents, including student information and internal comments, must not appear in `README.md` or any public document.
- `README.md` and `docs/vibe-coding.md` are written in English only.
- Any change to a scenario file requires regenerating the offline copy.
- Two additions may not be made simultaneously: the social dimension must not be added before the balance correction is complete.

---

## 6. Proposed sequence

This ordering is my own proposal. The construction plans require only one
ordering constraint, stated in section 3: the social dimension comes after the
balance correction.

1. B3 — `actor` field. No engine changes, and it answers the "who can act" row on slide 23.
2. B5 — Strava rewrite of the AI Fitness scenario, before that file is edited again.
3. B1, B2 — balance correction.
4. C1–C9 — social dimension.
5. E1 — ending wording.
6. D1 — run persistence.
7. D2, D3 — export additions.
8. B6 — `why` texts, after the new choices exist.
9. A1 — documentation.