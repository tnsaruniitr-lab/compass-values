// @ts-check
/**
 * Portrait-style value items (an ORIGINAL, prototype instrument).
 *
 * Format follows the Portrait Values Questionnaire *approach* — a short
 * third-person description of a person's goals, rated "How much like you is
 * this person?" on a 1–6 scale — because indirect portraits are more concrete
 * for laypeople and reduce social-desirability bias vs. rating abstract labels.
 *
 * IMPORTANT: these wordings are original prototype items written for this app.
 * They are NOT the copyrighted PVQ / PVQ-RR items, and they are NOT yet
 * psychometrically validated. For any real claim, license and use a validated
 * instrument. See values-app/RESEARCH_AND_PLAN.md (§Caveats).
 *
 * @typedef {import('./values.js').ValueId} ValueId
 * @typedef {Object} PortraitItem
 * @property {string} id
 * @property {ValueId} valueId
 * @property {string} text
 */

/** 1–6 response anchors. */
export const PORTRAIT_SCALE = [
  { value: 1, label: 'Not like me at all' },
  { value: 2, label: 'Not like me' },
  { value: 3, label: 'A little like me' },
  { value: 4, label: 'Somewhat like me' },
  { value: 5, label: 'Like me' },
  { value: 6, label: 'Very much like me' },
]

/**
 * @type {PortraitItem[]}
 * Tightened set: ONE portrait item per value (10 total) to keep the flow short
 * and low-overload. Pairs with the 10 MaxDiff blocks for a ~2–3 min experience.
 * (A higher-reliability build would restore the second item per value.)
 */
export const PORTRAIT_ITEMS = [
  { id: 'sd1', valueId: 'self_direction', text: 'Coming up with their own ideas and doing things their own way matters a lot to this person.' },
  { id: 'st1', valueId: 'stimulation', text: 'This person looks for excitement and new experiences, even when they are a little risky.' },
  { id: 'he1', valueId: 'hedonism', text: "Enjoying life's pleasures and treating themselves is important to this person." },
  { id: 'ac1', valueId: 'achievement', text: 'This person wants to be successful and to have others recognise their accomplishments.' },
  { id: 'po1', valueId: 'power', text: 'Being in charge and having real influence over others is important to this person.' },
  { id: 'se1', valueId: 'security', text: 'This person wants their life, and the people they love, to be safe and secure.' },
  { id: 'co1', valueId: 'conformity', text: 'This person is careful to follow the rules and not do things others would frown upon.' },
  { id: 'tr1', valueId: 'tradition', text: 'Honouring the customs and traditions they were raised with matters to this person.' },
  { id: 'be1', valueId: 'benevolence', text: 'Helping the people close to them, and being loyal and dependable, matters to this person.' },
  { id: 'un1', valueId: 'universalism', text: 'This person cares about fairness and the wellbeing of all people and the planet.' },
]
