# Teaching guide

How to use **Choices / 一念之差** in class, and what it was built for.

This guide is written for the instructor. The [README](../README.md) covers what
the game is and how it is built; this file covers the lesson.

---

## 1. The design: learning through consequence

Most students do not feel how an ordinary business decision can cross a legal,
ethical or national-security line. Being told "don't do that" is forgettable,
because nothing in the decision itself says so. The game makes the line
consequential: the student presses a button, and four risk bars and three value
bars move. Nothing is hidden behind a later reveal.

The design problem it answers is this. A single risk scoreboard has a flaw:
after two or three plays, a student learns that the optimal strategy is *always
choose the most conservative option*, and collects the good ending. That is the
wrong lesson for an entrepreneurship course. In the real economy compliance has a
cost, growth has a purpose, and a company that refuses every commercial risk
protects nobody.

So every choice moves **two scoreboards at once**:

| Group | Dimensions shown | Better means |
|---|---|---|
| Scope | National security **risk** | lower risk |
| Instruments | Legal compliance **risk** · Ethics and trust **risk** · Social expectation **risk** | lower risk |
| Value | Problem–solution fit · Business model · Moat (the Lean Canvas blocks) | higher value |

Every bar on the risk side is a **risk**, not a quality. Lower risk is better,
but "legal compliance risk at zero" means *no compliance exposure*, not *no
regulation* and certainly not *no law*. Nothing in a healthy venture is improved
by having less law; what improves is by having less **exposure** to the lines it
has to operate inside. Say that distinction aloud to students — treating the risk
bars as quality bars is what produces "the safest company is the best company".

### How the two scoreboards are wired together

Every choice writes one set of `effects` into **both** sides at once, and the
ending is gated by the two sets jointly. Low risk alone is not a good company,
and high growth alone is not a good ending.

![How the two groups are wired together](dual-track-architecture.svg)

### The four-cell outcome space, and the eleven endings

Gating on both sides at once gives a four-cell matrix. Each cell is then
subdivided by *which* risk dimension actually fired, which is why there are
eleven endings rather than four.

![The four-cell outcome space](dual-track-endings.svg)

**Two cells are worth pointing at before students play.** *Sustainable success*
and *Over-cautious* share the low-risk row — both manage every risk well — so
the game explicitly treats that as insufficient on its own. And the two endings
on social expectation exist because that risk has no zero: a run can hold every
line low and still fail, and a student who discovers that by playing has learned
something no slide states as well.

The thresholds behind the eleven endings, **in the order the engine evaluates
them** — first match wins, so this order decides what happens when a run breaches
two dimensions at once:

| Order | Endings | Fires when |
|---|---|---|
| 1 | `boom_ns`, then `bust_ns` | National security risk ≥ 5 — boom if business model ≥ 6, otherwise bust |
| 2 | `boom_legal`, then `bust_legal` | Legal compliance risk ≥ 5, split the same way |
| 3 | `boom_ethics`, then `bust_ethics` | Ethics and trust risk ≥ 5, split the same way |
| 4 | `boom_social`, then `bust_social` | Social expectation risk ≥ 5, split the same way. `boom_social` additionally needs legal ≤ 4 and ethics ≤ 4, so it only fires when the *other* two are clean |
| 5 | `win_clean` | All four risk lines ≤ 1 **and** business model ≥ 6 — a rare badge inside *Sustainable success* |
| 6 | `win_resilient` | All four risk lines ≤ 4 **and** business model ≥ 6 |
| 7 | `stalled` | All four risk lines ≤ 4 **and** business model ≤ 5 |

A run that breaches national security *and* ethics is judged as national security,
because it is checked first. That is deliberate, and worth mentioning to students
who notice it.

The three instrument dimensions answer three different questions, and they do
not always agree:

- **Legal** — is there a rule that governs this decision?
- **Ethical** — is the distribution of cost fair?
- **Social** — what did the people affected expect?

The third has no zero. Legal risk can be reduced to zero, because compliance is
zero. Ethics has no settled answer, only an argument. A social expectation risk
of zero is not a reachable state — other people always expect something of you,
and you choose how much of it you carry. One ending exists to make a student
discover that by hitting it: they push all four lines as low as they can and
still fail.

