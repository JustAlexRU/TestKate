/* =========================================================================
 * LEX LABS ENTERPRISE: MISSION CONTROL DASHBOARD ENGINE
 * Файл: dashboard.js
 * ========================================================================= */

const DASHBOARD_PIN = "1703";
const SESSION_AUTH_KEY = "lex_dashboard_auth_token";
const SESSION_OPERATOR_KEY = "lex_dashboard_operator";

const JSONBIN_BIN_ID = "6acb3d30ac6210605a272eb6";
const JSONBIN_API_KEY = "$2a$10$JBnAcYGGmJL6Q5lDn45nHeW4jsBStn1Z/4XRrRormnfaKG7YbqUN2";

let currentCloudData = {};
let countdownSec = 60;
let currentMainTab = "overview";
let currentOddsTab = "case_std";
let currentEcoShopSlot = "body";

window.currentOpenBugIndex = null;
window.activeTimerInterval = null;
window.timerRunning = false;

// Дефолтные ставки и цены
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

// 1. АВТОРИЗАЦИЯ
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
    if (currentOperatorLabel) currentOperatorLabel.innerText = sessionStorage.getItem(SESSION_OPERATOR_KEY) || "Алексей";
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
    const opName = employeeSelect.options[employeeSelect.selectedIndex].text.split(" ")[0];
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

// 2. ПЕРЕКЛЮЧЕНИЕ ГЛАВНЫХ ВКЛАДОК ДАШБОРДА
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

// 3. ПОДВКЛАДКИ ЭКОНОМИКИ
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
    const cloud = await res.json();
    currentCloudData = cloud.record || {};

    const sel = document.getElementById("targetPlayerSelect");
    const currentUser = sel ? sel.value : "katya";
    if (sel) {
      sel.innerHTML = "";
      const skip = ["economyConfig", "customFood", "customShop", "customRewards", "customCases", "wishChances", "caseSettings", "allChances"];
      Object.keys(currentCloudData).forEach((k) => {
        if (!skip.includes(k)) {
          const opt = document.createElement("option");
          opt.value = k;
          opt.innerText = k === "katya" ? "Катя (Таганрог)" : `Игрок: ${k}`;
          if (k === currentUser) opt.selected = true;
          sel.appendChild(opt);
        }
      });
      if (!sel.value && currentCloudData.katya) sel.value = "katya";
    }

    const activeUser = sel ? sel.value : "katya";
    const record = currentCloudData[activeUser] || {};
    const pet = record.pet || {};
    const analytics = record.analytics || {};
    const wishes = record.wishes || [];
    const caseDrops = record.caseHistory || [];
    const rouletteHistory = record.rouletteHistory || [];
    const audit = record.audit || [];

    // KPI & Заголовок
    document.getElementById("dashLastSyncTime").innerText = record.lastActive || "Еще нет данных";
    document.getElementById("kpiTotalTime").innerText = `${Math.round((analytics.totalSecondsPlayed || 0) / 60)} м`;
    document.getElementById("kpiSessions").innerText = analytics.sessionsCount || 0;
    document.getElementById("kpiSpentCoins").innerText = `${analytics.spentCoins || 0} 🪙`;
    document.getElementById("kpiCasesOpened").innerText = analytics.casesOpened || 0;

    // Питомец
    document.getElementById("editPetName").value = pet.name || "";
    document.getElementById("editPetCoins").value = pet.coins || 0;
    document.getElementById("editPetLevel").value = pet.level || 1;
    document.getElementById("editPetXp").value = pet.xp || 0;
    document.getElementById("editPetHunger").value = pet.hunger || 0;
    document.getElementById("editPetHappy").value = pet.happy || 0;
    document.getElementById("editPetEnergy").value = pet.energy || 0;
    document.getElementById("editPetClean").value = pet.clean || 0;

    // Рендер разделов
    renderEconomyInputs();
    switchOddsMode(currentOddsTab);
    renderWishesGrid(wishes);
    renderCaseDrops(caseDrops);
    renderRouletteHistory(rouletteHistory);
    renderAudit(audit);
    calculateChurnAndGenerateAdvisor(pet, analytics, audit, wishes);
    
    // Обновляем бейджи и Канбан
    window.updateUnreadBadges();
    if (currentMainTab === "kanban") window.renderKanbanBoard();
    if (currentMainTab === "inbox") window.renderFeedbackInbox();
  } catch (e) {
    console.error("Dashboard error:", e);
  }
}

