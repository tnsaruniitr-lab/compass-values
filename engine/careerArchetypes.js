// @ts-check
/**
 * Career archetypes — maps a Schwartz values profile onto career *archetypes*
 * (kinds of work that tend to fit), with reasoning and example roles.
 *
 * SCIENCE & HONESTY: the values→archetype bridge rests on the Sagiv (2002) /
 * Knafo & Sagiv (2004) values↔vocational-interest evidence and the Theory of
 * Work Adjustment. Effects are real but MODEST — values predict the kind of
 * work you'll *enjoy*, not what you'll be *good at*, and explain only a small
 * share of job-satisfaction variance (interest-fit ρ≈.17–.19). Outputs are a
 * "tends to fit" exploration, never a verdict or a precise percentage.
 *
 * The "Realistic" / hands-on dimension is ~uncorrelated with values, so the
 * Maker archetype is under-detected from values alone (see docs/SPEC_*).
 *
 * @typedef {import('./values.js').ValueId} ValueId
 */
import { VALUE_IDS } from './values.js'
import { _internals } from './scoring.js'

const { pearson } = _internals

/**
 * Each archetype is a prototype vector over the 10 values on a −2..+2 scale
 * (illustrative starting weights; calibrate empirically). Order matches
 * VALUE_IDS: self_direction, stimulation, hedonism, achievement, power,
 * security, conformity, tradition, benevolence, universalism.
 *
 * @typedef {Object} Archetype
 * @property {string} key
 * @property {string} name
 * @property {string} tagline
 * @property {Partial<Record<ValueId, number>>} proto
 * @property {string} riasec        Holland interest family this leans toward
 * @property {string[]} roles       Illustrative example roles (NOT prescriptions)
 * @property {string} story         2–3 sentence narrative for the reveal
 * @property {string} antiFit       What would chafe — honest contrast
 * @property {string} accent        Accent colour (from the value palette)
 * @property {boolean} [needsInterest]  True if values-only detection is weak (Realistic)
 */

