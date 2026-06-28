# Building a Values-Discovery App on Concrete Research

**A research report + product/technical plan**

*Prepared 2026-06-27. Audience: a general personal-growth / self-discovery product. Methodological backbone chosen by the evidence.*

---

## How this report was produced

This document is the output of a multi-agent deep-research process: seven parallel web-research agents swept the literature across distinct dimensions (validated value frameworks, measurement instruments, the stated-vs-revealed "real values" gap, ACT/clinical values-clarification, the existing app/market landscape, AI/behavioral value inference, and psychometric/ethical design). The riskiest and most quantitative claims were then **adversarially fact-checked** against primary sources, and a skeptical reviewer pass hunted for overstatements and gaps. Where verification changed or qualified a claim, the correction is reflected inline and summarized in §"Caveats, corrections & open problems" at the end. Treat that final section as essential reading, not an appendix — it is where the honest limits of this plan live.

---

## Executive summary

**Can you build an app that identifies people's *real* values on solid research? Yes — but only if you design against the thing that makes it hard: people's self-reports describe their *aspirational* self, not their *operative* values.** The entire credibility of such a product hinges on confronting that gap rather than papering over it.

**The science gives you a clear backbone.** Of the six major value frameworks, the **Schwartz Theory of Basic Human Values** is the right foundation. It is the only model that is simultaneously individual-level, exhaustive of the motivational value space (with caveats noted below), the most cross-culturally replicated value model in existence, and structured as a **circular continuum** — two bipolar axes (Openness↔Conservation, Self-Enhancement↔Self-Transcendence) — that lets you show *trade-offs and tensions*, not just a flat ranked list. No major consumer app is built on it, largely because it is abstract and licensed; that is both an opportunity and a warning.

**The core method is triangulation, and the gap is the product.** No single instrument is a values lie-detector. The strongest design combines four signals: (A) a layperson-friendly **portrait questionnaire** anchor; (B) a **forced-choice / MaxDiff trade-off** module — the single best-evidenced lever for surfacing *operative* priorities, ideally Thurstonian-IRT-scored; (C) an **AI-driven reflective dialogue** grounded in ACT values-clarification and motivational interviewing; and (D) optional **behavioral / experience-sampling** signals (the closest thing to "lived" values, but they measure *constrained* behavior, not values directly). The headline, differentiating output is the honest **"stated-vs-lived gap"** — framed as a growth lever, never a verdict.

**Borrow from clinical psychology.** ACT treats values as freely chosen life *directions* (not goals) and already operationalizes the importance-vs-consistency gap (Valued Living Questionnaire, Bull's-Eye). These are the validated bridge from *measuring* values to *living* them — exactly the personal-growth use case.

**Win on honesty, not on mysticism.** The market is full of pop-psychology "type" labels and Barnum-effect flattery (the MBTI critique is the cautionary tale). Differentiate with specific, falsifiable, user-grounded feedback; positions on a continuum rather than boxes; visible confidence/uncertainty; and a strict "no clinical claims, no unvalidated matching" firewall.

### The five things most likely to sink this — address them first

1. **Group-level validity ≠ individual-level precision.** Almost all of Schwartz's celebrated validity is *structural/aggregate* evidence. The product depends on trusting an *individual's* score on short (2–3 item) scales. You must establish individual-level reliability (report a standard error of measurement, define a reliable-change index) before any "drift"/"growth" feature is trustworthy.
2. **Change scores are noisy.** "Values drift detection" and "growth over time" — the monetized longitudinal loop — are difference scores built on subscales with alphas as low as .16–.55. Without reliable-change thresholds and age/maturation baselines, you'll be charging users to watch measurement noise.
3. **Licensing is probably *on* the critical path, not off it.** The MVP's MaxDiff/best-worst and portrait items are Schwartz-derived and likely require commercial licensing too — not just the full PVQ-RR. Confirm written rights for *all* Schwartz-derived content in Phase 0.
4. **Clinical safety of the "uncomfortable gap."** Your target user is reflective and sometimes "stuck"/in midlife re-evaluation — and your headline feature deliberately surfaces a painful discrepancy, plus optional mortality-themed exercises. You need at-risk screening, a crisis-escalation pathway, an under-18 policy, and a DPIA — not just "surface resources."
5. **The moat is unproven and the price/value is inverted.** "No app uses Schwartz" is asserted without a competitive scan; Schwartz's abstractness may be *why* incumbents avoid it, and could depress your adoption too. And the plan gives the strongest-evidence features away free while charging for the weakest-evidence, highest-fatigue ones (logging/coaching). Stress-test this before building.

**Recommended first build (de-risked MVP):** onboarding psychoeducation (values vs. goals) → card-sort warm-up → MaxDiff trade-off core → brief portrait questionnaire reported at the *higher-order quadrant* level → circumplex results with confidence + tensions → basic profile-grounded AI reflection → simple re-assessment. Free core; honest copy calibrated to small effect sizes. Defer EMA, behavioral traces, full PVQ-RR, and any growth/efficacy marketing claims until licensing, individual-level reliability, clinical-safety review, and a small efficacy pilot are in hand.

---

# Part I — The Science of Personal Values

## 1. What "Values" Are — and How They Differ from Personality, Interests, and Strengths

In academic psychology, **values** are defined as *desirable, trans-situational goals, varying in importance, that serve as guiding principles in a person's life* ([Personal Values Across Cultures (Sagiv & Schwartz, 2022)](https://www.annualreviews.org/doi/10.1146/annurev-psych-020821-125100)). Three features in that definition do the conceptual work: values are **goals** (they specify what a person is motivated to pursue), they are **trans-situational** (they apply across contexts, unlike attitudes toward a specific object), and they are **ordered by importance** (a person's value system is a *priority structure*, not a checklist).

This makes values distinct from three neighboring constructs that consumer self-discovery tools often conflate:

