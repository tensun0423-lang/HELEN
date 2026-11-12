// 報修登記前端：新增報修，並顯示最近 20 筆
(function () {
  "use strict";

  const TABLE = "repair_requests";
  const LIST_LIMIT = 20;
  const CATEGORIES = ["設備", "網路", "環境", "其他"];
  const URGENCIES = ["低", "中", "高"];
  // 與 supabase/schema.sql 的 CHECK 限制一致
  const MAX_LENGTH = { reporter_name: 50, location: 100, description: 1000 };
  const LABELS = { reporter_name: "報修人", location: "地點或部門", description: "問題說明" };

  const form = document.getElementById("repair-form");
  const submitBtn = document.getElementById("submit-btn");
  const formMessage = document.getElementById("form-message");
  const listMessage = document.getElementById("list-message");
  const list = document.getElementById("request-list");
  const refreshBtn = document.getElementById("refresh-btn");
  const descInput = document.getElementById("description");
  const descCount = document.getElementById("desc-count");

  function showMessage(el, type, text) {
    el.className = "message " + type;
    el.textContent = text;
    el.hidden = false;
  }

  function hideMessage(el) {
    el.hidden = true;
    el.textContent = "";
  }

  // 載入設定與 supabase-js
  const config = window.APP_CONFIG;
  let client = null;
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    showMessage(formMessage, "error", "無法載入 Supabase 程式庫，請檢查網路連線後重新整理頁面。");
  } else if (!config || !config.supabaseUrl || !config.supabaseKey) {
    showMessage(formMessage, "error", "缺少 Supabase 設定，請檢查 config.js。");
  } else {
    client = window.supabase.createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  // 把資料庫錯誤轉成看得懂的說明
  function describeError(error) {
    const code = error && error.code;
    if (code === "42501") return "沒有權限，請確認 Supabase 的權限與 RLS 設定。";
    if (code === "23514") return "資料不符合規定，請檢查各欄位內容。";
    if (code === "42P01" || code === "PGRST205") return "找不到報修資料表，請先在 Supabase 執行 supabase/schema.sql。";
    if (error && /fetch|network/i.test(error.message || "")) return "網路連線失敗，請稍後再試。";
    return (error && error.message) || "發生未知錯誤。";
  }

  // 檢查表單，回傳要送出的資料；有錯誤則回傳 null
  function readForm() {
    const data = new FormData(form);
    const payload = {
      reporter_name: String(data.get("reporter_name") || "").trim(),
      location: String(data.get("location") || "").trim(),
      category: String(data.get("category") || ""),
      description: String(data.get("description") || "").trim(),
      urgency: String(data.get("urgency") || "中"),
      // 刻意不送 status：資料庫會自動設成「待處理」
    };

    const problems = [];
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));

    Object.keys(MAX_LENGTH).forEach((key) => {
      const value = payload[key];
      if (!value) {
        problems.push("請填寫" + LABELS[key]);
        form.elements[key].setAttribute("aria-invalid", "true");
      } else if (value.length > MAX_LENGTH[key]) {
        problems.push(LABELS[key] + "最多 " + MAX_LENGTH[key] + " 字");
        form.elements[key].setAttribute("aria-invalid", "true");
      }
    });
    if (!CATEGORIES.includes(payload.category)) {
      problems.push("請選擇類別");
      form.elements.category.setAttribute("aria-invalid", "true");
    }
    if (!URGENCIES.includes(payload.urgency)) {
      problems.push("請選擇緊急程度");
    }

    if (problems.length) {
      showMessage(formMessage, "error", problems.join("、") + "。");
      const firstInvalid = form.querySelector("[aria-invalid='true']");
      if (firstInvalid) firstInvalid.focus();
      return null;
    }
    return payload;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    hideMessage(formMessage);
    if (!client) {
      showMessage(formMessage, "error", "目前無法連線到資料庫，請重新整理頁面。");
      return;
    }

    const payload = readForm();
    if (!payload) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "送出中…";
    try {
      // 不用 .select()：只新增，不需要回傳資料
      const { error } = await client.from(TABLE).insert(payload);
      if (error) {
        showMessage(formMessage, "error", "送出失敗：" + describeError(error));
        return;
      }
      showMessage(formMessage, "ok", "已送出報修，謝謝！");
      form.reset();
      updateCount();
      loadList();
    } catch (err) {
      showMessage(formMessage, "error", "送出失敗：" + describeError(err));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "送出報修";
    }
  }

  const timeFormat = new Intl.DateTimeFormat("zh-TW", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });

  function makeTag(text, extraClass) {
    const span = document.createElement("span");
    span.className = "tag" + (extraClass ? " " + extraClass : "");
    span.textContent = text;
    return span;
  }

  // 用 textContent 組畫面，避免使用者輸入的內容被當成 HTML 執行
  function renderList(rows) {
    list.replaceChildren();
    if (!rows.length) {
      showMessage(listMessage, "info", "目前還沒有報修紀錄。");
      return;
    }
    hideMessage(listMessage);

    rows.forEach((row) => {
      const li = document.createElement("li");
      li.className = "request-item";

      const top = document.createElement("div");
      top.className = "request-top";
      top.append(
        makeTag(row.status),
        makeTag(row.category),
        makeTag("緊急：" + row.urgency, "urgency-" + row.urgency)
      );

      const desc = document.createElement("p");
      desc.className = "request-desc";
      desc.textContent = row.description;

      const meta = document.createElement("div");
      meta.className = "request-meta";
      const time = row.created_at ? timeFormat.format(new Date(row.created_at)) : "";
      meta.textContent = [row.reporter_name, row.location, time].filter(Boolean).join("・");

      li.append(top, desc, meta);
      list.append(li);
    });
  }

  async function loadList() {
    if (!client) return;
    refreshBtn.disabled = true;
    showMessage(listMessage, "info", "載入中…");
    try {
      const { data, error } = await client
        .from(TABLE)
        .select("id, created_at, reporter_name, location, category, description, urgency, status")
        .order("created_at", { ascending: false })
        .limit(LIST_LIMIT);
      if (error) {
        list.replaceChildren();
        showMessage(listMessage, "error", "清單載入失敗：" + describeError(error));
        return;
      }
      renderList(data || []);
    } catch (err) {
      list.replaceChildren();
      showMessage(listMessage, "error", "清單載入失敗：" + describeError(err));
    } finally {
      refreshBtn.disabled = false;
    }
  }

  function updateCount() {
    descCount.textContent = String(descInput.value.length);
  }

  form.addEventListener("submit", handleSubmit);
  refreshBtn.addEventListener("click", loadList);
  descInput.addEventListener("input", updateCount);

  updateCount();
  loadList();
})();
