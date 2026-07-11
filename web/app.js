// @ts-check
import {
  VALUES, VALUE_IDS, VALUE_BY_ID, valueById,
  HIGHER_ORDER_META, HIGHER_ORDER_DEEP, VALUE_INK,
  buildProfile, scoreRanking, scoreMaxDiff, MAXDIFF_BLOCKS,
  INTEREST_ITEMS, scoreInterests,
  careerReport, workInsights, relationshipCompass, relationshipSignal, loveInsights,
  synthesizeIdentity, pairSignature, deriveAspects, distinctiveSplit, deepReads,
} from '../engine/index.js'
import { renderCircumplex } from './circumplex.js'
import { archetypeArt } from './archetypeArt.js'

const root = /** @type {HTMLElement} */ (document.getElementById('app'))

// Bump this every deploy — shown on the welcome screen so you can verify which
// build is actually live (helps tell deploy/CDN/service-worker staleness apart).
const BUILD = 'b13 · the-observatory'
try { console.info('%cCompass ' + BUILD, 'color:#5eead4;font-weight:600') } catch {}
try { document.documentElement.dataset.build = BUILD } catch {}

/* ------------------------------------------------------------------- theming */
/** The four Observatory skies: one design language, four pigment sets. */
const THEMES = {
  midnight: { label: 'Midnight', bar: '#0B0E1A', mode: 'dark' },
  abyss: { label: 'Abyss', bar: '#0A1614', mode: 'dark' },
  nebula: { label: 'Nebula', bar: '#140E20', mode: 'dark' },
  dawn: { label: 'Dawn', bar: '#F5EFDF', mode: 'light' },
}
/** Saved prefs from the pre-Observatory era map onto the nearest sky. */
const LEGACY_THEMES = { linen: 'dawn', meadow: 'dawn', bloom: 'dawn', dark: 'midnight' }
const DEFAULT_THEME = 'midnight'
let theme = DEFAULT_THEME
try {
  const s = localStorage.getItem('compass-theme')
  if (THEMES[s]) theme = s
  else if (LEGACY_THEMES[s]) theme = LEGACY_THEMES[s]
} catch {}
const themeMode = (t) => (THEMES[t] ? THEMES[t].mode : 'dark')
function applyTheme(t) {
  theme = THEMES[t] ? t : DEFAULT_THEME
  document.documentElement.dataset.theme = theme
  document.documentElement.dataset.mode = themeMode(theme)
  document.documentElement.style.colorScheme = themeMode(theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEMES[theme].bar)
  try { localStorage.setItem('compass-theme', theme) } catch {}
  try { document.dispatchEvent(new CustomEvent('compass-theme-changed')) } catch {}
}
/* ---------------------------------------------------------------- starfield */
/** The night behind everything. Theme-aware pigment; static under
 *  prefers-reduced-motion; ink specks at low opacity on the Dawn sky. */
const STAR_PIGMENT = { midnight: '#E8E4D8', abyss: '#DDE8E2', nebula: '#E8E2F0', dawn: '#5a4826' }
function startStars() {
  const cv = document.getElementById('stars')
  if (!(cv instanceof HTMLCanvasElement)) return
  const ctx = cv.getContext('2d')
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let stars = []
  const seed = () => Array.from({ length: Math.min(220, Math.floor(window.innerWidth / 7)) }, () => ({
    x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.25,
    p: Math.random() * Math.PI * 2, v: 0.2 + Math.random() * 0.6,
  }))
  const size = () => {
    cv.width = window.innerWidth * devicePixelRatio
    cv.height = window.innerHeight * devicePixelRatio
    stars = seed()
  }
  size(); window.addEventListener('resize', size)
  let t = 0
  const frame = () => {
    ctx.clearRect(0, 0, cv.width, cv.height)
    const light = themeMode(theme) === 'light'
    ctx.fillStyle = STAR_PIGMENT[theme] || '#E8E4D8'
    for (const s of stars) {
      const tw = reduced ? 0.55 : 0.3 + 0.4 * (1 + Math.sin(t * s.v + s.p)) / 2
      ctx.globalAlpha = tw * (light ? 0.35 : 1)
      ctx.beginPath()
      ctx.arc(s.x * cv.width, s.y * cv.height, s.r * devicePixelRatio, 0, 7)
      ctx.fill()
    }
    t += 0.016
    if (!reduced) requestAnimationFrame(frame)
  }
  frame()
  // re-render once on theme change so pigment updates even under reduced motion
  document.addEventListener('compass-theme-changed', () => { if (reduced) frame() })
}

/** Theme-aware higher-order colour (deeper, legible variant on light themes). */
const hoColor = (id) => (themeMode(theme) === 'light' ? HIGHER_ORDER_DEEP[id] : HIGHER_ORDER_META[id].color)
/** Theme-aware per-value INK: deep legible variant as text/pips on light themes,
 *  the vivid neon on dark themes (mirrors hoColor). */
const valueInk = (id) => (themeMode(theme) === 'light' ? (VALUE_INK[id] || valueById(id).color) : valueById(id).color)
/** Archetype accents reuse value colours — route them through the same ink map
 *  so archetype names/badges stay legible on light themes. */
const COLOR_TO_VALUE = Object.fromEntries(VALUES.map((v) => [v.color, v.id]))
const archInk = (a) => { const vid = COLOR_TO_VALUE[a.accent]; return vid ? valueInk(vid) : a.accent }

/* --------------------------------------------------------------------- state */
const state = {
  step: 'welcome', // welcome | primer | sort | maxdiff | interests | lived | results
  /** @type {string[]} */ order: [], // full sort, top = most important
  sortChanges: 0, // committed order changes (the honest engagement gate)
  sortConfirmed: false, // user explicitly confirmed an unchanged order
  blockIndex: 0,
  /** @type {{blockId:string, best:string|null, worst:string|null}[]} */ choices: [],
  interestIndex: 0,
  /** @type {Record<string, number>} */ interestAnswers: {}, // itemId → −1|0|+1 (quick-fire)
  /** @type {string[]|null} */ lived: null, // optional "reality check" sort
  livedChanges: 0,
  livedConfirmed: false,
  livedJustDone: false,
  shared: false, // true when rendering a decoded shared/saved link
}

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

/* -------------------------------------------------- persistence & permalinks */
/**
 * A result is fully described by ~40 small digits, so it lives in the URL
 * fragment and localStorage — shareable and re-openable with zero backend,
 * and nothing ever leaves the device.
 * Format: r=1.<order:10 digits>.<choices:20 digits>[.<lived:10 digits>]
 */
const LAST_KEY = 'compass-last'
const PROGRESS_KEY = 'compass-progress'

const encodeOrder = (order) => order.map((id) => VALUE_IDS.indexOf(id)).join('')
const decodeOrder = (s) => {
  if (!/^[0-9]{10}$/.test(s)) return null
  const order = [...s].map((d) => VALUE_IDS[Number(d)])
  return new Set(order).size === 10 ? order : null
}

function encodeResult({ order, choices, interests, lived }) {
  const ch = MAXDIFF_BLOCKS.map((b) => {
    const c = choices.find((x) => x.blockId === b.id)
    return `${b.valueIds.indexOf(c?.best)}${b.valueIds.indexOf(c?.worst)}`
  }).join('')
  // v2 carries the 12 quick-fire answers (digit = answer + 1); v1 = values only.
  const complete = interests && INTEREST_ITEMS.every((it) => [-1, 0, 1].includes(interests[it.id]))
  if (complete) {
    const iv = INTEREST_ITEMS.map((it) => interests[it.id] + 1).join('')
    return `2.${encodeOrder(order)}.${ch}.${iv}${lived ? '.' + encodeOrder(lived) : ''}`
  }
  return `1.${encodeOrder(order)}.${ch}${lived ? '.' + encodeOrder(lived) : ''}`
}

function decodeChoices(s) {
  const choices = []
  for (let i = 0; i < MAXDIFF_BLOCKS.length; i++) {
    const b = MAXDIFF_BLOCKS[i]
    const bi = Number(s[i * 2]); const wi = Number(s[i * 2 + 1])
    if (bi > 3 || wi > 3 || bi === wi) return null
    choices.push({ blockId: b.id, best: b.valueIds[bi], worst: b.valueIds[wi] })
  }
  return choices
}

