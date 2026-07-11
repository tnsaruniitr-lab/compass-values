// @ts-check
/**
 * The receipts — the "shows its work" purchase made literal.
 *
 * Everything is generated CLIENT-SIDE from the result in hand:
 *  - a raw JSON export (answers + every computed number + engine version +
 *    a SHA-256 fingerprint of the result code), and
 *  - a printable methodology appendix (opens in a new tab; print → PDF)
 *    with the per-value agreement matrix and the noise-calibration math
 *    behind every band shown in the app.
 * No server, no account: the receipts are the user's own data, owned.
 */
import { VALUE_IDS, VALUE_BY_ID, MAXDIFF_BLOCKS } from '../engine/index.js'

/** SHA-256 → first 12 hex chars, the result "fingerprint". */
export async function fingerprintOf(code) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code))
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 12)
  } catch {
    // non-secure contexts: fall back to a plain checksum, clearly labelled
    let h = 0
    for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0
    return 'chk-' + h.toString(16)
  }
}

/**
 * Assemble the full receipts payload.
 * @param {{code: string, fingerprint: string, build: string, profile: any,
 *          order: string[], choices: any[], interests: any|null, career: any[]}} d
 */
export function receiptsJSON(d) {
  return {
    what: 'Compass result receipts — your answers and every number computed from them',
    generated_by: d.build,
    result_code: d.code,
    fingerprint_sha256_12: d.fingerprint,
    answers: {
      ranking_most_to_least: d.order,
      trade_offs: d.choices.map((c) => ({ block: c.blockId, options: MAXDIFF_BLOCKS.find((b) => b.id === c.blockId)?.valueIds, most: c.best, least: c.worst })),
      quick_fire_interests: d.interests,
    },
    computed: {
      per_value: Object.fromEntries(VALUE_IDS.map((id) => [id, {
        name: VALUE_BY_ID[id].name,
        ranking_z: round(d.profile.signals?.ranking?.[id]),
        tradeoff_z: round(d.profile.signals?.maxdiff?.[id]),
        combined: round(d.profile.combined[id]),
        rank: d.profile.ranked.indexOf(id) + 1,
        signals_agree: d.profile.valueConfidence[id],
      }])),
      convergence_pearson: round(d.profile.convergence),
      higher_order: Object.fromEntries(Object.entries(d.profile.higher).map(([k, v]) => [k, round(v)])),
      dominant: d.profile.dominantHigher,
      dominant_margin: round(d.profile.higherMargin),
      circumplex: { angle_deg: round(d.profile.circumplex.angle), magnitude: round(d.profile.circumplex.magnitude) },
      tensions: d.profile.tensions,
      career_directions: d.career.map((a) => ({ rank: a.rank, key: a.key, name: a.name, values_r: round(a.valuesR ?? a.score), interest_fit: round(a.interestFit), blended: round(a.score), band: a.band })),
    },
    methodology_notes: {
      scoring: 'Both signals are standardised within-person (z-scores across your own 10 values) and averaged. Rankings are ipsative: they describe YOUR priorities relative to each other, not absolute levels or comparisons to other people.',
      bands: 'Career bands are calibrated against 4,000 fully random sessions: values-only "strong" = top-archetype r ≥ 0.75 (~95th percentile of noise); blended (with quick-fire) "strong" ≥ 0.68. Below the ~75th noise percentile the app abstains rather than guesses.',
      confidence: 'Per-value agreement compares the sign and strength of your two signals. Convergence is the Pearson correlation between them across all 10 values — a heuristic, not a calibrated statistic.',
      honesty: 'Original prototype items, not a validated clinical instrument. A mirror, not a verdict.',
    },
  }
}

function round(x) { return typeof x === 'number' && Number.isFinite(x) ? Math.round(x * 1000) / 1000 : null }

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Open the printable appendix in a new tab (user prints → PDF).
 * Fully inline document — no external requests, works offline.
 */
