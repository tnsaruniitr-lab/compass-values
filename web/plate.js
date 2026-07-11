// @ts-check
/**
 * The keepsake plate — a print-grade rendering of one result as an
 * Observatory star chart (portrait, 4:5, exports at 2400×3000 PNG).
 *
 * Everything is generated CLIENT-SIDE from the result itself: the starfield
 * is seeded from the result code (the same result always mints the same
 * plate), the chart is the user's own geometry, and the footer carries the
 * result fingerprint — so the artifact is verifiable, personal, and never
 * touches a server.
 */
import { VALUES, VALUE_BY_ID, valueById } from '../engine/index.js'

const W = 1600
const H = 2000
const INK = { night: '#0B0E1A', void: '#060810', raised: '#131A30', brass: '#C9A96A', brassDim: '#8f7a4e', star: '#E8E4D8', mist: '#7E89B0', ember: '#C96A5A' }

/* Deterministic PRNG (mulberry32) seeded from the result code. */
function seeded(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19) }
  let a = h >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Greedy word-wrap to a max chars-per-line budget. */
function wrap(text, max) {
  const words = String(text).split(/\s+/)
  const lines = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w }
    else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines
}

/**
 * Build the plate SVG string.
 * @param {{
 *   profile: any,
 *   crownText: string,
 *   epithet: string|null,
 *   code: string,
 *   fingerprint: string,
 *   dateLabel: string,
 *   inscription?: string,
 * }} d
 */
