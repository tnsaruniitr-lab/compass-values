// @ts-check
/**
 * Work-interests rapid-fire — a 12-item RIASEC (Holland) mini-inventory.
 *
 * WHY THIS EXISTS (spec §A7, research §2.4): values and vocational interests
 * are DIFFERENT constructs. The Realistic ("hands-on / things") dimension has
 * ≈0 correlation with any Schwartz value, yet People–Things is the largest
 * axis of interest variation — so a values-only model is structurally blind
 * there, and honest career reads sometimes have to abstain. Two quick items
 * per RIASEC type give the career module a second, independent signal:
 * enough to unlock Maker honestly and to sharpen "no clear lean" profiles
 * with different evidence instead of more of the same questions.
 *
 * The items are ORIGINAL work-activity statements in the spirit of the
 * public-domain O*NET Interest Profiler (U.S. Department of Labor); they are
 * NOT the O*NET items and are NOT a validated inventory — same honesty rules
 * as the rest of the app.
 *
 * Response scale: +1 "sounds fun" · 0 "not sure" · −1 "not for me".
 *
 * @typedef {'R'|'I'|'A'|'S'|'E'|'C'} RiasecId
 * @typedef {Object} InterestItem
 * @property {string} id
 * @property {RiasecId} riasec
 * @property {string} text
 * @property {string} emoji
 */

export const RIASEC_META = /** @type {Record<RiasecId, {name:string, gloss:string}>} */ ({
  R: { name: 'Hands-on', gloss: 'building, fixing, making physical things work' },
  I: { name: 'Investigative', gloss: 'understanding, analysing, getting to the bottom of things' },
  A: { name: 'Creative', gloss: 'designing, writing, composing — making new things' },
  S: { name: 'People', gloss: 'teaching, helping, caring for people directly' },
  E: { name: 'Persuading', gloss: 'pitching, leading, owning outcomes' },
  C: { name: 'Organising', gloss: 'structure, detail, making processes run clean' },
})

/** @type {InterestItem[]} 12 items, exactly 2 per RIASEC type, shuffled order for variety. */
export const INTEREST_ITEMS = [
  { id: 'r1', riasec: 'R', text: 'Assembling something real with your hands — a shelf, a bike, a machine', emoji: '🔧' },
  { id: 'a1', riasec: 'A', text: 'Designing how something looks, sounds, or reads', emoji: '🎨' },
  { id: 's1', riasec: 'S', text: 'Teaching someone a skill until it finally clicks for them', emoji: '🧑‍🏫' },
  { id: 'e1', riasec: 'E', text: 'Pitching an idea and winning the room over', emoji: '📣' },
  { id: 'i1', riasec: 'I', text: 'Digging into why something works the way it does', emoji: '🔬' },
  { id: 'c1', riasec: 'C', text: 'Bringing clean order to a messy plan or process', emoji: '🗂️' },
  { id: 'r2', riasec: 'R', text: 'Troubleshooting a machine or device that stopped working', emoji: '⚙️' },
  { id: 's2', riasec: 'S', text: 'Being the person someone leans on through a hard week', emoji: '🤝' },
  { id: 'a2', riasec: 'A', text: 'Writing, filming, or composing something of your own', emoji: '✍️' },
  { id: 'c2', riasec: 'C', text: 'Getting the details exactly right, every single time', emoji: '✅' },
  { id: 'e2', riasec: 'E', text: 'Owning a goal end-to-end — the plan, the calls, the result', emoji: '🎯' },
  { id: 'i2', riasec: 'I', text: 'Analysing the numbers to settle an open question', emoji: '📊' },
]

/**
 * Score the rapid-fire answers into per-RIASEC-letter means.
 * @param {Record<string, number>} responses  itemId → −1 | 0 | +1
 * @returns {{riasec: Record<RiasecId, number>, answered: number}}
 */
export function scoreInterests(responses = {}) {
  /** @type {Record<RiasecId, {sum:number, n:number}>} */
  const acc = { R: { sum: 0, n: 0 }, I: { sum: 0, n: 0 }, A: { sum: 0, n: 0 }, S: { sum: 0, n: 0 }, E: { sum: 0, n: 0 }, C: { sum: 0, n: 0 } }
  let answered = 0
  for (const item of INTEREST_ITEMS) {
    const v = responses[item.id]
    if (v === -1 || v === 0 || v === 1) {
      acc[item.riasec].sum += v
      acc[item.riasec].n += 1
      answered += 1
    }
  }
  /** @type {Record<RiasecId, number>} */
  const riasec = /** @type {any} */ ({})
  for (const k of /** @type {RiasecId[]} */ (Object.keys(acc))) riasec[k] = acc[k].n ? acc[k].sum / acc[k].n : 0
  return { riasec, answered }
}
