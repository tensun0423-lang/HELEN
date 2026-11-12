// 台中美食轉盤 Service Worker
// 策略：先用網路取得最新版本並更新快取；離線或網路失敗時改用快取。
// 修改任何要離線使用的檔案後，請把 CACHE_VERSION 加 1，讓舊快取被清掉。
const CACHE_VERSION = 3;
const CACHE_NAME = "food-wheel-v" + CACHE_VERSION;
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

// 安裝：先把所有檔案存進快取，第一次開啟後就能離線使用
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // 同樣略過瀏覽器快取，確保存進去的是新版檔案
      .then((cache) => cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: "no-cache" }))))
      .then(() => self.skipWaiting())
  );
});

// 啟用：刪除舊版本的快取
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith("food-wheel-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// 讀取：只處理同網站的 GET 請求（Google 地圖、食記連結等外部網址不處理）
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    // cache: "no-cache"：每次都先向伺服器確認有沒有新版。
    // GitHub Pages 會讓瀏覽器把檔案快取 10 分鐘，不加這個可能拿到舊檔案。
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