---

## 2. Course context and learning objectives

The game was written for **GEL2026 · Technology Entrepreneurship in AI-enhanced
Business and National Security** at the Education University of Hong Kong. It
also works unchanged in **GEL1032 · Technology Entrepreneurship in AI-enhanced
Business**, which covers the same entrepreneurial ground without the
national-security strand.

**The two strands the course asks students to hold at once.** One strand is
technology entrepreneurship: how AI and digital technologies create value, how a
venture is planned and validated (customer segments, problems, solution,
channels, revenue, unfair advantage), how a proposal is pitched. The other is
national security education: how data, models and platforms touch
national-security, legal and ethical red lines, and what the law expects of the
people who build them.

| Course concern | What the game makes the student do |
|---|---|
| Digital / AI value creation | The value track scores problem–solution fit, business model and moat — the Lean Canvas blocks — so pressing a button *is* practising the canvas |
| Customer and problem validation | Act I forces a choice between interviewing users and chasing vanity metrics, and the scoreboard remembers which one paid |
| AI data and model decisions | Acts II–III put training data, offshore processing and deployment on the scoreboard with explicit national-security and legal consequences |
| Legal, ethical and social implications | Four separate risk dimensions, so "it is legal but nobody asked us" and "it is safe but socially unacceptable" are different scores, not one blurred warning |
| Accountability and mitigation | Act IV offers a passive fix, a denial, or a real audit — and the audit is gated behind commercial strength, because responsibility has to be affordable |
| Reflective writing | Every ending ends in a debrief: why it fired, the trade-off, who was affected, what could have been done, and the Lean Canvas reading — a draft skeleton |

---

## 3. Running it in class

### Before the lesson

- Open the deployed site in the room's browser and check it loads. The game is a
  static site: no backend, no build, no login, nothing to install.
- Put the **assigned scenario link** somewhere students can reach. Appending
  `?scenario=<id>` pins the venture, which is what you want for a whole-room
  comparison.
- If the room has fewer devices than students, plan for pairs. The game is
  designed to be played two to a desk.
- Tell students to export the run report. Everything later in the lesson depends
  on having it.

### The session shape

**Run one — individual, the assigned venture.** 10 to 15 minutes. Students play
to the conclusion and export the report. Individual first matters: it stops the
person at the front of the pair deciding for both.

**Run two — pairs, any other venture.** 5 to 10 minutes. Students switch
venture so they see the same dilemma in a different skin. Each run is saved in
the browser, so switching venture no longer loses the first run; students can go
back to the original and compare.

**Report analysis — in pairs, then whole class.** 15 to 20 minutes. Students
work from their own exported report. This is where the teaching happens; the
playing is only the setup.

### Questions that work

These come from the game's own output, so the answers are in the student's
report rather than in the teacher's head.

- **"Which step made it unavoidable?"** The ending page attributes every number
  to the specific steps that moved it. Because the game has no randomness
  inside a story, there is a true answer, and the report shows the evidence.
- **"Was step 4 really the cause, or was it the accumulation from step 2?"** Ask
  students to defend or attack the attribution. This is the habit the reflective
  essay needs.
- **"Which cell of the outcome space did you land in?"** Put the four quadrants
  on the board. *Sustainable success* and *Over-cautious* are on the same row and
  are both defined by low risk; *Boom-then-bust* and *Double loss* are both
  failures. Arguing about which failure is worse is the actual course content.
- **"Who can act on the harm this step caused?"** Every choice now records whether
  the remedy lies in technical design, in company policy, or in law. Most of the
  class will assume the answer is always "law". It usually is not.

### If you are short of time

Keep the first run and the report analysis. Cut the second run. A single
completed run is enough, and the report carries everything the discussion needs.

### If students finish at different speeds

The faster pair can export and re-run the same venture to compare two runs, or
read the debrief of an ending they did not reach — each ending page is
self-contained, so it doubles as a worked example for a run they did not play.

---

## 4. The run report

