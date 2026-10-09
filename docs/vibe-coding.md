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
| **4. Prototype** | A static, front-end-only web app — vanilla HTML/CSS/JS, no build, no backend. A deterministic engine (`engine.js`) tracks risk dimensions and applies explicit `effects` (no RNG); a validator (`validate.js`) proves no dead-ends and that every ending is reachable; a scenario JSON packet (`scenarios/student-startup.json`) holds the first story; a player (`player.js` + `index.html` + `styles.css`) renders the narrative, Risk Monitor, endings, and Decision Trail with a retro arcade skin. Bilingual ZH / EN, with the scenario embedded so the file also works on double-click (`file://`). |
| **5. Test**      | Tested locally and on mobile; iterated on readability, the centred single-column arcade layout, the language toggle, and the opening sound. Ran `node test.js` (multiple paths reach their expected endings) and `node validate.js` (no dead-ends; all five endings reachable). The Decision Trail panel and the validator are the pedagogical test instruments — they make the causal chain explicit and catch broken scenes before class.                                                                                                                                                               |

### Design constraints (from Define)

These shaped every later decision:

1. **Static site** — no backend, deployable to GitHub Pages; works offline by double-clicking the file. This ruled out Streamlit and any server dependency.
2. **Generic engine + pluggable JSON scenarios** — add topics as data packets; never touch the engine.
3. **Deterministic causality** — no dice, no RNG; educational stakes must not be luck.
4. **Bilingual ZH / EN** — same experience, toggle anytime.
5. **Reflection optional** — the teacher facilitates it; the engine doesn't force it. AI can author the scenario text.

### Why an arcade skin (from Ideate)

The topic (national security / law / ethics) is "serious". A retro neon arcade frame makes it feel like a game, lowers the barrier, and makes "one thought away" (一念之差) viscerally game-like. The visual style here is inspired by classic arcade games (see also the sibling demo *MathInvaders*).

---

## 3. How it was built (iterative + validated)

1. **Research comparables** — Ink, Twine, ChoiceScript, Liberty Park, NetStrider, storylet frameworks. Conclusion: adopt the *engine / data separation* pattern; build with vanilla JS so it stays static and teachable.
2. **Deterministic engine** (`engine.js`) — dimensions/state, explicit `effects`, condition-gated endings, decision-trail recording. No RNG anywhere.
3. **Scenario schema + first scenario** (`scenarios/student-startup.json`) — three risk dimensions, multiple branches, five endings.
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
- Deterministic causality (the pedagogical core): every choice applies explicit numeric `effects` to risk dimensions — NO randomness, NO dice, NO RNG anywhere. The same choice sequence ALWAYS reaches the same ending. This makes the cause -> effect chain reproducible, explainable, and testable.
- Risk dimensions: each scenario defines a few axes (e.g. National Security / Law / Ethics), each scored 0-N with `higherIsRisk`. The Risk Monitor shows each axis as a segmented bar; crossing the threshold triggers a visible danger state.
- Multiple endings gated by conditions on the risk scores (e.g. { "national_security": ">=5" }): success, per-dimension failure, and compromise. Every ending must be reachable and every path must terminate (no dead-ends).
- Decision Trail: record each choice + its effect + the resulting scores, and replay it on the result screen so the causal chain is explicit.
- Reflection prompts are OPTIONAL per ending (teacher-led in class).

## Visual / style
- Retro ARCADE theme to lower the barrier on a "serious" topic and make "one thought away" (一念之差) viscerally game-like.
- Arcade display font (Press Start 2P) for the start-screen logo and PRESS START button only; a legible tech font (Chakra Petch + system CJK fallbacks) everywhere else, CRT scanlines, neon palette (cyan/magenta/yellow), blocky drop-shadow buttons, a "PRESS START" intro overlay.
- Hover highlights are gated behind `@media (hover: hover) and (pointer: fine)` so touch devices never show a stuck "pre-selected" choice.
- Risk Monitor = segmented neon "health-bar" meters per dimension with a danger pulse past the threshold.
- Responsive: desktop and mobile; centre the play area in a single column on desktop.

