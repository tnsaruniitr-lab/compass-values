// @ts-check
/**
 * Identity synthesis — turns a values profile into an honest, evocative
 * OPENING for the results: what the person leads with, where they sit on the
 * two Schwartz higher-order axes, and what they trade away to live that way.
 *
 * DELIBERATELY NOT A TYPE. The previous build assigned one of nine named
 * archetypes ("The Free Idealist") from threshold cliffs — exactly the
 * Barnum/MBTI mechanic the design bible forbids (RESEARCH_AND_PLAN.md: 'No
 * "type" labels. Show a position on a continuum, not a box.'). This version
 * returns continuum positions with explicit strength qualifiers, hedged
 * language near boundaries, and provenance grounded in the user's own top and
 * bottom values — statements a user can check against their own choices.
 *
 * @typedef {import('./values.js').ValueId} ValueId
 */
import { VALUE_BY_ID } from './values.js'

/** |axis| below WEAK → balanced; above CLEAR → a clear lean; between → a slight lean. */
const WEAK = 0.18
const CLEAR = 0.5

const listJoin = (xs) => (xs.length <= 1 ? (xs[0] || '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)

/** @param {number} v */
const strengthOf = (v) => (Math.abs(v) < WEAK ? 'balanced' : Math.abs(v) < CLEAR ? 'slight' : 'clear')

/**
 * Per-value crown vocabulary — used ONLY to phrase the user's OWN leading and
 * traded values into one vivid line. Never a "type": the adjective+role come
 * from the person's actual #1 value and the traded noun from their actual #10,
 * so two people get structurally different crowns. If the profile is
 * directionless (low magnitude) the crown softens to the balanced framing.
 */
const CROWN = {
  self_direction: { adj: 'self-directed', role: 'free spirit', noun: 'your own compass' },
  stimulation: { adj: 'restless', role: 'seeker', noun: 'the next adventure' },
  hedonism: { adj: 'pleasure-wise', role: 'savourer', noun: 'life’s good things' },
  achievement: { adj: 'driven', role: 'striver', noun: 'the win you earned' },
  power: { adj: 'commanding', role: 'mover', noun: 'a real say' },
  security: { adj: 'steady', role: 'anchor', noun: 'solid ground' },
  conformity: { adj: 'dependable', role: 'steadying presence', noun: 'others’ trust' },
  tradition: { adj: 'rooted', role: 'torch-bearer', noun: 'where you come from' },
  benevolence: { adj: 'devoted', role: 'carer', noun: 'your people' },
  universalism: { adj: 'principled', role: 'idealist', noun: 'a fairer world' },
}

const ENGAGE = {
  pos: { clear: 'you reach for freedom, novelty, and your own way of doing things', slight: 'you tilt toward change and choosing your own way' },
  neg: { clear: 'you build on stability, belonging, and things you can count on', slight: 'you tilt toward stability and the dependable' },
  balanced: 'you hold change and stability in genuine balance',
}
const AIM = {
  pos: { clear: 'what you aim at is larger than yourself — people, fairness, care', slight: 'you tilt toward caring for people over getting ahead' },
  neg: { clear: 'you aim at achievement — succeeding, and being seen to succeed', slight: 'you tilt toward ambition and getting somewhere' },
  balanced: 'you weigh your own success and other people in roughly equal measure',
}

/**
 * @param {{higher:Record<string,number>, top:ValueId[], bottom:ValueId[], dominantHigher:string, higherMargin?:number}} profile
 */
export function synthesizeIdentity(profile) {
  const open = profile.higher.openness - profile.higher.conservation
  const trans = profile.higher.self_transcendence - profile.higher.self_enhancement
  const axes = [
    {
      key: 'engage', name: 'How you engage life',
      left: 'Stability & roots', right: 'Openness to change',
      value: open, side: open >= 0 ? 'right' : 'left', strength: strengthOf(open),
    },
    {
      key: 'aim', name: 'What you live for',
      left: 'Getting ahead', right: 'Beyond yourself',
      value: trans, side: trans >= 0 ? 'right' : 'left', strength: strengthOf(trans),
    },
  ]

  const pick = (map, v) => {
    const s = strengthOf(v)
    if (s === 'balanced') return map.balanced
    return v >= 0 ? map.pos[s] : map.neg[s]
  }
  const essence = `In how you engage life, ${pick(ENGAGE, open)}; in what you live for, ${pick(AIM, trans)}.`

  const traits = profile.top.map((vid) => VALUE_BY_ID[vid]?.name).filter(Boolean)
  const traded = profile.bottom.map((vid) => VALUE_BY_ID[vid]?.name).filter(Boolean)
  const lead = VALUE_BY_ID[profile.top[0]]?.name || 'your top value'
  const second = VALUE_BY_ID[profile.top[1]]?.name

  const headline = second ? `You lead with ${lead} — ${second} close behind` : `You lead with ${lead}`
  const portrait = `At your core sit ${listJoin(traits)}. To keep them, you trade away ${listJoin(traded)} — ` +
    `that's a position on a continuum, drawn from your own choices, not a box you live in.`

  // The crown: one vivid line assembled from the user's OWN #1 and #10 values.
  // Honesty-gated: a directionless profile (low vector magnitude) gets the
  // balanced framing instead of a manufactured identity, exactly like the
  // circumplex arrow and the "centre of gravity" copy.
  const topId = profile.top[0]
  const bottomId = profile.bottom[profile.bottom.length - 1]
  const cTop = CROWN[topId]
  const cBottom = CROWN[bottomId]
  const directionless = (profile.circumplex?.magnitude ?? 0) < 0.5
  const crown = (directionless || !cTop || !cBottom)
    ? { balanced: true, lead: '', topId, bottomId, topNoun: '', bottomNoun: '' }
    : {
        balanced: false,
        lead: `A ${cTop.adj} ${cTop.role}`,
        topId, bottomId,
        topNoun: cTop.noun,
        bottomNoun: cBottom.noun,
      }

  return { headline, essence, portrait, crown, traits, axes, accentDim: profile.dominantHigher }
}
