/* =========================================================================
 * LEX LABS ENTERPRISE: MISSION CONTROL DASHBOARD ENGINE
 * Файл: dashboard.js (Версия: 4.0 Enterprise Ledger & AI Macro-Audit)
 * ========================================================================= */

const DASHBOARD_PIN = "1703";
const SESSION_AUTH_KEY = "lex_dashboard_auth_token";
const SESSION_OPERATOR_KEY = "lex_dashboard_operator";

const JSONBIN_BIN_ID = "6acb3d30ac6210605a272eb6";
const JSONBIN_API_KEY = "$2a$10$JBnAcYGGmJL6Q5lDn45nHeW4jsBStn1Z/4XRrRormnfaKG7YbqUN2";

const TELEGRAM_BOT_TOKEN = "8860557268:AAEXppOhH3jzprkzThf0phM828_Y3ALP_YU";
const TELEGRAM_CHAT_ID = "409697238";

let currentCloudData = {};
let countdownSec = 60;
let currentMainTab = "overview";
let currentOddsTab = "case_std";
let currentEcoShopSlot = "body";
let currentAuditFilterPeriod = "all"; // all | today | yesterday | week | month

window.currentOpenBugId = null;
window.activeTimerInterval = null;
window.timerRunning = false;

// Базовые финансовые ставки и лимиты системы
const DEFAULT_ECONOMY = {
  caseCostStandard: 80,
  caseCostPremium: 160,
  caseCostBlack: 320,
  caseCostHalloween: 130,
  betCrash: 25,
  betDice: 15,
  betSlots: 20,
  scratchTrio: 30,
  scratchFish: 75,
  scratchVip: 150,
  dailyBonus: 15,
  maxRunner: 25,
  maxTetris: 25,
  maxFishing: 40,
  maxMemory: 30,
  catcher: 16
};

// Резервная база вероятностей и стоимости дропа для аудита RTP
const FALLBACK_ODDS_DATABASE = {
  case_std: [
    { id: "fish_common", name: "Карасик", icon: "🐟", chance: 40, value: 20 },
    { id: "yarn_ball", name: "Клубок ниток", icon: "🧶", chance: 30, value: 45 },
    { id: "mouse_toy", name: "Мышка", icon: "🐁", chance: 20, value: 90 },
    { id: "cat_collar", name: "Ошейник с колокольчиком", icon: "🔔", chance: 10, value: 250 }
  ],
  case_prem: [
    { id: "tuna_can", name: "Элитный тунец", icon: "🥫", chance: 45, value: 60 },
    { id: "cat_bed", name: "Мягкая лежанка", icon: "🛏️", chance: 30, value: 140 },
    { id: "laser_pointer", name: "Лазерная указка", icon: "🔴", chance: 15, value: 280 },
    { id: "cat_crown", name: "Корона принцессы", icon: "👑", chance: 10, value: 600 }
  ],
  case_blk: [
    { id: "black_card", name: "Black VIP Карта", icon: "💳", chance: 50, value: 150 },
    { id: "diamond_fish", name: "Алмазная рыбка", icon: "💎", chance: 30, value: 350 },
    { id: "cyber_shades", name: "Кибер-очки", icon: "🕶️", chance: 15, value: 700 },
    { id: "gold_trophy", name: "Золотой кубок", icon: "🏆", chance: 5, value: 1800 }
  ],
  case_hw: [
    { id: "hw_pumpkin", name: "Тыквенный фонарик", icon: "🎃", chance: 40, value: 50 },
    { id: "hw_witch_hat", name: "Шляпа ведьмы", icon: "🧙‍♀️", chance: 30, value: 120 },
    { id: "hw_bat", name: "Летучая мышка", icon: "🦇", chance: 20, value: 240 },
    { id: "hw_candy", name: "Зловещая конфета", icon: "🍬", chance: 10, value: 550 }
  ],
  slots: [
    { id: "slot_sushi", name: "Суши (x2.5)", icon: "🍣", chance: 12, multiplier: 2.5 },
    { id: "slot_coins", name: "Монетки (x4)", icon: "🪙", chance: 7, multiplier: 4.0 },
    { id: "slot_crown", name: "Корона (x7.5)", icon: "👑", chance: 3, multiplier: 7.5 },
    { id: "slot_star", name: "Звезда (x15)", icon: "⭐", chance: 1, multiplier: 15.0 },
    { id: "slot_empty", name: "Пусто", icon: "💨", chance: 77, multiplier: 0 }
  ],
  scratch: [
    { id: "scr_small", name: "Малый приз (x1.5)", icon: "🪙", chance: 40, multiplier: 1.5 },
    { id: "scr_mid", name: "Средний приз (x3)", icon: "💰", chance: 15, multiplier: 3.0 },
    { id: "scr_jackpot", name: "Джекпот (x10)", icon: "💎", chance: 3, multiplier: 10.0 },
    { id: "scr_empty", name: "Пусто", icon: "❌", chance: 42, multiplier: 0 }
  ],
  crash: [
    { id: "crash_safe", name: "Множитель < 1.5x", icon: "🟢", chance: 60, avgMultiplier: 1.25 },
    { id: "crash_mid", name: "Множитель 1.5x - 3x", icon: "🟡", chance: 28, avgMultiplier: 2.1 },
    { id: "crash_high", name: "Множитель > 3x", icon: "🚀", chance: 12, avgMultiplier: 4.5 }
  ],
  fishing: [
    { id: "fish_trash", name: "Старый башмак", icon: "👞", chance: 25, value: 0 },
    { id: "fish_crucian", name: "Карась", icon: "🐟", chance: 45, value: 12 },
    { id: "fish_tuna", name: "Тунец", icon: "🐠", chance: 20, value: 30 },
    { id: "fish_golden", name: "Золотая рыбка", icon: "✨", chance: 10, value: 75 }
  ],
  wishes: [
    { id: "wish_coffee", name: "Купон на кофе", icon: "☕", chance: 40 },
    { id: "wish_walk", name: "Купон на прогулку", icon: "🌇", chance: 30 },
    { id: "wish_movie", name: "Купон на кино", icon: "🎬", chance: 20 },
    { id: "wish_special", name: "Супер-желание", icon: "💌", chance: 10 }
  ]
};

// 1. АВТОРИЗАЦИЯ ОПЕРАТОРА
const authOverlay = document.getElementById("authOverlay");
const authCard = document.getElementById("authCard");
const pinInput = document.getElementById("pinInput");
const pinError = document.getElementById("pinError");
const employeeSelect = document.getElementById("employeeSelect");
const dashboardContent = document.getElementById("dashboardContent");
const currentOperatorLabel = document.getElementById("currentOperatorLabel");

function checkAuth() {
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

document.getElementById("btnSubmitPin")?.addEventListener("click", () => {
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

pinInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("btnSubmitPin")?.click();
});

document.getElementById("btnLogout")?.addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_AUTH_KEY);
  if (pinInput) pinInput.value = "";
  checkAuth();
});

document.getElementById("btnPrintReport")?.addEventListener("click", () => window.print());
document.getElementById("targetPlayerSelect")?.addEventListener("change", () => renderDashboard());

// Таймер автообновления данных (60 секунд)
setInterval(() => {
  countdownSec--;
  const cd = document.getElementById("autoRefreshCountdown");
  if (cd) cd.innerText = `${countdownSec}с`;
  if (countdownSec <= 0) {
    countdownSec = 60;
    renderDashboard();
  }
}, 1000);

document.getElementById("btnRefresh")?.addEventListener("click", () => {
  countdownSec = 60;
  renderDashboard();
});

