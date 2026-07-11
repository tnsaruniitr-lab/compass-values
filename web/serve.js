// @ts-check
/**
 * Tiny zero-dependency static server for the values-app web UI — hardened.
 *
 * - ALLOWLIST: only /web/*, /engine/*.js, /sw.js, /robots.txt and the public
 *   research doc are served. The previous build served the entire repo root
 *   (strategy docs, lockfile, tests) — a confirmed audit finding.
 * - Security headers on every response (CSP, HSTS, nosniff, frame-ancestors).
 * - gzip for text assets + strong ETags with 304 revalidation, so repeat
 *   visits cost a handful of bytes instead of ~380KB.
 */
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { gzipSync } from 'node:zlib'
import { extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = normalize(join(fileURLToPath(new URL('.', import.meta.url)), '..')) // repo root
const PORT = Number(process.env.PORT || 5173)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.md': 'text/plain; charset=utf-8', // readable in-browser, not a download
  '.txt': 'text/plain; charset=utf-8',
}
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.webmanifest', '.svg', '.md', '.txt'])

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'",
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
}

const ROBOTS = 'User-agent: *\nAllow: /\n'

/** Only these path prefixes/files exist as far as the outside world knows. */
function allowed(urlPath) {
  if (urlPath === '/robots.txt' || urlPath === '/sw.js') return true
  if (urlPath.startsWith('/web/')) return true
  if (urlPath.startsWith('/engine/') && urlPath.endsWith('.js')) return true
  if (urlPath === '/docs/RESEARCH_values-to-career-and-partner.md') return true
  return false
}

// Tiny in-memory cache: content + gzip + etag per path (files are small; the
// whole site is ~400KB). Invalidation = process restart, which IS the deploy.
// Disabled outside production so local edits show up on refresh.
const PROD = process.env.NODE_ENV === 'production'
const cache = new Map()
async function load(filePath) {
  let entry = PROD ? cache.get(filePath) : null
  if (entry) return entry
  const data = await readFile(filePath)
  const etag = `"${createHash('sha1').update(data).digest('base64url')}"`
  const ext = extname(filePath)
  const gz = COMPRESSIBLE.has(ext) ? gzipSync(data, { level: 8 }) : null
  entry = { data, gz, etag, type: MIME[ext] || 'application/octet-stream' }
  if (PROD) cache.set(filePath, entry)
  return entry
}

const server = http.createServer(async (req, res) => {
  try {
    let urlPath
    try {
      urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    } catch {
      res.writeHead(400, SECURITY_HEADERS).end('Bad request')
      return
    }
    // Redirect bare root to /web/ (301: the canonical app URL) so the document
    // base is /web/ and relative asset paths (./styles.css) resolve correctly.
    if (urlPath === '/') {
      res.writeHead(301, { ...SECURITY_HEADERS, Location: '/web/' })
      res.end()
      return
    }
    if (urlPath === '/robots.txt') {
      res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': MIME['.txt'], 'Cache-Control': 'no-cache' })
      res.end(ROBOTS)
      return
    }
    if (urlPath === '/web' || urlPath === '/web/') urlPath = '/web/index.html'
    // Serve the service worker from the site root so its scope can be '/'.
    const isSW = urlPath === '/sw.js'
    if (isSW) urlPath = '/web/sw.js'

    if (!allowed(isSW ? '/sw.js' : urlPath)) {
      res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' }).end('Not found')
      return
    }

    const filePath = normalize(join(ROOT, urlPath))
    // Trailing-separator guard: plain startsWith(ROOT) would admit sibling
    // directories that share the prefix (e.g. repo-backup/ next to repo/).
    if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) {
      res.writeHead(403, SECURITY_HEADERS).end('Forbidden')
      return
    }

    const entry = await load(filePath)
    const headers = {
      ...SECURITY_HEADERS,
      'Content-Type': entry.type,
      'Cache-Control': 'no-cache', // always revalidate — the ETag makes it cheap
      ETag: entry.etag,
      Vary: 'Accept-Encoding',
    }
    if (isSW) headers['Service-Worker-Allowed'] = '/'

    if (req.headers['if-none-match'] === entry.etag) {
      res.writeHead(304, headers)
      res.end()
      return
    }
    const acceptsGzip = /\bgzip\b/.test(String(req.headers['accept-encoding'] || ''))
    if (entry.gz && acceptsGzip) {
      headers['Content-Encoding'] = 'gzip'
      res.writeHead(200, headers)
      res.end(entry.gz)
    } else {
      res.writeHead(200, headers)
      res.end(entry.data)
    }
  } catch {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' }).end('Not found')
  }
})

server.listen(PORT, () => {
  console.log(`values-app running →  http://localhost:${PORT}/`)
})
