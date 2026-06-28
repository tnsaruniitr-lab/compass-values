# Compass — Career & Relationship Modules: Design Spec

**Status:** design / not yet implemented
**Depends on:** the existing values engine (`engine/scoring.js → buildProfile()`)
**Companion research:** [`RESEARCH_values-to-career-and-partner.md`](./RESEARCH_values-to-career-and-partner.md)

This spec turns the research findings into a concrete, buildable system that answers two
user questions from a Schwartz values profile:

- **A. "What career is best for me?"** — a ranked set of career *archetypes* with reasoning
  and example roles. **Scientifically defensible; build it.**
- **B. "What should my love interest be like?"** — a reflection-first *Relationship Values
  Compass* of alignment dimensions. **NOT a partner-type predictor** (the research refutes
  that); reframed to what is honestly supportable.

The guiding asymmetry (see research §1): **career-from-values is buildable as an exploration
tool; partner-from-values is not predictively buildable** and must be reflection-only.

---

## 0. Architecture

```
Existing Compass engine ──► profile.combined   (within-person z-scores, 10 values)
                            profile.higher     (4 higher-order axes)
                            profile.tensions    (opposing values both elevated)
        │
        ├──► [optional] 12-item RIASEC interest patch  ◄── needed for People↔Things (Realistic)
        │
        ▼
   Derived signals  (autonomy, risk, structure, status, impact, people↔things)
        │
        ├──► CAREER engine        → rank 8 archetypes → top 2–3 + reasoning + example roles
        └──► RELATIONSHIP engine  → 5 alignment dimensions + reflection (no partner types)
```

No new assessment is required for **career v1** — it runs on the existing values-only profile.
The **interest patch** (v2) unlocks the "Realistic / hands-on" region that values are blind to.

The 10 value IDs (canonical order, from `engine/values.js`):

```
self_direction, stimulation, hedonism, achievement, power,
security, conformity, tradition, benevolence, universalism
```

---

## A. CAREER MODULE

### A1. Derived signals

Computed from `profile.combined` (z-scores). These are the scientifically-grounded
intermediate variables (Sagiv values→RIASEC mapping + Theory of Work Adjustment):

| Signal | Formula | Interpretation |
|---|---|---|
| `autonomy`      | `self_direction − conformity`                       | self-led vs rule-following |
| `risk`          | `stimulation + hedonism − security`                 | novelty/risk vs predictability |
| `structure`     | `security + conformity + tradition − stimulation`   | needs clear roles & stability |
| `status`        | `power + achievement`                               | ambition / recognition / influence |
| `impact`        | `benevolence + universalism`                        | helping people / serving a cause |
| `people_things` | from RIASEC patch only (Social/Enterprising − Realistic/Investigative) | ⚠️ **values are ~blind here** |

> **Hard caveat (research §2.4):** the Realistic ("things-oriented") dimension has ≈0
> correlation with any value, yet People–Things is the *largest* axis of interest variation.
> A values-only model cannot place someone on it. `people_things` must come from the
> interest patch, not be inferred from values.

### A2. Career archetypes (the "categories")

Eight archetypes, each a **prototype vector** over the 10 values on a −2..+2 scale.
These are illustrative starting weights to be empirically calibrated (e.g. against the
Knafo & Sagiv 2004 32-occupation map). Order = the value-ID order above.

| Archetype | SD | ST | HE | AC | PO | SE | CO | TR | BE | UN | RIASEC | Example roles |
|---|--|--|--|--|--|--|--|--|--|--|---|---|
| **Independent Creative**     | +2 | +2 | +1 |  0 | −1 | −1 | −2 | −1 |  0 | +1 | Artistic | musician, designer, writer, filmmaker |
| **Founder / Entrepreneur**   | +2 | +1 | +1 | +2 | +1 | −2 | −1 | −1 | −1 | −1 | Enterprising | startup founder, business owner, solo operator |
| **Steady Professional (9–5)**| −1 | −2 |  0 | +1 |  0 | +2 | +2 | +1 | +1 |  0 | Conventional | accountant, civil servant, corporate ops |
| **Helper / Caregiver**       |  0 | −1 |  0 | −1 | −2 | +1 | +1 |  0 | +2 | +1 | Social | nurse, teacher, therapist, HR, coach |
| **Investigator / Expert**    | +2 |  0 |  0 | +2 | −1 |  0 | −1 | −1 |  0 | +1 | Investigative | scientist, engineer, researcher, doctor |
| **Leader / Operator**        | +1 |  0 |  0 | +2 | +2 | +1 | +1 |  0 | −1 | −2 | Enterprising+Conventional | executive, manager, lawyer, consultant |
| **Changemaker / Mission**    | +1 | +1 |  0 | −1 | −1 | −1 | −1 | −1 | +1 | +2 | Social+Enterprising | NGO, policy, advocacy, social enterprise |
| **Maker / Hands-On Builder** | +1 |  0 |  0 | +1 |  0 | +1 |  0 |  0 | −1 | −1 | **Realistic** (needs patch) | trades, applied engineering, chef, technician |

