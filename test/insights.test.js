// @ts-check
import test from 'node:test'
import assert from 'node:assert/strict'
import { VALUE_IDS, buildProfile, scoreTiers, scoreRanking } from '../engine/index.js'
import { PAIR_BANK, DEEP_BANK, ASPECT_BANK } from '../engine/insightBank.js'
import { pairKey, pairSignature, deriveAspects, distinctiveSplit, deepReads } from '../engine/insights.js'

const bankText = JSON.stringify(PAIR_BANK) + JSON.stringify(DEEP_BANK) + JSON.stringify(ASPECT_BANK)

test('pair bank: complete — one entry for every unordered pair of the 10 values', () => {
  let n = 0
  for (let i = 0; i < VALUE_IDS.length; i++) {
    for (let j = i + 1; j < VALUE_IDS.length; j++) {
      const k = pairKey(VALUE_IDS[i], VALUE_IDS[j])
      const e = PAIR_BANK[k]
      assert.ok(e, `missing pair ${k}`)
      assert.ok(e.epithet.length > 5 && e.essence.length > 60 && e.shadow.length > 30, `${k} entry is substantial`)
      n++
    }
  }
  assert.equal(n, 45)
})

test('deep bank: all 10 values, each with goal + 3 shows_up + shadow + misread', () => {
  for (const id of VALUE_IDS) {
    const e = DEEP_BANK[id]
    assert.ok(e, `missing deep read for ${id}`)
    assert.equal(e.shows_up.length, 3, `${id} has 3 shows_up bullets`)
    assert.ok(e.goal.length > 20 && e.shadow.length > 20 && e.misread.length > 15)
  }
})

test('aspect bank: 5 aspects, every rule variant has copy, mixed/balanced present', () => {
  assert.equal(ASPECT_BANK.length, 5)
  const need = {
    decide: ['own_compass', 'consult_then_choose', 'weigh_and_secure', 'fast_and_bold', 'mixed'],
    conflict: ['direct_contender', 'bridge_builder', 'principle_stand', 'de_escalator', 'mixed'],
    stress: ['tighten_control', 'break_away', 'over_give', 'grind_harder', 'mixed'],
    fuel: ['openness', 'self_enhancement', 'conservation', 'self_transcendence', 'balanced'],
    risk: ['leap', 'calculated', 'protective', 'mixed'],
  }
  for (const [key, ids] of Object.entries(need)) {
    const a = ASPECT_BANK.find((x) => x.key === key)
    assert.ok(a, `aspect ${key} present`)
    for (const id of ids) {
      const v = a.variants.find((x) => x.id === id)
      assert.ok(v && v.body.length > 80, `${key}.${id} has substantial copy`)
    }
  }
})

test('GUARDRAILS: no percentages, no Title-Case type brands, no always/never in any bank copy', () => {
  assert.ok(!/%/.test(bankText), 'no percentages')
  assert.ok(!/You are The [A-Z]/.test(bankText), 'no type-label framing')
  assert.ok(!/\b(always|never) (be|do|will)\b/i.test(bankText), 'no absolutes')
})

test('pairSignature returns the entry for the actual top-2, either order', () => {
  const p1 = buildProfile({ tiers: scoreTiers({ benevolence: 'most', self_direction: 'most', power: 'least', tradition: 'least' }) })
  const sig = pairSignature(p1)
  assert.ok(sig && sig.epithet && sig.essence)
  assert.ok([sig.a, sig.b].includes(p1.ranked[0]) && [sig.a, sig.b].includes(p1.ranked[1]))
})

test('deriveAspects: 5 aspects, deterministic picks with provenance, caregiver → bridge_builder/over_give', () => {
  const caregiver = buildProfile({ tiers: scoreTiers({ benevolence: 'most', universalism: 'most', conformity: 'most', power: 'least', achievement: 'least', stimulation: 'least' }) })
  const aspects = deriveAspects(caregiver)
  assert.equal(aspects.length, 5)
  const byKey = Object.fromEntries(aspects.map((a) => [a.key, a]))
  assert.equal(byKey.conflict.variant.id, 'bridge_builder')
  assert.equal(byKey.stress.variant.id, 'over_give')
  assert.equal(byKey.fuel.variant.id, 'self_transcendence')
  for (const a of aspects) {
    assert.ok(a.variant.body.length > 80)
    assert.ok(Array.isArray(a.drivers))
  }
})

test('deriveAspects: symmetric profile → honest mixed variants, not manufactured leans', () => {
  const flat = buildProfile({ tiers: scoreTiers({ self_direction: 'most', security: 'most', stimulation: 'least', conformity: 'least' }) })
  const aspects = deriveAspects(flat)
  const mixedCount = aspects.filter((a) => a.variant.id === 'mixed' || a.variant.id === 'balanced').length
  assert.ok(mixedCount >= 1, `symmetric profile should produce at least one mixed/balanced read (got ${mixedCount})`)
})

test('distinctiveSplit: fires on a genuine neighbour split, silent on a smooth profile', () => {
  // benevolence top + universalism bottom-ish = adjacent neighbours split hard
  const split = buildProfile({ tiers: scoreTiers({ benevolence: 'most', tradition: 'most', universalism: 'least', hedonism: 'least' }) })
  const sp = distinctiveSplit(split)
  assert.ok(sp && sp.text.includes('neighbours'), 'split detected with explainer text')
  // genuinely smooth circular profile (cosine around the circle: neighbours
  // move together, including across the wrap-around seam) → silent
  const scores = {}
  VALUE_IDS.forEach((id, i) => { scores[id] = Math.cos((2 * Math.PI * i) / 10) })
  const smooth = buildProfile({ tiers: { scores, answered: 10 } })
  const sp2 = distinctiveSplit(smooth)
  assert.equal(sp2, null)
})

test('deepReads returns top-3 with names in rank order', () => {
  const p = buildProfile({ tiers: scoreTiers({ achievement: 'most', power: 'most', tradition: 'least' }) })
  const reads = deepReads(p, 3)
  assert.equal(reads.length, 3)
  assert.equal(reads[0].id, p.ranked[0])
  assert.ok(reads[0].shows_up.length === 3)
})
