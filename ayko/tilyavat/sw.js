const CACHE = "tilyavat-v1";
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = e.request.url;
  // аудио и данные о сурах всегда берём из сети
  if (url.includes("api.quran.com") || url.includes("verses.quran.com")) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
