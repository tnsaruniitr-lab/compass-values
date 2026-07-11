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

/* -------------------------------- tier scoring ----------------------------- */
/**
 * Score a one-screen tier sort: each value is 'most', 'least', or neutral.
 * Returns per-value scores (most = +1, least = −1, neutral = 0) — a single,
 * trade-off-forced signal that feeds buildProfile like the other instruments.
 * @param {Record<string, 'most'|'least'|null|undefined>} assign
 */
export function scoreTiers(assign = {}) {
  /** @type {Record<string, number>} */ const scores = {}
  let answered = 0
  for (const id of VALUE_IDS) {
    const t = assign[id]
    scores[id] = t === 'most' ? 1 : t === 'least' ? -1 : 0
    if (t === 'most' || t === 'least') answered++
  }
  return { scores, answered }
}

/**
 * Score a full drag-ranking: an ordered list of value ids, top = most
 * important → bottom = least. Maps position to a score from +1 (top) to −1
 * (bottom). Returned in the tier-signal shape so it feeds buildProfile.
 * @param {string[]} orderedIds
 */
export function scoreRanking(orderedIds = []) {
  /** @type {Record<string, number>} */ const scores = {}
  for (const id of VALUE_IDS) scores[id] = 0
  const n = orderedIds.length
  orderedIds.forEach((id, i) => { scores[id] = n > 1 ? 1 - (2 * i) / (n - 1) : 0 })
  return { scores, answered: n }
}

/* ------------------------------ profile builder ---------------------------- */
/**
 * @param {{portrait?: ReturnType<typeof scorePortrait>|null, maxdiff?: ReturnType<typeof scoreMaxDiff>|null, tiers?: ReturnType<typeof scoreTiers>|null}} signals
 */
export function buildProfile({ portrait = null, maxdiff = null, tiers = null } = {}) {
  const zSignals = []
  /** Named per-signal z-scores — exposed for the receipts/appendix so a user
   *  can see exactly where their two answers agreed and where they split. */
  const signals = {}
  if (portrait && portrait.answered) { const z = zmap(portrait.centered); zSignals.push(z); signals.portrait = z }
  if (maxdiff && maxdiff.answered) { const z = zmap(maxdiff.bw); zSignals.push(z); signals.maxdiff = z }
  if (tiers && tiers.answered) { const z = zmap(tiers.scores); zSignals.push(z); signals.ranking = z }
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

  // Higher-order dimension scores (mean of member values) + dominant.
  // higherMargin = the gap between the top two dimensions: near-zero means the
  // "dominant" label is a coin flip and the UI must NOT assert a centre of gravity.
  /** @type {Record<string, number>} */ const higher = {}
  for (const dim of Object.keys(HIGHER_ORDER)) higher[dim] = mean(HIGHER_ORDER[dim].map((id) => combined[id]))
  const higherSorted = Object.keys(higher).sort((a, b) => higher[b] - higher[a])
  const dominantHigher = higherSorted[0]
  const higherMargin = higher[higherSorted[0]] - higher[higherSorted[1]]

  // Cross-signal convergence: mean pairwise Pearson r across ALL signal pairs.
  // This is a heuristic, *uncalibrated* confidence indicator (see plan §Caveats).
  let convergence = null
  if (zSignals.length >= 2) {
    const rs = []
    for (let i = 0; i < zSignals.length; i++) {
      for (let j = i + 1; j < zSignals.length; j++) {
        rs.push(pearson(VALUE_IDS.map((id) => zSignals[i][id]), VALUE_IDS.map((id) => zSignals[j][id])))
      }
    }
    convergence = mean(rs)
  }

  // Per-value confidence from sign agreement + strength across ALL signals.
  /** @type {Record<string, 'high'|'medium'|'low'|'single'>} */ const valueConfidence = {}
  for (const id of VALUE_IDS) {
    if (zSignals.length < 2) { valueConfidence[id] = 'single'; continue }
    const zs = zSignals.map((s) => s[id])
    const signs = new Set(zs.map((z) => Math.sign(z)))
    const agree = signs.size === 1
    if (agree && zs.every((z) => Math.abs(z) > 0.4)) valueConfidence[id] = 'high'
    else if (agree) valueConfidence[id] = 'medium'
    else valueConfidence[id] = 'low'
  }

  // Tensions: opposing values the person GLOBALLY prizes — both in their top-4
  // ranking AND both clearly above their own average. Anchoring on the global
  // ranking keeps tensions stable across sessions instead of threshold noise.
  const topSet = new Set(ranked.slice(0, 4))
  const tensions = []
  for (const [a, b] of OPPOSING_PAIRS) {
    if (topSet.has(a) && topSet.has(b) && combined[a] > 0.3 && combined[b] > 0.3) {
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
    higherMargin,
    signals,
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
