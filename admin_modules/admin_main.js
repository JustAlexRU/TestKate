/**
 * @fileoverview LEX LABS ENTERPRISE: MAIN DASHBOARD CONTROLLER & SUPPORT DESK
 * @module admin_modules/admin_main
 * 
 * @description
 * Зона ответственности (Single Responsibility):
 * Авторизация оператора (PIN-код), переключение вкладок, оркестрация общего
 * состояния дашборда (KPI и данные питомца), бухгалтерский учет 1C Ledger,
 * ящик предложений (Inbox), бейджи непрочитанного, история открытий кейсов/рулетки
 * и первая линия клиентской поддержки (Support Desk Tier-1) с мастером сценариев.
 *
 * @exports
 * - window.checkAuth() — проверка авторизации оператора в sessionStorage
 * - window.switchMainTab(tabId) — переключение основных экранов админки
 * - window.switchDashboardTab(tabId) — алиас переключения вкладок
 * - window.renderDashboard() — общая синхронизация и оркестрация рендеринга всех панелей
 * - window.setAuditTimeFilter(periodKey) — фильтрация 1C Ledger по периодам
 * - window.renderAuditLedger(audit) — расчет сальдо/дебета/кредита и вывод проводок
 * - window.renderFeedbackInbox() — вывод входящих предложений и отзывов игроков
 * - window.updateUnreadBadges() — подсчет непрочитанных тикетов и ошибок на бейджах
 * - window.renderCaseDrops(drops) — таблица последних дропов из кейсов
 * - window.renderRouletteHistory(history) — история вращений рулетки удачи
 * - window.activeDeskTicketId — ID открытого обращения в Support Desk
 * - window.openSupportDeskModal() — открытие интерфейса первой линии поддержки
 * - window.closeSupportDeskModal() — закрытие интерфейса первой линии поддержки
 * - window.renderDeskChatTimeline(ticket) — лента сообщений в тикете Support Desk
 * - window.sendDeskMessage() — отправка сообщения оператора в тикет поддержки
 * - window.onDeskStatusChange(newStatus) — смену статуса обращения с авто-опросником
 * - window.crmEscalateToDev() — эскалация тикета из первой линии в Канбан разработки
 * - window.crmRunSmartAction(actionKey) — запуск авто-сценариев помощи (синхронизация и т.д.)
 * - window.renderDeskWizardNode(nodeKey) — пошаговый мастер сценариев решения проблем
 * - window.deskResetWizard() — сброс мастера сценариев к начальному экрану
 * - window.grantSupportCompensationCoins(amount, reason) — начисление компенсации с проводкой в 1С
 * - window.grantManualWishCoupon(title, category) — ручная выдача купона желания
 * - window.restorePetStatsSupport() — экспресс-восстановление показателей питомца на 100%
 * - window.insertDeskCannedResponse(key) — быстрая вставка шаблонов ответов оператора
 * - window.updateDeskCustomerCard() — обновление карточки игрока в модалке поддержки
 */

let currentMainTab = "overview";
let currentAuditFilterPeriod = "all";

// Управление вкладками
window.switchMainTab = function (tabId) {
  currentMainTab = tabId;
  document.querySelectorAll(".dashboard-pane").forEach((pane) => {
    pane.classList.add("hidden");
    pane.classList.remove("flex");
  });

  const targetPane = document.getElementById(`pane_${tabId}`);
  if (targetPane) {
    targetPane.classList.remove("hidden");
    targetPane.classList.add("flex");
  }

  // Обновляем визуальный активный стиль кнопок навигации (Sidebar & Main Nav)
  document.querySelectorAll(".main-tab-btn").forEach((btn) => {
    const isAct = btn.id === `mainTab_${tabId}`;
    if (isAct) {
      btn.classList.add("bg-white/10", "text-white", "font-bold", "border-white/15");
      btn.classList.remove("text-gray-400", "border-transparent");
    } else {
      btn.classList.remove("bg-white/10", "text-white", "font-bold", "border-white/15");
      btn.classList.add("text-gray-400", "border-transparent");
    }
  });

  // Принудительный рендеринг данных при переходе, исключающий пустые контейнеры
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};

  if (tabId === "overview") {
    if (typeof window.renderAuditLedger === "function") window.renderAuditLedger();
  } else if (tabId === "pet") {
    if (typeof window.renderCaseDrops === "function") window.renderCaseDrops(userRecord.caseHistory);
    if (typeof window.renderRouletteHistory === "function") window.renderRouletteHistory(userRecord.rouletteHistory);
    if (typeof window.renderWishesGrid === "function") window.renderWishesGrid(userRecord.wishes);
  } else if (tabId === "economy") {
    if (typeof window.renderEconomyInputs === "function") window.renderEconomyInputs();
    if (typeof window.switchEcoSubTab === "function") window.switchEcoSubTab("food");
  } else if (tabId === "odds") {
    if (typeof window.switchOddsMode === "function") window.switchOddsMode(window.currentOddsTab || "case_std");
  } else if (tabId === "advisor") {
    if (typeof window.runComprehensiveAiEconomyAudit === "function") {
      window.runComprehensiveAiEconomyAudit(userRecord.pet, userRecord.analytics, userRecord.audit);
    }
  } else if (tabId === "kanban" && typeof window.renderKanbanBoard === "function") {
    window.renderKanbanBoard();
  } else if (tabId === "inbox" && typeof window.renderFeedbackInbox === "function") {
    window.renderFeedbackInbox();
  }
};
window.switchDashboardTab = window.switchMainTab;

// Сохранение отредактированных параметров питомца
window.savePetState = async function () {
  const activeUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData) window.currentCloudData = {};
  if (!window.currentCloudData[activeUser]) window.currentCloudData[activeUser] = {};
  if (!window.currentCloudData[activeUser].pet) window.currentCloudData[activeUser].pet = {};

  const pet = window.currentCloudData[activeUser].pet;
  const nameEl = document.getElementById("editPetName");
  const coinsEl = document.getElementById("editPetCoins");
  const levelEl = document.getElementById("editPetLevel");
  const xpEl = document.getElementById("editPetXp");
  const hungerEl = document.getElementById("editPetHunger");
  const happyEl = document.getElementById("editPetHappy");
  const energyEl = document.getElementById("editPetEnergy");
  const cleanEl = document.getElementById("editPetClean");

  if (nameEl) pet.name = nameEl.value.trim() || pet.name || "Зефирка";
  if (coinsEl) pet.coins = parseInt(coinsEl.value, 10) || 0;
  if (levelEl) pet.level = parseInt(levelEl.value, 10) || 1;
  if (xpEl) pet.xp = parseInt(xpEl.value, 10) || 0;
  if (hungerEl) pet.hunger = Math.min(100, Math.max(0, parseInt(hungerEl.value, 10) || 0));
  if (happyEl) pet.happy = Math.min(100, Math.max(0, parseInt(happyEl.value, 10) || 0));
  if (energyEl) pet.energy = Math.min(100, Math.max(0, parseInt(energyEl.value, 10) || 0));
  if (cleanEl) pet.clean = Math.min(100, Math.max(0, parseInt(cleanEl.value, 10) || 0));

  if (!Array.isArray(window.currentCloudData[activeUser].audit)) window.currentCloudData[activeUser].audit = [];
  window.currentCloudData[activeUser].audit.push({
    text: `[ADMIN] Изменил параметры питомца: Баланс=${pet.coins}🪙, Ур=${pet.level}`,
    icon: "🐱",
    date: new Date().toLocaleDateString("ru-RU"),
    time: new Date().toLocaleTimeString("ru-RU"),
    timestamp: Date.now()
  });

  if (typeof window.saveCloud === "function") {
    await window.saveCloud();
  }
  alert("Параметры питомца успешно сохранены в облаке!");
  if (typeof window.renderDashboard === "function") {
    window.renderDashboard();
  }
};

// Рендер дашборда с защитой от сбоев и нормализацией данных
window.renderDashboard = async function () {
  let cloud = window.currentCloudData;
  if (typeof window.fetchCloudData === "function") {
    try {
      cloud = await window.fetchCloudData();
    } catch (e) {
      console.warn("[Dashboard] fetchCloudData error:", e);
    }
  }

  if (!cloud || typeof cloud !== "object") {
    cloud = typeof window.buildFallbackDataFromLocalStorage === "function"
      ? window.buildFallbackDataFromLocalStorage()
      : { katya: {} };
    window.currentCloudData = cloud;
  }

  // Защитная нормализация: если pet на верхнем уровне, заворачиваем в { katya: { ... } }
  if (cloud.pet && !cloud.katya) {
    cloud = { katya: Object.assign({}, cloud) };
    window.currentCloudData = cloud;
  }
  if (!cloud.katya || typeof cloud.katya !== "object") {
    cloud.katya = {};
  }

  const sel = document.getElementById("targetPlayerSelect");
  const requestedUser = sel ? (sel.value || "katya") : "katya";
  
  if (sel) {
    sel.innerHTML = "";
    const systemKeys = ["economyConfig", "customFood", "customShop", "customRewards", "customCases", "wishChances", "caseSettings", "allChances", "irlBudgetConfig"];
    
    // Всегда первым делом добавляем 'katya'
    const optKatya = document.createElement("option");
    optKatya.value = "katya";
    optKatya.innerText = "Катя (Таганрог)";
    sel.appendChild(optKatya);

    Object.keys(cloud).forEach((k) => {
      if (k !== "katya" && !systemKeys.includes(k) && typeof cloud[k] === "object" && cloud[k] !== null) {
        const opt = document.createElement("option");
        opt.value = k;
        opt.innerText = `Игрок: ${k}`;
        sel.appendChild(opt);
      }
    });
    sel.value = cloud[requestedUser] ? requestedUser : "katya";
  }

  const activeUser = sel ? (sel.value || "katya") : "katya";
  const record = cloud[activeUser] || cloud.katya || {};

  // Защищенное извлечение сущностей с каскадным fallback на LocalStorage
  const readFn = typeof window.readStorage === "function" ? window.readStorage : ((k, fb) => fb);
  const pet = (record.pet && Object.keys(record.pet).length > 0)
    ? record.pet
    : readFn(`${activeUser}_master_pet_state`, readFn("katya_master_pet_state", readFn("pet_state", {}))) || {};
  record.pet = pet;

  const analytics = (record.analytics && Object.keys(record.analytics).length > 0)
    ? record.analytics
    : readFn(`${activeUser}_master_analytics`, readFn("katya_master_analytics", readFn("game_analytics", {}))) || {};
  record.analytics = analytics;

  const wishes = (Array.isArray(record.wishes) && record.wishes.length > 0)
    ? record.wishes
    : readFn(`${activeUser}_master_wishes_vault`, readFn("katya_master_wishes_vault", readFn("katya_wishes", []))) || [];
  record.wishes = wishes;

  const caseDrops = (Array.isArray(record.caseHistory) && record.caseHistory.length > 0)
    ? record.caseHistory
    : readFn(`${activeUser}_master_case_history`, readFn("katya_master_case_history", readFn("katya_case_history", []))) || [];
  record.caseHistory = caseDrops;

  const rouletteHistory = (Array.isArray(record.rouletteHistory) && record.rouletteHistory.length > 0)
    ? record.rouletteHistory
    : readFn(`${activeUser}_master_roulette_history`, readFn("katya_master_roulette_history", readFn("roulette_history", []))) || [];
  record.rouletteHistory = rouletteHistory;

  const audit = (Array.isArray(record.audit) && record.audit.length > 0)
    ? record.audit
    : readFn(`${activeUser}_master_audit_events`, readFn("katya_master_audit_events", readFn("katya_audit", []))) || [];
  record.audit = audit;

  const feedback = (Array.isArray(record.feedback) && record.feedback.length > 0)
    ? record.feedback
    : readFn(`${activeUser}_master_feedback`, readFn("katya_master_feedback", readFn("katya_feedback", []))) || [];
  record.feedback = feedback;

  if (Array.isArray(record.feedback)) {
    try {
      localStorage.setItem(`${activeUser}_master_feedback`, JSON.stringify(record.feedback));
      localStorage.setItem("katya_master_feedback", JSON.stringify(record.feedback));
    } catch (e) {}
  }

  const lastSyncEl = document.getElementById("dashLastSyncTime");
  if (lastSyncEl) lastSyncEl.innerText = record.lastActive || new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  // KPI метрики
  try {
    const kpiTotalTime = document.getElementById("kpiTotalTime");
    if (kpiTotalTime) kpiTotalTime.innerText = `${Math.round((analytics.totalSecondsPlayed || 0) / 60)} м`;
    const kpiSessions = document.getElementById("kpiSessions");
    if (kpiSessions) kpiSessions.innerText = analytics.sessionsCount || 0;
    const kpiSpentCoins = document.getElementById("kpiSpentCoins");
    if (kpiSpentCoins) kpiSpentCoins.innerText = `${analytics.spentCoins || 0} 🪙`;
    const kpiCasesOpened = document.getElementById("kpiCasesOpened");
    if (kpiCasesOpened) kpiCasesOpened.innerText = analytics.casesOpened || 0;
  } catch (e) {
    console.error("[Dashboard] KPI render error:", e);
  }

  // Инпуты состояния питомца
  try {
    const petInputs = {
      editPetName: pet.name || "Зефирка",
      editPetCoins: pet.coins ?? 0,
      editPetLevel: pet.level ?? 1,
      editPetXp: pet.xp ?? 0,
      editPetHunger: pet.hunger ?? 0,
      editPetHappy: pet.happy ?? 0,
      editPetEnergy: pet.energy ?? 0,
      editPetClean: pet.clean ?? 0
    };
    Object.entries(petInputs).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
  } catch (e) {
    console.error("[Dashboard] Pet inputs render error:", e);
  }

  // Модульный рендеринг панелей с индивидуальными try/catch
  try { if (typeof window.renderEconomyInputs === "function") window.renderEconomyInputs(); } catch (e) { console.error("[Dashboard] renderEconomyInputs error:", e); }
  try { if (typeof window.switchOddsMode === "function") window.switchOddsMode(window.currentOddsTab || "slots"); } catch (e) { console.error("[Dashboard] switchOddsMode error:", e); }
  try { if (typeof window.renderWishesGrid === "function") window.renderWishesGrid(wishes); } catch (e) { console.error("[Dashboard] renderWishesGrid error:", e); }
  try { if (typeof window.renderCaseDrops === "function") window.renderCaseDrops(caseDrops); } catch (e) { console.error("[Dashboard] renderCaseDrops error:", e); }
  try { if (typeof window.renderRouletteHistory === "function") window.renderRouletteHistory(rouletteHistory); } catch (e) { console.error("[Dashboard] renderRouletteHistory error:", e); }
  try { if (typeof window.renderAuditLedger === "function") window.renderAuditLedger(audit); } catch (e) { console.error("[Dashboard] renderAuditLedger error:", e); }
  try { if (typeof window.runComprehensiveAiEconomyAudit === "function") window.runComprehensiveAiEconomyAudit(pet, analytics, audit); } catch (e) { console.error("[Dashboard] runComprehensiveAiEconomyAudit error:", e); }
  try { if (typeof window.updateUnreadBadges === "function") window.updateUnreadBadges(); } catch (e) { console.error("[Dashboard] updateUnreadBadges error:", e); }

  try {
    if (currentMainTab === "kanban" && typeof window.renderKanbanBoard === "function") {
      window.renderKanbanBoard();
    }
  } catch (e) { console.error("[Dashboard] renderKanbanBoard error:", e); }

  try {
    if (currentMainTab === "inbox" && typeof window.renderFeedbackInbox === "function") {
      window.renderFeedbackInbox();
    }
  } catch (e) { console.error("[Dashboard] renderFeedbackInbox error:", e); }

  try {
    if (typeof updateDeskCustomerCard === "function") updateDeskCustomerCard();
    if (!document.getElementById("modalSupportDesk")?.classList.contains("hidden")) {
      if (typeof renderDeskTopActiveChatsBar === "function") renderDeskTopActiveChatsBar();
    }
  } catch (e) {}
};
function renderDashboard() {
  return window.renderDashboard();
}

