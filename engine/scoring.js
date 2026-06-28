// @ts-check
/**
 * Scoring engine: turns raw responses into a triangulated values profile.
 *
 * Pipeline:
 *   1. Portrait → centre on the person's mean (Schwartz ipsatization) to get
 *      *relative* priorities, removing scale-use / acquiescence variance.
 *   2. MaxDiff → best–worst counts per value, normalised by appearances.
 *   3. Triangulate → standardise each signal within-person and average.
 *   4. Project onto the circumplex; derive higher-order scores, cross-signal
 *      convergence (a HEURISTIC confidence indicator — not calibrated), and
 *      opposing-value tensions.
 *
 * @typedef {import('./values.js').ValueId} ValueId
 * @typedef {import('./values.js').HigherId} HigherId
 */
import { VALUE_IDS, HIGHER_ORDER, OPPOSING_PAIRS, valueById, HIGHER_ORDER_META } from './values.js'

/* ----------------------------- small math utils ---------------------------- */
const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0)
const sd = (a) => { const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))) }
/** Standardise a {valueId: number} map to within-person z-scores. */
function zmap(obj) {
  const arr = VALUE_IDS.map((id) => obj[id] ?? 0)
  const m = mean(arr); const s = sd(arr) || 1
  /** @type {Record<string, number>} */ const out = {}
  VALUE_IDS.forEach((id, i) => { out[id] = (arr[i] - m) / s })
  return out
}
function pearson(a, b) {
  const ma = mean(a); const mb = mean(b)
  let num = 0; let da = 0; let db = 0
  for (let i = 0; i < a.length; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2 }
  const den = Math.sqrt(da * db)
  return den ? num / den : 0
}
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x))

/* ------------------------------ portrait scoring --------------------------- */
/**
 * @param {{id:string, valueId:ValueId}[]} items
 * @param {Record<string, number>} responses  itemId → 1..6
 */
export function scorePortrait(items, responses) {
  /** @type {Record<string, number[]>} */ const byValue = {}
  const all = []
  for (const it of items) {
    const r = responses[it.id]
    if (r == null) continue
    ;(byValue[it.valueId] ||= []).push(r)
    all.push(r)
  }
  const mrat = mean(all) // mean rating across all items = the centering anchor
  /** @type {Record<string, number>} */ const raw = {}
  /** @type {Record<string, number>} */ const centered = {}
  for (const id of VALUE_IDS) {
    const arr = byValue[id] || []
    raw[id] = arr.length ? mean(arr) : mrat
    centered[id] = raw[id] - mrat
  }
  return { raw, centered, mrat, answered: all.length }
}

/* ------------------------------ maxdiff scoring ---------------------------- */
/**
 * @param {{id:string, valueIds:ValueId[]}[]} blocks
 * @param {{blockId:string, best:ValueId|null, worst:ValueId|null}[]} choices
 */
export function scoreMaxDiff(blocks, choices) {
  /** @type {Record<string, number>} */ const appear = {}
  /** @type {Record<string, number>} */ const best = {}
  /** @type {Record<string, number>} */ const worst = {}
  for (const id of VALUE_IDS) { appear[id] = 0; best[id] = 0; worst[id] = 0 }
  for (const b of blocks) for (const v of b.valueIds) appear[v]++
  for (const c of choices) {
    if (c.best) best[c.best]++
    if (c.worst) worst[c.worst]++
  }
  /** @type {Record<string, number>} */ const bw = {}
  for (const id of VALUE_IDS) bw[id] = appear[id] ? (best[id] - worst[id]) / appear[id] : 0
  return { bw, appear, best, worst, answered: choices.length }
}

/* ------------------------------ profile builder ---------------------------- */
/**
 * @param {{portrait?: ReturnType<typeof scorePortrait>|null, maxdiff?: ReturnType<typeof scoreMaxDiff>|null}} signals
 */
