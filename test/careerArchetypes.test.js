// @ts-check
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PORTRAIT_ITEMS, MAXDIFF_BLOCKS, VALUE_BY_ID, analyze,
  ARCHETYPES, rankArchetypes, careerReport, matchBand,
} from '../engine/index.js'
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

test('matchBand thresholds behave', () => {
  assert.equal(matchBand(0.8), 'strong')
  assert.equal(matchBand(0.4), 'clear')
  assert.equal(matchBand(0.15), 'slight')
  assert.equal(matchBand(-0.2), 'weak')
})
