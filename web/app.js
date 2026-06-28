// @ts-check
import {
  VALUES, VALUE_BY_ID, valueById,
  HIGHER_ORDER_META, HIGHER_ORDER_DEEP, buildProfile, scoreTiers,
  careerReport, workInsights, relationshipCompass, relationshipSignal, loveInsights,
  synthesizeIdentity,
} from '../engine/index.js'
import { renderCircumplex } from './circumplex.js'
import { archetypeArt } from './archetypeArt.js'

const root = /** @type {HTMLElement} */ (document.getElementById('app'))

/* ------------------------------------------------------------------- theming */
/** Selectable themes: label (dropdown), browser chrome bar colour, light/dark mode. */
const THEMES = {
  linen: { label: 'Linen', bar: '#f4eee2', mode: 'light' },
  dark: { label: 'Twilight', bar: '#0d0b1c', mode: 'dark' },
  midnight: { label: 'Midnight', bar: '#0a0c10', mode: 'dark' },
  meadow: { label: 'Meadow', bar: '#eef3e8', mode: 'light' },
  bloom: { label: 'Bloom', bar: '#fff4ef', mode: 'light' },
}
const DEFAULT_THEME = 'linen'
let theme = DEFAULT_THEME
try { const s = localStorage.getItem('compass-theme'); if (THEMES[s]) theme = s } catch {}
const themeMode = (t) => (THEMES[t] ? THEMES[t].mode : 'dark')
function applyTheme(t) {
  theme = THEMES[t] ? t : DEFAULT_THEME
  document.documentElement.dataset.theme = theme
  document.documentElement.dataset.mode = themeMode(theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEMES[theme].bar)
  try { localStorage.setItem('compass-theme', theme) } catch {}
}
/** Theme-aware higher-order colour (deeper, legible variant on light themes). */
const hoColor = (id) => (themeMode(theme) === 'light' ? HIGHER_ORDER_DEEP[id] : HIGHER_ORDER_META[id].color)

const state = {
  step: 'welcome', // welcome | sort | results
  /** @type {Record<string,'most'|'least'|null>} */ tiers: {},
}

const MOST_CAP = 3
const LEAST_CAP = 3
const SORT_TARGET = MOST_CAP + LEAST_CAP
const tierIds = (t) => VALUES.filter((v) => state.tiers[v.id] === t).map((v) => v.id)
const placedCount = () => Object.values(state.tiers).filter(Boolean).length

/* ------------------------------------------------------------------- helpers */
function mount(html) {
  root.innerHTML = html
  return root.firstElementChild
}
function go(step, patch = {}) { Object.assign(state, patch, { step }); render() }

function topbar(onBack) {
  const pct = Math.round((placedCount() / SORT_TARGET) * 100)
  return `
    <div class="topbar">
      ${onBack ? '<button class="backlink" data-back>← Back</button>' : '<span style="width:48px"></span>'}
      <div class="progress"><i style="width:${pct}%"></i></div>
      <span class="counter">${placedCount()} / ${SORT_TARGET}</span>
    </div>`
}

