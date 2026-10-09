# Vibe-coding guide — 一念之差 · Choices

> How this project was built with an AI coding tool, the design thinking behind it, and a complete prompt you can paste into an AI coding assistant to reproduce (or adapt) it for your own classroom.



---

## 1. What "vibe-coding" means here

You don't start by specifying functions and classes. You start from the **vibe** — the feeling and the learning goal you want — and let the AI draft the architecture, the code, and the docs. You then steer with **hard constraints** and **validate** the output. For an educational tool, the two things that matter most are:

1. **Constraints that can't be violated** (e.g. "it must be a static site", "cause → ending must be deterministic").
2. **A validator you can run**, so AI-generated content can't silently break the experience.

This repo was built exactly that way, in short iterative turns, each checked with `node test.js` and `node validate.js`.

---

## 2. Design thinking

The project follows the Stanford d.school design-thinking model — empathise, define, ideate, prototype, test — applied to one problem: students don't *feel* how a small, ordinary decision can cross a legal, ethical, or national-security red line, because being told "don't do X" is forgettable.

| Stage            | This project's arc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Empathise** | Many students struggle to feel how an everyday decision can cross a legal, ethical, or national-security line. Abstract warnings rarely land; learners disengage, rush through, or avoid the topic. Observation: interactive, game-like experiences hold attention far longer than lecture warnings, and letting learners *see* a consequence (the risk numbers move) makes the lesson stick. The classroom need: a reusable, low-barrier tool for EdUHK's GEL2026 / GEL1032 courses.                                                                                                                     |
| **2. Define**    | **Problem statement:** *students lack an experiential grasp of how ordinary choices escalate into legal, ethical, or national-security risk.* **Design goal:** a safe, repeatable, low-barrier experience where each choice visibly changes risk and deterministically leads to a corresponding ending. **Success criterion:** a student can replay a scenario and trace exactly which single choice pushed a risk past the threshold.                                                                                                                                                                    |
| **3. Ideate**    | Options considered: lecture + case study, graded quiz with feedback, role-play, branching-narrative game. The interactive branching-narrative (game) format was chosen because it makes causality visible and repeatable, lowers the barrier with a familiar arcade frame, and cleanly separates a generic engine from pluggable topic data so the tool can be reused across courses (internship, research, …).                                                                                                                                                                                           |
| **4. Prototype** | A static, front-end-only web app — vanilla HTML/CSS/JS, no build, no backend. A deterministic engine (`engine.js`) tracks **two scoreboards** (a risk track and a Lean-Canvas venture track) and applies explicit `effects` (no RNG); a validator (`validate.js`) proves no dead-ends, that every ending is reachable, and that each story runs at least ten rounds; six venture scenario packets in `scenarios/` share one endings file (`endings-core.json`) with full debriefs; a player (`player.js` + `index.html` + `styles.css`) renders the narrative, the dual-track dashboard, endings with debriefs, and the Decision Trail with a retro arcade skin. Bilingual ZH / EN, with all scenarios embedded so the file also works on double-click (`file://`). |
| **5. Test**      | Tested locally and on mobile; iterated on readability, the centred single-column arcade layout, the language toggle, touch press-feedback, and the opening sound. Ran `node test.js` (searches a triggering path for every ending in every scenario and replays it to confirm determinism — 6 scenarios × 9 endings) and `node validate.js` (no dead-ends; all endings reachable; ≥ 10 decision rounds). The Decision Trail panel and the validator are the pedagogical test instruments — they make the causal chain explicit and catch broken scenes before class.                                                                                                                                                               |

### Design constraints (from Define)

These shaped every later decision:

1. **Static site** — no backend, deployable to GitHub Pages; works offline by double-clicking the file. This ruled out Streamlit and any server dependency.
2. **Generic engine + pluggable JSON scenarios** — add ventures as data packets; never touch the engine. Six scenario packs ship with the game; each play randomly draws one (randomness exists ONLY for this draw — never inside a story).
3. **Deterministic causality** — no dice, no RNG in play; educational stakes must not be luck.
4. **Dual-track scoring** — every choice feeds a risk track (lower is better) AND a Lean-Canvas venture track (higher is better), so "always pick the safe option" is not a winning strategy. Endings are gated by both tracks together.
5. **Bilingual ZH / EN** — same experience, toggle anytime.
6. **Reflection optional** — the teacher facilitates it; the engine doesn't force it. AI can author the scenario text.

