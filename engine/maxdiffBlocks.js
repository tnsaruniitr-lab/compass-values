// @ts-check
/**
 * Forced-choice / best–worst (MaxDiff) blocks over the 10 values.
 *
 * Forcing values to compete under scarcity ("which matters MOST / LEAST")
 * removes the "everything is important" non-discrimination of Likert ratings
 * and equalises social desirability across options — the single best-evidenced
 * lever for surfacing *operative* priorities (see RESEARCH_AND_PLAN.md §4).
 *
 * Block design: cyclic offset design {i, i+1, i+3, i+5}. With n=10 each value
 * appears in exactly 4 blocks, and every circular distance 1–5 is represented
 * within blocks — crucially including distance-5 pairs, the theory's DIRECT
 * OPPOSITES (e.g. Self-Direction vs Security), so the trade-offs the product
 * cares most about are actually forced. Each opposite pair co-occurs in
 * exactly 2 of the 10 blocks. (The previous stride-3 design never put
 * opposites in the same block.) NOTE: naive best–worst counts are ipsative;
 * a production build should upgrade to Thurstonian-IRT scoring (see the plan).
 *
 * @typedef {import('./values.js').ValueId} ValueId
 * @typedef {Object} MaxDiffBlock
 * @property {string} id
 * @property {ValueId[]} valueIds
 */
import { VALUE_IDS } from './values.js'

/** Circular offsets of the members of block i. Covers pair distances 1,2,2,3,4,5. */
const OFFSETS = [0, 1, 3, 5]

/**
 * @param {ValueId[]} ids
 * @param {number[]} offsets
 * @returns {MaxDiffBlock[]}
 */
export function generateBlocks(ids = VALUE_IDS, offsets = OFFSETS) {
  const n = ids.length
  /** @type {MaxDiffBlock[]} */
  const blocks = []
  for (let i = 0; i < n; i++) {
    const set = /** @type {ValueId[]} */ (offsets.map((o) => ids[(i + o) % n]))
    blocks.push({ id: `b${i + 1}`, valueIds: set })
  }
  return blocks
}

/** @type {MaxDiffBlock[]} */
export const MAXDIFF_BLOCKS = generateBlocks()
