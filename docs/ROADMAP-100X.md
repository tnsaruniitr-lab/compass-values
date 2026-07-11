# Compass — Evaluation & 100× Roadmap

*Produced 2026-07-04 from a 6-dimension multi-agent evaluation of the live app
(trueself.carecompass.me) + repo, with every critical/high finding adversarially
verified. This document is the diagnosis, the kill list, and the sequenced plan.
**Phase 1 has been implemented** — see "What shipped" at the end.*

---

## Diagnosis: the root cause of low user value

**The product's value-bearing machinery already existed but was disconnected
from what users touched.**

The engine shipped tested triangulation (portrait + MaxDiff + convergence +
per-value confidence). But production fed `buildProfile` a **single** signal from
a two-round, 5-card drag-sort whose output was structurally noise:

- The 10 values were split by a **random shuffle** into two rounds of 5, ranked
  independently, and their within-round ranks merged **as if absolute**. So the
  winner of a weak round scored the same as the winner of a strong round. A
  perfectly consistent person got a **different profile on every retake** —
  top-3 wrong ~50% of the time; the headline #1 value wrong up to **85%** of the
  time (ties broke by internal array order).
- Because the merged scores formed a fixed multiset, **every user saw the
  identical "43% / 43% / 14%" values mix and 94/94/72 meters** — universal
  constants presented as personal measurement.

That noise was then wrapped in **exactly the artifacts the design bible
forbids** — a named 9-box identity type ("You are The Free Idealist") and
pseudo-precise percentages — while the honest machinery (confidence chips,
conversation prompts, abstain states) sat as dead code. And whatever value did
land **evaporated instantly**: no persistence, no share card, no retest, no
analytics.

In one line: *a rigorously designed instrument idled in the repo while users
received an unstable horoscope they couldn't even keep — the science layer was
unused, the honesty layer was inverted, and the loop was missing.*

## North star: what the 100× product is

**"The values test that shows its work."** A ~4–7 minute triangulated Schwartz
assessment (a comparable sort + forced trade-offs) that displays per-value
confidence, tells you where your own signals disagree, says *"no clear lean
yet"* when the data is flat, and leads with continuum positions and tensions
instead of type boxes — the one results pattern nobody in the Barnum-saturated
quiz market ships. It compounds over time through an honest **stated-vs-lived**
retest loop and spreads through falsifiable shareable results and two-player
couple/friend comparison.

Market note: the old positioning claim "no major consumer app uses Schwartz" is
**publicly false** (Core Values Finder / findyourvalues.com claims an *exclusive*
PVQ-RR licence; coached.com and personalvalu.es also ship Schwartz tests). The
defensible, verified whitespace is **showing the work**, not the framework.

---

## Kill list — remove or reframe (undermines trust or violates the app's own rules)

| Killed | Why |
|---|---|
| The "You are The Free Idealist" named 9-box identity | Violates the product's own hard rule ("never a type"); threshold cliffs flip the label on retake; can contradict the values printed beneath it. **The exact Barnum mechanic the positioning attacks.** |
| The values-mix percentages & driver meters (43/43/14, 94/94/72) | Constants for every user — pseudo-precision the plan bans, trivially falsified by two friends comparing screens. |
| "Strong fit" / "clear lean" career badges (uncalibrated) | 75% of *random* sorts earned "strong"/"clear." Bands must beat a random-input baseline before any confidence word appears. |
| Partner-prescription bullets ("Look for a partner who… / Be wary of a distant or avoidant partner") | Drifts past the module's own Finkel firewall; imports attachment-theory vocabulary with zero basis in a values sort. |
| The README/welcome triangulation story + "Discover your true self / values you actually live by" copy | Sold triangulation & confidence that didn't run; claimed a lived-values readout with no behavioural signal. Documentation of a better product than the one shipped is the most dangerous artifact an honesty brand can host. |
| "No major consumer app uses Schwartz" positioning | Publicly falsifiable. Reposition to "the only values test that shows its work." |
| Public serving of strategy docs, tests, lockfile, stale app copies | Trust + supply-chain-recon + SEO-confusion exposure; and shipping Schwartz-derived items as distributed-but-dead code carries the licensing risk the plan calls critical-path. |
| The wiggle-based engagement gate + "don't overthink the middle" copy | Counted >6px pointer wiggles, not order changes — satisfied by noise; and told users the middle didn't matter while scoring treated it as signal. |

---

## Quick wins (hours → days)

1. **Redeploy prod + deploy-on-push with BUILD-tag verification.** Prod was 4
   commits behind HEAD, missing the owner's own drag fixes *and* the BUILD stamp
   built to catch staleness. Curl-and-grep the BUILD constant post-deploy.
2. **serve.js hardening bundle (~1 file).** Allowlist `web/`+`engine/`, add
   CSP/HSTS/nosniff/frame-ancestors, gzip + ETag, `.webp` MIME, 301 root,
   robots.txt, trailing-separator path guard.
