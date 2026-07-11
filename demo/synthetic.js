// @ts-check
/**
 * Deterministic synthetic respondents — for the demo and tests.
 * Given a target "importance weight" per value (0..1), generate consistent
 * portrait responses and MaxDiff choices so we can validate the engine.
 *
 * @typedef {import('../engine/values.js').ValueId} ValueId
 */
import { VALUE_IDS, MAXDIFF_BLOCKS } from '../engine/index.js'
import { PORTRAIT_ITEMS } from '../engine/portraitItems.js'

/**
 * @param {Partial<Record<ValueId, number>>} weights  0..1 importance per value (default 0.5)
 */
export function makeRespondent(weights = {}) {
  /** @type {Record<ValueId, number>} */
  const w = /** @type any */ ({})
  VALUE_IDS.forEach((id) => { w[id] = weights[id] ?? 0.5 })

  // Portrait: response = 1 + 5*weight, nudged deterministically by item suffix
  // so the two items per value aren't identical. Clamped to 1..6.
  /** @type {Record<string, number>} */ const portraitResponses = {}
  for (const it of PORTRAIT_ITEMS) {
    const nudge = it.id.endsWith('2') ? -0.25 : 0.25
    portraitResponses[it.id] = Math.round(clamp(1 + 5 * w[it.valueId] + nudge, 1, 6))
  }

  // MaxDiff: in each block pick the highest-weight value as best, lowest as worst.
  const maxdiffChoices = MAXDIFF_BLOCKS.map((b) => {
    const sorted = [...b.valueIds].sort((a, c) => w[c] - w[a])
    return { blockId: b.id, best: sorted[0], worst: sorted[sorted.length - 1] }
  })

  return { weights: w, portraitResponses, maxdiffChoices }
}

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x))

/** A few illustrative archetypes. */
export const ARCHETYPES = {
  caregiver: { benevolence: 0.95, universalism: 0.9, security: 0.6, self_direction: 0.5, power: 0.1, achievement: 0.2, stimulation: 0.3 },
  achiever: { achievement: 0.95, power: 0.9, hedonism: 0.7, self_direction: 0.6, stimulation: 0.6, benevolence: 0.25, universalism: 0.2, tradition: 0.15 },
  traditionalist: { tradition: 0.95, conformity: 0.9, security: 0.85, benevolence: 0.6, stimulation: 0.1, self_direction: 0.2, power: 0.3, universalism: 0.4 },
  // Deliberately conflicted: prizes both independence (Openness) AND security (Conservation).
  conflicted: { self_direction: 0.92, stimulation: 0.8, security: 0.9, conformity: 0.75, benevolence: 0.55, universalism: 0.5, power: 0.3 },
}
