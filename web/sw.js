// @ts-check
/* Compass service worker — network-first with offline cache fallback.
   Served from the site root with Service-Worker-Allowed: / so it can also
   cache the /engine modules that live outside /web. */
const CACHE = 'compass-v3'
const SHELL = [
  '/web/', '/web/index.html', '/web/styles.css', '/web/app.js', '/web/circumplex.js',
  '/web/archetypeArt.js', '/web/manifest.webmanifest', '/web/icon.svg',
  '/engine/index.js', '/engine/values.js', '/engine/portraitItems.js',
  '/engine/maxdiffBlocks.js', '/engine/scoring.js',
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
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
        return res
      })
      .catch(() => caches.match(request).then((m) => m || caches.match('/web/index.html'))),
  )
})
