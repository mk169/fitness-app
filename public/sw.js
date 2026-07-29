// Minimaler, deploy-sicherer Service Worker für Mogged – ohne Abhängigkeiten.
// Strategie:
//   • Navigationen (HTML): network-first mit Fallback auf gecachte App-Shell.
//     → Online immer die frische Version, offline die Shell. Kein Stale-Deploy.
//   • Same-Origin-Assets (JS/CSS/Bilder, gehasht & unveränderlich): cache-first.
//   • Cross-Origin (z. B. Supabase): nicht abfangen – direkt ans Netz.

const CACHE = "mogged-v1"
// Relativ zur SW-Position auflösen – berücksichtigt den Unterpfad (/fitness-app/).
const BASE = new URL("./", self.location).href
const SHELL = new URL("index.html", self.location).href

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll([BASE, SHELL, new URL("manifest.webmanifest", self.location).href])).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // Cross-Origin ans Netz

  // Navigationen: network-first, Fallback auf App-Shell.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(SHELL, copy)).catch(() => {})
          return res
        })
        .catch(() => caches.match(SHELL).then((r) => r || caches.match(BASE)))
    )
    return
  }

  // Same-Origin-Assets: cache-first, sonst laden und cachen.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {})
          }
          return res
        })
    )
  )
})
