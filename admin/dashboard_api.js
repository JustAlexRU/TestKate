/**
 * @fileoverview LEX LABS ENTERPRISE: DASHBOARD API GATEWAY & DATA UTILS
 * @module admin/dashboard_api
 * 
 * @description
 * Зона ответственности (Single Responsibility):
 * Сетевой шлюз Cloud API (JSONBin), локальный кэш и базовые безопасные утилиты
 * парсинга данных, чтения LocalStorage и санитайзинга HTML-разметки.
 *
 * @exports
 * - window.safeParseJSON(str, fallback) — безопасный парсинг JSON без исключений
 * - window.readStorage(key, fallback) — безопасное чтение LocalStorage с защитой от повреждений
 * - window.escapeHtml(str) — XSS-санитайзер строк перед выводом в innerHTML
 * - window.currentCloudData — глобальное хранилище последнего снимка облачных данных
 * - window.fetchCloudData() — получение актуального снапшота из JSONBin с fallback на LocalStorage
 * - window.saveCloud(data) — сохранение состояния в JSONBin с проверкой res.ok и кэшированием в LocalStorage
 * - window.saveLocal() — экстренное сохранение в локальное хранилище браузера
 * - window.forceManualSync() — принудительная синхронизация стейта по кнопке UI
 * - window.buildFallbackDataFromLocalStorage() — сборка целостного состояния из ключей LocalStorage
 * - window.updateJsonbinStatusBadge(isOnline, text) — индикация статуса подключения в шапке
 */

window.DASHBOARD_VERSION = "2.4.1";
window.DASHBOARD_BUILD = 241;

// Базовые безопасные утилиты хранилища и рендеринга
function safeParseJSON(str, fallback) {
  if (typeof str !== "string") return fallback;
  try {
    const val = JSON.parse(str);
    return val !== null && val !== undefined ? val : fallback;
  } catch (e) {
    return fallback;
  }
}
window.safeParseJSON = safeParseJSON;

function readStorage(key, fallback) {
  try {
    return safeParseJSON(localStorage.getItem(key), fallback);
  } catch (e) {
    return fallback;
  }
}
window.readStorage = readStorage;

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
window.escapeHtml = escapeHtml;

const JSONBIN_BIN_ID = "6acb3d30ac6210605a272eb6";
const JSONBIN_API_KEY = "$2a$10$JBnAcYGGmJL6Q5lDn45nHeW4jsBStn1Z/4XRrRormnfaKG7YbqUN2";

window.currentCloudData = {};

/**
 * Обновление бейджа сетевого статуса JSONBin / LocalStorage в шапке
 */
function updateJsonbinStatusBadge(isOnline, text) {
  const badge = document.getElementById("jsonbinStatusBadge");
  if (!badge) return;

  if (isOnline) {
    badge.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <span>JSONBin: <b class="text-emerald-400 font-medium">${escapeHtml(text || "Online")}</b></span>
    `;
  } else {
    badge.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
      <span>Storage: <b class="text-amber-400 font-medium">${escapeHtml(text || "Local Cache")}</b></span>
    `;
  }
}
window.updateJsonbinStatusBadge = updateJsonbinStatusBadge;

/**
 * Сборка полного снимка данных из LocalStorage при сбое или отсутствии связи с JSONBin
 */
