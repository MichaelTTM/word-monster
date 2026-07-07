// 單字怪物 Service Worker — 離線可玩 + 可安裝
// 策略：network-first（線上永遠拿最新，離線 fallback 到快取）。
// 改版時把 CACHE 版本號 +1，舊快取會自動清掉。
const CACHE = "wm-v7";
const ASSETS = [
  "./", "index.html", "style.css", "sprites.js", "data.js", "game.js", "manifest.json",
  "assets/fonts/fonts.css",
  "assets/fonts/press-start-2p-latin.woff2",
  "assets/fonts/baloo2-latin.woff2",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("./")))
  );
});
