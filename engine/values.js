// @ts-check
/**
 * The Schwartz Theory of Basic Human Values — model definitions.
 *
 * This encodes the 10 basic values, their canonical CIRCULAR order, the two
 * bipolar higher-order axes, the opposing pairs (used for tension detection),
 * and an illustrative angular position for each value on the circumplex.
 *
 * NOTE ON SCIENCE: the *theory* (value names, structure, oppositions) is from
 * the published literature and is free to model. The angular coordinates here
 * are an internally-consistent illustrative layout (top = Self-Transcendence,
 * bottom = Self-Enhancement, left = Openness, right = Conservation), NOT MDS
 * coordinates from a specific dataset. See values-app/RESEARCH_AND_PLAN.md.
 *
 * @typedef {'self_direction'|'stimulation'|'hedonism'|'achievement'|'power'|'security'|'conformity'|'tradition'|'benevolence'|'universalism'} ValueId
 * @typedef {'openness'|'self_enhancement'|'conservation'|'self_transcendence'} HigherId
 *
 * @typedef {Object} ValueDef
 * @property {ValueId} id
 * @property {string} name
 * @property {number} order   Canonical circular order 0..9
 * @property {number} angle   Degrees on the circumplex (0 = East, CCW positive)
 * @property {string} short   One-line trade-off statement (used in MaxDiff & nodes)
 * @property {string} blurb   Short description for results
 * @property {string} color   Accent colour
 * @property {HigherId[]} higher  Higher-order dimension membership
 */

/** Canonical circular order. Index i opposes index i+5. */
export const VALUE_IDS = /** @type {ValueId[]} */ ([
  'self_direction',
  'stimulation',
  'hedonism',
  'achievement',
  'power',
  'security',
  'conformity',
  'tradition',
  'benevolence',
  'universalism',
])

/** angle(order) = (108 - (9-order)*36) mod 360 → ST up, SE down, Openness left, Conservation right. */
const angleFor = (order) => ((108 - (9 - order) * 36) % 360 + 360) % 360

/** @type {ValueDef[]} */
export const VALUES = [
  {
    id: 'self_direction', name: 'Self-Direction', order: 0, angle: angleFor(0),
    short: 'Thinking for myself & choosing my own path',
    blurb: 'Independent thought and action — creating, exploring, and deciding for yourself.',
    color: '#5eead4', higher: ['openness'],
  },
  {
    id: 'stimulation', name: 'Stimulation', order: 1, angle: angleFor(1),
    short: 'Seeking excitement, novelty & challenge',
    blurb: 'Novelty, excitement, and challenge — a life with variety and stimulation.',
    color: '#38bdf8', higher: ['openness'],
  },
  {
    id: 'hedonism', name: 'Hedonism', order: 2, angle: angleFor(2),
    short: "Enjoying life's pleasures",
    blurb: 'Pleasure and enjoyment — savouring the good things and gratifying yourself.',
    color: '#a78bfa', higher: ['openness', 'self_enhancement'],
  },
  {
    id: 'achievement', name: 'Achievement', order: 3, angle: angleFor(3),
    short: 'Succeeding & being recognised for it',
    blurb: 'Personal success through demonstrating competence by social standards.',
    color: '#fbbf24', higher: ['self_enhancement'],
  },
  {
    id: 'power', name: 'Power', order: 4, angle: angleFor(4),
    short: 'Influence, status & being in control',
    blurb: 'Social status, prestige, and control or dominance over people and resources.',
    color: '#fb7185', higher: ['self_enhancement'],
  },
  {
    id: 'security', name: 'Security', order: 5, angle: angleFor(5),
    short: 'Safety, stability & order',
    blurb: 'Safety, harmony, and stability — for yourself, your relationships, and society.',
    color: '#60a5fa', higher: ['conservation'],
  },
  {
    id: 'conformity', name: 'Conformity', order: 6, angle: angleFor(6),
    short: 'Fitting in & following the rules',
    blurb: 'Restraint of actions likely to upset others or violate social expectations.',
    color: '#818cf8', higher: ['conservation'],
  },
  {
    id: 'tradition', name: 'Tradition', order: 7, angle: angleFor(7),
    short: 'Honouring custom & tradition',
    blurb: 'Respect for and commitment to the customs, ideas, and culture you come from.',
    color: '#c084fc', higher: ['conservation'],
  },
  {
    id: 'benevolence', name: 'Benevolence', order: 8, angle: angleFor(8),
    short: 'Caring for the people close to me',
    blurb: 'Preserving and enhancing the welfare of the people you are close to.',
    color: '#34d399', higher: ['self_transcendence'],
  },
  {
    id: 'universalism', name: 'Universalism', order: 9, angle: angleFor(9),
    short: 'Fairness & the wellbeing of all people & nature',
    blurb: 'Understanding, tolerance, and protection for all people and for nature.',
    color: '#4ade80', higher: ['self_transcendence'],
  },
]

/** @type {Record<ValueId, ValueDef>} */
export const VALUE_BY_ID = Object.fromEntries(VALUES.map((v) => [v.id, v]))

/** @param {ValueId} id */
export const valueById = (id) => VALUE_BY_ID[id]

/** Higher-order dimension membership (Hedonism bridges openness & self-enhancement). */
export const HIGHER_ORDER = /** @type {Record<HigherId, ValueId[]>} */ ({
  openness: ['self_direction', 'stimulation', 'hedonism'],
  self_enhancement: ['achievement', 'power', 'hedonism'],
  conservation: ['security', 'conformity', 'tradition'],
  self_transcendence: ['benevolence', 'universalism'],
})

export const HIGHER_ORDER_META = /** @type {Record<HigherId, {name:string, apex:number, color:string}>} */ ({
  self_transcendence: { name: 'Self-Transcendence', apex: 90, color: '#34d399' },
  openness: { name: 'Openness to Change', apex: 180, color: '#38bdf8' },
  self_enhancement: { name: 'Self-Enhancement', apex: 270, color: '#fb7185' },
  conservation: { name: 'Conservation', apex: 0, color: '#818cf8' },
})

/** Deeper higher-order colours for light themes (legible on pale backgrounds). */
export const HIGHER_ORDER_DEEP = /** @type {Record<HigherId, string>} */ ({
  self_transcendence: '#0a6e52',
  openness: '#1f7fb8',
  self_enhancement: '#cc2f52',
  conservation: '#5b50c4',
})

/** The two bipolar value axes. */
export const AXES = [
  { id: 'open_cons', posName: 'Openness to Change', negName: 'Conservation', pos: 'openness', neg: 'conservation' },
  { id: 'trans_enh', posName: 'Self-Transcendence', negName: 'Self-Enhancement', pos: 'self_transcendence', neg: 'self_enhancement' },
]

/** Theoretically opposing value pairs (order i vs i+5). Used to surface tensions. */
export const OPPOSING_PAIRS = /** @type {[ValueId, ValueId][]} */ ([
  ['self_direction', 'security'],
  ['stimulation', 'conformity'],
  ['hedonism', 'tradition'],
  ['achievement', 'benevolence'],
  ['power', 'universalism'],
])
