# Compass — Developer Handoff

*Last updated 2026-07-11 · live build `b15 · full-observatory` · 55/55 tests green.*

You've inherited **Compass**, a values self-discovery web app live at
**https://trueself.carecompass.me**. This document gets you from zero to
productive. Read it top to bottom once; after that use it as a map.

The companion doc `docs/ROADMAP-100X.md` holds the product strategy, the
status ledger, and the prioritized next steps. This doc is the *code* handoff.

---

## 1. The one thing to understand first

**The brand is honesty, and it is enforced in code.** Compass exists as the
anti-Barnum values test — "we show our work, and we tell you when we're
unsure." Every design decision serves that. Concretely, these are invariants,
not preferences, and there are tests that fail if you break them:

- **No personality "type" boxes.** No "You are The Free Idealist." The reveal
  leads with the user's own top values and a line assembled from *their* #1 and
  #10 choices.
- **No fabricated precision.** No "43% Self-Direction", no "97% match". Bands are
  qualitative and **calibrated against random-input noise** ("strong lean =
  beats ~95% of random answers").
- **No Barnum lines.** A statement may only ship if someone with the *opposite*
  values would visibly disagree with it. (Guardrail: `test/insights.test.js`.)
- **Provenance + hedging on every claim.** Each rendered insight names the values
  that drove it, and hedges when the user's two signals disagreed.
- **Honest abstention.** The career module says "no clear lean yet — and we won't
  invent one" rather than bluff on weak signal.
- **Privacy is literal.** Everything runs client-side. No accounts, no analytics,
  no server storage. Results live in the URL fragment + `localStorage`. "Your
  answers never leave this device" must stay true.

If a change would violate any of these, it's wrong for *this* product even if
it's a normal growth tactic elsewhere. The `$2 audit` (in ROADMAP) explains why
the honesty stance is also the moat.

---

## 2. Architecture in one screen

Pure **vanilla JS + SVG + CSS. No build step, no framework, no runtime deps.**
The same ES modules run in Node (tests/demo) and the browser (the app).

```
engine/                 pure logic — runs in Node AND browser, no DOM
  values.js             the 10 Schwartz values: angles, colours, higher-order axes, VALUE_INK
  maxdiffBlocks.js      forced-choice block design (opposites must compete)
  scoring.js            THE CORE: scoreRanking / scoreMaxDiff / buildProfile (triangulation)
  interests.js          12-item RIASEC quick-fire + scoreInterests
  careerArchetypes.js   values→career archetypes, blended w/ interests, noise-calibrated bands
  relationshipCompass.js love module — reflection + conversation prompts (NO partner matching)
  identity.js           the "crown" line + continuum axes (NO type labels)
  insights.js           derivations: pairSignature, deriveAspects, distinctiveSplit, deepReads
  insightBank.js        GENERATED content: 45 pair signatures, 10 deep reads, 5 aspect sets
  portraitItems.js      a 3rd signal, licensing-gated — NOT re-exported by index.js
  index.js              public API (re-exports everything EXCEPT portraitItems)

web/                    the browser experience (imports ../engine/index.js directly)
  index.html            shell: starfield canvas, theme switch, module preloads, meta
  app.js                THE UI — flow state machine, all views, all rendering (~1300 lines)
  styles.css            the Observatory design system: 4 "sky" palettes via CSS vars
  circumplex.js         the values chart SVG (per-sky palettes, astrolabe ticks)
  archetypeArt.js       generative SVG art behind each career archetype
  plate.js              "Own it": print-grade keepsake plate (SVG → PNG, client-side)
  receipts.js           "Own it": JSON export + printable methodology appendix + revisit .ics
  serve.js              the ENTIRE backend: a hardened zero-dep static server
  sw.js                 service worker (offline PWA, versioned cache)

test/                   node:test suites (run with `npm test`)
demo/                   synthetic respondents + CLI demo (`npm run demo`)
docs/                   ROADMAP-100X.md, this file, research + specs
```

There is **no database and no API.** `serve.js` serves static files. That is the
whole backend. (See §9 for what a minimal backend would unlock.)

---

## 3. Run it

Requires Node ≥ 18. From the repo root:

```bash
npm test              # 55 unit tests (node:test) — run this before & after any change
npm run serve         # → http://localhost:5173/   (dev: no asset caching)
npm run demo          # print synthetic archetype profiles in the terminal
```

There is nothing to install (`npm ci` only pulls `playwright-core`, a dev-only
screenshot tool). The app is just files; open `web/index.html` through the
server (not `file://` — ES module imports need HTTP).

For local iteration the served files reflect edits on refresh (the in-memory
cache in `serve.js` is disabled unless `NODE_ENV=production`).

---

## 4. The data flow (mental model)

A user's whole result is **two signals** cross-checked:

1. **Ranking** — they drag-sort all 10 values (`scoreRanking`).
2. **MaxDiff** — 10 forced "most/least of these four" trade-offs (`scoreMaxDiff`).
   (+ optionally the 12-item RIASEC **interests** round, which only feeds career.)

`buildProfile({ tiers, maxdiff })` in `engine/scoring.js` is the heart:

- standardises each signal to within-person z-scores,
- averages them into `combined` (per-value score),
- ranks values, projects onto the circumplex (angle + magnitude),
- computes higher-order axis scores + `higherMargin` (gates "centre of gravity"),
- computes `convergence` (Pearson r between the two signals) and per-value
  `valueConfidence` (high/medium/low from sign+strength agreement),
- surfaces `tensions` (opposing values both in the global top-4),
- exposes `signals` (named per-signal z-scores — used by the receipts appendix).

Everything downstream (identity crown, pair signature, aspects, career, love,
plate, receipts) is a **pure function of that profile**. No randomness in the
output — the same answers always produce the same result. That's what makes it
retake-stable and what lets permalinks work.

**Result encoding** (`web/app.js`, `encodeResult`/`decodeResult`): the entire
result is ~40 small digits packed into the URL fragment `#r=…`. v1 = ranking +
trade-offs; v2 = + interests. Backward compatible. This is why there's no
server: the URL *is* the database.

---

## 5. The flow state machine (`web/app.js`)

`state.step` moves through: `welcome → primer → sort → maxdiff → interests →
results` (with an optional `lived` re-sort reachable from results). `go(step,
patch)` mutates state, saves progress to `localStorage`, and calls `render()`,
which dispatches to a `viewX()` function. Each view builds an HTML string,
`mount()`s it, and wires event listeners.

Key views and where they are:
- `viewWelcome` — the full-bleed Observatory hero (self-drawing demo chart).
- `viewPrimer` — "values are directions, not destinations" (the ACT step).
- `viewSort` — drag **and keyboard** reorder (`wireDragSort` + `wireKeyboardSort`);
  serves both the importance sort and the optional `lived` sort.
- `viewMaxdiff` — one trade-off block at a time.
- `viewInterests` — the 12 quick-fire RIASEC cards.
- `viewResults` — the scrolling "story": scene 1 reveal (chart + typed crown +
  pair signature + drivers), scene 2 forces/axes, scene 2.5 aspect gauges + deep
  reads, scene 3 career, scene 4 love, scene 5 tensions + gap + "Own it" + footer.

The results story uses CSS scroll-snap. **Screenshot gotcha:** the story scenes
don't rasterize cleanly below the fold in headless capture (a tool quirk, not a
user bug) — verify deep scenes by reading `innerText`/DOM or by temporarily
`display:none`-ing earlier scenes so the target is at scroll 0.