/** @type {Archetype[]} */
export const ARCHETYPES = [
  {
    key: 'creative',
    name: 'The Independent Creative',
    tagline: 'You make things — your own way.',
    proto: { self_direction: 2, stimulation: 2, hedonism: 1, power: -1, security: -1, conformity: -2, tradition: -1, universalism: 1 },
    riasec: 'Artistic',
    roles: ['musician', 'designer', 'writer', 'filmmaker', 'photographer', 'creative director'],
    story: 'You’re wired to create, and to do it on your own terms. Novelty feeds you and rigid rules chafe — you’d rather invent the path than follow one. Work that lets you express something and set your own rhythm is where you come alive.',
    antiFit: 'Rigid hierarchies and repetitive, rule-bound roles will drain you fastest.',
    accent: '#5eead4',
  },
  {
    key: 'founder',
    name: 'The Founder',
    tagline: 'You’d rather build it than join it.',
    proto: { self_direction: 2, stimulation: 1, hedonism: 1, achievement: 2, power: 1, security: -2, conformity: -1, tradition: -1, benevolence: -1, universalism: -1 },
    riasec: 'Enterprising',
    roles: ['startup founder', 'business owner', 'product lead', 'independent freelancer', 'dealmaker'],
    story: 'Autonomy plus ambition: you want to own the outcome, and you’ll take real risk to get it. Building something from nothing — and being measured by results — suits you far better than a safe seat in someone else’s plan.',
    antiFit: 'Slow, low-stakes roles with no ownership or upside will bore you.',
    accent: '#fbbf24',
  },
  {
    key: 'steady',
    name: 'The Steady Professional',
    tagline: 'You build a life you can count on.',
    proto: { self_direction: -1, stimulation: -2, achievement: 1, security: 2, conformity: 2, tradition: 1, benevolence: 1 },
    riasec: 'Conventional',
    roles: ['accountant', 'operations manager', 'civil servant', 'project manager', 'specialist in an established org'],
    story: 'You value stability, clear expectations, and doing things properly. You thrive where the ground is solid and the path is known — and you bring a reliability that others quietly depend on.',
    antiFit: 'Chaotic, ever-pivoting environments with no structure will wear you down.',
    accent: '#60a5fa',
  },
  {
    key: 'helper',
    name: 'The Helper',
    tagline: 'You’re at your best in service of people.',
    proto: { stimulation: -1, achievement: -1, power: -2, security: 1, conformity: 1, benevolence: 2, universalism: 1 },
    riasec: 'Social',
    roles: ['nurse', 'teacher', 'therapist', 'social worker', 'people/HR lead', 'coach'],
    story: 'Caring for people isn’t a side effect of your work — it’s the point. You’re drawn to roles where you can support, teach, or heal, and the usual status games hold little appeal.',
    antiFit: 'Cut-throat, status-driven roles will feel hollow.',
    accent: '#34d399',
  },
  {
    key: 'expert',
    name: 'The Investigator',
    tagline: 'You go deep to understand how things work.',
    proto: { self_direction: 2, achievement: 2, power: -1, conformity: -1, tradition: -1, universalism: 1 },
    riasec: 'Investigative',
    roles: ['scientist', 'engineer', 'researcher', 'data/analyst', 'doctor', 'software developer'],
    story: 'You’re driven by mastery and the freedom to think for yourself. Hard problems and the pursuit of getting it right pull you more than power or applause.',
    antiFit: 'Shallow, politics-first roles with no depth will frustrate you.',
    accent: '#38bdf8',
  },
  {
    key: 'leader',
    name: 'The Operator',
    tagline: 'You take charge and move things.',
    proto: { self_direction: 1, achievement: 2, power: 2, security: 1, conformity: 1, benevolence: -1, universalism: -2 },
    riasec: 'Enterprising + Conventional',
    roles: ['executive', 'manager', 'consultant', 'lawyer', 'commercial / sales lead'],
    story: 'You want influence and results, and you’re comfortable leading within a system. Organising people and resources toward a goal is where you’re strongest.',
    antiFit: 'Roles with no authority or visible impact will feel like a cage.',
    accent: '#fb7185',
  },
  {
    key: 'changemaker',
    name: 'The Changemaker',
    tagline: 'You work to make things fairer.',
    proto: { self_direction: 1, stimulation: 1, achievement: -1, power: -1, security: -1, conformity: -1, tradition: -1, benevolence: 1, universalism: 2 },
    riasec: 'Social + Enterprising',
    roles: ['nonprofit lead', 'policy / public sector', 'advocacy & campaigns', 'sustainability', 'social entrepreneur', 'journalism'],
    story: 'A bigger cause gives your work meaning. You pair independence with a strong pull toward fairness, and you’d trade status for real impact on something that matters.',
    antiFit: 'Purely commercial roles with no mission will leave you restless.',
    accent: '#4ade80',
  },
  {
    key: 'maker',
    name: 'The Maker',
    tagline: 'You think with your hands.',
    proto: { self_direction: 1, achievement: 1, security: 1, benevolence: -1, universalism: -1 },
    riasec: 'Realistic',
    roles: ['skilled trades', 'applied / hands-on engineering', 'chef', 'technician', 'craftsperson', 'maker / builder'],
    story: 'You like real, tangible results and getting genuinely good at a craft. Concrete problems and visible progress suit you more than abstraction or office politics.',
    antiFit: 'Abstract, meeting-heavy roles with nothing to show for the day will wear thin.',
    accent: '#818cf8',
    needsInterest: true,
  },
]

/** @type {Record<string, Archetype>} */
export const ARCHETYPE_BY_KEY = Object.fromEntries(ARCHETYPES.map((a) => [a.key, a]))

const protoVec = (a) => VALUE_IDS.map((id) => a.proto[id] ?? 0)

/* ------------------------------------------------------------------ interests */
/** RIASEC display-name → letter, for parsing each archetype's `riasec` field. */
const RIASEC_LETTER = { Realistic: 'R', Investigative: 'I', Artistic: 'A', Social: 'S', Enterprising: 'E', Conventional: 'C' }
/** @param {Archetype} a @returns {string[]} RIASEC letters this archetype leans on */
export const archetypeLetters = (a) => a.riasec.split('+').map((s) => RIASEC_LETTER[s.trim()]).filter(Boolean)