function buildFallbackDataFromLocalStorage() {
  const cached = readStorage("lex_dashboard_cloud_cache", null);
  let data = (typeof cached === "object" && cached !== null) ? cached : {};

  // Если в кэше данные плоские (где pet на верхнем уровне), нормализуем под структуру { katya: { ... } }
  if (data.pet && !data.katya) {
    data = { katya: Object.assign({}, data) };
  }

  if (!data.katya || typeof data.katya !== "object") {
    data.katya = {};
  }

  const k = data.katya;

  // Питомец
  const localPet = readStorage("katya_master_pet_state", readStorage("pet_state", null));
  if (localPet && typeof localPet === "object") {
    k.pet = Object.assign({}, k.pet || {}, localPet);
  }
  if (!k.pet || typeof k.pet !== "object") {
    k.pet = {
      name: "Зефирка",
      coins: 150,
      level: 1,
      xp: 0,
      hunger: 80,
      happy: 80,
      energy: 80,
      clean: 80
    };
  }

  // Аналитика
  const localAnalytics = readStorage("katya_master_analytics", readStorage("game_analytics", null));
  if (localAnalytics && typeof localAnalytics === "object") {
    k.analytics = Object.assign({}, k.analytics || {}, localAnalytics);
  }
  if (!k.analytics || typeof k.analytics !== "object") {
    k.analytics = {
      totalSecondsPlayed: 180,
      sessionsCount: 3,
      spentCoins: 45,
      casesOpened: 1
    };
  }

  // Купоны желаний
  const localWishes = readStorage("katya_master_wishes_vault", readStorage("katya_wishes", []));
  if (Array.isArray(localWishes) && localWishes.length > 0) {
    k.wishes = localWishes;
  } else if (!Array.isArray(k.wishes)) {
    k.wishes = [];
  }

  // История кейсов
  const localCases = readStorage("katya_master_case_history", readStorage("katya_case_history", []));
  if (Array.isArray(localCases) && localCases.length > 0) {
    k.caseHistory = localCases;
  } else if (!Array.isArray(k.caseHistory)) {
    k.caseHistory = [];
  }

  // История рулетки
  const localRoulette = readStorage("katya_master_roulette_history", readStorage("roulette_history", []));
  if (Array.isArray(localRoulette) && localRoulette.length > 0) {
    k.rouletteHistory = localRoulette;
  } else if (!Array.isArray(k.rouletteHistory)) {
    k.rouletteHistory = [];
  }

  // Аудит-лог (1С Ledger)
  const localAudit = readStorage("katya_master_audit_events", readStorage("katya_audit", []));
  if (Array.isArray(localAudit) && localAudit.length > 0) {
    k.audit = localAudit;
  } else if (!Array.isArray(k.audit)) {
    k.audit = [];
  }

  // Обратная связь и тикеты поддержки
  const localFeedback = readStorage("katya_master_feedback", readStorage("katya_feedback", []));
  if (Array.isArray(localFeedback) && localFeedback.length > 0) {
    k.feedback = localFeedback;
  } else if (!Array.isArray(k.feedback)) {
    k.feedback = [];
  }

  k.lastActive = k.lastActive || new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return data;
}
window.buildFallbackDataFromLocalStorage = buildFallbackDataFromLocalStorage;

/**
 * Нормализация структуры данных
 */
function normalizeCloudData(root) {
  let normalized = (root && typeof root === "object") ? root : {};

  // Если данные пришли плоским объектом с pet на верхнем уровне
  if (normalized.pet && !normalized.katya) {
    normalized = {
      katya: Object.assign({}, normalized),
      economyConfig: normalized.economyConfig,
      irlBudgetConfig: normalized.irlBudgetConfig
    };
  }

  if (!normalized.katya || typeof normalized.katya !== "object") {
    normalized.katya = {};
  }

  // Дополняем отсутствующие сущности из локального хранилища браузера
  const fallback = buildFallbackDataFromLocalStorage();
  const k = normalized.katya;

  if (!k.pet || Object.keys(k.pet).length === 0) k.pet = fallback.katya.pet;
  if (!k.analytics || Object.keys(k.analytics).length === 0) k.analytics = fallback.katya.analytics;
  if (!Array.isArray(k.wishes) || k.wishes.length === 0) k.wishes = fallback.katya.wishes;
  if (!Array.isArray(k.caseHistory) || k.caseHistory.length === 0) k.caseHistory = fallback.katya.caseHistory;
  if (!Array.isArray(k.rouletteHistory) || k.rouletteHistory.length === 0) k.rouletteHistory = fallback.katya.rouletteHistory;
  if (!Array.isArray(k.audit) || k.audit.length === 0) k.audit = fallback.katya.audit;
  if (!Array.isArray(k.feedback) || k.feedback.length === 0) k.feedback = fallback.katya.feedback;

  return normalized;
}

