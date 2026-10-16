/**
 * @fileoverview LEX LABS ENTERPRISE: CLOUD CLIENT & NETWORK GATEWAY
 * @module api/cloud_client
 * 
 * @description
 * Централизованный сетевой транспорт JSONBin API, управление гонками запросов (Race Condition lock),
 * E-Tag / версионирование снимков и двусторонняя синхронизация с LocalStorage.
 */

window.currentCloudData = window.currentCloudData || {};

// Переменные состояния сетевого транспорта и защиты от состояния гонки
let isCloudSaving = false;
let pendingCloudPayload = null;
let lastCloudETag = null;

/**
 * Обновление визуального индикатора сетевого статуса JSONBin / LocalStorage
 * @param {boolean} isOnline - Доступно ли удаленное облако
 * @param {string} [text] - Текст статуса
 */
function updateJsonbinStatusBadge(isOnline, text) {
  const badge = document.getElementById("jsonbinStatusBadge");
  if (!badge) return;

  const escapeFn = window.escapeHtml || (s => s);

  if (isOnline) {
    badge.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <span>JSONBin: <b class="text-emerald-400 font-medium">${escapeFn(text || "Online")}</b></span>
    `;
  } else {
    badge.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
      <span>Storage: <b class="text-amber-400 font-medium">${escapeFn(text || "Local Cache")}</b></span>
    `;
  }
}

/**
 * Сборка резервного снимка данных из LocalStorage при сетевом сбое или офлайн-режиме
 * @returns {object}
 */
function buildFallbackDataFromLocalStorage() {
  const readFn = window.readStorage || ((k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch (_) { return d; }
  });

  const cached = readFn("lex_dashboard_cloud_cache", null);
  let data = (typeof cached === "object" && cached !== null) ? cached : {};

  // Нормализация плоской структуры
  if (data.pet && !data.katya) {
    data = { katya: Object.assign({}, data) };
  }

  if (!data.katya || typeof data.katya !== "object") {
    data.katya = {};
  }

  const k = data.katya;

  // 1. Состояние питомца
  const localPet = readFn("katya_master_pet_state", readFn("pet_state", null));
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

  // 2. Игровая аналитика
  const localAnalytics = readFn("katya_master_analytics", readFn("game_analytics", null));
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

  // 3. Купоны желаний
  const localWishes = readFn("katya_master_wishes_vault", readFn("katya_wishes", []));
  k.wishes = Array.isArray(localWishes) && localWishes.length > 0 ? localWishes : (Array.isArray(k.wishes) ? k.wishes : []);

  // 4. Истории кейсов, рулетки, аудита
  const localCases = readFn("katya_master_case_history", readFn("katya_case_history", []));
  k.caseHistory = Array.isArray(localCases) && localCases.length > 0 ? localCases : (Array.isArray(k.caseHistory) ? k.caseHistory : []);

  const localRoulette = readFn("katya_master_roulette_history", readFn("roulette_history", []));
  k.rouletteHistory = Array.isArray(localRoulette) && localRoulette.length > 0 ? localRoulette : (Array.isArray(k.rouletteHistory) ? k.rouletteHistory : []);

  const localAudit = readFn("katya_master_audit_events", readFn("katya_audit", []));
  k.audit = Array.isArray(localAudit) && localAudit.length > 0 ? localAudit : (Array.isArray(k.audit) ? k.audit : []);

  const localFeedback = readFn("katya_master_feedback", readFn("katya_feedback", []));
  k.feedback = Array.isArray(localFeedback) && localFeedback.length > 0 ? localFeedback : (Array.isArray(k.feedback) ? k.feedback : []);

  k.lastActive = k.lastActive || new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return data;
}

/**
 * Нормализация входящего снимка данных из Cloud
 * @param {object} root - Данные от API
 * @returns {object}
 */
