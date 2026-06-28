// @ts-check
/**
 * Bespoke, per-archetype SVG illustrations for the career reveal.
 *
 * Each archetype gets a distinct, hand-built emblem (a relevant motif) set over
 * a soft aurora, themed by the archetype's accent colour and adapted for light
 * or dark backgrounds. Fully owned, scalable, instant, offline — and a clear
 * upgrade over a generic constellation. (If a raster AI illustration is later
 * dropped into web/img/archetype-<key>.webp it layers on top; see app.js.)
 */

const hex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
/** Lighten (amt>0 toward white) / darken (amt<0 toward black) a #rrggbb. */
function shade(color, amt) {
  const c = color.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16); const g = parseInt(c.slice(2, 4), 16); const b = parseInt(c.slice(4, 6), 16)
  const f = amt < 0 ? 0 : 255; const t = Math.abs(amt)
  return `#${hex(r + (f - r) * t)}${hex(g + (f - g) * t)}${hex(b + (f - b) * t)}`
}

const CX = 400; const CY = 248
/** 4-point sparkle. */
const star = (x, y, r, fill, cls = '') =>
  `<path class="${cls}" d="M${x} ${y - r} L${(x + r * 0.26).toFixed(1)} ${(y - r * 0.26).toFixed(1)} L${x + r} ${y} L${(x + r * 0.26).toFixed(1)} ${(y + r * 0.26).toFixed(1)} L${x} ${y + r} L${(x - r * 0.26).toFixed(1)} ${(y + r * 0.26).toFixed(1)} L${x - r} ${y} L${(x - r * 0.26).toFixed(1)} ${(y - r * 0.26).toFixed(1)} Z" fill="${fill}"/>`