// 5. РЕНДЕР ЭКОНОМИКИ
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

  filterShopInputs(currentEcoShopSlot);
}

window.filterShopInputs = function (slot) {
  currentEcoShopSlot = slot;
  const grid = document.getElementById("shopInputsGrid");
  if (!grid || !window.GAME_ITEMS_DB?.[slot]) return;
  grid.innerHTML = "";

  const savedShop = currentCloudData.customShop || {};
  window.GAME_ITEMS_DB[slot].forEach((it) => {
    if (it.id === "none") return;
    const price = savedShop[it.id] !== undefined ? savedShop[it.id] : it.cost;
    grid.innerHTML += `
      <div class="bg-[#0b0c16] p-2.5 rounded-xl border border-[#22243d] flex items-center justify-between gap-2">
        <span class="text-xl">${it.icon}</span>
        <div class="truncate flex-1">
          <div class="font-bold text-gray-300 truncate">${it.name}</div>
          <div class="text-[9px] text-gray-500">${it.source === "case" ? "📦 Из кейса" : "Магазин"}</div>
        </div>
        <input type="number" data-shop-id="${it.id}" value="${price}" class="shop-price-input w-16 bg-[#181825] border border-[#313244] rounded px-1.5 py-1 text-center font-bold text-pink-300 outline-none">
      </div>
    `;
  });
};

document.getElementById("btnSaveFullEconomy")?.addEventListener("click", async () => {
  const foodKeys = ["sushi", "pizza", "kfc", "bento", "earl_grey", "puer", "cheese", "chips"];
  const newFood = {};
  foodKeys.forEach((k) => (newFood[k] = parseInt(document.getElementById(`ecoFood_${k}`)?.value, 10) || 10));

  const newShop = Object.assign({}, currentCloudData.customShop || {});
  document.querySelectorAll(".shop-price-input").forEach((inp) => {
    newShop[inp.dataset.shopId] = parseInt(inp.value, 10) || 0;
  });

  currentCloudData.customFood = newFood;
  currentCloudData.customShop = newShop;
  currentCloudData.economyConfig = {
    caseCostStandard: parseInt(document.getElementById("ecoCase_standard")?.value, 10) || 80,
    caseCostPremium: parseInt(document.getElementById("ecoCase_premium")?.value, 10) || 160,
    caseCostBlack: parseInt(document.getElementById("ecoCase_black")?.value, 10) || 320,
    caseCostHalloween: parseInt(document.getElementById("ecoCase_halloween")?.value, 10) || 130,
    betCrash: parseInt(document.getElementById("ecoBet_crash")?.value, 10) || 25,
    betDice: parseInt(document.getElementById("ecoBet_dice")?.value, 10) || 15,
    betSlots: parseInt(document.getElementById("ecoBet_slots")?.value, 10) || 20,
    scratchTrio: parseInt(document.getElementById("ecoScratch_trio")?.value, 10) || 30,
    scratchFish: parseInt(document.getElementById("ecoScratch_fish")?.value, 10) || 75,
    scratchVip: parseInt(document.getElementById("ecoScratch_vip")?.value, 10) || 150,
    maxRunner: parseInt(document.getElementById("ecoRew_runner")?.value, 10) || 25,
    maxTetris: parseInt(document.getElementById("ecoRew_tetris")?.value, 10) || 25,
    maxFishing: parseInt(document.getElementById("ecoRew_fishing")?.value, 10) || 40,
    maxMemory: parseInt(document.getElementById("ecoRew_memory")?.value, 10) || 30,
    catcher: parseInt(document.getElementById("ecoRew_catcher")?.value, 10) || 16,
    dailyBonus: parseInt(document.getElementById("ecoRew_dailyBonus")?.value, 10) || 15
  };

  const sel = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!currentCloudData[sel]) currentCloudData[sel] = {};
  if (!currentCloudData[sel].audit) currentCloudData[sel].audit = [];
  currentCloudData[sel].audit.push({ text: `[ADMIN] Обновил все цены и ставки в экономике`, icon: "🪙", time: new Date().toLocaleTimeString("ru-RU") });

  await saveCloud();
  alert("Вся экономика успешно сохранена в облако!");
  renderDashboard();
});