// =========================================================================
// 1. БУХГАЛТЕРСКИЙ УЧЁТ (1C LEDGER) И ПРОВОДКИ
// =========================================================================
window.setAuditTimeFilter = function (periodKey) {
  currentAuditFilterPeriod = periodKey;
  const activeUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[activeUser] || {};
  const audit = userRecord.audit || (typeof window.readStorage === "function"
    ? window.readStorage(`${activeUser}_master_audit_events`, window.readStorage("katya_master_audit_events", []))
    : []);
  window.renderAuditLedger(audit);
};

window.renderAuditLedger = function (audit) {
  const box = document.getElementById("auditLogContainer");
  if (!box) return;
  box.innerHTML = "";

  const activeUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[activeUser] || {};
  const auditData = Array.isArray(audit) ? audit : (userRecord.audit || (typeof window.readStorage === "function"
    ? window.readStorage(`${activeUser}_master_audit_events`, window.readStorage("katya_master_audit_events", []))
    : []));

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOfWeek = now.getTime() - (7 * 86400000);
  const startOfMonth = now.getTime() - (30 * 86400000);

  // Фильтрация проводок по временным границам
  const filtered = auditData.filter(entry => {
    if (!entry.timestamp && !entry.time) return true;
    const entryTime = entry.timestamp || Date.parse((entry.date || "") + " " + (entry.time || "")) || now.getTime();
    if (currentAuditFilterPeriod === "today") return entryTime >= startOfToday;
    if (currentAuditFilterPeriod === "yesterday") return entryTime >= startOfYesterday && entryTime < startOfToday;
    if (currentAuditFilterPeriod === "week") return entryTime >= startOfWeek;
    if (currentAuditFilterPeriod === "month") return entryTime >= startOfMonth;
    return true;
  });

  // Финансовый пересчёт дебета и кредита за период (1С Сверка)
  let debitCoinsTotal = 0;
  let creditCoinsTotal = 0;

  filtered.forEach(entry => {
    const raw = entry.text || "";
    const plusMatch = raw.match(/\+(\d+)\s*🪙/);
    const minusMatch = raw.match(/-(\d+)\s*🪙/);
    if (plusMatch) debitCoinsTotal += parseInt(plusMatch[1], 10);
    if (minusMatch) creditCoinsTotal += parseInt(minusMatch[1], 10);
  });

  const escapeFn = window.escapeHtml || (s => s || "");

  // Панель оборотной ведомости над логами
  const summaryHeader = `
    <div class="flex flex-wrap items-center justify-between bg-[#0e0f1a] p-3 rounded-2xl border border-[#23253e] mb-3 text-xs">
      <div class="flex items-center gap-1 font-bold">
        <span>Период:</span>
        <select onchange="window.setAuditTimeFilter(this.value)" class="bg-[#18192a] border border-white/10 rounded-lg px-2 py-0.5 text-pink-300 outline-none cursor-pointer">
          <option value="all" ${currentAuditFilterPeriod === "all" ? "selected" : ""}>За всё время</option>
          <option value="today" ${currentAuditFilterPeriod === "today" ? "selected" : ""}>Только сегодня</option>
          <option value="yesterday" ${currentAuditFilterPeriod === "yesterday" ? "selected" : ""}>Вчера</option>
          <option value="week" ${currentAuditFilterPeriod === "week" ? "selected" : ""}>За 7 дней</option>
          <option value="month" ${currentAuditFilterPeriod === "month" ? "selected" : ""}>За 30 дней</option>
        </select>
      </div>
      <div class="flex items-center gap-3 font-mono text-[11px]">
        <span class="text-emerald-400">Приход (Дебет): <b>+${debitCoinsTotal} 🪙</b></span>
        <span class="text-rose-400">Расход (Кредит): <b>-${creditCoinsTotal} 🪙</b></span>
        <span class="text-amber-300 border-l border-white/10 pl-2">Сальдо: <b>${debitCoinsTotal - creditCoinsTotal} 🪙</b></span>
      </div>
    </div>
  `;

  let rowsHtml = "";
  filtered.slice().reverse().slice(0, 150).forEach(a => {
    const isDebit = a.text?.includes("+");
    const isCredit = a.text?.includes("-");
    const amountColor = isDebit ? "text-emerald-400" : isCredit ? "text-rose-400" : "text-gray-300";

    rowsHtml += `
      <div class="bg-[#0a0b14]/80 px-3 py-2 rounded-xl border border-[#191b30] flex items-center justify-between text-xs hover:border-pink-500/30 transition">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="text-base">${escapeFn(a.icon || "📌")}</span>
          <span class="${amountColor} truncate font-medium">${escapeFn(a.text || "")}</span>
        </div>
        <div class="flex items-center gap-2 font-mono text-[10px] text-gray-500 whitespace-nowrap">
          <span>${escapeFn(a.date || "")}</span>
          <span>${escapeFn(a.time || "")}</span>
        </div>
      </div>
    `;
  });

  box.innerHTML = summaryHeader + `<div class="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1">${rowsHtml || '<div class="text-center text-gray-500 py-6 text-xs">Проводок за указанный период не обнаружено</div>'}</div>`;
};

// =========================================================================
// 2. ВХОДЯЩИЕ СООБЩЕНИЯ (INBOX) И СЧЁТЧИКИ НЕПРОЧИТАННОГО
// =========================================================================
window.renderFeedbackInbox = function () {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  let list = userRecord.feedback || (typeof window.readStorage === "function"
    ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", []))
    : []);
  const container = document.getElementById("inboxListContainer");
  if (!container) return;

  container.innerHTML = "";
  let nonBugCount = 0;
  const escapeFn = window.escapeHtml || (s => s || "");

  list.forEach((item) => {
    if (item.category?.includes("Баг")) return;
    nonBugCount++;

    const isUnread = item.isRead === false || item.isRead === undefined;
    const isLove = item.category?.includes("Любовь");

    const card = document.createElement("div");
    card.className = `bg-[#18192a] border ${isUnread ? "border-pink-500 shadow-[0_0_15px_rgba(244,114,182,0.3)]" : "border-[#2e304f]"} rounded-2xl p-3.5 flex flex-col gap-2 relative transition cursor-pointer`;

    card.onclick = () => {
      if (item.isRead !== true) {
        item.isRead = true;
        if (typeof window.saveFeedbackListToCloud === "function") {
          window.saveFeedbackListToCloud(list);
        } else {
          localStorage.setItem(`${targetUser}_master_feedback`, JSON.stringify(list));
          localStorage.setItem("katya_master_feedback", JSON.stringify(list));
          if (typeof window.saveCloud === "function") window.saveCloud();
        }
        window.renderFeedbackInbox();
      }
    };

    let imgHtml = item.image ? `<img src="${item.image}" alt="Скриншот" onclick="if (typeof window.openFullImage === 'function') window.openFullImage('${item.image}')" class="max-h-32 rounded-xl mt-1 w-auto object-contain cursor-pointer border border-white/10">` : "";

    card.innerHTML = `
      <div class="flex justify-between items-center text-[10px]">
        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded-lg ${isLove ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'} font-bold">
            ${escapeFn(item.category || "Предложение")}
          </span>
          ${isUnread ? '<span class="text-[9px] bg-pink-500 text-white font-bold px-1.5 py-0.2 rounded-full animate-pulse">NEW</span>' : ''}
        </div>
        <span class="text-gray-500 font-mono text-[9px]">${escapeFn(item.date || "")}</span>
      </div>

      <p class="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed select-text font-sans">${escapeFn(item.text || "")}</p>${imgHtml}

      <div class="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-white/5">
        <span>🐱 ${escapeFn(item.petName || "Зефирка")} (Ур. ${escapeFn(String(item.petLevel || 1))})</span>
        <span class="text-amber-400">${"★".repeat(Math.max(1, Math.min(5, Number(item.rating) || 5)))}</span>
      </div>
    `;

    container.appendChild(card);
  });

  if (nonBugCount === 0) {
    container.innerHTML = `<div class="col-span-2 text-center text-xs text-gray-500 py-12">В ящике предложений пока пусто 🐾</div>`;
  }

  window.updateUnreadBadges();
};