export function buildPlateSVG(d) {
  const rand = seeded(d.code)
  const el = []

  /* ground + frame */
  el.push(`<rect width="${W}" height="${H}" fill="${INK.void}"/>`)
  el.push(`<rect width="${W}" height="${H}" fill="url(#skyGlow)"/>`)
  for (let i = 0; i < 170; i++) {
    const x = rand() * W, y = rand() * H, r = 0.8 + rand() * 2.1, o = 0.25 + rand() * 0.6
    el.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${INK.star}" opacity="${o.toFixed(2)}"/>`)
  }
  el.push(`<rect x="52" y="52" width="${W - 104}" height="${H - 104}" fill="none" stroke="${INK.brass}" stroke-opacity="0.55" stroke-width="2"/>`)
  el.push(`<rect x="66" y="66" width="${W - 132}" height="${H - 132}" fill="none" stroke="${INK.brass}" stroke-opacity="0.25" stroke-width="1"/>`)
  for (const [cx, cy, dx, dy] of [[52, 52, 1, 1], [W - 52, 52, -1, 1], [52, H - 52, 1, -1], [W - 52, H - 52, -1, -1]]) {
    el.push(`<path d="M ${cx + dx * 34} ${cy} L ${cx} ${cy} L ${cx} ${cy + dy * 34}" fill="none" stroke="${INK.brass}" stroke-width="3"/>`)
  }

  /* masthead */
  el.push(`<text x="${W / 2}" y="150" text-anchor="middle" font-family="-apple-system,'Segoe UI',sans-serif" font-size="24" font-weight="700" letter-spacing="14" fill="${INK.brass}">C O M P A S S · O B S E R V A T I O N</text>`)
  el.push(`<text x="${W / 2}" y="192" text-anchor="middle" font-family="-apple-system,'Segoe UI',sans-serif" font-size="17" letter-spacing="4" fill="${INK.mist}">${esc(d.dateLabel)}</text>`)

  /* the chart */
  const C = W / 2, CY = 780, R = 430
  const pt = (deg, r) => { const a = (deg * Math.PI) / 180; return [C + r * Math.cos(a), CY - r * Math.sin(a)] }
  const rad = (s) => R * (0.18 + 0.8 * Math.max(0, Math.min(1, (s + 1.6) / 3.2)))
  for (const f of [0.38, 0.66, 1]) el.push(`<circle cx="${C}" cy="${CY}" r="${R * f}" fill="none" stroke="${INK.brass}" stroke-opacity="0.3" stroke-width="1.4"/>`)
  for (let deg = 0; deg < 360; deg += 6) {
    const major = deg % 36 === 0
    const [x1, y1] = pt(deg, R); const [x2, y2] = pt(deg, R - (major ? 20 : 10))
    el.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${INK.brass}" stroke-opacity="${major ? 0.6 : 0.28}" stroke-width="1.6"/>`)
  }
  const pts = VALUES.map((v) => pt(v.angle, rad(d.profile.combined[v.id] ?? 0)))
  let path = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} `
  const n = pts.length
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
    path += `C ${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)}, ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `
  }
  el.push(`<path d="${path}Z" fill="${INK.brass}" fill-opacity="0.08" stroke="${INK.brass}" stroke-width="3"/>`)
  const top3 = new Set(d.profile.ranked.slice(0, 3))
  for (const v of VALUES) {
    const s = d.profile.combined[v.id] ?? 0
    const [x, y] = pt(v.angle, rad(s))
    const lead = top3.has(v.id)
    el.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${lead ? 11 : 6}" fill="${lead ? INK.star : INK.mist}" opacity="${lead ? 1 : 0.7}"/>`)
    if (lead) el.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="19" fill="none" stroke="${INK.star}" stroke-opacity="0.4" stroke-width="1.5"/>`)
    const [lx, ly] = pt(v.angle, R + 52)
    const anchor = Math.abs(lx - C) < 20 ? 'middle' : lx < C ? 'end' : 'start'
    el.push(`<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" font-family="-apple-system,'Segoe UI',sans-serif" font-size="24" font-weight="${lead ? 700 : 400}" fill="${lead ? INK.star : INK.mist}">${esc(v.name)}</text>`)
  }
  if ((d.profile.circumplex?.magnitude ?? 0) >= 0.5) {
    const [vx, vy] = pt(d.profile.circumplex.angle, Math.min(1, d.profile.circumplex.magnitude / 4) * R * 0.92)
    el.push(`<line x1="${C}" y1="${CY}" x2="${vx.toFixed(1)}" y2="${vy.toFixed(1)}" stroke="${INK.star}" stroke-width="3.4" stroke-linecap="round"/>`)
    el.push(`<circle cx="${vx.toFixed(1)}" cy="${vy.toFixed(1)}" r="8" fill="${INK.star}"/>`)
  }
  el.push(`<circle cx="${C}" cy="${CY}" r="6" fill="${INK.brass}"/>`)

  /* the crown */
  let ty = 1430
  for (const line of wrap(d.crownText, 42)) {
    el.push(`<text x="${W / 2}" y="${ty}" text-anchor="middle" font-family="'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif" font-size="52" font-style="italic" fill="${INK.star}">${esc(line)}</text>`)
    ty += 66
  }

  /* the signature */
  if (d.epithet) {
    ty += 18
    el.push(`<line x1="${W / 2 - 130}" y1="${ty}" x2="${W / 2 + 130}" y2="${ty}" stroke="${INK.brass}" stroke-opacity="0.5" stroke-width="1.4"/>`)
    ty += 56
    el.push(`<text x="${W / 2}" y="${ty}" text-anchor="middle" font-family="'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif" font-size="40" font-style="italic" fill="${INK.brass}">${esc(d.epithet)}</text>`)
  }
  const names = d.profile.ranked.slice(0, 3).map((id) => VALUE_BY_ID[id].name)
  ty += 54
  el.push(`<text x="${W / 2}" y="${ty}" text-anchor="middle" font-family="-apple-system,'Segoe UI',sans-serif" font-size="22" letter-spacing="6" fill="${INK.mist}">${esc(names.join('   ✶   ').toUpperCase())}</text>`)

  /* optional inscription (typed by the owner, stays client-side) */
  if (d.inscription) {
    ty += 52
    el.push(`<text x="${W / 2}" y="${ty}" text-anchor="middle" font-family="'Iowan Old Style',Palatino,Georgia,serif" font-size="26" font-style="italic" fill="${INK.mist}">${esc(d.inscription).slice(0, 90)}</text>`)
  }

  /* colophon */
  el.push(`<text x="${W / 2}" y="${H - 118}" text-anchor="middle" font-family="-apple-system,'Segoe UI',sans-serif" font-size="17" letter-spacing="3" fill="${INK.mist}">SET BY COMPASS — THE VALUES TEST THAT SHOWS ITS WORK</text>`)
  el.push(`<text x="${W / 2}" y="${H - 88}" text-anchor="middle" font-family="-apple-system,'Segoe UI',sans-serif" font-size="15" letter-spacing="2" fill="${INK.brassDim}">trueself.carecompass.me · result ${esc(d.fingerprint)}</text>`)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <radialGradient id="skyGlow" cx="50%" cy="26%" r="80%">
      <stop offset="0%" stop-color="${INK.raised}"/>
      <stop offset="46%" stop-color="${INK.night}"/>
      <stop offset="100%" stop-color="${INK.void}"/>
    </radialGradient>
  </defs>
  ${el.join('\n  ')}
</svg>`
}

/** Rasterize the plate SVG to a PNG blob at print scale (default 2400×3000). */
export function plateToPNG(svgString, scale = 1.5) {
  return new Promise((resolve, reject) => {
    // data: URL (not blob:) so the strict CSP img-src 'self' data: allows it
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString)
    const img = new Image()
    img.onload = () => {
      try {
        const cv = document.createElement('canvas')
        cv.width = W * scale; cv.height = H * scale
        const ctx = cv.getContext('2d')
        ctx.drawImage(img, 0, 0, cv.width, cv.height)
        cv.toBlob((png) => (png ? resolve(png) : reject(new Error('PNG encode failed'))), 'image/png')
      } catch (e) { reject(e) }
    }
    img.onerror = () => reject(new Error('SVG rasterize failed'))
    img.src = url
  })
}

/** Trigger a client-side download of a blob. */
export function downloadBlob(blob, filename) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 400)
}