/** Mean of the user's interest scores over an archetype's RIASEC letters (−1..1). */
export function interestMatch(archetype, riasecScores) {
  const letters = archetypeLetters(archetype)
  if (!letters.length || !riasecScores) return 0
  return letters.reduce((s, L) => s + (riasecScores[L] ?? 0), 0) / letters.length
}

/** Spec §A3 blend weights: values carry most of the signal, interests sharpen it. */
export const BLEND_W_VALUES = 0.7
export const BLEND_W_INTERESTS = 0.3

/**
 * Actionable layer per archetype: a concrete micro-experiment for THIS week
 * (values point to enjoyment, so the honest next step is a cheap real-world
 * test, not a career leap) + the matching O*NET interest-area explorer
 * (U.S. DoL, CC BY 4.0) so the roles list has somewhere real to go.
 */
export const ARCHETYPE_ACTIONS = {
  creative: { action: 'Make one small thing end-to-end this week — a page, a track, a poster — and show it to one person.', onet: 'https://www.onetonline.org/explore/interests/Artistic/' },
  founder: { action: 'Sell something tiny this week — one listing, one pitch, one offer — and notice how owning the outcome feels.', onet: 'https://www.onetonline.org/explore/interests/Enterprising/' },
  steady: { action: 'Take one chaotic thing you touch weekly and build the checklist that tames it.', onet: 'https://www.onetonline.org/explore/interests/Conventional/' },
  helper: { action: 'Give one hour of real help this week — teach, review, or coach someone — and notice your energy afterwards.', onet: 'https://www.onetonline.org/explore/interests/Social/' },
  expert: { action: 'Pick the question you keep circling and go two levels deeper than the first article.', onet: 'https://www.onetonline.org/explore/interests/Investigative/' },
  leader: { action: 'Volunteer to run the next meeting or plan — own it start to finish and watch what it does to you.', onet: 'https://www.onetonline.org/explore/interests/Enterprising/' },
  changemaker: { action: 'Give one concrete hour to the issue you keep caring about from a distance.', onet: 'https://www.onetonline.org/explore/interests/Social/' },
  maker: { action: 'Fix or build one physical thing this week and notice whether the hours disappeared.', onet: 'https://www.onetonline.org/explore/interests/Realistic/' },
}

/**
 * Qualitative band for a profile-match correlation. NO percentages by design.
 *
 * Cutoffs are NOISE-CALIBRATED (2026-07-04): 4,000 fully random sessions
 * (random full ranking + random MaxDiff picks) run through this exact
 * pipeline put the TOP archetype's r at p50=0.43, p75=0.58, p90=0.69,
 * p95=0.75. So: 'strong' beats ~95% of random input, 'clear' ~90%,
 * 'slight' ~75% — and anything below 0.58 is indistinguishable from noise
 * (a consistent real profile scores ~0.9). The previous hand-picked cutoffs
 * (0.55/0.3/0.1) awarded 'strong' to 29% of pure noise.
 */
export function matchBand(r) {
  if (r >= 0.75) return 'strong'
  if (r >= 0.69) return 'clear'
  if (r >= 0.58) return 'slight'
  return 'weak'
}

/**
 * Band cutoffs for the BLENDED (values+interests) score, separately
 * NOISE-CALIBRATED (2026-07-05): 4,000 fully random sessions (random ranking
 * + random MaxDiff + random interest taps) put the top BLENDED score at
 * p50=0.38, p75=0.50, p90=0.61, p95=0.68 — while a coherent profile with
 * matching interests scores ~0.90. So 'strong' beats ~95% of random input,
 * 'clear' ~90%, 'slight' ~75%, mirroring the values-only bands.
 */
export function blendBand(s) {
  if (s >= 0.68) return 'strong'
  if (s >= 0.61) return 'clear'
  if (s >= 0.50) return 'slight'
  return 'weak'
}

