/* =========================================================================
 * LEX LABS ENTERPRISE: MAIN DASHBOARD CONTROLLER & LEDGER
 * Файл: dashboard_main.js
 * ========================================================================= */

const DASHBOARD_PIN = "1703";
const SESSION_AUTH_KEY = "lex_dashboard_auth_token";
const SESSION_OPERATOR_KEY = "lex_dashboard_operator";

let currentMainTab = "overview";
let currentAuditFilterPeriod = "all";

// Безопасное экранирование HTML
function getEscapeHtml() {
  return typeof window.escapeHtml === "function" ? window.escapeHtml : (str => {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  });
}

// Авторизация оператора
function checkAuth() {
  const authOverlay = document.getElementById("authOverlay");
  const dashboardContent = document.getElementById("dashboardContent");
  const pinInput = document.getElementById("pinInput");
  const currentOperatorLabel = document.getElementById("currentOperatorLabel");

  if (sessionStorage.getItem(SESSION_AUTH_KEY) === "authorized") {
    authOverlay?.classList.add("hidden");
    dashboardContent?.classList.remove("hidden");
    if (currentOperatorLabel) {
      currentOperatorLabel.innerText = sessionStorage.getItem(SESSION_OPERATOR_KEY) || "Алексей";
    }
    renderDashboard();
  } else {
    authOverlay?.classList.remove("hidden");
    dashboardContent?.classList.add("hidden");
    setTimeout(() => pinInput?.focus(), 150);
  }
}
window.checkAuth = checkAuth;

document.getElementById("btnSubmitPin")?.addEventListener("click", () => {
  const pinInput = document.getElementById("pinInput");
  const pinError = document.getElementById("pinError");
  const employeeSelect = document.getElementById("employeeSelect");
  const authCard = document.getElementById("authCard");

  if (pinInput?.value.trim() === DASHBOARD_PIN) {
    sessionStorage.setItem(SESSION_AUTH_KEY, "authorized");
    const opName = employeeSelect ? employeeSelect.options[employeeSelect.selectedIndex].text.split(" ")[0] : "Алексей";
    sessionStorage.setItem(SESSION_OPERATOR_KEY, opName);
    if (pinError) pinError.style.opacity = "0";
    checkAuth();
  } else {
    if (pinError) pinError.style.opacity = "1";
    authCard?.classList.add("animate-shake");
    setTimeout(() => authCard?.classList.remove("animate-shake"), 400);
  }
});

document.getElementById("btnLogout")?.addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_AUTH_KEY);
  checkAuth();
});

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

  if (tabId === "kanban" && typeof window.renderKanbanBoard === "function") {
    window.renderKanbanBoard();
  }
  if (tabId === "inbox" && typeof window.renderFeedbackInbox === "function") {
    window.renderFeedbackInbox();
  }
};
window.switchDashboardTab = window.switchMainTab;

