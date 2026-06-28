// @ts-check
import {
  PORTRAIT_ITEMS, PORTRAIT_SCALE, MAXDIFF_BLOCKS, VALUE_BY_ID, valueById,
  HIGHER_ORDER_META, HIGHER_ORDER_DEEP, HIGHER_ORDER, analyze,
  careerReport, relationshipCompass, relationshipSignal,
} from '../engine/index.js'
import { renderCircumplex } from './circumplex.js'
import { archetypeArt } from './archetypeArt.js'

const root = /** @type {HTMLElement} */ (document.getElementById('app'))

/* ------------------------------------------------------------------- theming */
const THEME_BAR = { dark: '#0d0b1c', bloom: '#fff4ef' }
let theme = 'dark'
try { const s = localStorage.getItem('compass-theme'); if (s === 'dark' || s === 'bloom') theme = s } catch {}
function applyTheme(t) {
  theme = t
  document.documentElement.dataset.theme = t
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_BAR[t] || THEME_BAR.dark)
  try { localStorage.setItem('compass-theme', t) } catch {}
}
/** Theme-aware higher-order colour (deeper on the light Bloom theme). */
const hoColor = (id) => (theme === 'bloom' ? HIGHER_ORDER_DEEP[id] : HIGHER_ORDER_META[id].color)

const state = {
  step: 'welcome', // welcome | maxdiff | portrait | results
  mdIndex: 0,
  ptIndex: 0,
  /** @type {Record<string,{best:string|null,worst:string|null}>} */ md: {},
  /** @type {Record<string,number>} */ pt: {},
}

const TOTAL = MAXDIFF_BLOCKS.length + PORTRAIT_ITEMS.length
const answeredCount = () => Object.values(state.md).filter((c) => c.best && c.worst).length + Object.keys(state.pt).length

/* ------------------------------------------------------------------- helpers */
function mount(html) {
  root.innerHTML = html
  return root.firstElementChild
}
function go(step, patch = {}) { Object.assign(state, patch, { step }); render() }

function topbar(onBack) {
  const pct = Math.round((answeredCount() / TOTAL) * 100)
  return `
    <div class="topbar">
      ${onBack ? '<button class="backlink" data-back>← Back</button>' : '<span style="width:48px"></span>'}
      <div class="progress"><i style="width:${pct}%"></i></div>
      <span class="counter">${answeredCount()} / ${TOTAL}</span>
    </div>`
}

/* ------------------------------------------------------------------- welcome */
function viewWelcome() {
  const node = mount(`
    <section class="view">
      <div class="card">
        <div class="eyebrow">Compass · self-discovery</div>
        <h1 class="display">Discover your <em>true</em>&nbsp;self</h1>
        <p class="lede">
          Uncover the values you actually live by — and what they mean for the
          <strong>work that fits you</strong> and <strong>how you love</strong>.
          In a few minutes of honest trade-offs, Compass maps what really drives you,
          grounded in the <strong>Schwartz model of basic human values</strong>.
        </p>
        <div class="btn-row">
          <button class="btn" data-begin>Begin →</button>
          <span class="fine">~3 minutes · ${TOTAL} quick choices</span>
        </div>
        <p class="fine" style="margin-top:26px">
          Built for honest self-reflection and grounded in research. Prototype items —
          not a clinical or validated assessment.
        </p>
      </div>
    </section>`)
  node.querySelector('[data-begin]').addEventListener('click', () => go('maxdiff'))
}