/** Top-archetype r below this is indistinguishable from random input → abstain. */
export const LOW_SIGNAL_R = 0.58
/** Same threshold for the blended path (calibrated separately, p75 of noise). */
export const LOW_SIGNAL_BLEND = 0.50

/**
 * Rank archetypes by how well the user's value *shape* matches each prototype.
 * Uses Pearson profile-correlation (defensible; avoids difference-score pitfalls).
 *
 * With NO interests signal: archetypes flagged needsInterest (Maker/Realistic)
 * are capped at 'slight' — values carry ~zero Realistic information, so a
 * confident verdict there would be invented.
 * WITH the 12-item interests round: the blend (spec §A3, w_v=0.7 / w_i=0.3)
 * measures the hands-on dimension directly, so Maker competes honestly and
 * the cap comes off.
 *
 * @param {{combined: Record<string, number>}} profile  from buildProfile()
 * @param {{riasec: Record<string, number>, answered: number}|null} [interests]
 * @returns {(Archetype & {score:number, band:string, caveat?:string, interestFit?:number})[]} sorted best → worst
 */
export function rankArchetypes(profile, interests = null) {
  const u = VALUE_IDS.map((id) => profile.combined[id] ?? 0)
  const useInterests = !!(interests && interests.answered >= 8)
  return ARCHETYPES
    .map((a) => {
      const r = pearson(u, protoVec(a))
      let score = r
      let band
      let caveat
      let interestFit
      if (useInterests) {
        interestFit = interestMatch(a, interests.riasec)
        score = BLEND_W_VALUES * r + BLEND_W_INTERESTS * interestFit
        band = blendBand(score)
      } else {
        band = matchBand(r)
        if (a.needsInterest && (band === 'strong' || band === 'clear')) {
          band = 'slight'
          caveat = 'Values can’t see hands-on interest — this one needs a different kind of question, so we hold it loosely.'
        }
      }
      return { ...a, score, valuesR: r, band, ...(interestFit !== undefined ? { interestFit } : {}), ...(caveat ? { caveat } : {}) }
    })
    .sort((x, y) => y.score - x.score)
}

/**
 * Build a human reasoning string for why an archetype fits, grounded in the
 * specific values that drove the match (and the user's lowest values as
 * honest contrast).
 *
 * @param {{combined: Record<string, number>, ranked: ValueId[]}} profile
 * @param {Archetype} archetype
 * @param {Record<string,{name:string}>} valueMeta  e.g. VALUE_BY_ID
 */
export function explainMatch(profile, archetype, valueMeta) {
  const salient = VALUE_IDS.filter((id) => Math.abs(archetype.proto[id] ?? 0) >= 1)
  // Drivers: salient values where the user agrees in sign, strongest first.
  const drivers = salient
    .filter((id) => Math.sign(profile.combined[id] ?? 0) === Math.sign(archetype.proto[id] ?? 0) && (profile.combined[id] ?? 0) !== 0)
    .sort((a, b) => Math.abs(profile.combined[b]) - Math.abs(profile.combined[a]))

  const highDrivers = drivers.filter((id) => (archetype.proto[id] ?? 0) > 0).slice(0, 2)
  const lowDrivers = drivers.filter((id) => (archetype.proto[id] ?? 0) < 0).slice(0, 1)
  const nm = (id) => (valueMeta[id]?.name ?? id)

  const parts = []
  if (highDrivers.length) parts.push(`you rank ${highDrivers.map(nm).join(' and ')} highly`)
  if (lowDrivers.length) parts.push(`${lowDrivers.map(nm).join(' and ')} matters less to you`)
  const lead = parts.length ? `Because ${parts.join(', and ')}, ` : ''
  const story = lead ? archetype.story.charAt(0).toLowerCase() + archetype.story.slice(1) : archetype.story

  // Honest contrast: the strongest salient value where the user DISAGREES with
  // the prototype. Silently dropping disagreements made the reasoning read more
  // certain than the data — the spec's template requires the contrast clause.
  const mismatch = salient
    .filter((id) => {
      const c = profile.combined[id] ?? 0
      return Math.abs(c) >= 0.35 && Math.sign(c) !== Math.sign(archetype.proto[id] ?? 0)
    })
    .sort((a, b) => Math.abs(profile.combined[b]) - Math.abs(profile.combined[a]))[0]
  const contrast = mismatch
    ? ` (Though your ${(profile.combined[mismatch] > 0 ? 'high' : 'low')} ${nm(mismatch)} cuts against this — hold it loosely.)`
    : ''
  return `${lead}${story}${contrast}`
}

