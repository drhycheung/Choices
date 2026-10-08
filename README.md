# 一念之差 · Choices

> **一念之差** (English code name / repo name: **Choices**) — a text-based interactive branching narrative simulator.

An open-source educational tool: students read a story → make choices → trigger different branches and endings.
The core engine is **generic**; scenarios are **standalone JSON data packs** that can be added indefinitely (first scenario: student startup, embedding national-security / legal / ethics risk dilemmas; future scenarios may cover internships, research, etc.).

## Locked design constraints

1. **Static site is the top priority**: no backend, no build step; deployable to GitHub Pages / any static host.
   The runtime engine is pure JS running in the browser; Python is used only for the dev-time validator and never ships at runtime.
2. **Choice ↔ ending must have a deterministic causal relationship**: every choice has a **clear, visible, traceable** effect on risk dimensions (no dice / randomness);
   endings are triggered by accumulated-state thresholds. The same choice sequence always yields the same ending, and the causal chain is traceable.
3. **Scenario = standalone JSON data pack**: adding a scenario = adding a JSON file, loaded via `fetch`, plug-and-play with zero config.
4. **Reflection layer is optional**: teachers may add it in class; the schema's `reflection` field is optional and does not block running when absent.
5. **Scenarios can be AI-assisted**: the schema is designed to be LLM-friendly, and `validate.js` guarantees causal integrity as a safety net.
6. **Bilingual ZH/EN toggle**: player-facing text is written as `{ "zh": "...", "en": "..." }`; the player exposes a **language toggle (中文 | EN) at the top-right**, switching the entire page instantly (narrative / choices / endings / decision trail / UI text). Responsive on both desktop and mobile. Plain strings are also supported (single-language scenarios). **The game defaults to English on entry.**

## Project structure

```
Choices/
├── index.html            # Static player page (game-styled UI + ZH/EN toggle)
├── styles.css            # Styles (dark HUD risk monitor / dialogue narrative / game-menu choices / endings / trail)
├── engine.js             # Core engine (pure logic, no DOM, deterministic causality + decision trail)
├── validate.js           # Causality/path validator (no dead ends, all endings reachable, references valid), with CLI
├── player.js             # Static UI controller (dual-mode loader: fetch JSON on a server / embedded copy under file:// -> render -> engine advance)
├── test.js               # Node smoke test (no browser needed)
├── scenarios/
│   └── student-startup.json   # First scenario: student startup (bilingual ZH/EN)
└── README.md
```

## Running

### Option A: double-click to open (file://, no server needed)

Just open `index.html` in a browser. The player reads the **embedded default scenario** inside `<script id="embedded-scenario">` (browsers forbid `fetch` of local JSON under `file://`, so the embedded copy is the fallback). Ideal for offline distribution to students (USB drive / sharing a single HTML via WeChat).

> ⚠️ The embedded copy is a mirror of `scenarios/student-startup.json`. If you edit `scenarios/*.json`, **you must also update the embedded block in `index.html`**, otherwise the offline double-click build stays stale. Other added scenarios are not loaded under `file://` (they only take effect in Option B's server mode).

### Option B: static server / GitHub Pages (data-driven; recommended for deployment & new scenarios)

```bash
python3 -m http.server 8000
# or
npx serve .
```

Open `http://localhost:8000/`. Under `http(s)://`, the player **uses `scenarios/student-startup.json`** (data-driven, easy to add scenarios with AI). The top-right "中文 / EN" toggle switches the whole page at any time, and any choice advances the same story state. The game opens in **English** by default; add `?lang=zh` to start in Chinese.

### Self-test (Node, no browser)

```bash
node test.js
```

Prints the scenario validation result and several "deterministic causality" demo paths (same sequence → same ending).

### Specify another scenario (Option B only)

```
http://localhost:8000/?scenario=scenarios/your-scenario.json
```

## Scenario Schema (data-pack spec)

A scenario = one JSON object. The engine only knows the schema, never the content. **All player-facing strings support bilingual** text:
write `{ "zh": "...", "en": "..." }`; plain strings are also accepted (single-language scenarios). The player renders with the ZH/EN toggle.

```jsonc
{
  "id": "student-startup",
  "title": { "zh": "学生创业：风险抉择", "en": "Student Startup: Risky Choices" },
  "theme": { "zh": "国家安全 / 法律 / 伦理", "en": "National Security / Law / Ethics" },
  "dimensions": {                       // risk dimensions (deterministic state)
    "<key>": { "label": { "zh": "国家安全风险", "en": "National Security Risk" }, "initial": 0, "min": 0, "max": 10, "higherIsRisk": true, "icon": "🛡️" }
  },
  "start": "intro",                    // start node id
  "nodes": {
    "<nodeId>": {
      "text": { "zh": "叙事文本", "en": "Narrative text" },
      "choices": [
        {
          "text": { "zh": "选项文案", "en": "Option text" },
          "next": "<nodeId>",           // jump target (must exist)
          "effects": { "<dimKey>": 2 }, // deterministic effect (positive or negative, no randomness)
          "requirements": { "<dimKey>": ">=2" }, // optional: prerequisite gating (choice disabled if unmet)
          "oneshot": true               // optional: disappears after being chosen
        }
      ]
      // an empty choices array = terminal node
    }
  },
  "endings": {                         // state-gated endings (evaluated in declaration order, first match wins)
    "<endingId>": {
      "title": { "zh": "结局标题", "en": "Ending title" },
      "type": "success | fail | compromise",
      "condition": { "<dimKey>": ">=5" },  // multiple dims = AND; empty {} means default/fallback
      "text": { "zh": "结局叙事", "en": "Ending narrative" },
      "reflection": { "zh": "可选反思提示", "en": "Optional reflection (teacher may add in class)" }
    }
  }
}
```

### How causality is enforced

- **Choice → effect → dimension → ending** is fully deterministic: the engine adds/subtracts `effects` (**no random numbers**), and endings are triggered by evaluating `condition` against dimensions.
- **Endings are evaluated in declaration order, first match wins**: put the "fallback / compromise" ending last with an empty `condition: {}` to catch any state not covered by a specific ending.
- **`validate.js` proves three things before running**: ① structurally valid (start/next references, valid dimensions & expressions); ② no dead ends (every reachable path lands on a valid ending); ③ causality reachable (every declared ending has at least one choice sequence that triggers it).
  After generating a scenario with AI, run `node test.js` / `node validate.js scenarios/xxx.json` to confirm causal integrity.

## Adding a new scenario

1. Copy `scenarios/student-startup.json`, change `id` / dimensions / nodes / endings (use `{zh,en}` for bilingual text).
2. Run `node test.js` (or validate standalone: `node validate.js scenarios/xxx.json`) to confirm no errors.
3. Preview with `?scenario=scenarios/xxx.json`.
4. Deploy: push the whole repo to GitHub and enable Pages to get a shareable static site.

## Engine / UI decoupling

- `engine.js`: pure state machine and causal computation, no DOM, unit-testable in Node.
- `player.js`: only rendering and events (including the ZH/EN toggle). Engine and UI are decoupled, making it easy to swap the interface later (e.g. embed in a WeChat / mini-program WebView) without touching the engine.
