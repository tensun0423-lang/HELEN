// 成長健康紀錄：資料只存在這台裝置（localStorage），不會上傳。
(function () {
  "use strict";

  const STORAGE_KEY = "kids-health-v1";
  const GRADES = [
    "國小一年級", "國小二年級", "國小三年級", "國小四年級", "國小五年級", "國小六年級",
    "國中一年級", "國中二年級", "國中三年級",
    "高中一年級", "高中二年級", "高中三年級",
    "其他",
  ];
  const GRADE_SHORT = ["小1", "小2", "小3", "小4", "小5", "小6", "國1", "國2", "國3", "高1", "高2", "高3", "其他"];
  const TERM_TEXT = { 1: "上", 2: "下" };
  const MAX_COLORS = 8;
  const RANGES = {
    height: [40, 230, "身高"],
    weight: [5, 250, "體重"],
    visionR: [0, 2.5, "裸視右眼"],
    visionL: [0, 2.5, "裸視左眼"],
    glassesR: [0, 2.5, "戴鏡右眼"],
    glassesL: [0, 2.5, "戴鏡左眼"],
    astigDegR: [0, 800, "散光右眼度數"],
    astigDegL: [0, 800, "散光左眼度數"],
  };
  const NUMBER_FIELDS = Object.keys(RANGES);

  const $ = (id) => document.getElementById(id);

  // ---------- 資料儲存 ----------
  let storageOk = true;

  function newId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function defaultData() {
    return {
      children: [
        { id: newId(), name: "老大", color: 1 },
        { id: newId(), name: "老二", color: 2 },
      ],
      records: [],
    };
  }

  function load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isValidData(parsed)) return parsed;
      }
    } catch (err) {
      storageOk = false;
    }
    return defaultData();
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      storageOk = false;
      $("storage-warning").hidden = false;
    }
  }

  function isValidData(d) {
    if (!d || !Array.isArray(d.children) || !Array.isArray(d.records) || !d.children.length) return false;
    const ids = new Set();
    for (const c of d.children) {
      if (!c || typeof c.id !== "string" || typeof c.name !== "string") return false;
      ids.add(c.id);
    }
    for (const r of d.records) {
      if (!r || typeof r.id !== "string" || !ids.has(r.childId)) return false;
      if (!Number.isInteger(r.year) || (r.term !== 1 && r.term !== 2)) return false;
    }
    return true;
  }

  let data = load();
  // 舊資料或匯入的資料沒有顏色時補上
  data.children.forEach((c) => { if (!c.color) c.color = nextColor(); });

  // 每個孩子固定一個顏色（不會因為篩選而改變）
  function nextColor() {
    const used = new Set(data.children.map((c) => c.color));
    for (let i = 1; i <= MAX_COLORS; i++) if (!used.has(i)) return i;
    return ((data.children.length) % MAX_COLORS) + 1;
  }

  function childById(id) { return data.children.find((c) => c.id === id); }
  function colorVar(child) { return "var(--series-" + child.color + ")"; }

  // ---------- 共用工具 ----------
  function num(value) {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function fmt(n, digits) {
    if (n === null || n === undefined) return "—";
    return Number(n).toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  }

  // 視力照健康紀錄表的寫法：1.0、0.8 保留一位小數，0.05 這種保留兩位
  function fmtVision(n) {
    if (n === null || n === undefined) return "—";
    return Math.round(n * 10) === n * 10 ? Number(n).toFixed(1) : Number(n).toFixed(2);
  }

  function bmi(r) {
    if (!r.height || !r.weight) return null;
    const m = r.height / 100;
    return Math.round((r.weight / (m * m)) * 10) / 10;
  }

  function termKey(r) { return r.year * 2 + (r.term - 1); }
  function termLabel(r) { return r.year + "學年度" + TERM_TEXT[r.term] + "學期"; }

  // 依目前日期推算學年度與學期：8 月～1 月是上學期，2 月～7 月是下學期
  function currentTerm() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    if (m >= 8) return { year: y - 1911, term: 1 };
    if (m === 1) return { year: y - 1912, term: 1 };
    return { year: y - 1912, term: 2 };
  }

  function recordsOf(childId) {
    return data.records.filter((r) => r.childId === childId).sort((a, b) => termKey(a) - termKey(b));
  }

  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach((k) => {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "class") e.className = attrs[k];
      else if (k === "style") e.setAttribute("style", attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach((c) => e.append(c));
    return e;
  }

  function showMessage(box, type, text) {
    box.className = "message " + type;
    box.textContent = text;
    box.hidden = false;
  }

  // ---------- 分頁 ----------
  const TABS = ["records", "charts", "settings"];
  function showTab(name) {
    TABS.forEach((t) => {
      $("tab-" + t).setAttribute("aria-selected", String(t === name));
      $("panel-" + t).hidden = t !== name;
    });
    if (name === "charts") renderChart();
  }
  TABS.forEach((t) => $("tab-" + t).addEventListener("click", () => showTab(t)));

  // ---------- 紀錄頁 ----------
  let currentChildId = data.children[0].id;

  function renderChildChips() {
    const box = $("record-child-chips");
    box.replaceChildren();
    data.children.forEach((c) => {
      const btn = el("button", { type: "button", class: "chip", "aria-pressed": String(c.id === currentChildId) }, [
        el("span", { class: "dot", style: "background:" + colorVar(c) }),
        document.createTextNode(c.name),
      ]);
      btn.addEventListener("click", () => {
        currentChildId = c.id;
        closeForm();
        renderRecords();
      });
      box.append(btn);
    });
  }

  function valueWithDelta(value, prev, digits, unit) {
    const dd = el("dd");
    dd.append(document.createTextNode(value === null ? "—" : fmt(value, digits) + (unit || "")));
    if (value !== null && prev !== null && prev !== undefined) {
      const diff = Math.round((value - prev) * 10) / 10;
      const sign = diff > 0 ? "+" : "";
      dd.append(el("span", { class: "delta", text: "(" + sign + fmt(diff, digits) + ")" }));
    }
    return dd;
  }

  function eyePair(r, a, b) {
    if (r[a] === null && r[b] === null) return "—";
    return "右 " + fmtVision(r[a]) + "／左 " + fmtVision(r[b]);
  }

  function astigText(r) {
    const one = (has, deg) => {
      if (!has && deg === null) return "未檢查";
      if (deg !== null && deg > 0) return deg + "度";
      return has || "未檢查";
    };
    if (!r.astigR && !r.astigL && r.astigDegR === null && r.astigDegL === null) return "—";
    return "右 " + one(r.astigR, r.astigDegR) + "／左 " + one(r.astigL, r.astigDegL);
  }

  function renderRecords() {
    renderChildChips();
    const list = $("record-list");
    list.replaceChildren();
    const child = childById(currentChildId);
    const rows = recordsOf(currentChildId);
    if (!rows.length) {
      list.append(el("p", { class: "empty", text: child.name + "還沒有紀錄。按上面的按鈕新增第一學期的資料。" }));
      return;
    }
    // 新的在上面；增減量和前一筆比較
    rows.slice().reverse().forEach((r) => {
      const idx = rows.indexOf(r);
      const prev = idx > 0 ? rows[idx - 1] : null;
      const card = el("article", { class: "record", style: "--series-color:" + colorVar(child) });
      const head = el("div", { class: "record-head" }, [
        el("h3", { text: r.grade + "・" + TERM_TEXT[r.term] + "學期" }),
        el("span", { class: "sub", text: r.year + " 學年度" + (r.date ? "・" + r.date : "") }),
      ]);
      const dl = el("dl");
      const item = (label, dd) => dl.append(el("div", null, [el("dt", { text: label }), dd]));
      item("身高", valueWithDelta(r.height, prev ? prev.height : null, 1, " 公分"));
      item("體重", valueWithDelta(r.weight, prev ? prev.weight : null, 1, " 公斤"));
      item("BMI", el("dd", { text: bmi(r) === null ? "—" : fmt(bmi(r), 1) }));
      item("裸視", el("dd", { text: eyePair(r, "visionR", "visionL") }));
      if (r.glassesR !== null || r.glassesL !== null) item("戴鏡", el("dd", { text: eyePair(r, "glassesR", "glassesL") }));
      item("散光", el("dd", { text: astigText(r) }));
      card.append(head, dl);
      if (r.note) card.append(el("p", { class: "note", text: r.note }));

      const editBtn = el("button", { type: "button", class: "secondary small", text: "編輯" });
      editBtn.addEventListener("click", () => openForm(r));
      const delBtn = el("button", { type: "button", class: "danger small", text: "刪除" });
      delBtn.addEventListener("click", () => {
        if (!window.confirm("確定要刪除「" + child.name + " " + termLabel(r) + "」這筆紀錄嗎？")) return;
        data.records = data.records.filter((x) => x.id !== r.id);
        save();
        renderRecords();
      });
      card.append(el("div", { class: "record-actions" }, [editBtn, delBtn]));
      list.append(card);
    });
  }

  // ---------- 表單 ----------
  const form = $("record-form");
  const formMessage = $("form-message");

  function fillSelects() {
    const gradeSel = $("f-grade");
    if (!gradeSel.options.length) GRADES.forEach((g) => gradeSel.append(el("option", { value: g, text: g })));
    const childSel = $("f-child");
    childSel.replaceChildren();
    data.children.forEach((c) => childSel.append(el("option", { value: c.id, text: c.name })));
  }

  // 新增時自動帶入「上一筆的下一個學期」
  function suggestNext(childId) {
    const rows = recordsOf(childId);
    if (!rows.length) {
      const now = currentTerm();
      return { year: now.year, term: now.term, grade: GRADES[0] };
    }
    const last = rows[rows.length - 1];
    const gi = GRADES.indexOf(last.grade);
    if (last.term === 1) return { year: last.year, term: 2, grade: last.grade };
    const nextGrade = gi >= 0 && gi < GRADES.length - 2 ? GRADES[gi + 1] : last.grade;
    return { year: last.year + 1, term: 1, grade: nextGrade };
  }

  function openForm(record) {
    fillSelects();
    formMessage.hidden = true;
    form.querySelectorAll("[aria-invalid]").forEach((e) => e.removeAttribute("aria-invalid"));
    $("form-title").textContent = record ? "編輯紀錄" : "新增紀錄";
    $("record-id").value = record ? record.id : "";
    const childId = record ? record.childId : currentChildId;
    $("f-child").value = childId;
    const base = record || suggestNext(childId);
    $("f-year").value = base.year;
    $("f-term").value = String(base.term);
    $("f-grade").value = base.grade;
    $("f-date").value = record ? record.date || "" : "";
    NUMBER_FIELDS.forEach((f) => { $("f-" + f).value = record && record[f] !== null ? record[f] : ""; });
    $("f-astigR").value = record ? record.astigR || "" : "";
    $("f-astigL").value = record ? record.astigL || "" : "";
    $("f-note").value = record ? record.note || "" : "";
    form.hidden = false;
    $("add-btn").hidden = true;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeForm() {
    form.hidden = true;
    $("add-btn").hidden = false;
  }

  // 新增時切換孩子，學年度和年級跟著換成該孩子的下一學期
  $("f-child").addEventListener("change", () => {
    if ($("record-id").value) return;
    const s = suggestNext($("f-child").value);
    $("f-year").value = s.year;
    $("f-term").value = String(s.term);
    $("f-grade").value = s.grade;
  });

  $("add-btn").addEventListener("click", () => openForm(null));
  $("cancel-btn").addEventListener("click", () => {
    closeForm();
    $("record-list").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.querySelectorAll("[aria-invalid]").forEach((e) => e.removeAttribute("aria-invalid"));
    const problems = [];
    const bad = (id, text) => { problems.push(text); $(id).setAttribute("aria-invalid", "true"); };

    const id = $("record-id").value;
    const rec = {
      id: id || newId(),
      childId: $("f-child").value,
      year: num($("f-year").value),
      term: Number($("f-term").value),
      grade: $("f-grade").value,
      date: $("f-date").value || "",
      astigR: $("f-astigR").value,
      astigL: $("f-astigL").value,
      note: $("f-note").value.trim(),
    };
    NUMBER_FIELDS.forEach((f) => { rec[f] = num($("f-" + f).value); });

    if (rec.year === null || !Number.isInteger(rec.year) || rec.year < 90 || rec.year > 200) {
      bad("f-year", "學年度請填民國年，例如 114");
    }
    NUMBER_FIELDS.forEach((f) => {
      const [min, max, label] = RANGES[f];
      if (rec[f] !== null && (rec[f] < min || rec[f] > max)) bad("f-" + f, label + "要介於 " + min + "～" + max);
    });
    // 有填散光度數就視為「有」散光
    if (rec.astigDegR !== null && rec.astigDegR > 0) rec.astigR = "有";
    if (rec.astigDegL !== null && rec.astigDegL > 0) rec.astigL = "有";

    const hasAny = NUMBER_FIELDS.some((f) => rec[f] !== null) || rec.astigR || rec.astigL;
    if (!hasAny) problems.push("至少要填一個項目（身高、體重、視力或散光）");

    if (!problems.length) {
      const dup = data.records.find((r) => r.childId === rec.childId && r.year === rec.year && r.term === rec.term && r.id !== rec.id);
      if (dup) bad("f-year", "這個孩子在 " + termLabel(rec) + " 已經有紀錄了，請改用「編輯」");
    }

    if (problems.length) {
      showMessage(formMessage, "error", problems.join("；") + "。");
      return;
    }

    if (id) data.records = data.records.map((r) => (r.id === id ? rec : r));
    else data.records.push(rec);
    save();
    currentChildId = rec.childId;
    closeForm();
    renderRecords();
    $("record-list").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ---------- 曲線圖 ----------
  const METRICS = {
    height: { title: "身高", unit: "公分", digits: 1, eyes: false, get: (r) => r.height },
    weight: { title: "體重", unit: "公斤", digits: 1, eyes: false, get: (r) => r.weight },
    bmi: { title: "BMI", unit: "", digits: 1, eyes: false, get: bmi },
    vision: { title: "裸視視力", unit: "", digits: 2, eyes: ["visionR", "visionL"], zero: true, format: fmtVision },
    glasses: { title: "戴鏡視力", unit: "", digits: 2, eyes: ["glassesR", "glassesL"], zero: true, format: fmtVision },
    astig: { title: "散光度數", unit: "度", digits: 0, eyes: ["astigDegR", "astigDegL"], zero: true },
  };
  const SVG_NS = "http://www.w3.org/2000/svg";
  const DASH_LEFT = "6 4";

  function svg(tag, attrs) {
    const e = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach((k) => e.setAttribute(k, attrs[k]));
    return e;
  }

  function fillChartChildSelect() {
    const sel = $("c-child");
    const keep = sel.value;
    sel.replaceChildren(el("option", { value: "all", text: "全部孩子" }));
    data.children.forEach((c) => sel.append(el("option", { value: c.id, text: c.name })));
    sel.value = [...sel.options].some((o) => o.value === keep) ? keep : "all";
  }

  function xKey(r, axis) {
    if (axis === "time") return termKey(r);
    const gi = GRADES.indexOf(r.grade);
    if (gi < 0 || r.grade === "其他") return null;
    return gi * 2 + (r.term - 1);
  }

  function xLabel(key, axis) {
    const term = TERM_TEXT[(key % 2) + 1];
    if (axis === "time") return Math.floor(key / 2) + term;
    return GRADE_SHORT[Math.floor(key / 2)] + term;
  }

  // 組出要畫的系列：身高體重 BMI 一個孩子一條線；視力散光每個孩子左右眼各一條（右眼實線、左眼虛線）
  function buildSeries(metricKey, childFilter, axis) {
    const m = METRICS[metricKey];
    const kids = childFilter === "all" ? data.children : data.children.filter((c) => c.id === childFilter);
    const series = [];
    let skipped = 0;
    kids.forEach((c) => {
      const rows = recordsOf(c.id);
      const parts = m.eyes ? [["右眼", m.eyes[0], ""], ["左眼", m.eyes[1], DASH_LEFT]] : [["", null, ""]];
      parts.forEach(([eyeName, field, dash]) => {
        const points = [];
        rows.forEach((r) => {
          const v = field ? r[field] : m.get(r);
          if (v === null || v === undefined) return;
          const k = xKey(r, axis);
          if (k === null) { skipped++; return; }
          points.push({ key: k, value: v });
        });
        points.sort((a, b) => a.key - b.key);
        if (points.length) {
          series.push({
            name: c.name + (eyeName ? "・" + eyeName : ""),
            color: colorVar(c),
            dash: dash,
            points: points,
          });
        }
      });
    });
    return { series, skipped };
  }

  function niceScale(min, max, count) {
    if (min === max) { min -= 1; max += 1; }
    const span = max - min;
    const rawStep = span / count;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= rawStep) || 10 * mag;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const ticks = [];
    for (let t = lo; t <= hi + step / 2; t += step) ticks.push(Math.round(t * 1000) / 1000);
    return { lo, hi, ticks };
  }

  let chartState = null;

  function renderChart() {
    fillChartChildSelect();
    const metricKey = $("c-metric").value;
    const childFilter = $("c-child").value;
    const axis = $("c-axis").value;
    const m = METRICS[metricKey];
    const { series, skipped } = buildSeries(metricKey, childFilter, axis);
    const chart = $("chart");
    const wrap = $("chart-wrap");
    const legend = $("chart-legend");
    $("chart-tip").hidden = true;
    chart.replaceChildren();
    legend.replaceChildren();

    $("chart-title").textContent = m.title + (m.unit ? "（" + m.unit + "）" : "");
    const notes = [];
    if (m.eyes) notes.push("實線是右眼、虛線是左眼。");
    if (metricKey === "astig") notes.push("只畫有填度數的紀錄；只勾「有／無」的不會出現在圖上。");
    if (skipped) notes.push("有 " + skipped + " 筆年級是「其他」的資料沒畫出來，改用「依學年度」就看得到。");
    if (axis === "grade") notes.push("點或滑過圖上可以看各學期的數值。");
    $("chart-note").textContent = notes.join("");

    const empty = !series.length;
    $("chart-empty").hidden = !empty;
    wrap.hidden = empty;
    $("chart-table").replaceChildren();
    if (empty) {
      $("chart-empty").textContent = "還沒有可以畫的「" + m.title + "」資料。";
      chartState = null;
      return;
    }

    // 圖例（兩條線以上才需要）
    if (series.length > 1) {
      series.forEach((s) => {
        const sample = svg("svg", { width: 24, height: 10, "aria-hidden": "true" });
        const ln = svg("line", { x1: 0, y1: 5, x2: 24, y2: 5, "stroke-width": 2 });
        ln.style.stroke = s.color;
        if (s.dash) ln.setAttribute("stroke-dasharray", s.dash);
        sample.append(ln);
        legend.append(el("span", null, [sample, document.createTextNode(s.name)]));
      });
    }

    const keys = [...new Set(series.flatMap((s) => s.points.map((p) => p.key)))].sort((a, b) => a - b);
    const values = series.flatMap((s) => s.points.map((p) => p.value));
    let vMin = Math.min(...values);
    let vMax = Math.max(...values);
    if (m.zero) vMin = 0;
    const pad = (vMax - vMin) * 0.08 || 1;
    const scale = niceScale(m.zero ? 0 : vMin - pad, vMax + pad, 5);

    const W = Math.max(280, wrap.clientWidth || 320);
    const H = 280;
    const showEndLabels = series.length <= 4;
    const M = { top: 12, right: showEndLabels ? 70 : 16, bottom: 34, left: 40 };
    chart.setAttribute("viewBox", "0 0 " + W + " " + H);
    chart.setAttribute("width", W);
    chart.setAttribute("height", H);
    const plotW = W - M.left - M.right;
    const plotH = H - M.top - M.bottom;
    const x = (k) => {
      if (keys.length === 1) return M.left + plotW / 2;
      return M.left + (keys.indexOf(k) / (keys.length - 1)) * plotW;
    };
    const y = (v) => M.top + plotH - ((v - scale.lo) / (scale.hi - scale.lo)) * plotH;

    // 格線與 Y 軸
    const grid = svg("g", { class: "grid" });
    const axisG = svg("g", { class: "axis" });
    scale.ticks.forEach((t) => {
      grid.append(svg("line", { x1: M.left, x2: M.left + plotW, y1: y(t), y2: y(t) }));
      const label = svg("text", { x: M.left - 6, y: y(t) + 4, "text-anchor": "end" });
      label.textContent = fmt(t, m.digits === 0 ? 0 : 2);
      axisG.append(label);
    });
    // X 軸標籤：太擠時隔幾個顯示一個
    const every = Math.max(1, Math.ceil(keys.length / Math.floor(plotW / 44)));
    keys.forEach((k, i) => {
      if (i % every !== 0 && i !== keys.length - 1) return;
      const label = svg("text", { x: x(k), y: H - 12, "text-anchor": "middle" });
      label.textContent = xLabel(k, axis);
      axisG.append(label);
    });
    chart.append(grid, axisG);

    // 線與點
    const surface = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim() || "#fcfcfb";
    series.forEach((s) => {
      const d = s.points.map((p, i) => (i ? "L" : "M") + x(p.key).toFixed(1) + " " + y(p.value).toFixed(1)).join(" ");
      const path = svg("path", { d: d, fill: "none", "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" });
      path.style.stroke = s.color;
      if (s.dash) path.setAttribute("stroke-dasharray", s.dash);
      chart.append(path);
      s.points.forEach((p) => {
        const c = svg("circle", { cx: x(p.key), cy: y(p.value), r: 4, "stroke-width": 2, stroke: surface });
        c.style.fill = s.color;
        chart.append(c);
      });
    });

    // 線尾直接標名稱（4 條以內），避免文字重疊
    if (showEndLabels) {
      const labels = series.map((s) => {
        const last = s.points[s.points.length - 1];
        return { s, x: x(last.key) + 8, y: y(last.value) + 4 };
      }).sort((a, b) => a.y - b.y);
      for (let i = 1; i < labels.length; i++) {
        if (labels[i].y - labels[i - 1].y < 13) labels[i].y = labels[i - 1].y + 13;
      }
      labels.forEach((l) => {
        const t = svg("text", { x: l.x, y: l.y, class: "end-label" });
        t.textContent = l.s.name;
        chart.append(t);
      });
    }

    const cross = svg("line", { class: "crosshair", x1: 0, x2: 0, y1: M.top, y2: M.top + plotH, visibility: "hidden" });
    chart.append(cross);
    chartState = { keys, series, x, M, plotW, cross, axis, m, W };

    renderChartTable(keys, series, axis, m);
  }

  function valueText(m, v) { return m.format ? m.format(v) : fmt(v, m.digits); }

  function renderChartTable(keys, series, axis, m) {
    const table = $("chart-table");
    const head = el("tr", null, [el("th", { text: axis === "grade" ? "年級學期" : "學年度" })]);
    series.forEach((s) => head.append(el("th", { text: s.name })));
    table.append(el("thead", null, [head]));
    const body = el("tbody");
    keys.forEach((k) => {
      const tr = el("tr", null, [el("td", { text: xLabel(k, axis) })]);
      series.forEach((s) => {
        const p = s.points.find((pt) => pt.key === k);
        tr.append(el("td", { text: p ? valueText(m, p.value) : "—" }));
      });
      body.append(tr);
    });
    table.append(body);
  }

  // 滑過或點圖表：顯示該學期每條線的數值
  function showTip(clientX) {
    if (!chartState) return;
    const { keys, series, x, cross, axis, m, W } = chartState;
    const chart = $("chart");
    const rect = chart.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    let nearest = keys[0];
    keys.forEach((k) => { if (Math.abs(x(k) - px) < Math.abs(x(nearest) - px)) nearest = k; });
    const cx = x(nearest);
    cross.setAttribute("x1", cx);
    cross.setAttribute("x2", cx);
    cross.setAttribute("visibility", "visible");

    const tip = $("chart-tip");
    tip.replaceChildren(el("strong", { text: xLabel(nearest, axis) }));
    series.forEach((s) => {
      const p = s.points.find((pt) => pt.key === nearest);
      if (!p) return;
      const swatch = el("span", { class: "dot", style: "background:" + s.color });
      tip.append(el("div", null, [swatch, document.createTextNode(s.name), el("b", { text: valueText(m, p.value) + (m.unit ? " " + m.unit : "") })]));
    });
    tip.hidden = false;
    const left = (cx / W) * rect.width;
    const tipW = tip.offsetWidth;
    tip.style.left = (left + 12 + tipW > rect.width ? Math.max(0, left - 12 - tipW) : left + 12) + "px";
  }

  function hideTip() {
    $("chart-tip").hidden = true;
    if (chartState) chartState.cross.setAttribute("visibility", "hidden");
  }

  const chartEl = $("chart");
  chartEl.addEventListener("pointermove", (e) => showTip(e.clientX));
  chartEl.addEventListener("pointerdown", (e) => showTip(e.clientX));
  chartEl.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") hideTip(); });

  ["c-metric", "c-child", "c-axis"].forEach((id) => $(id).addEventListener("change", renderChart));
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (!$("panel-charts").hidden) renderChart(); }, 150);
  });

  // ---------- 設定：孩子 ----------
  function renderChildrenSettings() {
    const box = $("children-list");
    box.replaceChildren();
    data.children.forEach((c) => {
      const input = el("input", { type: "text", value: c.name, maxlength: "20", "aria-label": "孩子名稱" });
      input.addEventListener("change", () => {
        const name = input.value.trim();
        if (!name) { input.value = c.name; return; }
        c.name = name;
        save();
        renderAll();
      });
      const del = el("button", { type: "button", class: "danger small", text: "刪除" });
      del.addEventListener("click", () => {
        if (data.children.length <= 1) { window.alert("至少要保留一個孩子。"); return; }
        const count = data.records.filter((r) => r.childId === c.id).length;
        const msg = "確定要刪除「" + c.name + "」嗎？" + (count ? "他的 " + count + " 筆紀錄也會一起刪除。" : "");
        if (!window.confirm(msg)) return;
        data.children = data.children.filter((x) => x.id !== c.id);
        data.records = data.records.filter((r) => r.childId !== c.id);
        if (currentChildId === c.id) currentChildId = data.children[0].id;
        save();
        renderAll();
      });
      box.append(el("div", { class: "child-row" }, [el("span", { class: "dot", style: "background:" + colorVar(c) }), input, del]));
    });
    $("add-child-btn").hidden = data.children.length >= MAX_COLORS;
  }

  $("add-child-btn").addEventListener("click", () => {
    data.children.push({ id: newId(), name: "孩子" + (data.children.length + 1), color: nextColor() });
    save();
    renderAll();
  });

  // ---------- 設定：備份 ----------
  function download(filename, content, type) {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = el("a", { href: url, download: filename });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function today() {
    const d = new Date();
    return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
  }

  $("export-json-btn").addEventListener("click", () => {
    const payload = { app: "kids-health", version: 1, exportedAt: new Date().toISOString(), children: data.children, records: data.records };
    download("kids-health-backup-" + today() + ".json", JSON.stringify(payload, null, 2), "application/json");
    showMessage($("backup-message"), "ok", "已匯出備份檔。請把檔案存到雲端硬碟或傳給自己，換手機時用它還原。");
  });

  $("export-csv-btn").addEventListener("click", () => {
    const header = ["孩子", "學年度", "學期", "年級", "測量日期", "身高(公分)", "體重(公斤)", "BMI", "裸視右", "裸視左", "戴鏡右", "戴鏡左", "散光右", "散光左", "散光度數右", "散光度數左", "備註"];
    const esc = (v) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const rows = data.children.flatMap((c) => recordsOf(c.id).map((r) => [
      c.name, r.year, TERM_TEXT[r.term] + "學期", r.grade, r.date, r.height, r.weight, bmi(r),
      r.visionR, r.visionL, r.glassesR, r.glassesL, r.astigR, r.astigL, r.astigDegR, r.astigDegL, r.note,
    ]));
    const csv = "﻿" + [header, ...rows].map((row) => row.map(esc).join(",")).join("\r\n");
    download("kids-health-" + today() + ".csv", csv, "text/csv;charset=utf-8");
    showMessage($("backup-message"), "ok", "已匯出 CSV，可以用 Excel 或 Google 試算表開啟。");
  });

  $("import-file").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let parsed = null;
      try { parsed = JSON.parse(String(reader.result)); } catch (err) { parsed = null; }
      if (!parsed || parsed.app !== "kids-health" || !isValidData(parsed)) {
        showMessage($("backup-message"), "error", "這不是有效的健康紀錄備份檔。");
        event.target.value = "";
        return;
      }
      const msg = "備份檔有 " + parsed.children.length + " 個孩子、" + parsed.records.length + " 筆紀錄。還原後會取代目前所有資料，確定嗎？";
      if (!window.confirm(msg)) { event.target.value = ""; return; }
      data = { children: parsed.children, records: parsed.records };
      data.children.forEach((c) => { if (!c.color) c.color = nextColor(); });
      currentChildId = data.children[0].id;
      save();
      renderAll();
      showMessage($("backup-message"), "ok", "已從備份檔還原。");
      event.target.value = "";
    };
    reader.readAsText(file);
  });

  $("clear-btn").addEventListener("click", () => {
    if (!window.confirm("確定要清除這台裝置上的所有紀錄嗎？建議先匯出備份。這個動作無法復原。")) return;
    data = defaultData();
    currentChildId = data.children[0].id;
    save();
    renderAll();
  });

  // ---------- 啟動 ----------
  function renderAll() {
    closeForm();
    renderRecords();
    renderChildrenSettings();
    if (!$("panel-charts").hidden) renderChart();
  }

  if (!storageOk) $("storage-warning").hidden = false;
  else save();
  // 請瀏覽器不要自動清掉這個網站的資料（支援的瀏覽器才有效）
  if (navigator.storage && typeof navigator.storage.persist === "function") navigator.storage.persist().catch(() => {});

  renderAll();

  // ---------- PWA ----------
  if ("serviceWorker" in navigator) {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hadController) $("update-bar").hidden = false;
    });
    $("update-btn").addEventListener("click", () => window.location.reload());
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then((registration) => {
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") registration.update().catch(() => {});
        });
      }).catch(() => {});
    });
  }
})();
