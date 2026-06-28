# Compass: Career-Fit and Partner-Fit from Values — A Decision-Grade Briefing

**Prepared for:** the Compass product/research team
**Question:** What scientific frameworks exist to assess partner type and career type from a Schwartz values profile, and is there a concrete, defensible approach we can ship?
**Date:** 2026-06-28

---

## 1. Executive Summary

- **CAREER fit is buildable and defensible — with honest framing.** There is a real, replicated bridge from Schwartz values to vocational interests (RIASEC) and to work values (O*NET / Theory of Work Adjustment). The data infrastructure to ship it is free and openly licensed (O*NET Database + Interest Profiler, both CC BY 4.0). **But the effect sizes are modest**: even a perfect values→interest translation predicts downstream job satisfaction only weakly (interest-congruence→satisfaction meta-analytic r ≈ .17–.19). Ship career as a "directional exploration / families-that-tend-to-fit" tool, not a precision recommender.

- **PARTNER fit from values is NOT predictively buildable — and we should not pretend otherwise.** The strongest, most rigorous evidence (machine learning across 43 longitudinal datasets and preregistered speed-dating studies) shows that the dyad-specific "click" and long-term relationship quality are essentially **unpredictable from a partner's traits/values measured in advance**, and a partner's own profile adds **~nothing** beyond a person's own relationship-specific perceptions. Commercial matching-algorithm claims have been judged "unsubstantiated and likely false" (Finkel et al. 2012). A predictive "your ideal partner is X" feature would be overpromising in a way the science directly contradicts.

- **The honest partner feature is reflection/education, not prediction.** What IS supported: (a) values/ideology/religiosity are the domain where real couples are *most* alike (assortment is genuine), and (b) holding *self-transcendence* values yourself predicts *your own* relationship quality. Neither of these licenses a compatibility score. A responsible module surfaces "how your top values tend to show up in relationships and which value tensions to watch for" — a conversation/self-awareness tool, explicitly not a matchmaker.

- **A critical technical caveat governs both modules:** do not collapse two value profiles into a single difference/correlation "fit score." Edwards' well-established critique shows difference scores are unreliable and confounded; the accepted standard is polynomial regression / response-surface analysis. And values should be analyzed centered (ipsative), with the *caveat* that centering-vs-raw is a genuinely unsettled methodological choice (Borg & Bardi 2016) — not an absolute rule.

- **Bottom line:** Build CAREER as a flagship, with calibrated language. Build PARTNER as reflection-only, with explicit anti-prediction guardrails. The science cleanly supports this asymmetry.

---

## 2. CAREER Fit from Values — The Frameworks

The pipeline is: **Schwartz values → vocational interests (RIASEC) and/or work values (O*NET 6) → occupation families.** Four bodies of evidence underpin it, with different strengths.

### 2.1 Holland's RIASEC vocational interest model — *well-validated structure, weak payoff*

RIASEC classifies people and environments into six types (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) arranged on a circle. The circular structure replicates strongly in US/Western adult samples (Tracey & Rounds 1993, structural meta-analysis of 104 matrices). **Caveat — verified:** it fits *significantly worse* in US ethnic-minority and international/collectivistic samples (Rounds & Tracey 1996; only ~3 of 18 countries — Iceland, Japan, Israel — reached acceptable fit). [Tracey & Rounds 1993, *Psychological Bulletin*; Rounds & Tracey 1996, *J. Counseling Psychology*]