3. **Delete the fabricated numbers** (43/43/14, 94/94/72) → ordinal language +
   unnumbered bars.
4. **Make the link shareable & receipts readable** — OG/Twitter tags, favicon,
   canonical, render the research doc as a page (not an octet-stream download).
5. **Love/career honesty patch** — pole-aware `shared_meaning`, suppress Maker,
   render the `talk()` prompts that were computed but never shown.
6. **localStorage + URL-fragment permalink** — save, re-open, share, resume; zero
   backend, nothing leaves the device.
7. **Finish the designed experience** — self-host Fraunces/Inter, generate the 8
   archetype images, add modulepreload to collapse the request waterfall.

---

## The sequenced plan

### Phase 1 — Honest Instrument (1–2 weeks) — ✅ SHIPPED

*Goal: make the shipped assessment measure the user instead of the shuffle, and
stop asserting anything the data can't support. Exit criterion: a consistent
retaker gets the same profile every time, and no rendered claim lacks either
evidence or an explicit hedge.*

- **Replace the two-round lottery with one comparable ranking** *(transformative
  / small)* — the root fix behind four critical findings. A single full 10-value
  sort; the profile is now invariant to input order (regression-tested).
- **Move scoring into the engine + guardrail tests at the rendered layer**
  *(high / small)* — property test for order-invariance; guardrails that ban
  "You are <Type>" and bare percentages in the *rendered* output, not just
  engine strings.
- **Continuum reveal replacing the 9-box, with uncertainty gating** *(high /
  small)* — lead with actual top values + provenance; gate "centre of gravity"
  and the circumplex arrow on a magnitude/margin threshold.
- **Love module honesty pass** *(high / small)* — `talk()` prompts as primary
  content; first-person noticing prompts; pole-aware `shared_meaning`; widened
  guardrail tests.
- **Keyboard-accessible sort with a real engagement gate** *(high / medium)* —
  focusable cards, Space-grab / arrow-move / Space-drop, live aria
  announcements, gate on committed order changes with a confirm escape hatch.
- **One-screen psychoeducation interstitial** *(medium / small)* — "values are
  directions, not destinations" before the sort.

### Phase 2 — Ship the Real Product + Distribution (≈3 weeks)

*Goal: wire the dead-code triangulation so results are per-user distinct with
visible confidence, make the README true, and give every completion a way to
spread. Exit: two users' results are visibly different, convergence is rendered,
a shared link produces a rich preview and a comparable permalink.*

- **Licensing Phase-0 clearance for Schwartz-derived items** *(medium / small,
  gating)* — written confirmation or a documented original-wording
  determination; strip unused item files from the bundle meanwhile.
- **Wire portrait + MaxDiff triangulation into the flow** *(transformative /
  medium)* — sort → ~10 portrait items → trade-offs; real convergence &
  confidence. *(Partial: MaxDiff is now wired in Phase 1; the portrait signal is
  the remaining add, gated on licensing.)*
- **Visible confidence UI + first-class abstain state** *(high / small)* — per-
  value chips, a convergence verdict, noise-calibrated bands, "no clear lean
  yet." *(Shipped in Phase 1.)*
- **Shareable result artifact + permalink + friend compare** *(transformative /
  medium)* — SVG/canvas share card, OG image per result, two-permalink client
  comparison. *(Permalink + share shipped in Phase 1; the rendered share-card
  image and compare view remain.)*
- **Reposition & re-domain** *(high / medium)* — off the dead `carecompass.me`
  subdomain (its apex serves a Replit 404) to a product-branded domain; "the
  values test that shows its work" hook. *(Copy shipped; domain move pending.)*
