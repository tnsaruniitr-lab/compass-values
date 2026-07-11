// @ts-check
import test from 'node:test'
import assert from 'node:assert/strict'
import { INTEREST_ITEMS, RIASEC_META, scoreInterests } from '../engine/interests.js'
import {
  ARCHETYPES, ARCHETYPE_ACTIONS, archetypeLetters, interestMatch,
  rankArchetypes, careerReport, blendBand, matchBand,
  BLEND_W_VALUES, BLEND_W_INTERESTS,
} from '../engine/careerArchetypes.js'
import { buildProfile, scoreTiers, VALUE_BY_ID } from '../engine/index.js'

test('interest items: 12 total, exactly 2 per RIASEC letter, all fields present', () => {
  assert.equal(INTEREST_ITEMS.length, 12)
  const counts = {}
  for (const it of INTEREST_ITEMS) {
    assert.ok(it.id && it.text.length > 10 && it.emoji, `${it.id} complete`)
    assert.ok(RIASEC_META[it.riasec], `${it.id} has a valid letter`)
    counts[it.riasec] = (counts[it.riasec] || 0) + 1
  }
  for (const L of ['R', 'I', 'A', 'S', 'E', 'C']) assert.equal(counts[L], 2, `${L} has 2 items`)
})

test('scoreInterests: per-letter means in [−1,1], answered counts, empty → zeros', () => {
  const all = {}
  for (const it of INTEREST_ITEMS) all[it.id] = it.riasec === 'R' ? 1 : it.riasec === 'S' ? -1 : 0
  const s = scoreInterests(all)
  assert.equal(s.answered, 12)
  assert.equal(s.riasec.R, 1)
  assert.equal(s.riasec.S, -1)
  assert.equal(s.riasec.A, 0)
  const empty = scoreInterests({})
  assert.equal(empty.answered, 0)
  assert.equal(empty.riasec.E, 0)
})

test('every archetype maps to valid RIASEC letters and has an action + O*NET link', () => {
  for (const a of ARCHETYPES) {
    const letters = archetypeLetters(a)
    assert.ok(letters.length >= 1, `${a.key} has letters`)
    for (const L of letters) assert.ok('RIASEC'.includes(L))
    const extra = ARCHETYPE_ACTIONS[a.key]
    assert.ok(extra && extra.action.length > 20, `${a.key} has a concrete action`)
    assert.ok(/^https:\/\/www\.onetonline\.org\//.test(extra.onet), `${a.key} links to O*NET`)
    assert.ok(!/%/.test(extra.action), 'actions carry no fake percentages')
  }
})

test('WITH interests: Maker competes uncapped when hands-on answers back it', () => {
  // Maker-shaped values…
  const tiers = scoreTiers({ self_direction: 'most', achievement: 'most', security: 'most', benevolence: 'least', universalism: 'least' })
  const profile = buildProfile({ tiers })
  // …plus loving both hands-on items and disliking people work.
  const likesR = scoreInterests(Object.fromEntries(INTEREST_ITEMS.map((it) =>
    [it.id, it.riasec === 'R' ? 1 : it.riasec === 'S' ? -1 : 0])))
  const ranked = rankArchetypes(profile, likesR)
  const maker = ranked.find((a) => a.key === 'maker')
  assert.equal(ranked[0].key, 'maker', 'maker can now win the primary slot')
  assert.ok(!maker.caveat, 'no values-cannot-see caveat once interests are measured')
  assert.ok(['strong', 'clear'].includes(maker.band), `maker earns a real band (got ${maker.band})`)
  const report = careerReport(profile, VALUE_BY_ID, 3, likesR)
  assert.equal(report.usedInterests, true)
  assert.equal(report[0].key, 'maker')
})

test('WITHOUT interests (or too few answers): Maker stays capped and demoted', () => {
  const tiers = scoreTiers({ self_direction: 'most', achievement: 'most', security: 'most', benevolence: 'least', universalism: 'least' })
  const profile = buildProfile({ tiers })
  const fewAnswers = scoreInterests({ r1: 1, r2: 1 }) // answered=2 < 8 → not used
  for (const interests of [null, fewAnswers]) {
    const report = careerReport(profile, VALUE_BY_ID, 3, interests)
    assert.equal(report.usedInterests, false)
    assert.notEqual(report[0].key, 'maker')
  }
})

test('blend arithmetic: score = 0.7·valuesR + 0.3·interestFit, and disagreement drags it down', () => {
  const tiers = scoreTiers({ self_direction: 'most', stimulation: 'most', conformity: 'least', tradition: 'least' })
  const profile = buildProfile({ tiers })
  const hatesA = scoreInterests(Object.fromEntries(INTEREST_ITEMS.map((it) =>
    [it.id, it.riasec === 'A' ? -1 : 0])))
  const ranked = rankArchetypes(profile, hatesA)
  const creative = ranked.find((a) => a.key === 'creative')
  assert.ok(Math.abs(creative.score - (BLEND_W_VALUES * creative.valuesR + BLEND_W_INTERESTS * creative.interestFit)) < 1e-9)
  assert.ok(creative.score < creative.valuesR, 'disliking the day-to-day pulls the blend below values alone')
})

test('blendBand cutoffs are the noise-calibrated ones (p75/p90/p95)', () => {
  assert.equal(blendBand(0.70), 'strong')
  assert.equal(blendBand(0.62), 'clear')
  assert.equal(blendBand(0.52), 'slight')
  assert.equal(blendBand(0.45), 'weak')
  // and the values-only bands are untouched
  assert.equal(matchBand(0.8), 'strong')
})