/* ------------------------------------------------------------------- maxdiff */
function viewMaxDiff() {
  const block = MAXDIFF_BLOCKS[state.mdIndex]
  const cur = state.md[block.id] || { best: null, worst: null }

  const rows = block.valueIds.map((id) => {
    const v = valueById(id)
    const cls = cur.best === id ? 'most' : cur.worst === id ? 'least' : ''
    return `
      <div class="md-row ${cls}" data-id="${id}">
        <span class="label"><span class="dot" style="color:${v.color}"></span><span class="txt">${v.short}</span></span>
        <span class="pick">
          <button class="most ${cur.best === id ? 'on' : ''}" data-pick="best" data-id="${id}">Most</button>
          <button class="least ${cur.worst === id ? 'on' : ''}" data-pick="worst" data-id="${id}">Least</button>
        </span>
      </div>`
  }).join('')

  const node = mount(`
    <section class="view">
      <div class="card">
        ${topbar(true)}
        <div class="qhead">
          <div class="k">Trade-off · ${state.mdIndex + 1} of ${MAXDIFF_BLOCKS.length}</div>
          <h2>Of these four, which matters <em>most</em> to you — and which <em>least</em>?</h2>
        </div>
        <div class="md-list">${rows}</div>
        <div class="btn-row">
          <button class="btn" data-next ${cur.best && cur.worst ? '' : 'disabled'}>Continue →</button>
          <span class="fine">Pick one “Most” and one “Least”.</span>
        </div>
      </div>
    </section>`)

  node.querySelector('[data-back]')?.addEventListener('click', backFromMaxDiff)
  node.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
    const id = b.getAttribute('data-id'); const kind = b.getAttribute('data-pick')
    const c = state.md[block.id] || { best: null, worst: null }
    if (kind === 'best') { c.best = c.best === id ? null : id; if (c.worst === id) c.worst = null }
    else { c.worst = c.worst === id ? null : id; if (c.best === id) c.best = null }
    state.md[block.id] = c
    if (c.best && c.worst) setTimeout(nextMaxDiff, 260)
    else render()
  }))
  node.querySelector('[data-next]')?.addEventListener('click', nextMaxDiff)
}
function nextMaxDiff() {
  if (state.mdIndex < MAXDIFF_BLOCKS.length - 1) go('maxdiff', { mdIndex: state.mdIndex + 1 })
  else go('portrait', { ptIndex: 0 })
}
function backFromMaxDiff() {
  if (state.mdIndex > 0) go('maxdiff', { mdIndex: state.mdIndex - 1 })
  else go('welcome')
}

/* ------------------------------------------------------------------ portrait */
function viewPortrait() {
  const item = PORTRAIT_ITEMS[state.ptIndex]
  const cur = state.pt[item.id]
  const dots = PORTRAIT_SCALE.map((s) =>
    `<button class="dotbtn ${cur === s.value ? 'on' : ''}" data-val="${s.value}" title="${s.label}">${s.value}</button>`,
  ).join('')

  const node = mount(`
    <section class="view">
      <div class="card">
        ${topbar(true)}
        <div class="qhead"><div class="k">Reflect · ${state.ptIndex + 1} of ${PORTRAIT_ITEMS.length}</div>
          <h2 class="subq">How much is this person like you?</h2>
        </div>
        <blockquote class="quote" data-value="${item.valueId}">${item.text}</blockquote>
        <div class="scale">
          <div class="scale-ends"><span>${PORTRAIT_SCALE[0].label}</span><span>${PORTRAIT_SCALE[5].label}</span></div>
          <div class="dots">${dots}</div>
        </div>
        <div class="btn-row">
          <button class="btn ghost" data-skip>Skip</button>
          <span class="fine">Tap a number to continue.</span>
        </div>
      </div>
    </section>`)

  node.querySelector('[data-back]')?.addEventListener('click', backFromPortrait)
  node.querySelectorAll('[data-val]').forEach((b) => b.addEventListener('click', () => {
    state.pt[item.id] = Number(b.getAttribute('data-val'))
    setTimeout(nextPortrait, 220)
  }))
  node.querySelector('[data-skip]')?.addEventListener('click', nextPortrait)
}
function nextPortrait() {
  if (state.ptIndex < PORTRAIT_ITEMS.length - 1) go('portrait', { ptIndex: state.ptIndex + 1 })
  else go('results')
}
function backFromPortrait() {
  if (state.ptIndex > 0) go('portrait', { ptIndex: state.ptIndex - 1 })
  else go('maxdiff', { mdIndex: MAXDIFF_BLOCKS.length - 1 })
}

/* ------------------------------------------------------------------- results */
/** Map a signed lean (~ z-score range) to a 2–98% knob position. */
const knobPos = (v, scale = 22) => 50 + Math.max(-46, Math.min(46, v * scale))