// 6. НАСТРОЙКА ШАНСОВ ДРОПА
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
  if (currentCloudData.allChances?.[modeKey]) {
    items = currentCloudData.allChances[modeKey];
  } else if (modeKey === "case_hw") {
    items = window.HALLOWEEN_CASE_CONFIG?.drops || [];
  } else {
    items = window.DEFAULT_ODDS_DATABASE?.[modeKey] || [];
  }

  items.forEach((it) => {
    box.innerHTML += `
      <div class="bg-[#0b0c16] border border-[#22243d] p-3 rounded-2xl flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 flex-1 min-w-0">
          <span class="text-2xl">${it.icon}</span>
          <div class="truncate">
            <div class="font-bold text-gray-200 truncate">${it.name}</div>
            <div class="mono-font text-[10px] text-gray-500">ID: ${it.id}</div>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <input type="number" step="0.5" min="0" max="100" value="${it.chance}" data-odds-id="${it.id}" class="odds-chance-input w-20 bg-[#181825] border border-[#313244] rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none">
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
  currentCloudData[sel].audit.push({ text: `[ADMIN] Обновил шансы для «${currentOddsTab}»`, icon: "🎲", time: new Date().toLocaleTimeString("ru-RU") });

  await saveCloud();
  alert("Шансы успешно сохранены!");
  renderDashboard();
});

// 7. СОХРАНЕНИЕ ПИТОМЦА И КУПОНЫ
document.getElementById("btnSavePetEdits")?.addEventListener("click", async () => {
  const sel = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!currentCloudData[sel]) currentCloudData[sel] = {};
  if (!currentCloudData[sel].pet) currentCloudData[sel].pet = {};

  const p = currentCloudData[sel].pet;
  p.name = document.getElementById("editPetName").value.trim();
  p.coins = parseInt(document.getElementById("editPetCoins").value, 10) || 0;
  p.level = parseInt(document.getElementById("editPetLevel").value, 10) || 1;
  p.xp = parseInt(document.getElementById("editPetXp").value, 10) || 0;
  p.hunger = parseInt(document.getElementById("editPetHunger").value, 10) || 0;
  p.happy = parseInt(document.getElementById("editPetHappy").value, 10) || 0;
  p.energy = parseInt(document.getElementById("editPetEnergy").value, 10) || 0;
  p.clean = parseInt(document.getElementById("editPetClean").value, 10) || 0;

  if (!currentCloudData[sel].audit) currentCloudData[sel].audit = [];
  currentCloudData[sel].audit.push({ text: `[ADMIN] Скорректировал параметры котика`, icon: "⚙️", time: new Date().toLocaleTimeString("ru-RU") });

  await saveCloud();
  alert("Параметры котика сохранены!");
  renderDashboard();
});

document.getElementById("btnGrantCustomWish")?.addEventListener("click", async () => {
  const wishTitle = prompt("Введи название или повод для желания:", "Особое желание от Алексея");
  if (!wishTitle) return;

  const sel = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!currentCloudData[sel]) currentCloudData[sel] = {};
  if (!currentCloudData[sel].wishes) currentCloudData[sel].wishes = [];

  const code = "#WISH-" + Math.floor(10000 + Math.random() * 90000);
  const expDate = new Date();
  expDate.setMonth(expDate.getMonth() + 3);

  currentCloudData[sel].wishes.push({
    code: code,
    source: wishTitle,
    date: new Date().toLocaleDateString("ru-RU"),
    expiry: expDate.toLocaleDateString("ru-RU"),
    status: "active"
  });

  if (!currentCloudData[sel].audit) currentCloudData[sel].audit = [];
  currentCloudData[sel].audit.push({ text: `[ADMIN] Вручную подарил купон [${code}]: «${wishTitle}»`, icon: "💌", time: new Date().toLocaleTimeString("ru-RU") });

  await saveCloud();
  alert(`Купон [${code}] успешно выдан игроку!`);
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
          <span>Выбит: ${w.date}</span>
          ${isUsed ? '<span class="text-emerald-400 font-bold">Использован ✓</span>' : `<button onclick="toggleWishStatus(${wishes.length - 1 - idx})" class="px-2.5 py-1 rounded-lg bg-pink-500/80 hover:bg-pink-500 text-white font-bold transition">Отметить исп.</button>`}
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

// 8. ДРОПЫ, РУЛЕТКА И АУДИТ
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

function renderAudit(audit) {
  const box = document.getElementById("auditLogContainer");
  if (!box) return;
  box.innerHTML = "";

  audit.slice().reverse().slice(0, 100).forEach((a) => {
    box.innerHTML += `
      <div class="bg-[#0a0b14]/70 px-3 py-1.5 rounded-lg border border-[#191b30] flex items-center justify-between text-gray-300">
        <span class="flex items-center gap-2"><span>${a.icon || "📌"}</span><span>${a.text}</span></span>
        <span class="text-[10px] text-gray-500">${a.time}</span>
      </div>
    `;
  });
}

// 9. ИИ-СОВЕТНИК
let generatedAdvisorEdits = [];

function calculateChurnAndGenerateAdvisor(pet, analytics, audit, wishes = []) {
  const eco = Object.assign({}, DEFAULT_ECONOMY, currentCloudData.economyConfig || {});
  const chances = currentCloudData.allChances || {};

  let risk = 10;
  let reasons = [];
  generatedAdvisorEdits = [];

  const slotBet = eco.betSlots || 20;
  const slotsOdds = chances.slots || [];
  const pStar = slotsOdds.find((x) => x.id === "slot_star")?.chance || 1;
  const pCrown = slotsOdds.find((x) => x.id === "slot_crown")?.chance || 3;
  const pCoins = slotsOdds.find((x) => x.id === "slot_coins")?.chance || 6;
  const pSushi = slotsOdds.find((x) => x.id === "slot_sushi")?.chance || 10;

  const evSlots = (pStar * 300 + pCrown * 150 + pCoins * 80 + pSushi * 50) / 100;
  const rtpSlots = Math.round((evSlots / slotBet) * 100);

  if (rtpSlots > 100) {
    risk += 25;
    reasons.push(`Эксплойт в Слотах 777 (RTP = ${rtpSlots}% > 100%). Казино в минусе.`);
    const targetSlotBet = Math.ceil(evSlots / 0.88 / 5) * 5;
    generatedAdvisorEdits.push({
      type: "economy",
      key: "betSlots",
      title: `🎰 Сбалансировать ставку Слотов 777 (RTP: ${rtpSlots}%)`,
      desc: `Поднимите ставку с ${slotBet} до ${targetSlotBet} 🪙 для возврата RTP к 88%.`,
      oldVal: slotBet,
      newVal: targetSlotBet,
      unit: "🪙"
    });
  }

  generatedAdvisorEdits = generatedAdvisorEdits.filter((it) => Math.abs(Number(it.oldVal) - Number(it.newVal)) > 0.05);

  if (generatedAdvisorEdits.length === 0) {
    reasons = [];
    risk = 10;
  }

  const pBadge = document.getElementById("churnRiskPercentBadge");
  if (pBadge) {
    pBadge.innerText = `${risk}% (${risk > 50 ? "ВЫСОКИЙ РИСК" : risk > 25 ? "Умеренный" : "Оптимально"})`;
    pBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${risk > 50 ? "bg-rose-500/30 text-rose-300 border border-rose-500" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"}`;
  }
  const emEl = document.getElementById("churnRiskEmoji");
  if (emEl) emEl.innerText = risk > 50 ? "🚨" : "✅";
  const detEl = document.getElementById("churnRiskDetails");
  if (detEl) detEl.innerHTML = reasons.length > 0 ? reasons.join("<br>") : `RTP сбалансирован: Слоты <b>${rtpSlots}%</b>. Баланс стабилен.`;

  const container = document.getElementById("advisorFormList");
  if (!container) return;
  container.innerHTML = "";

  if (generatedAdvisorEdits.length === 0) {
    container.innerHTML = `<div class="text-center text-gray-400 py-8 font-bold text-emerald-400">✨ Экономика казино идеально сбалансирована! Правки не требуются.</div>`;
  } else {
    generatedAdvisorEdits.forEach((it, idx) => {
      container.innerHTML += `
        <div class="bg-[#0b0c16] border border-[#2a2d4a] p-3 rounded-2xl flex items-center justify-between gap-3">
          <div><div class="font-bold text-gray-200">${it.title}</div><div class="text-[10px] text-gray-400">${it.desc}</div></div>
          <input type="number" id="advInput_${idx}" value="${it.newVal}" class="w-20 bg-[#181825] border border-indigo-500/50 rounded-xl px-2.5 py-1 text-center font-bold text-amber-300 outline-none">
        </div>
      `;
    });
  }
}