/**
 * Загрузка данных из облака JSONBin с автоматическим fallback на LocalStorage
 */
async function fetchCloudData() {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY }
    });

    if (!res.ok) {
      throw new Error(`JSONBin error HTTP ${res.status}`);
    }

    const cloud = await res.json();
    const rawRecord = cloud.record || {};
    const normalized = normalizeCloudData(rawRecord);

    window.currentCloudData = normalized;
    localStorage.setItem("lex_dashboard_cloud_cache", JSON.stringify(normalized));
    updateJsonbinStatusBadge(true, "Online");
    return window.currentCloudData;
  } catch (e) {
    console.warn("[API] Fetch error, using LocalStorage fallback:", e);
    const fallback = buildFallbackDataFromLocalStorage();
    window.currentCloudData = fallback;
    updateJsonbinStatusBadge(false, "Локальный кэш");
    return window.currentCloudData;
  }
}
window.fetchCloudData = fetchCloudData;

/**
 * Сохранение данных в JSONBin с обязательным сохранением локального снимка
 */
async function saveCloud(data) {
  const payload = data !== undefined ? data : window.currentCloudData;
  if (!payload) return false;

  // Обязательно сохраняем локальный кэш
  try {
    localStorage.setItem("lex_dashboard_cloud_cache", JSON.stringify(payload));
    if (payload.katya) {
      if (payload.katya.pet) localStorage.setItem("katya_master_pet_state", JSON.stringify(payload.katya.pet));
      if (payload.katya.analytics) localStorage.setItem("katya_master_analytics", JSON.stringify(payload.katya.analytics));
      if (payload.katya.wishes) localStorage.setItem("katya_master_wishes_vault", JSON.stringify(payload.katya.wishes));
      if (payload.katya.caseHistory) localStorage.setItem("katya_master_case_history", JSON.stringify(payload.katya.caseHistory));
      if (payload.katya.rouletteHistory) localStorage.setItem("katya_master_roulette_history", JSON.stringify(payload.katya.rouletteHistory));
      if (payload.katya.audit) localStorage.setItem("katya_master_audit_events", JSON.stringify(payload.katya.audit));
      if (payload.katya.feedback) localStorage.setItem("katya_master_feedback", JSON.stringify(payload.katya.feedback));
    }
  } catch (err) {
    console.warn("[API] Local storage save error:", err);
  }

  // Отправляем в JSONBin
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_API_KEY },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`JSONBin error HTTP ${res.status}`);
    updateJsonbinStatusBadge(true, "Online");
    return true;
  } catch (e) {
    console.warn("[API] Network save failed (saved locally):", e);
    updateJsonbinStatusBadge(false, "Сохранено локально");
    return false;
  }
}
window.saveCloud = saveCloud;

/**
 * Экстренное сохранение локального состояния
 */
function saveLocal() {
  if (window.currentCloudData) {
    localStorage.setItem("lex_dashboard_cloud_cache", JSON.stringify(window.currentCloudData));
  }
}
window.saveLocal = saveLocal;

/**
 * Принудительная ручная синхронизация
 */
async function forceManualSync() {
  const syncBtn = document.getElementById("btnRefresh");
  if (syncBtn) syncBtn.classList.add("animate-spin");
  try {
    await fetchCloudData();
    if (typeof window.renderDashboard === "function") {
      await window.renderDashboard();
    }
  } finally {
    if (syncBtn) setTimeout(() => syncBtn.classList.remove("animate-spin"), 500);
  }
}
window.forceManualSync = forceManualSync;