// 2. УПРАВЛЕНИЕ ВКЛАДКАМИ
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

  document.querySelectorAll(".main-tab-btn").forEach((btn) => {
    btn.className = "main-tab-btn relative flex-1 py-2.5 px-3 rounded-xl text-gray-400 hover:text-white whitespace-nowrap transition cursor-pointer";
  });

  const activeBtn = document.getElementById(`mainTab_${tabId}`);
  if (activeBtn) {
    activeBtn.className = "main-tab-btn relative flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black whitespace-nowrap shadow transition cursor-pointer";
  }

  if (tabId === "kanban") {
    window.renderKanbanBoard();
  } else if (tabId === "inbox") {
    window.renderFeedbackInbox();
  }

  window.updateUnreadBadges();
};

window.switchDashboardTab = window.switchMainTab;

window.switchEcoSubTab = function (subId) {
  ["food", "shop", "cases", "rewards"].forEach((k) => {
    document.getElementById(`ecoContainer_${k}`)?.classList.add("hidden");
    document.getElementById(`ecoContainer_${k}`)?.classList.remove("grid", "flex");
    const b = document.getElementById(`ecoSub_${k}`);
    if (b) b.className = "px-3 py-1.5 rounded-lg text-gray-400 hover:text-white whitespace-nowrap cursor-pointer";
  });

  const targetBox = document.getElementById(`ecoContainer_${subId}`);
  if (targetBox) {
    targetBox.classList.remove("hidden");
    targetBox.classList.add(subId === "shop" ? "flex" : "grid");
  }

  const actBtn = document.getElementById(`ecoSub_${subId}`);
  if (actBtn) actBtn.className = "px-3 py-1.5 rounded-lg bg-pink-500 text-white whitespace-nowrap cursor-pointer";
};

// 4. СБОР И РЕНДЕР ДАННЫХ
async function renderDashboard() {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY }
    });
    if (!res.ok) throw new Error("JSONBin network unreachable");
    const cloud = await res.json();
    currentCloudData = cloud.record || {};

    const sel = document.getElementById("targetPlayerSelect");
    const requestedUser = sel ? sel.value : "katya";
    
    if (sel) {
      sel.innerHTML = "";
      const systemKeys = ["economyConfig", "customFood", "customShop", "customRewards", "customCases", "wishChances", "caseSettings", "allChances"];
      Object.keys(currentCloudData).forEach((k) => {
        if (!systemKeys.includes(k)) {
          const opt = document.createElement("option");
          opt.value = k;
          opt.innerText = k === "katya" ? "Катя (Таганрог)" : `Игрок: ${k}`;
          if (k === requestedUser) opt.selected = true;
          sel.appendChild(opt);
        }
      });
      if (!sel.value && currentCloudData.katya) sel.value = "katya";
    }

    // Единственное корректное объявление activeUser:
    const activeUser = sel ? sel.value : "katya";
    const record = currentCloudData[activeUser] || {};

    // Фиксация локального кэша для безопасной работы без сети
    if (Array.isArray(record.feedback)) {
      localStorage.setItem("katya_master_feedback", JSON.stringify(record.feedback));
    }

    const pet = record.pet || {};
    const analytics = record.analytics || {};
    const wishes = record.wishes || [];
    const caseDrops = record.caseHistory || [];
    const rouletteHistory = record.rouletteHistory || [];
    const audit = record.audit || [];

    // Верхняя панель KPI
    document.getElementById("dashLastSyncTime").innerText = record.lastActive || "Синхронизировано";
    document.getElementById("kpiTotalTime").innerText = `${Math.round((analytics.totalSecondsPlayed || 0) / 60)} м`;
    document.getElementById("kpiSessions").innerText = analytics.sessionsCount || 0;
    document.getElementById("kpiSpentCoins").innerText = `${analytics.spentCoins || 0} 🪙`;
    document.getElementById("kpiCasesOpened").innerText = analytics.casesOpened || 0;

    // Редактор состояния
    document.getElementById("editPetName").value = pet.name || "";
    document.getElementById("editPetCoins").value = pet.coins || 0;
    document.getElementById("editPetLevel").value = pet.level || 1;
    document.getElementById("editPetXp").value = pet.xp || 0;
    document.getElementById("editPetHunger").value = pet.hunger || 0;
    document.getElementById("editPetHappy").value = pet.happy || 0;
    document.getElementById("editPetEnergy").value = pet.energy || 0;
    document.getElementById("editPetClean").value = pet.clean || 0;

    // Модульный рендеринг
    renderEconomyInputs();
    switchOddsMode(currentOddsTab);
    renderWishesGrid(wishes);
    renderCaseDrops(caseDrops);
    renderRouletteHistory(rouletteHistory);
    renderAuditLedger(audit);
    runComprehensiveAiEconomyAudit(pet, analytics, audit);

    // Фоновая проверка очереди Telegram без использования сторонних прокси
    await processPendingTelegramAlerts(record);

    window.updateUnreadBadges();
    if (currentMainTab === "kanban") window.renderKanbanBoard();
    if (currentMainTab === "inbox") window.renderFeedbackInbox();

  } catch (e) {
    console.error("Dashboard Core Failure:", e);
  }
}

// 4. КОМПЛЕКСНЫЙ ИИ-АУДИТ ЭКОНОМИКИ И МАКРОБАЛАНСА КАЗИНО
let generatedAdvisorEdits = [];

