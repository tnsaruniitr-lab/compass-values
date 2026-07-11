// @ts-check
/** Renders the values circumplex as an animated SVG. Pure string output. */
import { VALUES, VALUE_BY_ID, HIGHER_ORDER_META, HIGHER_ORDER_DEEP, VALUE_INK } from '../engine/index.js'

/** Per-theme drawing palette — the four Observatory nocturnes (+ legacy aliases).
 *  The instrument language is constant (hairline rings, fine ticks, brass-family
 *  stroke, glowing constellation); only the pigments change per palette. */
const OBS_DARK_COMMON = {
  wedge: 0.05,
  vecTip: '#E8E4D8',
  deepHO: false,
}
const PALETTES = {
  midnight: {
    ...OBS_DARK_COMMON,
    ring: 'rgba(201,169,106,0.22)', axis: 'rgba(126,137,176,0.16)', tick: 'rgba(201,169,106,0.4)',
    blob: [['0%', '#C9A96A', '0.30'], ['55%', '#a78bfa', '0.18'], ['100%', '#38bdf8', '0.08']],
    blobStroke: '#C9A96A', blobStrokeOp: 0.9,
    vec: ['#E8E4D8', '#C9A96A'],
    center: '#E8E4D8', mutedLabel: 'rgba(169,175,196,0.62)',
  },
  abyss: {
    ...OBS_DARK_COMMON,
    ring: 'rgba(191,164,94,0.22)', axis: 'rgba(123,150,140,0.16)', tick: 'rgba(191,164,94,0.4)',
    blob: [['0%', '#BFA45E', '0.28'], ['55%', '#8FC5B0', '0.18'], ['100%', '#38bdf8', '0.07']],
    blobStroke: '#BFA45E', blobStrokeOp: 0.9,
    vec: ['#E2E8E0', '#BFA45E'],
    center: '#E2E8E0', mutedLabel: 'rgba(165,186,176,0.62)',
  },
  nebula: {
    ...OBS_DARK_COMMON,
    ring: 'rgba(201,169,106,0.22)', axis: 'rgba(138,127,168,0.18)', tick: 'rgba(201,169,106,0.4)',
    blob: [['0%', '#C9A96A', '0.26'], ['55%', '#B08FC9', '0.2'], ['100%', '#f0518f', '0.07']],
    blobStroke: '#C9A96A', blobStrokeOp: 0.9,
    vec: ['#E8E2F0', '#C9A96A'],
    center: '#E8E2F0', mutedLabel: 'rgba(176,168,196,0.62)',
  },
  dawn: {
    ring: 'rgba(90,72,38,0.3)', axis: 'rgba(90,72,38,0.18)', tick: 'rgba(90,72,38,0.42)', wedge: 0.1,
    blob: [['0%', '#8A6D34', '0.26'], ['55%', '#c47ad8', '0.16'], ['100%', '#ffb39c', '0.14']],
    blobStroke: '#8A6D34', blobStrokeOp: 0.85,
    vec: ['#5a4826', '#8A6D34'], vecTip: '#4a3a1e',
    center: '#2E2A20', mutedLabel: '#6B6350', deepHO: true,
  },
}
// Legacy aliases (old saved themes / older call sites).
PALETTES.dark = PALETTES.midnight
PALETTES.bloom = PALETTES.dawn

const SIZE = 460
const C = SIZE / 2
const R = 168 // base ring radius

/** Polar → screen (90° = up; y inverted). */
function pt(angleDeg, r) {
  const a = (angleDeg * Math.PI) / 180
  return [C + r * Math.cos(a), C - r * Math.sin(a)]
}

/** Closed Catmull-Rom spline through points → smooth blob path. */
function smoothClosedPath(points) {
  const n = points.length
  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)} `
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `
  }
  return d + 'Z'
}

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x))

/**
 * @param {ReturnType<typeof import('../engine/index.js').buildProfile>} profile
 * @param {{theme?: 'dark'|'bloom'}} [opts]
 */
