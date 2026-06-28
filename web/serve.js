// @ts-check
/** Tiny zero-dependency static server for the values-app web UI. */
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = normalize(join(fileURLToPath(new URL('.', import.meta.url)), '..')) // values-app/
const PORT = Number(process.env.PORT || 5173)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

const server = http.createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    // Redirect bare root to /web/ so the document base is /web/ and relative
    // asset paths (./styles.css, ./app.js) resolve correctly.
    if (urlPath === '/') { res.writeHead(302, { Location: '/web/' }); res.end(); return }
    if (urlPath === '/web' || urlPath === '/web/') urlPath = '/web/index.html'
    // Serve the service worker from the site root so its scope can be '/'.
    const isSW = urlPath === '/sw.js'
    if (isSW) urlPath = '/web/sw.js'
    const filePath = normalize(join(ROOT, urlPath))
    if (!filePath.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return }
    const data = await readFile(filePath)
    const headers = { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }
    if (isSW) headers['Service-Worker-Allowed'] = '/'
    res.writeHead(200, headers)
    res.end(data)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found')
  }
})

server.listen(PORT, () => {
  console.log(`values-app running →  http://localhost:${PORT}/`)
})
