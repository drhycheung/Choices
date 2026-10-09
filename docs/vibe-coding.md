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
| **1. Empathise** | GEL2026 runs two strands side by side — technology entrepreneurship (digital value creation, AI business models, Lean Canvas planning, pitching) and national security education (data, models and platforms touching legal, ethical and national-security red lines). Taught separately they produce two familiar failure modes: students write a business plan and bolt compliance on as a slide nobody reads, or they conclude that "security" simply means "don't do it". Neither is what the course wants. Observation: interactive, game-like experiences hold attention far longer than lecture warnings, and letting learners *see* a consequence (the numbers move) makes the lesson stick. |
| **2. Define**    | **Problem statement:** *students never have to hold "this is a good business" and "this is a red line" in the same hand at the same time.* **Design goal:** a safe, repeatable, low-barrier experience where every choice moves a risk track AND a Lean-Canvas venture track at once, and deterministically leads to a corresponding ending. **Success criterion:** a student can replay a run and answer three questions with evidence — which step pushed the risk up, which step made the venture stronger or weaker, and what that same choice cost on the other track. |
| **3. Ideate**    | Options considered: lecture + case study, graded quiz with feedback, role-play, branching-narrative game. The interactive branching-narrative (game) format was chosen because it makes causality visible and repeatable, lowers the barrier with a familiar arcade frame, and cleanly separates a generic engine from pluggable topic data so the tool can be reused across courses (internship, research, …). Six ventures rather than one, drawn at random, so replaying teaches the *structure* of the dilemma instead of the answer to one story. |
| **4. Prototype** | A static, front-end-only web app — vanilla HTML/CSS/JS, no build, no backend. A deterministic engine (`engine.js`) tracks **two scoreboards** (a risk track and a Lean-Canvas venture track) and applies explicit `effects` (no RNG); a validator (`validate.js`) proves no dead-ends, that every ending is reachable, and that each story runs at least ten rounds; six venture scenario packets in `scenarios/` share one endings file (`endings-core.json`) with full debriefs; a player (`player.js` + `index.html` + `styles.css`) renders the narrative, the dual-track dashboard, endings with debriefs, and the Decision Trail with a retro arcade skin. Every ending debrief **traces each number back to the exact step that moved it**. Bilingual ZH / EN, with all scenarios embedded so the file also works on double-click (`file://`). |
| **5. Test**      | Tested locally and on mobile; iterated on readability, the centred single-column arcade layout, the language toggle, touch press-feedback, and the opening sound. Ran `node test.js` (searches a triggering path for every ending in every scenario and replays it to confirm determinism — 6 scenarios × 9 endings) and `node validate.js` (no dead-ends; all endings reachable; ≥ 10 decision rounds). Playwright driving local Chrome ran both `http://` and `file://` sessions to check the dashboard, the trail, the debrief, the ZH/EN switch, the shuffle and the easter egg. Then a **narrative coherence pass**: every node was re-read in sequence to find plot threads that appeared without setup (the "biggest buyer", the three term sheets) and lines that assumed a branch the player may not have taken — those were rewritten to be branch-agnostic and properly seeded. The Decision Trail, the ending debrief and the validator are the pedagogical test instruments — they make the causal chain explicit and catch broken scenes before class. |

### Design constraints (from Define)

These shaped every later decision:

1. **Static site** — no backend, deployable to GitHub Pages; works offline by double-clicking the file. This ruled out Streamlit and any server dependency.
2. **Generic engine + pluggable JSON scenarios** — add ventures as data packets; never touch the engine. Six scenario packs ship with the game; each play randomly draws one (randomness exists ONLY for this draw — never inside a story).
3. **Deterministic causality** — no dice, no RNG in play; educational stakes must not be luck.
4. **Dual-track scoring** — every choice feeds a risk track (lower is better) AND a Lean-Canvas venture track (higher is better), so "always pick the safe option" is not a winning strategy. Endings are gated by both tracks together.
5. **Attribution, not just explanation** — a debrief that says "your ethics score was high" teaches nothing. Every ending must name the *steps* that produced the number: which decisions raised the risk, and which decisions moved each Canvas box and by how much. The data for this comes from the real decision trail, never from guesswork.
6. **Narrative continuity** — a branch that converges must still read coherently on every path. Nothing may appear without setup (no buyer, no term sheet, no incident out of nowhere), and no line may assume a branch the player did not take (do not describe a heat map to someone who built an AI coach).
7. **Bilingual ZH / EN** — same experience, toggle anytime. The start screen shows both languages at once, including the "this round" label.
8. **Reflection optional** — the teacher facilitates it; the engine doesn't force it. AI can author the scenario text.
9. **Neutral institutional voice** — the story says "the university"; the university's name is never spoken inside a scenario. Attribution lives in the README, not in the fiction.