function viewResults() {
  const maxdiffChoices = MAXDIFF_BLOCKS.map((b) => ({ blockId: b.id, ...(state.md[b.id] || { best: null, worst: null }) }))
  const { profile } = analyze({
    portraitItems: PORTRAIT_ITEMS, portraitResponses: state.pt,
    maxdiffBlocks: MAXDIFF_BLOCKS, maxdiffChoices,
  })

  const career = careerReport(profile, VALUE_BY_ID, 3)
  const compass = relationshipCompass(profile)
  const signal = relationshipSignal(profile)
  const dom = HIGHER_ORDER_META[profile.dominantHigher]

  /* ---- Scene 1: you (the constellation) ---- */
  const sceneYou = `
    <section class="scene scene-you">
      <div class="scene-inner">
        <div class="eyebrow">Your map</div>
        <h2 class="scene-h" style="color:${hoColor(profile.dominantHigher)}">${dom.name}</h2>
        <p class="scene-lede">Here's the shape of what you value — your centre of gravity and the pulls around it.</p>
        <div class="constellation">${renderCircumplex(profile, { theme })}</div>
      </div>
      <div class="scroll-cue" aria-hidden="true">scroll ↓</div>
    </section>`

  /* ---- Scene 2: what drives you ---- */
  const lo = -1.6; const hi = 1.6
  const pctOf = (c) => Math.round(Math.max(0, Math.min(1, (c - lo) / (hi - lo))) * 100)
  const drivers = profile.ranked.slice(0, 3).map((id, i) => {
    const v = valueById(id)
    return `
      <div class="driver">
        <span class="dn">${i + 1}</span>
        <div class="dbody">
          <strong style="color:${v.color}">${v.name}</strong>
          <span class="meter"><i style="width:${pctOf(profile.combined[id])}%;background:linear-gradient(90deg,${v.color},${v.color}99)"></i></span>
          <small>${v.blurb}</small>
        </div>
      </div>`
  }).join('')
  const sceneDrivers = `
    <section class="scene">
      <div class="scene-inner">
        <div class="eyebrow">What drives you</div>
        <h2 class="scene-h2">The three that rose to the top</h2>
        <p class="scene-fine">Relative priorities — most → least important <em>to you</em>, not a score against other people.</p>
        <div class="drivers">${drivers}</div>
      </div>
    </section>`

  /* ---- Scene 3: your work (career archetype reveal) ---- */
  const primary = career[0]
  const alsoLeans = career.slice(1, 3).filter((a) => a.band !== 'weak')
  const roles = primary.roles.map((r) => `<span class="role">${r}</span>`).join('')
  const alsoHtml = alsoLeans.length
    ? `<div class="also">
         <span class="also-k">You also lean</span>
         ${alsoLeans.map((a) => `<span class="also-chip" style="--accent:${a.accent}">${a.name}</span>`).join('')}
       </div>`
    : ''
  const sceneWork = `
    <section class="scene scene-work" style="--accent:${primary.accent}">
      <div class="scene-inner">
        <div class="eyebrow">The work that fits you</div>
        <div class="arch-hero" data-key="${primary.key}">
          ${archetypeArt(primary, { theme })}
          <img class="arch-photo" alt="" data-src="./img/archetype-${primary.key}.webp">
          <div class="arch-band band-${primary.band}">${primary.band === 'strong' ? 'strong fit' : primary.band === 'clear' ? 'clear lean' : 'a lean'}</div>
        </div>
        <h2 class="scene-h2 arch-name">${primary.name}</h2>
        <p class="arch-tag">${primary.tagline}</p>
        <p class="arch-story">${primary.reasoning}</p>
        <div class="roles">${roles}</div>
        <p class="anti-fit">↘ What would chafe: ${primary.antiFit}</p>
        ${alsoHtml}
        <p class="scene-fine calib">Values point to the kind of work you'll <em>enjoy</em> — not what you'll be best <em>at</em>, and not destiny. The science links values to job satisfaction modestly; treat this as a direction worth exploring.</p>
      </div>
    </section>`

  /* ---- Scene 4: how you love (relationship compass) ---- */
  const dims = compass.map((d) => `
    <div class="cdim">
      <div class="clabels"><span>${d.left}</span><span>${d.right}</span></div>
      <div class="ctrack"><span class="cmid"></span><span class="cknob" style="left:${knobPos(d.value)}%"></span></div>
      <p class="creflect">${d.reflection}</p>
      <p class="ctalk">💬 ${d.talk}</p>
    </div>`).join('')
  const sceneLove = `
    <section class="scene scene-love">
      <div class="scene-inner">
        <div class="eyebrow">How you love</div>
        <h2 class="scene-h2">Your values, in relationships</h2>
        <p class="scene-fine">Not a “type” to find — the science says that can't be predicted. This is how <em>you</em> tend to show up, and what's worth talking about with anyone you're close to.</p>
        <div class="compass">${dims}</div>
        <p class="signal">✨ ${signal.text}</p>
      </div>
    </section>`

  /* ---- Scene 5: tensions + close ---- */
  const tensions = profile.tensions.length
    ? `<div class="tensions">
         ${profile.tensions.map((t) => `<div class="tension">${valueById(t.a).name} <span class="vs">⟷</span> ${valueById(t.b).name}</div>`).join('')}
       </div>
       <p class="scene-fine">Opposing values you <em>both</em> prize — the real trade-offs you navigate, in work and in love.</p>`
    : `<p class="scene-fine">Your top values sit comfortably together — no strong internal tug-of-war surfaced.</p>`
  const sceneClose = `
    <section class="scene scene-close">
      <div class="scene-inner">
        <div class="eyebrow">The tensions you carry</div>
        <h2 class="scene-h2">Where you'll feel the pull</h2>
        ${tensions}
        <div class="disclaimer">
          <p class="scene-fine">
            <strong>A mirror, not a verdict.</strong> A prototype built on the Schwartz circumplex — not a personality
            type, not clinical, not validated. The useful question isn't “is this exactly right?” but “where does it
            ring true — and where doesn't it?”
          </p>
        </div>
        <div class="foot">
          <button class="btn" data-restart>Start again</button>
          <p class="scene-fine" style="margin-top:14px"><a href="../docs/RESEARCH_values-to-career-and-partner.md">The research behind this →</a></p>
        </div>
      </div>
    </section>`

  mount(`<div class="story">${sceneYou}${sceneDrivers}${sceneWork}${sceneLove}${sceneClose}</div>`)

  // Try to load the AI illustration for the primary archetype; if absent, the
  // generative SVG art behind it remains (graceful, offline-friendly).
  root.querySelectorAll('.arch-photo').forEach((img) => {
    const src = img.getAttribute('data-src')
    if (!src) return
    img.addEventListener('error', () => img.remove())
    img.addEventListener('load', () => img.classList.add('loaded'))
    img.setAttribute('src', src)
  })
  root.querySelector('[data-restart]').addEventListener('click', () =>
    go('welcome', { mdIndex: 0, ptIndex: 0, md: {}, pt: {} }))
}

/* -------------------------------------------------------------------- render */
function render() {
  if (state.step === 'welcome') viewWelcome()
  else if (state.step === 'maxdiff') viewMaxDiff()
  else if (state.step === 'portrait') viewPortrait()
  else if (state.step === 'results') viewResults()
  // Enable gentle scene-by-scene scroll-snap only on the results story.
  document.body.dataset.view = state.step === 'results' ? 'story' : 'flow'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Apply the saved theme and wire the switcher (lives outside #app, so it
// persists across re-renders). Re-render on change so the SVG palette updates.
applyTheme(theme)
const themeSel = /** @type {HTMLSelectElement|null} */ (document.getElementById('themeSelect'))
if (themeSel) {
  themeSel.value = theme
  themeSel.addEventListener('change', () => {
    // Cross-fade colours during the switch and suppress the entrance keyframe so
    // the two transitions don't fight (see .theme-animating rules in styles.css).
    const html = document.documentElement
    html.classList.add('theme-animating')
    applyTheme(themeSel.value)
    render()
    setTimeout(() => html.classList.remove('theme-animating'), 520)
  })
}

render()

// Register the service worker so the app is installable & works offline.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
  })
}
