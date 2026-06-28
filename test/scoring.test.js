// @ts-check
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  VALUE_IDS, PORTRAIT_ITEMS, MAXDIFF_BLOCKS, OPPOSING_PAIRS,
  scorePortrait, scoreMaxDiff, scoreTiers, scoreRanking, buildProfile, analyze, quadrantForAngle, valueById,
} from '../engine/index.js'
import { makeRespondent, ARCHETYPES } from '../demo/synthetic.js'

test('scoreTiers: most=+1, least=−1, neutral=0; answered counts placements', () => {
  const { scores, answered } = scoreTiers({ benevolence: 'most', universalism: 'most', power: 'least' })
  assert.equal(scores.benevolence, 1)
  assert.equal(scores.universalism, 1)
  assert.equal(scores.power, -1)
  assert.equal(scores.security, 0)
  assert.equal(answered, 3)
})

test('scoreRanking: top of the order scores highest, bottom lowest', () => {
  const order = ['benevolence', 'universalism', 'self_direction', 'stimulation', 'hedonism',
    'security', 'conformity', 'tradition', 'achievement', 'power']
  const { scores, answered } = scoreRanking(order)
  assert.equal(answered, 10)
  assert.ok(Math.abs(scores.benevolence - 1) < 1e-9, 'top = +1')
  assert.ok(Math.abs(scores.power + 1) < 1e-9, 'bottom = −1')
  assert.ok(scores.benevolence > scores.security && scores.security > scores.power)
  const profile = buildProfile({ tiers: scoreRanking(order) })
  assert.equal(profile.top[0], 'benevolence')
  assert.equal(profile.dominantHigher, 'self_transcendence')
})

test('buildProfile from a tier sort ranks most→least and finds the right quadrant', () => {
  const tiers = scoreTiers({
    benevolence: 'most', universalism: 'most', self_direction: 'most',
    power: 'least', achievement: 'least', hedonism: 'least',
  })
  const profile = buildProfile({ tiers })
  assert.equal(profile.signalCount, 1)
  assert.ok(profile.top.includes('benevolence') || profile.top.includes('universalism'))
  assert.ok(profile.bottom.includes('power') || profile.bottom.includes('achievement'))
  assert.equal(profile.dominantHigher, 'self_transcendence')
})

test('model: 10 values, distinct angles, correct oppositions', () => {
  assert.equal(VALUE_IDS.length, 10)
  const angles = new Set(VALUE_IDS.map((id) => valueById(id).angle))
  assert.equal(angles.size, 10)
  // opposing pairs should sit ~180° apart on the circumplex
  for (const [a, b] of OPPOSING_PAIRS) {
    const normDiff = (((valueById(a).angle - valueById(b).angle) % 360) + 360) % 360
    assert.ok(Math.abs(normDiff - 180) < 1e-6, `${a}/${b} should be 180° apart (got ${normDiff})`)
  }
})

test('maxdiff block design is balanced (each value appears 4×, blocks size 4)', () => {
  const count = Object.fromEntries(VALUE_IDS.map((id) => [id, 0]))
  for (const b of MAXDIFF_BLOCKS) {
    assert.equal(new Set(b.valueIds).size, 4, 'block has 4 distinct values')
    for (const v of b.valueIds) count[v]++
  }
  for (const id of VALUE_IDS) assert.equal(count[id], 4, `${id} appears 4×`)
})

test('portrait centering: centred scores sum to ~0', () => {
  const r = makeRespondent(ARCHETYPES.achiever)
  const { centered } = scorePortrait(PORTRAIT_ITEMS, r.portraitResponses)
  const sum = VALUE_IDS.reduce((s, id) => s + centered[id], 0)
  assert.ok(Math.abs(sum) < 1e-9, `sum was ${sum}`)
})

