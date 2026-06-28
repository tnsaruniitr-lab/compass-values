// @ts-check
/**
 * Identity synthesis — turns a values profile into a single, evocative "who you
 * are" headline + portrait, so the results lead with a strong, memorable
 * self-image before drilling into values, work, and love.
 *
 * Derived from the two Schwartz higher-order axes:
 *   Openness ↔ Conservation   (how you engage life)
 *   Self-Transcendence ↔ Self-Enhancement  (what you live for)
 * giving a 3×3 grid of named identities, enriched with the person's own top
 * values. Framed as a reflective portrait, not a clinical "type".
 *
 * @typedef {import('./values.js').ValueId} ValueId
 */
import { VALUE_BY_ID } from './values.js'

const T = 0.22

/** key = `${openKey}|${transKey}` where open ∈ open|mid|cons, trans ∈ trans|mid|enh */
const IDENTITY = {
  'open|trans': { name: 'The Free Idealist', essence: 'Independent in spirit, generous in purpose.', blurb: 'You want the freedom to live by your own compass — and you point it toward something bigger than yourself. Novelty and conscience pull you forward in equal measure.' },
  'open|mid': { name: 'The Restless Explorer', essence: 'Curious, self-directed, always reaching for what’s next.', blurb: 'Routine feels like a cage; you’re happiest discovering, creating, and choosing your own way. You’d rather try and learn than play it safe.' },
  'open|enh': { name: 'The Bold Trailblazer', essence: 'Ambitious, original, unafraid to go first.', blurb: 'You pair a hunger to achieve with a refusal to be boxed in — you’d rather build your own path than climb someone else’s. Risk doesn’t scare you; standing still does.' },
  'mid|trans': { name: 'The Quiet Idealist', essence: 'Caring, principled, steady in your values.', blurb: 'What matters most to you is people and fairness — you measure a life by who it helps. You don’t need the spotlight to do good.' },
  'mid|mid': { name: 'The Balanced Navigator', essence: 'Grounded, adaptable, hard to knock off course.', blurb: 'You hold competing pulls in balance — freedom and security, self and others — without being ruled by any one. That even keel is its own quiet strength.' },
  'mid|enh': { name: 'The Driven Achiever', essence: 'Focused, capable, set on getting there.', blurb: 'You like to succeed and to be recognised for it, and you bring real drive to what you take on. Clear goals give your days their shape.' },
  'cons|trans': { name: 'The Loyal Guardian', essence: 'Devoted, dependable, protective of your people.', blurb: 'You build safety and care for the people and traditions you love. Loyalty and stability aren’t dull to you — they’re how you show love.' },
  'cons|mid': { name: 'The Steady Anchor', essence: 'Reliable, rooted, the calm others lean on.', blurb: 'You value order, security, and doing things properly, and you’re the steady ground in a storm. People trust you because you keep your word.' },
  'cons|enh': { name: 'The Determined Builder', essence: 'Disciplined, ambitious, building something that lasts.', blurb: 'You pair a drive to achieve with respect for structure — you climb deliberately and build to last. You earn your standing the solid way.' },
}

const listJoin = (xs) => (xs.length <= 1 ? (xs[0] || '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)

/**
 * @param {{higher:Record<string,number>, top:ValueId[], dominantHigher:string}} profile
 */
export function synthesizeIdentity(profile) {
  const open = profile.higher.openness - profile.higher.conservation
  const trans = profile.higher.self_transcendence - profile.higher.self_enhancement
  const ok = open > T ? 'open' : open < -T ? 'cons' : 'mid'
  const tk = trans > T ? 'trans' : trans < -T ? 'enh' : 'mid'
  const id = IDENTITY[`${ok}|${tk}`]
  const traits = profile.top.map((vid) => VALUE_BY_ID[vid]?.name).filter(Boolean)
  return {
    name: id.name,
    essence: id.essence,
    portrait: `${id.blurb} At your core sit ${listJoin(traits)} — and the rest takes its cue from them.`,
    traits,
    accentDim: profile.dominantHigher,
  }
}