- **Personality traits** (e.g., the Big Five) describe *characteristic patterns of behavior, thought, and feeling* — how a person tends to act. Values describe what a person considers *important and worth striving for*. You can be highly extraverted (trait) without valuing stimulation, or value benevolence strongly while being temperamentally disagreeable. Traits are descriptive; values are prescriptive/motivational.
- **Vocational interests** (e.g., Holland's RIASEC) are *preferences for particular activities or work environments*. They are narrower and more domain-bound than values, which are content-general life goals.
- **Character strengths** (e.g., the VIA framework) are *trait-like, morally-valued dispositions* — they answer "what is good in you?" rather than "what do you fundamentally aim at?" As the corpus notes, the VIA measures strengths/virtues, **not the full motivational value space** ([Character Strengths in 75 Nations](https://www.viacharacter.org/pdf/CHARACTER%20STRENGTHS%20IN%2075%20NATIONS-%20AN%20UPDATE.PDF)). Kindness as a strength is not the same as benevolence as a guiding life goal.

The practical upshot for an app: a values instrument should surface a user's *motivational priority structure* — what they would orient their life toward and trade off against each other — which is a different target than a personality "type" or a strengths profile.

## 2. The Leading Validated Frameworks Compared

Six families of value frameworks dominate the literature, but they are not equally evidenced. The single most important distinction is **individual-level vs. societal-level** (an individual instrument profiles a person; a societal one describes a culture and cannot validly profile an individual without committing the ecological fallacy).

| Framework | Level | Structure | Validation status | Key limitation for a personal-growth app |
|---|---|---|---|---|
| **Schwartz Theory of Basic Values** (SVS / PVQ / PVQ-RR) | Individual | 10 values (refined to 19) on a *circular continuum*; 2 bipolar axes (Openness–Conservation; Self-Enhancement–Self-Transcendence) | **Very high** — 80+ countries, 300,000+ respondents; PVQ-RR across 49 cultural groups (N=53,472); structure replicated by MDS *and* CFA ([Sagiv & Schwartz 2022](https://www.annualreviews.org/doi/10.1146/annurev-psych-020821-125100); [Schwartz & Cieciuch 2022](https://journals.sagepub.com/doi/10.1177/1073191121998760)) | Abstract; needs good UX; ~4 of 19 refined values less reliable in some cultures |
| **Rokeach Value Survey (RVS)** | Individual | 18 terminal + 18 instrumental values, rank-ordered | **Dated/superseded** — historically pivotal; test-retest ~.78–.80 (terminal), ~.70–.72 (instrumental) ([RVS — Wikipedia](https://en.wikipedia.org/wiki/Rokeach_Value_Survey)) | Pure ipsative rank-order (statistically interdependent scores); terminal/instrumental split empirically shaky; no replicated factor structure |
| **VIA Character Strengths** | Individual | 24 strengths under 6 "virtues" | **High measurement validity, weak theory** — 1M+ respondents, 75 nations; most VIA-IS-R alphas ≥.70 ([McGrath 2014](https://www.viacharacter.org/pdf/CHARACTER%20STRENGTHS%20IN%2075%20NATIONS-%20AN%20UPDATE.PDF)) | Measures strengths, *not* the full motivational value space; **6-virtue structure does not replicate** (data fit ~3 factors) ([Partsch et al. 2022](https://journals.sagepub.com/doi/10.1177/08902070211017760)) |
| **Hogan MVPI** | Individual | 10 motive/value scales | **Strong but applied** — test-retest ~.71–.85; 250+ criterion studies ([Hogan MVPI](https://www.hoganassessments.com/assessment/motives-values-preferences-inventory/)) | Proprietary, certification-gated, costly; workplace-fit oriented, not self-discovery |
| **Inglehart / WVS dimensions** | **Societal** | Traditional–Secular-Rational; Survival–Self-Expression | **High at societal level only** — ~100+ societies ([Inglehart–Welzel map](https://en.wikipedia.org/wiki/Inglehart%E2%80%93Welzel_cultural_map_of_the_world)) | **Not an individual instrument** (ecological-fallacy risk); the 2-factor solution itself is contested |
| **Kahle's List of Values (LOV)** | Individual | 9 values (Maslow + Rokeach/Feather) | **Moderate, consumer-research only** — convergent/discriminant validity in U.S. consumer contexts, modest reliabilities (~.58–.69) ([Beatty et al. 1985](https://onlinelibrary.wiley.com/doi/abs/10.1002/mar.4220020305)) | Thin, dated cross-cultural base; coarse (9 values); no rich structural theory |

**Recommendation: use the Schwartz Theory of Basic Human Values as the backbone.** It is the only framework that is simultaneously (a) *individual-level*, (b) *exhaustive of the motivational value space*, (c) the *most replicated* value model in existence (validated across 80+ countries with multiple instruments and multiple analytic methods), and (d) the *best predictor of outcomes*. In a direct head-to-head comparison of seven value models (271 participants completing the PVQ-RR alongside the Rokeach Value Survey, Hofstede's module, Inglehart's items, the Study of Values, and others), the **Schwartz PVQ-RR was the strongest predictor, including for mental health** — adding it on top of the Basic Value Survey increased explained variance in mental health by ~14% ([Hanel et al. 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC6167453/)).

Its decisive design advantage is **structure, not just a list**: the 10 values (refined to 19 in 2012) sit on a *circular motivational continuum* organized by two bipolar axes — Openness to Change vs. Conservation, and Self-Enhancement vs. Self-Transcendence — where adjacent values are compatible and opposing values conflict ([Schwartz et al. 2012, JPSP](https://scottbarrykaufman.com/wp-content/uploads/2017/09/Schwartz-2012-19-values-JPSP.pdf)). For a self-discovery product, this circular map communicates *trade-offs* ("your strong Self-Direction sits opposite Conformity/Tradition"), which is far more insightful than a flat ranked list. The 2012 refinement (splitting Self-Direction into Thought/Action, Universalism into Nature/Concern/Tolerance, Power into Dominance/Resources, plus Face and Humility) was validated with a new instrument across 15 samples from 10 countries (N≈6,059) with CFA and MDS supporting the finer distinctions ([Cieciuch, Schwartz & Vecchione 2013](https://journals.sagepub.com/doi/10.1177/0022022113487076)).

VIA Character Strengths is a reasonable *complementary, optional module* (free, popular, well-liked, strong well-being links), but should not be the backbone: it measures morally-valued strengths rather than the full motivational space, and its theoretical six-virtue structure does not survive factor analysis — the empirically supported structure is roughly three dimensions (caring, inquisitiveness, self-control) ([Partsch et al. 2022](https://journals.sagepub.com/doi/10.1177/08902070211017760)). The Inglehart/WVS dimensions should *never* be used to profile an individual; at most they provide optional cultural context.

## 3. How Values Are Measured

Two psychometric axes drive everything about a values instrument: **response format** (rating vs. ranking vs. forced-choice/best-worst) and **scoring model** (normative — each scale scored independently and comparable across people — vs. ipsative — scores constrained to sum to a constant per person, so only within-person comparisons are valid).

### Instruments and response formats

- **Schwartz Value Survey (SVS):** ~57 single value items (e.g., "EQUALITY," "SOCIAL POWER"), each rated as "a guiding principle in MY life" on an *asymmetric 9-point scale* from **−1 (opposed to my values)** through **0 (not important)** to **7 (of supreme importance)** ([Schwartz, ORPC overview](https://scholarworks.gvsu.edu/cgi/viewcontent.cgi?article=1116&context=orpc)). The scale is deliberately asymmetric — more gradations above "important" — because respondents over-use the high-importance end. Validated structurally across 200+ samples in 60+ countries (MDS), and confirmed by CFA on 23 samples / 27 countries (N=10,857) ([Schwartz et al. 2001](https://journals.sagepub.com/doi/10.1177/0022022101032005001)). It is cognitively demanding and abstract.

- **Portrait Values Questionnaire (PVQ-21 / PVQ-40):** an *indirect third-person "portrait" format* — each item describes a person's goals (e.g., "Thinking up new ideas and being creative is important to her") and the respondent rates **"How much like you is this person?"** on a 6-point scale. Created to be more concrete and less abstract than the SVS, usable with adolescents and lower-education respondents. The PVQ-21 has been embedded in the European Social Survey since 2002 across 30+ languages ([ESS Human Values questionnaire](https://www.europeansocialsurvey.org/sites/default/files/2023-06/ESS_core_questionnaire_human_values.pdf)).

- **PVQ-RR (revised):** the refined-theory instrument — **57 gender-matched portrait items, 3 per each of 19 values**, same 6-point portrait format. This is the strongest-validated values instrument in existence (49 cultural groups, N=53,472, 32 languages) ([Schwartz & Cieciuch 2022](https://journals.sagepub.com/doi/10.1177/1073191121998760)).

- **Ultrabrief forms (TIVI/TwIVI):** for tight onboarding flows, Schwartz-derived 10- and 20-item portrait measures exist; the 20-item TwIVI converges with the full PVQ-40 at mean r≈.91 and has test-retest .86, at the cost of per-value reliability (2-item alphas range .33–.91, mean .71) ([Sandy et al. 2016](https://gosling.psy.utexas.edu/wp-content/uploads/2016/12/Sandy-et-al-JPA-2016-Brief-values-measures.pdf)).

### Reliability and validity numbers (and an honest caveat)

A recurring and important pattern: **single-value Cronbach alphas are often modest** because the subscales are deliberately short (2–3 items) and heterogeneous. ESS PVQ-21 alphas span from solid (benevolence .83/.85, self-direction .77/.79) to near-unreliable (**tradition .18/.16, security .40/.39, power .55/.55**) across two rounds ([GESIS ZIS Human Values Scale](https://access.gesis.org/zis/524)). The PVQ-RR improves this — using 3 items per value it reliably measured **15 of 19 values** in the vast majority of 49 groups (2 more in most), with configural and metric measurement invariance for almost all values, and MDS reproducing the full theorized 19-value circular order; a within-sample Turkey study reported value reliabilities of **.75–.88** ([Schwartz & Cieciuch 2022](https://journals.sagepub.com/doi/10.1177/1073191121998760); [BMC Psychology 2025 Turkey study](https://link.springer.com/article/10.1186/s40359-025-03725-6)).

The honest takeaway: for short value scales, **internal consistency understates reliability**, and the **structural/circumplex evidence (MDS reproducing the theorized value order) is the primary validity claim**, not coefficient alpha. An app should report at the higher-order dimension level (e.g., Self-Transcendence vs. Self-Enhancement) where single-value reliability is weak, and flag the ~4 less-reliably-measured refined values with appropriate humility.

For comparison, **VIA** measures show stronger single-scale reliability (original VIA-IS: all 24 scales α>.70, 4-month test-retest >.70, N>150,000; VIA-IS-P 96-item: α .65–.87, mean .77), though some strengths are weak (German VIA-120 modesty α≈.58) and short forms degrade some strengths (hope long-vs-short r=.52) ([Park, Peterson & Seligman 2004](https://danrobertsgroup.com/wp-content/uploads/2018/02/Character-strengths-well-being-Park-Peterson-Seligman-2004-1.pdf); [Hoefer et al., German VIA-120](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7250639/)). The **RVS** ranking task yields test-retest ~.74–.80 (terminal) / ~.65–.72 (instrumental) but no internal-consistency reliability (single-item ranks).

### Ipsative vs. normative scoring, and the centering debate

This is the central, genuinely *unresolved* methodological issue. Schwartz's **standard recommendation is to ipsatize/center** value scores by subtracting each respondent's mean across all value items (MRAT), converting absolute ratings into *relative priorities* and removing scale-use, acquiescence, and some social-desirability variance ([Coding and analyzing PVQ-RR data](https://www.researchgate.net/publication/308166496_Coding_and_analyzing_PVQ-RR_data_instructions_for_the_revised_Portrait_Values_Questionnaire)).

But centering — like forced ranking — creates **statistically ipsative data**, where scale scores are negatively interdependent, sum to a constant, and have df = m−1; this forces covariances toward zero and distorts factor analysis and classical reliability ([Brown & Maydeu-Olivares, IRT and ipsative data](https://www.ub.edu/gdne/documents/ipsative_data.pdf)). Critically, **whether to center is contested**: Borg & Bardi (2016) showed centering improves circumplex/MDS fit but *removes valid criterion variance* — the mean level itself correlates with well-being — and concluded there is **no general recommendation**; the choice should depend on the research question ([Borg & Bardi 2016](https://www.sciencedirect.com/science/article/abs/pii/S0092656616300472)). For an app, this means: if you report a within-person value *profile* ("most important TO YOU"), center on the user's mean; if you compare users to norms, keep raw scores or include the mean as a covariate — and never silently mix the two.

### MaxDiff / best-worst scaling and forced-choice

A choice-based forced-trade-off method (best-worst scaling / MaxDiff) is the strongest practical lever for surfacing relative priorities. Applied to Schwartz's values as the **Schwartz Values Best-Worst Survey**, it reproduced the circumplex, predicted value-expressive behaviors, ethnocentrism, and environmental behavior, and took significantly less respondent time than the SVS ([Lee, Soutar & Louviere 2008](https://pubmed.ncbi.nlm.nih.gov/18584442/)). Extended to the refined 19 values (**Best-Worst Refined Values scale**, BWVr), it reproduced the 19-value circle, showed convergent/discriminant validity against the PVQ-RR, and confirmed test-retest reliability ([Lee et al. 2019, Assessment](https://journals.sagepub.com/doi/10.1177/1073191116683799)).

The catch: naive best-minus-worst counts are themselves *ipsative*. The modern fix is **Thurstonian IRT**, which models the latent utilities behind forced choices and recovers **normative (between-person comparable) scores** — combining the bias-resistance of forced-choice (controls acquiescence, social desirability, faking) with comparable scores, escaping the classic ipsative trap ([Brown & Maydeu-Olivares](https://www.ub.edu/gdne/documents/ipsative_data.pdf); [Wetzel et al., Frontiers 2019](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.02309/full)). One caveat worth flagging: forced-choice is *necessary but not magic* — a recent line of work shows that with mixed-keyed items, forced-choice and Likert can recover the same information, including social desirability ([Why Forced-Choice and Likert Provide the Same Information](https://pubmed.ncbi.nlm.nih.gov/38756462/)), so good desirability-matched item design is a real prerequisite.

## 4. The "Real Values" Problem: Stated vs. Revealed Values

The premise that an app can surface a person's *real* values — beyond their aspirational self-image — is supported by a large, convergent literature, but it must be disciplined in two ways.

**The gap is real and largest where it matters most.** What people say they value and what their behavior reveals diverge systematically, and the divergence is greatest on morally/socially loaded values (environment, generosity, honesty, health), precisely where self-presentation contaminates self-report. The clearest quantitative anchors:

- Self-reported pro-environmental behavior captures only **~21% of the variance** in objectively measured behavior (meter readings, observation) — i.e., stated behavior is a biased-but-informative signal, not a stand-in for action ([Kormos & Gifford 2014](https://www.scirp.org/reference/referencespapers?referenceid=3308069)).
- **Stated willingness-to-pay runs 2–3× higher than revealed WTP**, attributed to social/self-signaling — the exact aspirational-self-image inflation an app must contend with ([hypothetical bias in stated choice experiments](https://www.sciencedirect.com/science/article/abs/pii/S1755534521000555)). Notably, the inflation concentrates in *absolute* levels; *relative* trade-offs (marginal rates of substitution) degrade much less — which is the empirical reason to prefer relative/forced-choice elicitation.

**But the gap is not total, and stated values are not noise.** Classic meta-analyses show attitudes/values *do* predict behavior at moderate levels (**r ≈ .38–.41**), and the link strengthens when attitudes are certain, stable, accessible, experience-grounded, and *matched in specificity to the behavior* — all design choices an app controls ([Kraus 1995](https://journals.sagepub.com/doi/10.1177/0146167295211007); [Wallace et al. 2005](https://journals.sagepub.com/doi/10.1037/1089-2680.9.3.214)). (Conversely, *abstract* value inventories predict specific behavior weakly — Schwartz self-transcendence values correlate with pro-environmental behavior at only r≈.06 — because behavior is jointly determined by situation, habit, cost, and capability, the "value-action gap" ([Tam & Chan](https://www.sciencedirect.com/science/article/abs/pii/S0272494418307059)).)

**Two mechanisms, two different fixes.** (1) *Social-desirability/impression management* inflates socially approved values. Crucially, **"controlling for SD" with a Crowne-Marlowe-type scale is a weak fix**: SD scales correlate only r≈.06–.13 with self-reported values/behavior, partly because some people over-report and others under-report, cancelling at the aggregate ([Vesely & Klockner 2020](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2020.01395/full)). The better lever is to *design faking out* (forced choice) or anchor in behavior. (2) The *value-action gap proper* — even sincere values are diluted by constraints — means enacted values reflect constrained optimization. The app must decide which it cares about: what someone would choose *absent constraints* (trade-off elicitation) or what they *actually live out* (behavioral traces).

**Which techniques most validly surface authentic, operative values:**

- **Forced-choice / MaxDiff trade-off elicitation** — the best-validated, most practical lever. Forcing items to compete removes the "everything is important" non-discrimination and equalizes desirability across options, yielding rankings with substantially better predictive and discriminant validity than Likert ([MaxDiff technical papers](https://ssidevsandbox.com/resources/technical-papers/categories/maxdiff-scaling)). Forced-choice formats also substantially (not completely) resist faking ([meta-analysis of forced-choice faking resistance](https://pmc.ncbi.nlm.nih.gov/articles/PMC8511514/)).
- **Behavioral / revealed-preference traces** (actual time and money allocation — logged spending, calendar/time-use, screen-time) are the *conceptual gold standard*. The critical caveat the literature is explicit about: the advantage holds **only when choices are real/consequential**; *hypothetical* allocations ("how would you split $100?") re-import the same 2–3× inflation ([Beshears et al., How Are Preferences Revealed?](https://pmc.ncbi.nlm.nih.gov/articles/PMC3993927/)).
- **Experience sampling / EMA** removes retrospective recall bias and links values to concrete in-the-moment activities. Skimina et al. (2019) prompted participants 7×/day for 7 days about their current activity and which Schwartz values mattered in it, finding theory-consistent value-behavior "signatures" — a strong route to *enacted* values, especially for a phone-based app (caveats: burden, reactivity) ([Skimina et al. 2019](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.00281/full)).
- **Implicit measures (IAT-style)** have a *genuine but small and contested* signal. They help most exactly where self-report is most distorted (sensitive topics), but the more rigorous meta-analysis found implicit-criterion correlations are small (β≈.14; ~1–8% of behavioral variance) with negligible incremental validity and **low test-retest reliability** ([Kurdi et al. 2019](https://pubmed.ncbi.nlm.nih.gov/30550298/)). An implicit component can add a small unobtrusive faking-resistant signal but **cannot be the backbone** of an individual readout.
- **AI/NLP inference from free text** is promising and unobtrusive but currently only **modestly accurate** — predicting Schwartz values from digital behavior reaches weighted AUC≈.60 (vs ~.90 for gender), far harder than demographics ([Kalimeri et al. 2019](https://arxiv.org/abs/1712.01930)). **Caveat (per verification):** the corpus's claim that a lexicon approach "did NOT correlate with survey values" is a *secondary-source characterization*. The underlying paper (Havaldar et al. 2024, *Building Knowledge-Guided Lexica*) actually reports a *successful* high-validity lexicon for the individualism/collectivism dimension validated against World Values Survey data; the non-correlation framing is how a later paper ([Borenstein, Arora et al. 2025](https://aclanthology.org/2025.naacl-long.77/)) summarizes Havaldar's *Schwartz-values* application specifically. So the accurate statement is "lexicon methods *can* fail to match survey values for some value applications," not a blanket failure. Relatedly, LLM-based trait inference from text shows only **modest** (not "reasonable") convergent validity with self-reports (r≈.18–.31 across the Big Five; [Marengo et al. 2025](https://pubmed.ncbi.nlm.nih.gov/40891650/)). NLP on a user's *own journals* (less performative than public social media) is best used to **generate value hypotheses**, cross-validated against behavior — *not* reported as the user's "true values." One tension to flag: Boyd et al. (2015) argue language-based assessment can outpredict *survey* self-reports relative to actual behavior, so behavior is the stronger cross-validation criterion than survey responses.

**The strongest design is triangulation:** combine a forced trade-off instrument (operative priorities) with real behavioral/allocation traces and EMA (enacted values), use NLP on free text as a corroborating layer only, and **explicitly model the stated-vs-revealed discrepancy as informative** rather than as error.

## 5. Clinical / ACT Values-Clarification Methods Worth Borrowing

Acceptance and Commitment Therapy (ACT) treats **personal values as a foundational construct** — defined functionally as *"freely chosen, verbally constructed qualities of purposive action"* — and uses values *clarification* and *value-based goal-setting* as core interventions, with goals subordinate to and derived from chosen values ([Assessing the valuing process in ACT](https://www.sciencedirect.com/science/article/abs/pii/S2212144718302266)). This is the validated bridge from "measuring values" to "living them," which is exactly the personal-growth use case. Several specific methods are worth borrowing:

- **Importance-vs-consistency GAP framing.** ACT tools like the **Valued Living Questionnaire** and **Bull's-Eye Values Survey** ask not just how important a domain is, but how *consistently* the person has been living it — surfacing the actionable discrepancy between stated and enacted values. This directly operationalizes the stated-vs-revealed gap as user-facing insight rather than hidden error.
- **Forced relative ranking via card sorts.** Decks beyond Miller's clinical sort exist, including **The Good Project's Value Sort** (a Harvard/Project Zero instrument, 35 values in the current revision, sorted into fixed-quota categories — Most Important (4), More Important (6), Neutral, Less Important (6), Least Important (4) — explicitly a q-sort-style **forced relative ranking** that reduces the "everything is important" problem) ([Value Sort — The Good Project](https://www.thegoodproject.org/value-sort)).
- **Digital values "wheels."** The smartphone-based **ACTive Values Wheel** provides a weighted, idiographic index of values-directed behavior and has *preliminary* validity evidence — convergent and criterion-related validity via positive correlations with valued living, well-being, and openness in 160 adults ([O'Connor et al. 2021](https://link.springer.com/article/10.1007/s40732-020-00447-6)). **Caveat (per verification):** the same study found it did **not** demonstrate incremental validity over existing valued-living measures, and the authors frame its validity as preliminary — so it is an interesting design pattern, not a validated replacement instrument.

Two important caveats on combining ACT with the Schwartz backbone:

1. **The pairing is not yet mainstream.** Mainstream ACT values measurement does **not** use the Schwartz model. Systematic reviews of ACT values measures catalogue the Valuing Questionnaire, Valued Living Questionnaire, Engaged Living Scale, Bull's-Eye, and the MPFI — and do **not** include the Schwartz PVQ/PVQ-RR ([A systematic review of values measures in ACT research](https://www.sciencedirect.com/science/article/abs/pii/S2212144718302813)). The strongest published Schwartz-plus-ACT integration traces to essentially **one research group** (Heblich et al. 2023, which operationalized "intrinsic values orientation" via the PVQ-RR and "clarity about personal values" via an ACT-derived Valued Living Scale), commercialized as the **Core Values Finder** ([Heblich et al. 2023, IJCHP](https://pmc.ncbi.nlm.nih.gov/articles/PMC10009076/)). That commercial vendor's "science" page should be treated as a self-interested source; cite the peer-reviewed paper instead. So the accurate framing is *"the Schwartz model can be integrated with ACT-derived measures, as in at least one peer-reviewed model"* — **not** "Schwartz already pairs with ACT" as established convention.

2. **The two traditions measure different constructs.** Schwartz values are **nomothetic** — universal motivational *content* categories (Self-Direction, Benevolence, Achievement). ACT values are **idiographic and functional** — what a *particular* person freely chooses as life directions. They are complementary at best; combining them is a defensible *design choice*, not a settled equivalence, and an ACT purist would note the tension between Schwartz's fixed taxonomy and ACT's insistence on freely chosen, idiographic values.

Finally, a self-guided values product carries a built-in psychometric risk worth naming: ACT self-report process measures have **known weaknesses** — e.g., the widely-used AAQ-II behaves more like a distress/symptom measure than a clean process measure and has item-level psychometric problems ([Lee et al. 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10665126/)) — and value self-reports are systematically inflated by social desirability, *most* for the most culturally sanctioned values ([Fisher & Katz 2000](https://onlinelibrary.wiley.com/doi/abs/10.1002/mar.4220020305)). This reinforces the section-4 conclusion: lean on **forced-choice/relative ranking, gap framing, and experiential prompts** rather than naked importance ratings.

---

### Bottom line for the app's science

Use **Schwartz's Theory of Basic Human Values** (operationalized via the **PVQ-RR**, or a shorter PVQ/TwIVI for onboarding) as the individual-level backbone — it is the most validated, most predictive, exhaustive, and lay-accessible value model, and it yields an interpretable **circular value map** rather than a flat list. Surface *relative* priorities through **forced-choice/MaxDiff** (ideally Thurstonian-IRT-scored for between-person comparability), be explicit about ipsative vs. normative scoring, and treat the **stated-vs-revealed gap as signal** by triangulating self-report with **behavioral traces, EMA, and (corroborating-only) NLP**. Borrow ACT's **gap framing and values-clarification exercises** to turn measurement into growth — while remembering that the Schwartz-plus-ACT pairing is a defensible design choice pioneered by a single group, not an established standard.


---

# Part II — Product & Technical Plan

## 1. Product Vision, Target User & Core Promise

### Vision
A mobile-first personal-growth companion that helps an individual discover their **real, operative values** — not the flattering, aspirational self-image that a one-shot quiz returns — and then live in closer alignment with them over time. The product's identity rests on two pillars almost no competitor combines: **the strongest values science available (Schwartz)** and **a behavior-grounded, longitudinal "stated vs. lived" feedback loop**.

### Target user
The general personal-growth audience: adults (broadly 22–55) who are reflective, in a transition or stuck period (career, relationships, post-graduation, midlife re-evaluation), already self-help-curious (they've done a VIA survey, read *Dare to Lead*, tried Stoic/Reflection.app), and dissatisfied with the static, generic, "type"-label output those tools produce. Secondary: ACT/therapy-adjacent users who want a structured values-clarification tool between sessions (non-clinical positioning).

### Core promise — and the honesty boundary
**What we promise:** "We help you see the values you actually live by — including where they diverge from the values you *say* you hold — using the most validated science of human values, and we help you close that gap over time."

**What we can honestly claim:**
- We use the Schwartz Theory of Basic Human Values, validated across 80+ countries and 49 cultural groups (N=53,472) — the strongest predictor of well-being/behavior in head-to-head model comparisons (Hanel et al. 2018).
- We surface **relative priorities** ("most important *to you*") and the **trade-offs/tensions** between competing values (the circumplex).
- We triangulate multiple independent signals and **show our confidence**, rather than a single "true values" readout.

**What we must NOT claim (the credibility firewall):**
- No claim to a precise, error-free "true values" measurement. No single method is a values lie-detector; self-report explains only ~21% of variance in objective behavior, and value-behavior correlations can be as low as r≈.06.
- **No clinical claims.** Not therapy, not diagnosis, not treatment. Values/self-affirmation effects are real but *small and context-dependent* (d≈0.26–0.41). We are a reflection-and-growth aid.
- No "personality type" labels (anti-Barnum). No unvalidated matching/compatibility claims (the Finkel et al. 2012 dating-app critique is our cautionary tale).
- We will state, in-product, that ~4 of the 19 refined values are measured less reliably in some cultures.

---

## 2. Methodology — The Scientific Backbone & Triangulation Engine

### The framework: Schwartz Theory of Basic Human Values (refined 19-value theory)
This is the non-negotiable backbone. It is the only individual-level model that is (a) exhaustive of the motivational value space, (b) the most cross-culturally replicated, (c) the best predictor of well-being/behavior, and (d) structured as a **circular continuum** with two bipolar axes (Openness to Change ↔ Conservation; Self-Enhancement ↔ Self-Transcendence) — which is what lets us show *tensions*, not just a flat list. Crucially, **no major consumer app uses Schwartz** — this is our central differentiator.

We reject the alternatives as a backbone (but borrow selectively): Rokeach (ipsative rank-order, superseded), VIA (measures strengths not values; 6-virtue structure doesn't replicate), Inglehart/WVS (societal-level — ecological fallacy if applied to a person), Kahle's LOV (thin psychometrics), Hogan MVPI (proprietary, workplace-fit, certification-gated).

### Why a questionnaire alone is insufficient
A pure PVQ survey surfaces the **aspirational self** — exactly what we promise to bypass. Abstract self-reported values predict behavior weakly; stated willingness-to-pay runs 2–3× revealed; social-desirability inflation is worst precisely on the morally-loaded values users most want to claim. So the methodology is explicitly **multi-method triangulation**, and the **gap between methods is the product**, not error to hide.

### The four signals and how they combine

**Signal A — Validated questionnaire core (the anchor).**
A PVQ-style **indirect "portrait" instrument** ("How much like you is this person?"). Portraits are layperson-friendly, work across education levels, and reduce social desirability vs. rating abstract labels. Length budget choice:
- **MVP:** a brief portrait set scoring the **10 higher-order values** (PVQ-21 scale of items, or the validated **TwIVI** 20-item, test–retest .86) — but we will **report at the higher-order/quadrant level** where short-scale alphas are weak (tradition/security/power alphas on PVQ-21 are ~.16–.55 and must not be reported as standalone precise scores).
- **Later:** full **PVQ-RR** (57 items, 19 values, 3/value) for the rich profile, once licensing is secured.
Scoring: **within-person centered (ipsatized on MRAT)** per Schwartz, because we report *priorities*, not norm position. We surface to the user that this is *relative* ("most important *to you*").

**Signal B — Forced-choice / MaxDiff trade-off module (the operative-priority engine).**
This is the **single most evidence-backed lever** to move closer to operative values. We present values in **head-to-head competition under scarcity** ("pick most / least important" from balanced subsets), modeled on the validated **SVBWS / BWVr** best-worst scales, which reproduce the Schwartz circumplex and predict value-expressive behavior better than Likert. This removes "everything is important" inflation and equalizes social desirability across options. **Scoring must be model-based (Thurstonian IRT / hierarchical Bayes)** to recover normative, between-person-comparable estimates — naive best-minus-worst counts are ipsative and cannot be correlated/factored. Design with desirability-balanced, opposite-keyed blocks.

**Signal C — AI-driven reflective dialogue (the depth + authenticity probe).**
A conversational layer grounded in **ACT values-clarification** and **motivational-interviewing reflection** — the human facilitator is what makes card-sorts powerful, so we replace it with structured reflective scaffolding ("tell me more about *why* this matters"). It does three jobs: (1) **psychoeducation** distinguishing *values* (ongoing directions) from *goals* (destinations) before any elicitation; (2) **pliance probes** borrowed from the PVQ — "Is this because others expect it, to avoid guilt, or because it genuinely matters to you?" — to flag externally-prescribed values; (3) **NLP value-inference** from the user's own private journaling as a **corroborating, hypothesis-generating** layer only (text-to-value accuracy is modest, AUC≈.60; lexicon methods can disagree with surveys), always cross-validated against A/B before surfacing.

**Signal D — Optional behavioral / experience-sampling signals (the "lived" reality check).**
The highest-validity, most sensitive inputs, all opt-in:
- **EMA / experience sampling:** brief in-the-moment prompts ("what are you doing now? which values felt salient?"), which removes recall bias and has demonstrated value-behavior signatures (Skimina et al. 2019).
- **Behavioral/allocation traces** (later phase, with explicit consent): calendar/time-use, spending categories, screen-time — revealed-preference proxies. Hypothetical "how would you spend your week?" partially reverts to aspiration, so it must be cross-checked against logged behavior.

### How they combine into a result
We do **not** average everything into one number. Instead:
1. **Anchor profile** from Signal A + B (the validated quantitative core), reported as the **circumplex map** of relative priorities + higher-order quadrant scores, each with a **confidence indicator**.
2. **Convergence boosts confidence:** where A, B, C, and D agree on a value's salience, we display high confidence; where they diverge, lower.
3. **The discrepancy is a first-class output:** "You rank *Benevolence* highly, but your time/EMA data show almost no allocation there." Framed **non-judgmentally and actionably** — this is the app's most differentiating, honest deliverable.
4. **Tensions surfaced via the circumplex** (e.g., "your strong Self-Direction sits opposite Conformity/Tradition").

We communicate **uncertainty**, never a precise "true values" verdict.

---

## 3. End-to-End Assessment & Experience Flow

### A. Onboarding (psychoeducation first)
- **Frame the construct before measuring it.** Compass/journey metaphor: values are *directions you keep walking*, not *destinations you arrive at*. This is the single most important ACT step — it prevents users from listing achievements/goals as values.
- Set honest expectations: "No quiz can read your true values off in five minutes. We'll triangulate several signals over time and show you our confidence."
- Consent gating for any sensitive inputs (EMA, traces, journaling NLP) — see §8.

### B. Assessment (layered, low-friction → validated)
1. **Warm-up card sort / domain wheel** (drag-and-drop): elicit candidate values, low cognitive load, engaging (borrow Think2Perform / Miller card-sort UX).
2. **Forced-choice / MaxDiff core** (Signal B) — the trade-off engine, presented as competition under scarcity.
3. **Portrait questionnaire anchor** (Signal A) — for tracking and circumplex placement.
4. **Reflective dialogue deepening** (Signal C) — "what matters most" experiential prompts + pliance probes.

### C. Results (see §5)
Circumplex map + higher-order quadrants + tensions + (when data exists) the **stated-vs-lived gap**, all with confidence levels and plain-language interpretation.

### D. Ongoing reflection (the loop competitors lack)
- Living profile with **longitudinal re-assessment** and **"values drift" detection** (values genuinely shift over time).
- Tracking instruments: anchor longitudinal progress on **validated ACT values-process measures** — the **Valuing Questionnaire (VQ)** or **ELS-9** — rather than ad-hoc scales. Render the **Bull's-Eye Values Survey** as an interactive dartboard and the **Valued Living Questionnaire** as an importance-vs-consistency dashboard (both visualize the gap and are harder to game).
- ACT-style **values → committed action**: translate each clarified value into SMART steps in a valued direction; weekly reflection on values-congruent behavior.
- Optional EMA cadence.

### UX principles to defeat the Barnum/Forer effect
- **Specific, falsifiable, relative feedback** (percentiles / relative priorities / your-own-data references), never vague flattering generalities.
- **No "type" labels.** Show a *position on a continuum*, not a box.
- **Ground statements in the user's own inputs** ("you chose X over Y three times") so feedback can't be a horoscope.
- **Surface tensions and uncomfortable gaps** — Barnum feedback is uniformly flattering; honest feedback isn't.
- **Show uncertainty/confidence** on every claim.

---

## 4. Feature List (Prioritized) — MVP vs. Later Phases

### MVP (the lean, credible first build)
- Onboarding psychoeducation (values vs. goals, compass metaphor).
- **Card-sort warm-up** (candidate elicitation).
- **MaxDiff/best-worst trade-off core** with model-based (Thurstonian-IRT) scoring → the operative-priority engine.
- **Brief portrait questionnaire** (10 higher-order values; report at quadrant level).
- **Circumplex results screen** + plain-language interpretation + tensions.
- **Basic reflective dialogue** (LLM) grounded in the user's own profile (ACT prompts + pliance probes).
- **Longitudinal re-assessment** + simple drift view; VQ/ELS-9 tracking.
- Consent, privacy controls, data export/delete.

### Phase 2
- Full **PVQ-RR** (19 values) once licensed; richer circumplex.
- **EMA / experience-sampling** module.
- **Stated-vs-lived gap** dashboard from EMA.
- Bull's-Eye dartboard + VLQ dashboards; values→committed-action goal engine.
- Journaling with **NLP value-inference** as a corroborating layer.
- VIA strengths as a clearly-labeled *secondary* lens (reported at the empirically-supported ~3-factor level, mixed-keyed form).

### Phase 3
- **Behavioral/allocation traces** (calendar, spend, screen-time) with on-device processing.
- Optional cultural context overlay (Inglehart/WVS as *context only*, never personal profiling).
- Localization (PVQ-RR exists in 30+ languages).
- Self-run efficacy pilot/RCT (see §7).

**Explicitly excluded / deprioritized:** matching/compatibility features (Finkel critique = credibility liability), MBTI/Enneagram-style typologies, implicit/IAT tasks as a primary signal (low reliability; at most a minor aggregated supplement later).

---

## 5. Results & Feedback Design — Valid Presentation, No Pseudoscience

- **Primary visual: the circumplex map**, not a flat ranked list. The 10/19 values around a circle, four quadrants shaded by the user's relative emphasis. This communicates *trade-offs* visually ("your high Self-Direction opposes Conformity/Tradition").
- **Report at the right altitude.** When single-value reliability is weak, present **higher-order dimensions** (Self-Transcendence vs. Self-Enhancement; Openness vs. Conservation) and lean on the **structural/circumplex validity story**, not internal-consistency claims for 2–3-item scales.
- **Always relative, always labeled.** "Most important *to you*" (ipsative), with an explicit note that this is a within-person priority ranking, not an absolute level or a comparison to others.
- **Confidence indicators** per value/dimension, driven by cross-signal convergence.
- **The gap as the headline insight:** stated priorities vs. behavioral/EMA reality, framed non-judgmentally and as a growth lever.
- **Anti-pseudoscience guardrails:** falsifiable/specific statements grounded in the user's own responses; no flattering universals; show the science and the construct definition in-product; evidence-calibrated expectations (effects are modest).
- **Humility copy** on the ~4 less-reliable refined values.

---

## 6. Technical Architecture & Stack

### Recommended stack
- **Frontend:** React Native (Expo) — mobile-first, single codebase iOS/Android; the circumplex/dartboard render via SVG (react-native-svg) or a lightweight D3 layer; drag-and-drop card sort via a gesture library. EMA needs reliable local notifications, which Expo handles.
- **Backend:** TypeScript (Node/NestJS) or Python (FastAPI). **Recommend Python/FastAPI** because the psychometric scoring (Thurstonian IRT, hierarchical Bayes, centering, MDS for circumplex placement) lives most naturally in the Python scientific stack (NumPy, `thurstonianIRT`-equivalent, Stan/PyMC, scikit-learn for MDS).
- **Datastore:** **PostgreSQL** as the system of record (relational, auditable — important for sensitive data and consent records); a time-series-friendly schema (or a partitioned table) for high-volume EMA pings. Object storage (encrypted) for journal text.
- **Scoring service:** a separate **psychometrics microservice** (Python) that takes raw responses and returns centered profiles, IRT-normative trade-off scores, circumplex coordinates, and confidence. Keep this isolated and **versioned** so we can re-score historical data as the model improves.
- **LLM usage (Claude):** the reflective-dialogue agent and the value-from-text inference.
  - **Where:** dialogue scaffolding (ACT/MI prompts), summarizing journal entries into candidate value themes, generating *profile-grounded* (not generic) feedback narratives.
  - **How, with guardrails:** the LLM is **constrained to the user's actual profile and responses** (retrieval of the user's own data into the prompt) to avoid Barnum flattery and the "repetitive/generic" criticism leveled at current AI coaches. The LLM **never** produces the quantitative scores — those come from the psychometrics service. Inferred values are tagged "hypothesis, unconfirmed" until they converge with A/B.
  - **Value-from-text inference:** prefer the user's **private journaling** (less performative than public social media); run inference, then **cross-validate against trade-offs and behavior** before display.
- **Privacy-sensitive processing:** on-device where feasible (EMA aggregation, trace summarization) so raw traces don't leave the phone; only derived features sync.

### Data model sketch (conceptual)
- **User** — id, locale, consent flags, created_at.
- **Consent** — user_id, scope (EMA / traces / journaling-NLP / research), granted_at, revoked_at, version. (Append-only audit.)
- **AssessmentSession** — id, user_id, instrument_version, type (portrait / maxdiff / cardsort), timestamp.
- **ItemResponse** — session_id, item_id, raw_response (rating or best/worst choice), block_id.
- **ValueScore** — user_id, session_id, value_code (1 of 10/19), score_centered, score_normative, confidence, scoring_model_version. (Re-computable.)
- **CircumplexProfile** — user_id, timestamp, quadrant coords, derived narrative_ref.
- **EmaPing** — user_id, timestamp, activity, salient_values[].
- **BehavioralTrace** (derived, opt-in) — user_id, period, allocation_category, derived_value_proxy. (Raw traces stay on-device; only proxies stored.)
- **JournalEntry** — user_id, timestamp, encrypted_text_ref, inferred_value_hypotheses[] (flagged unconfirmed).
- **GapInsight** — user_id, value_code, stated_rank, lived_proxy, divergence, surfaced_at.
- **ValuesAction** — user_id, value_code, committed_action, status (ACT goal loop).
- **TrackingMeasure** — user_id, instrument (VQ / ELS-9 / Bull's-Eye / VLQ), score, timestamp (drift series).

---

## 7. Validation & Norming Plan

- **Lean on structural validity, not just alpha.** The primary psychometric claim for short value scales is that **MDS reproduces the circumplex order** — bake a structural check into the analytics pipeline on accumulating user data; if the circle reproduces, the instrument is behaving.
- **Honest reliability reporting** at the higher-order level where item-level alphas are weak.
- **Build a norming database** as users accumulate: store raw (normative) scores alongside centered scores so we can later offer norm-referenced position *and* within-person priorities (never silently mixing the two).
- **Test–retest / drift calibration:** establish the app's own short-interval test–retest baseline to distinguish genuine value change from measurement noise — essential before any "growth over time" feature makes claims.
- **Cross-validate signals:** treat convergence across A/B/C/D as ongoing construct validation; track where journal-NLP and EMA agree with the questionnaire.
- **Self-run efficacy pilot (Phase 3):** a small pre/post or waitlist-controlled study on *proximal* outcomes (values-congruent behavior, well-being), echoing the JMIR 2025 chatbot-values-module evidence. This is a genuine differentiator vs. unvalidated competitors — but expectations stay calibrated to small effect sizes.
- **Licensing validation:** confirm PVQ-RR/PVQ commercial-use permission from Schwartz/rights holders *before* shipping it; the MVP's brief/TwIVI path de-risks this dependency.

---

## 8. Ethics, Privacy & Data Handling

- **GDPR special-category data.** Psychological profiles, values, journaling, and behavioral traces can reveal intimate attributes (digital footprints predict sensitive traits at high accuracy). Treat all of it as **special-category data**: explicit, granular, revocable **opt-in consent per data type** (EMA, traces, journaling-NLP, research use), with an append-only consent audit trail.
- **Consent as a prerequisite, not an afterthought.** Highest-validity inputs (traces, EMA, journals) are also the most sensitive — gate each behind its own clear consent screen explaining *what* is collected and *why*.
- **Data minimization + on-device processing.** Process raw traces on-device; sync only derived proxies. Encrypt journal text at rest; the user can export and **hard-delete** everything.
- **No clinical claims; safety rails.** Explicitly non-clinical. **Gate mortality-themed exercises** (funeral/eulogy/tombstone) behind consent and emotional-readiness checks, offer gentler variants (an 80th-birthday toast), provide opt-outs, and surface crisis/support resources — clinical guidance requires "existential bandwidth."
- **Anti-manipulation ethics.** Because we infer intimate values, we commit to **not** using them for unvalidated matching/targeting, and we keep the LLM constrained to honest, profile-grounded feedback (no manipulative flattery).
- **Transparency.** Show users the science, the construct definitions, and our confidence levels.

---

## 9. Monetization & Phased Roadmap

### Monetization options (and recommendation)
The market brackets three proven patterns: **one-time report unlock** (Truity $19–29; VIA ~$20), and **subscription** (AI coaches $10–30/mo). Because our differentiator is a **living, longitudinal profile + coaching loop** — not a one-shot report — **subscription is the right primary model**, but a **free core assessment + circumplex result is table stakes** for adoption and credibility (mirrors VIA's free-ranking funnel).
- **Free tier:** card sort + MaxDiff core + brief portrait + circumplex result + basic reflection.
- **Subscription (~$8–15/mo):** longitudinal tracking/drift, EMA, gap dashboard, full PVQ-RR depth, AI reflective coaching, values→action loop.
- **Avoid** the Truity "credibility trap" of bundling rigorous and pseudoscientific instruments — rigor *is* the brand.

### Phased roadmap (realistic first-build path)
1. **Phase 0 — Foundations:** confirm PVQ licensing path (and TwIVI fallback); build psychometrics scoring service (centering + Thurstonian-IRT) and validate on a seed sample.
2. **Phase 1 — MVP:** onboarding + card sort + MaxDiff + brief portrait + circumplex results + basic LLM reflection + re-assessment/drift + consent/privacy. Free core + subscription scaffold.
3. **Phase 2 — Depth & loop:** full PVQ-RR, EMA, stated-vs-lived gap dashboard, Bull's-Eye/VLQ tracking, values→action engine, journaling NLP (corroborating), VIA secondary lens.
4. **Phase 3 — Validity & scale:** behavioral traces (on-device), norming database, localization, self-run efficacy pilot.

---

## 10. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **PVQ-RR licensing blocked/costly** | MVP uses the brief/TwIVI 10-value path (validated, public-friendly); secure PVQ-RR licensing before Phase 2. Licensing is gated, not on the critical MVP path. |
| **Self-report = aspirational self** (the core promise fails) | Triangulate: MaxDiff trade-offs + EMA + behavioral traces + NLP; make the **stated-vs-lived gap the headline output** rather than a single survey readout. |
| **Ipsative-data statistical errors** (invalid scores) | Never correlate/factor raw rank or naive best-minus-worst counts; use **model-based Thurstonian-IRT/Bayes** scoring; keep raw + centered scores separate and clearly labeled. |
| **Barnum/Forer effect erodes credibility** | Specific, falsifiable, relative feedback grounded in the user's own inputs; no type labels; surface tensions and uncomfortable gaps; confidence indicators. |
| **Weak short-scale reliability** (tradition/security/power) | Report at higher-order/quadrant level; lean on circumplex structural validity; humility copy on the ~4 unreliable refined values. |
| **LLM gives generic/flattering coaching** | Constrain the LLM to the user's actual profile/data; LLM never produces scores; inferred values flagged "unconfirmed" until convergence. |
| **NLP value-inference inaccuracy** (AUC≈.60) | Treat as corroborating/hypothesis-generating only; use private journals not public social media; cross-validate against trade-offs/behavior before display. |
| **Sensitive-data / GDPR exposure** | Special-category treatment, granular opt-in consent + audit, on-device processing, encryption, export/delete; no unvalidated matching/targeting. |
| **Overclaiming efficacy / clinical drift** | Position as non-clinical growth aid; evidence-calibrated copy (small effects); gate mortality exercises; self-run pilot to substantiate proximal claims. |
| **Engagement drop-off / logging fatigue** (EMA, tracking) | Keep EMA brief and optional; make the living-profile/drift narrative intrinsically rewarding; avoid the "repetitive/cluttered" AI-coach failure mode. |
| **"Values matching" temptation** | Excluded by design — Finkel et al. shows no validated matching algorithm; any such claim is a credibility liability. |

**Core differentiation in one line:** the only values app built on the strongest values science (Schwartz circumplex), elicited through forced trade-offs rather than flattering Likert grids, triangulated against lived behavior, and turned into a longitudinal "stated-vs-lived gap" growth loop — exactly the rigor, honesty, and behavior-bridge the entire existing market leaves open.

---

# Caveats, corrections & open problems

This section is deliberately adversarial. The two sections above are strong, but a skeptical psychometrics + product review flagged claims that overshoot their evidence and gaps that must be closed before any growth/efficacy marketing. Read this as the binding "fine print" on everything above.

## A. Claims corrected or qualified during fact-checking

These were caught by independent verification and have been softened or fixed in the text above; they are collected here so they don't get lost:

- **"Schwartz already pairs with ACT."** *Partially supported.* Mainstream ACT values measurement does **not** use the Schwartz model. The Schwartz-plus-ACT integration traces to essentially **one research group** (Heblich et al. 2023, commercialized as "Core Values Finder"). The two traditions also measure *different constructs*: Schwartz = nomothetic, universal value *content*; ACT = idiographic, freely chosen *valued action*. Combining them is a defensible design choice, **not** an established standard. Cite the peer-reviewed paper, not the vendor's "science" page.
- **Self-affirmation / values-affirmation benefits.** *Partially supported.* Effects are **small, heterogeneous, and context-dependent** — they concentrate among people under identity/psychological *threat*, and a well-powered preregistered replication (Hanselman et al. 2017) found null effects. The often-cited ~d≈0.4 comes from a broad education meta-analysis; the threatened-vs-non-threatened figures are g≈.15 vs ≈.01. Do not assume transfer to a brief, unsupervised, general-audience digital exercise.
- **AI life-coach / chatbot values evidence (JMIR 2025 RCT).** *Partially supported.* The significant gains were at **10 days only and faded by 1 month**; the chatbots were **rule-based (scripted), not generative AI**, and "value clarification" was one of ten bundled modules (its specific contribution can't be isolated). Frame chatbot-values support as small-effect, short-term, moderate-risk-of-bias — not strong evidence.
- **LLM value-extraction from text (GPV/ValueLlama).** *Partially supported.* It is validated against a **lexicon comparator (Personal Values Dictionary), not a gold-standard self-report questionnaire (PVQ-RR)**, and even those correlations are described as "not strong." Text-to-value accuracy generally is **modest** (AUC≈.60). Use NLP as a *hypothesis-generating, corroborating* layer only — never as the user's "true values."
- **Forced-choice is not categorically superior to Likert.** With mixed-keyed items, forced-choice and Likert can carry the same information, *including* social desirability. Desirability-matched item design is a real prerequisite; "substantially better" overstates it.
- **Thurstonian IRT does not cleanly "escape" ipsativity.** Recovery of normative, between-person-comparable scores depends on design (mixed-keyed blocks, enough blocks, model fit). Present it as a strong-but-conditional technique, not a solved problem.
- **ACTive Values Wheel.** *Partially supported.* Convergent/criterion validity is **preliminary**, and the study found it did **not** show incremental validity over existing valued-living measures. It's a useful design pattern, not a validated instrument.

## B. Overstatements to correct in your own copy and pitch

The skeptical reviewer flagged these as stated more strongly than the cited evidence supports. Fix them before they become marketing liabilities:

1. **"Exhaustive of the motivational value space"** is a *theoretical* claim Schwartz argues for, not an established empirical fact — and the report itself notes that content like spirituality/religiosity failed cross-cultural replication and was dropped. Say "the most comprehensive validated model," not "exhaustive."
2. **"Best predictor of outcomes / +14% mental-health variance"** rests on a **single 271-person study** (Hanel et al. 2018). Don't generalize it to "best predictor of behavior" — the same report shows abstract values predict specific behavior weakly (r≈.06). This is internally contradictory if stated baldly.
3. **"This circumplex is far more insightful than a flat list"** is an *untested usability claim*. Circumplex interpretation is cognitively non-trivial for laypeople; validate that users actually read it correctly.
4. **"Behavioral traces = the conceptual gold standard / highest-validity."** Time/money/screen-time allocation reflects **constraints, obligations, and habit at least as much as values** (the value-action gap). Reframe as "constrained behavior," a strong but imperfect proxy.
5. **"~21% of variance" and "2–3× stated vs revealed WTP"** are **domain-specific** figures (pro-environmental behavior; willingness-to-pay studies). Don't present them as universal constants across all values.
6. **"PVQ-RR is the strongest-validated values instrument in existence"** — defensible but unprovable; soften the superlative in a report whose credibility comes from hedging.

## C. Structural gaps to close before building the monetized loop

The longitudinal "drift/growth/gap" loop is both the core differentiator *and* the part standing on the thinnest psychometric ice:

- **Individual vs. group validity (the #1 issue).** Group-level circumplex reproduction (MDS) says nothing about whether *one person's* short-scale profile is trustworthy. Specify a **standard error of measurement per value** and a **reliable-change index**; gate every "drift/growth" claim behind it.
- **Reliability of change/difference scores.** With tradition/security/power alphas of .16–.55, naive drift detection measures noise. Define minimum re-assessment intervals and reliable-change thresholds.
- **Lifespan / maturation baselines.** Conservation and security normatively rise with age while openness and hedonism fall. Without **age norms**, you cannot distinguish genuine change from expected development.
- **Age/gender/cohort norming for interpretation.** PVQ-RR uses gender-matched portraits and scores differ by age/gender; even a within-person centered profile needs demographic context to interpret "high/low."
- **Cold-start for Thurstonian IRT.** You can't IRT-score your first users before the item bank is calibrated. Plan the calibration sample, item-bank development, and a fallback scoring method for early users.
- **The "confidence indicator" risk.** Converting multi-signal agreement into a "confidence" number with no calibrated method or ground truth is itself a **pseudo-precision / Barnum trap**. Specify a real, falsifiable method or label it explicitly exploratory.
- **Mode effects.** The PVQ was validated mostly on paper/web; LLM-mediated conversational elicitation and low-friction mobile micro-interactions (satisficing) may alter its psychometric properties. Don't assume the validated numbers transfer to your UX unchanged.
- **Reporting altitude contradiction.** The MVP plans to report at the *higher-order quadrant* level (where reliability holds) — but the differentiating UX ("you rank Benevolence highly, but…") operates at the *single-value* level (where it's weakest). Resolve this tension explicitly.

## D. Legal, ethical & go-to-market gaps

- **DPIA + automated-decision rights.** Profiling intimate values is high-risk GDPR processing that likely requires a **Data Protection Impact Assessment**; automated value inference may trigger Art. 22 transparency/rights. Decide an **under-18 policy** (the PVQ is validated on adolescents — will you block minors?).
- **Clinical-safety pathway.** Beyond gating mortality exercises: add **at-risk screening**, a **defined crisis-escalation pathway**, and a plan for when honest "gap" feedback harms a fragile user. The most differentiating feature is also the one most likely to cause distress.
- **Licensing scope.** Confirm written commercial-use rights for **all** Schwartz-derived content (PVQ-RR, PVQ/TwIVI items, *and* the SVBWS/BWVr best-worst value sets) — the MVP is likely **not** licensing-free.
- **Behavioral-trace feasibility.** iOS/Android tightly restrict calendar/spending/screen-time access and scrutinize such apps in review. The "lived signal" you call the gold standard may be largely inaccessible — verify *now* and have a fallback.
- **Inverted price/value + retention.** The strongest-evidence features (MaxDiff + circumplex) are free; the paid tier is the weakest-evidence, highest-fatigue logging/coaching. Pair this with a real retention strategy for EMA/logging, or the recurring-revenue thesis fails.
- **Efficacy before claims.** Move the small proximal-outcome pilot **earlier** (before marketing growth/alignment), and calibrate all copy to small effect sizes. Don't sell "live in alignment → feel better" for years on zero internal evidence.

---

## What to do next (concrete)

1. **Phase 0 due diligence (do before any code):** (a) written licensing confirmation for all Schwartz-derived content; (b) a DPIA + clinical-risk review (screening, crisis pathway, under-18 policy); (c) verify behavioral-trace data access on iOS/Android.
2. **Build the psychometrics service first:** centering, Thurstonian-IRT/Bayes scoring with a cold-start fallback, SEM-per-value, and a reliable-change index — versioned so historical data can be re-scored.
3. **Ship the de-risked MVP** (card sort → MaxDiff → brief portrait at quadrant level → circumplex + confidence + tensions → profile-grounded reflection), free, with honest copy.
4. **Run a small efficacy pilot** on proximal outcomes before turning on the longitudinal loop and any growth marketing.
5. **Only then** layer EMA, behavioral traces, full PVQ-RR, journaling-NLP (corroborating), and the stated-vs-lived gap dashboard.

> This report intentionally separates *what the evidence supports* (strong: Schwartz backbone, forced-choice elicitation, ACT gap-framing, anti-Barnum feedback design) from *what is still a bet* (individual-level precision, the confidence engine, behavioral-trace feasibility, the Schwartz-as-moat thesis, and the efficacy of the growth loop). Build the first list now; treat the second as hypotheses to validate, not features to assume.