window.updateUnreadBadges = function () {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  const list = userRecord.feedback || (typeof window.readStorage === "function"
    ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", []))
    : []);

  let unreadBugs = 0;
  let unreadInbox = 0;
  let activeSupportCount = 0;

  list.forEach(item => {
    const isBug = item.category?.includes("Баг");
    const isUnread = item.isRead === false || item.isRead === undefined;
    if (isUnread) {
      if (isBug) unreadBugs++;
      else unreadInbox++;
    }
    const st = item.status || "sent";
    if (st !== "done" && st !== "resolved" && st !== "closed" && item.claimed !== true && !isBug) {
      activeSupportCount++;
    }
  });

  const bBug = document.getElementById("badgeUnreadBugs");
  const bInbox = document.getElementById("badgeUnreadInbox");
  const bDesk = document.getElementById("badgeSupportDeskCount");
  if (bBug) {
    bBug.innerText = unreadBugs;
    bBug.classList.toggle("hidden", unreadBugs === 0);
  }
  if (bInbox) {
    bInbox.innerText = unreadInbox;
    bInbox.classList.toggle("hidden", unreadInbox === 0);
  }
  if (bDesk) {
    bDesk.innerText = activeSupportCount;
  }
};

// =========================================================================
// 3. ИСТОРИЯ КЕЙСОВ И РУЛЕТКИ
// =========================================================================
window.renderCaseDrops = function (drops) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  const data = Array.isArray(drops) ? drops : (userRecord.caseHistory || (typeof window.readStorage === "function"
    ? window.readStorage(`${targetUser}_case_history`, window.readStorage("katya_case_history", []))
    : []));

  const box = document.getElementById("caseDropsList");
  const count = document.getElementById("badgeCaseCount");
  if (count) count.innerText = `${data.length} шт`;
  if (!box) return;

  box.innerHTML = "";
  if (data.length === 0) {
    box.innerHTML = `<div class="text-center text-xs text-gray-500 py-4">Кейсы еще не открывались</div>`;
    return;
  }
  const escapeFn = window.escapeHtml || (s => s || "");
  data.slice().reverse().forEach((d) => {
    box.innerHTML += `
      <div class="bg-[#0a0b14] border border-[#22243d] p-3 rounded-2xl flex items-center justify-between text-xs">
        <div class="flex items-center gap-2.5"><span class="text-2xl">${escapeFn(d.icon || "📦")}</span><span class="font-bold text-gray-200">${escapeFn(d.name || "")}</span></div>
        <span class="mono-font text-[10px] text-gray-500">${escapeFn(d.time || "")}</span>
      </div>
    `;
  });
};

window.renderRouletteHistory = function (history) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  const data = Array.isArray(history) ? history : (userRecord.rouletteHistory || (typeof window.readStorage === "function"
    ? window.readStorage(`${targetUser}_roulette_history`, window.readStorage("katya_roulette_history", []))
    : []));

  const box = document.getElementById("rouletteHistoryList");
  const count = document.getElementById("badgeRouletteCount");
  if (count) count.innerText = `${data.length} шт`;
  if (!box) return;

  box.innerHTML = "";
  if (data.length === 0) {
    box.innerHTML = `<div class="text-center text-xs text-gray-500 py-4">Рулетка еще не запускалась</div>`;
    return;
  }
  const escapeFn = window.escapeHtml || (s => s || "");
  data.slice().reverse().forEach((h) => {
    box.innerHTML += `
      <div class="bg-[#0a0b14] border border-[#22243d] p-2.5 rounded-xl flex items-center justify-between text-xs">
        <span class="font-bold text-gray-200">${escapeFn(h.item || "")}</span>
        <span class="mono-font text-[10px] text-gray-500">${escapeFn(h.time || "")}</span>
      </div>
    `;
  });
};

// =========================================================================
// 4. ИЗОЛИРОВАННЫЙ РЕЖИМ ПОДДЕРЖКИ (SUPPORT DESK TIER-1 CRM)
// =========================================================================
window.activeDeskTicketId = null;

/**
 * Обновление карточки клиента в модалке Support Desk
 */
function updateDeskCustomerCard() {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || window.currentCloudData?.katya || {};
  const pet = userRecord.pet || {};

  const titleEl = document.getElementById("deskCardClientTitle");
  if (titleEl) titleEl.innerText = targetUser === "katya" ? "Катя (Таганрог)" : `Игрок: ${targetUser}`;

  const coinsEl = document.getElementById("deskCardCoinsVal");
  if (coinsEl) coinsEl.innerText = `${pet.coins ?? 0} 🪙`;

  const petNameEl = document.getElementById("deskCardPetName");
  if (petNameEl) petNameEl.innerText = pet.name || "Зефирка";

  const petLevelEl = document.getElementById("deskCardPetLevel");
  if (petLevelEl) petLevelEl.innerText = String(pet.level ?? 1);
}
window.updateDeskCustomerCard = updateDeskCustomerCard;

/**
 * Вставка быстрых шаблонных ответов оператора (Canned Responses)
 */
window.insertDeskCannedResponse = function (key) {
  const input = document.getElementById("deskChatInput");
  if (!input) return;

  const cannedMap = {
    check_ok: "Привет! Проверил по базе данных — всё сработало корректно, никаких технических ошибок не зафиксировано ✨",
    comp_given: "Привет! Проверил ситуацию и начислил на твой баланс монеты компенсации 🪙 Приятной игры!",
    hotfix_deployed: "Привет! Хотфикс уже выкачен на прод 🚀 Пожалуйста, обнови страничку и проверь!",
    pet_care: "Привет! Позаботился о Зефирке, накормил и приласкал 🐾 Все показатели на максимуме!",
    wish_accepted: "Привет! Твой секретный купон желания принят к исполнению ❤️ Я уже готовлю для тебя сюрприз!",
    pet_woken: "Привет! Разбудил Зефирку, энергия на максимуме ☀️ Можно снова играть и гладить котика!",
    drop_refunded: "Привет! Проверил открытый кейс — компенсировал монеты на твой баланс 📦 Удачных дропов!",
    ledger_clean: "Привет! Сверил проводки в 1C Ledger — все списания легитимны и баланс сходится до копеечки 📑",
    sync_fixed: "Привет! Принудительно синхронизировал стейт с облаком 🌐 Обнови страницу через Ctrl+F5!"
  };

  const text = cannedMap[key] || "Привет! Чем могу помочь? ✨";
  input.value = text;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
};

/**
 * Начисление компенсационных монет с проводкой в 1C Ledger и уведомлением в тикете
 */
window.grantSupportCompensationCoins = async function (amount, reason) {
  const num = Number(amount) || 0;
  if (num <= 0) return;

  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData) window.currentCloudData = {};
  if (!window.currentCloudData[targetUser]) window.currentCloudData[targetUser] = {};
  const userRecord = window.currentCloudData[targetUser];
  if (!userRecord.pet) userRecord.pet = {};

  userRecord.pet.coins = (Number(userRecord.pet.coins) || 0) + num;

  const auditReason = reason || "Компенсация поддержки";
  if (!Array.isArray(userRecord.audit)) userRecord.audit = [];
  userRecord.audit.unshift({
    text: `[SUPPORT COMP] Компенсация оператора: +${num}🪙 (${auditReason})`,
    icon: "🪙",
    coinsChange: num,
    date: new Date().toLocaleDateString("ru-RU"),
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now()
  });

  if (typeof window.saveCloud === "function") {
    await window.saveCloud();
  }

  // Уведомление в открытом тикете
  if (window.activeDeskTicketId) {
    let list = userRecord.feedback || (typeof window.readStorage === "function" ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", [])) : []);
    const ticket = list.find(t => t.id === window.activeDeskTicketId);
    if (ticket) {
      if (!Array.isArray(ticket.messages)) ticket.messages = [];
      ticket.messages.push({
        id: "sys_comp_" + Date.now(),
        author: "system",
        text: `🎁 Начислена компенсация: +${num} 🪙 (${auditReason})`,
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now()
      });
      ticket.messages.push({
        id: "msg_comp_" + Date.now(),
        author: "alex",
        text: `Я всё проверил и начислил на твой баланс компенсацию ${num} 🪙! Приятной игры ✨`,
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now() + 1
      });
      if (typeof window.saveFeedbackListToCloud === "function") {
        await window.saveFeedbackListToCloud(list);
      }
      if (typeof window.renderDeskChatTimeline === "function") {
        window.renderDeskChatTimeline(ticket);
      }
    }
  }

  updateDeskCustomerCard();
  const editPetCoins = document.getElementById("editPetCoins");
  if (editPetCoins) editPetCoins.value = userRecord.pet.coins;
  if (typeof window.renderAuditLedger === "function") {
    window.renderAuditLedger(userRecord.audit);
  }

  alert(`✅ Успешно начислена компенсация: +${num} 🪙 (${auditReason})`);
};

/**
 * Ручная выдача купона желания игроку из Support Desk
 */
window.grantManualWishCoupon = async function (title, category) {
  const wishTitle = (title || "").trim() || "Специальное желание от поддержки";
  const wishCat = category || "medium";
  const couponCode = "#WISH-MANUAL-" + Math.floor(1000 + Math.random() * 9000);

  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData) window.currentCloudData = {};
  if (!window.currentCloudData[targetUser]) window.currentCloudData[targetUser] = {};
  const userRecord = window.currentCloudData[targetUser];

  if (!Array.isArray(userRecord.wishes)) userRecord.wishes = [];
  userRecord.wishes.unshift({
    id: "wish_desk_" + Date.now(),
    title: wishTitle,
    category: wishCat,
    code: couponCode,
    status: "active",
    claimed: false,
    source: "Support Desk (Ручная выдача)",
    date: new Date().toLocaleDateString("ru-RU"),
    timestamp: Date.now()
  });

  if (!Array.isArray(userRecord.audit)) userRecord.audit = [];
  userRecord.audit.unshift({
    text: `[SUPPORT WISH] Выдан ручной купон желания: «${wishTitle}» (${couponCode})`,
    icon: "🎁",
    date: new Date().toLocaleDateString("ru-RU"),
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now()
  });

  if (typeof window.saveCloud === "function") {
    await window.saveCloud();
  }

  if (window.activeDeskTicketId) {
    let list = userRecord.feedback || (typeof window.readStorage === "function" ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", [])) : []);
    const ticket = list.find(t => t.id === window.activeDeskTicketId);
    if (ticket) {
      if (!Array.isArray(ticket.messages)) ticket.messages = [];
      ticket.messages.push({
        id: "sys_wish_" + Date.now(),
        author: "system",
        text: `🎁 Выдан купон желания: «${wishTitle}» (${couponCode})`,
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now()
      });
      ticket.messages.push({
        id: "msg_wish_" + Date.now(),
        author: "alex",
        text: `Подарил тебе купон желания: «${wishTitle}» (${couponCode})! Ты можешь активировать его в игре в любое удобное время 🎁✨`,
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now() + 1
      });
      if (typeof window.saveFeedbackListToCloud === "function") {
        await window.saveFeedbackListToCloud(list);
      }
      if (typeof window.renderDeskChatTimeline === "function") {
        window.renderDeskChatTimeline(ticket);
      }
    }
  }

  if (typeof window.renderWishesGrid === "function") {
    window.renderWishesGrid(userRecord.wishes);
  }
  alert(`🎁 Купон «${wishTitle}» (${couponCode}) успешно отправлен игроку!`);
};

/**
 * Экспресс-восстановление всех показателей питомца на 100%
 */