function decodeResult(str) {
  const v2 = /^2\.([0-9]{10})\.([0-9]{20})\.([0-2]{12})(?:\.([0-9]{10}))?$/.exec(str || '')
  if (v2) {
    const order = decodeOrder(v2[1])
    const choices = order && decodeChoices(v2[2])
    if (!order || !choices) return null
    /** @type {Record<string, number>} */ const interests = {}
    INTEREST_ITEMS.forEach((it, i) => { interests[it.id] = Number(v2[3][i]) - 1 })
    const lived = v2[4] ? decodeOrder(v2[4]) : null
    if (v2[4] && !lived) return null
    return { order, choices, interests, lived }
  }
  const m = /^1\.([0-9]{10})\.([0-9]{20})(?:\.([0-9]{10}))?$/.exec(str || '')
  if (!m) return null
  const order = decodeOrder(m[1])
  const choices = order && decodeChoices(m[2])
  if (!order || !choices) return null
  const lived = m[3] ? decodeOrder(m[3]) : null
  if (m[3] && !lived) return null
  return { order, choices, interests: null, lived }
}

const saveLast = (code) => { try { localStorage.setItem(LAST_KEY, code) } catch {} }
const loadLast = () => { try { return decodeResult(localStorage.getItem(LAST_KEY) || '') && localStorage.getItem(LAST_KEY) } catch { return null } }
const saveProgress = () => {
  try {
    if (state.step === 'sort' || state.step === 'maxdiff' || state.step === 'interests') {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({
        step: state.step, order: state.order, sortChanges: state.sortChanges,
        sortConfirmed: state.sortConfirmed, blockIndex: state.blockIndex, choices: state.choices,
        interestIndex: state.interestIndex, interestAnswers: state.interestAnswers,
      }))
    } else if (state.step === 'welcome' || state.step === 'results') {
      localStorage.removeItem(PROGRESS_KEY)
    }
  } catch {}
}
const loadProgress = () => {
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null')
    if (p && (p.step === 'sort' || p.step === 'maxdiff' || p.step === 'interests') && decodeOrder(encodeOrder(p.order))) return p
  } catch {}
  return null
}

/* ------------------------------------------------------------------- helpers */
function mount(html) {
  root.innerHTML = html
  return root.firstElementChild
}
function go(step, patch = {}) { Object.assign(state, patch, { step }); saveProgress(); render() }

/** Flow progress: primer → sort → 10 trade-offs → 12 quick-fire → results. */
function flowPct() {
  if (state.step === 'primer') return 4
  if (state.step === 'sort') return 8 + Math.min(state.sortChanges, 3) * 6
  if (state.step === 'maxdiff') return 28 + Math.round((state.blockIndex / MAXDIFF_BLOCKS.length) * 44)
  if (state.step === 'interests') return 74 + Math.round((state.interestIndex / INTEREST_ITEMS.length) * 22)
  if (state.step === 'lived') return 60
  return 100
}
function topbar(onBack, counter = '') {
  return `
    <div class="topbar">
      ${onBack ? '<button class="backlink" data-back>← Back</button>' : '<span style="width:48px"></span>'}
      <div class="progress"><i style="width:${flowPct()}%"></i></div>
      <span class="counter">${counter}</span>
    </div>`
}

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
const pickOne = (a) => a[Math.floor(Math.random() * a.length)]
const prefersReduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Pop a small, value-relevant toast (+ particle burst) at a point, then fade. */
function spark(rect, valueId) {
  if (!rect) return
  const v = valueById(valueId)
  const color = (v && v.color) || '#a78bfa'
  const cx = Math.max(72, Math.min(window.innerWidth - 72, rect.left + rect.width / 2))
  const cy = rect.top

  const toast = document.createElement('div')
  toast.className = 'spark-toast'
  toast.style.left = `${cx}px`
  toast.style.top = `${cy}px`
  toast.style.setProperty('--c', color)
  toast.innerHTML = `<span class="spark-ic">${VALUE_ICON[valueId] || '✨'}</span><span>${pickOne(SPARK_LINES[valueId] || ['Noted.'])}</span>`
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
  const last = loadLast()
  const progress = loadProgress()
  const node = mount(`
    <section class="view">
      <div class="card">
        <div class="eyebrow">Compass · self-discovery</div>
        <h1 class="display">The values test that <em>shows its work</em></h1>
        <p class="lede">
          A first honest map of your priorities — what you'd keep and what you'd
          trade away — on the <strong>Schwartz model of basic human values</strong>.
          You'll sort, then make real trade-offs; we cross-check the two and
          <strong>show you our confidence</strong>, including where we're unsure.
        </p>
        <div class="btn-row">
          <button class="btn" data-begin>Begin →</button>
          <span class="fine">~4 minutes · a sort + 10 trade-offs</span>
        </div>
        ${progress ? '<p class="fine" style="margin-top:14px"><button class="linklike" data-resume>Resume where you left off →</button></p>' : ''}
        ${last ? '<p class="fine" style="margin-top:6px"><button class="linklike" data-last>View your last result →</button></p>' : ''}
        <p class="fine" style="margin-top:26px">
          A reflection aid, not a verdict: prototype items, not a clinical or validated
          assessment — and no five-minute quiz can read your “true self.”
          Your answers never leave this device. <span style="opacity:.5">· ${BUILD}</span>
        </p>
      </div>
    </section>`)
  node.querySelector('[data-begin]').addEventListener('click', () => go('primer'))
  node.querySelector('[data-resume]')?.addEventListener('click', () => {
    const p = loadProgress()
    if (p) go(p.step, { order: p.order, sortChanges: p.sortChanges, sortConfirmed: p.sortConfirmed, blockIndex: p.blockIndex, choices: p.choices, interestIndex: p.interestIndex || 0, interestAnswers: p.interestAnswers || {} })
  })
  node.querySelector('[data-last]')?.addEventListener('click', () => {
    const r = decodeResult(loadLast() || '')
    if (r) go('results', { order: r.order, choices: r.choices, interestAnswers: r.interests || {}, lived: r.lived, shared: false })
  })
}

/* -------------------------------------------------------------------- primer */
/** The design bible's "single most important ACT step": frame the construct
 *  before measuring it, so people don't sort goals or achievements. */
function viewPrimer() {
  const node = mount(`
    <section class="view">
      <div class="card">
        ${topbar(true, 'Before you sort')}
        <div class="qhead">
          <h2>Values are <em>directions</em>, not destinations</h2>
        </div>
        <p class="lede" style="font-size:17px">
          A goal can be reached — <em>“run a marathon.”</em> A value is a direction you
          keep walking — <em>“living healthily.”</em> You're about to sort directions:
          not what you should want, not what you've achieved — what you'd
          actually steer by when you can't have everything.
        </p>
        <div class="ipanel good" style="margin-top:18px">
          <h4>Honest answers only work if you know this</h4>
          <ul>
            <li>There are <strong>no good or bad values</strong> here — Power and Tradition are as legitimate as Benevolence.</li>
            <li>Sort by what you'd <strong>actually protect</strong>, not what sounds admirable.</li>
            <li>Every position counts — the middle too.</li>
          </ul>
        </div>
        <div class="stickyfoot">
          <button class="btn" data-start>Start sorting →</button>
        </div>
      </div>
    </section>`)
  node.querySelector('[data-back]')?.addEventListener('click', () => go('welcome'))
  node.querySelector('[data-start]').addEventListener('click', () =>
    go('sort', { order: shuffle(VALUE_IDS), sortChanges: 0, sortConfirmed: false, blockIndex: 0, choices: [] }))
}

/* --------------------------------------------------------------------- sort */
const TUT_KEY = 'compass-sort-tut3' // bumped: keyboard + single full sort
const seenTutorial = () => { try { return !!localStorage.getItem(TUT_KEY) } catch { return false } }
const markTutorial = () => { try { localStorage.setItem(TUT_KEY, '1') } catch {} }