export function openAppendix(d) {
  const rows = VALUE_IDS.map((id) => {
    const rz = d.profile.signals?.ranking?.[id]
    const mz = d.profile.signals?.maxdiff?.[id]
    const agree = d.profile.valueConfidence[id]
    const mark = agree === 'high' ? '●' : agree === 'medium' ? '◐' : '○'
    return `<tr>
      <td>${d.profile.ranked.indexOf(id) + 1}</td>
      <td class="nm">${esc(VALUE_BY_ID[id].name)}</td>
      <td class="num">${fmt(rz)}</td>
      <td class="num">${fmt(mz)}</td>
      <td class="num"><b>${fmt(d.profile.combined[id])}</b></td>
      <td class="ag">${mark} ${esc(agree)}</td>
    </tr>`
  }).join('')

  const careers = d.career.map((a) =>
    `<tr><td>${a.rank}</td><td class="nm">${esc(a.name)}</td><td class="num">${fmt(a.valuesR ?? a.score)}</td><td class="num">${fmt(a.interestFit)}</td><td class="num"><b>${fmt(a.score)}</b></td><td>${esc(a.band)}</td></tr>`).join('')

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Compass — methodology appendix · ${esc(d.fingerprint)}</title>
  <style>
    body{font-family:'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif;color:#1d1a14;margin:48px auto;max-width:720px;padding:0 24px;line-height:1.6}
    h1{font-size:26px;font-weight:500;margin:0}
    h2{font-size:15px;letter-spacing:.24em;text-transform:uppercase;color:#8a6d34;font-weight:700;margin:38px 0 10px;font-family:-apple-system,'Segoe UI',sans-serif}
    .meta{font-family:-apple-system,'Segoe UI',sans-serif;font-size:12px;color:#6b6350;margin-top:8px}
    table{border-collapse:collapse;width:100%;font-size:14px;font-variant-numeric:tabular-nums}
    th{font-family:-apple-system,'Segoe UI',sans-serif;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#6b6350;text-align:left;border-bottom:1.5px solid #1d1a14;padding:6px 10px 6px 0}
    td{border-bottom:1px solid rgba(29,26,20,.15);padding:7px 10px 7px 0}
    td.num{text-align:right;padding-right:18px}
    td.nm{font-weight:600}
    p{font-size:14.5px}
    .fine{font-size:12.5px;color:#6b6350}
    .box{border:1px solid rgba(29,26,20,.3);padding:14px 18px;margin:14px 0}
    @media print{ body{margin:12mm auto} .noprint{display:none} }
  </style></head><body>
  <h1>Compass — the receipts</h1>
  <div class="meta">Methodology appendix · generated ${esc(d.dateLabel)} · engine ${esc(d.build)} · result fingerprint <b>${esc(d.fingerprint)}</b></div>
  <p class="noprint fine" style="margin-top:14px">Print this page (⌘P / Ctrl-P) and choose “Save as PDF” to keep it.</p>

  <h2>1 · Your agreement matrix</h2>
  <p class="fine">Two independent signals were measured: your full ranking, and your forced trade-offs. Each is standardised across your own ten values (z-scores), then averaged. Where the two agree, confidence is high; where they split, the app told you so.</p>
  <table>
    <tr><th>#</th><th>Value</th><th>Ranking z</th><th>Trade-off z</th><th>Combined</th><th>Signals</th></tr>
    ${rows}
  </table>
  <p class="fine">Convergence (Pearson r between your two signals): <b>${fmt(d.profile.convergence)}</b>. Dominant orientation: <b>${esc(d.profile.dominantHigher)}</b> (margin ${fmt(d.profile.higherMargin)}).</p>

  <h2>2 · Career directions — the numbers behind the bands</h2>
  <table>
    <tr><th>#</th><th>Direction</th><th>Values r</th><th>Interest fit</th><th>Blended</th><th>Band</th></tr>
    ${careers}
  </table>
  <div class="box fine">
    <b>Band calibration.</b> 4,000 fully random sessions were run through this exact pipeline.
    Values-only: the top direction's r reached 0.58 (75th percentile of noise), 0.69 (90th), 0.75 (95th) — so “strong lean” means <i>beats ~95% of random input</i>.
    Blended with the quick-fire round (0.7 × values + 0.3 × interest-fit): 0.50 / 0.61 / 0.68.
    Below the 75th noise percentile the app abstains instead of guessing.
  </div>

  <h2>3 · What this is — and isn't</h2>
  <p>Scores are <b>ipsative</b>: they rank your priorities against each other, not against other people. The items are original prototypes, not a validated clinical instrument. Confidence language is a heuristic drawn from the agreement between your own two answers — honest, but not a calibrated statistic. A mirror, not a verdict.</p>
  <p class="fine">Everything in this appendix was computed in your browser from your own answers. The result code below reproduces this exact result:<br><span style="word-break:break-all">${esc(d.code)}</span></p>
  </body></html>`

  const w = window.open('', '_blank')
  if (!w) return false
  w.document.write(html)
  w.document.close()
  return true
}

function fmt(x) { return typeof x === 'number' && Number.isFinite(x) ? (x >= 0 ? '+' : '') + x.toFixed(2) : '—' }

/** A 6-month revisit reminder as a downloadable .ics — the loop with no email. */
export function revisitICS(permalink, monthsAhead = 6) {
  const start = new Date()
  start.setMonth(start.getMonth() + monthsAhead)
  start.setHours(10, 0, 0, 0)
  const stamp = (dt) => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const end = new Date(start.getTime() + 30 * 60000)
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Compass//revisit//EN',
    'BEGIN:VEVENT',
    `UID:compass-revisit-${Date.now()}@trueself.carecompass.me`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    'SUMMARY:Compass — your six-month revisit',
    `DESCRIPTION:Re-run your compass and see what actually moved.\\nYour result: ${permalink}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  return new Blob([ics], { type: 'text/calendar;charset=utf-8' })
}