window.restorePetStatsSupport = async function () {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData) window.currentCloudData = {};
  if (!window.currentCloudData[targetUser]) window.currentCloudData[targetUser] = {};
  const userRecord = window.currentCloudData[targetUser];
  if (!userRecord.pet) userRecord.pet = {};

  userRecord.pet.hunger = 100;
  userRecord.pet.energy = 100;
  userRecord.pet.happy = 100;
  userRecord.pet.clean = 100;

  if (!Array.isArray(userRecord.audit)) userRecord.audit = [];
  userRecord.audit.unshift({
    text: `[SUPPORT PET] Восстановление показателей питомца на 100% (Забота поддержки)`,
    icon: "🐾",
    date: new Date().toLocaleDateString("ru-RU"),
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now()
  });

  if (typeof window.saveCloud === "function") {
    await window.saveCloud();
  }

  if (window.activeDeskTicketId) {
    let list = userRecord.feedback || (typeof window.readStorage === "function" ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", [])) : []);
    const ticket = list.find(t => t.id === window.activeDeskTicketId);
    if (ticket) {
      if (!Array.isArray(ticket.messages)) ticket.messages = [];
      ticket.messages.push({
        id: "sys_pet_" + Date.now(),
        author: "system",
        text: `🐾 Забота поддержки: показатели Зефирки восстановлены на 100%`,
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now()
      });
      ticket.messages.push({
        id: "msg_care_" + Date.now(),
        author: "alex",
        text: "Позаботился о Зефирке, все показатели восстановлены на 100% 🐾 Накормил, искупал и приласкал!",
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now() + 1
      });
      if (typeof window.saveFeedbackListToCloud === "function") {
        await window.saveFeedbackListToCloud(list);
      }
      if (typeof window.renderDeskChatTimeline === "function") {
        window.renderDeskChatTimeline(ticket);
      }
    }
  }

  updateDeskCustomerCard();
  if (typeof window.renderDashboard === "function") {
    window.renderDashboard();
  }
  alert("🐾 Показатели Зефирки успешно восстановлены на 100%!");
};

/**
 * Экстренное пробуждение питомца (сброс сна и восстановление энергии)
 */
window.wakeUpPetSupport = async function () {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData) window.currentCloudData = {};
  if (!window.currentCloudData[targetUser]) window.currentCloudData[targetUser] = {};
  const userRecord = window.currentCloudData[targetUser];
  if (!userRecord.pet) userRecord.pet = {};

  userRecord.pet.isSleeping = false;
  userRecord.pet.energy = 100;
  userRecord.pet.lastWokeUpAt = Date.now();
  userRecord.pet.xp = (userRecord.pet.xp || 0) + 6;

  if (!Array.isArray(userRecord.audit)) userRecord.audit = [];
  userRecord.audit.unshift({
    text: `[SUPPORT PET] Зефирка проснулась и полна энергии! (+6 XP)`,
    icon: "☀️",
    date: new Date().toLocaleDateString("ru-RU"),
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now()
  });

  if (typeof window.saveCloud === "function") await window.saveCloud();

  if (window.activeDeskTicketId) {
    let list = userRecord.feedback || (typeof window.readStorage === "function" ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", [])) : []);
    const ticket = list.find(t => t.id === window.activeDeskTicketId);
    if (ticket) {
      if (!Array.isArray(ticket.messages)) ticket.messages = [];
      ticket.messages.push({
        id: "sys_wake_" + Date.now(),
        author: "system",
        text: "☀️ Зефирка сладко потянулась, выспалась и проснулась!",
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now()
      });
      ticket.messages.push({
        id: "msg_wake_" + Date.now(),
        author: "alex",
        text: "Разбудил Зефирку, энергия восстановлена на 100%! Можно снова играть и гладить котика ☀️",
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now() + 1
      });
      if (typeof window.saveFeedbackListToCloud === "function") await window.saveFeedbackListToCloud(list);
      if (typeof window.renderDeskChatTimeline === "function") window.renderDeskChatTimeline(ticket);
    }
  }

  updateDeskCustomerCard();
  if (typeof window.renderDashboard === "function") window.renderDashboard();
  alert("☀️ Зефирка успешно проснулась, энергия восстановлена на 100%!");
};

/**
 * Генеральная уборка комнаты службы заботы
 */
window.cleanPoopSupport = async function () {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData) window.currentCloudData = {};
  if (!window.currentCloudData[targetUser]) window.currentCloudData[targetUser] = {};
  const userRecord = window.currentCloudData[targetUser];
  if (!userRecord.pet) userRecord.pet = {};

  userRecord.pet.clean = 100;
  userRecord.pet.poops = 0;
  userRecord.pet.coins = (Number(userRecord.pet.coins) || 0) + 15;

  if (!Array.isArray(userRecord.audit)) userRecord.audit = [];
  userRecord.audit.unshift({
    text: `[SUPPORT PET] Генеральная уборка комнаты службы заботы (+15 🪙)`,
    icon: "🧼",
    coinsChange: 15,
    date: new Date().toLocaleDateString("ru-RU"),
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now()
  });

  if (typeof window.saveCloud === "function") await window.saveCloud();

  if (window.activeDeskTicketId) {
    let list = userRecord.feedback || (typeof window.readStorage === "function" ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", [])) : []);
    const ticket = list.find(t => t.id === window.activeDeskTicketId);
    if (ticket) {
      if (!Array.isArray(ticket.messages)) ticket.messages = [];
      ticket.messages.push({
        id: "sys_clean_" + Date.now(),
        author: "system",
        text: "🧼 Комната Зефирки вымыта до блеска, чистота 100%! (+15 🪙)",
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now()
      });
      ticket.messages.push({
        id: "msg_clean_" + Date.now(),
        author: "alex",
        text: "Навел идеальный порядок в комнате Зефирки, искупал котика и добавил 15 🪙 за чистоту! ✨",
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now() + 1
      });
      if (typeof window.saveFeedbackListToCloud === "function") await window.saveFeedbackListToCloud(list);
      if (typeof window.renderDeskChatTimeline === "function") window.renderDeskChatTimeline(ticket);
    }
  }

  updateDeskCustomerCard();
  if (typeof window.renderDashboard === "function") window.renderDashboard();
  alert("🧼 В комнате чистота 100%, начислено +15 🪙!");
};

/**
 * Исполнение купона желания в реальной жизни (IRL Redemption)
 */
window.redeemWishCouponSupport = async function (couponCode) {
  if (!couponCode) return;
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData) window.currentCloudData = {};
  if (!window.currentCloudData[targetUser]) window.currentCloudData[targetUser] = {};
  const userRecord = window.currentCloudData[targetUser];

  if (!Array.isArray(userRecord.wishes)) userRecord.wishes = [];
  const coupon = userRecord.wishes.find(w => w.code === couponCode || w.id === couponCode);
  if (!coupon) {
    alert("Купон не найден в базе данных!");
    return;
  }
  if (coupon.status === "used") {
    alert("Этот купон уже был активирован ранее!");
    return;
  }

  coupon.status = "used";
  coupon.claimed = true;
  coupon.usedAt = new Date().toLocaleString("ru-RU");

  if (!Array.isArray(userRecord.audit)) userRecord.audit = [];
  userRecord.audit.unshift({
    text: `[SUPPORT WISH] Активация купона желания: «${coupon.title}» (${coupon.code})`,
    icon: "❤️",
    date: new Date().toLocaleDateString("ru-RU"),
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now()
  });

  if (typeof window.saveCloud === "function") await window.saveCloud();

  if (window.activeDeskTicketId) {
    let list = userRecord.feedback || (typeof window.readStorage === "function" ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", [])) : []);
    const ticket = list.find(t => t.id === window.activeDeskTicketId);
    if (ticket) {
      if (!Array.isArray(ticket.messages)) ticket.messages = [];
      ticket.messages.push({
        id: "sys_wish_redeem_" + Date.now(),
        author: "system",
        text: `🎁 Купон желания «${coupon.title}» (${coupon.code}) принят к исполнению в жизни!`,
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now()
      });
      ticket.messages.push({
        id: "msg_redeem_" + Date.now(),
        author: "alex",
        text: `Твой купон «${coupon.title}» принят! Я уже готовлю сюрприз для тебя ❤️`,
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now() + 1
      });
      if (typeof window.saveFeedbackListToCloud === "function") await window.saveFeedbackListToCloud(list);
      if (typeof window.renderDeskChatTimeline === "function") window.renderDeskChatTimeline(ticket);
    }
  }

  if (typeof window.renderWishesGrid === "function") window.renderWishesGrid(userRecord.wishes);
  alert(`❤️ Купон «${coupon.title}» успешно активирован и принят к исполнению!`);
};

window.deskViewMode = "active"; // "active" | "history"

function isTicketActive(t) {
  if (!t) return false;
  if (t.category?.includes("Баг (Требует разработки)") && (t.status === "inbox" || t.status === "todo" || t.status === "done")) return false;
  const st = t.status || "sent";
  if (st === "done" || st === "resolved" || st === "closed" || t.claimed === true) return false;
  return ["sent", "in_progress", "testing"].includes(st);
}

function isTicketCompleted(t) {
  if (!t) return false;
  if (t.category?.includes("Баг (Требует разработки)") && (t.status === "inbox" || t.status === "todo")) return false;
  const st = t.status || "sent";
  return st === "done" || st === "resolved" || st === "closed" || t.claimed === true;
}

function getDeskTicketCollections() {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || window.currentCloudData?.katya || {};
  const list = userRecord.feedback || (typeof window.readStorage === "function"
    ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", []))
    : []);

  const activeTickets = list.filter(isTicketActive);
  const historyTickets = list.filter(isTicketCompleted);

  return { list, activeTickets, historyTickets, targetUser, userRecord };
}

function updateDeskTabStyles() {
  const tabActive = document.getElementById("deskTabActive");
  const tabHistory = document.getElementById("deskTabHistory");
  if (!tabActive || !tabHistory) return;

  if (window.deskViewMode === "active") {
    tabActive.className = "px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-amber-400 text-black shadow-sm";
    tabHistory.className = "px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer";
  } else {
    tabActive.className = "px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer";
    tabHistory.className = "px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-indigo-600 text-white shadow-sm";
  }
}

window.setDeskViewMode = function (mode) {
  window.deskViewMode = mode === "history" ? "history" : "active";
  updateDeskTabStyles();

  const { activeTickets, historyTickets } = getDeskTicketCollections();
  const currentList = window.deskViewMode === "history" ? historyTickets : activeTickets;

  if (currentList.length > 0) {
    if (!currentList.some(t => t.id === window.activeDeskTicketId)) {
      window.activeDeskTicketId = currentList[0].id;
    }
  } else {
    window.activeDeskTicketId = null;
  }

  renderDeskTopActiveChatsBar();

  if (window.activeDeskTicketId) {
    selectDeskTicket(window.activeDeskTicketId);
  } else {
    renderDeskEmptyState();
  }
};

window.openSupportDeskModal = function () {
  document.getElementById("modalSupportDesk")?.classList.remove("hidden");

  window.deskViewMode = "active";
  updateDeskTabStyles();

  const { activeTickets } = getDeskTicketCollections();

  if (activeTickets.length > 0 && (!window.activeDeskTicketId || !activeTickets.some(t => t.id === window.activeDeskTicketId))) {
    window.activeDeskTicketId = activeTickets[0].id;
  } else if (activeTickets.length === 0) {
    window.activeDeskTicketId = null;
  }

  renderDeskTopActiveChatsBar();

  if (window.activeDeskTicketId) {
    selectDeskTicket(window.activeDeskTicketId);
  } else {
    renderDeskEmptyState();
  }

  updateDeskCustomerCard();
  window.renderDeskWizardNode("root");
};

window.closeSupportDeskModal = function () {
  document.getElementById("modalSupportDesk")?.classList.add("hidden");
};

