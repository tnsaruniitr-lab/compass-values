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
      ? 'Say early what space means to you — needing room isn’t rejection, but unnamed it reads that way.'
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
    // Worldview strength = the STRONGER pole, not the average: tradition and
    // universalism sit on opposite sides of the circle, so averaging them
    // cancels for exactly the polarized-worldview people this axis exists for
    // (a devout traditionalist with low universalism averaged out to "center").
    compute: (p) => Math.max(p.combined.tradition, p.combined.universalism),
    reflect: (s, p) => s === 'right'
      ? (p && (p.combined.tradition >= p.combined.universalism)
        ? 'Your worldview runs deep — anchored in tradition, faith, and where you come from.'
        : 'Your worldview runs deep — anchored in fairness and what’s right for everyone.')
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
      ? 'Watch for over-giving — notice whether care flows back, and ask for it rather than waiting.'
      : 'Say what day-to-day tending you’re happy to give, so it isn’t discovered by disappointment.',
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
      reflection: d.reflect(side, profile),
      talk: d.talk(side, profile),
    }
  })
}

/**
 * Per-dimension first-person NOTICING prompts — how your own lean tends to
 * show up in a relationship, phrased so the reader can catch it happening.
 * Deliberately NOT partner-selection advice ("look for…" / "be wary of…"):
 * pre-meeting values predict ≈0% of dyad compatibility, so prescriptions
 * would cross the module's own Finkel firewall. No clinical vocabulary.
 */
const NOTICE_MAP = {
  stability_adventure: {
    right: 'you may experience a partner’s need for routine as confinement — say how much change you need before it becomes friction',
    left: 'you may experience a partner’s spontaneity as instability — name the anchors you need rather than bracing against change',
  },
  independence_togetherness: {
    right: 'you may read a partner’s wish for closeness as pressure — and they may read your need for room as distance; say what space means to you early',
    left: 'you may read a partner’s need for room as distance — name the closeness you need instead of testing for it',
  },
  ambition_connection: {
    right: 'your drive can read as absence to a partner — talk about how work and the relationship rank before it bites',
    left: 'you may quietly resent a partner’s ambition if it goes unnamed — ask early how they rank work and home',
  },
  shared_meaning: {
    right: 'worldview runs deep for you — surface politics, faith, and “what we’re for” early, not late',
    left: 'you sit lightly on questions of meaning — check you can live alongside someone with firmer commitments',
  },
  caretaking: {
    right: 'you tend to over-give — notice whether care flows back, and ask for it rather than waiting',
    left: 'you guard your energy — say what tending you’re happy to give, so it isn’t discovered by disappointment',
  },
}

/**
 * "Love, your way" — a synthesized, reflective (never predictive) read on how
 * your values tend to show up in love: what to notice about yourself, and
 * what's worth naming out loud with a real partner.
 * @param {{combined:Record<string,number>, higher:Record<string,number>}} profile
 */
export function loveInsights(profile) {
  const ranked = [...relationshipCompass(profile)].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  const strong = ranked.filter((d) => d.side !== 'center')
  const sideKey = (d) => (d.side === 'right' ? 'right' : 'left')
  const noticing = strong.slice(0, 3).map((d) => NOTICE_MAP[d.key][sideKey(d)])
  const talk = ranked.slice(0, 3).map((d) => d.talk)
  const summary = strong.length
    ? `${strong[0].reflection} ${strong[1] ? strong[1].reflection : ''}`.trim()
    : 'You bring a balanced, flexible presence to relationships — no single pull dominates how you connect.'
  return {
    summary,
    noticing: noticing.length ? noticing : ['no single pattern dominates — your flexibility is the thing to name, so a partner knows where you flex by choice'],
    talk,
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
