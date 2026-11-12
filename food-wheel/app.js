// 西屯美食轉盤
(function () {
  "use strict";

  const ALL = window.FOOD_LIST || [];
  const TYPES = ["全部", "飯食", "麵食", "小吃", "聚餐"];
  const COLORS = ["#ffd8a8", "#ffc9c9", "#d3f9d8", "#d0ebff", "#fff3bf", "#e5dbff", "#c3fae8", "#ffdeeb"];
  const TEXT_COLOR = "#2b2118";
  const SPIN_MS = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 600 : 4500;
  const TAU = Math.PI * 2;

  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const spinBtn = document.getElementById("spin-btn");
  const countEl = document.getElementById("count");
  const filtersEl = document.querySelector(".filters");
  const resultEl = document.getElementById("result");
  const listEl = document.getElementById("food-list");

  let currentType = "全部";
  const excluded = new Set();
  let rotation = 0;
  let spinning = false;
  let lastPick = null;

  function candidates() {
    return ALL.filter((f) => (currentType === "全部" || f.type === currentType) && !excluded.has(f.name));
  }

  // 以裝置像素比例繪製，手機上文字比較清楚
  function setupCanvas() {
    const size = canvas.clientWidth || 420;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  // 轉盤上只顯示店名，分店名（空格後面）放在結果裡
  function shortName(name) {
    const base = name.split(" ")[0];
    return base.length > 7 ? base.slice(0, 7) + "…" : base;
  }

  function draw() {
    const size = canvas.clientWidth || 420;
    const r = size / 2;
    const items = candidates();
    ctx.clearRect(0, 0, size, size);

    if (!items.length) {
      ctx.fillStyle = "#cccccc";
      ctx.beginPath();
      ctx.arc(r, r, r - 4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "600 16px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("沒有可選的店", r, r);
      return;
    }

    const seg = TAU / items.length;
    const fontSize = Math.max(11, Math.min(16, size / 28));
    items.forEach((item, i) => {
      // 第 i 格從正上方開始，順時針排列
      const start = rotation + i * seg - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.arc(r, r, r - 4, start, start + seg);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 店名沿半徑排列；左半邊的格子把文字轉 180 度，避免上下顛倒
      const mid = start + seg / 2;
      const leftHalf = Math.cos(mid) < 0;
      ctx.save();
      ctx.translate(r, r);
      ctx.rotate(leftHalf ? mid + Math.PI : mid);
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "600 " + fontSize + "px system-ui, -apple-system, 'PingFang TC', 'Microsoft JhengHei', sans-serif";
      ctx.textAlign = leftHalf ? "left" : "right";
      ctx.textBaseline = "middle";
      ctx.fillText(shortName(item.name), leftHalf ? -(r - 14) : r - 14, 0);
      ctx.restore();
    });

    // 中心圓
    ctx.beginPath();
    ctx.arc(r, r, r * 0.12, 0, TAU);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e6dccf";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function randomIndex(n) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    return buf[0] % n;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function spin() {
    const items = candidates();
    if (spinning || !items.length) return;
    spinning = true;
    spinBtn.disabled = true;
    resultEl.hidden = true;

    const seg = TAU / items.length;
    const pick = randomIndex(items.length);
    // 讓第 pick 格的中心停在正上方的指針下，並在格內加一點隨機偏移
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const target = -(pick + 0.5) * seg + jitter;
    const current = ((rotation % TAU) + TAU) % TAU;
    let delta = (((target - current) % TAU) + TAU) % TAU;
    delta += TAU * (SPIN_MS > 1000 ? 5 : 1);

    const startRot = rotation;
    const startTime = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - startTime) / SPIN_MS);
      rotation = startRot + delta * easeOutCubic(t);
      draw();
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        spinning = false;
        spinBtn.disabled = false;
        showResult(items[pick]);
      }
    }
    requestAnimationFrame(frame);
  }

  function showResult(item) {
    lastPick = item;
    document.getElementById("result-name").textContent = item.name;
    document.getElementById("result-area").textContent = item.area;
    document.getElementById("result-tag").textContent = item.tag;
    document.getElementById("result-type").textContent = item.type;
    document.getElementById("result-note").textContent = item.note;
    document.getElementById("result-map").href =
      "https://www.google.com/maps/search/?api=1&query=" +
      // 加上台中與行政區，避免搜到其他縣市的同名店
      encodeURIComponent(item.name + " 台中" + (item.area !== "台中市" ? " " + item.area : ""));
    document.getElementById("result-source").href = item.source;
    resultEl.hidden = false;
  }

  function renderFilters() {
    filtersEl.replaceChildren();
    TYPES.forEach((type) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.textContent = type;
      btn.setAttribute("aria-pressed", String(type === currentType));
      btn.addEventListener("click", () => {
        if (spinning) return;
        currentType = type;
        resultEl.hidden = true;
        refresh();
      });
      filtersEl.append(btn);
    });
  }

  function renderList() {
    listEl.replaceChildren();
    ALL.forEach((item) => {
      const li = document.createElement("li");
      if (excluded.has(item.name)) li.className = "excluded";
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = item.name;
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = item.tag + "・" + item.area + "・" + item.type;
      li.append(name, tag);
      listEl.append(li);
    });
  }

  function refresh() {
    renderFilters();
    renderList();
    const n = candidates().length;
    countEl.textContent = n ? "轉盤上有 " + n + " 家" : "這個類型的店都被排除了，請按「恢復排除的店」。";
    spinBtn.disabled = spinning || n === 0;
    draw();
  }

  document.getElementById("skip-btn").addEventListener("click", () => {
    if (!lastPick || spinning) return;
    excluded.add(lastPick.name);
    refresh();
    if (candidates().length) spin();
    else resultEl.hidden = true;
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    if (spinning) return;
    excluded.clear();
    refresh();
  });

  spinBtn.addEventListener("click", spin);
  window.addEventListener("resize", setupCanvas);

  refresh();
  setupCanvas();

  // ---- PWA ----
  // 註冊 Service Worker，讓網頁可以離線使用、安裝到主畫面
  if ("serviceWorker" in navigator) {
    const updateBar = document.getElementById("update-bar");
    // 第一次安裝時不提示；之後換成新版 Service Worker，才提示重新整理
    const hadController = !!navigator.serviceWorker.controller;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hadController) updateBar.hidden = false;
    });
    document.getElementById("update-btn").addEventListener("click", () => {
      window.location.reload();
    });

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then((registration) => {
        // 裝在主畫面的 App 常常一直開在背景；切回來時檢查有沒有新版本
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") registration.update().catch(() => {});
        });
      }).catch(() => {
        // 註冊失敗不影響轉盤本身的功能
      });
    });
  }

  // 顯示名單更新日期，方便確認手機上的 App 是不是最新版
  const updatedEl = document.getElementById("updated");
  if (window.FOOD_UPDATED) {
    updatedEl.textContent = "名單更新：" + window.FOOD_UPDATED + "・共 " + ALL.length + " 家";
  }

  // 安裝按鈕：Android／電腦版 Chrome 會觸發 beforeinstallprompt；iPhone 改顯示操作說明
  const installBox = document.getElementById("install");
  const installBtn = document.getElementById("install-btn");
  const installHint = document.getElementById("install-hint");
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let deferredPrompt = null;

  if (!isStandalone && isIOS) {
    installBtn.hidden = true;
    installHint.hidden = false;
    installBox.hidden = false;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installBox.hidden = false;
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBox.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    installBox.hidden = true;
  });
})();
