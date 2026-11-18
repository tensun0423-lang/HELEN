// 成長健康紀錄 Service Worker
// 策略：先向伺服器取得最新版本並更新快取；離線或網路失敗時改用快取。
// 只快取程式檔案；孩子的健康資料存在 localStorage，不經過這裡。
// 修改任何要離線使用的檔案後，請把 CACHE_VERSION 加 1，讓舊快取被清掉。
const CACHE_VERSION = 1;
const CACHE_NAME = "kids-health-v" + CACHE_VERSION;
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // 略過瀏覽器快取（GitHub Pages 會快取 10 分鐘），確保存進去的是新版檔案
      .then((cache) => cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: "no-cache" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith("kids-health-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request, { cache: "no-cache" })
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request, { ignoreSearch: true }).then((cached) =>
          cached || (request.mode === "navigate" ? caches.match("./index.html") : Response.error())
        )
      )
  );
});