/**
 * Concrete "where you fit at work" insights derived from value signals
 * (autonomy / variety / recognition / purpose). Returns short phrases that
 * read as a continuation of "You thrive when…" and "What drains you…".
 * @param {{combined: Record<string, number>}} profile
 */
export function workInsights(profile) {
  const c = profile.combined
  const dims = [
    { v: (c.self_direction - c.conformity), hi: 'you set your own direction and methods', lo: 'expectations are clear and your role is well defined', hiDrain: 'being micromanaged or hemmed in by rules', loDrain: 'open-ended ambiguity with no clear brief' },
    { v: (c.stimulation + c.hedonism - c.security), hi: 'there’s variety, novelty, and room to experiment', lo: 'there’s a calm, stable, predictable rhythm', hiDrain: 'monotony — doing the same thing every day', loDrain: 'constant upheaval and shifting goalposts' },
    { v: (c.power + c.achievement), hi: 'achievement is visible and progress gets recognised', lo: 'the work is judged by its quality, not the ladder', hiDrain: 'effort that goes unseen or unrewarded', loDrain: 'forced competition and status games' },
    { v: (c.benevolence + c.universalism), hi: 'the work clearly helps people or serves a cause', lo: 'you’re free to focus on the craft itself', hiDrain: 'work that feels pointless or purely self-serving', loDrain: 'heavy obligation to a cause you don’t share' },
  ]
  const byStrength = [...dims].sort((a, b) => Math.abs(b.v) - Math.abs(a.v))
  return {
    thrive: byStrength.slice(0, 3).map((d) => (d.v >= 0 ? d.hi : d.lo)),
    drains: byStrength.slice(0, 2).map((d) => (d.v >= 0 ? d.hiDrain : d.loDrain)),
  }
}

/**
 * Convenience: top-N archetypes with reasoning + action layer, ready for the UI.
 *
 * Honesty gates:
 * - `lowSignal` is true when the best match is indistinguishable from random
 *   input (top score below the noise-calibrated bar for whichever path ran)
 *   or the user's own value signals disagree (convergence < 0.2) — the UI
 *   must render an abstain state, not a verdict.
 * - WITHOUT interests, a needsInterest archetype (Maker) never takes the
 *   primary slot (values carry ~no Realistic information). WITH the 12-item
 *   interests round, the blend measures hands-on directly and Maker competes
 *   on equal terms.
 *
 * @param {*} profile @param {Record<string,{name:string}>} valueMeta @param {number} n
 * @param {{riasec: Record<string, number>, answered: number}|null} [interests]
 */
export function careerReport(profile, valueMeta, n = 3, interests = null) {
  const useInterests = !!(interests && interests.answered >= 8)
  const ranked = rankArchetypes(profile, interests)
  if (!useInterests && ranked[0].needsInterest) {
    const firstDetectable = ranked.findIndex((a) => !a.needsInterest)
    if (firstDetectable > 0) ranked.splice(firstDetectable, 0, ...ranked.splice(0, firstDetectable))
  }
  const lowSignal = ranked[0].score < (useInterests ? LOW_SIGNAL_BLEND : LOW_SIGNAL_R) ||
    (profile.convergence != null && profile.convergence < 0.2)
  const report = ranked.slice(0, n).map((a, i) => ({
    ...a,
    rank: i + 1,
    reasoning: explainMatch(profile, a, valueMeta),
    ...(ARCHETYPE_ACTIONS[a.key] || {}),
  }))
  report.lowSignal = lowSignal
  report.usedInterests = useInterests
  return report
}
