/**
 * @fileoverview LEX LABS ENTERPRISE: CLOUD CLIENT & NETWORK GATEWAY
 * @module api/cloud_client
 * 
 * @description
 * Централизованный сетевой транспорт JSONBin API, управление гонками запросов (Race Condition lock),
 * Circuit Breaker / Quota Guard при исчерпании лимитов, E-Tag / версионирование снимков
 * и мгновенная двусторонняя реактивная синхронизация с LocalStorage (storage event).
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

  if (window.CLOUD_QUOTA_EXHAUSTED) {
    badge.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
      <span title="Квота запросов JSONBin исчерпана. Данные сохраняются автономно в LocalStorage. Нажмите для настройки">Storage: <b class="text-amber-400 font-medium">${escapeFn(text || "Автономно (Квота)")}</b></span>
    `;
    badge.classList.add("cursor-pointer", "hover:opacity-80");
    return;
  }

  if (isOnline) {
    badge.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <span title="Синхронизировано с JSONBin Cloud. Нажмите для настройки">JSONBin: <b class="text-emerald-400 font-medium">${escapeFn(text || "Online")}</b></span>
    `;
  } else {
    badge.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
      <span title="Работа в локальном режиме. Нажмите для настройки">Storage: <b class="text-amber-400 font-medium">${escapeFn(text || "Local Cache")}</b></span>
    `;
  }
  badge.classList.add("cursor-pointer", "hover:opacity-80");
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
      clean: 80,
      starSparks: 0
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
  
  // Умный мердж журнала аудита (не теряем ни локальные, ни облачные события)
  const fallbackAudit = fallback.katya.audit || [];
  if (!Array.isArray(k.audit) || k.audit.length === 0) {
    k.audit = fallbackAudit;
  } else if (Array.isArray(fallbackAudit) && fallbackAudit.length > 0) {
    const seenAudit = new Set();
    const mergedAudit = [];
    [...k.audit, ...fallbackAudit].forEach(it => {
      if (!it || !it.text) return;
      const key = (it.timestamp || 0) + "_" + (it.date || "") + "_" + (it.time || "") + "_" + it.text;
      if (!seenAudit.has(key)) {
        seenAudit.add(key);
        mergedAudit.push(it);
      }
    });
    mergedAudit.sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));
    k.audit = mergedAudit;
  }

  // Умный мердж тикетов обратной связи и сообщений
  const fallbackFeedback = fallback.katya.feedback || [];
  if (!Array.isArray(k.feedback) || k.feedback.length === 0) {
    k.feedback = fallbackFeedback;
  } else if (Array.isArray(fallbackFeedback) && fallbackFeedback.length > 0) {
    const fMap = new Map();
    k.feedback.forEach(it => { if (it && it.id) fMap.set(it.id, Object.assign({}, it)); });
    fallbackFeedback.forEach(localIt => {
      if (!localIt || !localIt.id) return;
      if (fMap.has(localIt.id)) {
        const cloudIt = fMap.get(localIt.id);
        if (Array.isArray(cloudIt.messages) && cloudIt.messages.length >= (localIt.messages?.length || 0)) {
          // Cloud has newer messages
        } else if (Array.isArray(localIt.messages) && localIt.messages.length > (cloudIt.messages?.length || 0)) {
          cloudIt.messages = localIt.messages;
        }
        if (localIt.praiseAccepted) cloudIt.praiseAccepted = true;
        if (localIt.inKanban) cloudIt.inKanban = true;
        if (localIt.taskType && !cloudIt.taskType) cloudIt.taskType = localIt.taskType;
      } else {
        fMap.set(localIt.id, localIt);
      }
    });
    k.feedback = Array.from(fMap.values());
  }

  return normalized;
}

/**
 * Загрузка актуального состояния из JSONBin с автоматическим кэшированием, fallback и Circuit Breaker
 * @param {boolean} [force=false] - Принудительно попытаться выполнить сетевой запрос, даже если взведён Circuit Breaker
 * @returns {Promise<object>}
 */
