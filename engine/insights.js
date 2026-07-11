// @ts-check
/**
 * Derived insights — the synthesis layer that turns a scored profile into
 * combination-level content: the leading-pair signature, five "how it shows
 * up" aspects, structural distinctiveness, and per-value deep reads.
 *
 * HONESTY MODEL: every insight here is a DETERMINISTIC function of the
 * user's own scores (provenance is rendered next to each), the copy lives in
 * a reviewed bank (engine/insightBank.js — every entry Barnum-tested and
 * required to name a cost), and anything derived from weakly-agreeing
 * signals inherits a hedge. No randomness, no flattery-only content.
 *
 * @typedef {import('./values.js').ValueId} ValueId
 */
import { VALUE_IDS, VALUE_BY_ID, HIGHER_ORDER } from './values.js'
import { PAIR_BANK, DEEP_BANK, ASPECT_BANK } from './insightBank.js'

/** Canonical unordered pair key. */
export const pairKey = (a, b) => [a, b].sort().join('+')

/**
 * The leading-pair signature: the reviewed synthesis for the user's top-2
 * values, plus provenance. Returns null if the bank is missing the pair
 * (should not happen — tests enforce completeness).
 * @param {{ranked: ValueId[]}} profile
 */
export function pairSignature(profile) {
  const [a, b] = profile.ranked
  const entry = PAIR_BANK[pairKey(a, b)]
  if (!entry) return null
  return { a, b, ...entry }
}

/* ------------------------------------------------------------------ aspects */
/**
 * Variant scoring: mean(z of positive drivers) − mean(z of negative drivers).
 * All inputs are within-person z-scores, so variant scores are comparable.
 * 'mixed'/'balanced' wins when the top two variants are within MIX_MARGIN —
 * an honest "context-switcher" read instead of a manufactured lean.
 */
const MIX_MARGIN = 0.2

/** @type {Record<string, {title: string, variants: Record<string, {pos: ValueId[], neg?: ValueId[]}>, mixedId: string}>} */
const ASPECT_RULES = {
  decide: {
    title: 'How you decide',
    variants: {
      own_compass: { pos: ['self_direction'], neg: ['conformity', 'tradition'] },
      consult_then_choose: { pos: ['benevolence', 'universalism'] },
      weigh_and_secure: { pos: ['security', 'conformity'] },
      fast_and_bold: { pos: ['stimulation', 'achievement', 'power'] },
    },
    mixedId: 'mixed',
  },
  conflict: {
    title: 'In conflict',
    variants: {
      direct_contender: { pos: ['power', 'achievement'] },
      bridge_builder: { pos: ['benevolence', 'conformity'] },
      principle_stand: { pos: ['universalism', 'tradition'] },
      de_escalator: { pos: ['security'], neg: ['power'] },
    },
    mixedId: 'mixed',
  },
  stress: {
    title: 'Under pressure',
    variants: {
      tighten_control: { pos: ['security', 'conformity'] },
      break_away: { pos: ['stimulation', 'self_direction'] },
      over_give: { pos: ['benevolence'] },
      grind_harder: { pos: ['achievement', 'power'] },
    },
    mixedId: 'mixed',
  },
  risk: {
    title: 'How you take risks',
    variants: {
      leap: { pos: ['stimulation', 'self_direction'], neg: ['security'] },
      calculated: { pos: ['achievement', 'power'] },
      protective: { pos: ['security', 'conformity', 'tradition'] },
    },
    mixedId: 'mixed',
  },
}

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

/**
 * Pick one variant per aspect from the profile, with provenance + hedging.
 * @param {{combined: Record<string, number>, dominantHigher: string, higherMargin: number, valueConfidence: Record<string, string>}} profile
 * @returns {{key: string, title: string, variant: {id: string, label: string, body: string}, drivers: ValueId[], hedged: boolean}[]}
 */