function runComprehensiveAiEconomyAudit(pet, analytics, audit = []) {
  const eco = Object.assign({}, DEFAULT_ECONOMY, currentCloudData.economyConfig || {});
  const chances = currentCloudData.allChances || {};
  
  generatedAdvisorEdits = [];
  let riskScore = 5;
  let breakdownReports = [];

  // АУДИТ 1: СЛОТЫ 777 (Математическое ожидание выигрыша на 1 спин)
  const slotBet = eco.betSlots || 20;
  const slotsList = chances.slots || FALLBACK_ODDS_DATABASE.slots;
  let evSlots = 0;
  slotsList.forEach(item => {
    const mult = item.multiplier !== undefined ? item.multiplier : (item.id === "slot_star" ? 15 : item.id === "slot_crown" ? 7.5 : item.id === "slot_coins" ? 4 : item.id === "slot_sushi" ? 2.5 : 0);
    evSlots += (item.chance / 100) * (slotBet * mult);
  });
  const rtpSlots = Math.round((evSlots / slotBet) * 100);

  if (rtpSlots > 95) {
    riskScore += 25;
    const targetBet = Math.ceil(evSlots / 0.88 / 5) * 5;
    breakdownReports.push(`🚨 Слоты: RTP завышен до ${rtpSlots}% (Норма 85-90%). Казино работает в убыток.`);
    generatedAdvisorEdits.push({
      key: "betSlots",
      title: `🎰 Нормализация Слотов 777 (Текущий RTP: ${rtpSlots}%)`,
      desc: `Повысить ставку с ${slotBet} до ${targetBet} 🪙 для фиксации целевого возврата 88%.`,
      newVal: targetBet
    });
  }

  // АУДИТ 2: СКРЕТЧ-КАРТЫ (Анализ риска банкротства по тикетам)
  const scrCost = eco.scratchTrio || 30;
  const scrList = chances.scratch || FALLBACK_ODDS_DATABASE.scratch;
  let evScratch = 0;
  scrList.forEach(item => {
    const mult = item.multiplier !== undefined ? item.multiplier : (item.id === "scr_jackpot" ? 10 : item.id === "scr_mid" ? 3 : item.id === "scr_small" ? 1.5 : 0);
    evScratch += (item.chance / 100) * (scrCost * mult);
  });
  const rtpScratch = Math.round((evScratch / scrCost) * 100);

  if (rtpScratch > 90) {
    riskScore += 20;
    const targetTicketCost = Math.ceil(evScratch / 0.80 / 5) * 5;
    breakdownReports.push(`🎟️ Скретч-карты: RTP ${rtpScratch}%. Риск быстрого вымывания монетного фонда.`);
    generatedAdvisorEdits.push({
      key: "scratchTrio",
      title: `🎟️ Баланс билетов Скретч (RTP: ${rtpScratch}%)`,
      desc: `Скорректировать цену билета с ${scrCost} до ${targetTicketCost} 🪙.`,
      newVal: targetTicketCost
    });
  }

  // АУДИТ 3: КЕЙСЫ (Анализ рыночной стоимости дропа против цены открытия)
  const auditCase = (caseKey, costVal, defKey) => {
    const drops = chances[caseKey] || FALLBACK_ODDS_DATABASE[caseKey] || [];
    let expectedDropValue = 0;
    drops.forEach(d => {
      expectedDropValue += (d.chance / 100) * (d.value || 40);
    });
    const caseRtp = Math.round((expectedDropValue / costVal) * 100);
    if (caseRtp > 105) {
      riskScore += 15;
      const targetCaseCost = Math.ceil(expectedDropValue / 0.85 / 10) * 10;
      breakdownReports.push(`📦 Кейс [${caseKey}]: Дроп окупается в среднем на ${caseRtp}% (Сверхдоходность).`);
      generatedAdvisorEdits.push({
        key: defKey,
        title: `📦 Ребаланс цены открытия кейса [${caseKey}]`,
        desc: `Поднять стоимость открытия с ${costVal} до ${targetCaseCost} 🪙.`,
        newVal: targetCaseCost
      });
    }
  };

  auditCase("case_std", eco.caseCostStandard || 80, "caseCostStandard");
  auditCase("case_prem", eco.caseCostPremium || 160, "caseCostPremium");
  auditCase("case_blk", eco.caseCostBlack || 320, "caseCostBlack");

  // АУДИТ 4: БАЛАНС МАКРОЭКОНОМИКИ (Инфляция и доступность еды)
  const minFoodCost = 8; // Чай
  const avgMiniGameReward = ((eco.maxRunner || 25) + (eco.maxTetris || 25) + (eco.maxFishing || 40)) / 3;
  if (avgMiniGameReward > minFoodCost * 5) {
    riskScore += 10;
    breakdownReports.push(`⚠️ Гиперинфляция: За одну мини-игру питомец окупает 5+ приёмов пищи. Ценность ресурсов падает.`);
  }

  // Отображение индикаторов риска
  riskScore = Math.min(100, riskScore);
  const pBadge = document.getElementById("churnRiskPercentBadge");
  if (pBadge) {
    pBadge.innerText = `${riskScore}\% (${riskScore > 50 ? "КРИТИЧЕСКИЙ РИСК" : riskScore > 25 ? "ТРЕБУЕТ ВНИМАНИЯ" : "БАЛАНС СТАБИЛЕН"})`;
    pBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${riskScore > 50 ? "bg-rose-500/30 text-rose-300 border border-rose-500" : riskScore > 25 ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"}`;
  }
  const emEl = document.getElementById("churnRiskEmoji");
  if (emEl) emEl.innerText = riskScore > 50 ? "🚨" : riskScore > 25 ? "⚠️" : "🛡️";

  const detEl = document.getElementById("churnRiskDetails");
  if (detEl) {
    detEl.innerHTML = breakdownReports.length > 0 
      ? breakdownReports.join("<br>") 
      : `Все модули казино сбалансированы: Слоты RTP <b>${rtpSlots}\%</b>, Скретч RTP <b>${rtpScratch}%</b>. Эмиссия под контролем.`;
  }

  const container = document.getElementById("advisorFormList");
  if (!container) return;
  container.innerHTML = "";

  if (generatedAdvisorEdits.length === 0) {
    container.innerHTML = `<div class="text-center text-emerald-400 py-8 font-bold">✨ Экономическая модель и математика казино функционируют идеально!</div>`;
  } else {
    generatedAdvisorEdits.forEach((it, idx) => {
      container.innerHTML += `
        <div class="bg-[#0b0c16] border border-[#2a2d4a] p-3 rounded-2xl flex items-center justify-between gap-3">
          <div>
            <div class="font-bold text-gray-200">${it.title}</div>
            <div class="text-[10px] text-gray-400">${it.desc}</div>
          </div>
          <input type="number" id="advInput_${idx}" value="${it.newVal}" class="w-20 bg-[#181825] border border-indigo-500/50 rounded-xl px-2.5 py-1 text-center font-bold text-amber-300 outline-none">
        </div>
      `;
    });
  }
}

// 5. ПОЛНОЦЕННЫЙ БУХГАЛТЕРСКИЙ УЧЁТ (1C LEDGER) И ПРОВОДКИ
window.setAuditTimeFilter = function(periodKey) {
  currentAuditFilterPeriod = periodKey;
  const activeUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const audit = currentCloudData?.[activeUser]?.audit || [];
  renderAuditLedger(audit);
};

function renderAuditLedger(audit) {
  const box = document.getElementById("auditLogContainer");
  if (!box) return;
  box.innerHTML = "";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOfWeek = now.getTime() - (7 * 86400000);
  const startOfMonth = now.getTime() - (30 * 86400000);

  // Фильтрация проводок по временным границам
  const filtered = audit.filter(entry => {
    if (!entry.timestamp && !entry.time) return true;
    const entryTime = entry.timestamp || Date.parse(entry.date + " " + entry.time) || now.getTime();
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
          <span class="text-base">${a.icon || "📌"}</span>
          <span class="${amountColor} truncate font-medium">${escapeHtml(a.text)}</span>
        </div>
        <div class="flex items-center gap-2 font-mono text-[10px] text-gray-500 whitespace-nowrap">
          <span>${a.date || ""}</span>
          <span>${a.time || ""}</span>
        </div>
      </div>
    `;
  });

  box.innerHTML = summaryHeader + `<div class="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1">${rowsHtml || '<div class="text-center text-gray-500 py-6 text-xs">Проводок за указанный период не обнаружено</div>'}</div>`;
}

/* =========================================================================
 * ГЕНЕРАТОР ПОНЯТНЫХ ЧЕЛОВЕЧЕСКИХ ОТВЕТОВ ДЛЯ КАТИ
 * ========================================================================= */
function generateHumanFixReport(bug) {
  const userText = (bug.text || "").toLowerCase();
  const errorMsg = (bug.techLogs?.lastError?.message || "").toLowerCase();
  const errorFile = bug.techLogs?.lastError?.filename || "";

  let humanTitle = "Инцидент успешно разрешён";
  let humanMessage = "";

  // 1. Ошибки монет и начисления
  if (userText.includes("монет") || errorMsg.includes("coins") || errorMsg.includes("remoteuser")) {
    humanTitle = "Сбой баланса и начисления монет исправлен";
    humanMessage = "Ты поймала очень хитрый баг синхронизации: сервер иногда не успевал подтверждать входящий баланс и замораживал обновление кошелька. Я полностью переписал цепочку сверки данных, добавил надёжный мост и начислил тебе заслуженную компенсацию!";
  }
  // 2. Ошибки интерфейса, кнопок и тапов
  else if (userText.includes("не нажима") || userText.includes("не тыка") || userText.includes("кнопк") || errorMsg.includes("not defined")) {
    humanTitle = "Блокировка нажатия кнопок снята";
    humanMessage = "Проблема была в конфликте событий экрана: слой анимации перехватывал клики раньше времени, из-за чего кнопки переставали реагировать на пальчик. Я освободил все обработчики, убрал наложение слоёв, теперь всё нажимается идеально мягко!";
  }
  // 3. Ошибки загрузки, экранов и сетей
  else if (errorMsg.includes("fetch") || errorMsg.includes("network") || userText.includes("завис") || userText.includes("не груз")) {
    humanTitle = "Связь с сервером восстановлена";
    humanMessage = "Облачный шлюз иногда сбрасывал сетевой пакет при нестабильном сигнале. Я настроил защитный буфер и фоновый повтор отправки, так что больше игра виснуть не будет.";
  }
  // 4. Ошибки игр и рулетки
  else if (userText.includes("рулетк") || userText.includes("игр") || userText.includes("тетрис") || userText.includes("раннер")) {
    humanTitle = "Игровой модуль починен и оптимизирован";
    humanMessage = "В физике мини-игры происходил микро-сбой таймера кадров. Я обновил скрипт, оптимизировал отрисовку и сделал так, чтобы награды падали на счёт мгновенно.";
  }
  // 5. Общий заботливый ответ по умолчанию
  else {
    humanTitle = "Дефект кода локализован и устранён";
    humanMessage = "Спасибо за твою чуткость и внимательность! Я нашёл неточность в коде скрипта, которая вызывала эту заминку, полностью вычистил ошибку и перепроверил логи. Теперь всё летает как часы!";
  }

  // Добавляем к объяснению техническую строку и признание
  const fullDevComment = 
`${humanMessage}

🛠️ Технический вердикт: фикс применён в ${errorFile || "ядре системы"}.
💖 Катя, я тебя очень сильно люблю! Спасибо, что делаешь этот мир лучше! ✦ • ─── 𓆩♡𓆪 ─── • ✦`;

  return { humanTitle, humanMessage: fullDevComment };
}

// 6. КАНБАН ТРЕКЕР БАГОВ
window.renderKanbanBoard = function () {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = currentCloudData?.[targetUser] || {};
  const list = userRecord.feedback || JSON.parse(localStorage.getItem("katya_master_feedback")) || [];

  const colInbox = document.getElementById("colInbox");
  const colInProgress = document.getElementById("colInProgress");
  const colTesting = document.getElementById("colTesting");
  const colDone = document.getElementById("colDone");
  if (!colInbox || !colInProgress || !colTesting || !colDone) return;

  colInbox.innerHTML = "";
  colInProgress.innerHTML = "";
  colTesting.innerHTML = "";
  colDone.innerHTML = "";

  let counts = { inbox: 0, in_progress: 0, testing: 0, done: 0 };

  list.forEach((item) => {
    if (!item.category?.includes("Баг")) return;
    if (!item.id) item.id = "bug_" + (item.date ? Date.parse(item.date) || Date.now() : Date.now());

    const status = item.status || "inbox";
    if (counts[status] !== undefined) counts[status]++;

    const isUnread = item.isRead === false || item.isRead === undefined;
    const timeSpentSec = item.timeSpentSec || 0;
    const timeStr = formatSecondsToHms(timeSpentSec);

    const card = document.createElement("div");
    card.className = `bg-[#18192a] border ${isUnread ? "border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]" : "border-[#2e304f]"} hover:border-pink-500 rounded-2xl p-2.5 flex flex-col gap-1.5 shadow transition cursor-pointer relative active:scale-98`;
    card.onclick = () => window.openBugDetailModal(item.id);

    card.innerHTML = `
      <div class="flex justify-between items-center text-[10px]">
        <div class="flex items-center gap-1.5">
          ${isUnread ? '<span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>' : ''}
          <span class="text-amber-400 font-bold">${"★".repeat(item.rating || 5)}</span>
        </div>
        <span class="text-gray-500 font-mono text-[9px]">${item.date ? item.date.split(",")[1] || item.date : ""}</span>
      </div>

      <p class="text-xs text-gray-200 line-clamp-2 leading-tight font-sans">${escapeHtml(item.text)}</p>

      <div class="flex justify-between items-center text-[10px] text-gray-400 pt-1 border-t border-white/5 mt-0.5">
        <span class="flex items-center gap-1 font-mono text-amber-300">
          <span>⏱️</span> <span>${timeStr}</span>
        </span>
        <div class="flex items-center gap-1">
          ${item.image ? '<span title="Прикреплен скриншот">📷</span>' : ''}
          ${item.techLogs ? '<span title="Есть логи сбоя">🛠️</span>' : ''}
          ${item.status === "done" ? '<span class="text-emerald-400 font-bold">✓ Закрыт</span>' : ''}
        </div>
      </div>
    `;

    if (status === "done") colDone.appendChild(card);
    else if (status === "testing") colTesting.appendChild(card);
    else if (status === "in_progress") colInProgress.appendChild(card);
    else colInbox.appendChild(card);
  });

  document.getElementById("countInbox").innerText = counts.inbox;
  document.getElementById("countInProgress").innerText = counts.in_progress;
  document.getElementById("countTesting").innerText = counts.testing;
  document.getElementById("countDone").innerText = counts.done;

  window.updateDevStats(list);
  window.updateUnreadBadges();
};

window.openBugDetailModal = function (bugId) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = currentCloudData?.[targetUser] || {};
  let list = userRecord.feedback || JSON.parse(localStorage.getItem("katya_master_feedback")) || [];
  
  const bug = list.find(b => b.id === bugId);
  if (!bug) return;

  window.currentOpenBugId = bugId;
  if (bug.isRead !== true) {
    bug.isRead = true;
    saveFeedbackListToCloud(list);
  }

  document.getElementById("detailBugTitle").innerText = `Баг-репорт [ID: ${bug.id}]`;
  document.getElementById("detailBugTimeAgo").innerText = bug.date || "";
  document.getElementById("detailBugRating").innerText = "★".repeat(bug.rating || 5) + ` (${bug.rating || 5}/5)`;
  document.getElementById("detailBugText").innerText = bug.text || "";
  document.getElementById("detailStatusSelect").value = bug.status || "inbox";
  document.getElementById("detailDevReportInput").value = bug.devReport || "";

  const imgBox = document.getElementById("detailBugImageContainer");
  const imgEl = document.getElementById("detailBugImage");
  if (bug.image) {
    imgEl.src = bug.image;
    imgBox.classList.remove("hidden");
    imgEl.onclick = () => window.openFullImage(bug.image);
  } else {
    imgBox.classList.add("hidden");
  }

  const btnLogs = document.getElementById("btnDetailOpenLogs");
  if (bug.techLogs) {
    btnLogs.classList.remove("hidden");
    btnLogs.onclick = () => window.viewTechLogsById(bug.id);
  } else {
    btnLogs.classList.add("hidden");
  }

  document.getElementById("btnDetailAiPrompt").onclick = () => window.copyAiDebugPromptById(bug.id);

  clearInterval(window.activeTimerInterval);
  window.timerRunning = false;
  document.getElementById("btnTimerToggle").innerText = "▶ Старт таймера";
  document.getElementById("btnTimerToggle").className = "py-1.5 px-3 rounded-xl bg-amber-500 text-black font-black text-xs active:scale-95 transition cursor-pointer";
  updateTimerDisplay(bug.timeSpentSec || 0);

  document.getElementById("modalBugDetail")?.classList.remove("hidden");
};

window.saveBugDetailModal = async function () {
  const saveBtn = document.getElementById("btnSaveBugDetail");
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerText = "СОХРАНЕНИЕ... ⏳";
  }

  try {
    const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
    if (!currentCloudData[targetUser]) currentCloudData[targetUser] = {};
    const userRecord = currentCloudData[targetUser];
    let list = userRecord.feedback || JSON.parse(localStorage.getItem("katya_master_feedback")) || [];
    
    const bug = list.find(b => b.id === window.currentOpenBugId);
    if (!bug) {
      document.getElementById("modalBugDetail")?.classList.add("hidden");
      return;
    }

    const newStatus = document.getElementById("detailStatusSelect")?.value || "inbox";
    const devReport = document.getElementById("detailDevReportInput")?.value.trim() || "";

    bug.devReport = devReport;
    bug.status = newStatus;

    if (window.activeTimerInterval) {
      clearInterval(window.activeTimerInterval);
      window.activeTimerInterval = null;
    }
    window.timerRunning = false;

    // Регистрация закрытия бага и начисление бонуса
    if (newStatus === "done" && !bug.rewardGranted) {
      const rewardStr = prompt("Баг закрыт! Сумма компенсации Кате в монетах:", "35");
      if (rewardStr !== null) {
        const coinsAmount = parseInt(rewardStr, 10) || 0;
        bug.rewardGranted = true;
        bug.rewardAmount = coinsAmount;
        bug.resolvedAt = new Date().toLocaleString("ru-RU");

        // Генерируем понятный разбор ошибки
        const generated = generateHumanFixReport(bug);
        const finalReportText = devReport || generated.humanMessage;

        if (!Array.isArray(userRecord.rewardNotifications)) userRecord.rewardNotifications = [];
        userRecord.rewardNotifications.push({
          id: "fix_" + Date.now(),
          bugId: bug.id,
          humanTitle: generated.humanTitle,
          humanMessage: finalReportText,
          devReport: finalReportText,
          coins: coinsAmount,
          date: new Date().toLocaleString("ru-RU"),
          claimed: false
        });

        if (coinsAmount > 0) {
          if (!userRecord.pet) userRecord.pet = {};
          userRecord.pet.coins = (userRecord.pet.coins || 0) + coinsAmount;
        }

        // Проводка в 1C Changelog
        if (!Array.isArray(userRecord.devChangelog)) userRecord.devChangelog = [];
        userRecord.devChangelog.unshift({
          bugId: bug.id,
          title: bug.text.substring(0, 50),
          timeSpentSec: bug.timeSpentSec || 0,
          devReport: devReport,
          resolvedAt: bug.resolvedAt
        });

        // Проводка в аудит
        if (!Array.isArray(userRecord.audit)) userRecord.audit = [];
        userRecord.audit.push({
          text: `[FIX] Закрыт баг #${bug.id} (+${coinsAmount} 🪙 компенсация)`,
          icon: "🛠️",
          date: new Date().toLocaleDateString("ru-RU"),
          time: new Date().toLocaleTimeString("ru-RU"),
          timestamp: Date.now()
        });
      }
    }

    userRecord.feedback = list;
    localStorage.setItem("katya_master_feedback", JSON.stringify(list));
    await saveCloud();

  } catch (err) {
    console.error("Ошибка сохранения задачи:", err);
  } finally {
    document.getElementById("modalBugDetail")?.classList.add("hidden");
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerText = "💾 СОХРАНИТЬ И ПРИМЕНИТЬ";
    }
    window.renderKanbanBoard();
  }
};