document.getElementById("btnApplyAdvisorPackage")?.addEventListener("click", async () => {
  if (!currentCloudData.economyConfig) currentCloudData.economyConfig = Object.assign({}, DEFAULT_ECONOMY);
  generatedAdvisorEdits.forEach((it, idx) => {
    const inp = document.getElementById(`advInput_${idx}`);
    if (inp) currentCloudData.economyConfig[it.key] = parseFloat(inp.value) || it.newVal;
  });
  await saveCloud();
  alert("Пакет ИИ успешно применен в облако!");
  renderDashboard();
});

async function saveCloud() {
  await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_API_KEY },
    body: JSON.stringify(currentCloudData)
  });
}

// 10. КАНБАН БАГОВ, ТАЙМЕРЫ И СТАТИСТИКА
window.currentOpenBugId = null; // Привязываемся строго к ID задачи!

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

    // Гарантируем наличие уникального id
    if (!item.id) item.id = "bug_" + Math.random().toString(36).substring(2, 9);

    const status = item.status || "inbox";
    if (counts[status] !== undefined) counts[status]++;

    const isUnread = item.isRead === false || item.isRead === undefined;
    const timeSpentSec = item.timeSpentSec || 0;
    const timeStr = formatSecondsToHms(timeSpentSec);

    const card = document.createElement("div");
    card.className = `bg-[#18192a] border ${isUnread ? "border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]" : "border-[#2e304f]"} hover:border-pink-500 rounded-2xl p-2.5 flex flex-col gap-1.5 shadow transition cursor-pointer relative active:scale-98`;
    
    // Клик по карточке открывает модалку строго по ID
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
  
  // Ищем задачу по ID
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