export function deriveAspects(profile) {
  const c = profile.combined
  const out = []
  for (const [key, rule] of Object.entries(ASPECT_RULES)) {
    // Negative drivers SUPPORT a pattern but must not drive it (half-weight):
    // otherwise "low power" alone could crown de_escalator with zero security.
    const scored = Object.entries(rule.variants).map(([id, d]) => ({
      id,
      drivers: d.pos,
      score: mean(d.pos.map((v) => c[v] ?? 0)) - 0.5 * mean((d.neg || []).map((v) => c[v] ?? 0)),
    })).sort((x, y) => y.score - x.score)
    const top = scored[0]
    const isMixed = top.score < 0.15 || (top.score - scored[1].score) < MIX_MARGIN
    const chosenId = isMixed ? rule.mixedId : top.id
    const bank = ASPECT_BANK.find((a) => a.key === key)
    const variant = bank?.variants.find((v) => v.id === chosenId)
    if (!variant) continue
    const drivers = isMixed ? [] : top.drivers
    // A pick built on values the user's own two signals disagreed about gets a hedge.
    const hedged = drivers.some((v) => profile.valueConfidence?.[v] === 'low')
    // lean: signed needle position for instrument-style displays (0 = mixed/centre).
    const lean = isMixed ? 0 : Math.max(-1, Math.min(1, top.score))
    out.push({ key, title: bank.title, variant, drivers, hedged, lean })
  }
  // Fuel: keyed to the dominant higher-order quadrant, gated on margin.
  const fuelBank = ASPECT_BANK.find((a) => a.key === 'fuel')
  if (fuelBank) {
    const balanced = profile.higherMargin < 0.15
    const variant = fuelBank.variants.find((v) => v.id === (balanced ? 'balanced' : profile.dominantHigher))
    if (variant) {
      const drivers = balanced ? [] : /** @type {ValueId[]} */ (HIGHER_ORDER[profile.dominantHigher] || []).slice(0, 2)
      const lean = balanced ? 0 : Math.max(-1, Math.min(1, profile.higher?.[profile.dominantHigher] ?? 0))
      out.splice(3, 0, { key: 'fuel', title: fuelBank.title, variant, drivers, hedged: false, lean })
    }
  }
  return out
}

/* ------------------------------------------------- structural distinctiveness */
/** Adjacent pairs on the circumplex (circular order). */
const ADJACENT = VALUE_IDS.map((id, i) => [id, VALUE_IDS[(i + 1) % VALUE_IDS.length]])

/**
 * The "what makes yours unusual" line: circumplex neighbours normally move
 * together (that's the structure the theory is built on) — a large split
 * between neighbours is a genuinely distinctive, checkable feature of THIS
 * profile. Returns the largest split above threshold, or null.
 * @param {{combined: Record<string, number>, ranked: ValueId[]}} profile
 */
export function distinctiveSplit(profile, threshold = 1.1) {
  const c = profile.combined
  let best = null
  for (const [a, b] of ADJACENT) {
    const gap = Math.abs((c[a] ?? 0) - (c[b] ?? 0))
    if (gap >= threshold && (!best || gap > best.gap)) {
      const hi = (c[a] ?? 0) >= (c[b] ?? 0) ? a : b
      const lo = hi === a ? b : a
      best = { hi, lo, gap }
    }
  }
  if (!best) return null
  const strip = (s) => s.charAt(0).toLowerCase() + s.slice(1)
  return {
    ...best,
    text: `On the circle, ${VALUE_BY_ID[best.hi].name} and ${VALUE_BY_ID[best.lo].name} are neighbours — most people move them together. You split them hard: ` +
      `${strip(VALUE_BY_ID[best.hi].short)} matters to you, without ${strip(VALUE_BY_ID[best.lo].short)}. That split is one of the most distinctive things in your shape.`,
  }
}

/* ------------------------------------------------------------------ deep reads */
/**
 * Deep-read cards for the user's top-N values.
 * @param {{ranked: ValueId[]}} profile
 */
export function deepReads(profile, n = 3) {
  return profile.ranked.slice(0, n)
    .map((id) => {
      const entry = DEEP_BANK[id]
      return entry ? { id, name: VALUE_BY_ID[id].name, ...entry } : null
    })
    .filter(Boolean)
}