Each run exports three formats, all generated in the browser:

| Format | Use |
|---|---|
| [**Markdown example**](../examples/report-ai-hiring-boom_ethics.md) | For reading, printing and submission. Contains the venture brief, the score ledger, every decision with its score deltas and the reason for each, and the full ending debrief. |
| [**Word (.docx) example**](../examples/report-ai-hiring-boom_ethics.docx) | The same content as a document, for handing in directly. |
| [**JSON example**](../examples/report-ai-hiring-boom_ethics.json) | The full decision trail and debrief as data, for marking or further analysis. |

All four formats share one structure: the outcome quadrant first, then four
numbered sections — 1 the venture, 2 the score ledger, 3 the decision trail,
4 the ending debrief. The conclusion page on screen uses the same four numbers,
so a student pointing at "Section 3" is pointing at the same thing whether
they are looking at the screen or at the exported file.

Section 1 is titled "THE VENTURE" (「企划简报」) in the report and on the
conclusion page. The opening card at the start of the game titles the same
briefing "THE VENTURE · READ THIS FIRST" (「企划简报 · 先看清楚这门生意」),
because there it is telling the player what to do next.

The report is the only durable record of a run, so it is worth asking for it
every time. It is also the bridge into written work: the debrief is already
structured as why it fired, the trade-off, a Lean Canvas reading, the legal
hooks, who bore the cost, what could have been done, and a reflection — a
skeleton the student rewrites in their own words.

---

## 5. Two things to tell the class

**The game is deterministic, and that is the point.** There is no dice anywhere
inside a story. The same choices always produce the same ending, so "at which
step did this become unavoidable?" has a true answer. The only random element in
the whole product is the draw of which venture you play, at the very start.

**The six scenarios are four different games.** This is worth saying out loud,
because it is easy to assume otherwise.

| Scenario | Choices | Identical to `ai-fitness` |
|---|---|---|
| `ai-hiring` | 55 | 55 of 55 — the same game, different skin |
| `edu-analytics` | 55 | 54 of 55 |
| `drone-inspection` | 55 | 52 of 55 |
| `ai-avatar` | 51 | own structure |
| `trade-doc-ai` | 54 | own structure |

So `ai-fitness`, `ai-hiring` and `edu-analytics` are one game with three stories;
`drone-inspection` is that game with three tuned values; `ai-avatar` and
`trade-doc-ai` each run on their own distribution.

Two consequences:

- **Pinning `?scenario=` pins one mechanics profile.** If you pin `ai-fitness`,
  the whole room plays that profile, and students who then try a different
  venture on their own may still be playing the same game. Either pin one and
  say so, or let them draw at random.
- **Rebalancing the outcomes is three passes, not six.** Relevant if you adapt
  the scenarios: the balance work only has to be done once per mechanics
  profile.

---

## 6. Adapting it

The engine is generic. Each scenario is a standalone JSON packet, so a new topic
is a new file rather than a new program. This is the most useful extension for a
course of your own.

**Author-a-scenario lab.** Have students draft a new venture scenario together
with an AI assistant — an internship dilemma, a research-integrity question —
then run `node validate.js scenarios/<file>.json endings-core.json`. Discuss any
unreachable endings or dead ends the validator reports. *That discussion is the
lesson*, about consequence and completeness: a story where some choices lead
nowhere is a broken story, and the tool says so.

The [vibe-coding guide](vibe-coding.md) contains a complete prompt for
generating a scenario that complies with the schema, and the schema itself is
documented in the README.

---

## 7. Known limitations

| Limitation | What to do about it |
|---|---|
| The venture is drawn once per page load | Use `?scenario=<id>` for a fixed demonstration |
| Reflection depends on facilitation | The debrief supports the discussion but does not replace it |
| `ai-fitness`, `ai-hiring` and `edu-analytics` are one mechanics profile | See section 5 |
| GEL1032 has no national-security strand | The dashboard has a scope group that can be hidden for that course |
| The perfect-win ending is rare by design (about 0.1% of runs) | Treat it as a badge, not a target; the "sustainable success" ending is the realistic goal |