test('maxdiff best–worst scores stay within [-1, 1]', () => {
  const r = makeRespondent(ARCHETYPES.caregiver)
  const { bw } = scoreMaxDiff(MAXDIFF_BLOCKS, r.maxdiffChoices)
  for (const id of VALUE_IDS) assert.ok(bw[id] >= -1 && bw[id] <= 1, `${id} bw=${bw[id]}`)
})

test('caregiver archetype → Self-Transcendence on top, vector points up (~90°)', () => {
  const r = makeRespondent(ARCHETYPES.caregiver)
  const { profile } = analyze({
    portraitItems: PORTRAIT_ITEMS, portraitResponses: r.portraitResponses,
    maxdiffBlocks: MAXDIFF_BLOCKS, maxdiffChoices: r.maxdiffChoices,
  })
  assert.equal(profile.dominantHigher, 'self_transcendence')
  assert.ok(profile.top.includes('benevolence') || profile.top.includes('universalism'))
  // ~90° = up (shortest angular distance to 90° should be small)
  const raw = (((profile.circumplex.angle - 90) % 360) + 360) % 360
  const d = raw > 180 ? 360 - raw : raw
  assert.ok(d < 45, `angle ${profile.circumplex.angle} not near 90° (dist ${d})`)
  assert.equal(profile.circumplex.quadrant, 'self_transcendence')
})

test('achiever archetype → Self-Enhancement dominant, vector points down (~270°)', () => {
  const r = makeRespondent(ARCHETYPES.achiever)
  const { profile } = analyze({
    portraitItems: PORTRAIT_ITEMS, portraitResponses: r.portraitResponses,
    maxdiffBlocks: MAXDIFF_BLOCKS, maxdiffChoices: r.maxdiffChoices,
  })
  assert.equal(profile.dominantHigher, 'self_enhancement')
  assert.ok(profile.top.includes('achievement') || profile.top.includes('power'))
  assert.equal(profile.circumplex.quadrant, 'self_enhancement')
})

test('conflicted archetype surfaces an opposing-value tension', () => {
  const r = makeRespondent(ARCHETYPES.conflicted)
  const { profile } = analyze({
    portraitItems: PORTRAIT_ITEMS, portraitResponses: r.portraitResponses,
    maxdiffBlocks: MAXDIFF_BLOCKS, maxdiffChoices: r.maxdiffChoices,
  })
  assert.ok(profile.tensions.length >= 1, 'expected at least one tension')
  // Self-Direction vs Security is the planted conflict
  const hasSdSe = profile.tensions.some(
    (t) => new Set([t.a, t.b]).has('self_direction') && new Set([t.a, t.b]).has('security'),
  )
  assert.ok(hasSdSe, 'expected Self-Direction ⟷ Security tension')
})

test('two aligned signals → high convergence (heuristic confidence)', () => {
  const r = makeRespondent(ARCHETYPES.traditionalist)
  const { profile } = analyze({
    portraitItems: PORTRAIT_ITEMS, portraitResponses: r.portraitResponses,
    maxdiffBlocks: MAXDIFF_BLOCKS, maxdiffChoices: r.maxdiffChoices,
  })
  assert.equal(profile.signalCount, 2)
  assert.ok(profile.convergence > 0.5, `convergence ${profile.convergence} too low`)
})

test('single signal still produces a valid profile', () => {
  const r = makeRespondent(ARCHETYPES.caregiver)
  const portrait = scorePortrait(PORTRAIT_ITEMS, r.portraitResponses)
  const profile = buildProfile({ portrait })
  assert.equal(profile.signalCount, 1)
  assert.equal(profile.convergence, null)
  assert.equal(profile.valueConfidence.benevolence, 'single')
})

test('quadrantForAngle maps cardinal apexes correctly', () => {
  assert.equal(quadrantForAngle(90), 'self_transcendence')
  assert.equal(quadrantForAngle(270), 'self_enhancement')
  assert.equal(quadrantForAngle(180), 'openness')
  assert.equal(quadrantForAngle(0), 'conservation')
})