export function buildProfile({ portrait = null, maxdiff = null } = {}) {
  const zSignals = []
  if (portrait && portrait.answered) zSignals.push(zmap(portrait.centered))
  if (maxdiff && maxdiff.answered) zSignals.push(zmap(maxdiff.bw))
  if (!zSignals.length) throw new Error('buildProfile: no signals provided')

  /** @type {Record<string, number>} */ const combined = {}
  for (const id of VALUE_IDS) {
    const vals = zSignals.map((s) => s[id]).filter(Number.isFinite)
    combined[id] = vals.length ? mean(vals) : 0
  }

  // Ranking (most → least important to you)
  const ranked = [...VALUE_IDS].sort((a, b) => combined[b] - combined[a])

  // Circumplex projection: weighted vector sum of unit vectors at each angle.
  let x = 0; let y = 0
  for (const id of VALUE_IDS) {
    const a = (valueById(id).angle * Math.PI) / 180
    x += combined[id] * Math.cos(a)
    y += combined[id] * Math.sin(a)
  }
  const magnitude = Math.hypot(x, y)
  let angle = (Math.atan2(y, x) * 180) / Math.PI
  if (angle < 0) angle += 360

  // Higher-order dimension scores (mean of member values) + dominant
  /** @type {Record<string, number>} */ const higher = {}
  for (const dim of Object.keys(HIGHER_ORDER)) higher[dim] = mean(HIGHER_ORDER[dim].map((id) => combined[id]))
  const dominantHigher = Object.keys(higher).sort((a, b) => higher[b] - higher[a])[0]

  // Cross-signal convergence: Pearson r between the two signals across values.
  // This is a heuristic, *uncalibrated* confidence indicator (see plan §Caveats).
  let convergence = null
  if (zSignals.length === 2) {
    convergence = pearson(VALUE_IDS.map((id) => zSignals[0][id]), VALUE_IDS.map((id) => zSignals[1][id]))
  }

  // Per-value confidence from sign agreement + strength across signals.
  /** @type {Record<string, 'high'|'medium'|'low'|'single'>} */ const valueConfidence = {}
  for (const id of VALUE_IDS) {
    if (zSignals.length < 2) { valueConfidence[id] = 'single'; continue }
    const a = zSignals[0][id]; const b = zSignals[1][id]
    const agree = Math.sign(a) === Math.sign(b)
    if (agree && Math.abs(a) > 0.4 && Math.abs(b) > 0.4) valueConfidence[id] = 'high'
    else if (agree) valueConfidence[id] = 'medium'
    else valueConfidence[id] = 'low'
  }

  // Tensions: opposing values BOTH clearly above the person's average.
  const tensions = []
  for (const [a, b] of OPPOSING_PAIRS) {
    if (combined[a] > 0.4 && combined[b] > 0.4) {
      tensions.push({ a, b, strength: Math.min(combined[a], combined[b]) })
    }
  }
  tensions.sort((p, q) => q.strength - p.strength)

  return {
    combined,
    ranked,
    top: ranked.slice(0, 3),
    bottom: ranked.slice(-2),
    circumplex: { x, y, angle, magnitude, quadrant: quadrantForAngle(angle) },
    higher,
    dominantHigher,
    convergence,
    valueConfidence,
    tensions,
    signalCount: zSignals.length,
  }
}

/** Nearest higher-order apex for a circumplex angle. */
export function quadrantForAngle(angle) {
  let bestDim = 'self_transcendence'; let bestDist = Infinity
  for (const dim of Object.keys(HIGHER_ORDER_META)) {
    const apex = HIGHER_ORDER_META[dim].apex
    let diff = (((angle - apex) % 360) + 360) % 360
    if (diff > 180) diff = 360 - diff // shortest angular distance, 0..180
    if (diff < bestDist) { bestDist = diff; bestDim = dim }
  }
  return bestDim
}

/** Convenience: full pipeline from raw responses + content. */
export function analyze({ portraitItems, portraitResponses, maxdiffBlocks, maxdiffChoices }) {
  const portrait = portraitItems && portraitResponses ? scorePortrait(portraitItems, portraitResponses) : null
  const maxdiff = maxdiffBlocks && maxdiffChoices ? scoreMaxDiff(maxdiffBlocks, maxdiffChoices) : null
  return { portrait, maxdiff, profile: buildProfile({ portrait, maxdiff }) }
}

export const _internals = { mean, sd, zmap, pearson, clamp }
