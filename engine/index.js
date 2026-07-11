// @ts-check
/** Public engine API. Imported by both Node (tests/demo) and the browser UI.
 * NOTE: portraitItems.js is deliberately NOT re-exported — the portrait
 * instrument stays out of the shipped browser bundle until the
 * Schwartz-derived-item licensing question is resolved (RESEARCH_AND_PLAN.md
 * §Caveats D). Tests and demos import it directly from './portraitItems.js'. */
export * from './values.js'
export * from './maxdiffBlocks.js'
export * from './scoring.js'
export * from './interests.js'
export * from './careerArchetypes.js'
export * from './relationshipCompass.js'
export * from './identity.js'
