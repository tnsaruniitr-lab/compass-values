// @ts-check
/**
 * Generative, on-brand SVG "hero" art for each career archetype.
 *
 * This is the always-present FALLBACK that makes the story look beautiful with
 * zero external assets. When an AI-generated illustration is dropped into
 *   web/img/archetype-<key>.webp
 * it is layered on top of this art (see app.js); until then, this shows.
 *
 * Deterministic per archetype (seeded from the key), so each one has a stable,
 * distinct look that harmonises with the app's aurora aesthetic + the
 * archetype accent colour.
 */

/** Tiny deterministic PRNG (mulberry32) seeded from a string. */
function seededRand(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
/** Lighten/darken a #rrggbb by amt in [-1,1]. */
function shade(color, amt) {
  const c = color.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  const f = amt < 0 ? 0 : 255
  const t = Math.abs(amt)
  return `#${hex(r + (f - r) * t)}${hex(g + (f - g) * t)}${hex(b + (f - b) * t)}`
}

/**
 * @param {{key:string, accent:string}} archetype
 * @param {{theme?:string}} [opts]
 * @returns {string} an <svg> string (decorative; aria-hidden)
 */
export function archetypeArt(archetype, { theme = 'dark' } = {}) {
  const { key, accent } = archetype
  const rnd = seededRand(key)
  const W = 800; const H = 520
  const dark = theme !== 'bloom'
  const base0 = dark ? '#0a0816' : '#fff7f2'
  const base1 = dark ? '#161031' : '#ffe9df'
  const accLight = shade(accent, 0.35)
  const accDeep = shade(accent, -0.25)

  // 3–4 soft aurora blobs in accent family, placed by seed.
  const blobs = Array.from({ length: 4 }, (_, i) => {
    const cx = 120 + rnd() * (W - 240)
    const cy = 80 + rnd() * (H - 160)
    const r = 150 + rnd() * 220
    const col = [accent, accLight, accDeep, shade(accent, dark ? 0.15 : -0.1)][i % 4]
    const op = dark ? 0.5 - i * 0.07 : 0.4 - i * 0.06
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="url(#g_${key}_${i})" opacity="${op.toFixed(2)}"/>`
  }).join('')

  const blobGrads = Array.from({ length: 4 }, (_, i) => {
    const col = [accent, accLight, accDeep, shade(accent, dark ? 0.15 : -0.1)][i % 4]
    return `<radialGradient id="g_${key}_${i}"><stop offset="0%" stop-color="${col}" stop-opacity="0.9"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/></radialGradient>`
  }).join('')

  // A "constellation" line motif — story-like, unique per archetype.
  const pts = Array.from({ length: 6 }, () => ({
    x: 90 + rnd() * (W - 180),
    y: 70 + rnd() * (H - 140),
  }))
  const lines = pts.slice(1).map((p, i) =>
    `<line x1="${pts[i].x.toFixed(0)}" y1="${pts[i].y.toFixed(0)}" x2="${p.x.toFixed(0)}" y2="${p.y.toFixed(0)}" stroke="${accLight}" stroke-width="1.2" opacity="0.5"/>`,
  ).join('')
  const dots = pts.map((p, i) =>
    `<circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="${(2.5 + rnd() * 3).toFixed(1)}" fill="${dark ? '#ffffff' : accDeep}" opacity="${(0.55 + rnd() * 0.4).toFixed(2)}"/>`,
  ).join('')

  return `<svg class="gen-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="base_${key}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${base0}"/><stop offset="100%" stop-color="${base1}"/>
      </linearGradient>
      ${blobGrads}
    </defs>
    <rect width="${W}" height="${H}" fill="url(#base_${key})"/>
    <g filter="blur(0.5px)">${blobs}</g>
    <g>${lines}${dots}</g>
  </svg>`
}