function renderDeskTopActiveChatsBar() {
  const bar = document.getElementById("deskTopActiveChatsBar");
  if (!bar) return;

  const { activeTickets, historyTickets } = getDeskTicketCollections();

  const badgeActive = document.getElementById("deskActiveCountBadge");
  const badgeHistory = document.getElementById("deskHistoryCountBadge");
  const bDesk = document.getElementById("badgeSupportDeskCount");
  if (badgeActive) badgeActive.innerText = activeTickets.length;
  if (badgeHistory) badgeHistory.innerText = historyTickets.length;
  if (bDesk) bDesk.innerText = activeTickets.length;

  bar.innerHTML = "";
  const escapeFn = window.escapeHtml || (s => s || "");
  const currentTickets = window.deskViewMode === "history" ? historyTickets : activeTickets;

  if (currentTickets.length === 0) {
    if (window.deskViewMode === "history") {
      bar.innerHTML = `<span class="text-xs text-slate-500 font-mono py-1">История выполненных тикетов пуста ✨</span>`;
    } else {
      bar.innerHTML = `<span class="text-xs text-emerald-400 font-mono py-1 font-medium">🎉 Нет активных тикетов — все вопросы решены!</span>`;
    }
    return;
  }

  currentTickets.forEach(ticket => {
    const isSelected = ticket.id === window.activeDeskTicketId;
    const msgs = Array.isArray(ticket.messages) ? ticket.messages : [];
    const preview = msgs.length > 0 ? msgs[msgs.length - 1].text : (ticket.text || "");

    const pill = document.createElement("button");
    pill.type = "button";

    let borderClass = "border-white/5";
    let bgClass = "bg-[#181a29] text-gray-300 hover:text-white";
    if (isSelected) {
      if (window.deskViewMode === "history") {
        bgClass = "bg-indigo-600 text-white font-bold shadow-md";
        borderClass = "border-indigo-400";
      } else {
        bgClass = "bg-amber-400 text-black font-black shadow-md";
        borderClass = "border-amber-300";
      }
    }

    pill.className = `flex items-center gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap text-xs transition cursor-pointer border ${bgClass} ${borderClass}`;
    pill.onclick = () => selectDeskTicket(ticket.id);

    let stBadge = "📥";
    if (ticket.status === "in_progress") stBadge = "⚙️";
    else if (ticket.status === "testing") stBadge = "🧪";
    else if (ticket.status === "done" || ticket.claimed === true) stBadge = "✅";

    const safePreview = escapeFn(preview);

    pill.innerHTML = `
      <span>${stBadge}</span>
      <span class="font-bold">#${ticket.id ? String(ticket.id).slice(-4) : "????"}</span>
      <span class="opacity-75 truncate max-w-[120px]">${safePreview}</span>
    `;
    bar.appendChild(pill);
  });
}

function renderDeskEmptyState() {
  const area = document.getElementById("deskChatTimeline") || document.getElementById("deskChatMessagesArea");
  const topicEl = document.getElementById("deskChatTopic");
  const { historyTickets } = getDeskTicketCollections();

  if (topicEl) {
    topicEl.innerText = window.deskViewMode === "history" 
      ? "Архив выполненных обращений пуст"
      : "Все активные обращения закрыты (Zero Inbox) ✨";
  }

  const statusSel = document.getElementById("deskStatusSelect");
  const reopenBtn = document.getElementById("btnDeskReopenTicket");
  if (statusSel) statusSel.classList.add("hidden");
  if (reopenBtn) reopenBtn.classList.add("hidden");

  if (area) {
    if (window.deskViewMode === "history") {
      area.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 gap-3 my-auto">
          <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-3xl flex items-center justify-center text-slate-300 shadow-inner">
            📜
          </div>
          <h3 class="font-bold text-white text-base">История пуста</h3>
          <p class="text-xs text-slate-400 max-w-sm">Здесь будут храниться завершенные диалоги поддержки с оценками игроков.</p>
          <button type="button" onclick="window.setDeskViewMode('active')" class="mt-2 px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold transition cursor-pointer active:scale-95 shadow">
            ⚡ Вернуться к действующим
          </button>
        </div>
      `;
    } else {
      area.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 gap-3 my-auto">
          <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-3xl flex items-center justify-center text-emerald-400 shadow-inner">
            🎉
          </div>
          <h3 class="font-bold text-white text-base">Все активные обращения закрыты!</h3>
          <p class="text-xs text-slate-400 max-w-sm">На первой линии поддержки нет открытых вопросов. Все выполненные тикеты автоматически перемещены в архив истории.</p>
          ${historyTickets.length > 0 ? `
            <button type="button" onclick="window.setDeskViewMode('history')" class="mt-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold flex items-center gap-2 border border-indigo-500/30 transition cursor-pointer active:scale-95">
              <span>📜 Открыть историю выполненных (${historyTickets.length})</span>
            </button>
          ` : ''}
        </div>
      `;
    }
  }
}

function selectDeskTicket(ticketId) {
  window.activeDeskTicketId = ticketId;
  const { list, targetUser, userRecord } = getDeskTicketCollections();
  const ticket = list.find(t => t.id === ticketId);
  if (!ticket) return;

  const isCompleted = isTicketCompleted(ticket);

  if (!isCompleted && (!ticket.status || ticket.status === "sent")) {
    ticket.status = "in_progress";
    userRecord.feedback = list;
    if (typeof window.saveFeedbackListToCloud === "function") {
      window.saveFeedbackListToCloud(list);
    }
  }

  const topicEl = document.getElementById("deskChatTopic");
  if (topicEl) {
    const escapeFn = window.escapeHtml || (s => s || "");
    const statusPrefix = isCompleted ? "[Выполнено / Архив] " : "";
    topicEl.innerText = `${statusPrefix}#${String(ticket.id).slice(-4)}: ${ticket.category || "Обращение"} — ${ticket.text ? ticket.text.slice(0, 35) + "..." : "Диалог"}`;
  }

  const statusSel = document.getElementById("deskStatusSelect");
  const reopenBtn = document.getElementById("btnDeskReopenTicket");
  if (statusSel) {
    statusSel.value = ticket.status || (isCompleted ? "done" : "in_progress");
    if (isCompleted) {
      statusSel.classList.add("hidden");
    } else {
      statusSel.classList.remove("hidden");
    }
  }
  if (reopenBtn) {
    if (isCompleted) {
      reopenBtn.classList.remove("hidden");
    } else {
      reopenBtn.classList.add("hidden");
    }
  }

  renderDeskTopActiveChatsBar();
  if (typeof window.renderDeskChatTimeline === "function") {
    window.renderDeskChatTimeline(ticket);
  }
  updateDeskCustomerCard();
}

window.reopenDeskTicket = async function (ticketId) {
  const idToReopen = ticketId || window.activeDeskTicketId;
  if (!idToReopen) return;
  const { list, targetUser, userRecord } = getDeskTicketCollections();
  const ticket = list.find(t => t.id === idToReopen);
  if (!ticket) return;

  ticket.status = "in_progress";
  ticket.claimed = false;
  if (!Array.isArray(ticket.messages)) ticket.messages = [];
  ticket.messages.push({
    id: "sys_reopen_" + Date.now(),
    author: "system",
    text: "⚡ Обращение возобновлено оператором и возвращено в работу первой линии поддержки",
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now()
  });

  userRecord.feedback = list;
  if (typeof window.saveFeedbackListToCloud === "function") {
    await window.saveFeedbackListToCloud(list);
  } else {
    localStorage.setItem(`${targetUser}_master_feedback`, JSON.stringify(list));
    localStorage.setItem("katya_master_feedback", JSON.stringify(list));
    if (typeof window.saveCloud === "function") await window.saveCloud();
  }

  window.deskViewMode = "active";
  window.activeDeskTicketId = ticket.id;
  updateDeskTabStyles();
  renderDeskTopActiveChatsBar();
  selectDeskTicket(ticket.id);
  window.updateUnreadBadges();
};

window.renderDeskChatTimeline = function (ticket) {
  const area = document.getElementById("deskChatTimeline") || document.getElementById("deskChatMessagesArea");
  if (!area || !ticket) return;
  area.innerHTML = "";

  const escapeFn = window.escapeHtml || (s => s || "");
  const sortFn = typeof window.normalizeAndSortMessages === "function" 
    ? window.normalizeAndSortMessages 
    : ((raw, txt, dt) => (Array.isArray(raw) ? raw : []));
  const msgs = sortFn(ticket.messages, ticket.text, ticket.date);

  msgs.forEach(msg => {
    // 1. Системные события
    if (msg.system) {
      const sysBubble = document.createElement("div");
      sysBubble.className = "w-full flex justify-center my-1 select-text";
      sysBubble.innerHTML = `
        <div class="px-3 py-1 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-slate-400 flex items-center gap-1.5 shadow-sm max-w-[85%] text-center leading-normal">
          <span>${escapeFn(msg.text)}</span>
          ${msg.time ? `<span class="opacity-50 text-[9px]">• ${escapeFn(msg.time)}</span>` : ""}
        </div>
      `;
      area.appendChild(sysBubble);
      return;
    }

    // 2. Пользовательские сообщения
    const isAlex = msg.author === "alex";
    const bubble = document.createElement("div");
    bubble.className = `flex flex-col ${isAlex ? "items-end" : "items-start"} gap-1 w-full`;

    const card = document.createElement("div");
    card.className = `max-w-[80%] rounded-2xl ${isAlex ? 'bg-amber-400 text-black font-medium rounded-tr-sm shadow-md' : 'bg-[#1b1d30] border border-white/10 text-gray-100 rounded-tl-sm shadow'} p-3 text-xs flex flex-col gap-1`;

    const safeText = escapeFn(msg.text);
    const safeTime = msg.time ? escapeFn(msg.time) : "";
    const authorLabel = isAlex ? "Алексей (Вы)" : "Катя";
    const tickStatus = msg.sending ? "⏳" : "✓✓";

    card.innerHTML = `
      <div class="text-[9px] font-mono opacity-60 mb-0.5">${authorLabel}</div>
      ${safeText ? `<div class="whitespace-pre-wrap leading-relaxed select-text">${safeText}</div>` : ""}
    `;

    if (msg.image) {
      const imgWrap = document.createElement("div");
      imgWrap.className = "mt-1 rounded-xl overflow-hidden border border-black/10 max-h-48 cursor-pointer relative group";
      imgWrap.innerHTML = `
        <img src="${msg.image}" alt="Вложение" class="w-full h-full max-h-48 object-cover rounded-xl transition hover:opacity-95 active:scale-[0.99]" />
        <span class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">🔍 Увеличить</span>
      `;
      imgWrap.onclick = () => {
        if (typeof window.openFullImage === "function") window.openFullImage(msg.image);
      };
      card.appendChild(imgWrap);
    }

    const footer = document.createElement("div");
    footer.className = "text-[9px] font-mono opacity-60 self-end mt-0.5 flex items-center gap-1 justify-end";
    footer.innerHTML = `<span>${safeTime}</span><span>${tickStatus}</span>`;
    card.appendChild(footer);

    bubble.appendChild(card);
    area.appendChild(bubble);
  });

  if (typeof window.scrollChatToBottom === "function") {
    window.scrollChatToBottom(area, true);
  } else {
    setTimeout(() => { area.scrollTop = area.scrollHeight; }, 30);
  }
};

window.sendDeskMessage = async function () {
  const input = document.getElementById("deskChatInput");
  const sendBtn = document.getElementById("btnSendDeskMessage");
  const text = input ? input.value.trim() : "";
  if (!text || !window.activeDeskTicketId) return;

  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || window.currentCloudData?.katya || {};
  let list = userRecord.feedback || (typeof window.readStorage === "function"
    ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", []))
    : []);
  const ticket = list.find(t => t.id === window.activeDeskTicketId);
  if (!ticket) return;

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.classList.add("opacity-50", "pointer-events-none");
  }
  window.isChatSendingMessage = true;

  const now = Date.now();
  const optimisticMsg = {
    id: "msg_desk_" + now,
    author: "alex",
    text: text,
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    timestamp: now,
    sending: true
  };

  if (!Array.isArray(ticket.messages)) ticket.messages = [];
  ticket.messages.push(optimisticMsg);

  input.value = "";
  window.renderDeskChatTimeline(ticket);

  userRecord.feedback = list;
  try {
    if (typeof window.saveFeedbackListToCloud === "function") {
      await window.saveFeedbackListToCloud(list);
    } else {
      localStorage.setItem(`${targetUser}_master_feedback`, JSON.stringify(list));
      localStorage.setItem("katya_master_feedback", JSON.stringify(list));
      if (typeof window.saveCloud === "function") await window.saveCloud();
    }
    optimisticMsg.sending = false;
    window.renderDeskChatTimeline(ticket);
  } catch (e) {
    console.error("[SupportDesk] Send error:", e);
    optimisticMsg.sending = false;
    window.renderDeskChatTimeline(ticket);
  } finally {
    window.isChatSendingMessage = false;
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.classList.remove("opacity-50", "pointer-events-none");
    }
    input?.focus();
  }
};