// 7. СЛУЖБА TELEGRAM АЛЕРТОВ (БЕЗОПАСНЫЕ СТРОКИ БЕЗ КОНФЛИКТА КАВЫЧЕК)
async function processPendingTelegramAlerts(record) {
  if (!record || !Array.isArray(record.feedback)) return;

  const pendingItems = record.feedback.filter(item => item && item.tgSent === false);
  if (pendingItems.length === 0) return;

  let stateUpdated = false;

  for (const item of pendingItems) {
    const starsStr = "★".repeat(item.rating || 5) + "☆".repeat(5 - (item.rating || 5));
    let techSummary = "";

    if (item.techLogs) {
      if (item.techLogs.lastError) {
        const errFile = item.techLogs.lastError.filename || "app.js";
        const errLine = item.techLogs.lastError.lineno || "?";
        techSummary = "\n\n🚨 *КРИТИЧЕСКИЙ СБОЙ:*\n" + item.techLogs.lastError.message + " (" + errFile + ":" + errLine + ")";
      } else if (Array.isArray(item.techLogs.consoleHistory) && item.techLogs.consoleHistory.length > 0) {
        const lines = item.techLogs.consoleHistory.slice(-3).map(l => "[" + l.time + " " + l.level + "] " + l.msg).join("\n");
        techSummary = "\n\n📋 *Консоль:*\n" + lines;
      }
    }

    const tgMessage = 
"💌 *НОВЫЙ ТИКЕТ ИЗ ТАМАГОЧИ!*\n\n" +
"📌 *Категория:* " + item.category + "\n" +
"⭐ *Оценка:* " + starsStr + "\n" +
"🐱 *Питомец:* " + (item.petName || "Зефирка") + " (Ур. " + (item.petLevel || 1) + ")\n" +
"🪙 *Баланс игрока:* " + (item.coins || 0) + "\n" +
"⏰ *Дата:* " + item.date + "\n\n" +
"💬 *Сообщение:*\n" + item.text + techSummary;

    try {
      if (item.image && item.image.includes(",")) {
        const byteCharacters = atob(item.image.split(",")[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([new Uint8Array(byteNumbers)], { type: "image/jpeg" });
        const formData = new FormData();
        formData.append("chat_id", TELEGRAM_CHAT_ID);
        formData.append("photo", blob, "screenshot.jpg");
        const safeCaption = tgMessage.length > 1020 ? tgMessage.substring(0, 1017) + "..." : tgMessage;
        formData.append("caption", safeCaption);
        formData.append("parse_mode", "Markdown");

        await fetch("https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendPhoto", { method: "POST", body: formData });
      } else {
        await fetch("https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: tgMessage, parse_mode: "Markdown" })
        });
      }

      item.tgSent = true;
      stateUpdated = true;
    } catch (e) {
      console.warn("Telegram Dispatcher network delay:", e);
      break;
    }
  }

  if (stateUpdated) {
    await saveCloud();
  }
}

// 8. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ РЕНДЕРА И ТАЙМЕРОВ
window.renderFeedbackInbox = function () {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = currentCloudData?.[targetUser] || {};
  let list = userRecord.feedback || JSON.parse(localStorage.getItem("katya_master_feedback")) || [];
  const container = document.getElementById("inboxListContainer");
  if (!container) return;

  container.innerHTML = "";
  let nonBugCount = 0;

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
        saveFeedbackListToCloud(list);
        window.renderFeedbackInbox();
      }
    };

    let imgHtml = item.image ? `<img src="${item.image}" alt="Скриншот" onclick="window.openFullImage('${item.image}')" class="max-h-32 rounded-xl mt-1 w-auto object-contain cursor-pointer border border-white/10">` : "";

    card.innerHTML = `
      <div class="flex justify-between items-center text-[10px]">
        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded-lg ${isLove ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'} font-bold">
            ${item.category}
          </span>
          ${isUnread ? '<span class="text-[9px] bg-pink-500 text-white font-bold px-1.5 py-0.2 rounded-full animate-pulse">NEW</span>' : ''}
        </div>
        <span class="text-gray-500 font-mono text-[9px]">${item.date || ""}</span>
      </div>

      <p class="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed select-text font-sans">${escapeHtml(item.text)}</p>${imgHtml}

      <div class="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-white/5">
        <span>🐱 ${item.petName || "Зефирка"} (Ур. ${item.petLevel || 1})</span>
        <span class="text-amber-400">${"★".repeat(item.rating || 5)}</span>
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
  const userRecord = currentCloudData?.[targetUser] || {};
  const list = userRecord.feedback || JSON.parse(localStorage.getItem("katya_master_feedback")) || [];

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

window.toggleBugTimer = function () {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = currentCloudData?.[targetUser] || {};
  let list = userRecord.feedback || [];
  const bug = list.find(b => b.id === window.currentOpenBugId);
  if (!bug) return;

  const btn = document.getElementById("btnTimerToggle");
  if (!window.timerRunning) {
    window.timerRunning = true;
    btn.innerText = "⏸ Пауза";
    btn.className = "py-1.5 px-3 rounded-xl bg-rose-500 text-white font-black text-xs active:scale-95 transition cursor-pointer";
    window.activeTimerInterval = setInterval(() => {
      bug.timeSpentSec = (bug.timeSpentSec || 0) + 1;
      updateTimerDisplay(bug.timeSpentSec);
    }, 1000);
  } else {
    window.timerRunning = false;
    clearInterval(window.activeTimerInterval);
    btn.innerText = "▶ Продолжить";
    btn.className = "py-1.5 px-3 rounded-xl bg-amber-500 text-black font-black text-xs active:scale-95 transition cursor-pointer";
    saveFeedbackListToCloud(list);
  }
};

window.addManualMinutes = function (mins) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = currentCloudData?.[targetUser] || {};
  let list = userRecord.feedback || [];
  const bug = list.find(b => b.id === window.currentOpenBugId);
  if (!bug) return;

  bug.timeSpentSec = (bug.timeSpentSec || 0) + mins * 60;
  updateTimerDisplay(bug.timeSpentSec);
  saveFeedbackListToCloud(list);
};

function updateTimerDisplay(totalSec) {
  const el = document.getElementById("detailTimerDisplay");
  if (el) el.innerText = formatSecondsToHms(totalSec);
}

function formatSecondsToHms(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
}

window.updateDevStats = function (list) {
  if (!Array.isArray(list)) return;
  let totalSec = 0;
  let resolvedCount = 0;

  list.forEach(item => {
    if (item.category?.includes("Баг")) {
      totalSec += (item.timeSpentSec || 0);
      if (item.status === "done") resolvedCount++;
    }
  });

  const totalHours = Math.floor(totalSec / 3600);
  const totalMins = Math.floor((totalSec % 3600) / 60);
  const avgMins = resolvedCount > 0 ? Math.round((totalSec / 60) / resolvedCount) : 0;

  const elTotalTime = document.getElementById("devTotalTimeSpent");
  const elResolved = document.getElementById("devResolvedBugsCount");
  const elAvg = document.getElementById("devAvgFixTime");

  if (elTotalTime) elTotalTime.innerText = `${totalHours} ч ${totalMins} мин`;
  if (elResolved) elResolved.innerText = `${resolvedCount} шт`;
  if (elAvg) elAvg.innerText = `${avgMins} мин`;
};

async function saveFeedbackListToCloud(list) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!currentCloudData[targetUser]) currentCloudData[targetUser] = {};
  currentCloudData[targetUser].feedback = list;
  localStorage.setItem("katya_master_feedback", JSON.stringify(list));
  await saveCloud();
}

async function saveCloud() {
  await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_API_KEY },
    body: JSON.stringify(currentCloudData)
  });
}

function renderEconomyInputs() {
  const food = currentCloudData.customFood || { sushi: 18, pizza: 16, kfc: 16, bento: 15, earl_grey: 8, puer: 10, cheese: 12, chips: 9 };
  const foodBox = document.getElementById("ecoContainer_food");
  if (foodBox) {
    foodBox.innerHTML = "";
    Object.keys(food).forEach((k) => {
      foodBox.innerHTML += `<div><label class="text-gray-400 block mb-1 font-bold">${k}:</label><input type="number" id="ecoFood_${k}" value="${food[k]}" class="w-full bg-[#0b0c16] border border-[#2a2d4a] rounded-xl px-2.5 py-1.5 text-amber-300 font-bold outline-none"></div>`;
    });
  }

  const rew = Object.assign({}, DEFAULT_ECONOMY, currentCloudData.economyConfig || {});
  const casesBox = document.getElementById("ecoContainer_cases");
  if (casesBox) {
    casesBox.innerHTML = `
      <div class="bg-[#0b0c16] p-3 rounded-2xl border border-blue-500/40"><label class="text-blue-300 font-bold block mb-1">📦 Стандартный Кейс:</label><input type="number" id="ecoCase_standard" value="${rew.caseCostStandard}" class="w-full bg-[#181825] border border-[#313244] rounded-xl px-2.5 py-1.5 text-amber-300 font-bold outline-none"></div>
      <div class="bg-[#0b0c16] p-3 rounded-2xl border border-purple-500/40"><label class="text-purple-300 font-bold block mb-1">💜 Премиум Кейс:</label><input type="number" id="ecoCase_premium" value="${rew.caseCostPremium}" class="w-full bg-[#181825] border border-[#313244] rounded-xl px-2.5 py-1.5 text-amber-300 font-bold outline-none"></div>
      <div class="bg-[#0b0c16] p-3 rounded-2xl border border-amber-500/50"><label class="text-amber-300 font-bold block mb-1">👑 ★ Black Box ★:</label><input type="number" id="ecoCase_black" value="${rew.caseCostBlack}" class="w-full bg-[#181825] border border-[#313244] rounded-xl px-2.5 py-1.5 text-amber-300 font-bold outline-none"></div>
      <div class="bg-[#0b0c16] p-3 rounded-2xl border border-orange-500/60"><label class="text-orange-300 font-bold block mb-1">🎃 Хеллоуин Склеп:</label><input type="number" id="ecoCase_halloween" value="${rew.caseCostHalloween}" class="w-full bg-[#181825] border border-[#313244] rounded-xl px-2.5 py-1.5 text-amber-300 font-bold outline-none"></div>
      <div class="bg-[#0b0c16] p-3 rounded-2xl border border-rose-500/40"><label class="text-rose-300 font-bold block mb-1">🚀 Ставка «Мур-Краш»:</label><input type="number" id="ecoBet_crash" value="${rew.betCrash}" class="w-full bg-[#181825] border border-[#313244] rounded-xl px-2.5 py-1.5 text-amber-300 font-bold outline-none"></div>
      <div class="bg-[#0b0c16] p-3 rounded-2xl border border-blue-500/40"><label class="text-blue-300 font-bold block mb-1">🎲 Ставка «Кости»:</label><input type="number" id="ecoBet_dice" value="${rew.betDice}" class="w-full bg-[#181825] border border-[#313244] rounded-xl px-2.5 py-1.5 text-amber-300 font-bold outline-none"></div>
      <div class="bg-[#0b0c16] p-3 rounded-2xl border border-purple-500/40"><label class="text-purple-300 font-bold block mb-1">🍒 Спин «Слоты 777»:</label><input type="number" id="ecoBet_slots" value="${rew.betSlots}" class="w-full bg-[#181825] border border-[#313244] rounded-xl px-2.5 py-1.5 text-amber-300 font-bold outline-none"></div>
      <div class="bg-[#0b0c16] p-3 rounded-2xl border border-pink-500/40"><label class="text-pink-300 font-bold block mb-1">🎟️ Билет «Мур-Трио»:</label><input type="number" id="ecoScratch_trio" value="${rew.scratchTrio}" class="w-full bg-[#181825] border border-[#313244] rounded-xl px-2.5 py-1.5 text-amber-300 font-bold outline-none"></div>
      <div class="bg-[#0b0c16] p-3 rounded-2xl border border-emerald-500/40"><label class="text-emerald-300 font-bold block mb-1">🐟 Билет «Золотая рыбка»:</label><input type="number" id="ecoScratch_fish" value="${rew.scratchFish}" class="w-full bg-[#181825] border border-[#313244] rounded-xl px-2.5 py-1.5 text-amber-300 font-bold outline-none"></div>
      <div class="bg-[#0b0c16] p-3 rounded-2xl border border-amber-400/40"><label class="text-amber-200 font-bold block mb-1">⭐ Билет «Таганрог VIP»:</label><input type="number" id="ecoScratch_vip" value="${rew.scratchVip}" class="w-full bg-[#181825] border border-[#313244] rounded-xl px-2.5 py-1.5 text-amber-300 font-bold outline-none"></div>
    `;
  }

  const rewBox = document.getElementById("ecoContainer_rewards");
  if (rewBox) {
    rewBox.innerHTML = `
      <div><label class="text-gray-400 block mb-1 font-bold">Subway Cat (макс):</label><input type="number" id="ecoRew_runner" value="${rew.maxRunner}" class="w-full bg-[#0b0c16] border border-[#2a2d4a] rounded-xl px-2.5 py-1.5 text-gray-200 font-bold outline-none"></div>
      <div><label class="text-gray-400 block mb-1 font-bold">Тетрис (макс):</label><input type="number" id="ecoRew_tetris" value="${rew.maxTetris}" class="w-full bg-[#0b0c16] border border-[#2a2d4a] rounded-xl px-2.5 py-1.5 text-gray-200 font-bold outline-none"></div>
      <div><label class="text-gray-400 block mb-1 font-bold">Рыбалка (макс):</label><input type="number" id="ecoRew_fishing" value="${rew.maxFishing}" class="w-full bg-[#0b0c16] border border-[#2a2d4a] rounded-xl px-2.5 py-1.5 text-blue-300 font-bold outline-none"></div>
      <div><label class="text-gray-400 block mb-1 font-bold">Мур-Память (макс):</label><input type="number" id="ecoRew_memory" value="${rew.maxMemory}" class="w-full bg-[#0b0c16] border border-[#2a2d4a] rounded-xl px-2.5 py-1.5 text-purple-300 font-bold outline-none"></div>
      <div><label class="text-gray-400 block mb-1 font-bold">Курьер (макс):</label><input type="number" id="ecoRew_catcher" value="${rew.catcher}" class="w-full bg-[#0b0c16] border border-[#2a2d4a] rounded-xl px-2.5 py-1.5 text-gray-200 font-bold outline-none"></div>
      <div><label class="text-gray-400 block mb-1 font-bold">Daily Бонус:</label><input type="number" id="ecoRew_dailyBonus" value="${rew.dailyBonus}" class="w-full bg-[#0b0c16] border border-[#2a2d4a] rounded-xl px-2.5 py-1.5 text-amber-300 font-bold outline-none"></div>
    `;
  }
}

window.switchOddsMode = function (modeKey) {
  currentOddsTab = modeKey;
  document.querySelectorAll(".odds-tab-btn").forEach((b) => {
    b.className = b.dataset.tab === modeKey
      ? "odds-tab-btn px-3 py-1.5 rounded-xl bg-amber-500 text-black font-black whitespace-nowrap transition cursor-pointer"
      : "odds-tab-btn px-3 py-1.5 rounded-xl text-gray-400 hover:text-white whitespace-nowrap transition cursor-pointer";
  });

  const box = document.getElementById("oddsItemsContainer");
  if (!box) return;
  box.innerHTML = "";

  let items = [];
  if (currentCloudData.allChances?.[modeKey] && currentCloudData.allChances[modeKey].length > 0) {
    items = currentCloudData.allChances[modeKey];
  } else if (FALLBACK_ODDS_DATABASE[modeKey]) {
    items = FALLBACK_ODDS_DATABASE[modeKey];
  }

  const refList = FALLBACK_ODDS_DATABASE[modeKey] || [];

  items.forEach((it) => {
    const ref = refList.find(r => r.id === it.id);
    const displayName = it.name || ref?.name || it.id;
    const displayIcon = it.icon || ref?.icon || "🎁";
    const chanceVal = it.chance !== undefined ? it.chance : 0;

    box.innerHTML += `
      <div class="bg-[#0b0c16] border border-[#22243d] p-3 rounded-2xl flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 flex-1 min-w-0">
          <span class="text-2xl">${displayIcon}</span>
          <div class="truncate">
            <div class="font-bold text-gray-200 truncate">${displayName}</div>
            <div class="mono-font text-[10px] text-gray-500">ID: ${it.id}</div>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <input type="number" step="0.5" min="0" max="100" value="${chanceVal}" data-odds-id="${it.id}" class="odds-chance-input w-20 bg-[#181825] border border-[#313244] rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none">
          <span class="text-gray-400 font-bold">%</span>
        </div>
      </div>
    `;
  });

  calcOddsSum();
  document.querySelectorAll(".odds-chance-input").forEach((inp) => inp.addEventListener("input", calcOddsSum));
};

function calcOddsSum() {
  let sum = 0;
  document.querySelectorAll(".odds-chance-input").forEach((i) => (sum += parseFloat(i.value) || 0));
  const sumEl = document.getElementById("oddsSumVal");
  if (sumEl) {
    sumEl.innerText = `${sum.toFixed(1)}%`;
    sumEl.style.color = Math.abs(sum - 100) < 0.2 ? "#34d399" : "#fbbf24";
  }
}

document.getElementById("btnSaveAllChances")?.addEventListener("click", async () => {
  if (!currentCloudData.allChances) currentCloudData.allChances = {};
  const updated = [];
  document.querySelectorAll(".odds-chance-input").forEach((inp) => {
    updated.push({ id: inp.dataset.oddsId, chance: parseFloat(inp.value) || 0 });
  });

  currentCloudData.allChances[currentOddsTab] = updated;

  const sel = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!currentCloudData[sel]) currentCloudData[sel] = {};
  if (!currentCloudData[sel].audit) currentCloudData[sel].audit = [];
  currentCloudData[sel].audit.push({
    text: `[ADMIN] Обновил сетку шансов для «${currentOddsTab}»`,
    icon: "🎲",
    date: new Date().toLocaleDateString("ru-RU"),
    time: new Date().toLocaleTimeString("ru-RU"),
    timestamp: Date.now()
  });

  await saveCloud();
  alert("Конфигурация вероятностей успешно зафиксирована!");
  renderDashboard();
});

document.getElementById("btnApplyAdvisorPackage")?.addEventListener("click", async () => {
  if (!currentCloudData.economyConfig) currentCloudData.economyConfig = Object.assign({}, DEFAULT_ECONOMY);
  generatedAdvisorEdits.forEach((it, idx) => {
    const inp = document.getElementById(`advInput_${idx}`);
    if (inp) currentCloudData.economyConfig[it.key] = parseFloat(inp.value) || it.newVal;
  });

  const sel = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!currentCloudData[sel]) currentCloudData[sel] = {};
  if (!currentCloudData[sel].audit) currentCloudData[sel].audit = [];
  currentCloudData[sel].audit.push({
    text: `[AI-ADVISOR] Применил сбалансированный пакет экономики`,
    icon: "🧠",
    date: new Date().toLocaleDateString("ru-RU"),
    time: new Date().toLocaleTimeString("ru-RU"),
    timestamp: Date.now()
  });

  await saveCloud();
  alert("Пакет ребаланса успешно зафиксирован в облаке!");
  renderDashboard();
});

function renderWishesGrid(wishes) {
  const box = document.getElementById("wishesGrid");
  const count = document.getElementById("badgeWishCount");
  if (count) count.innerText = `${wishes.length} шт`;
  if (!box) return;
  box.innerHTML = "";

  if (wishes.length === 0) {
    box.innerHTML = `<div class="col-span-2 text-center text-xs text-gray-500 py-6">Купоны еще не выбиты ✨</div>`;
    return;
  }

  wishes.slice().reverse().forEach((w, idx) => {
    const isUsed = w.status === "used";
    box.innerHTML += `
      <div class="bg-[#0a0b14] border ${isUsed ? "border-gray-700 opacity-60" : "border-amber-500/40"} rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-lg">
        <div class="flex justify-between items-start">
          <span class="text-2xl">${isUsed ? "✅" : "💌"}</span>
          <span class="mono-font text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">${w.code}</span>
        </div>
        <div>
          <div class="text-xs font-bold text-gray-200">Купон на желание</div>
          <div class="text-[11px] text-gray-400 mt-1">Откуда: <b class="text-pink-300">${w.source || "Игра"}</b></div>
          <div class="text-[10px] text-emerald-400 mt-0.5">Срок: до ${w.expiry}</div>
        </div>
        <div class="text-[10px] text-gray-500 pt-2 border-t border-[#1f2138] flex justify-between items-center">
          <span>Выбит: ${w.date}</span>${isUsed ? '<span class="text-emerald-400 font-bold">Использован ✓</span>' : `<button onclick="toggleWishStatus(${wishes.length - 1 - idx})" class="px-2.5 py-1 rounded-lg bg-pink-500/80 hover:bg-pink-500 text-white font-bold transition">Отметить исп.</button>`}
        </div>
      </div>
    `;
  });
}

window.toggleWishStatus = async function (idx) {
  const sel = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (currentCloudData[sel]?.wishes?.[idx]) {
    currentCloudData[sel].wishes[idx].status = "used";
    await saveCloud();
    renderDashboard();
  }
};

function renderCaseDrops(drops) {
  const box = document.getElementById("caseDropsList");
  const count = document.getElementById("badgeCaseCount");
  if (count) count.innerText = `${drops.length} шт`;
  if (!box) return;
  box.innerHTML = "";
  if (drops.length === 0) {
    box.innerHTML = `<div class="text-center text-xs text-gray-500 py-4">Кейсы еще не открывались</div>`;
    return;
  }
  drops.slice().reverse().forEach((d) => {
    box.innerHTML += `
      <div class="bg-[#0a0b14] border border-[#22243d] p-3 rounded-2xl flex items-center justify-between text-xs">
        <div class="flex items-center gap-2.5"><span class="text-2xl">${d.icon}</span><span class="font-bold text-gray-200">${d.name}</span></div>
        <span class="mono-font text-[10px] text-gray-500">${d.time}</span>
      </div>
    `;
  });
}

function renderRouletteHistory(history) {
  const box = document.getElementById("rouletteHistoryList");
  const count = document.getElementById("badgeRouletteCount");
  if (count) count.innerText = `${history.length} шт`;
  if (!box) return;
  box.innerHTML = "";
  if (history.length === 0) {
    box.innerHTML = `<div class="text-center text-xs text-gray-500 py-4">Рулетка еще не запускалась</div>`;
    return;
  }
  history.slice().reverse().forEach((h) => {
    box.innerHTML += `
      <div class="bg-[#0a0b14] border border-[#22243d] p-2.5 rounded-xl flex items-center justify-between text-xs">
        <span class="font-bold text-gray-200">${h.item}</span>
        <span class="mono-font text-[10px] text-gray-500">${h.time}</span>
      </div>
    `;
  });
}

window.copyAiDebugPromptById = function (bugId) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = currentCloudData?.[targetUser] || {};
  const list = userRecord.feedback || JSON.parse(localStorage.getItem("katya_master_feedback")) || [];
  const item = list.find(b => b.id === bugId);
  if (!item) return;

  const logs = item.techLogs || {};
  let errorBlock = "Ошибок не зафиксировано";
 if (logs.lastError) {
    errorBlock = `Сообщение: ${logs.lastError.message}\nФайл: ${logs.lastError.filename || "неизвестно"}\nСтрока: ${logs.lastError.lineno || "?"}\nСтек:\n${logs.lastError.stack || ""}`;
  }

  let consoleBlock = "Пусто";
  if (Array.isArray(logs.consoleHistory) && logs.consoleHistory.length > 0) {
    consoleBlock = logs.consoleHistory.map(l => `[${l.time} ${l.level}]${l.msg}`).join("\n");
  }

const promptText = 
`Привет! В моем проекте Тамагочи обнаружен баг. Помоги проанализировать и написать готовое решение.