### Why an arcade skin (from Ideate)

The topic (national security / law / ethics) is "serious". A retro neon arcade frame makes it feel like a game, lowers the barrier, and makes "one thought away" (一念之差) viscerally game-like. The visual style here is inspired by classic arcade games (see also the sibling demo *MathInvaders*).

---

## 3. How it was built (iterative + validated)

1. **Research comparables** — Ink, Twine, ChoiceScript, Liberty Park, NetStrider, storylet frameworks. Conclusion: adopt the *engine / data separation* pattern; build with vanilla JS so it stays static and teachable.
2. **Deterministic engine** (`engine.js`) — dimensions/state, explicit `effects`, condition-gated endings, decision-trail recording. No RNG anywhere.
3. **Scenario schema + six venture scenarios** (`scenarios/*.json` + `manifest.json`) — six dimensions in two groups (risk / venture), twelve-plus decision rounds each, per-choice `why` notes, and a shared endings file (`endings-core.json`) with full debriefs (trigger / trade-off / stakeholders / mitigations / Lean Canvas / legal hooks).
3b. **Coherence pass over the generated prose** — AI-authored scenes were re-read node by node. Threads that appeared without setup (the "biggest buyer", the three investors) were seeded one node earlier; lines that described an artefact belonging to another branch were rewritten to be branch-agnostic; stray non-target-language tokens and corrupted literals left by batch generation were swept out with a scanner before the JSON was allowed in.
4. **Causal / path validator** (`validate.js`) — proves no dead-ends and that every ending is reachable (BFS over the state space). Great safety net when AI writes scenes.
5. **Static player** (`player.js` + `index.html` + `styles.css`) — fetch loads the scenario, renders narrative/choices/risk bars/ending/trail.
6. **Bilingual + header toggle** — every string becomes `{zh,en}`; one global language state; clicking either language advances the *same* engine state.
7. **`file://` support** — embedded a copy of the scenario in `index.html` so double-clicking works despite browser CORS rules on local `fetch`.
8. **Arcade reskin** — neon HUD with segmented "health-bar" risk meters, CRT scanlines, blocky drop-shadow choice buttons, a **PRESS START** intro screen. The pixel display font (Press Start 2P) is kept only for the large start-screen logo and PRESS START button; all other text uses a legible tech font (Chakra Petch + system CJK fallbacks) after playtesting showed small pixel text was unreadable.
9. **Ending debrief gets attribution** — the debrief now reads the player's own history and appends, under the trigger section, the steps that raised the risk; and under the Canvas section, each Canvas box with the two steps that moved it most and the signed delta. Nothing is authored — it is all derived from `effects`, so it stays true however the story is rewritten.
10. **Easter egg** — ↑↑↓↓←→←→BA on the start screen (or seven taps on the logo on a phone) opens a note about how the game works: no randomness inside a run, and exactly one path per venture that finishes with zero risk and all three venture boxes at 7+. It changes no state and no ending.
11. **This README + vibe-coding guide** — restructured to the EdTech "house format" (motivation → course → design philosophy → features → design → run → limits → docs → licence).

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
- ATTRIBUTION: the debrief must also trace each number back to the player's actual decisions — under "why it fired", name the steps that pushed the risk lines up (step number, choice text, signed delta); under the Lean Canvas section, list each Canvas box with the two steps that moved it most. Derive this from the recorded decision trail and the explicit `effects`; never author it as prose that could drift out of sync with the numbers.
- Each story must contain at least TEN decision rounds (validator warns below 10).
- NARRATIVE COHERENCE: every node must read correctly on ANY path to it. Seed every thread one node before it is used (if a later choice says "build what the biggest buyer wants", an earlier node must have introduced that buyer; if the finale asks whether to take money from three funds, the previous node must have put those three term sheets on the table). Never describe an artefact that only exists on another branch ("your heat map" when the player may have built the coach) — write branch-agnostic lines instead.
- Institutions are referred to generically ("the university"); never name the real university inside a story. Put course attribution in the README instead.
- Reflection prompts are OPTIONAL per ending (teacher-led in class).