async function fetchCloudData(force = false) {
  // Circuit Breaker: если квота исчерпана и не запрошен принудительный опрос, сразу возвращаем LocalStorage
  if (window.CLOUD_QUOTA_EXHAUSTED && !force) {
    const fallback = buildFallbackDataFromLocalStorage();
    window.currentCloudData = fallback;
    updateJsonbinStatusBadge(false, "Автономно (Квота)");
    return window.currentCloudData;
  }

  const binId = window.JSONBIN_BIN_ID || "6acb3d30ac6210605a272eb6";
  const apiKey = window.JSONBIN_API_KEY || "$2a$10$JBnAcYGGmJL6Q5lDn45nHeW4jsBStn1Z/4XRrRormnfaKG7YbqUN2";

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { "X-Master-Key": apiKey }
    });

    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        window.CLOUD_QUOTA_EXHAUSTED = true;
        try { localStorage.setItem("lex_cloud_quota_exhausted", "true"); } catch (_) {}
        console.warn(`[CloudClient] JSONBin HTTP ${res.status} quota limit reached. Circuit Breaker activated: falling back to LocalStorage.`);
        const fallback = buildFallbackDataFromLocalStorage();
        window.currentCloudData = fallback;
        updateJsonbinStatusBadge(false, "Автономно (Квота)");
        return window.currentCloudData;
      }
      throw new Error(`JSONBin error HTTP ${res.status}`);
    }

    // При успешном ответе снимаем флаг исчерпания квоты
    if (window.CLOUD_QUOTA_EXHAUSTED) {
      window.CLOUD_QUOTA_EXHAUSTED = false;
      try { localStorage.removeItem("lex_cloud_quota_exhausted"); } catch (_) {}
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
    updateJsonbinStatusBadge(false, window.CLOUD_QUOTA_EXHAUSTED ? "Автономно (Квота)" : "Локальный кэш");
    return window.currentCloudData;
  }
}

/**
 * Сохранение состояния в Cloud с блокировкой параллельных гонок (Race Condition Lock) и Circuit Breaker
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

  // Circuit Breaker: если лимит запросов исчерпан, локальной записи достаточно
  if (window.CLOUD_QUOTA_EXHAUSTED) {
    updateJsonbinStatusBadge(false, "Автономно (Квота)");
    return true;
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

    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        window.CLOUD_QUOTA_EXHAUSTED = true;
        try { localStorage.setItem("lex_cloud_quota_exhausted", "true"); } catch (_) {}
        console.warn(`[CloudClient] JSONBin save HTTP ${res.status}. Circuit Breaker activated: saved locally.`);
        updateJsonbinStatusBadge(false, "Автономно (Квота)");
        return true;
      }
      throw new Error(`JSONBin save error HTTP ${res.status}`);
    }

    const newETag = res.headers.get("etag") || res.headers.get("x-version-id");
    if (newETag) lastCloudETag = newETag;

    updateJsonbinStatusBadge(true, "Online");
    return true;
  } catch (e) {
    console.warn("[CloudClient] Network save failed (saved locally):", e);
    updateJsonbinStatusBadge(false, window.CLOUD_QUOTA_EXHAUSTED ? "Автономно (Квота)" : "Сохранено локально");
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
    await fetchCloudData(true);
    if (typeof window.renderDashboard === "function") {
      await window.renderDashboard();
    }
  } finally {
    if (syncBtn) setTimeout(() => syncBtn.classList.remove("animate-spin"), 500);
  }
}

/**
 * Открытие модального окна настроек Cloud API и режима работы
 */
function openCloudConfigModal() {
  const modal = document.getElementById("modalCloudConfig");
  if (!modal) return;

  const inputBinId = document.getElementById("inputCloudBinId");
  const inputApiKey = document.getElementById("inputCloudApiKey");
  const statusBanner = document.getElementById("cloudConfigStatusBanner");

  if (inputBinId) inputBinId.value = window.JSONBIN_BIN_ID || "";
  if (inputApiKey) inputApiKey.value = window.JSONBIN_API_KEY || "";

  if (statusBanner) {
    if (window.CLOUD_QUOTA_EXHAUSTED) {
      statusBanner.innerHTML = `
        <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <span class="text-xl leading-none">⚠️</span>
          <div>
            <div class="font-bold text-amber-200">Квота бесплатных запросов JSONBin исчерпана (HTTP 403)</div>
            <div class="text-[11px] text-amber-300/80 mt-1 leading-relaxed">
              Circuit Breaker активирован: сетевой спам заблокирован. Система функционирует автономно через LocalStorage. Все балансы, кейсы, купоны и чаты сохраняются локально и синхронизируются между вкладками браузера в реальном времени.
            </div>
          </div>
        </div>
      `;
    } else {
      statusBanner.innerHTML = `
        <div class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
          <span class="text-xl leading-none">✅</span>
          <div>
            <div class="font-bold text-emerald-200">Облачный транспорт активен</div>
            <div class="text-[11px] text-emerald-300/80 mt-1 leading-relaxed">
              Подключение к JSONBin API активно. Все изменения сохраняются в облаке и на локальном диске.
            </div>
          </div>
        </div>
      `;
    }
  }

  modal.classList.remove("hidden");
}