export function renderCircumplex(profile, opts = {}) {
  const P = PALETTES[opts.theme] || PALETTES.dark
  const hoColor = (id) => (P.deepHO ? HIGHER_ORDER_DEEP[id] : HIGHER_ORDER_META[id].color)
  // On light palettes, top-value LABEL text uses the deep legible ink (dots stay neon).
  const valueInk = (id) => (P.deepHO ? (VALUE_INK[id] || VALUE_BY_ID[id].color) : VALUE_BY_ID[id].color)
  const lo = -1.6; const hi = 1.6
  const radiusFor = (c) => (0.16 + 0.82 * clamp((c - lo) / (hi - lo), 0, 1)) * R

  // Blob points in canonical circle order
  const blobPts = VALUES.map((v) => pt(v.angle, radiusFor(profile.combined[v.id])))
  const blobPath = smoothClosedPath(blobPts)

  // Quadrant tints (4 apex wedges)
  const wedges = Object.entries(HIGHER_ORDER_META).map(([id, m]) => {
    const a0 = m.apex - 45; const a1 = m.apex + 45
    const [x0, y0] = pt(a0, R + 18); const [x1, y1] = pt(a1, R + 18)
    return `<path d="M ${C} ${C} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R + 18} ${R + 18} 0 0 0 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${hoColor(id)}" opacity="${P.wedge}"/>`
  }).join('')

  // Guide rings
  const rings = [0.4, 0.7, 1].map((t) =>
    `<circle cx="${C}" cy="${C}" r="${(R * t).toFixed(1)}" fill="none" stroke="${P.ring}" stroke-width="1"/>`,
  ).join('')

  // Fine astrolabe ticks around the outer ring (major every 36°, minor every 6°)
  const ticks = []
  for (let deg = 0; deg < 360; deg += 6) {
    const major = deg % 36 === 0
    const [tx1, ty1] = pt(deg, R)
    const [tx2, ty2] = pt(deg, R - (major ? 10 : 5))
    ticks.push(`<line x1="${tx1.toFixed(1)}" y1="${ty1.toFixed(1)}" x2="${tx2.toFixed(1)}" y2="${ty2.toFixed(1)}" stroke="${P.tick || P.ring}" stroke-width="0.8" opacity="${major ? 0.85 : 0.4}"/>`)
  }
  const tickMarks = ticks.join('')

  // Cross axes
  const axes = [[90, 270], [0, 180]].map(([p, q]) => {
    const [x0, y0] = pt(p, R); const [x1, y1] = pt(q, R)
    return `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${P.axis}" stroke-width="1"/>`
  }).join('')

  // Value nodes + labels, sized by rank emphasis
  const maxAbs = Math.max(...VALUES.map((v) => Math.abs(profile.combined[v.id]))) || 1
  const nodes = VALUES.map((v, i) => {
    const score = profile.combined[v.id]
    const [nx, ny] = pt(v.angle, radiusFor(score))
    const emphasis = clamp((score + 0.2) / (maxAbs + 0.2), 0.12, 1)
    const rad = 3 + emphasis * 6
    // Most labels sit at the rim (well spaced, 36° apart). The two values that
    // sit ON the horizontal apex line (0°/180°) are pulled inward so they never
    // collide with the OPENNESS / CONSERVATION apex words at the far rim.
    const onAxis = v.angle % 180 === 0
    const labelR = onAxis ? R * 0.64 : R + 30
    const [lx, ly] = pt(v.angle, labelR)
    const anchor = onAxis ? 'middle' : lx < C - 12 ? 'end' : lx > C + 12 ? 'start' : 'middle'
    const isTop = profile.top.includes(v.id)
    const labelColor = isTop ? valueInk(v.id) : P.mutedLabel
    const labelWeight = isTop ? 600 : 400
    return `
      <g class="circ-node" style="animation-delay:${(1.1 + i * 0.05).toFixed(2)}s">
        <circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${rad.toFixed(1)}" fill="${v.color}" opacity="${(0.45 + emphasis * 0.55).toFixed(2)}"/>
        <circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${(rad + 2.5).toFixed(1)}" fill="none" stroke="${v.color}" stroke-width="1" opacity="${(emphasis * 0.5).toFixed(2)}"/>
        <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle"
              font-size="15" font-weight="${labelWeight}" fill="${labelColor}" font-family="Inter, sans-serif">${v.name}</text>
      </g>`
  }).join('')

  // Apex labels (higher-order). The viewBox is padded so these sit fully inside
  // it and scale down cleanly on mobile (never clipped at the screen edge).
  const SHORT = { self_transcendence: 'TRANSCENDENCE', openness: 'OPENNESS', self_enhancement: 'ENHANCEMENT', conservation: 'CONSERVATION' }
  const apexLabels = Object.entries(HIGHER_ORDER_META).map(([id]) => {
    const [x, y] = pt(HIGHER_ORDER_META[id].apex, R + 50)
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"
       font-size="12.5" letter-spacing="1.6" font-weight="700" fill="${hoColor(id)}" opacity="${P.deepHO ? '1' : '0.9'}"
       font-family="Inter, sans-serif">${SHORT[id]}</text>`
  }).join('')

  // Dominant direction vector — GATED on magnitude: a near-directionless
  // profile gets no arrow (the old 18%-minimum drew confident direction from
  // zero-magnitude data — exactly the pseudo-precision the plan forbids).
  const showVector = profile.circumplex.magnitude >= 0.5
  const vmag = clamp(profile.circumplex.magnitude / 4, 0, 1) * R * 0.92
  const [vx, vy] = pt(profile.circumplex.angle, vmag)

  return `
  <div class="circ-wrap">
    <svg viewBox="-80 -12 620 484" role="img" aria-label="Your values circumplex">
      <defs>
        <radialGradient id="blobFill" cx="50%" cy="50%" r="60%">
          <stop offset="${P.blob[0][0]}" stop-color="${P.blob[0][1]}" stop-opacity="${P.blob[0][2]}"/>
          <stop offset="${P.blob[1][0]}" stop-color="${P.blob[1][1]}" stop-opacity="${P.blob[1][2]}"/>
          <stop offset="${P.blob[2][0]}" stop-color="${P.blob[2][1]}" stop-opacity="${P.blob[2][2]}"/>
        </radialGradient>
        <linearGradient id="vecGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${P.vec[0]}"/>
          <stop offset="100%" stop-color="${P.vec[1]}"/>
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      ${wedges}
      ${rings}
      ${tickMarks}
      ${axes}

      <path class="circ-blob" d="${blobPath}" fill="url(#blobFill)" stroke="${P.blobStroke}" stroke-width="1.5" stroke-opacity="${P.blobStrokeOp}" filter="url(#glow)"/>

      ${showVector ? `<g filter="url(#glow)">
        <line class="circ-vector" x1="${C}" y1="${C}" x2="${vx.toFixed(1)}" y2="${vy.toFixed(1)}"
              stroke="url(#vecGrad)" stroke-width="3" stroke-linecap="round" pathLength="1"/>
        <circle cx="${vx.toFixed(1)}" cy="${vy.toFixed(1)}" r="5" fill="${P.vecTip}"/>
      </g>` : ''}

      ${nodes}
      ${apexLabels}
      <circle cx="${C}" cy="${C}" r="3.5" fill="${P.center}"/>
    </svg>
  </div>`
}