## Language
- Bilingual ZH / EN: every player-facing string is { "zh": "...", "en": "..." }. A header toggle switches the whole UI (narrative, choices, endings, trail, labels) between ZH and EN, sharing one engine state. The opening screen shows both languages side by side (no toggle needed there).

## Technical constraints
- Must run by double-clicking index.html (file://) AND from a static server / GitHub Pages.
- Engine and content are SEPARATE: the engine is generic; each scenario is an independent JSON data packet in scenarios/.
- No framework, no build, no bundler; vanilla HTML/CSS/JS only.
- Works offline: embed a copy of the default scenario inside index.html (in a <script type="application/json"> or similar) so the file works despite browser CORS rules on local fetch.

## Files
- engine.js — pure logic, no DOM: createState(scenario), currentNode, availableChoices, choose(state, i) applying effects, getEnding(state). Records a decision trail (choice + effect + score snapshot).
- validate.js — given a scenario, prove: every non-ending node has an exit; every `next`/ending reference exists; every ending is reachable (BFS); no "choice with zero effect" unless explicitly narrative-only. Return {ok, errors[], warnings[]}.
- player.js — fetch the scenario JSON (fall back to the embedded copy when file://), render the current node's narrative + choice buttons, a Risk Monitor (segmented bars per dimension, danger pulse past threshold), the ending screen, and a Decision Trail. Header language toggle. A PRESS START intro that plays an opening sound effect (no other sounds afterwards).
- index.html — embeds a default scenario copy for offline use; loads engine.js/validate.js/player.js.
- styles.css — retro ARCADE theme (as above). Responsive (desktop + mobile).
- scenarios/student-startup.json — first scenario: a student entrepreneur facing National Security / Law / Ethics risk choices; three risk dimensions (0-10, higherIsRisk); 5 endings (success / per-dimension fail / compromise) gated by conditions like { "national_security": ">=5" }.

## Scenario JSON shape
{
  "dimensions": { "national_security": { "label": {"zh":"…","en":"National Security Risk"}, "initial":0,"min":0,"max":10,"higherIsRisk":true,"icon":"🛡️" } },
  "start": "intro",
  "nodes": { "intro": { "text":{"zh":"…","en":"…"}, "choices":[ {"text":{"zh":"…","en":"…"},"next":"next_id","effects":{"national_security":2}} ] } },
  "endings": { "fail_ns": { "title":{"zh":"…","en":"…"}, "type":"fail", "condition":{"national_security":">=5"}, "text":{"zh":"…","en":"…"}, "reflection":{"zh":"…","en":"…"} } }
}

## Implementation details
- The engine advances nodes by player choices; keep no hidden state beyond the documented risk dimensions and the decision trail.
- The validator uses BFS over the node graph to prove reachability and the absence of dead-ends; run it before shipping any scenario.
- The player renders the SAME engine state for both languages; switching language never re-runs the engine.
- Opening sound only: a short arcade "power-on" arpeggio on PRESS START; no choice or ending sounds.

## Deliverables to verify
- `node test.js` runs several choice paths and prints the ending + final scores.
- `node validate.js scenarios/student-startup.json` reports no dead-ends and all endings reachable.
- Opening index.html shows the arcade UI (bilingual opening screen), the Risk Monitor updates on each choice, the same sequence always yields the same ending, the ZH/EN toggle works, and the opening sound plays once on start.
```

---

## 5. Classroom activity idea

- **Author-a-scenario lab:** have students draft a *new* scenario JSON (e.g. an internship or a research-integrity dilemma) together with the AI, then run `node validate.js` on it. Discuss any unreachable endings or dead-ends the validator finds — that *is* the lesson about consequence and completeness.
- **Consequence debrief:** after a playthrough, open the Decision Trail and ask "which single choice pushed the risk past the threshold?" — makes the causal chain explicit.

---

## 6. Tips

- Keep `effects` explicit and never use randomness for educational stakes; reproducibility is the point.


- Always run the validator before publishing a scenario, especially one written by an AI.
- The embedded copy in `index.html` must be re-synced whenever you edit `scenarios/*.json` and still want the offline double-click build to match.
- Treat the arcade skin as motivation, not distraction: the Risk Monitor + Decision Trail are where the learning lives.