function sortCard(id, rank, total) {
  const v = valueById(id)
  return `
    <div class="sortcard" data-id="${id}" style="--c:${v.color}" role="listitem" tabindex="0"
         aria-roledescription="sortable value" aria-label="${v.short}. Position ${rank + 1} of ${total}.">
      <span class="sc-grip" aria-hidden="true" title="Drag to reorder">⠿</span>
      <span class="sc-emoji" aria-hidden="true">${VALUE_ICON[id] || ''}</span>
      <span class="sc-text">${v.short}</span>
    </div>`
}

/** One view for both the importance sort and the optional "lived" re-sort. */
function viewSort() {
  const livedMode = state.step === 'lived'
  const order = livedMode ? state.lived : state.order
  const changes = livedMode ? state.livedChanges : state.sortChanges
  const confirmed = livedMode ? state.livedConfirmed : state.sortConfirmed
  const ready = changes >= 1 || confirmed
  const cards = order.map((id, i) => sortCard(id, i, order.length)).join('')

  const tutorial = seenTutorial() ? '' : `
    <div class="tut" data-tut>
      <div class="tut-card">
        <div class="tut-demo" aria-hidden="true">
          <span class="td-lbl td-top">most ↑</span>
          <div class="td-row r1"><span class="td-grip">⠿</span></div>
          <div class="td-row r2"><span class="td-grip">⠿</span></div>
          <div class="td-row rdrag"><span class="td-grip">⠿</span><span class="td-tag">🧭</span></div>
          <div class="td-row r3"><span class="td-grip">⠿</span></div>
          <span class="td-finger">👆</span>
          <span class="td-lbl td-bot">least ↓</span>
        </div>
        <h3>Drag to sort</h3>
        <p>Drag what matters <strong>most</strong> to you up to the <strong>top</strong>, and what matters <strong>least</strong> down to the <strong>bottom</strong>.</p>
        <p class="tut-fine">Keyboard works too: focus a card, press Space to grab, arrows to move, Space to drop.</p>
        <button class="btn" data-tut-ok>Got it →</button>
      </div>
    </div>`

  const node = mount(`
    <section class="view">
      <div class="card">
        <div class="stickyhead">
          ${topbar(true, livedMode ? 'Reality check' : 'All 10 values')}
          <div class="qhead">
            <div class="k">${livedMode ? 'One more sort — your actual weeks' : 'One sort · every position counts'}</div>
            <h2>${livedMode
              ? 'Sort by what your last two weeks <em>actually served</em>'
              : 'Drag what matters <em>most</em> to the top'}</h2>
            <p class="qsub">${livedMode
              ? 'Not what you value — what your time, energy, and attention really went to.'
              : '…and what matters <em>least</em> to the bottom. All ten compete — every position feeds your map.'}</p>
          </div>
        </div>
        <div class="ranklbl ranklbl-top">▲ ${livedMode ? 'Got the most of my weeks' : 'Matters most'}</div>
        <div class="sortlist" data-list role="list" aria-label="${livedMode ? 'Sort values by lived time' : 'Sort values by importance'}">${cards}</div>
        <div class="ranklbl ranklbl-bot">▼ ${livedMode ? 'Got the least' : 'Matters least'}</div>
        <div class="sr-live" aria-live="polite" data-live></div>
        <div class="stickyfoot">
          <button class="btn" data-next ${ready ? '' : 'disabled'}>${livedMode ? 'See your gap →' : 'Next: the trade-offs →'}</button>
          ${ready ? '' : '<button class="btn ghost" data-asis>This order is already right →</button>'}
          <span class="fine" data-hint>${ready ? 'Looks right? Fine-tune, or move on.' : 'Drag to reorder — or confirm if it already reads true.'}</span>
        </div>
      </div>
      ${tutorial}
    </section>`)

  node.querySelector('[data-back]')?.addEventListener('click', () =>
    livedMode ? go('results', { livedJustDone: false }) : go('primer'))
  node.querySelector('[data-tut-ok]')?.addEventListener('click', () => { markTutorial(); render() })
  node.querySelector('[data-asis]')?.addEventListener('click', () => {
    if (livedMode) { state.livedConfirmed = true } else { state.sortConfirmed = true }
    proceedFromSort(livedMode)
  })
  node.querySelector('[data-next]')?.addEventListener('click', () => {
    const ok = livedMode ? (state.livedChanges >= 1 || state.livedConfirmed) : (state.sortChanges >= 1 || state.sortConfirmed)
    if (ok) proceedFromSort(livedMode)
  })
  const list = node.querySelector('[data-list]')
  wireDragSort(list, livedMode)
  wireKeyboardSort(list, livedMode)
}

function proceedFromSort(livedMode) {
  if (livedMode) go('results', { livedJustDone: true })
  else go('maxdiff', { blockIndex: 0, choices: [] })
}

function commitOrder(list, livedMode) {
  const next = Array.from(list.querySelectorAll('.sortcard')).map((c) => c.dataset.id)
  const prev = livedMode ? state.lived : state.order
  const changed = next.some((id, i) => id !== prev[i])
  if (livedMode) state.lived = next
  else state.order = next
  if (changed) {
    if (livedMode) state.livedChanges += 1
    else state.sortChanges += 1
  }
  saveProgress()
  return changed
}

/** Refresh footer state + stale aria position labels in place (no re-render). */
function updateSortChrome(livedMode) {
  const changes = livedMode ? state.livedChanges : state.sortChanges
  const confirmed = livedMode ? state.livedConfirmed : state.sortConfirmed
  const ready = changes >= 1 || confirmed
  const next = root.querySelector('[data-next]')
  if (next) next.disabled = !ready
  const asis = root.querySelector('[data-asis]')
  if (asis && ready) asis.remove()
  const hint = root.querySelector('[data-hint]')
  if (hint) hint.textContent = ready ? 'Looks right? Fine-tune, or move on.' : 'Drag to reorder — or confirm if it already reads true.'
  const bar = root.querySelector('.progress > i')
  if (bar) bar.style.width = `${flowPct()}%`
  const cards = root.querySelectorAll('.sortcard')
  cards.forEach((c, i) => {
    const v = valueById(c.dataset.id)
    c.setAttribute('aria-label', `${v.short}. Position ${i + 1} of ${cards.length}.`)
  })
}

function announce(msg) {
  const live = root.querySelector('[data-live]')
  if (live) { live.textContent = ''; setTimeout(() => { live.textContent = msg }, 30) }
}

/* Keyboard reorder: focus a card, Space/Enter grabs, arrows move, Space drops,
   Escape cancels. Every committed move counts toward the engagement gate. */
function wireKeyboardSort(list, livedMode) {
  if (!list) return
  let grabbed = null // dataset.id of the grabbed card
  list.addEventListener('keydown', (e) => {
    const card = e.target.closest?.('.sortcard')
    if (!card) return
    const cards = Array.from(list.querySelectorAll('.sortcard'))
    const idx = cards.indexOf(card)
    const v = valueById(card.dataset.id)
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (grabbed === card.dataset.id) {
        grabbed = null
        card.classList.remove('kbd-grabbed')
        commitOrder(list, livedMode)
        updateSortChrome(livedMode)
        announce(`${v.name} dropped at position ${idx + 1} of ${cards.length}.`)
      } else {
        list.querySelectorAll('.kbd-grabbed').forEach((c) => c.classList.remove('kbd-grabbed'))
        grabbed = card.dataset.id
        card.classList.add('kbd-grabbed')
        announce(`${v.name} grabbed. Use arrow keys to move, Space to drop.`)
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const delta = e.key === 'ArrowUp' ? -1 : 1
      if (grabbed === card.dataset.id) {
        const swap = cards[idx + delta]
        if (!swap) return
        if (delta < 0) list.insertBefore(card, swap)
        else list.insertBefore(swap, card)
        card.focus()
        announce(`${v.name} moved to position ${idx + 1 + delta} of ${cards.length}.`)
      } else {
        cards[Math.max(0, Math.min(cards.length - 1, idx + delta))]?.focus()
      }
    } else if (e.key === 'Escape' && grabbed) {
      e.preventDefault()
      grabbed = null
      card.classList.remove('kbd-grabbed')
      announce('Move cancelled.')
    }
  })
}