/**
 * Закрытие модального окна настроек Cloud
 */
function closeCloudConfigModal() {
  const modal = document.getElementById("modalCloudConfig");
  if (modal) modal.classList.add("hidden");
}

/**
 * Сохранение пользовательских ключей и проверка подключения
 */
async function submitCloudConfigModal() {
  const inputBinId = document.getElementById("inputCloudBinId");
  const inputApiKey = document.getElementById("inputCloudApiKey");

  const binId = inputBinId ? inputBinId.value.trim() : "";
  const apiKey = inputApiKey ? inputApiKey.value.trim() : "";

  if (!binId || !apiKey) {
    if (typeof window.showToast === "function") {
      window.showToast("Укажите Bin ID и Master Key", "warning");
    } else {
      alert("Укажите Bin ID и Master Key");
    }
    return;
  }

  if (typeof window.setCloudCredentials === "function") {
    window.setCloudCredentials(binId, apiKey);
  }

  closeCloudConfigModal();
  if (typeof window.showToast === "function") {
    window.showToast("Ключи сохранены. Проверяем связь с JSONBin...", "info");
  }

  await fetchCloudData(true);
  if (typeof window.renderDashboard === "function") {
    await window.renderDashboard();
  }
}

/**
 * Сброс ключей к системным по умолчанию
 */
async function resetCloudConfigModal() {
  if (typeof window.resetCloudCredentials === "function") {
    window.resetCloudCredentials();
  }
  closeCloudConfigModal();
  if (typeof window.showToast === "function") {
    window.showToast("Ключи сброшены к значениям по умолчанию", "info");
  }
  await fetchCloudData(true);
}

/**
 * Принудительное включение автономного режима (LocalStorage Only)
 */
function useOfflineLocalStorageMode() {
  window.CLOUD_QUOTA_EXHAUSTED = true;
  try { localStorage.setItem("lex_cloud_quota_exhausted", "true"); } catch (_) {}
  updateJsonbinStatusBadge(false, "Автономно (Квота)");
  closeCloudConfigModal();
  if (typeof window.showToast === "function") {
    window.showToast("Включен автономный режим LocalStorage. Сетевой спам отключен.", "info");
  }
}

// Реактивная межвкладочная синхронизация (Cross-Tab Reactivity via Storage Event)
window.addEventListener("storage", (e) => {
  if (!e.key) return;

  // Реакция на изменение статуса Circuit Breaker в другой вкладке
  if (e.key === "lex_cloud_quota_exhausted") {
    window.CLOUD_QUOTA_EXHAUSTED = (e.newValue === "true");
    updateJsonbinStatusBadge(!window.CLOUD_QUOTA_EXHAUSTED);
  }

  // Мгновенное обновление дашборда при действиях игрока в другой вкладке
  if (e.key.startsWith("katya_master_") || e.key === "lex_dashboard_cloud_cache") {
    if (typeof window.renderDashboard === "function") {
      if (window._dashCrossTabSyncTimer) clearTimeout(window._dashCrossTabSyncTimer);
      window._dashCrossTabSyncTimer = setTimeout(() => {
        const fresh = buildFallbackDataFromLocalStorage();
        window.currentCloudData = fresh;
        window.renderDashboard();
      }, 250);
    }
  }
});

// Экспорт в глобальный контекст window
window.fetchCloudData = fetchCloudData;
window.saveCloud = saveCloud;
window.saveCloudData = saveCloud;
window.saveLocal = saveLocal;
window.forceManualSync = forceManualSync;
window.updateJsonbinStatusBadge = updateJsonbinStatusBadge;
window.buildFallbackDataFromLocalStorage = buildFallbackDataFromLocalStorage;
window.normalizeCloudData = normalizeCloudData;
window.openCloudConfigModal = openCloudConfigModal;
window.closeCloudConfigModal = closeCloudConfigModal;
window.submitCloudConfigModal = submitCloudConfigModal;
window.resetCloudConfigModal = resetCloudConfigModal;
window.useOfflineLocalStorageMode = useOfflineLocalStorageMode;
