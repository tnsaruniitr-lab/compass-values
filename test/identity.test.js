// @ts-check
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MAXDIFF_BLOCKS, analyze, buildProfile, scoreTiers,
  synthesizeIdentity, workInsights, loveInsights,
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

test('synthesizeIdentity: continuum output — headline, essence, portrait, 2 axes', () => {
  for (const w of [SYNTH.caregiver, SYNTH.achiever, SYNTH.traditionalist, SYNTH.conflicted]) {
    const id = synthesizeIdentity(profileFor(w))
    assert.ok(id.headline.length > 10 && id.essence.length > 20 && id.portrait.length > 40)
    assert.equal(id.traits.length, 3)
    assert.equal(id.axes.length, 2)
    for (const a of id.axes) {
      assert.ok(['left', 'right'].includes(a.side))
      assert.ok(['balanced', 'slight', 'clear'].includes(a.strength))
    }
    // headline is grounded in the user's actual top value
    assert.ok(id.headline.includes(id.traits[0]), `headline "${id.headline}" names the top value`)
    // portrait names what is traded away (honest cost), not only flattery
    assert.ok(/trade away/.test(id.portrait), 'portrait includes the honest cost')
  }
})

test('GUARDRAIL: identity never emits a named type box ("You are The X")', () => {
  for (const w of [SYNTH.caregiver, SYNTH.achiever, SYNTH.traditionalist, SYNTH.conflicted, {}]) {
    const id = synthesizeIdentity(profileFor(w))
    const text = JSON.stringify(id)
    assert.ok(!/The [A-Z][a-z]+ [A-Z][a-z]+/.test(text), `type-label leak in ${text.slice(0, 120)}`)
    assert.ok(!/You are The/i.test(text))
  }
})

test('crown: built from the user’s OWN top+bottom values, never a type label', () => {
  for (const w of [SYNTH.caregiver, SYNTH.achiever, SYNTH.traditionalist]) {
    const p = profileFor(w)
    const id = synthesizeIdentity(p)
    assert.ok(id.crown, 'crown present')
    if (!id.crown.balanced) {
      assert.equal(id.crown.topId, p.top[0], 'crown leads with the user’s actual #1 value')
      assert.equal(id.crown.bottomId, p.bottom[p.bottom.length - 1], 'crown trades the user’s actual last value')
      assert.ok(/^A [a-z]/.test(id.crown.lead), 'crown lead is an adjective phrase, not a proper-noun Type')
      assert.ok(!/The [A-Z]/.test(id.crown.lead), 'no "The Type" label')
    }
  }
})

test('crown softens to balanced when the profile is directionless', () => {
  // symmetric opposites cancel → near-zero circumplex magnitude → no crown identity
  const p = buildProfile({ tiers: scoreTiers({ self_direction: 'most', security: 'most', stimulation: 'least', conformity: 'least' }) })
  const id = synthesizeIdentity(p)
  if (p.circumplex.magnitude < 0.5) assert.equal(id.crown.balanced, true, 'directionless profile gets the balanced crown, not an invented identity')
})

test('symmetric profile → axes report "balanced", not an invented lean', () => {
  // Opposing placements cancel across both axes: no lean exists in the data.
  const tiers = scoreTiers({ self_direction: 'most', security: 'most', stimulation: 'least', conformity: 'least' })
  const id = synthesizeIdentity(buildProfile({ tiers }))
  assert.ok(id.axes.every((a) => a.strength === 'balanced'), `symmetric input must read balanced (got ${JSON.stringify(id.axes.map((a) => a.strength))})`)
  assert.ok(/balance/i.test(id.essence), 'essence hedges instead of asserting a lean')
})

test('workInsights gives 3 thrive + 2 drains, all non-empty strings, no %', () => {
  const w = workInsights(profileFor(SYNTH.achiever))
  assert.equal(w.thrive.length, 3)
  assert.equal(w.drains.length, 2)
  for (const s of [...w.thrive, ...w.drains]) { assert.ok(typeof s === 'string' && s.length > 5); assert.ok(!/%/.test(s)) }
})

test('loveInsights gives summary + noticing + talk, with guardrails', () => {
  for (const wt of [SYNTH.caregiver, SYNTH.achiever, SYNTH.traditionalist]) {
    const li = loveInsights(profileFor(wt))
    assert.ok(li.summary.length > 10)
    assert.ok(li.noticing.length >= 1 && li.talk.length >= 1)
    const text = JSON.stringify(li)
    assert.ok(!/%|soulmate|ideal partner|guaranteed|will last/i.test(text), 'no predictive partner-matching claims')
    assert.ok(!/look for a partner|be wary of a|avoidant|attachment style/i.test(text), 'no partner-shopping or clinical vocabulary')
  }
})
