// Vite plugin: after a build, writes sw.js, a service worker that precaches every built file and
// everything in /public, so the installed app works fully offline. No extra dependencies.
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })

export default function offline() {
  let publicDir
  return {
    name: 'offline-service-worker',
    apply: 'build',
    configResolved(config) {
      publicDir = config.publicDir
    },
    generateBundle(_, bundle) {
      const files = [
        './',
        ...Object.keys(bundle),
        ...walk(publicDir).map((f) => relative(publicDir, f).split('\\').join('/')),
      ].filter((f) => !f.endsWith('.map'))
      // The cache name changes whenever any file's content changes, so updates always replace the old cache.
      const hash = createHash('sha256')
      for (const item of Object.values(bundle)) hash.update(item.code ?? item.source ?? '')
      for (const file of walk(publicDir)) hash.update(readFileSync(file))
      const version = hash.digest('hex').slice(0, 12)
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: serviceWorker(version, files) })
    },
  }
}

const serviceWorker = (version, files) => `// Generated at build time by scripts/offline.js.
const CACHE = 'squishies-${version}'
const FILES = ${JSON.stringify(files)}

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

// Cache first (everything is precached); pages fall back to the app shell when offline.
self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return
  e.respondWith(
    caches.match(request, { ignoreSearch: request.mode === 'navigate', ignoreVary: true }).then(
      (hit) => hit || fetch(request).catch(() => (request.mode === 'navigate' ? caches.match('./') : Response.error())),
    ),
  )
})
`