---

## 6. The Observatory design system (`web/styles.css`)

One design language — a nocturnal brass instrument — in **four "skies"** chosen
via a `data-theme` attribute on `<html>`, each just a set of CSS custom
properties:

- `midnight` (default — brass on deep night), `abyss` (old gold on sea-black),
  `nebula` (brass on violet), `dawn` (bronze ink on parchment — the light one).

Components **never hardcode sky pigments** — they read `--accent`, `--text`,
`--bg-1`, `--glass`, etc. To add a sky, add one `[data-theme="x"] { … }` block
and add it to `THEMES` in `app.js`, `PALETTES` in `circumplex.js`, and
`STAR_PIGMENT` in `app.js`. Legacy saved theme names migrate via `LEGACY_THEMES`.

Motion: the starfield (canvas, `startStars()`), the self-drawing chart, the
typewriter crown, and the gauge needles all respect `prefers-reduced-motion`
(static fallbacks). The crown types on wall-clock time so throttled/background
tabs still finish.

Fonts are the system serif (`Iowan Old Style`/Palatino/Georgia) + system UI —
**no webfonts** (the CSP blocks external requests and we keep it self-contained).

---

## 7. The "Own it" offer (built, not yet switched on)

The `$2 audit` (ROADMAP) concluded: keep the full report free forever; sell one
*object* — ownership. Built and working, gated behind config:

- `OWN.payLink` in `app.js` is **empty**, so the offer card is hidden. To go
  live: create a hosted one-tap payment link (Stripe/Razorpay Payment Link,
  Apple/Google Pay on, **$9**) with success URL
  `https://trueself.carecompass.me/web/#own=paid`, and paste it in.
- Unlock is client-side only: `#own=paid` (from the payment redirect) or
  `#own=preview` (owner testing) writes a flag to `localStorage`. There's no
  server verification — this is a low-stakes $9 honesty product, not a licence
  server; a determined user can self-unlock, and that's an accepted trade for
  zero-backend + privacy. Revisit if abuse ever matters.
