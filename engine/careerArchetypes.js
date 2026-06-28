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

/** Qualitative band for a profile-match correlation. NO percentages by design. */
export function matchBand(r) {
  if (r >= 0.55) return 'strong'
  if (r >= 0.3) return 'clear'
  if (r >= 0.1) return 'slight'
  return 'weak'
}

/**
 * Rank archetypes by how well the user's value *shape* matches each prototype.
 * Uses Pearson profile-correlation (defensible; avoids difference-score pitfalls).
 *
 * @param {{combined: Record<string, number>}} profile  from buildProfile()
 * @returns {(Archetype & {score:number, band:string})[]} sorted best → worst
 */
export function rankArchetypes(profile) {
  const u = VALUE_IDS.map((id) => profile.combined[id] ?? 0)
  return ARCHETYPES
    .map((a) => {
      const r = pearson(u, protoVec(a))
      return { ...a, score: r, band: matchBand(r) }
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
  return `${lead}${story}`
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
 * Convenience: top-N archetypes with reasoning, ready for the UI.
 * @param {*} profile @param {Record<string,{name:string}>} valueMeta @param {number} n
 */
export function careerReport(profile, valueMeta, n = 3) {
  const ranked = rankArchetypes(profile)
  return ranked.slice(0, n).map((a, i) => ({
    ...a,
    rank: i + 1,
    reasoning: explainMatch(profile, a, valueMeta),
  }))
}