- **Indexable surface** *(high / medium)* — serve at `/`, prerender the welcome
  + a citable Schwartz explainer, per-value/per-tension pages for quiz-intent
  SEO (the owner's AEO expertise applied to their own product).
- **Four-event funnel telemetry + client error capture** *(medium / small)* —
  start → sort done → assessment done → results viewed, privacy-safe sink.

### Phase 3 — The Loop (3–4 weeks)

*Goal: create the first lived-behaviour signal and a reason to return — the
plan's own moat. Exit: a user can see an importance-vs-lived gap today and an
honest drift readout at 4 weeks.*

- **Stated-vs-lived gap v0: the second sort** *(transformative / small)* — sort
  the same ten by "what your last two weeks served"; render the divergence + one
  action per neglected value (Bull's-Eye pattern; no licensing, no backend).
  *(Shipped in Phase 1 as an optional post-results module.)*
- **Supabase results table + email capture + consent scaffolding** *(high /
  medium)* — one anonymous table behind RLS; optional "email me my map + a
  4-week re-check"; save-consent, delete-by-slug, JSON export built in now.
- **Retest with reliable-change gating — and publish your own stability** *(high
  / medium)* — 4-week before/after on the circumplex; show drift only beyond a
  reliable-change threshold; "your profile was 92% stable" is itself a
  differentiating honesty feature.
- **Career actionability layer** *(high / medium)* — O*NET occupation-family
  links (CC BY 4.0), values-fit reflection questions, job-crafting prompts;
  restore the ~3–4%-of-variance calibration line and the mismatch clause.
  *(Reflection prompts + calibration line + mismatch clause shipped in Phase 1;
  O*NET links remain.)*

### Phase 4 — Depth & Revenue (6–8 weeks)

*Goal: build the two-player and dialogue layers where the market's
willingness-to-pay evidence lives, on top of a now-honest, now-persistent
instrument. Exit: a couples comparison exists as the first viral/paid surface
and one paid tier is live.*

- **Couples mode: two profiles as a conversation artifact** *(transformative /
  medium)* — shared vs divergent values with per-dimension `talk()` scripts,
  explicitly no compatibility score. Paired's ~8M downloads / ~$200k/mo (no
  psychometric backbone) proves the buyer.
- **Cohort norms with the MDS structural gate** *(high / medium)* — honest
  "relative to others" only after N is large enough and the circumplex
  reproduces on real data; doubles as the first validation evidence.
- **Profile-grounded AI reflection (the paid tier)** *(high / large)* — a post-
  results conversation strictly constrained to the profile JSON, ACT pliance
  probes, LLM forbidden from generating scores, crisis rails. Rosebud
  ($12.99/mo, 7,500+ paying) proves the price point; the edge is grounding in a
  real psychometric profile.
- **Facilitator/team overlay + per-seat pricing test** *(medium / medium)* — N
  profiles on one circumplex for coaches/workshops (PrinciplesUs $8/user, VIA
  Team $15/member).

---

## What shipped in this pass (Phase 1, 2026-07-04)

**Engine (`engine/`)**
- `scoring.js` — convergence is now **mean pairwise Pearson across all signal
  pairs** (was null with 3 signals); per-value confidence spans all signals;
  tensions are anchored on the **global top-4** ranking (stable across sessions,
  not threshold noise); added `higherMargin` so the UI can gate "centre of
  gravity."
- `maxdiffBlocks.js` — new `{i, i+1, i+3, i+5}` offset design forces **direct
  opposites to compete** (each opposing pair co-occurs in exactly 2 blocks; the
  old stride-3 design never pitted opposites against each other).
- `identity.js` — **rewritten**: the 9-box named-type grid is gone, replaced by
  continuum synthesis (a headline grounded in the user's actual top value, a
  two-axis position with strength qualifiers, and an honest "what you trade
  away" line).
- `careerArchetypes.js` — bands **noise-calibrated** against 4,000 random
  sessions ("strong" now means "beats ~95% of random sorts"); a `lowSignal`
  **abstain** flag; Maker (Realistic, uncorrelated with values) capped at
  "slight" and barred from the primary slot; `explainMatch` now includes the
  honest-contrast clause instead of silently dropping disagreements.
- `relationshipCompass.js` — `shared_meaning` is now **pole-aware**
  (`max(z_trad, z_univ)`, not the average that cancelled for polarized users);
  `LOVE_MAP` partner-prescriptions replaced with **first-person noticing
  prompts** (no partner-shopping, no attachment vocabulary); `loveInsights`
  surfaces the evidence-backed `talk()` conversation prompts.
- `index.js` — portrait items **removed from the public bundle** (licensing);
  tests/demos import them directly.

**Web (`web/`)**
- `app.js` — **rewritten flow**: primer → one full 10-card sort → 10 MaxDiff
  trade-offs → honest results → optional lived-gap sort. Keyboard-accessible
  sort with live aria announcements and a committed-change gate; localStorage
  progress/resume; **URL-fragment permalinks** (own vs shared views) + copy-link
  share; results render confidence chips, a convergence verdict, provenance,
  uncertainty-gated centre-of-gravity, career abstain, and the stated-vs-lived
  gap with per-value action steps.
- `circumplex.js` — legible label sizes; the direction **arrow is gated** on
  magnitude (no confident vector from a directionless profile).
- `serve.js` — path **allowlist** (repo leak closed), full security-header set,
  gzip + ETag/304, 301 root, robots.txt, `.webp` MIME, trailing-separator guard,
  dev-mode cache bypass.
- `index.html` — honest title/description, OG/Twitter/canonical tags,
  modulepreload, `color-scheme: light dark`, an indexable `<noscript>` fallback.
- `sw.js` — only caches `res.ok` responses (no more cached 404s); icons added to
  the shell; cache version bumped.

**Tests** — 36/36 pass, including new coverage for retake-invariance, MaxDiff
opposite-pair co-occurrence, 3-signal convergence, pole-aware `shared_meaning`,
the Maker cap + abstain flag, the mismatch clause, and rendered-layer guardrails
banning type labels and percentages.

### Still open (tracked above)
Portrait signal (licensing-gated) · rendered share-card image + friend-compare
view · domain move + indexable landing · funnel telemetry · Supabase persistence
& email retest loop · O*NET career links · couples/AI-reflection/team layers.
