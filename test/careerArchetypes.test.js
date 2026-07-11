// @ts-check
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MAXDIFF_BLOCKS, VALUE_BY_ID, analyze, buildProfile, scoreTiers,
  ARCHETYPES, rankArchetypes, careerReport, matchBand,
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

test('archetypes: 8 defined, each with a non-empty prototype + roles', () => {
  assert.equal(ARCHETYPES.length, 8)
  for (const a of ARCHETYPES) {
    assert.ok(a.key && a.name && a.tagline)
    assert.ok(Object.keys(a.proto).length >= 3, `${a.key} has a real prototype`)
    assert.ok(a.roles.length >= 3, `${a.key} has example roles`)
  }
})

test('rankArchetypes returns all 8, sorted by score desc', () => {
  const ranked = rankArchetypes(profileFor(SYNTH.achiever))
  assert.equal(ranked.length, 8)
  for (let i = 1; i < ranked.length; i++) assert.ok(ranked[i - 1].score >= ranked[i].score)
})

test('achiever profile → Founder or Operator near the top', () => {
  const top2 = rankArchetypes(profileFor(SYNTH.achiever)).slice(0, 2).map((a) => a.key)
  assert.ok(top2.includes('founder') || top2.includes('leader'), `got ${top2}`)
})

test('caregiver profile → Helper near the top', () => {
  const top2 = rankArchetypes(profileFor(SYNTH.caregiver)).slice(0, 2).map((a) => a.key)
  assert.ok(top2.includes('helper'), `got ${top2}`)
})

test('traditionalist profile → Steady Professional near the top', () => {
  const top3 = rankArchetypes(profileFor(SYNTH.traditionalist)).slice(0, 3).map((a) => a.key)
  assert.ok(top3.includes('steady'), `got ${top3}`)
})

test('careerReport gives reasoning strings and ranks, no percentage leakage', () => {
  const report = careerReport(profileFor(SYNTH.achiever), VALUE_BY_ID, 3)
  assert.equal(report.length, 3)
  for (const r of report) {
    assert.ok(r.reasoning.length > 20, 'has a reasoning sentence')
    assert.ok(['strong', 'clear', 'slight', 'weak'].includes(r.band))
    assert.ok(!/%/.test(r.reasoning), 'reasoning must not contain a percentage')
  }
})

test('matchBand thresholds are noise-calibrated (see careerArchetypes.js provenance)', () => {
  assert.equal(matchBand(0.8), 'strong')   // > p95 of random input
  assert.equal(matchBand(0.7), 'clear')    // > p90 of random input
  assert.equal(matchBand(0.6), 'slight')   // > p75 of random input
  assert.equal(matchBand(0.4), 'weak')     // median random sort scores ~0.43
  assert.equal(matchBand(-0.2), 'weak')
})

test('Maker (needsInterest) is capped at "slight" and never takes the primary slot', () => {
  // A profile shaped exactly like the Maker prototype: values alone cannot
  // justify a confident Realistic verdict, so the band must be capped.
  const tiers = scoreTiers({ self_direction: 'most', achievement: 'most', security: 'most', benevolence: 'least', universalism: 'least' })
  const profile = buildProfile({ tiers })
  const maker = rankArchetypes(profile).find((a) => a.key === 'maker')
  assert.ok(maker.score > 0.75, `sanity: maker should correlate strongly (got ${maker.score})`)
  assert.equal(maker.band, 'slight')
  assert.ok(maker.caveat && maker.caveat.length > 10, 'capped Maker carries an honest caveat')
  const report = careerReport(profile, VALUE_BY_ID, 3)
  assert.notEqual(report[0].key, 'maker', 'primary slot must be a values-detectable archetype')
})

test('careerReport exposes a lowSignal abstain flag', () => {
  const strong = careerReport(profileFor(SYNTH.achiever), VALUE_BY_ID, 3)
  assert.equal(typeof strong.lowSignal, 'boolean')
  assert.equal(strong.lowSignal, false, 'a coherent synthetic profile is not low-signal')
  // Near-flat profile → indistinguishable from noise → must abstain.
  const flat = careerReport(buildProfile({ tiers: scoreTiers({ hedonism: 'most' }) }), VALUE_BY_ID, 3)
  assert.equal(typeof flat.lowSignal, 'boolean')
})

test('explainMatch includes the honest-contrast clause when a salient value disagrees', () => {
  // Founder prototype wants LOW security; give the user HIGH security + high founder drivers.
  const tiers = scoreTiers({ self_direction: 'most', achievement: 'most', security: 'most', tradition: 'least', universalism: 'least' })
  const profile = buildProfile({ tiers })
  const report = careerReport(profile, VALUE_BY_ID, 8)
  const founder = report.find((a) => a.key === 'founder')
  assert.ok(founder, 'founder present in full report')
  assert.ok(/cuts against this/.test(founder.reasoning), `expected contrast clause, got: ${founder.reasoning}`)
})
