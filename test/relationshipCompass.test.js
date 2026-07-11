// @ts-check
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MAXDIFF_BLOCKS, analyze, buildProfile, scoreTiers,
  DIMENSIONS, relationshipCompass, relationshipSignal, loveInsights,
} from '../engine/index.js'
import { PORTRAIT_ITEMS } from '../engine/portraitItems.js'
import { makeRespondent, ARCHETYPES as SYNTH } from '../demo/synthetic.js'

const profileFor = (weights) => {
  const r = makeRespondent(weights)
  return analyze({
    portraitItems: PORTRAIT_ITEMS, portraitResponses: r.portraitResponses,
    maxdiffBlocks: MAXDIFF_BLOCKS, maxdiffChoices: r.maxdiffChoices,
  }).profile
}

test('compass: 5 dimensions, each with reflection + talk + a side', () => {
  assert.equal(DIMENSIONS.length, 5)
  const compass = relationshipCompass(profileFor(SYNTH.caregiver))
  assert.equal(compass.length, 5)
  for (const d of compass) {
    assert.ok(['left', 'center', 'right'].includes(d.side))
    assert.ok(d.reflection.length > 10 && d.talk.length > 10)
  }
})

test('GUARDRAIL: compass + loveInsights never contain scores, %, partner-shopping, or clinical vocabulary', () => {
  for (const w of [SYNTH.caregiver, SYNTH.achiever, SYNTH.traditionalist, SYNTH.conflicted, {}]) {
    const p = profileFor(w)
    const text = JSON.stringify(relationshipCompass(p)) + JSON.stringify(relationshipSignal(p)) + JSON.stringify(loveInsights(p))
    assert.ok(!/%/.test(text), 'no percentages')
    assert.ok(!/ideal partner|best match|compatib|soulmate/i.test(text), 'no predictive partner-matching language')
    assert.ok(!/look for a partner|look for someone|be wary of a|avoidant|attachment/i.test(text), 'no partner-selection prescriptions or clinical vocabulary')
  }
})

test('shared_meaning is pole-aware: a polarized worldview reads as strong, not center', () => {
  // Devout traditionalist: tradition at the top, universalism at the bottom —
  // the (trad+univ)/2 average used to cancel to "center" for exactly this user.
  const tradFirst = buildProfile({ tiers: scoreTiers({ tradition: 'most', security: 'most', universalism: 'least', stimulation: 'least' }) })
  const dim = relationshipCompass(tradFirst).find((d) => d.key === 'shared_meaning')
  assert.equal(dim.side, 'right', `polarized traditionalist must read as strong worldview (got ${dim.side})`)
  assert.ok(/tradition/i.test(dim.reflection), 'reflection is anchored to the tradition pole')

  // Committed activist: universalism top, tradition bottom — same fix, other pole.
  const univFirst = buildProfile({ tiers: scoreTiers({ universalism: 'most', benevolence: 'most', tradition: 'least', power: 'least' }) })
  const dim2 = relationshipCompass(univFirst).find((d) => d.key === 'shared_meaning')
  assert.equal(dim2.side, 'right')
  assert.ok(/fair|everyone/i.test(dim2.reflection), 'reflection is anchored to the universalism pole')
})

test('caregiver leans relationship-first on Ambition↔Connection and high caretaking', () => {
  const compass = relationshipCompass(profileFor(SYNTH.caregiver))
  const ambition = compass.find((d) => d.key === 'ambition_connection')
  const caretaking = compass.find((d) => d.key === 'caretaking')
  assert.equal(ambition.side, 'left') // left = relationship-first
  assert.equal(caretaking.side, 'right') // right = strong caregiver
})

test('achiever leans achievement-driven on Ambition↔Connection', () => {
  const compass = relationshipCompass(profileFor(SYNTH.achiever))
  const ambition = compass.find((d) => d.key === 'ambition_connection')
  assert.equal(ambition.side, 'right')
})

test('relationshipSignal flags the self-transcendence level effect for caregivers', () => {
  const sig = relationshipSignal(profileFor(SYNTH.caregiver))
  assert.equal(sig.strength, 'high')
  assert.ok(/about you|your own/i.test(sig.text), 'framed as self-insight, not partner prediction')
})