/**
 * Pointer drag-to-reorder with LIVE displacement: the dragged card (translucent)
 * tracks the finger 1:1; the other cards smoothly shift to open a gap where it
 * would land. Rects are cached once on grab (no per-move layout reads). The
 * reorder only commits on drop — and only a real order CHANGE counts toward
 * the engagement gate (pixel wiggles don't).
 */
function wireDragSort(list, livedMode) {
  if (!list) return
  let drag = null; let dir = 0; let raf = 0

  // Final index the dragged card would land at = how many other cards sit above the pointer.
  const targetIndex = () => {
    const pageY = drag.lastY + window.scrollY
    let c = 0
    for (const m of drag.meta) { if (m.i === drag.origIdx) continue; if (m.mid < pageY) c++ }
    return c
  }

  // FLIP: translate each non-dragged card by the EXACT delta to its new slot,
  // so it works with variable card heights (no gaps, no overlaps).
  const layout = (c) => {
    const order = drag.meta.map((m) => m.i).filter((i) => i !== drag.origIdx)
    order.splice(Math.max(0, Math.min(order.length, c)), 0, drag.origIdx)
    let cum = drag.startTop
    const newTop = {}
    for (const i of order) { newTop[i] = cum; cum += drag.meta[i].h + drag.gap }
    for (const m of drag.meta) {
      if (m.i === drag.origIdx) continue
      const dy = newTop[m.i] - m.top
      m.el.style.transform = dy ? `translate3d(0, ${dy.toFixed(1)}px, 0)` : ''
    }
  }

  const paint = (clientY) => {
    drag.lastY = clientY
    const pageY = clientY + window.scrollY
    drag.card.style.transform = `translate3d(0, ${(pageY - drag.startPageY).toFixed(1)}px, 0) scale(1.02)`
    const c = targetIndex()
    if (c !== drag.idx) { drag.idx = c; layout(c) }
    const top = 118; const bot = window.innerHeight - 126
    dir = clientY < top ? -1 : clientY > bot ? 1 : 0
    if (dir && !raf) raf = requestAnimationFrame(tick)
  }

  const tick = () => {
    if (!drag || !dir) { raf = 0; return }
    window.scrollBy(0, dir * 12)
    paint(drag.lastY) // pageY shifts with scroll → card stays glued, gaps stay correct
    raf = requestAnimationFrame(tick)
  }

  list.addEventListener('pointerdown', (e) => {
    const card = e.target.closest('.sortcard'); if (!card || e.button === 2) return
    e.preventDefault()
    try { window.getSelection().removeAllRanges() } catch {}
    const all = Array.from(list.querySelectorAll('.sortcard'))
    const cs = getComputedStyle(list)
    const gap = parseFloat(cs.rowGap || cs.gap) || 10
    const meta = all.map((el, i) => ({ el, i, h: el.offsetHeight, top: el.offsetTop, mid: el.getBoundingClientRect().top + window.scrollY + el.offsetHeight / 2 }))
    drag = { card, meta, origIdx: all.indexOf(card), gap, startTop: meta[0].top, startPageY: e.clientY + window.scrollY, lastY: e.clientY, idx: -1 }
    card.classList.add('dragging'); list.classList.add('is-dragging')
    try { card.setPointerCapture(e.pointerId) } catch {}
    paint(e.clientY)
  })
  list.addEventListener('pointermove', (e) => { if (drag) paint(e.clientY) })

  const end = () => {
    if (!drag) return
    dir = 0; if (raf) { cancelAnimationFrame(raf); raf = 0 }
    const d = drag; drag = null
    const c = d.idx < 0 ? d.origIdx : d.idx
    const order = d.meta.map((m) => m.i).filter((i) => i !== d.origIdx)
    order.splice(Math.max(0, Math.min(order.length, c)), 0, d.origIdx)

    // FLIP settle: record current positions → reorder the DOM in place + clear
    // transforms → animate each card from where it was to its final slot. No
    // re-render (no innerHTML rebuild), so there's no blip/reload on drop.
    const firsts = d.meta.map((m) => ({ el: m.el, top: m.el.getBoundingClientRect().top }))
    d.card.classList.remove('dragging'); list.classList.remove('is-dragging')
    for (const i of order) { d.meta[i].el.style.transform = ''; list.appendChild(d.meta[i].el) }
    for (const f of firsts) {
      const dy = f.top - f.el.getBoundingClientRect().top
      if (dy) { f.el.style.transition = 'none'; f.el.style.transform = `translateY(${dy.toFixed(1)}px)` }
    }
    requestAnimationFrame(() => {
      for (const f of firsts) {
        if (!f.el.style.transform) continue
        f.el.style.transition = 'transform .18s cubic-bezier(.2,.7,.3,1)'
        f.el.style.transform = ''
      }
      setTimeout(() => { for (const f of firsts) f.el.style.transition = '' }, 220)
    })

    if (commitOrder(list, livedMode)) updateSortChrome(livedMode)
  }
  list.addEventListener('pointerup', end)
  list.addEventListener('pointercancel', end)
}

/* ------------------------------------------------------------------- maxdiff */
/** Each value appears in exactly 4 blocks and has 4 facets — show a FRESH
 *  phrasing on each appearance so the same value never reads verbatim twice.
 *  Display-only: scoring stays keyed by value id. */
function facetFor(id, blockIndex) {
  const v = valueById(id)
  const facets = v.facets && v.facets.length ? v.facets : [v.short]
  let n = 0
  for (let i = 0; i <= blockIndex; i++) if (MAXDIFF_BLOCKS[i].valueIds.includes(id)) n++
  return facets[(n - 1 + facets.length) % facets.length]
}

/** Per-block reframes: the SAME best/least task through a different lens, so
 *  block 7 doesn't look like block 2. Zero psychometric impact. */
const MD_FRAMES = [
  { k: 'You can’t keep all four', h: 'Which matters <em>most</em> — and which <em>least</em>?' },
  { k: 'A normal Tuesday', h: 'What quietly drives an <em>ordinary</em> day?' },
  { k: 'Under pressure', h: 'If you could protect just <em>one</em>, which?' },
  { k: 'The one you’d defend', h: 'Which would you <em>argue for</em> to someone who disagreed?' },
  { k: 'Strip away the polish', h: 'Ignore what looks good on paper — what’s <em>left</em>?' },
  { k: 'Your hardest week', h: 'Which of these still holds when things are <em>hard</em>?' },
  { k: 'Where your time goes', h: 'Which one actually gets your <em>hours</em>?' },
  { k: 'The trade you’d make', h: 'Which would you give up <em>last</em>?' },
  { k: 'Close to the bone', h: 'Which feels most like <em>you</em> — and least?' },
  { k: 'Last one', h: 'One more: what <em>wins</em>, and what gives?' },
]

