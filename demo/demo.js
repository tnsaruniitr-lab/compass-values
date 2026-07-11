// @ts-check
/** CLI demo: run synthetic archetypes through the engine and print profiles. */
import { MAXDIFF_BLOCKS, analyze, valueById, HIGHER_ORDER_META } from '../engine/index.js'
import { PORTRAIT_ITEMS } from '../engine/portraitItems.js'
import { makeRespondent, ARCHETYPES } from './synthetic.js'

const bar = (v, lo = -1.6, hi = 1.6, width = 22) => {
  const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo)))
  const n = Math.round(t * width)
  return '█'.repeat(n) + '·'.repeat(width - n)
}

for (const [name, weights] of Object.entries(ARCHETYPES)) {
  const r = makeRespondent(weights)
  const { profile } = analyze({
    portraitItems: PORTRAIT_ITEMS, portraitResponses: r.portraitResponses,
    maxdiffBlocks: MAXDIFF_BLOCKS, maxdiffChoices: r.maxdiffChoices,
  })
  console.log(`\n\x1b[1m═══ ${name.toUpperCase()} ═══\x1b[0m`)
  console.log(`Dominant orientation : ${HIGHER_ORDER_META[profile.dominantHigher].name}`)
  console.log(`Circumplex direction : ${profile.circumplex.angle.toFixed(0)}°  → ${HIGHER_ORDER_META[profile.circumplex.quadrant].name}`)
  console.log(`Cross-signal agreement: ${profile.convergence == null ? 'n/a' : (profile.convergence).toFixed(2)} (heuristic)\n`)
  console.log('  Relative priority (centred / triangulated):')
  for (const id of profile.ranked) {
    const v = valueById(id)
    const conf = profile.valueConfidence[id]
    console.log(`   ${v.name.padEnd(15)} ${bar(profile.combined[id])} ${profile.combined[id].toFixed(2).padStart(6)}  [${conf}]`)
  }
  if (profile.tensions.length) {
    console.log('\n  ⚡ Tensions (opposing values both prized):')
    for (const t of profile.tensions) console.log(`   ${valueById(t.a).name} ⟷ ${valueById(t.b).name}`)
  }
}
console.log('\nNote: synthetic demo data. Items are original prototypes, not validated. See RESEARCH_AND_PLAN.md.')