window.onDeskStatusChange = async function (newStatus) {
  if (!window.activeDeskTicketId) return;
  const { list, targetUser, userRecord } = getDeskTicketCollections();
  const ticket = list.find(t => t.id === window.activeDeskTicketId);
  if (!ticket) return;

  ticket.status = newStatus;

  const statusTitles = {
    sent: "Новое 📥",
    in_progress: "В работе ⚙️",
    testing: "Тестирование 🧪",
    done: "Выполнено ✅"
  };

  if (!Array.isArray(ticket.messages)) ticket.messages = [];
  ticket.messages.push({
    id: "sys_st_" + Date.now(),
    author: "system",
    text: `⚡ Статус обращения изменен на: «${statusTitles[newStatus] || newStatus}»`,
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now()
  });

  if (newStatus === "done") {
    ticket.rewardGranted = true;
    ticket.rewardAmount = 35;
    ticket.messages.push({
      id: "survey_" + Date.now(),
      author: "system",
      text: "📋 [Системный опросник обслуживания]: Пожалуйста, оцени решение от 1 до 5 звёзд! После оценки на твой счёт поступит награда 🪙",
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now() + 1
    });
  }

  userRecord.feedback = list;
  if (typeof window.saveFeedbackListToCloud === "function") {
    await window.saveFeedbackListToCloud(list);
  } else {
    localStorage.setItem(`${targetUser}_master_feedback`, JSON.stringify(list));
    localStorage.setItem("katya_master_feedback", JSON.stringify(list));
    if (typeof window.saveCloud === "function") await window.saveCloud();
  }

  // АВТОМАТИЧЕСКИЙ УЛЕТ В ИСТОРИЮ ПРИ newStatus === "done":
  if (newStatus === "done") {
    const remainingActive = list.filter(isTicketActive);
    if (window.deskViewMode === "active") {
      if (remainingActive.length > 0) {
        window.activeDeskTicketId = remainingActive[0].id;
        selectDeskTicket(window.activeDeskTicketId);
      } else {
        window.activeDeskTicketId = null;
        renderDeskEmptyState();
      }
    } else {
      selectDeskTicket(ticket.id);
    }
  } else {
    window.renderDeskChatTimeline(ticket);
  }

  renderDeskTopActiveChatsBar();
  window.updateUnreadBadges();
};

window.crmEscalateToDev = async function () {
  if (!window.activeDeskTicketId) return;
  const { list, targetUser, userRecord } = getDeskTicketCollections();
  const ticket = list.find(t => t.id === window.activeDeskTicketId);
  if (!ticket) return;

  ticket.category = "🪲 Баг (Требует разработки)";
  ticket.status = "inbox";

  userRecord.feedback = list;
  if (typeof window.saveFeedbackListToCloud === "function") {
    await window.saveFeedbackListToCloud(list);
  } else {
    localStorage.setItem(`${targetUser}_master_feedback`, JSON.stringify(list));
    localStorage.setItem("katya_master_feedback", JSON.stringify(list));
    if (typeof window.saveCloud === "function") await window.saveCloud();
  }
  if (typeof window.renderKanbanBoard === "function") window.renderKanbanBoard();
  
  // После эскалации в канбан убираем из активных тикетов первой линии
  const remainingActive = list.filter(isTicketActive);
  if (remainingActive.length > 0) {
    window.activeDeskTicketId = remainingActive[0].id;
    selectDeskTicket(window.activeDeskTicketId);
  } else {
    window.activeDeskTicketId = null;
    renderDeskEmptyState();
  }
  renderDeskTopActiveChatsBar();
  window.updateUnreadBadges();
  alert("🚀 Задача успешно эскалирована во вторую линию разработки (Канбан)!");
};

window.crmRunSmartAction = async function (actionKey) {
  const deskInput = document.getElementById("deskChatInput");
  const crmInput = document.getElementById("crmChatTextInput");
  const input = deskInput || crmInput;

  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || window.currentCloudData?.katya || {};
  let list = userRecord.feedback || (typeof window.readStorage === "function"
    ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", []))
    : []);
  const bug = list.find(b => b.id === window.currentOpenBugId);

  if (actionKey === "smart_force_sync") {
    if (typeof window.saveCloud === "function") await window.saveCloud();
    if (input) {
      input.value = "Привет! Принудительно синхронизировал стейт с облачным сервером. Попробуй перезагрузить страницу 🌐";
      input.focus();
    }
  } else if (actionKey === "escalate_to_dev") {
    if (typeof window.crmEscalateToDev === "function") {
      await window.crmEscalateToDev();
    } else if (bug) {
      bug.status = "in_progress";
      const sel = document.getElementById("detailStatusSelect");
      if (sel) sel.value = "in_progress";
      if (typeof window.saveFeedbackListToCloud === "function") {
        await window.saveFeedbackListToCloud(list);
      }
      if (typeof window.renderKanbanBoard === "function") window.renderKanbanBoard();
      if (input) {
        input.value = "Привет! Задача передана в активную разработку Алексею. Хотфикс уже готовится к выкатке! ⚙️";
        input.focus();
      }
      alert("🚀 Задача переведена в статус «В работе» и передана в разработку!");
    }
  } else if (actionKey === "smart_reset_lock") {
    if (input) {
      input.value = "Привет! Блокировка синхронизации снята, шлюз работает стабильно ✨";
      input.focus();
    }
  }
};

/**
 * ИНТЕРАКТИВНЫЙ МАСТЕР СЦЕНАРИЕВ SUPPORT DESK (TIER-1 CRM DECISION TREE)
 * Полная реализация 5 ветвей: Финансы, Дропы, Зефирка SOS, IRL Budget Guard, Техническая эскалация
 */
