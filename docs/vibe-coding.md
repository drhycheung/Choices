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

**The problem.** Students often don't *feel* how a small, ordinary decision can cross a legal, ethical, or national-security line. Telling them "don't do X" is forgettable. Letting them *live* the consequence — and see the numbers move — is not.

**The core insight.** A branching narrative becomes a teaching instrument only if the **causality is real and visible**:
- choice → explicit effect (no randomness) → risk score → ending.
- The same sequence of choices *always* reaches the same ending (reproducible, explainable, testable).

**The hard constraints we set up front** (these shaped every later decision):
1. **Static site** — no backend, deployable to GitHub Pages, works in China (no Google services). This ruled out Streamlit and any server dependency.
2. **Generic engine + pluggable JSON scenarios** — add topics (internship, research, …) as data packets, never touch the engine.
3. **Deterministic causality** — no dice, no RNG; educational stakes must not be luck.
4. **Bilingual ZH / EN** — same screen, toggle anytime.
5. **Reflection optional** — the teacher facilitates it; the engine doesn't force it. AIs can author the scenario text.

**Why an arcade skin.** The topic (national security / law / ethics) is "serious". A retro neon arcade frame makes it feel like a game, lowers the barrier, and makes "one thought away" (一念之差) viscerally game-like. The visual style here is inspired by classic arcade games (see also the sibling demo *MathInvaders*).

---

## 3. How it was built (iterative + validated)

1. **Research comparables** — Ink, Twine, ChoiceScript, Liberty Park, NetStrider, storylet frameworks. Conclusion: adopt the *engine / data separation* pattern; build with vanilla JS so it stays static and teachable.
2. **Deterministic engine** (`engine.js`) — dimensions/state, explicit `effects`, condition-gated endings, decision-trail recording. No RNG anywhere.
3. **Scenario schema + first scenario** (`scenarios/student-startup.json`) — three risk dimensions, multiple branches, five endings.
4. **Causal / path validator** (`validate.js`) — proves no dead-ends and that every ending is reachable (BFS over the state space). Great safety net when AI writes scenes.
5. **Static player** (`player.js` + `index.html` + `styles.css`) — fetch loads the scenario, renders narrative/choices/risk bars/ending/trail.
6. **Bilingual + header toggle** — every string becomes `{zh,en}`; one global language state; clicking either language advances the *same* engine state.
7. **`file://` support** — embedded a copy of the scenario in `index.html` so double-clicking works despite browser CORS rules on local `fetch`.
8. **Arcade reskin** — pixel font (Press Start 2P), CRT scanlines, neon HUD with segmented "health-bar" risk meters, blocky drop-shadow choice buttons, a **PRESS START** intro screen.
9. **This README + vibe-coding guide** — restructured to the EdTech "house format" (motivation → features → design → run → limits → docs → licence).

Every step was checked with `node test.js` and `node validate.js` before committing.

---

## 4. The reproducible prompt

Paste this into an AI coding assistant. It reproduces the architecture and the educational guarantees; swap the topic to fit your class.

````markdown
Build a **static, front-end-only interactive branching-narrative simulator** for education. Repository name: Choices. No build step, no backend, no API key. Vanilla HTML/CSS/JS only.

## Hard constraints (do not violate)
- Must run by double-clicking index.html (file://) AND from a static server / GitHub Pages.
- Engine and content are SEPARATE: the engine is generic; each scenario is an independent JSON data packet in scenarios/.
- Causality is DETERMINISTIC: a choice applies explicit numeric `effects` to risk dimensions; NO randomness/dice anywhere. The same choice sequence always reaches the same ending.
- Player-facing text is bilingual: every string is { "zh": "...", "en": "..." }. A header toggle switches the whole UI (narrative, choices, endings, trail, labels) between ZH and EN, sharing one engine state.
- Reflection prompts are OPTIONAL per ending.

## Files
- engine.js — pure logic, no DOM: createState(scenario), currentNode, availableChoices, choose(state, i) applying effects, getEnding(state). Records a decision trail (choice + effect + score snapshot).
- validate.js — given a scenario, prove: every non-ending node has an exit; every `next`/ending reference exists; every ending is reachable (BFS); no "choice with zero effect" unless explicitly narrative-only. Return {ok, errors[], warnings[]}.
- player.js — fetch the scenario JSON (fall back to an embedded copy inside index.html when file://), render the current node's narrative + choice buttons, a Risk Monitor (segmented bars per dimension, danger pulse past threshold), the ending screen, and a Decision Trail. Header language toggle.
- index.html — embeds a default scenario copy in a <script type="application/json"> for offline use; loads engine.js/validate.js/player.js.
- styles.css — retro ARCADE theme: pixel font (Press Start 2P), CRT scanlines, neon palette (cyan/magenta/yellow), blocky drop-shadow buttons, a "PRESS START" intro overlay. Responsive (desktop + mobile).
- scenarios/student-startup.json — first scenario: a student entrepreneur facing National Security / Law / Ethics risk choices; three risk dimensions (0–10, higherIsRisk); 5 endings (success / per-dimension fail / compromise) gated by conditions like { "national_security": ">=5" }.

## Scenario JSON shape
{
  "dimensions": { "national_security": { "label": {"zh":"…","en":"National Security Risk"}, "initial":0,"min":0,"max":10,"higherIsRisk":true,"icon":"🛡️" } },
  "start": "intro",
  "nodes": { "intro": { "text":{"zh":"…","en":"…"}, "choices":[ {"text":{"zh":"…","en":"…"},"next":"next_id","effects":{"national_security":2}} ] } },
  "endings": { "fail_ns": { "title":{"zh":"…","en":"…"}, "type":"fail", "condition":{"national_security":">=5"}, "text":{"zh":"…","en":"…"}, "reflection":{"zh":"…","en":"…"} } }
}

## Deliverables to verify
- `node test.js` runs several choice paths and prints the ending + final scores.
- `node validate.js scenarios/student-startup.json` reports no dead-ends and all endings reachable.
- Opening index.html shows the arcade UI, the Risk Monitor updates on each choice, the same sequence always yields the same ending, and the ZH/EN toggle works.
````

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