### Why an arcade skin (from Ideate)

The topic (national security / law / ethics) is "serious". A retro neon arcade frame makes it feel like a game, lowers the barrier, and makes "one thought away" (一念之差) viscerally game-like. The visual style here is inspired by classic arcade games (see also the sibling demo *MathInvaders*).

---

## 3. How it was built (iterative + validated)

1. **Research comparables** — Ink, Twine, ChoiceScript, Liberty Park, NetStrider, storylet frameworks. Conclusion: adopt the *engine / data separation* pattern; build with vanilla JS so it stays static and teachable.
2. **Deterministic engine** (`engine.js`) — dimensions/state, explicit `effects`, condition-gated endings, decision-trail recording. No RNG anywhere.
3. **Scenario schema + six venture scenarios** (`scenarios/*.json` + `manifest.json`) — six dimensions in two groups (risk / venture), twelve-plus decision rounds each, per-choice `why` notes, and a shared endings file (`endings-core.json`) with full debriefs (trigger / trade-off / stakeholders / mitigations / Lean Canvas / legal hooks).
4. **Causal / path validator** (`validate.js`) — proves no dead-ends and that every ending is reachable (BFS over the state space). Great safety net when AI writes scenes.
5. **Static player** (`player.js` + `index.html` + `styles.css`) — fetch loads the scenario, renders narrative/choices/risk bars/ending/trail.
6. **Bilingual + header toggle** — every string becomes `{zh,en}`; one global language state; clicking either language advances the *same* engine state.
7. **`file://` support** — embedded a copy of the scenario in `index.html` so double-clicking works despite browser CORS rules on local `fetch`.
8. **Arcade reskin** — neon HUD with segmented "health-bar" risk meters, CRT scanlines, blocky drop-shadow choice buttons, a **PRESS START** intro screen. The pixel display font (Press Start 2P) is kept only for the large start-screen logo and PRESS START button; all other text uses a legible tech font (Chakra Petch + system CJK fallbacks) after playtesting showed small pixel text was unreadable.
9. **This README + vibe-coding guide** — restructured to the EdTech "house format" (motivation → features → design → run → limits → docs → licence).

Every step was checked with `node test.js` and `node validate.js` before committing.

---

## 4. The reproducible prompt

Paste this into an AI coding assistant. It reproduces the architecture and the educational guarantees; swap the topic to fit your class.

