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
 * @property {string} short   Canonical one-line statement (the sort card label)
 * @property {string[]} [facets]  4 distinct phrasings, rotated across MaxDiff appearances
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
    short: 'Thinking for myself and choosing my own path',
    facets: [
      'Thinking for myself and choosing my own path',
      'Deciding on my own terms, not by anyone else’s script',
      'Room to explore my own ideas',
      'Free to change my mind and my direction',
    ],
    blurb: 'Independent thought and action — creating, exploring, and deciding for yourself.',
    color: '#5eead4', higher: ['openness'],
  },
  {
    id: 'stimulation', name: 'Stimulation', order: 1, angle: angleFor(1),
    short: 'A life with edge, variety and surprise',
    facets: [
      'Seeking excitement, novelty and challenge',
      'Saying yes to the unfamiliar',
      'A life with edge, variety and surprise',
      'Chasing the next new thing over the safe one',
    ],
    blurb: 'Novelty, excitement, and challenge — a life with variety and stimulation.',
    color: '#38bdf8', higher: ['openness'],
  },
  {
    id: 'hedonism', name: 'Hedonism', order: 2, angle: angleFor(2),
    short: 'Actually enjoying the good things while they’re here',
    facets: [
      'Actually enjoying the good things while they’re here',
      'Savouring pleasure without rushing past it',
      'Treating myself, and not apologising for it',
      'Letting a good moment be the whole point',
    ],
    blurb: 'Pleasure and enjoyment — savouring the good things and gratifying yourself.',
    color: '#a78bfa', higher: ['openness', 'self_enhancement'],
  },
  {
    id: 'achievement', name: 'Achievement', order: 3, angle: angleFor(3),
    short: 'Doing well at what I take on — and having it count',
    facets: [
      'Doing well at what I take on — and having it count',
      'Being good at something and known for it',
      'Setting a high bar and clearing it',
      'Proof of work, not just effort',
    ],
    blurb: 'Personal success through demonstrating competence by social standards.',
    color: '#fbbf24', higher: ['self_enhancement'],
  },
  {
    id: 'power', name: 'Power', order: 4, angle: angleFor(4),
    short: 'Having real influence over how things go',
    facets: [
      'Having real influence over how things go',
      'A say in the decisions that matter',
      'Being someone whose call actually counts',
      'The standing to make things happen, not just watch',
    ],
    blurb: 'Social status, prestige, and control or dominance over people and resources.',
    color: '#fb7185', higher: ['self_enhancement'],
  },
  {
    id: 'security', name: 'Security', order: 5, angle: angleFor(5),
    short: 'Solid ground under my feet',
    facets: [
      'Safety, stability and order',
      'Knowing tomorrow will hold — no nasty surprises',
      'A settled, predictable life for me and mine',
      'Solid ground under my feet',
    ],
    blurb: 'Safety, harmony, and stability — for yourself, your relationships, and society.',
    color: '#60a5fa', higher: ['conservation'],
  },
  {
    id: 'conformity', name: 'Conformity', order: 6, angle: angleFor(6),
    short: 'Being someone others can rely on to do right',
    facets: [
      'Being someone others can rely on to do right',
      'Not letting people down or causing friction',
      'Honouring what’s expected of me',
      'Fitting the group I belong to',
    ],
    blurb: 'Restraint of actions likely to upset others or violate social expectations.',
    color: '#818cf8', higher: ['conservation'],
  },
  {
    id: 'tradition', name: 'Tradition', order: 7, angle: angleFor(7),
    short: 'Staying rooted in where I come from',
    facets: [
      'Staying rooted in where I come from',
      'Keeping the customs that raised me alive',
      'Belonging to something older than me',
      'Passing on what my people passed to me',
    ],
    blurb: 'Respect for and commitment to the customs, ideas, and culture you come from.',
    color: '#c084fc', higher: ['conservation'],
  },
  {
    id: 'benevolence', name: 'Benevolence', order: 8, angle: angleFor(8),
    short: 'Showing up for the people close to me',
    facets: [
      'Showing up for the people close to me',
      'Being loyal and dependable to my own',
      'Giving my people my time and care',
      'The person others can count on',
    ],
    blurb: 'Preserving and enhancing the welfare of the people you are close to.',
    color: '#34d399', higher: ['self_transcendence'],
  },
  {
    id: 'universalism', name: 'Universalism', order: 9, angle: angleFor(9),
    short: 'A fair shot for everyone, and a livable planet',
    facets: [
      'A fair shot for everyone, and a livable planet',
      'Fairness and the wellbeing of all people',
      'Caring past my own circle',
      'Protecting people and nature I’ll never meet',
    ],
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

/**
 * Per-value "ink" for LIGHT themes — a deepened, hue-preserved cousin of each
 * value's neon `color`, darkened until it reads as confident text on the linen
 * paper (#f3ecdf). Every entry is verified ≥ 4.6:1 (WCAG AA) on that ground.
 * The neon `color` is kept for dark themes and for saturated marks (circumplex
 * dots/blob) where it reads fine; only TEXT/pips on light themes use this.
 */
export const VALUE_INK = /** @type {Record<ValueId, string>} */ ({
  self_direction: '#0c7366', // deep teal    (4.88:1)
  stimulation: '#1b70a2',    // deep sky     (4.60:1)
  hedonism: '#7c3aed',       // deep violet  (4.85:1)
  achievement: '#8e5d08',    // amber-bronze (4.81:1)
  power: '#c42d4f',          // deep rose    (4.66:1)
  security: '#2563c9',       // deep blue    (4.82:1)
  conformity: '#5b50c4',     // deep indigo  (5.27:1)
  tradition: '#8b3fc4',      // deep orchid  (4.96:1)
  benevolence: '#087755',    // deep emerald (4.73:1)
  universalism: '#337627',   // deep leaf    (4.75:1)
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
