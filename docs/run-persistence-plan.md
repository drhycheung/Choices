# Run persistence — a run must survive a scenario switch

**Status:** not implemented. **Needed before 2026-10-29** (GEL2026 L07, the first
class that plays this game in a room of 60 students, on shared devices, in pairs).

Companion doc: `balance-recalibration-plan.md` (outcome balance). This doc is about
**not losing a finished run**. They are separate problems; fixing one does not fix
the other.

---

## 1. The problem

A run lives only in a module-local variable. Nothing persists it.

- `player.js:18` — `var state = null;`
- `player.js:1002` — `restartGame()` reassigns it
- `player.js:1016` — `beginPlay()` reassigns it

`ChoicesEngine.createState(scenario)` (`engine.js:69`) returns a plain object
(`current`, `dims`, `history`, `finished`, `endingId`). Nothing writes it to
`localStorage`, `sessionStorage`, IndexedDB, a URL parameter, or anywhere else.

The only thing in the whole codebase that touches storage is an easter egg:

- `player.js:1152` — `localStorage.setItem('choices.eggFound', '1')`

So **any navigation away from a run destroys it.** The affordance that does this is
one button:

- `index.html:84` — `↻ 换一个创业题材` / "Shuffle scenario"
- → `player.js:936` — `shuffle.onclick = function () { pendingId = pickScenarioId(true); loadAndStart(pendingId); }`
- → `player.js:1034-1037` — `pickScenarioId(true)` deliberately **excludes the current scenario**,
  so this button always lands you somewhere new
- → `beginPlay()` → `state = createState(scenario)` — the old `state` is gone

There is **no warning, no confirmation, and no undo.** A student who is 6 decisions
into a run, clicks the wrong thing, and loses it silently. In a lecture hall with
60 people on 30 devices that will happen.

### Why it matters specifically for this game

The endings are reached through a deliberate sequence — roughly 7–9 decisions per
run out of 21 nodes, 2–3 options per node. "Which step made it unavoidable?" is only
answerable because the run is intact and deterministic (no dice anywhere in play).
A dropped run cannot be reconstructed from the ending alone.

The **export** is the only durable record, and it is manual:

- `player.js:703` `buildMarkdown()` → score ledger, decision trail, ending debrief
- `player.js:821` `buildJSON()` → same facts as JSON
- `player.js:841` `download()` → triggers a browser download
- `player.js:641` `exportBaseName()` → `choices-<scenarioId>-<stamp>` — **good:
  exports do not overwrite each other across scenarios**

So export is a usable safety net, but it is one button the student has to know to
press *before* switching. Until persistence lands, that has to be taught
explicitly.

---

## 2. What to build

Persist one run per scenario, restore it on load, and never silently destroy one.

### 2.1 Storage key and shape

```js
var SAVE_PREFIX = 'choices.run.';   // e.g. choices.run.ai-fitness
```

```js
// save
localStorage.setItem(SAVE_PREFIX + scenario.id, JSON.stringify({
  v: 1,                        // schema version — bump when state shape changes
  savedAt: Date.now(),
  scenarioId: scenario.id,
  state: state                 // { current, dims, history, finished, endingId }
}));
```

Persist **only when `state` is non-null and `state.current` refers to a node that
still exists in `scenario.nodes`.** A run saved against a scenario that has since
been edited must be discarded, not restored into a broken node.

### 2.2 Where to hook the save

Save on every **change** to `state`, not on every read. The points that matter:

- wherever a choice is applied and `state.history.push(...)` runs, immediately after
  the resulting dimension values are written
- `player.js:868` `renderEnding()` — a finished run is the one most worth keeping
- `player.js:391` `renderNode()` — do **not** save here; it runs on plain re-renders

Do **not** save from `beginPlay()` (`player.js:1011`) or `restartGame()`
(`player.js:1001`). Both assign a brand-new `state` — that is a reset, and persisting
it would overwrite the run you were trying to save. `restartGame()` instead should
*clear* that scenario's key, per §2.4.

### 2.3 Where to hook the restore

In `beginPlay()` (`player.js:1011`), after `state = createState(scenario)`:

1. read `choices.run.<id>`
2. if present, `v` matches, and `state.current` is a real node → use the saved state
3. else → keep the fresh state and clear the stale key

Then show the student what happened. If a run was restored, say so on the stage —
otherwise a restored run looks like a bug and they will click restart to "fix" it,
destroying it again.

### 2.4 Do not lose the run on scenario switch

This is the part that is not just "save more often". `index.html:84`'s button
currently destroys state by construction.

- Before switching, **write the current run to storage first** (see 2.2).
- On the next scenario's start screen, offer **"继续上一局 / Resume"** alongside
  "开始新的一局 / New run", for that scenario only.
- `restartGame()` (`player.js:1001`) is an explicit user action, so destroying the
  in-memory run there is correct — but it must also clear that scenario's saved copy,
  or a restored-then-restarted run will reappear on next load.

### 2.5 A way out

Storage accumulates silently. Add a **"清除存档 / Clear saved runs"** control that
removes every `choices.run.*` key. Two or three lines; without it there is no way
to get a clean install on a shared lab machine.

---

## 3. Acceptance tests

Run these on the deployed Pages build, not locally only.

| # | Test | Expected |
|---|---|---|
| 1 | Play 3 decisions in `?scenario=ai-fitness`, then click **换一个题材** | Return to `?scenario=ai-fitness`; a **Resume** option is offered; resuming restores all 3 decisions and the same dimension values |
| 2 | Play to an ending, reload the page | Ending and decision trail are intact |
| 3 | Play to an ending, export Markdown, switch scenario, play to another ending, export again | Two files, neither overwritten (already true — `exportBaseName` is per-scenario) |
| 4 | Export before the fix ships | File contains score ledger + full decision trail + ending debrief |
| 5 | Click **清除存档**, reload | Back to a fresh run for every scenario |
| 6 | Edit a scenario so a saved `current` node no longer exists, then load | Stale save discarded silently, fresh run offered, no exception |
| 7 | Two tabs, same scenario | Each tab keeps its own in-memory run; last write wins on storage (acceptable — do not attempt cross-tab sync) |

## 4. Do not

- **Do not** add a backend. The game is static on GitHub Pages and must stay so.
- **Do not** store the whole scenario object. Only `state`, keyed by scenario id.
- **Do not** add cross-tab or cross-device sync. Local per-browser is the whole point.
- **Do not** change the export format while doing this. `balance-recalibration-plan.md`
  and any marking scheme may depend on the current Markdown/JSON shape.
- **Do not** treat this as the balance fix. Outcomes are still 89% failure
  (`stalled` 0.10–0.51%, `win_clean` 0.01–0.03%, and four of six scenarios share an
  identical effects multiset). See that doc.

## 5. Fallback while this is not built

The teaching materials instruct: **export the report before switching scenarios.**
The export button reads **「下载 Markdown 报告」 / "Download Markdown report"** and sits
in the block titled **「导出这一局的复盘报告」 / "Export this run for review"**, at the
end of every run. Keep that instruction on the slide until persistence lands.