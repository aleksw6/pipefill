// Pipe Fill offline cache. The cache name changes whenever any app file changes, which is how phones pick up updates.
const CACHE = 'pipefill-1.4-ff0c2cb2';
const FILES = ["./", "index.html", "manifest.webmanifest", "apple-touch-icon.png", "icon-192.png", "icon-512.png"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('pipefill-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Offline first: answer from the phone's copy instantly (no hanging on one bar of signal).
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit ||
    (e.request.mode === 'navigate' ? caches.match('index.html') : null) ||
    fetch(e.request)));
});