function viewMaxdiff() {
  const block = MAXDIFF_BLOCKS[state.blockIndex]
  const chosen = state.choices.find((c) => c.blockId === block.id) || { blockId: block.id, best: null, worst: null }
  const last = state.blockIndex >= MAXDIFF_BLOCKS.length - 1
  const ready = chosen.best && chosen.worst

  const rows = block.valueIds.map((id) => {
    const v = valueById(id)
    const cls = chosen.best === id ? ' most' : chosen.worst === id ? ' least' : ''
    return `
      <div class="md-row${cls}" data-id="${id}">
        <span class="label"><span class="vemoji" aria-hidden="true">${VALUE_ICON[id] || ''}</span><span class="dot" style="background:${valueInk(id)};color:${valueInk(id)}"></span><span class="txt">${facetFor(id, state.blockIndex)}</span></span>
        <span class="pick">
          <button class="most${chosen.best === id ? ' on' : ''}" data-most="${id}" aria-pressed="${chosen.best === id}">Most</button>
          <button class="least${chosen.worst === id ? ' on' : ''}" data-least="${id}" aria-pressed="${chosen.worst === id}">Least</button>
        </span>
      </div>`
  }).join('')

  const node = mount(`
    <section class="view">
      <div class="card">
        <div class="stickyhead">
          ${topbar(true, `Trade-off ${state.blockIndex + 1} of ${MAXDIFF_BLOCKS.length}`)}
          <div class="qhead">
            <div class="k">${MD_FRAMES[state.blockIndex % MD_FRAMES.length].k}</div>
            <h2>${MD_FRAMES[state.blockIndex % MD_FRAMES.length].h}</h2>
            <p class="qsub">This is where honesty lives: every option is legitimate, but they can't all win.</p>
          </div>
        </div>
        <div class="md-list">${rows}</div>
        <div class="stickyfoot">
          <button class="btn" data-next ${ready ? '' : 'disabled'}>${last ? 'Last round: 12 quick hits →' : 'Next →'}</button>
          <span class="fine">${ready ? 'Locked in? On you go.' : 'Pick one Most and one Least.'}</span>
        </div>
      </div>
    </section>`)

  node.querySelector('[data-back]')?.addEventListener('click', () => {
    if (state.blockIndex > 0) go('maxdiff', { blockIndex: state.blockIndex - 1 })
    else go('sort')
  })
  node.querySelectorAll('[data-most]').forEach((b) => b.addEventListener('click', () => {
    const id = b.getAttribute('data-most')
    const c = { blockId: block.id, best: id, worst: chosen.worst === id ? null : chosen.worst }
    state.choices = [...state.choices.filter((x) => x.blockId !== block.id), c]
    spark(b.getBoundingClientRect(), id)
    saveProgress(); render()
  }))
  node.querySelectorAll('[data-least]').forEach((b) => b.addEventListener('click', () => {
    const id = b.getAttribute('data-least')
    const c = { blockId: block.id, best: chosen.best === id ? null : chosen.best, worst: id }
    state.choices = [...state.choices.filter((x) => x.blockId !== block.id), c]
    saveProgress(); render()
  }))
  node.querySelector('[data-next]')?.addEventListener('click', () => {
    if (!ready) return
    if (last) go('interests', { interestIndex: 0 })
    else go('maxdiff', { blockIndex: state.blockIndex + 1 })
  })
}

/* ----------------------------------------------------------------- interests */
/**
 * Quick-fire work-interests round: 12 rapid taps, one card at a time.
 * A DIFFERENT kind of question (Holland/RIASEC work activities) — it measures
 * the hands-on/people/persuading dimensions that values are blind to, which
 * is what sharpens a "no clear lean" career read. Skippable: values-only
 * results still work; the skip is honest, not punished.
 */
function viewInterests() {
  const i = state.interestIndex
  const item = INTEREST_ITEMS[i]
  const last = i >= INTEREST_ITEMS.length - 1
  const picked = state.interestAnswers[item.id]

  const node = mount(`
    <section class="view">
      <div class="card">
        <div class="stickyhead">
          ${topbar(true, `Quick fire ${i + 1} of ${INTEREST_ITEMS.length}`)}
          <div class="qhead">
            <div class="k">Gut answer — don't overthink it</div>
            <h2>Would you <em>enjoy</em> this?</h2>
          </div>
        </div>
        <div class="qf-card" style="animation-delay:0s">
          <div class="qf-emoji" aria-hidden="true">${item.emoji}</div>
          <p class="qf-text">${item.text}</p>
        </div>
        <div class="qf-btns" role="group" aria-label="Would you enjoy this?">
          <button class="qf-btn qf-no${picked === -1 ? ' on' : ''}" data-ans="-1">👎<span>Not for me</span></button>
          <button class="qf-btn qf-mid${picked === 0 ? ' on' : ''}" data-ans="0">🤷<span>Not sure</span></button>
          <button class="qf-btn qf-yes${picked === 1 ? ' on' : ''}" data-ans="1">👍<span>Sounds fun</span></button>
        </div>
        <div class="stickyfoot">
          <button class="btn ghost" data-skip>Skip the quick fire → values-only results</button>
          <span class="fine">Why this round? Values can't see hands-on vs. people work — these 12 can. ~45 seconds.</span>
        </div>
      </div>
    </section>`)

  node.querySelector('[data-back]')?.addEventListener('click', () => {
    if (i > 0) go('interests', { interestIndex: i - 1 })
    else go('maxdiff', { blockIndex: MAXDIFF_BLOCKS.length - 1 })
  })
  node.querySelector('[data-skip]')?.addEventListener('click', () => go('results', { shared: false }))
  node.querySelectorAll('[data-ans]').forEach((b) => b.addEventListener('click', () => {
    const v = Number(b.getAttribute('data-ans'))
    state.interestAnswers = { ...state.interestAnswers, [item.id]: v }
    saveProgress()
    b.classList.add('on')
    if (v === 1 && !prefersReduced()) burst(b.getBoundingClientRect().left + b.offsetWidth / 2, b.getBoundingClientRect().top, '#5eead4')
    setTimeout(() => {
      if (last) go('results', { shared: false })
      else go('interests', { interestIndex: i + 1 })
    }, prefersReduced() ? 0 : 170)
  }))
}

/* ------------------------------------------------------------------- results */
/** Map a signed lean (~ z-score range) to a 2–98% knob position. */
const knobPos = (v, scale = 22) => 50 + Math.max(-46, Math.min(46, v * scale))

const CONF_LABEL = { high: 'both signals agree', medium: 'signals lean together', low: 'your signals disagree', single: 'one signal only' }

/** One small, concrete ACT-style step per value, for the lived-gap card. */
const ACTION_HINTS = {
  self_direction: 'block two hours this week that are entirely yours to direct',
  stimulation: 'put one genuinely new thing on this week’s calendar',
  hedonism: 'plan one unhurried pleasure — and don’t multitask it',
  achievement: 'name the one result this week that would feel like real progress',
  power: 'take the lead on one decision you’ve been deferring',
  security: 'fix one small thing that’s been quietly worrying you',
  conformity: 'repair one expectation you’ve been letting slide with people who matter',
  tradition: 'do one ritual properly — a call, a meal, an observance',
  benevolence: 'give one person an hour with no agenda',
  universalism: 'act once, concretely, on the issue you keep caring about from a distance',
}

function computeProfile() {
  const ranking = scoreRanking(state.order)
  const maxdiff = scoreMaxDiff(MAXDIFF_BLOCKS, state.choices)
  return buildProfile({ tiers: ranking, maxdiff })
}