const dot = (x, y, r, fill, op = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${op}"/>`

/** Each motif: (ink=line, hi=highlight, accent) => svg fragment, centred on CX/CY. */
const MOTIFS = {
  creative: (ink, hi, ac) => `
    <path d="M${CX + 64} ${CY - 96} a64 64 0 1 0 16 80 a50 50 0 1 1 -16 -80 Z" fill="${ac}" opacity="0.9"/>
    <path d="M${CX - 150} ${CY + 64} C${CX - 70} ${CY - 60} ${CX + 30} ${CY + 110} ${CX + 120} ${CY - 8}" fill="none" stroke="${ink}" stroke-width="13" stroke-linecap="round"/>
    <path d="M${CX - 132} ${CY + 96} C${CX - 56} ${CY + 4} ${CX + 44} ${CY + 138} ${CX + 138} ${CY + 22}" fill="none" stroke="${ac}" stroke-width="6" stroke-linecap="round" opacity="0.5"/>
    ${star(CX - 96, CY - 36, 15, hi, 'tw')}${star(CX + 150, CY + 48, 11, hi, 'tw')}${star(CX + 96, CY - 118, 9, ac, 'tw')}`,

  founder: (ink, hi, ac) => `
    <path d="M${CX} ${CY - 116} L${CX + 74} ${CY + 28} L${CX + 27} ${CY + 28} L${CX + 27} ${CY + 104} L${CX - 27} ${CY + 104} L${CX - 27} ${CY + 28} L${CX - 74} ${CY + 28} Z" fill="${ac}"/>
    <path d="M${CX} ${CY - 92} L${CX + 50} ${CY + 18} L${CX + 27} ${CY + 18} L${CX + 27} ${CY + 86} L${CX - 27} ${CY + 86} L${CX - 27} ${CY + 18} L${CX - 50} ${CY + 18} Z" fill="${hi}" opacity="0.18"/>
    ${star(CX, CY - 150, 13, hi, 'tw')}
    ${dot(CX - 70, CY + 96, 6, ac, 0.7)}${dot(CX + 70, CY + 96, 6, ac, 0.7)}${dot(CX - 96, CY + 70, 4, hi, 0.6)}${dot(CX + 96, CY + 70, 4, hi, 0.6)}`,

  steady: (ink, hi, ac) => `
    <path d="M${CX - 122} ${CY + 92} L${CX - 122} ${CY - 8} A122 122 0 0 1 ${CX + 122} ${CY - 8} L${CX + 122} ${CY + 92}" fill="none" stroke="${ink}" stroke-width="12" stroke-linecap="round"/>
    <rect x="${CX - 80}" y="${CY - 6}" width="20" height="98" rx="8" fill="${ac}"/>
    <rect x="${CX - 10}" y="${CY - 30}" width="20" height="122" rx="8" fill="${ac}"/>
    <rect x="${CX + 60}" y="${CY - 6}" width="20" height="98" rx="8" fill="${ac}"/>
    <rect x="${CX - 140}" y="${CY + 96}" width="280" height="14" rx="7" fill="${ink}"/>
    ${star(CX, CY - 92, 12, hi, 'tw')}`,

  helper: (ink, hi, ac) => {
    const ring = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2
      return dot((CX + Math.cos(a) * 150).toFixed(0), (CY + Math.sin(a) * 150).toFixed(0), i % 2 ? 5 : 7, hi, 0.5)
    }).join('')
    return `${ring}
      <path d="M${CX} ${CY + 60} C${CX - 86} ${CY - 6} ${CX - 58} ${CY - 86} ${CX} ${CY - 42} C${CX + 58} ${CY - 86} ${CX + 86} ${CY - 6} ${CX} ${CY + 60} Z" fill="${ac}"/>
      <path d="M${CX - 30} ${CY - 30} C${CX - 18} ${CY - 44} ${CX} ${CY - 40} ${CX + 2} ${CY - 24}" fill="none" stroke="${hi}" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`
  },

  expert: (ink, hi, ac) => {
    const nodes = [[CX - 60, CY - 50], [CX + 30, CY - 70], [CX + 70, CY + 10], [CX - 30, CY + 40], [CX - 90, CY + 10]]
    const lines = nodes.map((n, i) => { const m = nodes[(i + 2) % nodes.length]; return `<line x1="${n[0]}" y1="${n[1]}" x2="${m[0]}" y2="${m[1]}" stroke="${ac}" stroke-width="2.5" opacity="0.45"/>` }).join('')
    const pts = nodes.map((n) => dot(n[0], n[1], 6, ink, 0.9)).join('')
    return `${lines}${pts}
      <circle cx="${CX + 46}" cy="${CY + 24}" r="62" fill="none" stroke="${ink}" stroke-width="11"/>
      <circle cx="${CX + 46}" cy="${CY + 24}" r="62" fill="${ac}" opacity="0.10"/>
      <line x1="${CX + 92}" y1="${CY + 70}" x2="${CX + 150}" y2="${CY + 128}" stroke="${ink}" stroke-width="14" stroke-linecap="round"/>
      ${star(CX - 96, CY - 86, 11, hi, 'tw')}`
  },

  leader: (ink, hi, ac) => `
    <path d="M${CX - 116} ${CY + 40} L${CX - 116} ${CY - 40} L${CX - 56} ${CY + 14} L${CX} ${CY - 70} L${CX + 56} ${CY + 14} L${CX + 116} ${CY - 40} L${CX + 116} ${CY + 40} Z" fill="${ac}"/>
    <rect x="${CX - 116}" y="${CY + 44}" width="232" height="26" rx="10" fill="${ink}"/>
    ${dot(CX - 116, CY - 44, 11, hi, 0.95)}${dot(CX, CY - 76, 12, hi, 0.95)}${dot(CX + 116, CY - 44, 11, hi, 0.95)}
    ${dot(CX - 58, CY + 4, 7, hi, 0.5)}${dot(CX + 58, CY + 4, 7, hi, 0.5)}
    ${star(CX, CY - 120, 12, ac, 'tw')}`,

  changemaker: (ink, hi, ac) => {
    const rays = Array.from({ length: 9 }, (_, i) => {
      const a = (-Math.PI) + (i / 8) * Math.PI
      const x1 = CX + Math.cos(a) * 96; const y1 = (CY - 30) + Math.sin(a) * 96
      const x2 = CX + Math.cos(a) * 128; const y2 = (CY - 30) + Math.sin(a) * 128
      return `<line x1="${x1.toFixed(0)}" y1="${y1.toFixed(0)}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" stroke="${ac}" stroke-width="6" stroke-linecap="round" opacity="0.6"/>`
    }).join('')
    return `${rays}
      <circle cx="${CX}" cy="${CY - 30}" r="56" fill="${ac}" opacity="0.85"/>
      <path d="M${CX} ${CY + 100} L${CX} ${CY + 6}" stroke="${ink}" stroke-width="10" stroke-linecap="round"/>
      <path d="M${CX} ${CY + 30} C${CX - 60} ${CY + 16} ${CX - 64} ${CY - 30} ${CX - 64} ${CY - 30} C${CX - 20} ${CY - 24} ${CX} ${CY + 6} ${CX} ${CY + 30} Z" fill="${ink}"/>
      <path d="M${CX} ${CY + 48} C${CX + 56} ${CY + 34} ${CX + 60} ${CY - 6} ${CX + 60} ${CY - 6} C${CX + 20} ${CY} ${CX} ${CY + 24} ${CX} ${CY + 48} Z" fill="${ink}" opacity="0.8"/>
      ${star(CX + 120, CY - 96, 10, hi, 'tw')}`
  },

  maker: (ink, hi, ac) => {
    const gear = (gx, gy, R, teeth, color) => {
      const t = Array.from({ length: teeth }, (_, i) => {
        const a = (i / teeth) * Math.PI * 2
        const x = gx + Math.cos(a) * (R + 14); const y = gy + Math.sin(a) * (R + 14)
        return `<rect x="${(x - 7).toFixed(1)}" y="${(y - 7).toFixed(1)}" width="14" height="14" rx="3" transform="rotate(${(a * 180 / Math.PI).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${color}"/>`
      }).join('')
      return `${t}<circle cx="${gx}" cy="${gy}" r="${R}" fill="none" stroke="${color}" stroke-width="13"/><circle cx="${gx}" cy="${gy}" r="${R * 0.34}" fill="${color}"/>`
    }
    return `${gear(CX - 34, CY - 6, 58, 9, ink)}${gear(CX + 74, CY + 56, 38, 8, ac)}
      ${star(CX - 110, CY - 78, 11, hi, 'tw')}${star(CX + 116, CY - 40, 8, hi, 'tw')}`
  },
}