function normalizeCloudData(root) {
  let normalized = (root && typeof root === "object") ? root : {};

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
 * Загрузка актуального состояния из JSONBin с автоматическим кэшированием и fallback
 * @returns {Promise<object>}
 */
async function fetchCloudData() {
  const binId = window.JSONBIN_BIN_ID || "6acb3d30ac6210605a272eb6";
  const apiKey = window.JSONBIN_API_KEY || "$2a$10$JBnAcYGGmJL6Q5lDn45nHeW4jsBStn1Z/4XRrRormnfaKG7YbqUN2";

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { "X-Master-Key": apiKey }
    });

    if (!res.ok) {
      throw new Error(`JSONBin error HTTP ${res.status}`);
    }

    // Фиксация E-Tag / версии для предотвращения перезаписи при параллельных сессиях
    const etag = res.headers.get("etag") || res.headers.get("x-version-id");
    if (etag) lastCloudETag = etag;

    const cloud = await res.json();
    const rawRecord = cloud.record || {};
    const normalized = normalizeCloudData(rawRecord);

    window.currentCloudData = normalized;

    if (typeof window.writeStorage === "function") {
      window.writeStorage("lex_dashboard_cloud_cache", normalized);
    } else {
      localStorage.setItem("lex_dashboard_cloud_cache", JSON.stringify(normalized));
    }

    updateJsonbinStatusBadge(true, "Online");
    return window.currentCloudData;
  } catch (e) {
    console.warn("[CloudClient] Fetch error, using LocalStorage fallback:", e);
    const fallback = buildFallbackDataFromLocalStorage();
    window.currentCloudData = fallback;
    updateJsonbinStatusBadge(false, "Локальный кэш");
    return window.currentCloudData;
  }
}

/**
 * Сохранение состояния в Cloud с блокировкой параллельных гонок (Race Condition Lock)
 * @param {object} [data] - Данные для сохранения (по умолчанию window.currentCloudData)
 * @returns {Promise<boolean>}
 */
async function saveCloud(data) {
  const payload = data !== undefined ? data : window.currentCloudData;
  if (!payload) return false;

  // Сохраняем немедленно в локальный кэш (Optimistic Local Persist)
  try {
    const writeFn = window.writeStorage || ((k, v) => localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)));
    writeFn("lex_dashboard_cloud_cache", payload);
    if (payload.katya) {
      if (payload.katya.pet) writeFn("katya_master_pet_state", payload.katya.pet);
      if (payload.katya.analytics) writeFn("katya_master_analytics", payload.katya.analytics);
      if (payload.katya.wishes) writeFn("katya_master_wishes_vault", payload.katya.wishes);
      if (payload.katya.caseHistory) writeFn("katya_master_case_history", payload.katya.caseHistory);
      if (payload.katya.rouletteHistory) writeFn("katya_master_roulette_history", payload.katya.rouletteHistory);
      if (payload.katya.audit) writeFn("katya_master_audit_events", payload.katya.audit);
      if (payload.katya.feedback) writeFn("katya_master_feedback", payload.katya.feedback);
    }
  } catch (err) {
    console.warn("[CloudClient] Local cache write warning:", err);
  }

  // Блокировка гонок (Race Condition Lock)
  if (isCloudSaving) {
    pendingCloudPayload = payload;
    return true;
  }

  isCloudSaving = true;
  const binId = window.JSONBIN_BIN_ID || "6acb3d30ac6210605a272eb6";
  const apiKey = window.JSONBIN_API_KEY || "$2a$10$JBnAcYGGmJL6Q5lDn45nHeW4jsBStn1Z/4XRrRormnfaKG7YbqUN2";

  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Master-Key": apiKey
    };
    if (lastCloudETag) {
      headers["If-Match"] = lastCloudETag;
    }

    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`JSONBin save error HTTP ${res.status}`);

    const newETag = res.headers.get("etag") || res.headers.get("x-version-id");
    if (newETag) lastCloudETag = newETag;

    updateJsonbinStatusBadge(true, "Online");
    return true;
  } catch (e) {
    console.warn("[CloudClient] Network save failed (saved locally):", e);
    updateJsonbinStatusBadge(false, "Сохранено локально");
    return false;
  } finally {
    isCloudSaving = false;
    // Если во время сохранения поступил новый payload, сохраняем его в следующей итерации
    if (pendingCloudPayload) {
      const nextPayload = pendingCloudPayload;
      pendingCloudPayload = null;
      saveCloud(nextPayload);
    }
  }
}

/**
 * Экстренное сохранение текущего снимка в LocalStorage
 */
function saveLocal() {
  if (window.currentCloudData) {
    const writeFn = window.writeStorage || ((k, v) => localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)));
    writeFn("lex_dashboard_cloud_cache", window.currentCloudData);
  }
}

/**
 * Принудительная ручная синхронизация по нажатию кнопки в UI
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

// Экспорт в глобальный контекст window
window.fetchCloudData = fetchCloudData;
window.saveCloud = saveCloud;
window.saveCloudData = saveCloud; // Алиас saveCloudData для единообразия архитектуры
window.saveLocal = saveLocal;
window.forceManualSync = forceManualSync;
window.updateJsonbinStatusBadge = updateJsonbinStatusBadge;
window.buildFallbackDataFromLocalStorage = buildFallbackDataFromLocalStorage;
window.normalizeCloudData = normalizeCloudData;