/* ----------------------------------------------------- micro-feedback (spark) */
/** A relevant emoji per value — small illustrations that bring the items alive. */
const VALUE_ICON = {
  self_direction: '🧭', stimulation: '⚡', hedonism: '🍒', achievement: '🏆',
  power: '👑', security: '🛡️', conformity: '🤝', tradition: '🕯️',
  benevolence: '💞', universalism: '🌍',
}
/** Short, warm one-liners per value — randomised so it feels different each time. */
const SPARK_LINES = {
  self_direction: ['Your own path it is.', 'Freedom, noted.', 'You steer your life.'],
  stimulation: ['Bring on the new.', 'Adventure calls.', 'Never a dull moment.'],
  hedonism: ['Joy matters.', 'Savour it.', 'Life’s pleasures — yes.'],
  achievement: ['Go get it.', 'You aim high.', 'Excellence, noted.'],
  power: ['You take the lead.', 'Influence, noted.', 'You shape things.'],
  security: ['Safe and steady.', 'Solid ground.', 'Stability matters.'],
  conformity: ['Harmony, noted.', 'You value the “we”.', 'Belonging matters.'],
  tradition: ['Roots run deep.', 'Honouring what came before.', 'Heritage matters.'],
  benevolence: ['Care, first.', 'Your people matter.', 'A caring heart.'],
  universalism: ['For everyone.', 'A fairer world.', 'Big-hearted, that.'],
}
const LOW_LINES = ['Not so much, noted.', 'Less your thing.', 'Fair enough.']
const MID_LINES = ['Noted.', 'Got it.', 'Mm-hm.']
const pickOne = (a) => a[Math.floor(Math.random() * a.length)]
const prefersReduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Pop a small, value-relevant toast (+ particle burst) at a point, then fade. */
function spark(rect, valueId, tone = 'embrace') {
  if (!rect) return
  const v = valueById(valueId)
  const color = (v && v.color) || '#a78bfa'
  const icon = VALUE_ICON[valueId] || '✨'
  const msg = tone === 'low' ? pickOne(LOW_LINES)
    : tone === 'mid' ? pickOne(MID_LINES)
      : pickOne(SPARK_LINES[valueId] || MID_LINES)
  const cx = Math.max(72, Math.min(window.innerWidth - 72, rect.left + rect.width / 2))
  const cy = rect.top

  const toast = document.createElement('div')
  toast.className = 'spark-toast'
  toast.style.left = `${cx}px`
  toast.style.top = `${cy}px`
  toast.style.setProperty('--c', color)
  toast.innerHTML = `<span class="spark-ic">${icon}</span><span>${msg}</span>`
  document.body.appendChild(toast)

  if (!prefersReduced()) burst(cx, cy, color)
  requestAnimationFrame(() => toast.classList.add('show'))
  setTimeout(() => { toast.classList.remove('show'); toast.classList.add('gone') }, 1150)
  setTimeout(() => toast.remove(), 1650)
}