```markdown
Build a **static, front-end-only interactive branching-narrative simulator** for classroom teaching. Repository name: Choices. No build step, no backend, no API key. Vanilla HTML/CSS/JS only.

## Problem statement (context / design intent)
The goal is to help students *feel* how a small, ordinary decision can escalate into a legal, ethical, or national-security risk. Abstract warnings ("don't do X") are forgettable; an interactive experience where the learner sees risk numbers move and reaches a concrete ending is not. The simulator is built for EdUHK's GEL2026 Technology Entrepreneurship in AI-enhanced Business and National Security (and also GEL1032). It must be reusable across topics: the engine is generic, and each scenario is an independent JSON data packet the teacher can swap.

## Core design / learning model
- Branching narrative: the student reads a node's text, picks one of several choices, and is taken to the next node or an ending.
- Deterministic causality (the pedagogical core): every choice applies explicit numeric `effects` to the dimensions — NO randomness, NO dice, NO RNG anywhere inside a story. The same choice sequence ALWAYS reaches the same ending. Randomness is allowed ONLY to draw which scenario the player runs (and `?scenario=<id>` must be able to pin it).
- DUAL-TRACK scoring (the design answer to "students just pick the safe option"): a risk track (National Security / Legal / Ethics, 0-10, `higherIsRisk: true`) and a venture track mapped to the Lean Canvas (Problem-solution fit, Business model, Moat; 0-10, `higherIsRisk: false`). Every choice feeds both. A dashboard shows the two groups with opposite colour logic (risk red past threshold; venture green when strong).
- Endings gated by joint conditions on BOTH tracks, producing a 2x2 outcome space: sustainable success / clean-but-stalled / growth-then-crackdown / double loss — plus per-dimension fail variants. Every ending must be reachable and every path must terminate (no dead-ends).
- Requirement-gated choices: some responsible options carry `requirements` (e.g. the compliance audit needs business >= 7). A locked button must show a `lockedHint` explaining WHY it is unavailable — that explanation is the lesson.
- Every choice carries a `why` note (bilingual) explaining why it moves each dimension; the Decision Trail replays step -> effect -> why.
- Every ending carries a full bilingual debrief: why it fired, the trade-off made, stakeholders affected (who + impact), concrete mitigations, a Lean Canvas reading, and legal/regulatory hooks — so a run doubles as a draft outline for a reflective essay.
- Each story must contain at least TEN decision rounds (validator warns below 10).
- Reflection prompts are OPTIONAL per ending (teacher-led in class).

## Visual / style
- Retro ARCADE theme to lower the barrier on a "serious" topic and make "one thought away" (一念之差) viscerally game-like.
- Arcade display font (Press Start 2P) for the start-screen logo and PRESS START button only; a legible tech font (Chakra Petch + system CJK fallbacks) everywhere else, CRT scanlines, neon palette (cyan/magenta/yellow), blocky drop-shadow buttons, a "PRESS START" intro overlay.
- Hover highlights are gated behind `@media (hover: hover) and (pointer: fine)` so touch devices never show a stuck "pre-selected" choice; on touch, a tap shows a brief pressed state (class added on pointerdown) BEFORE the story advances, so the tap feels acknowledged.
- Dual-track dashboard = segmented neon "health-bar" meters in two labelled groups (risk / venture); danger pulse only on the risk track.
- The start screen shows which venture was drawn ("this round") with a one-line hook and a shuffle button.
- Responsive: desktop and mobile; centre the play area in a single column on desktop.

## Language
- Bilingual ZH / EN: every player-facing string is { "zh": "...", "en": "..." }. A header toggle switches the whole UI (narrative, choices, endings, trail, labels) between ZH and EN, sharing one engine state. The opening screen shows both languages side by side (no toggle needed there).

## Technical constraints
- Must run by double-clicking index.html (file://) AND from a static server / GitHub Pages.
- Engine and content are SEPARATE: the engine is generic; each venture is an independent JSON data packet in scenarios/, listed in scenarios/manifest.json. Endings (with their debriefs) live in ONE shared file (scenarios/endings-core.json) reused by every scenario, so all ventures share one outcome system.
- No framework, no build, no bundler; vanilla HTML/CSS/JS only.
- Works offline: embed the manifest, the shared endings and ALL scenarios inside index.html (in <script type="application/json"> blocks) so the file works despite browser CORS rules on local fetch. Provide a small script (e.g. tools/embed-scenarios.py) that regenerates those blocks from scenarios/ so they never drift.

## Files
- engine.js — pure logic, no DOM: createState(scenario), currentNode, availableChoices, choose(state, i) applying effects, getEnding(state). Records a decision trail (node, choice text, choiceIndex, effect deltas, score snapshot).
- validate.js — given a scenario (plus optional shared endings), prove: every non-ending node has an exit; every `next`/ending reference exists; every ending is reachable (BFS); every story runs >= 10 decision rounds; warn (not fail) on missing `why` / `lockedHint` / `analysis`. Return {ok, errors[], warnings[], maxDepth}.
- player.js — load scenarios/manifest.json, draw one scenario at random (respect ?scenario=<id>), load the shared endings, render the current node's narrative + choice buttons (pressed-state feedback on touch), the dual-track dashboard, the ending screen WITH the full debrief, and a Decision Trail with per-choice why notes. Header language toggle. A PRESS START intro that plays an opening sound effect (no other sounds afterwards).
- index.html — embeds the manifest, shared endings and all scenario copies for offline use; loads engine.js/validate.js/player.js.
- styles.css — retro ARCADE theme (as above). Responsive (desktop + mobile).
- scenarios/manifest.json — the pack list: id, file, bilingual title and one-line hook per venture.
- scenarios/endings-core.json — the SHARED endings: 9 endings gated by joint conditions on risk and business scores, each with trigger / trade-off / stakeholders / mitigation / canvas / legal debrief fields, all bilingual.
- scenarios/*.json — one file per venture (e.g. ai-fitness.json, ai-hiring.json, ai-avatar.json, edu-analytics.json, drone-inspection.json, trade-doc-ai.json): dimensions (two groups), acts, 12+ decision nodes, per-choice why notes, endingFlavor for scenario-specific colour.

## Scenario JSON shape
{
  "dimensions": {
    "national_security": { "label": {"zh":"…","en":"National security risk"}, "initial":0,"min":0,"max":10,"higherIsRisk":true,"group":"risk","icon":"🛡️" },
    "business":          { "label": {"zh":"…","en":"Business model"},          "initial":2,"min":0,"max":10,"higherIsRisk":false,"group":"venture","icon":"💰" }
  },
  "start": "intro",
  "nodes": { "intro": { "act":"act1", "text":{"zh":"…","en":"…"}, "choices":[ {"text":{"zh":"…","en":"…"},"next":"next_id","effects":{"business":2,"ethics":1},"why":{"zh":"…","en":"…"},"requirements":{"business":">=7"},"lockedHint":{"zh":"…","en":"…"}} ] } },
  "endingFlavor": { "boom_ns": {"zh":"…","en":"…"} }
}

## Implementation details
- The engine advances nodes by player choices; keep no hidden state beyond the documented dimensions and the decision trail.
- Endings are selected by FIRST match in declaration order against the joint conditions — order the shared endings so specific compound conditions (e.g. risk >= 5 AND business >= 6) are checked before the broader ones, and make sure the whole space is covered so no terminal state is unmatched.
- The validator uses BFS over the (node, dimension-vector) state space to prove reachability and the absence of dead-ends; run it before shipping any scenario.
- The player renders the SAME engine state for both languages; switching language never re-runs the engine.
- Opening sound only: a short arcade "power-on" arpeggio on PRESS START; no choice or ending sounds.
- Re-run tools/embed-scenarios.py after editing any scenario so the offline copy stays in sync.

## Deliverables to verify
- `node test.js` searches a triggering path for EVERY ending in EVERY scenario and replays each path twice, confirming identical outcomes (6 scenarios x 9 endings).
- `node validate.js scenarios/<one>.json scenarios/endings-core.json` reports no dead-ends, all endings reachable, and a decision chain of at least 10 rounds.
- Opening index.html draws a random venture (start card shows its title and hook; shuffle changes it), the dual-track dashboard updates on each choice, the Decision Trail shows why-notes, the ending screen shows the full debrief, the same sequence always yields the same ending, the ZH/EN toggle works, the opening sound plays once on start, and touch devices get pressed-state feedback without stuck highlights.
```

---

## 5. Classroom activity idea

- **Author-a-scenario lab:** have students draft a *new* venture scenario JSON (e.g. an internship or a research-integrity dilemma) together with the AI, then run `node validate.js` on it. Discuss any unreachable endings or dead-ends the validator finds — that *is* the lesson about consequence and completeness.
- **Consequence debrief:** after a playthrough, open the Decision Trail and ask "which single choice pushed the risk past the threshold — and what did that same choice buy the business?" The per-choice why-notes make the causal chain explicit on both tracks.
- **Debrief-to-essay bridge:** each ending's debrief (trigger / stakeholders / mitigation / legal hooks) is a ready-made skeleton for the reflective essay; have students rewrite it in their own words with the actual legal texts cited.

---

## 6. Tips

- Keep `effects` explicit and never use randomness for educational stakes; reproducibility is the point.


- Always run the validator before publishing a scenario, especially one written by an AI.
- The embedded copy in `index.html` must be re-synced whenever you edit `scenarios/*.json` and still want the offline double-click build to match.
- Treat the arcade skin as motivation, not distraction: the dual-track dashboard + Decision Trail + ending debrief are where the learning lives.