function viewResults() {
  const profile = computeProfile()
  const identity = synthesizeIdentity(profile)
  const interests = Object.keys(state.interestAnswers).length ? scoreInterests(state.interestAnswers) : null
  const career = careerReport(profile, VALUE_BY_ID, 3, interests)
  const work = workInsights(profile)
  const compass = relationshipCompass(profile)
  const love = loveInsights(profile)
  const signal = relationshipSignal(profile)
  const idColor = hoColor(identity.accentDim)
  const list = (items) => items.map((t) => `<li>${t}</li>`).join('')

  // Persist + permalink: the URL fragment IS the result (nothing leaves the device).
  const code = encodeResult({ order: state.order, choices: state.choices, interests: state.interestAnswers, lived: state.lived })
  if (!state.shared) saveLast(code)
  try { history.replaceState(null, '', `#r=${code}`) } catch {}

  /* ---- convergence & confidence ---- */
  const agreeCount = VALUE_IDS.filter((id) => profile.valueConfidence[id] !== 'low').length
  const conv = profile.convergence ?? 0
  const convLine = conv >= 0.6
    ? `Your sort and your trade-offs <strong>agreed on ${agreeCount} of 10 values</strong> — a consistent snapshot.`
    : conv >= 0.3
      ? `Your sort and your trade-offs agreed on ${agreeCount} of 10 values — decent agreement, so hold the details loosely.`
      : `Your sort and your trade-offs <strong>disagreed noticeably</strong> (${agreeCount} of 10 aligned). Treat this whole snapshot loosely — or retake when you have quiet.`

  /* ---- provenance, reframed as a FLEX (not a hedge): proof it's yours ---- */
  const top1 = profile.ranked[0]
  const bestPicks = state.choices.filter((c) => c.best === top1).length
  const appearances = MAXDIFF_BLOCKS.filter((b) => b.valueIds.includes(top1)).length
  const provenance = `This isn't a generic read — you ranked <strong>${valueById(top1).name}</strong> #1 and stood by it in ${bestPicks} of the ${appearances} trade-offs it faced.`

  /* ---- the crown: one vivid line, built from the user's OWN values ---- */
  const crown = identity.crown
  const crownHtml = crown.balanced
    ? `<p class="id-crown">Balanced across directions — no single pull to name, and that's a real result.</p>`
    : `<p class="id-crown">${crown.lead} — you'd sooner lose <span style="color:${valueInk(crown.bottomId)}">${crown.bottomNoun}</span> than <span style="color:${valueInk(crown.topId)}">${crown.topNoun}</span>.</p>`

  /* ---- Scene 1: YOUR COMPASS — shape first, then the vivid line, then honesty ---- */
  const chip = (id) => `<span class="chip conf-${profile.valueConfidence[id]}"><span class="d"></span>${CONF_LABEL[profile.valueConfidence[id]]}</span>`
  const drivers = profile.ranked.slice(0, 3).map((id, i) => {
    const v = valueById(id)
    return `
      <div class="driver">
        <span class="dn">${i + 1}</span>
        <div class="dbody">
          <strong style="color:${valueInk(id)}">${v.name}</strong> ${chip(id)}
          <small>${v.blurb}</small>
        </div>
      </div>`
  }).join('')
  const axisBars = identity.axes.map((a) => `
    <div class="cdim">
      <div class="clabels"><span>${a.left}</span><span>${a.right}</span></div>
      <div class="ctrack"><span class="cmid"></span><span class="cknob" style="left:${knobPos(a.value)}%"></span></div>
      <p class="creflect">${a.strength === 'balanced' ? 'Genuinely balanced — no lean to report.' : `A ${a.strength} lean, drawn from your own ranking.`}</p>
    </div>`).join('')
  /* ---- the leading-pair signature: synthesis of the user's top-2 ---- */
  const sig = pairSignature(profile)
  const sigHtml = sig
    ? `<div class="pair-sig">
         <p class="sig-lede">Together, they make you <em>${sig.epithet}</em>.</p>
         <p class="sig-essence">${sig.essence}</p>
         <p class="scene-fine sig-shadow">The shadow side: ${sig.shadow}</p>
       </div>`
    : ''
  const sceneIdentity = `
    <section class="scene scene-identity scene-hero" style="--accent:${idColor}">
      <div class="scene-inner center">
        <div class="eyebrow">Your compass</div>
        <div class="hero-shape" role="img" aria-label="Your values map. Top values: ${identity.traits.join(', ')}.">${renderCircumplex(profile, { theme })}</div>
        ${crownHtml}
        <h1 class="id-name" style="font-size:clamp(26px,5vw,40px)">${identity.headline}</h1>
        ${sigHtml}
        <div class="drivers" style="text-align:left">${drivers}</div>
        <p class="scene-fine">${provenance}</p>
        <p class="scene-fine">${convLine}</p>
      </div>
      <div class="scroll-cue" aria-hidden="true">scroll ↓</div>
    </section>`

  /* ---- Scene 2: THE FORCES — the two axes + how-to-read (on demand) ---- */
  const domGated = profile.higherMargin >= 0.15
    ? `Your centre of gravity is <strong>${HIGHER_ORDER_META[profile.dominantHigher].name}</strong>.`
    : `Your pull is <strong>balanced</strong> across directions — no single centre of gravity, which is a real result, not a failure to find one.`
  const sceneValues = `
    <section class="scene scene-values">
      <div class="scene-inner">
        <div class="eyebrow">The forces underneath</div>
        <h2 class="scene-h2" style="color:${idColor}">What pulls your shape</h2>
        <p class="scene-fine">${domGated}</p>
        ${(() => { const sp = distinctiveSplit(profile); return sp ? `<p class="split-note">◈ ${sp.text}</p>` : '' })()}
        <div class="compass">${axisBars}</div>
        <p class="id-portrait" style="margin-top:20px">${identity.portrait}</p>
        <details class="howto">
          <summary>How to read your shape ↑</summary>
          <p class="scene-fine">Each dot on your compass is one value — the further from the centre, the more it matters to you.
          Values on opposite sides pull against each other${profile.circumplex.magnitude >= 0.5 ? '; the glowing arrow is your overall pull' : ''}.
          Every position is relative to <em>your own</em> ranking, not to other people.</p>
        </details>
      </div>
    </section>`

  /* ---- Scene 2.5: HOW IT SHOWS UP — derived aspects + deep reads ---- */
  const aspects = deriveAspects(profile)
  const gaugeTicks = Array.from({ length: 9 }, (_, i) => {
    const ga = Math.PI * (1 - i / 8)
    const x1 = 75 + 62 * Math.cos(ga), y1 = 78 - 62 * Math.sin(ga)
    const x2 = 75 + (i % 4 === 0 ? 54 : 58) * Math.cos(ga), y2 = 78 - (i % 4 === 0 ? 54 : 58) * Math.sin(ga)
    return `<line class="g-tick" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`
  }).join('')
  const aspectCards = aspects.map((a) => `
    <div class="aspect-card">
      <div class="aspect-k">${a.title}</div>
      <svg class="gauge-svg" viewBox="0 0 150 84" aria-hidden="true" data-lean="${a.lean.toFixed(3)}">
        <path class="g-arc" d="M 13 78 A 62 62 0 0 1 137 78"/>
        ${gaugeTicks}
        <line class="g-needle" x1="75" y1="78" x2="75" y2="22"/>
        <circle class="g-pivot" cx="75" cy="78" r="3.4"/>
      </svg>
      <div class="aspect-label">${a.variant.label}</div>
      <p class="aspect-body">${a.variant.body}</p>
      ${a.drivers.length ? `<div class="aspect-prov">drawn from ${a.drivers.map((d) => `<span style="color:${valueInk(d)}">${valueById(d).name}</span>`).join(' + ')}</div>` : '<div class="aspect-prov">no single pattern — genuinely context-driven</div>'}
      ${a.hedged ? '<div class="aspect-prov">⚠ your two signals disagreed on the drivers here — hold loosely</div>' : ''}
    </div>`).join('')
  const reads = deepReads(profile, 3)
  const deepHtml = reads.map((r) => `
    <details class="deepread" style="--accent:${valueInk(r.id)}">
      <summary><span class="dr-name" style="color:${valueInk(r.id)}">${r.name}</span><span class="dr-hint">the deep read →</span></summary>
      <div class="dr-body">
        <p class="dr-goal"><strong>What it's really after:</strong> ${r.goal}</p>
        <p class="rolelabel" style="margin-top:12px">You'll recognise it here</p>
        <ul class="dr-list">${r.shows_up.map((x) => `<li>${x}</li>`).join('')}</ul>
        <p class="dr-shadow"><strong>Its shadow:</strong> ${r.shadow}</p>
        <p class="dr-misread"><strong>How people misread it:</strong> ${r.misread}</p>
      </div>
    </details>`).join('')
  const sceneAspects = `
    <section class="scene scene-aspects">
      <div class="scene-inner">
        <div class="eyebrow">How it shows up</div>
        <h2 class="scene-h2" style="color:${idColor}">Your values, in motion</h2>
        <p class="scene-fine">Five patterns derived from your ranking — each one names its sources, so you can check the reasoning.</p>
        <div class="aspect-grid">${aspectCards}</div>
        <p class="rolelabel" style="margin-top:28px">Your top three, in depth</p>
        <div class="deepreads">${deepHtml}</div>
        <p class="scene-fine" style="margin-top:14px">These are tendencies drawn from what you chose to protect — not traits, not a diagnosis. Where a pattern misses, that miss is information too.</p>
      </div>
    </section>`

  /* ---- Scene 3: WORK — abstains honestly when the signal is weak, and
          offers the ONE thing that actually sharpens it: different questions ---- */
  const primary = career[0]
  let sceneWork
  if (career.lowSignal && !career.usedInterests) {
    sceneWork = `
      <section class="scene scene-work" style="--accent:${idColor}">
        <div class="scene-inner">
          <div class="eyebrow">The work that fits you</div>
          <h2 class="scene-h2">No clear lean yet — and we won't invent one</h2>
          <p class="arch-story">Your values alone don't separate enough for an honest career read: the closest direction
          (<strong>${primary.name}</strong>) isn't distinguishable from what a random sort produces. Most quizzes would
          bluff here. The fix isn't more of the same questions — it's a <em>different kind</em>: 12 rapid-fire
          "would you enjoy this?" work questions that measure what values can't (hands-on vs. people vs. persuading).</p>
          ${state.shared ? '' : '<button class="btn" data-sharpen style="margin-top:16px">Sharpen it: 12 quick questions (~45s) →</button>'}
          <p class="scene-fine" style="margin-top:12px">Or: the one-minute reality check at the end — where your weeks
          actually go often says more than a sort.</p>
        </div>
      </section>`
  } else if (career.lowSignal) {
    sceneWork = `
      <section class="scene scene-work" style="--accent:${idColor}">
        <div class="scene-inner">
          <div class="eyebrow">The work that fits you</div>
          <h2 class="scene-h2">Still no clear lean — that's a real answer</h2>
          <p class="arch-story">Even with your quick-fire answers blended in, no direction separates from the pack
          (<strong>${primary.name}</strong> is closest). That usually means genuine breadth: several kinds of work could
          fit, and the deciding factors live outside a sort — the team, the autonomy, the stage of life. The
          reality check below will tell you more than another quiz would.</p>
        </div>
      </section>`
  } else {
    const roles = primary.roles.map((r) => `<span class="role">${r}</span>`).join('')
    const bandLabel = (b) => b === 'strong' ? 'strong lean' : b === 'clear' ? 'clear lean' : 'a lean'
    const bandHtml = (primary.band === 'strong' || primary.band === 'clear')
      ? `<div class="arch-band band-${primary.band}">${bandLabel(primary.band)} · beats ~${primary.band === 'strong' ? '95' : '90'}% of random answers</div>`
      : ''
    // Honest interests read on the primary: back it up, or pull against it.
    const fitNote = career.usedInterests && typeof primary.interestFit === 'number'
      ? (primary.interestFit >= 0.3
        ? `<p class="scene-fine">✓ Your quick-fire answers <strong>back this up</strong> — the day-to-day activities of this direction are ones you said you'd enjoy.</p>`
        : primary.interestFit <= -0.3
          ? `<p class="scene-fine">⚠ Worth knowing: your quick-fire answers <strong>pull the other way</strong> — you like this direction's <em>why</em> more than its day-to-day. Hold it loosely.</p>`
          : '')
      : ''
    // Top-3 directions: #2 and #3 as concrete, actionable cards.
    const dirCards = career.slice(1, 3).map((a) => `
      <div class="dir-card" style="--accent:${archInk(a)}">
        <div class="dir-head"><strong>${a.rank}. ${a.name}</strong>${a.band !== 'weak' ? `<span class="dir-band">${bandLabel(a.band)}</span>` : ''}</div>
        <p class="dir-tag">${a.tagline}</p>
        <div class="roles">${a.roles.slice(0, 3).map((r) => `<span class="role">${r}</span>`).join('')}</div>
        <p class="dir-try"><strong>Try this week:</strong> ${a.action}</p>
        <a class="dir-link" href="${a.onet}" target="_blank" rel="noopener">Explore real roles (O*NET) →</a>
      </div>`).join('')
    sceneWork = `
      <section class="scene scene-work" style="--accent:${archInk(primary)}">
        <div class="scene-inner">
          <div class="eyebrow">The work that fits you · your top 3 directions</div>
          <div class="arch-hero" data-key="${primary.key}">
            ${archetypeArt(primary, { light: themeMode(theme) === 'light' })}
            <img class="arch-photo" alt="" data-src="./img/archetype-${primary.key}.webp">
            ${bandHtml}
          </div>
          <h2 class="scene-h2 arch-name">1. ${primary.name}</h2>
          <p class="arch-tag">${primary.tagline}</p>
          <p class="arch-story">${primary.reasoning}</p>
          ${fitNote}
          ${primary.caveat ? `<p class="scene-fine calib">⚠ ${primary.caveat}</p>` : ''}
          <div class="panel-grid">
            <div class="ipanel good"><h4>You thrive when</h4><ul>${list(work.thrive)}</ul></div>
            <div class="ipanel warn"><h4>What drains you</h4><ul>${list(work.drains)}</ul></div>
          </div>
          <p class="rolelabel">Roles that tend to fit</p>
          <div class="roles">${roles}</div>
          <div class="ipanel good" style="margin-top:16px"><h4>Do one thing with it</h4><ul>
            <li><strong>This week:</strong> ${primary.action}</li>
            <li><a class="dir-link" href="${primary.onet}" target="_blank" rel="noopener">Browse real ${primary.riasec.split('+')[0].trim()} occupations on O*NET →</a></li>
            <li>Which of these roles have you already gravitated toward — and what does that tell you?</li>
          </ul></div>
          <p class="rolelabel" style="margin-top:22px">Runners-up worth testing</p>
          <div class="dir-grid">${dirCards}</div>
          ${(!career.usedInterests && !state.shared) ? `<p class="scene-fine" style="margin-top:14px">Want this sharper? <button class="linklike" data-sharpen>Answer 12 quick work questions (~45s) →</button></p>` : ''}
          <p class="scene-fine calib">Honest calibration: values-fit predicts job <em>satisfaction</em> only modestly
          (~3–4% of the variance)${career.usedInterests ? ', and your interest answers are a 12-item snapshot, not a validated inventory' : ''} —
          these are directions you'll likely <em>enjoy</em>, not what you'll be best at, and not destiny. The "try this week"
          steps are cheap real-world tests: run them before any big move.</p>
        </div>
      </section>`
  }

  /* ---- Scene 4: LOVE — reflection + conversation, never partner-shopping ---- */
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
          <div class="ipanel good"><h4>Worth naming out loud</h4><ul>${list(love.talk)}</ul></div>
          <div class="ipanel warn"><h4>Worth noticing about you</h4><ul>${list(love.noticing)}</ul></div>
        </div>
        <p class="rolelabel">The dynamics underneath</p>
        <div class="compass">${dims}</div>
        <p class="signal">✨ ${signal.text}</p>
        <p class="scene-fine">There's no single “type” to find — research says compatibility can't be predicted from
        values alone, so we won't prescribe a partner. This maps how <em>you</em> tend to love, so you can choose, and talk, with clear eyes.</p>
      </div>
    </section>`

  /* ---- Scene 5: tensions + the stated-vs-lived gap ---- */
  const tensions = profile.tensions.length
    ? `<div class="tensions">
         ${profile.tensions.map((t) => `<div class="tension">${valueById(t.a).name} <span class="vs">⟷</span> ${valueById(t.b).name}</div>`).join('')}
       </div>
       <p class="scene-fine">Opposing values you <em>both</em> rank near the top — the real trade-offs you navigate, in work and in love.</p>`
    : `<p class="scene-fine">No strong internal tug-of-war surfaced — your top values sit on the same side of the circle.</p>`

  let gapHtml = ''
  if (state.lived) {
    const impRank = Object.fromEntries(state.order.map((id, i) => [id, i]))
    const livRank = Object.fromEntries(state.lived.map((id, i) => [id, i]))
    const gaps = VALUE_IDS
      .map((id) => ({ id, delta: livRank[id] - impRank[id], imp: impRank[id] + 1, liv: livRank[id] + 1 }))
      .sort((a, b) => b.delta - a.delta)
    const neglected = gaps.filter((g) => g.delta >= 3 && g.imp <= 5).slice(0, 2)
    gapHtml = neglected.length
      ? `<div class="ipanel warn" id="gap"><h4>Your stated-vs-lived gap</h4><ul>
          ${neglected.map((g) => `<li>You rank <strong>${valueById(g.id).name}</strong> #${g.imp} — but your last two weeks served it #${g.liv}.
          One small step: ${ACTION_HINTS[g.id]}.</li>`).join('')}
        </ul><p class="scene-fine" style="margin-top:10px">A gap isn't a failure — weeks bend to constraints. It's the most useful thing this page can show you.</p></div>`
      : `<div class="ipanel good" id="gap"><h4>Your stated-vs-lived gap</h4>
          <p class="scene-fine">Your weeks track your priorities closely — alignment is the quiet win. Re-check in a month; drift is normal.</p></div>`
  } else {
    gapHtml = `
      <div class="ipanel" id="gap"><h4>Reality check (1 minute)</h4>
        <p class="scene-fine">These were your <em>stated</em> priorities. Now sort the same ten by what your last two weeks
        <em>actually served</em> — the divergence is usually the most honest thing here.</p>
        <button class="btn" data-lived style="margin-top:10px">Sort my actual weeks →</button>
      </div>`
  }

  const sceneClose = `
    <section class="scene scene-close">
      <div class="scene-inner">
        <div class="eyebrow">The tensions you carry</div>
        <h2 class="scene-h2">Where you'll feel the pull</h2>
        ${tensions}
        ${gapHtml}
        <div class="disclaimer">
          <p class="scene-fine">
            <strong>A mirror, not a verdict.</strong> A prototype built on the Schwartz circumplex — not a personality
            type, not clinical, not validated. The useful question isn't “is this exactly right?” but “where does it
            ring true — and where doesn't it?”
          </p>
        </div>
        <div class="foot">
          ${state.shared ? '<button class="btn" data-takeit>Take it yourself →</button>' : `
          <div class="btn-row" style="justify-content:center">
            <button class="btn" data-share>Copy link to this result</button>
            <button class="btn ghost" data-restart>Start again</button>
          </div>
          <p class="scene-fine" style="margin-top:8px">The link holds only your answers — nothing is stored on any server.</p>`}
          <p class="scene-fine" style="margin-top:14px"><a href="../docs/RESEARCH_values-to-career-and-partner.md" target="_blank" rel="noopener">The research behind this →</a></p>
        </div>
      </div>
    </section>`

  const sharedBanner = state.shared
    ? '<div class="ipanel" style="margin:12px auto;max-width:640px"><p class="scene-fine">You\'re viewing a shared result. It reflects someone\'s answers, not yours.</p></div>'
    : ''
  mount(`<div class="story">${sharedBanner}${sceneIdentity}${sceneValues}${sceneAspects}${sceneWork}${sceneLove}${sceneClose}</div>`)

  // Anticipation beat: a brief "reading" veil while the compass shape draws
  // itself in, so the reveal lands as a moment. Skipped for reduced-motion and
  // for shared/saved views (already seen). No claim of extra certainty — it's
  // the same uncertainty-gated shape, just given a beat to arrive.
  if (!prefersReduced() && !state.shared && !hashResult) {
    const veil = document.createElement('div')
    veil.className = 'reading-veil'
    veil.innerHTML = '<span class="reading-dot"></span><span>Reading your compass…</span>'
    document.body.appendChild(veil)
    requestAnimationFrame(() => veil.classList.add('show'))
    setTimeout(() => { veil.classList.remove('show'); veil.classList.add('gone') }, 1250)
    setTimeout(() => veil.remove(), 1750)
  }

  // Try to load the AI illustration for the primary archetype; if absent, the
  // generative SVG art behind it remains (graceful, offline-friendly).
  root.querySelectorAll('.arch-photo').forEach((img) => {
    const src = img.getAttribute('data-src')
    if (!src) return
    img.addEventListener('error', () => img.remove())
    img.addEventListener('load', () => img.classList.add('loaded'))
    img.setAttribute('src', src)
  })
  const RESET = { order: [], sortChanges: 0, sortConfirmed: false, blockIndex: 0, choices: [], interestIndex: 0, interestAnswers: {}, lived: null, livedChanges: 0, livedConfirmed: false, shared: false }
  root.querySelector('[data-restart]')?.addEventListener('click', () => {
    try { history.replaceState(null, '', location.pathname) } catch {}
    go('welcome', { ...RESET })
  })
  root.querySelector('[data-takeit]')?.addEventListener('click', () => {
    try { history.replaceState(null, '', location.pathname) } catch {}
    go('welcome', { ...RESET })
  })
  root.querySelector('[data-lived]')?.addEventListener('click', () =>
    go('lived', { lived: shuffle(VALUE_IDS), livedChanges: 0, livedConfirmed: false }))
  // "Sharpen it" from the career scene: jump into the quick-fire round; results
  // recompute with the blended signal when it finishes.
  root.querySelectorAll('[data-sharpen]').forEach((b) => b.addEventListener('click', () =>
    go('interests', { interestIndex: 0 })))
  root.querySelector('[data-share]')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget
    try {
      await navigator.clipboard.writeText(location.href)
      btn.textContent = 'Link copied ✓'
      setTimeout(() => { btn.textContent = 'Copy link to this result' }, 1800)
    } catch {
      prompt('Copy this link:', location.href)
    }
  })
  // Instrument needles swing to their reading when the gauges scroll into view.
  const reducedMotion = prefersReduced()
  root.querySelectorAll('.gauge-svg').forEach((g) => {
    const needle = g.querySelector('.g-needle')
    const deg = Number(g.getAttribute('data-lean')) * 72
    if (reducedMotion) { needle.style.transform = `rotate(${deg}deg)`; return }
    new IntersectionObserver((es, o) => es.forEach((e) => {
      if (e.isIntersecting) { needle.style.transform = `rotate(${deg}deg)`; o.disconnect() }
    }), { threshold: 0.5 }).observe(g)
  })

  // The crown types itself — once per result, not on theme re-renders.
  const crownNode = root.querySelector('.id-crown')
  if (crownNode && !reducedMotion && crownTypedFor !== code) {
    crownTypedFor = code
    const parts = Array.from(crownNode.childNodes).map((n) => ({ n, t: n.textContent }))
    parts.forEach((prt) => { prt.n.textContent = '' })
    const total = parts.reduce((sum, prt) => sum + prt.t.length, 0)
    const t0 = performance.now()
    const CPS = 42 // characters per second — wall-clock, so throttled tabs catch up
    ;(function step() {
      let want = Math.min(total, Math.floor(((performance.now() - t0) / 1000) * CPS))
      let acc = 0
      for (const prt of parts) {
        const take = Math.max(0, Math.min(prt.t.length, want - acc))
        prt.n.textContent = prt.t.slice(0, take)
        acc += prt.t.length
      }
      if (want < total) setTimeout(step, 30)
    })()
  }

  if (state.livedJustDone) {
    state.livedJustDone = false
    setTimeout(() => document.getElementById('gap')?.scrollIntoView({ behavior: 'smooth' }), 350)
  }
}
let crownTypedFor = null

/* -------------------------------------------------------------------- render */
function render() {
  if (state.step === 'welcome') viewWelcome()
  else if (state.step === 'primer') viewPrimer()
  else if (state.step === 'sort' || state.step === 'lived') viewSort()
  else if (state.step === 'maxdiff') viewMaxdiff()
  else if (state.step === 'interests') viewInterests()
  else if (state.step === 'results') viewResults()
  // Enable gentle scene-by-scene scroll-snap only on the results story.
  document.body.dataset.view = state.step === 'results' ? 'story' : 'flow'
  // Scroll to top only when the STEP changes — not on every selection
  // re-render (so tapping a value doesn't yank the page up).
  const viewKey = `${state.step}:${state.blockIndex}:${state.interestIndex}`
  if (viewKey !== lastViewKey) { window.scrollTo({ top: 0, behavior: 'smooth' }); lastViewKey = viewKey }
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

// Boot: a #r=… fragment IS a result (shared link or saved permalink) — decode
// and show it. A malformed fragment falls through to the welcome screen.
const hashResult = /^#r=(.+)$/.exec(location.hash || '')
if (hashResult) {
  const r = decodeResult(decodeURIComponent(hashResult[1]))
  if (r) {
    const own = loadLast() === decodeURIComponent(hashResult[1])
    Object.assign(state, { step: 'results', order: r.order, choices: r.choices, interestAnswers: r.interests || {}, lived: r.lived, shared: !own })
  }
}
render()
startStars()

// Register the service worker so the app is installable & works offline.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
  })
}