// СОХРАНЕНИЕ СТАТУСА В БАЗУ ДАННЫХ
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
    
    // Получаем список задач строго из актуального объекта облака
    let list = userRecord.feedback || JSON.parse(localStorage.getItem("katya_master_feedback")) || [];
    
    const bug = list.find(b => b.id === window.currentOpenBugId);
    if (!bug) {
      document.getElementById("modalBugDetail")?.classList.add("hidden");
      return;
    }

    const newStatus = document.getElementById("detailStatusSelect")?.value || "inbox";
    const devReport = document.getElementById("detailDevReportInput")?.value.trim() || "";

    bug.devReport = devReport;
    bug.status = newStatus; // <--- ПРИНУДИТЕЛЬНО УСТАНАВЛИВАЕМ СТАТУС

    if (window.activeTimerInterval) {
      clearInterval(window.activeTimerInterval);
      window.activeTimerInterval = null;
    }
    window.timerRunning = false;

    // Если задачу закрыли в done
    if (newStatus === "done" && !bug.rewardGranted) {
      const rewardStr = prompt("Баг закрыт! Сколько монет начислить Кате в благодарность?", "35");
      
      if (rewardStr !== null) {
        const coinsAmount = parseInt(rewardStr, 10) || 0;
        bug.rewardGranted = true;
        bug.rewardAmount = coinsAmount;
        bug.resolvedAt = new Date().toLocaleString("ru-RU");

        if (!Array.isArray(userRecord.rewardNotifications)) {
          userRecord.rewardNotifications = [];
        }

        userRecord.rewardNotifications.push({
          id: "thanks_" + Date.now(),
          coins: coinsAmount,
          date: new Date().toLocaleString("ru-RU"),
          claimed: false
        });

        if (coinsAmount > 0) {
          if (!userRecord.pet) userRecord.pet = {};
          userRecord.pet.coins = (userRecord.pet.coins || 0) + coinsAmount;
        }

        if (!Array.isArray(userRecord.devChangelog)) {
          userRecord.devChangelog = [];
        }
        userRecord.devChangelog.unshift({
          bugId: bug.id,
          title: bug.text.substring(0, 50),
          timeSpentSec: bug.timeSpentSec || 0,
          devReport: devReport,
          resolvedAt: bug.resolvedAt
        });
      }
    }

    // Сохраняем в память и пишем напрямую в облако
    userRecord.feedback = list;
    localStorage.setItem("katya_master_feedback", JSON.stringify(list));
    
    // Делаем прямой PUT-запрос в JSONBin и ждем ответа сервера
    await saveCloud();

  } catch (err) {
    console.error("Ошибка при сохранении бага:", err);
    alert("Ошибка сети при сохранении в облако: " + err.message);
  } finally {
    document.getElementById("modalBugDetail")?.classList.add("hidden");
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerText = "💾 СОХРАНИТЬ И ПРИМЕНИТЬ";
    }
    window.renderKanbanBoard();
  }
};

// 11. ПЕРВИЧНЫЙ ЗАПУСК
checkAuth();