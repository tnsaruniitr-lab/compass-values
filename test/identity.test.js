// @ts-check
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PORTRAIT_ITEMS, MAXDIFF_BLOCKS, analyze,
  synthesizeIdentity, workInsights, loveInsights,
} from '../engine/index.js'
import { makeRespondent, ARCHETYPES as SYNTH } from '../demo/synthetic.js'

const profileFor = (weights) => {
  const r = makeRespondent(weights)
  return analyze({
    portraitItems: PORTRAIT_ITEMS, portraitResponses: r.portraitResponses,
    maxdiffBlocks: MAXDIFF_BLOCKS, maxdiffChoices: r.maxdiffChoices,
  }).profile
}

const KNOWN = new Set([
  'The Free Idealist', 'The Restless Explorer', 'The Bold Trailblazer',
  'The Quiet Idealist', 'The Balanced Navigator', 'The Driven Achiever',
  'The Loyal Guardian', 'The Steady Anchor', 'The Determined Builder',
])

test('synthesizeIdentity returns a known name, essence, traits, and a portrait', () => {
  for (const w of [SYNTH.caregiver, SYNTH.achiever, SYNTH.traditionalist, SYNTH.conflicted]) {
    const id = synthesizeIdentity(profileFor(w))
    assert.ok(KNOWN.has(id.name), `unexpected name ${id.name}`)
    assert.ok(id.essence.length > 5 && id.portrait.length > 40)
    assert.equal(id.traits.length, 3)
    // portrait should weave in the top value name
    assert.ok(id.portrait.includes(id.traits[0]), 'portrait references top value')
  }
})

test('caregiver → an Idealist/Guardian identity; achiever → Achiever/Builder/Trailblazer', () => {
  assert.ok(/Idealist|Guardian/.test(synthesizeIdentity(profileFor(SYNTH.caregiver)).name))
  assert.ok(/Achiever|Builder|Trailblazer/.test(synthesizeIdentity(profileFor(SYNTH.achiever)).name))
})

test('workInsights gives 3 thrive + 2 drains, all non-empty strings, no %', () => {
  const w = workInsights(profileFor(SYNTH.achiever))
  assert.equal(w.thrive.length, 3)
  assert.equal(w.drains.length, 2)
  for (const s of [...w.thrive, ...w.drains]) { assert.ok(typeof s === 'string' && s.length > 5); assert.ok(!/%/.test(s)) }
})

test('loveInsights gives a summary + look-for + be-wary, with guardrails', () => {
  for (const wt of [SYNTH.caregiver, SYNTH.achiever, SYNTH.traditionalist]) {
    const li = loveInsights(profileFor(wt))
    assert.ok(li.summary.length > 10)
    assert.ok(li.lookFor.length >= 1 && li.beWary.length >= 1)
    const text = JSON.stringify(li)
    assert.ok(!/%|soulmate|ideal partner is|guaranteed|will last/i.test(text), 'no predictive partner-matching claims')
  }
})