Notes:
- The user's three seed examples map cleanly: *creative musician* → **Independent Creative**,
  *entrepreneur* → **Founder**, *9-to-5* → **Steady Professional**. The other five answer
  "could there be other categories?" — yes.
- Archetypes are **not** mutually exclusive. Output the **top 2 as a blend**
  (e.g. Creative + Changemaker = "mission-driven creative").
- **Maker** is the archetype most dependent on the interest patch; without `people_things`
  it will be under-detected. Flag this in v1.

### A3. Matching method (no false precision)

1. Build user vector `u = [profile.combined[id] for id in VALUE_IDS]`.
2. For each archetype `a`, compute **Pearson correlation** `r(u, prototype_a)`.
   - Profile-shape match — defensible, and avoids the difference-score trap
     (Edwards 2001; see research §1 + §5.3). **Do not** use `Σ|u−p|` as a "fit score."
3. For archetypes with a RIASEC dependency (esp. Maker, Creative, Investigative), blend:
   `score_a = w_v · r(u, prototype_a) + w_i · interestMatch_a` (e.g. `w_v=0.7, w_i=0.3`;
   v1 sets `w_i=0` and notes reduced confidence for Realistic-heavy archetypes).
4. **Rank**; take top 2–3.
5. Convert score to a **qualitative band only** — *strong lean / moderate lean / slight lean* —
   **never** a percentage or a "97% match."
6. Surface `profile.tensions` as honest "watch-outs."

### A4. Reasoning-string generation

Deterministic template, driven by which values explain the match:

```
drivers  = values where sign(u[id]) == sign(prototype[id]) AND |u[id]| is largest   (top 2–3)
contrasts= the user's lowest 2 values (profile.bottom)
tensionMsg = profile.tensions[0] mapped to a sentence, if any

"You rank {drivers as names} at the top and {contrasts} near the bottom — a profile that
fits {archetype.tagline}. {archetype.example_sentence}. {tensionMsg}"
```

Each archetype carries `name`, `tagline`, `example_sentence`, `roles[]`, `antiFitNote`.

### A5. Worked examples (the output the system would emit)

**Profile 1** — top: Self-Direction, Stimulation, Universalism · bottom: Conformity, Tradition, Power · (Artistic↑, Realistic↓)
> **Strong lean: Independent Creative** · secondary: Changemaker.
> "You rank Self-Direction and Stimulation at the top and Conformity and Security near the
> bottom — a profile that needs autonomy and novelty and resists rigid rules. Your Artistic
> interests point that energy toward expressive work: musician, designer, independent creator.
> A fixed corporate 9-to-5 would chafe. Your Universalism adds a pull toward meaning — creative
> work with a cause fits best."
> *Watch-out:* Stimulation **and** Security both elevated → you may crave freedom and stability
> at once; expect to negotiate income predictability.

**Profile 2** — top: Achievement, Power, Self-Direction · bottom: Benevolence, Tradition, Security · (Enterprising↑)
> **Strong lean: Founder / Entrepreneur** · secondary: Leader / Operator.
> "High Achievement and Power with low Security means you're driven by results and status and
> tolerant of risk; high Self-Direction means you'd rather build your own thing than climb
> someone else's ladder. Founder, business owner, or commercial leadership fit. Your lower
> Benevolence is worth noting — build in purpose deliberately."

**Profile 3** — top: Security, Benevolence, Conformity · bottom: Stimulation, Power, Self-Direction · (Social↑)
> **Strong lean: Steady Professional + Helper.**
> "You prize stability and caring for others and score low on novelty-seeking and dominance.
> You'll thrive in a structured, people-centred role with predictability — nurse, teacher,
> public-sector, established-org HR. Entrepreneurship would likely feel stressful: it asks for
> the risk tolerance and autonomy your profile scores lowest on."

### A6. Calibration / honesty (must ship)

- Persistent one-liner: *"Values point to the kind of work you'll **enjoy** — not what you'll
  be **good at**, and not your destiny. Values/interest fit predicts job satisfaction only
  modestly (~3–4% of the variance)."* (Hoff et al. 2020; research §2.1.)
- Show occupation **families** with example roles as illustration, never "you must become X."
- Separate "enjoy" (values/interest) from "good at" (aptitude — **not** modelled).

### A7. The interest patch (v2)

To populate `people_things` and sharpen RIASEC, add ~12 items (2 per RIASEC type),
"how much would you enjoy…" 1–5. Recommended source: **O*NET Interest Profiler Short Form
(CC BY 4.0)** — free for commercial use with attribution — or public-domain IPIP/ORVIS items
if you want to edit/translate freely. Score to 6 RIASEC dimensions; feed `interestMatch_a`.

