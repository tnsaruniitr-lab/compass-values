// @ts-check
import {
  PORTRAIT_ITEMS, PORTRAIT_SCALE, MAXDIFF_BLOCKS, VALUE_BY_ID, valueById,
  HIGHER_ORDER_META, HIGHER_ORDER_DEEP, HIGHER_ORDER, analyze,
} from '../engine/index.js'
import { renderCircumplex } from './circumplex.js'

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
          <strong>career</strong> and the <strong>kind of partner</strong> that fit you best.
          In about five minutes of honest trade-offs, Compass maps what really drives you,
          grounded in the <strong>Schwartz model of basic human values</strong>.
        </p>
        <div class="btn-row">
          <button class="btn" data-begin>Begin →</button>
          <span class="fine">~5 minutes · ${TOTAL} quick choices</span>
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
function viewResults() {
  const maxdiffChoices = MAXDIFF_BLOCKS.map((b) => ({ blockId: b.id, ...(state.md[b.id] || { best: null, worst: null }) }))
  const { profile } = analyze({
    portraitItems: PORTRAIT_ITEMS, portraitResponses: state.pt,
    maxdiffBlocks: MAXDIFF_BLOCKS, maxdiffChoices,
  })

  const lo = -1.6; const hi = 1.6
  const pctOf = (c) => Math.round(Math.max(0, Math.min(1, (c - lo) / (hi - lo))) * 100)
  const confChip = (k) => `<span class="chip conf-${k}"><span class="d"></span>${k === 'single' ? 'one signal' : k} confidence</span>`

  const top = profile.ranked.slice(0, 5).map((id, i) => {
    const v = valueById(id)
    return `
      <div class="vrow">
        <span class="vrank">${i + 1}</span>
        <span class="vname">${v.name}<small>${v.blurb}</small>
          <span class="meter"><i style="width:${pctOf(profile.combined[id])}%;background:linear-gradient(90deg,${v.color},${v.color}99)"></i></span>
        </span>
        ${confChip(profile.valueConfidence[id])}
      </div>`
  }).join('')

  const tensions = profile.tensions.length
    ? `<div class="panel"><h3>⚡ Live tensions</h3>
        <p class="fine" style="margin-bottom:8px">Opposing values you <em>both</em> prize highly — the real trade-offs you navigate.</p>
        ${profile.tensions.map((t) => `<div class="tension">${valueById(t.a).name} <span class="vs">⟷</span> ${valueById(t.b).name}</div>`).join('')}
       </div>`
    : ''

  const axes = [
    { pos: 'self_transcendence', neg: 'self_enhancement' },
    { pos: 'openness', neg: 'conservation' },
  ].map((ax) => {
    const pv = profile.higher[ax.pos]; const nv = profile.higher[ax.neg]
    const diff = pv - nv // positive → leans pos side
    const knob = 50 + Math.max(-48, Math.min(48, diff * 26))
    const pm = HIGHER_ORDER_META[ax.pos]; const nm = HIGHER_ORDER_META[ax.neg]
    const leanColor = hoColor(diff >= 0 ? ax.pos : ax.neg)
    return `
      <div class="axisbar">
        <div class="lbls"><span style="color:${hoColor(ax.neg)}">${nm.name}</span><span style="color:${hoColor(ax.pos)}">${pm.name}</span></div>
        <div class="axistrack"><span class="mid"></span>
          <span class="knob" style="left:${knob}%;background:${leanColor};color:${leanColor}"></span>
        </div>
      </div>`
  }).join('')

  const dom = HIGHER_ORDER_META[profile.dominantHigher]
  const conv = profile.convergence == null ? null : Math.round(profile.convergence * 100)

  mount(`
    <section class="view wide">
      <div class="card">
        ${topbar(false)}
        <div class="results-grid">
          <div>
            <div class="hero-orient">Your centre of gravity</div>
            <h2 class="hero-title" style="color:${hoColor(profile.dominantHigher)}">${dom.name}</h2>
            <p class="fine" style="margin-bottom:18px">
              ${conv == null ? '' : `Your two signals agreed ~${conv}% — a rough, uncalibrated confidence cue.`}
            </p>
            ${renderCircumplex(profile, { theme })}
          </div>
          <div>
            <div class="hero-orient">What matters most — to you</div>
            <p class="fine" style="margin:6px 0 14px">These are <em>relative</em> priorities (most → least important to you), not absolute scores or a comparison to other people.</p>
            <div class="vlist">${top}</div>
            <div class="panel" style="margin-top:18px"><h3>Your two value axes</h3>${axes}</div>
            ${tensions}
          </div>
        </div>

        <div class="disclaimer">
          <p class="fine">
            <strong>Read this as a mirror, not a verdict.</strong> This prototype maps the priorities behind your
            choices using the Schwartz circumplex. It is not a personality type, not clinical, and not a validated
            instrument — some values are measured less reliably than others. The most useful question isn't
            “is this exactly right?” but “where does it ring true, and where doesn't it — and why?”
          </p>
        </div>
        <div class="foot">
          <button class="btn ghost" data-restart>Start again</button>
          <p class="fine" style="margin-top:14px">Built on <a href="../RESEARCH_AND_PLAN.md">the research &amp; product plan →</a></p>
        </div>
      </div>
    </section>`)

  root.querySelector('[data-restart]').addEventListener('click', () =>
    go('welcome', { mdIndex: 0, ptIndex: 0, md: {}, pt: {} }))
}

/* -------------------------------------------------------------------- render */
function render() {
  if (state.step === 'welcome') viewWelcome()
  else if (state.step === 'maxdiff') viewMaxDiff()
  else if (state.step === 'portrait') viewPortrait()
  else if (state.step === 'results') viewResults()
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