**The practical payoff is weak and this is the single most important career caveat.** Interest–environment congruence predicts job satisfaction at only **r ≈ .17** (Tsabari, Tziner & Meir 2005, N=6,557), corroborated by the larger Hoff et al. (2020) meta-analysis at **ρ ≈ .19** (105 studies, N=39,602) — roughly **3–4% of variance** in satisfaction. [Tsabari et al. 2005, *J. Career Assessment*, https://journals.sagepub.com/doi/10.1177/1069072704273165; Hoff et al. 2020, *JVB*, https://www.sciencedirect.com/science/article/abs/pii/S0001879120301287]

Interest *congruence predicts performance somewhat better* (~.32, Nye et al. 2017) than satisfaction, and interests are **highly stable in adulthood** (rank-order r ≈ .65–.77; Low et al. 2005), which justifies using them as a stable matching target. *Verification note:* the often-cited "incremental validity" of interests (Nye et al. 2012) is mislabeled — Nye 2012 demonstrated zero-order validity (~.20) without controlling for IQ/Big Five; genuine incremental evidence comes from Stoll et al. (2017), and the increments are small.

### 2.2 Theory of Work Adjustment (TWA) / O*NET Work Values — *the most concrete values→occupation mechanism*

TWA (Dawis & Lofquist, Minnesota) says good fit = *correspondence* between a person's needs/values and an environment's reinforcers (predicts satisfaction). This is the direct parent of **O*NET's six Work Values** (Achievement, Independence, Recognition, Relationships, Support, Working Conditions), derived from the Minnesota Importance Questionnaire's **20 needs**. *Verification note:* the lineage is confirmed (O*NET values are explicitly "updated versions of Dawis and Lofquist's 1984 TWA values"); the claim of "20–21 needs" should be corrected to **20 MIQ needs** (the "21" is the number of *items* in the Work Importance Profiler, not needs). The value named "Independence" maps to TWA's *Autonomy*, while the *need* "Independence" loads under Working Conditions — a subtle mapping point to get right. [O*NET DevWIL.pdf / DevCWIP.pdf; UMN VPR https://vpr.psych.umn.edu/miq]

**Effect sizes — verified as "mixed":** TWA correspondence→satisfaction is modest (~r .30–.40 in foundational MIQ studies). The broader person-job needs-supplies fit→satisfaction meta-analytic estimate is ρ ≈ .44–.56 (Kristof-Brown et al. 2005) — **but that larger number is driven by *perceived/subjective* fit inflated by common-method variance.** *Objective profile-matching — exactly what O*NET cold-start matching does — is the weakest operationalization* (closer to the interest-congruence ~.19 range). Two further honesty caveats: (1) O*NET per-occupation value scores are **expert-rated/transposed from earlier reinforcer patterns, not surveyed from incumbents** (unlike O*NET skills/abilities); (2) there is little causal/longitudinal evidence that *acting on* O*NET recommendations improves outcomes. [Kristof-Brown et al. 2005, *Personnel Psychology*; McCloy et al. 1999, O*NET]

### 2.3 Person-Environment fit (the umbrella) — *strong for attitudes, weak for performance*

Value congruence (supplementary P-O fit) reliably relates to **attitudes** — satisfaction, commitment, intent-to-stay — but only **weakly to behavior/performance**. Arthur et al. (2006): P-O fit criterion validity is just ~.15 for performance, ~.24 for turnover. Verquer et al. (2003): value-based P-O fit→satisfaction ρ ≈ .28. **Translation for Compass: values matching predicts how much someone will *like* a job, not how *good* they'll be at it** (use O*NET abilities for the latter). [Kristof-Brown 2005; Verquer et al. 2003; Arthur et al. 2006]

### 2.4 Direct Schwartz → occupation evidence — *real, moderate, with a hard gap*

The empirical bridge rests on Sagiv (2002, two studies, N=97 and N=545) plus Knafo & Sagiv (2004, 32 occupations) and the recent Lipshits-Braziler et al. (2025, N=636). **The directional mapping is verified well-supported:**

| Schwartz value pole | RIASEC interest | Direction |
|---|---|---|
| Power, Achievement (Self-Enhancement) | **Enterprising** | + |
| Universalism | Enterprising | − |
| Benevolence, Universalism (Self-Transcendence) | **Social** | + |
| Self-direction, Universalism (Openness-to-Change) | **Artistic, Investigative** | + |
| Security, Conformity, Tradition (Conservation) | **Conventional** | + |
| (any value) | **Realistic** | **≈ 0 (null)** |

**Axis correspondence (verified well-supported, "maps roughly"):** Self-Transcendence vs Self-Enhancement ↔ Social vs Enterprising; Openness vs Conservation ↔ Artistic/Investigative vs Conventional.

Two hard caveats:
- **Magnitudes are moderate (~r .2–.4) and likely toward the lower end — NOT a 1:1 translation.**
- **The Realistic ("things-oriented") dimension shows essentially zero correlation with values (verified well-supported).** Because the People–Things axis is the single largest dimension of interest variation (sex difference d ≈ 0.93; Su et al. 2009), **a values-only model is blind to a huge chunk of the interest space.** Realistic must be captured by a separate input (e.g., an interest item set), not inferred from values.

*Verification note on the "shared circumplex" justification:* the claim that the two circles share a single proven circumplex geometry is **mixed/overstated**. Each is better described as a *quasi-circumplex / circular ordering* than a strict equal-spacing circumplex; structural similarity of two independently-developed circles is **not by itself proof** one maps onto the other. The bridge is justified by the *empirical Sagiv-type correlations*, not by geometry alone. Treat the circumplex story as helpful intuition, not as the evidence.

**Also verified ("mixed"):** the prescription that values "must" be centered/ipsatized "to behave correctly" is overstated — centering is recommended-but-disputed (Borg & Bardi 2016 show the within-person mean carries valid criterion variance). Center for circumplex/profile work; consider retaining or covarying the mean for criterion prediction.

---

## 3. PARTNER Fit from Values — The Frameworks (and why prediction fails)

### 3.1 Similarity-attraction — *real, but mostly a lab-at-zero-acquaintance effect*

Byrne's classic finding (liking rises with proportion of shared attitudes) is meta-analytically robust **for initial attraction in no-interaction settings**: Montoya et al. (2008), 313 studies / 460 effects, actual similarity→attraction **r ≈ .47** — but **this effect becomes non-significant in existing relationships.** The large number is a zero-acquaintance phenomenon that collapses on real contact. [Montoya, Horton & Kirchner 2008, *JSPR*, https://journals.sagepub.com/doi/10.1177/0265407508096700]

### 3.2 Complementarity ("opposites attract") — *unsupported for values*

Largely null-to-negligible for value/attitude complementarity. Assortative-mating data clinch it: of 133 UK Biobank traits, ~97.5% of significant correlations were *positive*; only ~3 negative (Horwitz et al. 2023). "Opposites attract" is essentially false.

### 3.3 Actual vs Perceived similarity — *the decisive distinction*

This is the crux. **Verified well-supported:** *perceived* similarity predicts attraction/satisfaction more strongly than *actual* similarity. In Tidwell, Eastwick & Finkel's (2013) speed-dating study, perceived similarity predicted romantic interest while **actual similarity did not.** In newlyweds (Luo & Klohnen 2005, N=291), couples were similar on values but actual value similarity was **largely unrelated to marital quality.** [Tidwell et al. 2013, *Personal Relationships*; Luo & Klohnen 2005, *JPSP*]

**Why this kills a values-matching product:** a product can compute *actual* similarity (the thing with little predictive weight) but *perceived* similarity (the thing that predicts) is partly a *consequence* of liking (projection/reverse causation) — so it is a poor matchmaking *input*.

### 3.4 Value congruence → relationship satisfaction — *weak, mixed, domain/gender-specific*

**Verified overstated (high confidence):** value similarity does NOT *reliably* predict satisfaction. Effects are small, often vanish once own-value main effects are controlled, and are frequently gender-asymmetric (Gaunt 2006; Leikas et al. 2018; a 2023 HK response-surface study found a self-transcendence-similarity effect *for females only*). The **stronger and cleaner finding is about value *level*, not similarity:** van der Wal et al. (2024, 5 studies, N≈1,056) — holding *self-transcendence* values predicts one's *own* relationship quality (an actor effect); it does **not** reliably raise the partner's satisfaction. [van der Wal et al. 2024, *PSPB*; Leikas et al. 2018, *PAID*]

### 3.5 Assortative mating — *values ARE where couples really sort (but it doesn't license prediction)*

The most authoritative map (Horwitz et al. 2023, *Nature Human Behaviour*; meta-analysis of 22 traits + 133 traits in ~80,000 UK Biobank couples): **political/religious attitudes show the highest assortment of any psychological trait (meta r ≈ .58; individual studies ~.6–.7).** Education r ≈ .53. By sharp contrast, **Big Five personality assortment is near-zero (avg r ≈ .11).** Mean partner r across all traits = .19. Similarity is mostly *selected*, not converged (Watson 2004 newlyweds; Humbad 2010), and political assortment is mate-choice not persuasion (Alford 2011).

**But two caveats prevent over-reading this:** (1) much apparent matching is *indirect* — Mendelian-randomization decomposition (Sjaarda & Kutalik 2023) attributes large shares of partner correlation to confounders: household income ~29.8%, health ~14.1%, education ~11.6%, i.e., social homogamy, not direct value-on-value matching; (2) **that couples *end up* similar on values does not mean a values profile can *predict* a good partner for an individual** — assortment describes population-level sorting, not dyad-level forecasting.

### 3.6 ML prediction studies — *the strongest evidence, and it says "don't"*

- **Joel, Eastwick & Finkel (2017)** + **Eastwick et al. (2023, preregistered):** ML on 100+ pre-date measures predicted *actor* desire (who likes broadly) and *partner* desirability (who is liked broadly) somewhat, but **could not predict relationship-specific "compatibility" variance — the unique click — above chance.** [Joel et al. 2017, *Psychological Science*; Eastwick et al. 2023, *EJP*]
- **Joel et al. (2020, PNAS, 43 datasets, >11,000 people):** relationship-specific perceptions explained up to ~45% of relationship-quality variance at baseline; individual differences ~21%; **a partner's own characteristics and trait/value similarity added essentially no incremental predictive power.** [https://www.pnas.org/doi/10.1073/pnas.1917036117]
- **Finkel et al. (2012, PSPI):** dating-site matching algorithms have "no compelling evidence" of working; pre-meeting compatibility matching is "unlikely… even in principle." [https://faculty.wcas.northwestern.edu/eli-finkel/documents/2012_FinkelEastwickKarneyReisSprecher_PSPI.pdf]

**Honest bottom line for partner:** values give an excellent measurement *backbone* and a real *reflection* surface, but the specific claim "your value profile predicts your ideal partner type / relationship success" is **unsupported and, for dyadic compatibility, arguably refuted.**

---

## 4. Verification Call-Outs (high-stakes claims)

| Claim | Verdict | Effect size / key number |
|---|---|---|
| Values profile predicts the **specific** best-fit occupation | **Overstated** (med) | Values↔interest r ≈ .15–.50, mostly low end; Realistic ≈ 0. Broad interest/orientation links only, not specific-occupation classification. |
| Values profile predicts the **type of partner** best suited | **Overstated** (high) | Pre-meeting ML predicts ~0% of compatibility variance (Joel 2017); matching algorithms unvalidated (Finkel 2012). |
| Value **similarity** reliably predicts relationship satisfaction | **Overstated** (high) | Actual similarity ns in existing relationships; perceived ~.39. Joel 2020: similarity adds near-zero. |
| Perceived similarity predicts satisfaction **more than** actual | **Well-supported** (med) | Actual ns in existing relationships vs perceived significant; Tidwell 2013 actual=null. |
| Schwartz & RIASEC share a **common circumplex** | **Mixed** (high) | Both are quasi-circumplexes; structural similarity ≠ proven mapping. Bridge rests on Sagiv correlations. |
| Sagiv value→RIASEC **directional** mapping | **Well-supported** (med) | Directions correct; magnitudes ~.2–.4 (likely lower), not 1:1. |
| Realistic interests **null** with values | **Well-supported** (med) | Realistic ≈ 0; People–Things axis d ≈ 0.93 — a large blind spot. |
| Self-transcendence↔Social, Openness↔Artistic/Investigative axis correspondence | **Well-supported** (med) | Moderate (~|.2–.4|); "roughly" is warranted. |
| Values **must** be centered/ipsatized | **Mixed** (med) | Recommended but disputed (Borg & Bardi 2016); question-dependent. |
| RIASEC fits worse cross-culturally; Schwartz circle more robust | **Well-supported** (high) | Only ~3/18 countries fit RIASEC order (Rounds & Tracey 1996). |
| Interest-congruence→satisfaction r = .17 (Tsabari 2005) | **Well-supported** (high) | r = .17, N=6,557; Hoff 2020 ρ=.19, N=39,602 (~3–4% variance). |
| Interests have incremental validity (Nye 2012) + stable | **Mixed** (med) | Stability strong (.65–.77 adult); Nye 2012 is zero-order (~.20), not incremental — misattributed. |
| RIASEC–Big Five anchors (.48/.41/.31/.28) | **Well-supported** (high) | Matches Larson et al. 2002 exactly. |
| O*NET Work Values are TWA descendant from MIQ "20–21 needs" | **Well-supported** (high) | Lineage correct; **20** MIQ needs (not 21); value "Independence" ≠ need "Independence". |
| O*NET profile matching validly recommends occupations | **Mixed** (med) | Mechanism real but modest; objective profile fit is weakest operationalization (~.19), expert-rated scores, thin causal evidence. |

---

## 5. Recommended Concrete Approach for Compass

### 5.1 Career module — *ship it, framed as guided exploration*

**Pipeline:**

1. **Input — values:** reuse the existing Compass Schwartz engine (MaxDiff + PVQ-style portrait items). Score to the 4 higher-order dimensions + 10 basic values; analyze centered (ipsative). The higher-order dimensions are the most cross-culturally robust layer — lean on them.
2. **Bridge — values → RIASEC prior:** build a home-made crosswalk from the Sagiv (2002) / Lipshits-Braziler (2025) directional matrix (Section 2.4). Self-Enhancement→Enterprising; Self-Transcendence→Social; Openness→Artistic/Investigative; Conservation→Conventional. **Treat outputs as a soft prior, not a verdict.**
3. **Patch the Realistic gap — mandatory:** because values are blind to Realistic, add a short **interest item set** to capture the People–Things axis directly. Use the **O*NET Interest Profiler Short Form (60 items, CC BY 4.0)** — ship-ready, openly licensed — or the **public-domain ORVIS/IPIP** items if you want full freedom to edit/translate. This converts the pipeline from "values-only" (partial) to "values + interests" (complete RIASEC).
4. **Optional second channel — work values:** map the user's Schwartz profile (or a short Work Importance item set) onto the **O*NET 6 Work Values**. Self-Enhancement→Achievement/Recognition; Self-Transcendence→Relationships; Openness→Independence; Conservation→Support/Working Conditions.
5. **Occupation matching:** ingest the **O*NET Database** (CC BY 4.0) per-occupation RIASEC high-point codes and Work Values; rank **occupation *families*** (not single jobs) by correspondence. **Do not use a single difference score** — present top RIASEC/work-value matches and the occupation clusters associated with them, optionally filtered by O*NET Job Zone (training level). If you ever compute a quantitative fit metric for analysis, use polynomial regression / response-surface analysis (Edwards), not |X−Y|.

**Honest framing in the UI:**
- "Careers that tend to attract people who value what you value" — *tendency*, not destiny.
- Show *families* (e.g., "helping/social roles," "investigative/analytical roles"), with example occupations as illustration.
- A one-line calibration: "Values and interests nudge career satisfaction modestly — most of your job happiness will come from the specific role, team, and how you experience the work, not from picking the 'right' category." (Grounded in the .17–.19 congruence ceiling and Kristof-Brown's perceived-fit finding.)
- Separate "what you'll *enjoy*" (values/interest fit) from "what you'll be *good at*" (we are NOT predicting aptitude).

**Data sources & licensing (all free, commercial-OK with attribution):** O*NET Database (CC BY 4.0); O*NET Interest Profiler Short Form (CC BY 4.0); O*NET Web Services REST API (free, API key); ORVIS/IPIP (public domain). **Watch-out:** the Schwartz **PVQ/PVQ-RR items are NOT openly licensed** (free for academic use by author permission; commercial use is a gray area) — clear with Schwartz or rely on your own portrait-item engine.

### 5.2 Partner module — *reflection-first, prediction-never*

The evidence forbids a predictive matcher. Build a **values-in-relationships reflection tool** instead. It reuses the same value profile and is honest by design.

**What it does:**
1. **"How your top values tend to show up in relationships."** For each of the user's top values, a short, evidence-flavored reflection (e.g., high Self-Direction → "you likely need autonomy and resist feeling managed"; high Conformity/Tradition → "you may value shared rituals and predictability"; high Benevolence → "you're oriented to caretaking and may over-give"). Educational, first-person, non-predictive.
2. **Value-tension prompts.** Surface the *internal* tensions in the user's own profile (the Schwartz circle's built-in conflicts: Openness vs Conservation, Self-Enhancement vs Self-Transcendence) and frame them as conversation starters: "Where you prize novelty, a partner who prizes security isn't 'wrong' — here's the recurring negotiation to expect, and questions to ask."
3. **A grounded, honest insight (the one real signal):** gently note the *level* finding — people who hold strong self-transcendence (benevolence/universalism) values tend to report higher relationship quality themselves (van der Wal 2024). Frame as self-development, not partner-selection.
4. **Optional couple mode (both partners present):** show *shared and divergent* values side-by-side as a discussion artifact — explicitly "a mirror for conversation," with **no compatibility score**.

**Rationale from the evidence:** (a) dyad compatibility is unpredictable pre-meeting (Joel 2017/2023); (b) a partner's profile adds ~nothing to relationship-quality prediction (Joel 2020); (c) actual value similarity is a weak, inconsistent predictor (Gaunt, Leikas, van der Wal); (d) perceived similarity — the thing that predicts — is a *consequence* of liking, so it can't be an input. Reflection sidesteps all four failure modes while delivering genuine self-awareness value.

### 5.3 What to AVOID (both modules)

- ❌ A single "compatibility %" or "fit score" from two profiles (Edwards: unreliable, confounded). Use RSA if you must quantify.
- ❌ "Your ideal partner is [type]" / "X% match" / any longevity or success prediction. Refuted by the strongest science.
- ❌ "This is the career you're destined for." Use "tends to fit / worth exploring."
- ❌ Predicting *aptitude/performance* from values (P-O fit→performance ≈ .15).
- ❌ Implying RIASEC/values mapping is precise or universal — flag the moderate magnitudes and the weaker cross-cultural fit of RIASEC.
- ❌ Inferring Realistic interests from values (they're uncorrelated) — always capture via interest items.
- ❌ Citing perceived-fit-inflated numbers (ρ ≈ .56) as if they were what your cold-start matching delivers (it delivers closer to ~.19).

---

## 6. Concrete Resources Table

| Instrument / Dataset | What it gives | Licensing / availability | Verdict for Compass |
|---|---|---|---|
| **O*NET Database** (incl. per-occupation RIASEC + 6 Work Values) | Occupation-side profiles, ~900–1,000 occupations | **CC BY 4.0**, free incl. commercial, attribution to O*NET/US DOL-ETA | **USE — backbone occupation layer** |
| **O*NET Web Services API** | Live latest DB, occupation/values/search endpoints, JSON | Free, registration/API key | **USE** |
| **O*NET Interest Profiler — Short Form (60 items)** | RIASEC self-report (patches Realistic gap) | **CC BY 4.0** | **USE — best open RIASEC instrument** |
| **ORVIS (Oregon Vocational Interest Scales) / IPIP items** | 8-dim interest measure, splits Realistic; editable | **Public domain** (IPIP) | **USE — freest option; edit/translate freely** |
| **O*NET Work Importance Profiler / Locator (WIP/WIL)** | User's 6 Work Values profile | Free; lighter psychometrics than MIQ | **OPTIONAL — usable, treat as indicative** |
| **Schwartz PVQ-RR (57 items, 19 values)** | Gold-standard value profile | **NOT openly licensed** — free academic use by author permission; commercial = clear with Schwartz | **CAUTION — prefer own portrait engine for commercial use** |
| **Schwartz PVQ-21 (ESS Human Values Scale)** | 10 values; coarser; weaker alphas (.47–.80) | Items reproducible via ESS; same Schwartz-copyright caveat; ESS data free non-commercial | **PARTIAL — good for norms, not as product instrument w/o clearance** |
| **Schwartz SVS (57-item ranking)** | Original value measure, abstract | Academic use by request | **NOT preferred** (cognitively demanding; superseded) |
| **MIQ (Minnesota Importance Questionnaire)** | 20 needs / 6 TWA values | **Proprietary/licensed** via U. Minnesota | **NOT usable free — use O*NET descendant instead** |
| **Super's Work Values Inventory–Revised** | 12-scale work values | Published/licensed; **no public occupation crosswalk** | **NOT usable for matching** (no occupation dataset) |
| **ESS dataset (PVQ-21 × ISCO occupation)** | Empirical value×occupation baselines | Free non-commercial, registration | **USE for norms/baselines** (non-commercial) |
| **Knafo & Sagiv (2004) 32-occupation value map** | Empirical occupational value signatures | Research figure (not a tool) | **REFERENCE — seed the crosswalk** |
| **R package `RSA` / Shanock et al. 2010 macros** | Response-surface analysis (correct fit modeling) | Open | **USE if quantifying fit** |
| **Any validated values→partner-matching instrument** | — | **DOES NOT EXIST** | **N/A — do not claim one** |

---

## 7. Key Citations

**Career — structure & mapping**
- Sagiv, L. (2002). Vocational interests and basic values. *J. Career Assessment*, 10(2), 233–257. https://eric.ed.gov/?id=EJ646712
- Knafo, A., & Sagiv, L. (2004). Values and work environment: Mapping 32 occupations. *EJPE*, 19(3), 255–273. https://link.springer.com/article/10.1007/BF03173223
- Lipshits-Braziler, Y., Arieli, S., & Daniel, E. (2025). Personal values and career-related preferences among young adults. *J. Personality*. https://onlinelibrary.wiley.com/doi/full/10.1111/jopy.12935
- Tracey, T. J. G., & Rounds, J. (1993). Evaluating Holland's and Gati's vocational-interest models. *Psychological Bulletin*, 113(2), 229–246.
- Rounds, J., & Tracey, T. J. G. (1996). Cross-cultural structural equivalence of RIASEC models. *J. Counseling Psychology*, 43(3), 310–329.
- Larson, Rottinghaus & Borgen (2002). Meta-analyses of Big Six interests and Big Five. *JVB*, 61(2), 217–239.

**Career — payoff / validity**
- Tsabari, Tziner & Meir (2005). Congruence–satisfaction meta-analysis. *J. Career Assessment*, 13(2), 216–232. https://journals.sagepub.com/doi/10.1177/1069072704273165
- Hoff, Song, Wee, Phan & Rounds (2020). Interest fit and job satisfaction. *JVB*, 123, 103503. https://www.sciencedirect.com/science/article/abs/pii/S0001879120301287
- Kristof-Brown, Zimmerman & Johnson (2005). Consequences of fit at work. *Personnel Psychology*, 58, 281–342.
- Verquer, Beehr & Wagner (2003). P-O fit and work attitudes meta-analysis. *JVB*, 63, 473–489.
- Arthur, Bell, Villado & Doverspike (2006). P-O fit criterion validity. *JAP*, 91, 786–801. https://pubmed.ncbi.nlm.nih.gov/16834506/
- Nye, Su, Rounds & Drasgow (2012; 2017). Vocational interests and performance. *PoPS* 7(4); *JVB* 98.
- Low, Yoon, Roberts & Rounds (2005). Stability of vocational interests. *Psychological Bulletin*, 131(5), 713–737.
- Dawis & Lofquist (1984). *A Psychological Theory of Work Adjustment.* https://vpr.psych.umn.edu/theory-work-adjustment

**Methodology**
- Edwards, J. R. (2001). Ten difference score myths. *Org. Research Methods*, 4, 264–286. https://journals.sagepub.com/doi/10.1177/109442810143005
- Shanock et al. (2010). Polynomial regression with response surface analysis. *J. Business & Psychology*, 25, 543–554.
- Borg, I., & Bardi, A. (2016). Should ratings of importance of personal values be centered? *JRP*. https://www.sciencedirect.com/science/article/abs/pii/S0092656616300472

**Partner**
- Montoya, Horton & Kirchner (2008). Actual vs perceived similarity meta-analysis. *JSPR*, 25(6), 889–922. https://journals.sagepub.com/doi/10.1177/0265407508096700
- Tidwell, Eastwick & Finkel (2013). Perceived, not actual, similarity predicts attraction. *Personal Relationships*, 20(2), 199–215.
- Luo & Klohnen (2005). Assortative mating and marital quality. *JPSP*, 88(2), 304–326.
- Joel, Eastwick & Finkel (2017). Is romantic desire predictable? *Psychological Science*, 28(10), 1478–1489. https://journals.sagepub.com/doi/10.1177/0956797617714580
- Eastwick et al. (2023, preregistered). Predicting romantic interest. *EJP*, 37(4).
- Joel et al. (2020). ML across 43 longitudinal couples studies. *PNAS*, 117(32), 19061–19071. https://www.pnas.org/doi/10.1073/pnas.1917036117
- Finkel, Eastwick, Karney, Reis & Sprecher (2012). Online dating: a critical analysis. *PSPI*, 13(1), 3–66.
- van der Wal et al. (2024). Values in romantic relationships. *PSPB*, 50(8).
- Leikas et al. (2018). Relationship satisfaction and similarity of values. *PAID*, 123, 191–198.

**Assortative mating**
- Horwitz, Balbona, Paulich & Keller (2023). Correlations between human partners (22 + 133 traits). *Nature Human Behaviour*, 7(9), 1568–1583. https://www.nature.com/articles/s41562-023-01672-z
- Watson et al. (2004). Match makers and deal breakers. *J. Personality*, 72(5), 1030–1068.
- Alford, Hatemi, Hibbing, Martin & Eaves (2011). The politics of mate choice. *J. Politics*, 73(2), 362–379.
- Sjaarda & Kutalik (2023). Partner choice, confounding, convergence. *Nature Human Behaviour*, 7(5), 776–789. https://www.nature.com/articles/s41562-022-01500-w

**Values foundation**
- Schwartz, S. H. (1992). Universals in the content and structure of values. *Adv. Exp. Soc. Psych.*, 25, 1–65.
- Schwartz et al. (2012). Refining the theory of basic individual values. *JPSP*, 103(4), 663–688.
- Schwartz & Cieciuch (2022). PVQ-RR psychometrics across 49 cultural groups. *Assessment*, 29(5).

---

**One-sentence verdict:** Build the **career module** as an openly-licensed, honestly-calibrated *exploration* tool (values + a Realistic-patching interest set → O*NET occupation families), and build the **partner module** as a *reflection-and-conversation* tool with hard guardrails against any predictive or compatibility-scoring claim — because the best available science supports the former and directly refutes the latter.