### Контекст:
- Категория: ${item.category || "Баг"}
- Состояние: ${item.petName || "Зефирка"}, уровень ${item.petLevel ? item.petLevel : 1}, баланс: ${item.coins || 0} 🪙
- Экран: ${logs.screen || "Неизвестно"}
- Описание: "${item.text || ""}"

### Ошибка:
\`\`\`
${errorBlock}
\`\`\`

### Консоль:
\`\`\`
${consoleBlock}
\`\`\``;

  navigator.clipboard.writeText(promptText).then(() => {
    alert("🤖 Промт скопирован в буфер обмена!");
  }).catch(() => {
    prompt("Скопируй промт:", promptText);
  });
};

window.viewTechLogsById = function (bugId) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = currentCloudData?.[targetUser] || {};
  const list = userRecord.feedback || JSON.parse(localStorage.getItem("katya_master_feedback")) || [];
  const item = list.find(b => b.id === bugId);
  if (!item || !item.techLogs) return;

  const logs = item.techLogs;
  const content = document.getElementById("techLogsContent");
  if (!content) return;

  let html = `
    <div class="p-2 rounded-xl bg-[#141526] border border-[#2e304f] space-y-1">
      <div><b>User-Agent:</b> <span class="text-gray-400">${escapeHtml(logs.userAgent || "N/A")}</span></div>
      <div><b>Экран:</b> <span class="text-amber-300">${logs.screen || "N/A"}</span></div>
    </div>
  `;

  if (logs.lastError) {
    html += `
      <div class="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300">
        <div class="font-bold flex items-center gap-1.5 text-rose-400">🚨 Критический сбой скрипта:</div>
        <div class="mt-1">${escapeHtml(logs.lastError.message)}</div>
        <div class="text-[10px] text-gray-400 mt-0.5">Файл: <b>${logs.lastError.filename}</b>, строка: <b>${logs.lastError.lineno}</b></div>
        ${logs.lastError.stack ? `<pre class="mt-1 text-[9px] text-rose-200/70 overflow-x-auto whitespace-pre-wrap">${escapeHtml(logs.lastError.stack)}</pre>` : ""}
      </div>
    `;
  }

  if (Array.isArray(logs.consoleHistory) && logs.consoleHistory.length > 0) {
    html += `<div class="font-bold text-gray-400 pt-1">Хронология консоли (${logs.consoleHistory.length}):</div>`;
    logs.consoleHistory.forEach(l => {
      const color = l.level === "ERROR" || l.level === "FATAL" ? "text-rose-400" : "text-amber-400";
      html += `
        <div class="text-[11px] p-1.5 rounded-lg bg-[#0e0f1a] border border-white/5 flex gap-2">
          <span class="text-gray-500 font-bold">${l.time}</span>
          <span class="${color} font-bold">[${l.level}]</span>
          <span class="text-gray-300 truncate">${escapeHtml(l.msg)}</span>
        </div>
      `;
    });
  }

  content.innerHTML = html;
  document.getElementById("modalTechLogsViewer")?.classList.remove("hidden");
};

window.openFullImage = function (src) {
  window.open(src, "_blank");
};

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 9. ИНИЦИАЛИЗАЦИЯ
checkAuth();