---

## B. RELATIONSHIP MODULE — the "Relationship Values Compass"

**Design constraint (non-negotiable, research §3):** do **not** output partner "types,"
compatibility scores, or longevity predictions. Pre-meeting traits/values predict ≈0% of the
dyad-specific click (Joel 2017/2020); actual value similarity is a weak, inconsistent predictor;
matching algorithms are unvalidated (Finkel 2012). Reframe from *who they are* → *what to look
for and talk about*.

### B1. The five alignment dimensions

| Dimension | From values | User lean (formula) | Reflection output |
|---|---|---|---|
| **Stability ↔ Adventure** | Conservation vs Openness | `higher.openness − higher.conservation` | pace-of-life alignment; the #1 thing to discuss if you lean Adventure |
| **Independence ↔ Togetherness** | SD/ST vs BE/CO/TR | `(self_direction+stimulation) − (benevolence+conformity+tradition)` | how much autonomy vs merged life |
| **Ambition ↔ Connection** | Self-Enhancement vs Self-Transcendence | `higher.self_enhancement − higher.self_transcendence` | work-vs-relationship priority talk |
| **Shared Meaning** | Tradition + Universalism | `tradition, universalism` levels | the **one** axis with real signal — deep worldview/values is where couples actually assort; surface mismatches early |
| **Caretaking balance** | Benevolence level | `benevolence` | high → watch for over-giving / reciprocity |

For each: report the user's lean and a *"what tends to harmonize / what to talk about"*
message — framed as **conversation prompts**, never a predicted partner.

### B2. The one honest predictive signal

The system may state: *"People who themselves hold strong self-transcendence (benevolence /
universalism) values tend to report happier relationships — a finding about **you**, not your
partner."* (van der Wal et al. 2024.) Framed as self-development.

### B3. Optional couple mode

If two profiles are present: show **shared vs divergent** values side-by-side as a discussion
artifact, explicitly "a mirror for conversation," with **no compatibility score**.

### B4. "Could there be other categories?"

For careers: yes — the 8 archetypes above. For partners: the honest unit is these **5 alignment
dimensions**, not partner archetypes. If a more type-like output is desired to match marketing,
the least-bad version is *"partners whose deep life-structure and meaning values tend to align
with yours — worth looking for and discussing,"* with zero scores or longevity claims.

---

## C. Guardrails (both modules)

- ❌ No single "compatibility %" / "fit score" from two profiles (use response-surface analysis
  if ever quantifying — Edwards / Shanock).
- ❌ No "your ideal partner is [type]" / "X% match" / success or longevity prediction.
- ❌ No "the career you're destined for" — use "tends to fit / worth exploring."
- ❌ No predicting *aptitude/performance* from values (P–O fit→performance ≈ .15).
- ❌ No inferring Realistic interests from values (uncorrelated) — capture via items.
- ❌ Don't quote perceived-fit-inflated numbers (ρ≈.56) as if cold-start matching delivers them
  (it delivers closer to ~.19).

---

## D. Implementation plan

| Step | Deliverable | Notes |
|---|---|---|
| D1 | `engine/careerArchetypes.js` | archetype prototypes + `rankArchetypes(profile)` + reasoning template; pure, tested |
| D2 | `engine/relationshipCompass.js` | 5-dimension compass + reflection messages; pure, tested |
| D3 | `test/careerArchetypes.test.js`, `test/relationshipCompass.test.js` | lock the 3 worked examples + guardrail assertions (e.g. output never contains a `%`) |
| D4 | web views: career results + relationship compass | reuse circumplex styling; persistent calibration line |
| D5 (v2) | `engine/interests.js` + 12-item patch + maxdiff/portrait integration | unlocks `people_things` / Realistic |
| D6 | rebuild standalone (`npm run build:standalone`) + sync `docs/index.html` | keep dist/docs in sync |

**Effect-size honesty is a feature, not fine print** — bake the calibration lines into the UI,
not a footnote.

---

## E. Key citations (see research doc for the full list)

- Sagiv (2002); Knafo & Sagiv (2004); Lipshits-Braziler et al. (2025) — values→RIASEC bridge.
- Hoff et al. (2020); Tsabari et al. (2005) — interest-fit→satisfaction ρ≈.17–.19.
- Dawis & Lofquist (1984) — Theory of Work Adjustment / O*NET work values.
- Edwards (2001); Shanock et al. (2010) — why difference scores fail; use RSA.
- Joel et al. (2017, 2020); Finkel et al. (2012) — partner compatibility is not predictable.
- van der Wal et al. (2024) — self-transcendence (own) → own relationship quality.
- Horwitz et al. (2023) — assortative mating: values/politics highest, personality ≈0.
