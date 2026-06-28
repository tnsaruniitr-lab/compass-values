// @ts-check
/**
 * Relationship Values Compass — a REFLECTION tool, not a partner-type predictor.
 *
 * SCIENCE & HONESTY (see docs/RESEARCH_values-to-career-and-partner.md §3):
 * pre-meeting traits/values predict ≈0% of dyad-specific compatibility
 * (Joel et al. 2017/2020), actual value similarity is a weak/inconsistent
 * predictor of satisfaction, and matching algorithms are unvalidated
 * (Finkel 2012). So this module deliberately outputs NO partner "types",
 * NO compatibility score, and NO success/longevity prediction. It reframes
 * the question from "who is right for me" to "how do my values show up in
 * love, and what should I look for and talk about?"
 *
 * The one honest level-effect: holding strong self-transcendence values
 * yourself predicts your OWN relationship quality (van der Wal 2024) — framed
 * as self-insight, not partner selection.
 *
 * @typedef {import('./values.js').ValueId} ValueId
 */

const lean3 = (v, t = 0.2) => (v > t ? 'right' : v < -t ? 'left' : 'center')

/**
 * @typedef {Object} CompassDimension
 * @property {string} key
 * @property {string} title
 * @property {string} left      label for the negative pole
 * @property {string} right     label for the positive pole
 * @property {(p:any)=>number} compute   signed lean (− = left, + = right)
 * @property {(side:string)=>string} reflect  user's tendency
 * @property {(side:string)=>string} talk     what to look for / discuss
 */

/** @type {CompassDimension[]} */
export const DIMENSIONS = [
  {
    key: 'stability_adventure',
    title: 'Stability ↔ Adventure',
    left: 'Steady & rooted',
    right: 'Open & adventurous',
    compute: (p) => p.higher.openness - p.higher.conservation,
    reflect: (s) => s === 'right'
      ? 'You lean toward novelty, change, and spontaneity in how you want life to feel.'
      : s === 'left'
        ? 'You lean toward routine, security, and a settled, predictable shared life.'
        : 'You sit near the middle — you can enjoy both novelty and a settled rhythm.',
    talk: (s) => s === 'center'
      ? 'Pace-of-life is usually easy for you to flex — still worth naming out loud.'
      : 'Pace-of-life is your #1 thing to align on: how much change vs. routine you each want.',
  },
  {
    key: 'independence_togetherness',
    title: 'Independence ↔ Togetherness',
    left: 'Closely interwoven',
    right: 'Space & autonomy',
    compute: (p) => (p.combined.self_direction + p.combined.stimulation) / 2
      - (p.combined.benevolence + p.combined.conformity + p.combined.tradition) / 3,
    reflect: (s) => s === 'right'
      ? 'You need real autonomy — room to be your own person inside a relationship.'
      : s === 'left'
        ? 'You lean toward closeness and a tightly shared life.'
        : 'You want closeness and some breathing room in roughly equal measure.',
    talk: (s) => s === 'right'
      ? 'Look for someone who doesn’t read needing space as rejection.'
      : s === 'left'
        ? 'Be clear that you value togetherness, and check it doesn’t tip into losing yourself.'
        : 'Name where your need for space and closeness sits — it shifts under stress.',
  },
  {
    key: 'ambition_connection',
    title: 'Ambition ↔ Connection',
    left: 'Relationship-first',
    right: 'Achievement-driven',
    compute: (p) => p.higher.self_enhancement - p.higher.self_transcendence,
    reflect: (s) => s === 'right'
      ? 'Status, achievement, and getting ahead carry real weight for you.'
      : s === 'left'
        ? 'Connection, care, and shared meaning matter more to you than status.'
        : 'You balance ambition with connection without one swamping the other.',
    talk: (s) => s === 'right'
      ? 'Discuss how a partner feels about work-vs-relationship priority before it bites.'
      : 'Talk about how you’ll each handle a partner who is very ambitious — or very not.',
  },
  {
    key: 'shared_meaning',
    title: 'Shared Meaning',
    left: 'Few fixed commitments',
    right: 'Strong worldview & values',
    compute: (p) => (p.combined.tradition + p.combined.universalism) / 2,
    reflect: (s) => s === 'right'
      ? 'You hold a strong worldview — tradition and/or a sense of what’s right run deep.'
      : s === 'left'
        ? 'You hold your commitments loosely and stay open on questions of meaning.'
        : 'You have views on meaning without being rigid about them.',
    // This is the ONE axis where real couples genuinely assort (research §3.5).
    talk: () => 'This is the area where deep mismatches cause the most friction — surface worldview, politics, and "what we’re for" early, not late.',
  },
  {
    key: 'caretaking',
    title: 'Caretaking',
    left: 'Self-tending',
    right: 'Strong caregiver',
    compute: (p) => p.combined.benevolence,
    reflect: (s) => s === 'right'
      ? 'You’re a natural caretaker — loyal, giving, attentive to people you love.'
      : s === 'left'
        ? 'You guard your own energy and don’t over-extend by default.'
        : 'You give generously but keep some boundaries.',
    talk: (s) => s === 'right'
      ? 'Watch for over-giving — look for reciprocity, not just someone who lets you care for them.'
      : 'Make sure a partner doesn’t need more day-to-day tending than you want to give.',
  },
]