- What unlocks: the **plate** (`plate.js` — SVG chart + crown + signature →
  PNG via a `data:` URL rasterized on a canvas; note the CSP allows
  `img-src … blob:` for this), the **receipts** (`receipts.js` — JSON + a
  printable methodology appendix opened in a new tab), and the **revisit**
  (a 6-month `.ics` + an honest before/after diff computed from `localStorage`
  history, surfacing only rank moves ≥ 3).

To verify the whole paid experience today without paying: open a result and
append `#own=preview` to the URL.

---

## 8. Deploy

**Hosting:** Railway project `values-compass` → environment `production` →
service `compass-values`. The custom domain `trueself.carecompass.me` is
attached to that service (apex `carecompass.me` is unrelated and currently a
dead Replit placeholder — see the domain item in ROADMAP §blocked).

**Deploy is currently manual** via the Railway CLI:

```bash
railway link --project values-compass   # once
railway up --detach                       # deploys the working directory
```

Nixpacks runs `node web/serve.js` (see `railway.json`). **Every deploy: bump the
`BUILD` constant in `app.js` and the `CACHE` version in `sw.js`** — then verify
prod picked it up:

```bash
curl -s https://trueself.carecompass.me/web/app.js | grep -o "const BUILD = '[^']*'"
```

Prod once sat 4 commits behind for days because auto-deploy wasn't wired — the
`BUILD` tag exists precisely to catch that. **Wiring GitHub→Railway auto-deploy
on `main` is a recommended next step** (ROADMAP §next-steps #4).

Git: `main` is the deployed branch. Commits go straight to `main` per the
owner's workflow (this session pushed there directly). Author identity in the
clone: `tnsaruniitr-lab / tnsarun.iitr@gmail.com`.

---

## 9. Testing & guardrails

`npm test` runs `node --test` over `test/*.js`. The suites you must keep green:

- `scoring.test.js` — retake-invariance, MaxDiff opposite co-occurrence,
  3-signal convergence, the exposed `signals` for receipts.
- `insights.test.js` — bank completeness (45 pairs / 10 deep / 5 aspects),
  **anti-Barnum guardrails** (no %, no type brands, no absolutes), deterministic
  aspect picks, honest "mixed" fallback on symmetric profiles.
- `careerArchetypes.test.js` / `interests.test.js` — band calibration, Maker
  cap without interests + unlock with them, the abstain flag, blend arithmetic.
- `relationshipCompass.test.js` — the Finkel firewall (no partner-matching
  language), pole-aware `shared_meaning`.
- `identity.test.js` — no type labels, "balanced" on symmetric profiles.

When you add insight content, it must pass the guardrail regexes. When you add a
scoring path, add an invariance/calibration test — the product's credibility is
the test surface.

---

## 10. Gotchas & non-obvious decisions

- **`engine/index.js` deliberately does NOT export `portraitItems.js`.** Those
  are Schwartz-derived items held out of the shipped bundle pending a licensing
  determination. Tests import them directly. Don't "fix" this by re-exporting.
- **`insightBank.js` is generated, not hand-authored.** It came from a multi-agent
  generate-then-adversarially-review workflow. Edit by hand only under the same
  honesty rules; large regenerations should re-run review.
- **Band cutoffs are empirical, not vibes.** The numbers in `matchBand` /
  `blendBand` come from 4,000 random-input simulations. If you change the scoring
  pipeline, re-run the calibration (there's a one-off script pattern in the git
  history / ROADMAP) and update the cutoffs + their comments.
- **The circumplex angles** in `values.js` are an internally-consistent
  illustrative layout, **not** MDS coordinates from a dataset — the code says so.
  Don't present them as empirical geometry.
- **CSP is strict** (`serve.js`): `script-src 'self'`, `img-src 'self' data:
  blob:`. No inline scripts, no external anything. The plate PNG path needs the
  `blob:` allowance; keep it.
- **serve.js is an allowlist**, not a whole-directory server (that was a fixed
  leak). New top-level served paths must be added to `allowed()`.
- **Two "profiles" exist in results code**: the live `state`-derived one, and
  `computeProfileFor(order, choices)` for decoded permalinks and the revisit
  diff. Use the latter for anything reconstructing a past result.

---

## 11. Where to start if you're taking over

1. `npm test` (see it green), `npm run serve`, take the test yourself once.
2. Read `engine/scoring.js` end to end — it's the whole conceptual core (~230 lines).
3. Skim `web/app.js` `viewResults` to see how a profile becomes the reveal.
4. Read `docs/ROADMAP-100X.md` STATUS LEDGER + NEXT STEPS for what to build.
5. First recommended tasks (unblocked, high value): **funnel telemetry**, the
   **two-person compare**, or **auto-deploy on push**. All detailed in ROADMAP.

Owner-blocked items (payment link, domain move, footer name, licensing) need the
owner — surface them, don't work around them.

Questions the code can't answer are usually product-honesty questions; when in
doubt, choose the option that shows more of its work and claims less.
