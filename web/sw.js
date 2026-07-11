// @ts-check
/* Compass service worker — network-first with offline cache fallback.
   Served from the site root with Service-Worker-Allowed: / so it can also
   cache the /engine modules that live outside /web. */
const CACHE = 'compass-v9'
const SHELL = [
  '/web/', '/web/index.html', '/web/styles.css', '/web/app.js', '/web/circumplex.js',
  '/web/archetypeArt.js', '/web/plate.js', '/web/receipts.js', '/web/manifest.webmanifest', '/web/icon.svg',
  '/web/icon-192.png', '/web/icon-512.png', '/web/apple-touch-icon.png',
  '/engine/index.js', '/engine/values.js',
  '/engine/maxdiffBlocks.js', '/engine/scoring.js', '/engine/interests.js',
  '/engine/insights.js', '/engine/insightBank.js',
  '/engine/careerArchetypes.js', '/engine/relationshipCompass.js', '/engine/identity.js',
]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => {}))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  e.respondWith(
    fetch(request)
      .then((res) => {
        // Only cache successful responses — replaying cached 404s/5xx as
        // offline "content" was a confirmed audit finding.
        if (res.ok) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
        }
        return res
      })
      .catch(() => caches.match(request).then((m) => m || caches.match('/web/index.html'))),
  )
})
