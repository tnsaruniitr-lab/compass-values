// @ts-check
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PORTRAIT_ITEMS, MAXDIFF_BLOCKS, analyze,
  DIMENSIONS, relationshipCompass, relationshipSignal,
} from '../engine/index.js'
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

test('GUARDRAIL: compass output never contains a score, %, or "ideal partner"', () => {
  for (const w of [SYNTH.caregiver, SYNTH.achiever, SYNTH.traditionalist, SYNTH.conflicted]) {
    const text = JSON.stringify(relationshipCompass(profileFor(w))) + JSON.stringify(relationshipSignal(profileFor(w)))
    assert.ok(!/%/.test(text), 'no percentages')
    assert.ok(!/ideal partner|best match|compatib|soulmate/i.test(text), 'no predictive partner-matching language')
  }
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
