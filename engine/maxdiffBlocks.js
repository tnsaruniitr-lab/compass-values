// @ts-check
/**
 * Forced-choice / best–worst (MaxDiff) blocks over the 10 values.
 *
 * Forcing values to compete under scarcity ("which matters MOST / LEAST")
 * removes the "everything is important" non-discrimination of Likert ratings
 * and equalises social desirability across options — the single best-evidenced
 * lever for surfacing *operative* priorities (see RESEARCH_AND_PLAN.md §4).
 *
 * Block design: cyclic stride design. With n=10, size=4, stride=3 each value
 * appears in exactly 4 blocks, spread apart (no two adjacent circle neighbours
 * dominate a block). NOTE: naive best–worst counts are ipsative; a production
 * build should upgrade to Thurstonian-IRT scoring (see the plan).
 *
 * @typedef {import('./values.js').ValueId} ValueId
 * @typedef {Object} MaxDiffBlock
 * @property {string} id
 * @property {ValueId[]} valueIds
 */
import { VALUE_IDS } from './values.js'

/**
 * @param {ValueId[]} ids
 * @param {number} size
 * @param {number} stride
 * @returns {MaxDiffBlock[]}
 */
export function generateBlocks(ids = VALUE_IDS, size = 4, stride = 3) {
  const n = ids.length
  /** @type {MaxDiffBlock[]} */
  const blocks = []
  for (let i = 0; i < n; i++) {
    /** @type {ValueId[]} */
    const set = []
    for (let j = 0; j < size; j++) set.push(ids[(i + j * stride) % n])
    blocks.push({ id: `b${i + 1}`, valueIds: set })
  }
  return blocks
}

/** @type {MaxDiffBlock[]} */
export const MAXDIFF_BLOCKS = generateBlocks()