window.renderDeskWizardNode = function (nodeKey) {
  const container = document.getElementById("deskWizardStepsContainer");
  const titleEl = document.getElementById("deskWizardHeaderTitle");
  const backBtn = document.getElementById("deskBtnWizardBack");
  if (!container) return;

  container.innerHTML = "";
  const escapeFn = window.escapeHtml || (s => s || "");
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || window.currentCloudData?.katya || {};
  const pet = userRecord.pet || {};

  // =========================================================================
  // НАВИГАЦИЯ НАЗАД
  // =========================================================================
  if (nodeKey === "root") {
    backBtn?.classList.add("hidden");
  } else {
    backBtn?.classList.remove("hidden");
    if (nodeKey.startsWith("finances_") && nodeKey !== "finances_root") {
      backBtn.onclick = () => window.renderDeskWizardNode("finances_root");
    } else if ((nodeKey.startsWith("drops_") || nodeKey === "cases_recent") && nodeKey !== "drops_root") {
      backBtn.onclick = () => window.renderDeskWizardNode("drops_root");
    } else if (nodeKey.startsWith("pet_") && nodeKey !== "pet_root") {
      backBtn.onclick = () => window.renderDeskWizardNode("pet_root");
    } else if (nodeKey.startsWith("wishes_") && nodeKey !== "wishes_root") {
      backBtn.onclick = () => window.renderDeskWizardNode("wishes_root");
    } else if (nodeKey.startsWith("tech_") && nodeKey !== "tech_root") {
      backBtn.onclick = () => window.renderDeskWizardNode("tech_root");
    } else {
      backBtn.onclick = () => window.renderDeskWizardNode("root");
    }
  }

  // =========================================================================
  // 1. КОРНЕВОЕ МЕНЮ (5 КЛЮЧЕВЫХ ВЕТВЕЙ TIER-1)
  // =========================================================================
  if (nodeKey === "root") {
    if (titleEl) titleEl.innerText = "🔍 Мастер сценариев (Tier-1 Древо)";

    const desc = document.createElement("div");
    desc.className = "text-[11px] text-amber-300 font-bold mb-2";
    desc.innerText = "Выберите категорию обращения игрока:";
    container.appendChild(desc);

    const categories = [
      { key: "finances_root", label: "🪙 Финансы, баланс и 1C Ledger", icon: "🪙", desc: "Сверка баланса, возврат списаний, компенсации" },
      { key: "drops_root", label: "🎁 Кейсы, рулетка и выпавшие дропы", icon: "🎁", desc: "Завис кейс/рулетка, аудит шансов, пропажа предмета" },
      { key: "pet_root", label: "🐾 Забота о Зефирке SOS", icon: "🐾", desc: "100% показатели, разбудить из сна, уборка какашек" },
      { key: "wishes_root", label: "💌 Купоны Желаний & IRL Budget Guard", icon: "💌", desc: "Лимит 5 000 ₽/мес, активация купона, ручной выпуск" },
      { key: "tech_root", label: "🛠️ Технический сбой и эскалация во 2-ю линию", icon: "🛠️", desc: "Логи сбоя, Cloud Sync, передача бага в Канбан" }
    ];

    categories.forEach(opt => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "w-full text-left p-2.5 rounded-xl bg-[#181a29] hover:bg-[#22253b] border border-white/5 hover:border-amber-400/30 transition flex flex-col gap-1 cursor-pointer shadow-sm group mb-1.5";
      btn.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs text-slate-200 group-hover:text-amber-300 transition flex items-center gap-1.5">
            <span>${opt.icon}</span>
            <span>${opt.label}</span>
          </span>
          <span class="text-xs text-slate-500 font-mono">→</span>
        </div>
        <div class="text-[10px] text-slate-400 pl-5">${opt.desc}</div>
      `;
      btn.onclick = () => window.renderDeskWizardNode(opt.key);
      container.appendChild(btn);
    });
    return;
  }

  // =========================================================================
  // 2. ВЕТКА 1: ФИНАНСЫ И 1C LEDGER
  // =========================================================================
  if (nodeKey === "finances_root") {
    if (titleEl) titleEl.innerText = "🪙 Проблемы с балансом и 1С";

    const subCats = [
      { key: "finances_uncredited", title: "Не начислились монеты", desc: "За игру, дейлик или дзен-сундучок", icon: "📥" },
      { key: "finances_dispute", title: "Спорное списание (Сверка 1С)", desc: "Проверить проводки и обоснованность списания", icon: "🔍" },
      { key: "finances_negative", title: "Баланс обнулился или сбой кошелька", desc: "Экстренное восстановление депозита (+100 🪙)", icon: "🚨" }
    ];

    subCats.forEach(sc => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "w-full text-left p-2.5 rounded-xl bg-[#181a29] hover:bg-[#22253b] border border-white/5 hover:border-amber-400/30 transition flex items-start gap-2.5 cursor-pointer shadow-sm mb-2";
      b.innerHTML = `
        <span class="text-base shrink-0">${sc.icon}</span>
        <div>
          <div class="font-bold text-xs text-slate-200">${sc.title}</div>
          <div class="text-[10px] text-slate-400 mt-0.5">${sc.desc}</div>
        </div>
      `;
      b.onclick = () => window.renderDeskWizardNode(sc.key);
      container.appendChild(b);
    });
    return;
  }

  if (nodeKey === "finances_uncredited") {
    if (titleEl) titleEl.innerText = "🪙 Не начислились монеты";

    const desc = document.createElement("div");
    desc.className = "text-[11px] text-amber-300 font-bold mb-2";
    desc.innerText = "Выберите причину для быстрой компенсации в 1 клик:";
    container.appendChild(desc);

    const compensations = [
      { amount: 25, label: "+25 🪙 (Мини-игра / Ритм / Раннер)", reason: "Сбой начисления за аркаду" },
      { amount: 50, label: "+50 🪙 (Ежедневный бонус / Дзен)", reason: "Сбой начисления дейлика" },
      { amount: 100, label: "+100 🪙 (Крупный сбой начисления)", reason: "Критический сбой кошелька" }
    ];

    compensations.forEach(c => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "w-full text-left p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 font-bold text-xs transition cursor-pointer mb-2 active:scale-98 flex items-center justify-between";
      b.innerHTML = `
        <span>${c.label}</span>
        <span class="text-[10px] opacity-75 font-mono">Начислить ⚡</span>
      `;
      b.onclick = async () => {
        await window.grantSupportCompensationCoins(c.amount, c.reason);
      };
      container.appendChild(b);
    });
    return;
  }

  if (nodeKey === "finances_dispute") {
    if (titleEl) titleEl.innerText = "🔍 Сверка проводок 1C Ledger";

    const auditList = Array.isArray(userRecord.audit) ? userRecord.audit : (typeof window.readStorage === "function" ? window.readStorage(`${targetUser}_master_audit_events`, window.readStorage("katya_master_audit_events", [])) : []);
    const recent = auditList.slice(0, 5);

    const desc = document.createElement("div");
    desc.className = "text-[11px] text-slate-300 font-bold mb-2";
    desc.innerText = "Последние 5 проводок по балансу игрока:";
    container.appendChild(desc);

    if (recent.length === 0) {
      container.innerHTML += `<div class="text-xs text-slate-500 py-3 text-center">Записей проводок в 1С пока нет.</div>`;
    } else {
      recent.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "p-2 rounded-lg bg-[#141624] border border-white/5 flex items-center justify-between text-xs mb-1.5";
        const sign = item.coinsChange > 0 ? `+${item.coinsChange}` : (item.coinsChange ? String(item.coinsChange) : "");
        const signColor = item.coinsChange > 0 ? "text-emerald-400" : (item.coinsChange < 0 ? "text-rose-400" : "text-slate-400");
        itemDiv.innerHTML = `
          <div class="truncate pr-2">
            <span class="mr-1">${item.icon || "📄"}</span>
            <span class="font-medium text-slate-200">${escapeFn(item.text || "Проводка")}</span>
            <div class="text-[9px] text-slate-500 font-mono">${escapeFn(item.date || "")} ${escapeFn(item.time || "")}</div>
          </div>
          ${sign ? `<span class="font-mono font-bold text-[11px] ${signColor} shrink-0">${sign}🪙</span>` : ""}
        `;
        container.appendChild(itemDiv);
      });
    }

    const btnOk = document.createElement("button");
    btnOk.type = "button";
    btnOk.className = "w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium active:scale-95 transition cursor-pointer text-left flex items-center gap-2 mt-2";
    btnOk.innerHTML = `<span>💬</span><span>Списание корректно (отправить игроку)</span>`;
    btnOk.onclick = () => window.insertDeskCannedResponse("ledger_clean");
    container.appendChild(btnOk);

    const btnRefund = document.createElement("button");
    btnRefund.type = "button";
    btnRefund.className = "w-full py-2 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold active:scale-95 transition cursor-pointer text-left flex items-center gap-2 mt-1.5";
    btnRefund.innerHTML = `<span>⚡</span><span>Вернуть последнее списание (+50 🪙)</span>`;
    btnRefund.onclick = () => window.grantSupportCompensationCoins(50, "Откат спорного списания");
    container.appendChild(btnRefund);
    return;
  }

  if (nodeKey === "finances_negative") {
    if (titleEl) titleEl.innerText = "🚨 Восстановление кошелька";
    const desc = document.createElement("div");
    desc.className = "text-xs text-slate-300 leading-relaxed mb-3";
    desc.innerText = "Если из-за сбоя сети баланс обнулился или ушел в минус, кнопка восстановит кошелек до комфортных 100 🪙 и зафиксирует проводку в 1С.";
    container.appendChild(desc);

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-xs active:scale-95 transition shadow cursor-pointer text-center";
    resetBtn.innerText = "💰 Восстановить кошелек (+100 🪙)";
    resetBtn.onclick = async () => {
      await window.grantSupportCompensationCoins(100, "Экстренное восстановление баланса");
    };
    container.appendChild(resetBtn);
    return;
  }

  // =========================================================================
  // 3. ВЕТКА 2: КЕЙСЫ, РУЛЕТКА И ДРОПЫ
  // =========================================================================
  if (nodeKey === "drops_root") {
    if (titleEl) titleEl.innerText = "🎁 Кейсы и Рулетка Удачи";

    const caseDrops = Array.isArray(userRecord.caseHistory) ? userRecord.caseHistory : [];
    const statsDiv = document.createElement("div");
    statsDiv.className = "p-2.5 rounded-xl bg-[#141624] border border-white/5 flex justify-between items-center text-xs mb-3";
    statsDiv.innerHTML = `
      <div><span class="text-slate-400 block text-[10px]">Всего открыто кейсов:</span><b class="text-amber-300 font-mono text-sm">${caseDrops.length} шт</b></div>
      <div><span class="text-slate-400 block text-[10px]">Рулетка удачи:</span><b class="text-indigo-300 font-mono text-sm">Активна ✓</b></div>
    `;
    container.appendChild(statsDiv);

    const subCats = [
      { key: "drops_stuck", title: "Завис кейс или спин рулетки", desc: "Вернуть монеты за неудачную анимацию открытия", icon: "🎰" },
      { key: "drops_pity", title: "Вопрос по шансам и честности (RTP)", desc: "Вежливое разъяснение формулы + утешительный спин", icon: "🧠" },
      { key: "cases_recent", title: "История выпавших предметов", desc: "Посмотреть список и редкости открытых кейсов", icon: "📦" }
    ];

    subCats.forEach(sc => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "w-full text-left p-2.5 rounded-xl bg-[#181a29] hover:bg-[#22253b] border border-white/5 hover:border-amber-400/30 transition flex items-start gap-2.5 cursor-pointer shadow-sm mb-2";
      b.innerHTML = `
        <span class="text-base shrink-0">${sc.icon}</span>
        <div>
          <div class="font-bold text-xs text-slate-200">${sc.title}</div>
          <div class="text-[10px] text-slate-400 mt-0.5">${sc.desc}</div>
        </div>
      `;
      b.onclick = () => window.renderDeskWizardNode(sc.key);
      container.appendChild(b);
    });
    return;
  }

  if (nodeKey === "drops_stuck") {
    if (titleEl) titleEl.innerText = "🎰 Компенсация зависшего кейса";

    const buttons = [
      { label: "Подарить спин рулетки (+25 🪙)", amount: 25, reason: "Компенсация спина рулетки" },
      { label: "Компенсировать кейс (+50 🪙)", amount: 50, reason: "Возврат стоимости кейса" },
      { label: "Компенсировать эпик-кейс (+100 🪙)", amount: 100, reason: "Компенсация супер-кейса" }
    ];

    buttons.forEach(b => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "w-full text-left p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 font-bold text-xs transition cursor-pointer mb-2 active:scale-98 flex items-center justify-between";
      btn.innerHTML = `<span>${b.label}</span><span class="text-[10px] opacity-75 font-mono">Выдать ⚡</span>`;
      btn.onclick = async () => {
        await window.grantSupportCompensationCoins(b.amount, b.reason);
      };
      container.appendChild(btn);
    });
    return;
  }

  if (nodeKey === "drops_pity") {
    if (titleEl) titleEl.innerText = "🧠 Аудит шансов и честности";

    const desc = document.createElement("div");
    desc.className = "text-xs text-slate-300 leading-relaxed mb-3";
    desc.innerText = "В игре используется честный генератор случайных чисел. Чтобы сгладить эмоции, отправь тёплый ответ и подари утешительный спин:";
    container.appendChild(desc);

    const btnReply = document.createElement("button");
    btnReply.type = "button";
    btnReply.className = "w-full py-2.5 px-3 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-bold active:scale-95 transition cursor-pointer text-left flex items-center gap-2 mb-2";
    btnReply.innerHTML = `<span>💬</span><span>Отправить вежливый ответ оператора</span>`;
    btnReply.onclick = () => window.insertDeskCannedResponse("drop_refunded");
    container.appendChild(btnReply);

    const btnCoin = document.createElement("button");
    btnCoin.type = "button";
    btnCoin.className = "w-full py-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold active:scale-95 transition cursor-pointer text-center";
    btnCoin.innerText = "🎁 Начислить утешительный спин (+25 🪙)";
    btnCoin.onclick = () => window.grantSupportCompensationCoins(25, "Утешительный спин поддержки");
    container.appendChild(btnCoin);
    return;
  }

  if (nodeKey === "cases_recent") {
    if (titleEl) titleEl.innerText = "📦 Недавние открытия кейсов";
    const caseDrops = Array.isArray(userRecord.caseHistory) ? userRecord.caseHistory : [];
    const recentCases = caseDrops.slice(0, 6);

    if (recentCases.length === 0) {
      container.innerHTML = `<div class="text-xs text-slate-500 py-6 text-center">Игрок еще не открывал кейсы.</div>`;
      return;
    }

    recentCases.forEach(drop => {
      const card = document.createElement("div");
      card.className = "p-2 rounded-xl bg-[#141624] border border-white/5 flex items-center justify-between text-xs mb-1.5";
      card.innerHTML = `
        <div class="truncate pr-2">
          <span class="font-bold text-slate-200">${escapeFn(drop.name || drop.item || "Предмет")}</span>
          <div class="text-[9px] text-slate-500 font-mono">${escapeFn(drop.time || drop.date || "")}</div>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">${escapeFn(drop.rarity || "Обычный")}</span>
      `;
      container.appendChild(card);
    });

    const compBtn = document.createElement("button");
    compBtn.type = "button";
    compBtn.className = "w-full py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs mt-2 transition cursor-pointer active:scale-95";
    compBtn.innerText = "🪙 Компенсировать открытие кейса (+50 🪙)";
    compBtn.onclick = () => window.grantSupportCompensationCoins(50, "Компенсация открытия кейса");
    container.appendChild(compBtn);
    return;
  }

  // =========================================================================
  // 4. ВЕТКА 3: ЗАБОТА О ЗЕФИРКЕ SOS
  // =========================================================================
  if (nodeKey === "pet_root") {
    if (titleEl) titleEl.innerText = "🐾 Неотложная забота о Зефирке";

    const statsGrid = document.createElement("div");
    statsGrid.className = "grid grid-cols-2 gap-2 mb-3";

    const items = [
      { label: "Сытость", val: pet.hunger ?? 0, icon: "🍗", col: "text-amber-300" },
      { label: "Энергия", val: pet.energy ?? 0, icon: "⚡", col: "text-indigo-300" },
      { label: "Счастье", val: pet.happy ?? 0, icon: "💖", col: "text-pink-300" },
      { label: "Чистота", val: pet.clean ?? 0, icon: "🧼", col: "text-cyan-300" }
    ];

    items.forEach(st => {
      const card = document.createElement("div");
      card.className = "p-2 rounded-lg bg-[#141624] border border-white/5 flex items-center justify-between";
      card.innerHTML = `
        <span class="text-xs text-slate-300 flex items-center gap-1">
          <span>${st.icon}</span>
          <span>${st.label}</span>
        </span>
        <span class="font-mono font-bold text-xs ${st.col}">${st.val}%</span>
      `;
      statsGrid.appendChild(card);
    });
    container.appendChild(statsGrid);

    const actions = [
      {
        icon: "🐾",
        title: "100% Забота поддержки (Все параметры на максимум)",
        desc: "Восстановить сытость, энергию, счастье и чистоту",
        btnClass: "bg-pink-500/15 hover:bg-pink-500/25 border-pink-500/30 text-pink-300",
        onClick: () => window.restorePetStatsSupport()
      },
      {
        icon: "☀️",
        title: "Разбудить Зефирку (Сбросить сон)",
        desc: "Вывести питомца из сна и восстановить 100% энергии",
        btnClass: "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300",
        onClick: () => window.wakeUpPetSupport()
      },
      {
        icon: "🧼",
        title: "Генеральная уборка комнаты (+15 🪙)",
        desc: "Убрать все какашки с пола и выставить чистоту 100%",
        btnClass: "bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/30 text-cyan-300",
        onClick: () => window.cleanPoopSupport()
      }
    ];

    actions.forEach(act => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `w-full text-left p-2.5 rounded-xl border ${act.btnClass} transition flex items-start gap-2.5 cursor-pointer shadow-sm mb-2 active:scale-98`;
      btn.innerHTML = `
        <span class="text-base shrink-0">${act.icon}</span>
        <div>
          <div class="font-bold text-xs">${act.title}</div>
          <div class="text-[10px] opacity-80 mt-0.5">${act.desc}</div>
        </div>
      `;
      btn.onclick = act.onClick;
      container.appendChild(btn);
    });
    return;
  }

  // =========================================================================
  // 5. ВЕТКА 4: КУПОНЫ ЖЕЛАНИЙ & IRL BUDGET GUARD
  // =========================================================================
  if (nodeKey === "wishes_root") {
    if (titleEl) titleEl.innerText = "💌 Купоны Желаний & IRL Бюджет";

    const wishes = Array.isArray(userRecord.wishes) ? userRecord.wishes : [];
    const activeWishes = wishes.filter(w => w.status === "active" && !w.claimed);

    // Расчет IRL бюджета
    const costMap = { small: 400, medium: 1200, large: 2500, special: 3500 };
    let spentRub = 0;
    activeWishes.forEach(w => {
      spentRub += costMap[w.category] || costMap.medium;
    });
    const monthlyLimit = 5000;
    const loadPct = Math.min(100, Math.round((spentRub / monthlyLimit) * 100));
    const isOver75 = loadPct >= 75;

    const banner = document.createElement("div");
    banner.className = `p-3 rounded-xl border ${isOver75 ? "bg-rose-950/40 border-rose-500/40 text-rose-300" : "bg-[#141624] border-white/5 text-slate-300"} mb-3`;
    banner.innerHTML = `
      <div class="flex justify-between items-center text-xs font-bold mb-1">
        <span>IRL Нагрузка: ${spentRub} ₽ / ${monthlyLimit} ₽</span>
        <span class="font-mono">${loadPct}%</span>
      </div>
      <div class="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
        <div class="h-full rounded-full transition-all ${isOver75 ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-emerald-500"}" style="width: ${loadPct}%"></div>
      </div>
      <div class="text-[10px] mt-1.5 opacity-80">
        ${isOver75 ? "⚠️ Нагрузка выше 75%! Выдача крупных купонов (Large/Special) заблокирована." : "✨ Лимит в норме, активных купонов на руках: " + activeWishes.length + " шт."}
      </div>
    `;
    container.appendChild(banner);

    const subCats = [
      { key: "wishes_grant", title: "Выдать купон желания вручную", desc: "Создать купон с гарантированным начислением", icon: "🎁" },
      { key: "wishes_redeem", title: "Активировать купон в жизни (Redeem)", desc: "Отметить купон Кати как исполненный", icon: "❤️" }
    ];

    subCats.forEach(sc => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "w-full text-left p-2.5 rounded-xl bg-[#181a29] hover:bg-[#22253b] border border-white/5 hover:border-amber-400/30 transition flex items-start gap-2.5 cursor-pointer shadow-sm mb-2";
      b.innerHTML = `
        <span class="text-base shrink-0">${sc.icon}</span>
        <div>
          <div class="font-bold text-xs text-slate-200">${sc.title}</div>
          <div class="text-[10px] text-slate-400 mt-0.5">${sc.desc}</div>
        </div>
      `;
      b.onclick = () => window.renderDeskWizardNode(sc.key);
      container.appendChild(b);
    });
    return;
  }

  if (nodeKey === "wishes_grant") {
    if (titleEl) titleEl.innerText = "🎁 Выдача купона желания";

    const wishes = Array.isArray(userRecord.wishes) ? userRecord.wishes : [];
    const activeWishes = wishes.filter(w => w.status === "active" && !w.claimed);
    const costMap = { small: 400, medium: 1200, large: 2500, special: 3500 };
    let spentRub = 0;
    activeWishes.forEach(w => { spentRub += costMap[w.category] || costMap.medium; });
    const isOver75 = (spentRub / 5000) >= 0.75;

    const desc = document.createElement("div");
    desc.className = "text-[11px] text-amber-300 font-bold mb-2";
    desc.innerText = "Выберите готовый пресет или введите свой вариант:";
    container.appendChild(desc);

    const presets = [
      { title: "☕ Вкусный кофе / Десерт", cat: "small" },
      { title: "🍕 Киновечер с пиццей", cat: "medium" },
      { title: "💆‍♀️ Массаж / Релакс-вечер", cat: "medium" },
      { title: "🍷 Романтический ужин", cat: "large", blocked: isOver75 },
      { title: "✨ Спонтанная мечта", cat: "special", blocked: isOver75 }
    ];

    const presetWrap = document.createElement("div");
    presetWrap.className = "flex flex-wrap gap-1.5 mb-3";
    presets.forEach(p => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `px-2.5 py-1 rounded-lg border text-[11px] transition active:scale-95 cursor-pointer ${p.blocked ? "bg-white/5 border-white/5 text-slate-500 opacity-50" : "bg-white/5 hover:bg-white/15 border-white/10 text-slate-200"}`;
      chip.innerText = p.title + (p.blocked ? " 🔒" : "");
      chip.onclick = () => {
        if (p.blocked) {
          alert("Категория заблокирована защитой IRL Budget Guard (нагрузка > 75%)!");
          return;
        }
        const inp = document.getElementById("manualWishInput");
        const sel = document.getElementById("manualWishCatSelect");
        if (inp) inp.value = p.title;
        if (sel) sel.value = p.cat;
      };
      presetWrap.appendChild(chip);
    });
    container.appendChild(presetWrap);

    const formWrap = document.createElement("div");
    formWrap.className = "flex flex-col gap-2";
    formWrap.innerHTML = `
      <input type="text" id="manualWishInput" placeholder="Название желания..." class="bg-[#141624] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-400 transition" />
      <select id="manualWishCatSelect" class="bg-[#141624] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none cursor-pointer">
        <option value="small">Small (~400 ₽: кофе, десерт, вкусняшка)</option>
        <option value="medium" selected>Medium (~1 200 ₽: доставка, кино, пицца)</option>
        <option value="large" ${isOver75 ? "disabled" : ""}>Large (~2 500 ₽: ресторан, свидание) ${isOver75 ? "— БЛОК 75%" : ""}</option>
        <option value="special" ${isOver75 ? "disabled" : ""}>Special (~3 500 ₽: мечта, поездка) ${isOver75 ? "— БЛОК 75%" : ""}</option>
      </select>
      <button type="button" id="btnSubmitManualWish" class="py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 text-black font-bold text-xs active:scale-95 transition shadow cursor-pointer text-center mt-1">
        🎁 Отправить купон игроку
      </button>
    `;
    container.appendChild(formWrap);

    setTimeout(() => {
      document.getElementById("btnSubmitManualWish")?.addEventListener("click", async () => {
        const inp = document.getElementById("manualWishInput");
        const sel = document.getElementById("manualWishCatSelect");
        const title = inp ? inp.value.trim() : "";
        const cat = sel ? sel.value : "medium";
        if (!title) {
          alert("Пожалуйста, введите название купона!");
          return;
        }
        await window.grantManualWishCoupon(title, cat);
        window.renderDeskWizardNode("wishes_root");
      });
    }, 50);
    return;
  }

  if (nodeKey === "wishes_redeem") {
    if (titleEl) titleEl.innerText = "❤️ Активация купонов в жизни";

    const wishes = Array.isArray(userRecord.wishes) ? userRecord.wishes : [];
    const activeWishes = wishes.filter(w => w.status === "active" && !w.claimed);

    if (activeWishes.length === 0) {
      container.innerHTML = `<div class="text-xs text-slate-500 py-6 text-center">У Кати нет активных неиспользованных купонов ✨</div>`;
      return;
    }

    const desc = document.createElement("div");
    desc.className = "text-[11px] text-pink-300 font-bold mb-2";
    desc.innerText = "Нажмите «Принять», чтобы отметить купон исполненным:";
    container.appendChild(desc);

    activeWishes.forEach(w => {
      const card = document.createElement("div");
      card.className = "p-2.5 rounded-xl bg-[#141624] border border-amber-500/25 flex flex-col gap-2 text-xs mb-2 shadow-sm";
      card.innerHTML = `
        <div class="flex justify-between items-start gap-2">
          <div>
            <div class="font-bold text-slate-100">${escapeFn(w.title || "Желание")}</div>
            <div class="text-[9px] text-slate-400 font-mono mt-0.5">${escapeFn(w.code || "#WISH")} • ${escapeFn(w.date || "")}</div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Активен</span>
        </div>
        <button type="button" class="py-1.5 px-3 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/35 font-bold text-xs transition cursor-pointer active:scale-95 text-center">
          ❤️ Принять к исполнению в жизни
        </button>
      `;
      card.querySelector("button")?.addEventListener("click", async () => {
        await window.redeemWishCouponSupport(w.code || w.id);
        window.renderDeskWizardNode("wishes_redeem");
      });
      container.appendChild(card);
    });
    return;
  }

  // =========================================================================
  // 6. ВЕТКА 5: ТЕХНИЧЕСКИЙ СБОЙ И ЭСКАЛАЦИЯ
  // =========================================================================
  if (nodeKey === "tech_root") {
    if (titleEl) titleEl.innerText = "🛠️ Технический сбой и эскалация";

    const ticket = (userRecord.feedback || []).find(t => t.id === window.activeDeskTicketId);
    const logs = ticket?.techLogs || {};

    const infoBox = document.createElement("div");
    infoBox.className = "p-2.5 rounded-xl bg-[#141624] border border-white/5 space-y-1 text-xs mb-3";
    infoBox.innerHTML = `
      <div><span class="text-slate-400">Экран:</span> <b class="text-slate-200 font-mono">${escapeFn(logs.screen || "Неизвестно")}</b></div>
      <div><span class="text-slate-400">Браузер:</span> <span class="text-slate-300 text-[10px] break-all">${escapeFn(logs.userAgent ? logs.userAgent.slice(0, 55) + "..." : "Стандартный")}</span></div>
      ${logs.lastError ? `<div class="text-rose-400 font-bold mt-1 text-[11px]">🚨 Ошибка: ${escapeFn(logs.lastError.message || logs.lastError)}</div>` : `<div class="text-emerald-400 text-[10px]">Критических сбоев консоли не зафиксировано ✓</div>`}
    `;
    container.appendChild(infoBox);

    const actions = [
      {
        icon: "🌐",
        title: "Принудительный Cloud Sync",
        desc: "Перезаписать состояние в облако и сбросить кэш",
        onClick: () => window.crmRunSmartAction("smart_force_sync")
      },
      {
        icon: "🚀",
        title: "Эскалировать во 2-ю линию (Канбан)",
        desc: "Передать тикет Алексею на исправление в кодовой базе",
        onClick: () => window.crmEscalateToDev()
      },
      {
        icon: "📋",
        title: "Скопировать AI Debug Prompt",
        desc: "Подготовить готовый промт для исправления бага",
        onClick: () => {
          if (ticket && typeof window.copyAiDebugPromptById === "function") {
            window.copyAiDebugPromptById(ticket.id);
          } else {
            alert("Промт сгенерирован и готов к использованию!");
          }
        }
      }
    ];

    actions.forEach(a => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "w-full text-left p-2.5 rounded-xl bg-[#181a29] hover:bg-[#22253b] border border-white/5 transition flex items-start gap-2.5 cursor-pointer shadow-sm mb-2 active:scale-98";
      btn.innerHTML = `
        <span class="text-base shrink-0">${a.icon}</span>
        <div>
          <div class="font-bold text-xs text-slate-200">${a.title}</div>
          <div class="text-[10px] text-slate-400 mt-0.5">${a.desc}</div>
        </div>
      `;
      btn.onclick = a.onClick;
      container.appendChild(btn);
    });
    return;
  }
};

window.deskResetWizard = function () {
  window.renderDeskWizardNode("root");
};

// =========================================================================
// 5. ИНИЦИАЛИЗАЦИЯ И СЛУШАТЕЛИ СОБЫТИЙ
// =========================================================================
document.getElementById("deskChatInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (typeof window.sendDeskMessage === "function") {
      window.sendDeskMessage();
    }
  }
});

document.getElementById("targetPlayerSelect")?.addEventListener("change", async () => {
  if (typeof window.renderDashboard === "function") {
    await window.renderDashboard();
  }
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || window.currentCloudData?.katya || {};
  if (typeof window.runComprehensiveAiEconomyAudit === "function") {
    window.runComprehensiveAiEconomyAudit(userRecord.pet, userRecord.analytics, userRecord.audit);
  }
});

// Запуск первичной проверки авторизации
checkAuth();