## Visual / style
- Retro ARCADE theme to lower the barrier on a "serious" topic and make "one thought away" (一念之差) viscerally game-like.
- Arcade display font (Press Start 2P) for the start-screen logo and PRESS START button only; a legible tech font (Chakra Petch + system CJK fallbacks) everywhere else, CRT scanlines, neon palette (cyan/magenta/yellow), blocky drop-shadow buttons, a "PRESS START" intro overlay.
- Hover highlights are gated behind `@media (hover: hover) and (pointer: fine)` so touch devices never show a stuck "pre-selected" choice; on touch, a tap shows a brief pressed state (class added on pointerdown) BEFORE the story advances, so the tap feels acknowledged.
- Dual-track dashboard = segmented neon "health-bar" meters in two labelled groups (risk / venture); danger pulse only on the risk track.
- The start screen shows which venture was drawn ("this round") with a one-line hook and a shuffle button; that label is bilingual (ZH and EN stacked), like the rest of the start screen.
- **Open with the business, not the plot.** Every pack carries a structured `brief` (what it does / who buys it / where it stands / data it touches) shown above the first node. A line like "your first customer is a breakfast chain" means nothing if the player does not yet know what the product is — a playtest caught exactly that. Keep it OFF the start card: a four-row brief there made the cover busy and pushed PRESS START below the fold.
- **Branching has to be real, not just a score accumulator.** An audit found every choice in every pack pointed at the same next node — 20,700 answer combinations but exactly one question sequence, which is not a branching narrative. Fix: two decisions per venture (how training data was sourced, how the first harm was answered) each open their own consequence scene — a scene written for *that* decision, which then rejoins the shared track. Keep the other thirteen steps shared so a class can still compare answers question by question, and keep enough shared structure that the "one perfect path" property survives (verify by brute force: still exactly 1 of 82,872 playthroughs).
- Add one easter egg: on the start screen, the Konami sequence (up up down down left right left right B A) or seven taps on the logo opens a short bilingual note about how the game works. It must not change any dimension, state or ending.
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
- scenarios/*.json — one file per venture (e.g. ai-fitness.json, ai-hiring.json, ai-avatar.json, edu-analytics.json, drone-inspection.json, trade-doc-ai.json): a structured `brief`, dimensions (two groups), acts, 13 shared decision nodes + 4 branch consequence scenes (2 branch points × 2 scenes), per-choice why notes, endingFlavor for scenario-specific colour.

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
- Opening index.html draws a random venture (start card shows its title, hook and a compact venture brief; shuffle changes it and the brief together), the dual-track dashboard updates on each choice, the Decision Trail shows why-notes, the ending screen shows the full debrief AND the attribution back to specific steps, the same sequence always yields the same ending, the ZH/EN toggle works, the opening sound plays once on start, and touch devices get pressed-state feedback without stuck highlights.
- Reading every node of every scenario in order reveals no thread that appears without setup and no line that assumes an untaken branch.
```

---

## 5. Classroom activity idea

- **Author-a-scenario lab:** have students draft a *new* venture scenario JSON (e.g. an internship or a research-integrity dilemma) together with the AI, then run `node validate.js` on it. Discuss any unreachable endings or dead-ends the validator finds — that *is* the lesson about consequence and completeness.
- **Consequence debrief:** after a playthrough, open the Decision Trail and ask "which single choice pushed the risk past the threshold — and what did that same choice buy the business?" The per-choice why-notes make the causal chain explicit on both tracks.
- **Read the attribution, not just the score:** the ending names the exact steps behind every number. Ask students to defend or attack that attribution — was step 4 really the cause, or was it the accumulation from step 2? This is the habit the reflective essay needs.
- **Compare quadrants, not endings:** put the four cells of the outcome space on the board and ask each group which cell they landed in. "Clean but stalled" and "growth then crackdown" are both failures, and arguing about which failure is worse is the actual course content.
- **Debrief-to-essay bridge:** each ending's debrief (trigger / stakeholders / mitigation / legal hooks) is a ready-made skeleton for the reflective essay; have students rewrite it in their own words with the actual legal texts cited.

---

## 6. Tips

- Keep `effects` explicit and never use randomness for educational stakes; reproducibility is the point.
- **When an AI writes bilingual JSON in bulk, scan it before trusting it.** Batch generation leaks stray foreign-language tokens into one side of a `{zh,en}` pair (Korean, Russian, Polish fragments in the Chinese text; the occasional invalid literal such as `false === true ? true : true`). A thirty-line scanner that flags non-whitelisted Latin words and non-CJK scripts in `zh`, and non-Latin scripts in `en`, catches all of it — faster than reading 30 KB of JSON by eye.
- **Re-read generated scenes as a reader, not as a schema.** The validator proves the graph is sound; it cannot tell you that a buyer appears out of nowhere in node 3 or that a finale describes an artefact from a branch the player never took. One sequential read-through per scenario is worth more than another validator rule.
- Always run the validator before publishing a scenario, especially one written by an AI.
- The embedded copy in `index.html` must be re-synced whenever you edit `scenarios/*.json` and still want the offline double-click build to match.
- Treat the arcade skin as motivation, not distraction: the dual-track dashboard + Decision Trail + ending debrief are where the learning lives.