/** A confetti-like burst of colour-matched dots from a point. */
function burst(cx, cy, color) {
  for (let i = 0; i < 11; i++) {
    const d = document.createElement('div')
    d.className = 'spark-dot'
    d.style.left = `${cx}px`; d.style.top = `${cy}px`; d.style.background = color
    document.body.appendChild(d)
    const ang = Math.random() * Math.PI * 2
    const dist = 26 + Math.random() * 56
    const dx = (Math.cos(ang) * dist).toFixed(1)
    const dy = (Math.sin(ang) * dist - 12).toFixed(1)
    d.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 },
    ], { duration: 560 + Math.random() * 340, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => d.remove()
  }
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
          <span class="fine">~2 minutes · one quick sort</span>
        </div>
        <p class="fine" style="margin-top:26px">
          Built for honest self-reflection and grounded in research. Prototype items —
          not a clinical or validated assessment.
        </p>
      </div>
    </section>`)
  node.querySelector('[data-begin]').addEventListener('click', () => go('sort'))
}

/* --------------------------------------------------------------------- sort */
const TUT_KEY = 'compass-sort-tut'
const seenTutorial = () => { try { return !!localStorage.getItem(TUT_KEY) } catch { return false } }
const markTutorial = () => { try { localStorage.setItem(TUT_KEY, '1') } catch {} }

function sortRow(v, tier, mostFull, leastFull) {
  const upOn = tier === 'most' ? 'on' : ''
  const downOn = tier === 'least' ? 'on' : ''
  const upDis = tier !== 'most' && mostFull ? 'disabled' : ''
  const downDis = tier !== 'least' && leastFull ? 'disabled' : ''
  return `
    <div class="sortrow tier-${tier || 'neutral'}" data-id="${v.id}" style="--c:${v.color}">
      <span class="sr-emoji" aria-hidden="true">${VALUE_ICON[v.id] || ''}</span>
      <span class="sr-text"><strong>${v.name}</strong><small>${v.short}</small></span>
      <span class="sr-acts">
        <button class="sr-up ${upOn}" data-act="most" data-id="${v.id}" ${upDis} aria-label="Matters most to me">▲</button>
        <button class="sr-down ${downOn}" data-act="least" data-id="${v.id}" ${downDis} aria-label="Matters least to me">▼</button>
      </span>
    </div>`
}

function viewSort() {
  const most = tierIds('most'); const least = tierIds('least')
  const neutral = VALUES.filter((v) => !state.tiers[v.id]).map((v) => v.id)
  const mostFull = most.length >= MOST_CAP; const leastFull = least.length >= LEAST_CAP
  const canContinue = most.length >= MOST_CAP && least.length >= LEAST_CAP
  const rowsFor = (ids) => ids.map((id) => sortRow(valueById(id), state.tiers[id] || null, mostFull, leastFull)).join('')

  const mostBlock = most.length
    ? rowsFor(most)
    : `<div class="sort-empty">Tap ▲ to lift your most important here</div>`
  const leastBlock = least.length
    ? rowsFor(least)
    : `<div class="sort-empty">Tap ▼ to drop your least important here</div>`

  const hint = canContinue
    ? 'Looks good — change anything, or continue.'
    : `Lift <strong>${MOST_CAP}</strong> to the top and drop <strong>${LEAST_CAP}</strong> to the bottom.`

  const tutorial = seenTutorial() ? '' : `
    <div class="tut" data-tut>
      <div class="tut-card">
        <div class="tut-emoji">↕️</div>
        <h3>Sort what matters</h3>
        <p>Tap <span class="tut-ar up">▲</span> on the few values that matter <strong>most</strong> to you — they rise to the top.
        Tap <span class="tut-ar down">▼</span> on the few that matter <strong>least</strong> — they sink down.</p>
        <p class="tut-fine">Don’t overthink the middle. There are no right answers.</p>
        <button class="btn" data-tut-ok>Got it →</button>
      </div>
    </div>`

  const node = mount(`
    <section class="view">
      <div class="card">
        <div class="stickyhead">
          ${topbar(true)}
          <div class="qhead">
            <div class="k">Sort · most ${most.length}/${MOST_CAP} · least ${least.length}/${LEAST_CAP}</div>
            <h2>What matters <em>most</em> — and <em>least</em> — to you?</h2>
          </div>
        </div>
        <div class="sortlist">
          <div class="grouplbl glbl-most">▲ Matters most</div>
          ${mostBlock}
          <div class="grouplbl glbl-neutral">The rest — leave as you like</div>
          ${rowsFor(neutral)}
          <div class="grouplbl glbl-least">▼ Matters least</div>
          ${leastBlock}
        </div>
        <div class="stickyfoot">
          <button class="btn" data-next ${canContinue ? '' : 'disabled'}>See your results →</button>
          <span class="fine">${hint}</span>
        </div>
      </div>
      ${tutorial}
    </section>`)

  node.querySelector('[data-back]')?.addEventListener('click', () => go('welcome'))
  node.querySelector('[data-tut-ok]')?.addEventListener('click', () => { markTutorial(); render() })
  node.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => {
    if (b.hasAttribute('disabled')) return
    const id = b.getAttribute('data-id'); const act = b.getAttribute('data-act')
    const cur = state.tiers[id] || null
    const next = cur === act ? null : act // tap same tier again to unset
    state.tiers = { ...state.tiers, [id]: next }
    const rect = b.getBoundingClientRect()
    render()
    if (next === 'most') spark(rect, id, 'embrace')
  }))
  node.querySelector('[data-next]')?.addEventListener('click', () => { if (canContinue) go('results') })
}

/* ------------------------------------------------------------------- results */
/** Map a signed lean (~ z-score range) to a 2–98% knob position. */
const knobPos = (v, scale = 22) => 50 + Math.max(-46, Math.min(46, v * scale))

function viewResults() {
  const profile = buildProfile({ tiers: scoreTiers(state.tiers) })

  const identity = synthesizeIdentity(profile)
  const career = careerReport(profile, VALUE_BY_ID, 3)
  const work = workInsights(profile)
  const compass = relationshipCompass(profile)
  const love = loveInsights(profile)
  const signal = relationshipSignal(profile)
  const dom = HIGHER_ORDER_META[profile.dominantHigher]
  const idColor = hoColor(profile.dominantHigher)
  const list = (items) => items.map((t) => `<li>${t}</li>`).join('')

  /* ---- Scene 1: TRUE SELF — the identity reveal ---- */
  const sceneIdentity = `
    <section class="scene scene-identity" style="--accent:${idColor}">
      <div class="scene-inner center">
        <div class="eyebrow">Your true self</div>
        <p class="id-pre">You are</p>
        <h1 class="id-name">${identity.name}</h1>
        <p class="id-essence">${identity.essence}</p>
        <div class="id-traits">${identity.traits.map((t) => `<span class="id-trait">${t}</span>`).join('')}</div>
        <p class="id-portrait">${identity.portrait}</p>
      </div>
      <div class="scroll-cue" aria-hidden="true">scroll ↓</div>
    </section>`

  /* ---- Scene 2: VALUES — the constellation + top drivers ---- */
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
  const sceneValues = `
    <section class="scene scene-values">
      <div class="scene-inner">
        <div class="eyebrow">What you value</div>
        <h2 class="scene-h2" style="color:${idColor}">Your core values</h2>
        <p class="scene-fine">Your centre of gravity is <strong>${dom.name}</strong>. Below: the three priorities that rose to the top — relative to <em>your</em> own ranking, not other people.</p>
        <div class="constellation">${renderCircumplex(profile, { theme: themeMode(theme) === 'light' ? 'bloom' : 'dark' })}</div>
        <div class="drivers">${drivers}</div>
      </div>
    </section>`

  /* ---- Scene 3: WORK — the career archetype, richly answered ---- */
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
          ${archetypeArt(primary, { light: themeMode(theme) === 'light' })}
          <img class="arch-photo" alt="" data-src="./img/archetype-${primary.key}.webp">
          <div class="arch-band band-${primary.band}">${primary.band === 'strong' ? 'strong fit' : primary.band === 'clear' ? 'clear lean' : 'a lean'}</div>
        </div>
        <h2 class="scene-h2 arch-name">${primary.name}</h2>
        <p class="arch-tag">${primary.tagline}</p>
        <p class="arch-story">${primary.reasoning}</p>
        <div class="panel-grid">
          <div class="ipanel good"><h4>You thrive when</h4><ul>${list(work.thrive)}</ul></div>
          <div class="ipanel warn"><h4>What drains you</h4><ul>${list(work.drains)}</ul></div>
        </div>
        <p class="rolelabel">Roles that tend to fit</p>
        <div class="roles">${roles}</div>
        ${alsoHtml}
        <p class="scene-fine calib">Values point to the kind of work you’ll <em>enjoy</em> — not what you’ll be best <em>at</em>, and not destiny. Treat this as a direction worth exploring.</p>
      </div>
    </section>`

  /* ---- Scene 4: LOVE — how you love + what fits you, richly answered ---- */
  const dims = compass.map((d) => `
    <div class="cdim">
      <div class="clabels"><span>${d.left}</span><span>${d.right}</span></div>
      <div class="ctrack"><span class="cmid"></span><span class="cknob" style="left:${knobPos(d.value)}%"></span></div>
      <p class="creflect">${d.reflection}</p>
    </div>`).join('')
  const sceneLove = `
    <section class="scene scene-love">
      <div class="scene-inner">
        <div class="eyebrow">How you love</div>
        <h2 class="scene-h2">Love, your way</h2>
        <p class="love-summary">${love.summary}</p>
        <div class="panel-grid">
          <div class="ipanel good"><h4>Look for a partner who…</h4><ul>${list(love.lookFor)}</ul></div>
          <div class="ipanel warn"><h4>Be wary of</h4><ul>${list(love.beWary)}</ul></div>
        </div>
        <p class="rolelabel">The dynamics underneath</p>
        <div class="compass">${dims}</div>
        <p class="signal">✨ ${signal.text}</p>
        <p class="scene-fine">There’s no single “type” to find — research says compatibility can’t be predicted from values alone. This maps how <em>you</em> tend to love, so you can choose, and talk, with clear eyes.</p>
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

  mount(`<div class="story">${sceneIdentity}${sceneValues}${sceneWork}${sceneLove}${sceneClose}</div>`)

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
    go('welcome', { tiers: {} }))
}

/* -------------------------------------------------------------------- render */
function render() {
  if (state.step === 'welcome') viewWelcome()
  else if (state.step === 'sort') viewSort()
  else if (state.step === 'results') viewResults()
  // Enable gentle scene-by-scene scroll-snap only on the results story.
  document.body.dataset.view = state.step === 'results' ? 'story' : 'flow'
  // Scroll to top only when the STEP changes — not on every selection
  // re-render (so tapping a value doesn't yank the page up).
  if (state.step !== lastViewKey) { window.scrollTo({ top: 0, behavior: 'smooth' }); lastViewKey = state.step }
}
let lastViewKey = null

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