/**
 * @param {{key:string, accent:string}} archetype
 * @param {{light?:boolean}} [opts]
 * @returns {string} an <svg> string (decorative; aria-hidden)
 */
export function archetypeArt(archetype, { light = false } = {}) {
  const { key, accent } = archetype
  const W = 800; const H = 500
  const dark = !light
  const base0 = dark ? '#0b0918' : '#fbf4ee'
  const base1 = dark ? '#171033' : '#f3e7f0'
  const ink = dark ? shade(accent, 0.34) : shade(accent, -0.1)
  const hi = dark ? '#ffffff' : shade(accent, -0.34)
  const motif = (MOTIFS[key] || MOTIFS.creative)(ink, hi, accent)
  const u = `${key}-${dark ? 'd' : 'l'}` // unique gradient id suffix (per key + mode)

  return `<svg class="gen-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="b_${u}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${base0}"/><stop offset="100%" stop-color="${base1}"/>
      </linearGradient>
      <radialGradient id="glow_${u}" cx="50%" cy="46%" r="55%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="${dark ? 0.55 : 0.42}"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="b2_${u}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${shade(accent, dark ? 0.2 : -0.05)}" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#b_${u})"/>
    <circle cx="190" cy="120" r="240" fill="url(#b2_${u})" opacity="0.7"/>
    <circle cx="640" cy="400" r="220" fill="url(#b2_${u})" opacity="0.5"/>
    <rect width="${W}" height="${H}" fill="url(#glow_${u})"/>
    <g class="art-motif">${motif}</g>
  </svg>`
}