// Рендер дашборда
window.renderDashboard = async function () {
  const cloud = typeof window.fetchCloudData === "function" ? await window.fetchCloudData() : window.currentCloudData;
  if (!cloud) return;

  const sel = document.getElementById("targetPlayerSelect");
  const requestedUser = sel ? sel.value : "katya";
  
  if (sel) {
    sel.innerHTML = "";
    const systemKeys = ["economyConfig", "customFood", "customShop", "customRewards", "customCases", "wishChances", "caseSettings", "allChances"];
    Object.keys(cloud).forEach((k) => {
      if (!systemKeys.includes(k)) {
        const opt = document.createElement("option");
        opt.value = k;
        opt.innerText = k === "katya" ? "Катя (Таганрог)" : `Игрок: ${k}`;
        if (k === requestedUser) opt.selected = true;
        sel.appendChild(opt);
      }
    });
    if (!sel.value && cloud.katya) sel.value = "katya";
  }

  const activeUser = sel ? sel.value : "katya";
  const record = cloud[activeUser] || {};

  if (Array.isArray(record.feedback)) {
    localStorage.setItem(`${activeUser}_master_feedback`, JSON.stringify(record.feedback));
    localStorage.setItem("katya_master_feedback", JSON.stringify(record.feedback));
  }

  const pet = record.pet || {};
  const analytics = record.analytics || {};
  const wishes = record.wishes || [];
  const caseDrops = record.caseHistory || [];
  const rouletteHistory = record.rouletteHistory || [];
  const audit = record.audit || [];

  const lastSyncEl = document.getElementById("dashLastSyncTime");
  if (lastSyncEl) lastSyncEl.innerText = record.lastActive || "Синхронизировано";

  // KPI метрики
  const kpiTotalTime = document.getElementById("kpiTotalTime");
  if (kpiTotalTime) kpiTotalTime.innerText = `${Math.round((analytics.totalSecondsPlayed || 0) / 60)} м`;
  const kpiSessions = document.getElementById("kpiSessions");
  if (kpiSessions) kpiSessions.innerText = analytics.sessionsCount || 0;
  const kpiSpentCoins = document.getElementById("kpiSpentCoins");
  if (kpiSpentCoins) kpiSpentCoins.innerText = `${analytics.spentCoins || 0} 🪙`;
  const kpiCasesOpened = document.getElementById("kpiCasesOpened");
  if (kpiCasesOpened) kpiCasesOpened.innerText = analytics.casesOpened || 0;

  // Инпуты состояния питомца (если присутствуют в верстке)
  const petInputs = {
    editPetName: pet.name || "",
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

  // Модульный рендеринг
  if (typeof window.renderEconomyInputs === "function") window.renderEconomyInputs();
  if (typeof window.switchOddsMode === "function") window.switchOddsMode(window.currentOddsTab || "slots");
  if (typeof window.renderWishesGrid === "function") window.renderWishesGrid(wishes);
  if (typeof window.renderCaseDrops === "function") window.renderCaseDrops(caseDrops);
  if (typeof window.renderRouletteHistory === "function") window.renderRouletteHistory(rouletteHistory);
  if (typeof window.renderAuditLedger === "function") window.renderAuditLedger(audit);
  if (typeof window.runComprehensiveAiEconomyAudit === "function") window.runComprehensiveAiEconomyAudit(pet, analytics, audit);

  if (typeof window.updateUnreadBadges === "function") window.updateUnreadBadges();
  if (currentMainTab === "kanban" && typeof window.renderKanbanBoard === "function") {
    window.renderKanbanBoard();
  }
  if (currentMainTab === "inbox" && typeof window.renderFeedbackInbox === "function") {
    window.renderFeedbackInbox();
  }
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

  const escapeFn = getEscapeHtml();

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
  const escapeFn = getEscapeHtml();

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

  list.forEach(item => {
    const isBug = item.category?.includes("Баг");
    const isUnread = item.isRead === false || item.isRead === undefined;
    if (isUnread) {
      if (isBug) unreadBugs++;
      else unreadInbox++;
    }
  });

  const bBug = document.getElementById("badgeUnreadBugs");
  const bInbox = document.getElementById("badgeUnreadInbox");
  if (bBug) {
    bBug.innerText = unreadBugs;
    bBug.classList.toggle("hidden", unreadBugs === 0);
  }
  if (bInbox) {
    bInbox.innerText = unreadInbox;
    bInbox.classList.toggle("hidden", unreadInbox === 0);
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
  const escapeFn = getEscapeHtml();
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
  const escapeFn = getEscapeHtml();
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
// 4. ИЗОЛИРОВАННЫЙ РЕЖИМ ПОДДЕРЖКИ (ПЕРВАЯ ЛИНИЯ)
// =========================================================================
window.activeDeskTicketId = null;

window.openSupportDeskModal = function () {
  document.getElementById("modalSupportDesk")?.classList.remove("hidden");
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  const list = userRecord.feedback || (typeof window.readStorage === "function"
    ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", []))
    : []);

  const deskTickets = list.filter(t => {
    const st = t.status || "sent";
    if (t.claimed === true && st === "done") return false;
    return ["sent", "in_progress", "testing", "done"].includes(st);
  });

  if (deskTickets.length > 0 && (!window.activeDeskTicketId || !deskTickets.some(t => t.id === window.activeDeskTicketId))) {
    window.activeDeskTicketId = deskTickets[0].id;
  }

  renderDeskTopActiveChatsBar(deskTickets, window.activeDeskTicketId);
  if (window.activeDeskTicketId) {
    selectDeskTicket(window.activeDeskTicketId);
  }
  window.renderDeskWizardNode("root");
};

window.closeSupportDeskModal = function () {
  document.getElementById("modalSupportDesk")?.classList.add("hidden");
};

function renderDeskTopActiveChatsBar(deskTickets, activeId) {
  const bar = document.getElementById("deskTopActiveChatsBar");
  if (!bar) return;
  bar.innerHTML = "";

  if (deskTickets.length === 0) {
    bar.innerHTML = `<span class="text-xs text-gray-500 font-mono">Нет активных тикетов первой линии ✨</span>`;
    return;
  }

  const escapeFn = getEscapeHtml();

  deskTickets.forEach(ticket => {
    const isSelected = ticket.id === activeId;
    const msgs = Array.isArray(ticket.messages) ? ticket.messages : [];
    const preview = msgs.length > 0 ? msgs[msgs.length - 1].text : (ticket.text || "");

    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = `flex items-center gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap text-xs transition cursor-pointer border ${isSelected ? "bg-amber-400 text-black font-black border-amber-300 shadow-md" : "bg-[#181a29] text-gray-300 hover:text-white border-white/5"}`;

    pill.onclick = () => selectDeskTicket(ticket.id);

    let stBadge = "📥";
    if (ticket.status === "in_progress") stBadge = "⚙️";
    else if (ticket.status === "testing") stBadge = "🧪";
    else if (ticket.status === "done") stBadge = "🏁";

    const safePreview = escapeFn(preview);

    pill.innerHTML = `
      <span>${stBadge}</span>
      <span class="font-bold">#${ticket.id ? ticket.id.slice(-4) : "????"}</span>
      <span class="opacity-70 truncate max-w-[120px]">${safePreview}</span>
    `;
    bar.appendChild(pill);
  });
}

function selectDeskTicket(ticketId) {
  window.activeDeskTicketId = ticketId;
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  let list = userRecord.feedback || (typeof window.readStorage === "function"
    ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", []))
    : []);
  const ticket = list.find(t => t.id === ticketId);
  if (!ticket) return;

  if (!ticket.status || ticket.status === "sent") {
    ticket.status = "in_progress";
    userRecord.feedback = list;
    if (typeof window.saveFeedbackListToCloud === "function") {
      window.saveFeedbackListToCloud(list);
    }
  }

  renderDeskTopActiveChatsBar(list.filter(t => !(t.claimed === true && t.status === "done")), ticketId);
  if (typeof window.renderDeskChatTimeline === "function") {
    window.renderDeskChatTimeline(ticket);
  }
}

window.renderDeskChatTimeline = function (ticket) {
  const area = document.getElementById("deskChatTimeline") || document.getElementById("deskChatMessagesArea");
  if (!area) return;
  area.innerHTML = "";

  const msgs = Array.isArray(ticket?.messages) ? ticket.messages : [];
  const escapeFn = getEscapeHtml();

  msgs.forEach(msg => {
    const isAlex = msg.author === "alex";
    const bubble = document.createElement("div");
    bubble.className = `flex flex-col ${isAlex ? "items-end" : "items-start"} gap-1 w-full`;

    bubble.innerHTML = `
      <div class="max-w-[80%] rounded-2xl ${isAlex ? 'bg-amber-400 text-black font-medium rounded-tr-sm shadow-md' : 'bg-[#1b1d30] border border-white/10 text-gray-100 rounded-tl-sm shadow'} p-3 text-xs">
        <div class="text-[9px] font-mono opacity-60 mb-0.5">${isAlex ? "Алексей (Вы)" : "Катя"} ${msg.time ? "• " + escapeFn(msg.time) : ""}</div>
        <div class="whitespace-pre-wrap leading-relaxed select-text">${escapeFn(msg.text || "")}</div>
      </div>
    `;
    area.appendChild(bubble);
  });

  setTimeout(() => {
    area.scrollTop = area.scrollHeight;
  }, 30);
};

window.sendDeskMessage = async function () {
  const input = document.getElementById("deskChatInput");
  const text = input ? input.value.trim() : "";
  if (!text || !window.activeDeskTicketId) return;

  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  let list = userRecord.feedback || (typeof window.readStorage === "function"
    ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", []))
    : []);
  const ticket = list.find(t => t.id === window.activeDeskTicketId);
  if (!ticket) return;

  if (!Array.isArray(ticket.messages)) ticket.messages = [];
  ticket.messages.push({
    id: "msg_desk_" + Date.now(),
    author: "alex",
    text: text,
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  });

  input.value = "";
  window.renderDeskChatTimeline(ticket);

  userRecord.feedback = list;
  if (typeof window.saveFeedbackListToCloud === "function") {
    await window.saveFeedbackListToCloud(list);
  } else {
    localStorage.setItem(`${targetUser}_master_feedback`, JSON.stringify(list));
    localStorage.setItem("katya_master_feedback", JSON.stringify(list));
    if (typeof window.saveCloud === "function") await window.saveCloud();
  }
};

window.onDeskStatusChange = async function (newStatus) {
  if (!window.activeDeskTicketId) return;
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  let list = userRecord.feedback || (typeof window.readStorage === "function"
    ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", []))
    : []);
  const ticket = list.find(t => t.id === window.activeDeskTicketId);
  if (!ticket) return;

  ticket.status = newStatus;

  if (newStatus === "done") {
    ticket.rewardGranted = true;
    ticket.rewardAmount = 35;
    if (!Array.isArray(ticket.messages)) ticket.messages = [];
    ticket.messages.push({
      id: "survey_" + Date.now(),
      author: "alex",
      text: "📋 [Системный опросник обслуживания]: Пожалуйста, оцени решение от 1 до 5 звёзд! После оценки на твой счёт поступит награда 🪙",
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
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

  renderDeskTopActiveChatsBar(list.filter(t => !(t.claimed === true && t.status === "done")), ticket.id);
  window.renderDeskChatTimeline(ticket);
};

window.crmEscalateToDev = async function () {
  if (!window.activeDeskTicketId) return;
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  let list = userRecord.feedback || (typeof window.readStorage === "function"
    ? window.readStorage(`${targetUser}_master_feedback`, window.readStorage("katya_master_feedback", []))
    : []);
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
  window.closeSupportDeskModal();
  alert("🚀 Задача успешно эскалирована во вторую линию разработки (Канбан)!");
};

window.crmRunSmartAction = async function (actionKey) {
  const deskInput = document.getElementById("deskChatInput");
  const crmInput = document.getElementById("crmChatTextInput");
  const input = deskInput || crmInput;

  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
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

window.renderDeskWizardNode = function (nodeKey) {
  const container = document.getElementById("deskWizardStepsContainer");
  const titleEl = document.getElementById("deskWizardHeaderTitle");
  const backBtn = document.getElementById("deskBtnWizardBack");
  if (!container) return;

  container.innerHTML = "";
  if (nodeKey === "root") {
    backBtn?.classList.add("hidden");
    if (titleEl) titleEl.innerText = "🔍 Мастер сценариев (Шаг 1)";
    
    const desc = document.createElement("div");
    desc.className = "text-[11px] text-amber-300 font-bold mb-1.5";
    desc.innerText = "Выберите категорию сбоя:";
    container.appendChild(desc);

    [
      { key: "coins", label: "🪙 Проблемы с монетами и 1С", icon: "🪙", next: "coins_branch" },
      { key: "cases", label: "📦 Кейсы, рулетка и дропы", icon: "📦", next: "cases_branch" },
      { key: "sync", label: "🌐 Облачная синхронизация", icon: "🌐", action: "smart_force_sync" }
    ].forEach(opt => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "w-full text-left p-2.5 rounded-xl bg-[#181a29] hover:bg-[#22253b] border border-white/5 transition flex items-center gap-2 cursor-pointer shadow-sm";
      btn.innerHTML = `<span>${opt.icon}</span><span class="font-bold text-gray-200">${opt.label}</span>`;
      btn.onclick = () => {
        if (opt.next) window.renderDeskWizardNode(opt.next);
        else if (opt.action && typeof window.crmRunSmartAction === "function") window.crmRunSmartAction(opt.action);
      };
      container.appendChild(btn);
    });
  } else {
    backBtn?.classList.remove("hidden");
    backBtn.onclick = () => window.renderDeskWizardNode("root");
    if (titleEl) titleEl.innerText = "🔍 Выбор данных из БД (Шаг 2)";

    const desc = document.createElement("div");
    desc.className = "text-[11px] text-amber-300 font-bold mb-1.5";
    desc.innerText = nodeKey === "coins_branch" ? "Выберите транзакцию из 1С Ledger:" : "Выберите кейс или выигрыш:";
    container.appendChild(desc);

    const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
    const userRecord = window.currentCloudData?.[targetUser] || {};
    const dataList = nodeKey === "coins_branch"
      ? (userRecord.audit || (typeof window.readStorage === "function" ? window.readStorage(`${targetUser}_master_audit_events`, window.readStorage("katya_master_audit_events", [])) : []))
      : (userRecord.caseHistory || (typeof window.readStorage === "function" ? window.readStorage(`${targetUser}_case_history`, window.readStorage("katya_case_history", [])) : []));

    if (dataList.length === 0) {
      container.innerHTML += `<div class="text-xs text-gray-500 py-4">Записей в базе данных не найдено.</div>`;
      return;
    }

    const escapeFn = getEscapeHtml();
    dataList.slice().reverse().slice(0, 8).forEach(item => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "w-full text-left p-2 rounded-xl bg-[#181a29] hover:bg-[#22253b] border border-amber-500/30 transition flex flex-col gap-0.5 cursor-pointer";
      btn.innerHTML = `
        <div class="font-bold text-amber-300 text-[11px] truncate">${escapeFn(item.text || item.name || "")}</div>
        <div class="text-[9px] text-gray-400 font-mono">${escapeFn(item.date || item.time || "")}</div>
      `;
      btn.onclick = () => {
        const input = document.getElementById("deskChatInput");
        if (input) {
          input.value = `Привет! Проверил данные по базе: «${item.text || item.name || ""}». Всё работает корректно! ✨`;
          input.focus();
        }
      };
      container.appendChild(btn);
    });
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

document.getElementById("targetPlayerSelect")?.addEventListener("change", () => {
  if (typeof window.renderDashboard === "function") {
    window.renderDashboard();
  }
});

// Запуск первичной проверки авторизации
checkAuth();