/**
 * Build the reflection compass for a profile.
 * @param {{combined:Record<string,number>, higher:Record<string,number>}} profile
 */
export function relationshipCompass(profile) {
  return DIMENSIONS.map((d) => {
    const value = d.compute(profile)
    const side = lean3(value)
    return {
      key: d.key,
      title: d.title,
      left: d.left,
      right: d.right,
      value,
      side,
      reflection: d.reflect(side),
      talk: d.talk(side),
    }
  })
}

/** Per-dimension "what fits you in love" phrasing — reflective, not predictive. */
const LOVE_MAP = {
  stability_adventure: {
    right: { look: 'someone open to spontaneity who won’t tie you to one routine', wary: 'a partner who needs everything predictable' },
    left: { look: 'someone who wants a settled, dependable life with you', wary: 'a partner who keeps uprooting things' },
  },
  independence_togetherness: {
    right: { look: 'a partner secure enough to give you space without taking it personally', wary: 'someone who reads your independence as rejection' },
    left: { look: 'someone who wants a closely shared, interwoven life', wary: 'a distant or avoidant partner' },
  },
  ambition_connection: {
    right: { look: 'a partner who respects your drive and brings their own', wary: 'someone who’ll quietly resent your ambition' },
    left: { look: 'a partner who puts the relationship first, the way you do', wary: 'someone who chooses status over the relationship' },
  },
  shared_meaning: {
    right: { look: 'someone who shares your core worldview and sense of what matters', wary: 'deep worldview or values mismatches — name them early' },
    left: { look: 'an easy-going partner who won’t impose a worldview on you', wary: 'a partner with rigid expectations about beliefs or tradition' },
  },
  caretaking: {
    right: { look: 'a partner who returns your care rather than just receiving it', wary: 'a one-way dynamic where you give and give' },
    left: { look: 'a partner who tends their own emotional needs', wary: 'a high-maintenance dynamic that drains you' },
  },
}

/**
 * "Love, your way" — a synthesized, concrete (but non-predictive) read on the
 * partner dynamics that tend to fit you, what to look for, and what to watch.
 * @param {{combined:Record<string,number>, higher:Record<string,number>}} profile
 */
export function loveInsights(profile) {
  const ranked = [...relationshipCompass(profile)].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  const strong = ranked.filter((d) => d.side !== 'center')
  const sideKey = (d) => (d.side === 'right' ? 'right' : 'left')
  const lookFor = strong.slice(0, 3).map((d) => LOVE_MAP[d.key][sideKey(d)].look)
  const beWary = strong.slice(0, 2).map((d) => LOVE_MAP[d.key][sideKey(d)].wary)
  const summary = strong.length
    ? `${strong[0].reflection} ${strong[1] ? strong[1].reflection : ''}`.trim()
    : 'You bring a balanced, flexible presence to relationships — no single pull dominates how you connect.'
  return {
    summary,
    lookFor: lookFor.length ? lookFor : ['a partner who meets you with openness and honesty'],
    beWary: beWary.length ? beWary : ['drifting on autopilot without naming what you each need'],
  }
}

/**
 * The single honest level-effect: your own self-transcendence and your own
 * relationship quality. Self-insight, NOT partner selection.
 * @param {{higher:Record<string,number>}} profile
 */
export function relationshipSignal(profile) {
  const st = profile.higher.self_transcendence
  if (st > 0.4) {
    return {
      strength: 'high',
      text: 'People who themselves hold strong benevolence and universalism values tend to report happier relationships. That’s a finding about you — your own caring orientation — not a prediction about a partner.',
    }
  }
  return {
    strength: 'normal',
    text: 'Across research, your own caring orientation (benevolence and universalism) is more tied to your relationship happiness than how similar a partner’s values are to yours.',
  }
}
