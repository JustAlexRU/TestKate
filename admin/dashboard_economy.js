/**
 * @fileoverview LEX LABS ENTERPRISE: ECONOMY, ODDS & AI ADVISOR MODULE
 * @module admin/dashboard_economy
 * 
 * @description
 * Зона ответственности (Single Responsibility):
 * Макроэкономический баланс, аудит RTP (Return to Player) для казино и кейсов,
 * настройка цен/ставок/наград, валидация суммы вероятностей (<=100%),
 * вишлист реальных подарков и рекомендации AI-Советника.
 *
 * @exports
 * - window.currentOddsTab — активный режим настройки шансов (слоты, кейсы, рулетка)
 * - window.switchOddsMode(mode) — переключение вкладок в редакторе вероятностей
 * - window.calcOddsSum() — динамический подсчет суммы вероятностей дропов
 * - window.saveAllChances() — сохранение вероятностей с проверкой суммы <= 100%
 * - window.renderEconomyInputs() — отрисовка полей изменения цен и ставок
 * - window.saveEconomyConfig() — сохранение измененных макропараметров в Cloud
 * - window.renderWishesGrid(wishes) — отображение сетки желаний игрока
 * - window.toggleWishStatus(idx) — переключение статуса исполнения желания
 * - window.applyAiAutoFix(fixId) — точечное применение рекомендации AI-Советника
 * - window.applyAllAiFixes() — пакетное применение всех рекомендаций балансировки
 * - window.runComprehensiveAiEconomyAudit(pet, analytics, audit) — расчет метрик RTP и рисков
 * - window.saveIrlBudgetConfig() — сохранение месячного лимита реальных рублей
 * - window.lowerWishChancesInCloud() — экстренная заморозка дропа купонов желаний
 */

const DEFAULT_IRL_BUDGET_CONFIG = {
  monthlyBudgetRub: 5000,
  wishCostEstimates: {
    small: 400,
    medium: 1200,
    epic: 2500,
    default: 700
  }
};

const ECONOMY_CAPS = {
  betSlots: { min: 10, max: 50, targetRtp: 88, rtpMin: 84, rtpMax: 92 },
  betCrash: { min: 5, max: 30, targetRtp: 88, rtpMin: 84, rtpMax: 92 },
  betDice: { min: 5, max: 25, targetRtp: 88, rtpMin: 84, rtpMax: 92 },
  scratchTrio: { min: 15, max: 60, targetRtp: 88, rtpMin: 84, rtpMax: 92 },
  caseCostStandard: { min: 50, max: 120, targetRtp: 78, rtpMin: 75, rtpMax: 82 },
  caseCostPremium: { min: 120, max: 250, targetRtp: 78, rtpMin: 75, rtpMax: 82 },
  caseCostBlack: { min: 250, max: 500, targetRtp: 78, rtpMin: 75, rtpMax: 82 },
  food: { min: 5, max: 25, normMin: 8, normMax: 20 }
};

window.DEFAULT_IRL_BUDGET_CONFIG = DEFAULT_IRL_BUDGET_CONFIG;
window.ECONOMY_CAPS = ECONOMY_CAPS;

function estimateWishRubCost(wish, estimates) {
  const est = estimates || DEFAULT_IRL_BUDGET_CONFIG.wishCostEstimates;
  if (!wish) return est.default || 700;
  if (wish.rubCost && typeof wish.rubCost === "number") return wish.rubCost;

  const text = `${wish.title || ""} ${wish.name || ""} ${wish.desc || ""} ${wish.category || ""}`.toLowerCase();
  
  if (text.includes("бокс") || text.includes("подарок") || text.includes("свидание") || text.includes("эпик") || text.includes("супер")) {
    return est.epic || 2500;
  }
  if (text.includes("суши") || text.includes("кино") || text.includes("доставка") || text.includes("пицца") || text.includes("торт") || text.includes("ужин") || text.includes("кавер") || text.includes("трек")) {
    return est.medium || 1200;
  }
  if (text.includes("кофе") || text.includes("десерт") || text.includes("вкусняшка") || text.includes("прогулк") || text.includes("чай") || text.includes("сладост")) {
    return est.small || 400;
  }
  return est.default || 700;
}
window.estimateWishRubCost = estimateWishRubCost;

function calculateBoundedAdjustment(currentVal, idealVal, minCap, maxCap, maxStepPercent = 0.15) {
  const diff = idealVal - currentVal;
  const maxStep = currentVal * maxStepPercent;
  const clampedStep = Math.max(-maxStep, Math.min(maxStep, diff));
  let newVal = Math.round(currentVal + clampedStep);
  newVal = Math.max(minCap, Math.min(maxCap, newVal));
  return newVal;
}

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

const FALLBACK_ODDS_DATABASE = {
  case_std: [
    { id: "std_coins_20", name: "20 🪙 в копилку", icon: "🪙", chance: 45, value: 20 },
    { id: "std_food", name: "Сытный кошачий обед", icon: "🍱", chance: 35, value: 30 },
    { id: "std_scarf", name: "Теплый синий шарф", icon: "🧣", chance: 15, value: 120 },
    { id: "std_gold", name: "Мешочек 60 🪙", icon: "💰", chance: 5, value: 60 }
  ],
  case_prem: [
    { id: "prem_coffee", name: "Сладкий кофе в Таганрог", icon: "☕", chance: 12, value: 180 },
    { id: "prem_hoodie", name: "Розовое оверсайз-худи", icon: "👗", chance: 25, value: 250 },
    { id: "prem_cinema", name: "Уютный Киновечер онлайн", icon: "🎬", chance: 20, value: 150 },
    { id: "prem_song", name: "Кавер/Трек от Алексея", icon: "🎵", chance: 23, value: 200 },
    { id: "prem_coins", name: "Мешок золота: 80 🪙", icon: "💰", chance: 20, value: 80 }
  ],
  case_blk: [
    { id: "blk_super_box", name: "★ СЕКРЕТНЫЙ БОКС В ТАГАНРОГ ★", icon: "⭐", chance: 5, value: 1500 },
    { id: "blk_wish_coupon", name: "💌 СЕКРЕТНЫЙ КУПОН НА ЖЕЛАНИЕ", icon: "💌", chance: 10, value: 800 },
    { id: "blk_argument", name: "Иммунитет в споре (Правота)", icon: "🛡️", chance: 30, value: 350 },
    { id: "blk_coffee_dessert", name: "Кофе + Бенто-торт в Таганрог", icon: "🍰", chance: 25, value: 450 },
    { id: "blk_gold_back", name: "Мега-сокровищница 150 🪙", icon: "💰", chance: 30, value: 150 }
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

window.DEFAULT_ECONOMY = DEFAULT_ECONOMY;
window.FALLBACK_ODDS_DATABASE = FALLBACK_ODDS_DATABASE;

let currentOddsTab = "case_std";
window.currentOddsTab = currentOddsTab;

window.switchEcoSubTab = function (subId) {
  ["food", "shop", "cases", "rewards"].forEach((k) => {
    const el = document.getElementById(`ecoContainer_${k}`);
    if (el) {
      el.classList.add("hidden");
      el.classList.remove("grid", "flex");
    }
    const b = document.getElementById(`ecoSub_${k}`);
    if (b) {
      b.className = "eco-sub-btn px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 border border-transparent whitespace-nowrap transition cursor-pointer";
    }
  });

  const targetBox = document.getElementById(`ecoContainer_${subId}`);
  if (targetBox) {
    targetBox.classList.remove("hidden");
    targetBox.classList.add("grid");
  }

  const actBtn = document.getElementById(`ecoSub_${subId}`);
  if (actBtn) {
    actBtn.className = "eco-sub-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white border border-white/15 shadow-sm whitespace-nowrap transition cursor-pointer";
  }

  // Принудительно гарантируем отрисовку полей, предотвращая пустые вкладки
  if (typeof window.renderEconomyInputs === "function") {
    window.renderEconomyInputs();
  }
};

window.calcOddsSum = function () {
  let sum = 0;
  document.querySelectorAll(".odds-chance-input").forEach((i) => {
    sum += parseFloat(i.value) || 0;
  });
  const sumEl = document.getElementById("oddsSumVal");
  if (sumEl) {
    sumEl.innerText = `${sum.toFixed(1)}%`;
    sumEl.style.color = Math.abs(sum - 100) < 0.2 ? "#34d399" : (sum > 100 ? "#f43f5e" : "#fbbf24");
  }
  return sum;
};

window.switchOddsMode = function (modeKey) {
  currentOddsTab = modeKey || "case_std";
  window.currentOddsTab = currentOddsTab;
  document.querySelectorAll(".odds-tab-btn").forEach((b) => {
    const isAct = b.dataset.tab === currentOddsTab;
    b.className = isAct
      ? "odds-tab-btn px-3 py-1.5 rounded-lg bg-white/15 text-white font-semibold border border-white/20 whitespace-nowrap transition cursor-pointer shadow-sm"
      : "odds-tab-btn px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 border border-transparent whitespace-nowrap transition cursor-pointer";
  });

  const box = document.getElementById("oddsItemsContainer");
  if (!box) return;
  box.innerHTML = "";

  let items = [];
  if (window.currentCloudData?.allChances?.[currentOddsTab] && window.currentCloudData.allChances[currentOddsTab].length > 0) {
    items = window.currentCloudData.allChances[currentOddsTab];
  } else if (FALLBACK_ODDS_DATABASE[currentOddsTab]) {
    items = FALLBACK_ODDS_DATABASE[currentOddsTab];
  }

  const refList = FALLBACK_ODDS_DATABASE[currentOddsTab] || [];

  if (items.length === 0) {
    box.innerHTML = `<div class="col-span-full text-center text-xs text-gray-500 py-8">Нет данных о шансах для выбранной категории</div>`;
    return;
  }

  items.forEach((it) => {
    const ref = refList.find(r => r.id === it.id);
    const displayName = it.name || ref?.name || it.id;
    const displayIcon = it.icon || ref?.icon || "🎁";
    const chanceVal = it.chance !== undefined ? it.chance : 0;

    box.innerHTML += `
      <div class="bg-[#12131f] border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <span class="text-2xl">${displayIcon}</span>
          <div class="truncate">
            <div class="font-semibold text-xs text-gray-200 truncate">${displayName}</div>
            <div class="mono-font text-[10px] text-gray-500">ID: ${it.id}</div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" step="0.5" min="0" max="100" value="${chanceVal}" data-odds-id="${it.id}" class="odds-chance-input w-20 bg-[#0a0a0f] border border-white/10 focus:border-amber-400 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-gray-400 font-bold text-xs">%</span>
        </div>
      </div>
    `;
  });

  if (typeof window.calcOddsSum === "function") {
    window.calcOddsSum();
    document.querySelectorAll(".odds-chance-input").forEach((inp) => inp.addEventListener("input", window.calcOddsSum));
  }
};

window.saveAllChances = async function () {
  const sum = typeof window.calcOddsSum === "function" ? window.calcOddsSum() : 0;
  if (sum > 100.05) {
    alert(`⚠️ Ошибка: Сумма вероятностей составляет ${sum.toFixed(1)}%, что превышает допустимые 100%! Пожалуйста, скорректируйте шансы.`);
    return false;
  }

  if (!window.currentCloudData || typeof window.currentCloudData !== "object") {
    window.currentCloudData = {};
  }
  if (!window.currentCloudData.allChances) {
    window.currentCloudData.allChances = {};
  }

  const updated = [];
  const refList = FALLBACK_ODDS_DATABASE[currentOddsTab] || [];

  document.querySelectorAll(".odds-chance-input").forEach((inp) => {
    const id = inp.dataset.oddsId;
    const ref = refList.find(r => r.id === id) || {};
    updated.push({
      id: id,
      name: ref.name || id,
      icon: ref.icon || "🎁",
      color: ref.color || "#60a5fa",
      desc: ref.desc || "",
      chance: parseFloat(inp.value) || 0,
      value: ref.value || 0,
      type: ref.type || "item"
    });
  });

  window.currentCloudData.allChances[currentOddsTab] = updated;

  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData[targetUser]) window.currentCloudData[targetUser] = {};
  if (!Array.isArray(window.currentCloudData[targetUser].audit)) window.currentCloudData[targetUser].audit = [];
  window.currentCloudData[targetUser].audit.push({
    text: `[ADMIN] Обновил сетку шансов для «${currentOddsTab}»`,
    icon: "🎲",
    date: new Date().toLocaleDateString("ru-RU"),
    time: new Date().toLocaleTimeString("ru-RU"),
    timestamp: Date.now()
  });

  if (typeof window.saveCloud === "function") {
    await window.saveCloud();
  }
  alert("Конфигурация вероятностей успешно зафиксирована!");
  if (typeof window.renderDashboard === "function") {
    window.renderDashboard();
  }
  return true;
};

window.renderEconomyInputs = function () {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};

  // 1. Цены на еду
  const food = window.currentCloudData?.customFood || 
    (typeof window.readStorage === "function" ? window.readStorage("customFood", null) : null) || 
    { sushi: 18, pizza: 16, kfc: 16, bento: 15, earl_grey: 8, puer: 10, cheese: 12, chips: 9 };
    
  const foodBox = document.getElementById("ecoContainer_food");
  if (foodBox) {
    const foodIcons = { sushi: "🍣", pizza: "🍕", kfc: "🍗", bento: "🍱", earl_grey: "🫖", puer: "🍵", cheese: "🧀", chips: "🍟" };
    foodBox.innerHTML = "";
    Object.keys(food).forEach((k) => {
      const icon = foodIcons[k] || "🍱";
      foodBox.innerHTML += `
        <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
          <label class="text-xs text-gray-300 font-semibold flex items-center gap-2">
            <span class="text-xl">${icon}</span>
            <span class="capitalize">${k}</span>
          </label>
          <div class="flex items-center gap-1.5 shrink-0">
            <input type="number" id="ecoFood_${k}" value="${food[k]}" class="w-20 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
            <span class="text-xs text-gray-400 font-mono">🪙</span>
          </div>
        </div>
      `;
    });
  }

  // 2. Кейсы и мини-игры
  const rew = Object.assign({}, DEFAULT_ECONOMY, window.currentCloudData?.economyConfig || {});
  const casesBox = document.getElementById("ecoContainer_cases");
  if (casesBox) {
    casesBox.innerHTML = `
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-gray-300 font-semibold flex items-center gap-2">
          <span class="text-xl">📦</span>
          <span>Стандартный Кейс:</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoCase_standard" value="${rew.caseCostStandard}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-purple-300 font-semibold flex items-center gap-2">
          <span class="text-xl">💜</span>
          <span>Премиум Кейс:</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoCase_premium" value="${rew.caseCostPremium}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-amber-300 font-semibold flex items-center gap-2">
          <span class="text-xl">👑</span>
          <span>★ Black Box ★:</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoCase_black" value="${rew.caseCostBlack}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-orange-400 font-semibold flex items-center gap-2">
          <span class="text-xl">🎃</span>
          <span>Хеллоуин Склеп:</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoCase_halloween" value="${rew.caseCostHalloween}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-rose-300 font-semibold flex items-center gap-2">
          <span class="text-xl">🚀</span>
          <span>Ставка «Мур-Краш»:</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoBet_crash" value="${rew.betCrash}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-sky-300 font-semibold flex items-center gap-2">
          <span class="text-xl">🎲</span>
          <span>Ставка «Кости»:</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoBet_dice" value="${rew.betDice}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-purple-300 font-semibold flex items-center gap-2">
          <span class="text-xl">🍒</span>
          <span>Спин «Слоты 777»:</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoBet_slots" value="${rew.betSlots}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-pink-300 font-semibold flex items-center gap-2">
          <span class="text-xl">🎟️</span>
          <span>Билет «Мур-Трио»:</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoScratch_trio" value="${rew.scratchTrio}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-emerald-300 font-semibold flex items-center gap-2">
          <span class="text-xl">🐟</span>
          <span>Билет «Золотая рыбка»:</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoScratch_fish" value="${rew.scratchFish}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-amber-200 font-semibold flex items-center gap-2">
          <span class="text-xl">⭐</span>
          <span>Билет «Таганрог VIP»:</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoScratch_vip" value="${rew.scratchVip}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
    `;
  }

  // 3. Награды мини-игр
  const rewBox = document.getElementById("ecoContainer_rewards");
  if (rewBox) {
    rewBox.innerHTML = `
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-gray-300 font-semibold flex items-center gap-2">
          <span class="text-xl">🏃</span>
          <span>Subway Cat (макс):</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoRew_runner" value="${rew.maxRunner}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-gray-300 font-semibold flex items-center gap-2">
          <span class="text-xl">🧱</span>
          <span>Тетрис (макс):</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoRew_tetris" value="${rew.maxTetris}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-blue-300 font-semibold flex items-center gap-2">
          <span class="text-xl">🎣</span>
          <span>Рыбалка (макс):</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoRew_fishing" value="${rew.maxFishing}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-blue-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-purple-300 font-semibold flex items-center gap-2">
          <span class="text-xl">🧠</span>
          <span>Мур-Память (макс):</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoRew_memory" value="${rew.maxMemory}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-purple-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-gray-300 font-semibold flex items-center gap-2">
          <span class="text-xl">🚴</span>
          <span>Курьер (макс):</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoRew_catcher" value="${rew.catcher}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
      <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
        <label class="text-xs text-amber-300 font-semibold flex items-center gap-2">
          <span class="text-xl">🎁</span>
          <span>Daily Бонус:</span>
        </label>
        <div class="flex items-center gap-1.5 shrink-0">
          <input type="number" id="ecoRew_dailyBonus" value="${rew.dailyBonus}" class="w-24 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
          <span class="text-xs text-gray-400 font-mono">🪙</span>
        </div>
      </div>
    `;
  }

  // 4. Предметы магазина
  const shopBox = document.getElementById("ecoContainer_shop");
  if (shopBox) {
    const shopList = [
      { id: "flower", name: "Ромашка", icon: "🌸", category: "Головной убор", defaultCost: 35 },
      { id: "glasses", name: "Круглые очки", icon: "👓", category: "Очки", defaultCost: 50 },
      { id: "bow", name: "Атласный бантик", icon: "🎀", category: "Одежда", defaultCost: 30 },
      { id: "sweater_wool", name: "Вязаный свитер", icon: "🧶", category: "Одежда", defaultCost: 85 },
      { id: "crown", name: "Золотая корона", icon: "👑", category: "Премиум", defaultCost: 130 },
      { id: "vr_headset", name: "VR-очки", icon: "🥽", category: "Гаджеты", defaultCost: 160 }
    ];
    const customShop = window.currentCloudData?.customShop || {};
    shopBox.innerHTML = "";
    shopList.forEach((it) => {
      const curVal = customShop[it.id] !== undefined ? customShop[it.id] : it.defaultCost;
      shopBox.innerHTML += `
        <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-3 hover:border-white/10 transition">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="text-2xl">${it.icon}</span>
            <div class="truncate">
              <div class="text-xs font-semibold text-gray-200 truncate">${it.name}</div>
              <div class="text-[10px] text-gray-500 font-mono">${it.category}</div>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <input type="number" id="ecoShop_${it.id}" value="${curVal}" class="w-20 bg-[#0a0a0f] border border-white/10 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
            <span class="text-xs text-gray-400 font-mono">🪙</span>
          </div>
        </div>
      `;
    });
  }
};

window.saveEconomyConfig = async function () {
  if (!window.currentCloudData || typeof window.currentCloudData !== "object") {
    window.currentCloudData = {};
  }
  if (!window.currentCloudData.economyConfig) {
    window.currentCloudData.economyConfig = Object.assign({}, DEFAULT_ECONOMY);
  }

  const map = {
    caseCostStandard: "ecoCase_standard",
    caseCostPremium: "ecoCase_premium",
    caseCostBlack: "ecoCase_black",
    caseCostHalloween: "ecoCase_halloween",
    betCrash: "ecoBet_crash",
    betDice: "ecoBet_dice",
    betSlots: "ecoBet_slots",
    scratchTrio: "ecoScratch_trio",
    scratchFish: "ecoScratch_fish",
    scratchVip: "ecoScratch_vip",
    maxRunner: "ecoRew_runner",
    maxTetris: "ecoRew_tetris",
    maxFishing: "ecoRew_fishing",
    maxMemory: "ecoRew_memory",
    catcher: "ecoRew_catcher",
    dailyBonus: "ecoRew_dailyBonus"
  };

  Object.keys(map).forEach(key => {
    const el = document.getElementById(map[key]) || document.getElementById(map[key].replace("ecoCase_", "ecoCost_"));
    if (el) {
      window.currentCloudData.economyConfig[key] = parseFloat(el.value) || DEFAULT_ECONOMY[key];
    }
  });

  const foodKeys = ["sushi", "pizza", "kfc", "bento", "earl_grey", "puer", "cheese", "chips"];
  if (!window.currentCloudData.customFood) window.currentCloudData.customFood = {};
  foodKeys.forEach(k => {
    const el = document.getElementById(`ecoFood_${k}`);
    if (el) {
      window.currentCloudData.customFood[k] = parseFloat(el.value) || 10;
    }
  });

  if (!window.currentCloudData.customShop) window.currentCloudData.customShop = {};
  document.querySelectorAll("[id^='ecoShop_']").forEach(inp => {
    const itemId = inp.id.replace("ecoShop_", "");
    window.currentCloudData.customShop[itemId] = parseFloat(inp.value) || 0;
  });

  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData[targetUser]) window.currentCloudData[targetUser] = {};
  if (!Array.isArray(window.currentCloudData[targetUser].audit)) window.currentCloudData[targetUser].audit = [];
  window.currentCloudData[targetUser].audit.push({
    text: `[ADMIN] Обновил глобальные цены и конфигурацию экономики`,
    icon: "🪙",
    date: new Date().toLocaleDateString("ru-RU"),
    time: new Date().toLocaleTimeString("ru-RU"),
    timestamp: Date.now()
  });

  if (typeof window.saveCloud === "function") {
    await window.saveCloud();
  }
  alert("Конфигурация цен и наград успешно зафиксирована!");
  if (typeof window.renderDashboard === "function") {
    window.renderDashboard();
  }
};

window.saveIrlBudgetConfig = async function () {
  const inp = document.getElementById("irlMonthlyBudgetInput");
  const newBudget = Math.max(500, parseFloat(inp?.value) || 5000);

  if (!window.currentCloudData) window.currentCloudData = {};
  if (!window.currentCloudData.irlBudgetConfig) {
    window.currentCloudData.irlBudgetConfig = Object.assign({}, DEFAULT_IRL_BUDGET_CONFIG);
  }
  window.currentCloudData.irlBudgetConfig.monthlyBudgetRub = newBudget;

  const sel = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData[sel]) window.currentCloudData[sel] = {};
  if (!Array.isArray(window.currentCloudData[sel].audit)) window.currentCloudData[sel].audit = [];
  window.currentCloudData[sel].audit.push({
    text: `[IRL GUARD] Обновил месячный бюджет реальных желаний: ${newBudget.toLocaleString("ru-RU")} ₽`,
    icon: "💳",
    date: new Date().toLocaleDateString("ru-RU"),
    time: new Date().toLocaleTimeString("ru-RU"),
    timestamp: Date.now()
  });

  if (typeof window.saveCloud === "function") {
    await window.saveCloud();
  }
  alert(`Месячный лимит расходов установлен: ${newBudget.toLocaleString("ru-RU")} ₽`);
  if (typeof window.runComprehensiveAiEconomyAudit === "function") {
    window.runComprehensiveAiEconomyAudit();
  }
};

window.lowerWishChancesInCloud = async function () {
  if (!window.currentCloudData) window.currentCloudData = {};
  if (!window.currentCloudData.allChances) {
    window.currentCloudData.allChances = Object.assign({}, FALLBACK_ODDS_DATABASE);
  }
  const chances = window.currentCloudData.allChances;

  let modified = false;
  if (Array.isArray(chances.case_blk)) {
    chances.case_blk.forEach(item => {
      if (item.id === "blk_wish_coupon" || item.id === "blk_super_box") {
        item.chance = Math.min(item.chance, 0.5);
        modified = true;
      }
    });
  }
  if (Array.isArray(chances.case_prem)) {
    chances.case_prem.forEach(item => {
      if (item.id === "prem_coffee" || item.id === "prem_cinema") {
        item.chance = Math.min(item.chance, 1.0);
        modified = true;
      }
    });
  }

  if (modified) {
    const sel = document.getElementById("targetPlayerSelect")?.value || "katya";
    if (!window.currentCloudData[sel]) window.currentCloudData[sel] = {};
    if (!Array.isArray(window.currentCloudData[sel].audit)) window.currentCloudData[sel].audit = [];
    window.currentCloudData[sel].audit.push({
      text: `[IRL GUARD] Дроп реальных желаний снижен до минимума (< 1%) из-за лимита бюджета`,
      icon: "🛑",
      date: new Date().toLocaleDateString("ru-RU"),
      time: new Date().toLocaleTimeString("ru-RU"),
      timestamp: Date.now()
    });
    if (typeof window.saveCloud === "function") {
      await window.saveCloud();
    }
    alert("Дроп купонов желаний заморожен и снижен до минимума (< 1%)!");
    if (typeof window.runComprehensiveAiEconomyAudit === "function") {
      window.runComprehensiveAiEconomyAudit();
    }
  }
};

window.generatedAdvisorEdits = [];

window.runComprehensiveAiEconomyAudit = function (pet, analytics, audit = []) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  if (!pet || typeof pet !== "object") pet = userRecord.pet || (typeof window.readStorage === "function" ? window.readStorage("katya_master_pet_state", {}) : {}) || {};
  if (!analytics || typeof analytics !== "object") analytics = userRecord.analytics || {};
  if (!Array.isArray(audit) || audit.length === 0) audit = userRecord.audit || [];

  const eco = Object.assign({}, DEFAULT_ECONOMY, window.currentCloudData?.economyConfig || {});
  const chances = window.currentCloudData?.allChances || {};
  const irlConfig = Object.assign({}, DEFAULT_IRL_BUDGET_CONFIG, window.currentCloudData?.irlBudgetConfig || {});
  const monthlyBudgetRub = Math.max(500, parseFloat(irlConfig.monthlyBudgetRub) || 5000);

  window.generatedAdvisorEdits = [];
  let riskScore = 8;
  let breakdownReports = [];

  // МОДУЛЬ: IRL WALLET GUARD
  const wishesList = userRecord.wishes || (typeof window.readStorage === "function" ? window.readStorage(`${targetUser}_wishes`, null) || window.readStorage("katya_master_wishes", []) : []) || [];
  const activeWishes = wishesList.filter(w => w.status !== "used");
  let activeWishesRub = 0;
  activeWishes.forEach(w => {
    activeWishesRub += estimateWishRubCost(w, irlConfig.wishCostEstimates);
  });
  const burnRatePercent = Math.round((activeWishesRub / monthlyBudgetRub) * 100);
  const isWishLimitReached = burnRatePercent >= 75;

  // Обновление UI Финансового Щита
  const irlInput = document.getElementById("irlMonthlyBudgetInput");
  if (irlInput && !irlInput.matches(":focus")) irlInput.value = monthlyBudgetRub;

  const irlSpentEl = document.getElementById("irlBudgetSpentText");
  if (irlSpentEl) irlSpentEl.innerText = `${activeWishesRub.toLocaleString("ru-RU")} ₽ / ${monthlyBudgetRub.toLocaleString("ru-RU")} ₽`;

  const irlCountEl = document.getElementById("irlActiveWishesCount");
  if (irlCountEl) irlCountEl.innerText = `${activeWishes.length} шт (${activeWishesRub.toLocaleString("ru-RU")} ₽)`;

  const irlLimitLabel = document.getElementById("irlBudgetLimitLabel");
  if (irlLimitLabel) irlLimitLabel.innerText = `Максимум: ${monthlyBudgetRub.toLocaleString("ru-RU")} ₽`;

  const irlBar = document.getElementById("irlBudgetProgressBar");
  if (irlBar) {
    irlBar.style.width = `${Math.min(100, burnRatePercent)}%`;
    if (burnRatePercent >= 75) {
      irlBar.className = "h-full rounded-full transition-all duration-500 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]";
    } else if (burnRatePercent >= 50) {
      irlBar.className = "h-full rounded-full transition-all duration-500 bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]";
    } else {
      irlBar.className = "h-full rounded-full transition-all duration-500 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]";
    }
  }

  const irlBadge = document.getElementById("irlBudgetStatusBadge");
  if (irlBadge) {
    if (burnRatePercent >= 75) {
      irlBadge.innerText = `СТОП-ЛИМИТ (${burnRatePercent}%)`;
      irlBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse";
    } else if (burnRatePercent >= 50) {
      irlBadge.innerText = `Нагрузка растет (${burnRatePercent}%)`;
      irlBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30";
    } else {
      irlBadge.innerText = `Безопасно (${burnRatePercent}%)`;
      irlBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    }
  }

  const irlBannerText = document.getElementById("irlGuardBannerText");
  if (irlBannerText) {
    if (burnRatePercent >= 75) {
      irlBannerText.innerHTML = `<b class="text-rose-300">ВНИМАНИЕ!</b> Нагрузка бюджета достигла <b>${burnRatePercent}%</b>: активных купонов на <b>${activeWishesRub.toLocaleString("ru-RU")} ₽</b> из <b>${monthlyBudgetRub.toLocaleString("ru-RU")} ₽</b>. Дроп реальных желаний заморожен, удешевление кейсов с желаниями заблокировано.`;
    } else {
      irlBannerText.innerText = `Выбитые купоны обеспечены реальными деньгами из личного бюджета. При достижении нагрузки 75% советник автоматически блокирует удешевление кейсов с желаниями и замораживает дроп купонов.`;
    }
  }

  if (isWishLimitReached) {
    riskScore += 35;
    breakdownReports.push(`⚠️ Финансовая нагрузка: ${activeWishesRub.toLocaleString("ru-RU")} ₽ из ${monthlyBudgetRub.toLocaleString("ru-RU")} ₽ (${burnRatePercent}%). Дроп реальных желаний приостановлен во избежание перерасхода.`);
    window.generatedAdvisorEdits.push({
      key: "irl_guard_freeze",
      isActionOnly: true,
      title: `🛡️ IRL Wallet Guard: Заморозка дропа желаний (${burnRatePercent}% бюджета)`,
      desc: `На руках активных купонов на ${activeWishesRub.toLocaleString("ru-RU")} ₽ из ${monthlyBudgetRub.toLocaleString("ru-RU")} ₽. Снизить шанс выпадения купонов в кейсах до минимума (< 1%) и перенаправить вероятность в редкие скины.`,
      newVal: 0,
      unit: "₽",
      actionBtnText: "Заморозить дроп желаний",
      onApply: () => {
        window.lowerWishChancesInCloud();
      }
    });
  }

  // АУДИТ 1: СЛОТЫ 777 (Целевой RTP 88%, коридор 84-92%, границы [10, 50])
  const slotBet = eco.betSlots || 20;
  const slotsList = chances.slots || FALLBACK_ODDS_DATABASE.slots;
  let evSlots = 0;
  slotsList.forEach(item => {
    const mult = item.multiplier !== undefined ? item.multiplier : (item.id === "slot_star" ? 15 : item.id === "slot_crown" ? 7.5 : item.id === "slot_coins" ? 4 : item.id === "slot_sushi" ? 2.5 : 0);
    evSlots += ((item.chance || 0) / 100) * (slotBet * mult);
  });
  const rtpSlots = slotBet > 0 ? Math.round((evSlots / slotBet) * 100) : 0;
  const capsSlots = ECONOMY_CAPS.betSlots;

  if (rtpSlots > capsSlots.rtpMax) {
    riskScore += 20;
    const targetBet = calculateBoundedAdjustment(slotBet, evSlots / 0.88, capsSlots.min, capsSlots.max);
    if (targetBet > slotBet) {
      breakdownReports.push(`🚨 Слоты: RTP завышен до ${rtpSlots}% (Норма 84–92%). Казино работает в убыток.`);
      window.generatedAdvisorEdits.push({
        key: "betSlots",
        title: `🎰 Нормализация Слотов 777 (Текущий RTP: ${rtpSlots}%)`,
        desc: `Повысить ставку с ${slotBet} до ${targetBet} 🪙 (шаг не более +15%) для фиксации целевого возврата 88%.`,
        newVal: targetBet
      });
    }
  } else if (rtpSlots < capsSlots.rtpMin) {
    riskScore += 10;
    const targetBet = calculateBoundedAdjustment(slotBet, evSlots / 0.88, capsSlots.min, capsSlots.max);
    if (targetBet < slotBet) {
      breakdownReports.push(`⚠️ Слоты: RTP занижен до ${rtpSlots}% (Норма 84–92%). Риск оттока игрока.`);
      window.generatedAdvisorEdits.push({
        key: "betSlots",
        title: `🎰 Поддержка отдачи Слотов 777 (Текущий RTP: ${rtpSlots}%)`,
        desc: `Снизить ставку с ${slotBet} до ${targetBet} 🪙 (шаг не более -15%) для защиты от быстрого проигрыша.`,
        newVal: targetBet
      });
    }
  } else {
    breakdownReports.push(`✅ Слоты 777: RTP ${rtpSlots}% (в коридоре нормы 84–92%). Оптимально.`);
  }

  // АУДИТ 2: СКРЕТЧ-КАРТЫ (Целевой RTP 88%, коридор 84-92%, границы [15, 60])
  const scrCost = eco.scratchTrio || 30;
  const scrList = chances.scratch || FALLBACK_ODDS_DATABASE.scratch;
  let evScratch = 0;
  scrList.forEach(item => {
    const mult = item.multiplier !== undefined ? item.multiplier : (item.id === "scr_jackpot" ? 10 : item.id === "scr_mid" ? 3 : item.id === "scr_small" ? 1.5 : 0);
    evScratch += ((item.chance || 0) / 100) * (scrCost * mult);
  });
  const rtpScratch = scrCost > 0 ? Math.round((evScratch / scrCost) * 100) : 0;
  const capsScratch = ECONOMY_CAPS.scratchTrio;

  if (rtpScratch > capsScratch.rtpMax) {
    riskScore += 15;
    const targetTicketCost = calculateBoundedAdjustment(scrCost, evScratch / 0.88, capsScratch.min, capsScratch.max);
    if (targetTicketCost > scrCost) {
      breakdownReports.push(`🚨 Скретч-карты: RTP ${rtpScratch}% (Норма 84–92%). Риск вымывания фонда.`);
      window.generatedAdvisorEdits.push({
        key: "scratchTrio",
        title: `🎟️ Баланс билетов Скретч (RTP: ${rtpScratch}%)`,
        desc: `Повысить цену билета с ${scrCost} до ${targetTicketCost} 🪙 (шаг не более +15%).`,
        newVal: targetTicketCost
      });
    }
  } else if (rtpScratch < capsScratch.rtpMin) {
    riskScore += 8;
    const targetTicketCost = calculateBoundedAdjustment(scrCost, evScratch / 0.88, capsScratch.min, capsScratch.max);
    if (targetTicketCost < scrCost) {
      breakdownReports.push(`⚠️ Скретч-карты: RTP ${rtpScratch}% (Норма 84–92%). Заниженная отдача.`);
      window.generatedAdvisorEdits.push({
        key: "scratchTrio",
        title: `🎟️ Повышение отдачи Скретч (RTP: ${rtpScratch}%)`,
        desc: `Снизить цену билета с ${scrCost} до ${targetTicketCost} 🪙 (шаг не более -15%).`,
        newVal: targetTicketCost
      });
    }
  } else {
    breakdownReports.push(`✅ Скретч-карты: RTP ${rtpScratch}% (в коридоре нормы 84–92%). Оптимально.`);
  }

  // АУДИТ 3: КЕЙСЫ (Целевая окупаемость 75–82%)
  const auditCase = (caseKey, costVal, defKey, caps) => {
    const drops = chances[caseKey] || FALLBACK_ODDS_DATABASE[caseKey] || [];
    let expectedDropValue = 0;
    drops.forEach(d => {
      expectedDropValue += ((d.chance || 0) / 100) * (d.value || 40);
    });
    const caseRtp = costVal > 0 ? Math.round((expectedDropValue / costVal) * 100) : 0;
    const hasRealWishes = caseKey === "case_blk" || caseKey === "case_prem";

    if (caseRtp > caps.rtpMax) {
      riskScore += 12;
      const targetCaseCost = calculateBoundedAdjustment(costVal, expectedDropValue / 0.78, caps.min, caps.max);
      if (targetCaseCost > costVal) {
        breakdownReports.push(`🚨 Кейс [${caseKey}]: Окупаемость завышена (${caseRtp}%, норма 75–82%). Сверхдоходность.`);
        window.generatedAdvisorEdits.push({
          key: defKey,
          title: `📦 Ребаланс цены открытия кейса [${caseKey}]`,
          desc: `Поднять стоимость открытия с ${costVal} до ${targetCaseCost} 🪙 (шаг не более +15%) для окупаемости 78%.`,
          newVal: targetCaseCost
        });
      }
    } else if (caseRtp < caps.rtpMin) {
      if (hasRealWishes && isWishLimitReached) {
        breakdownReports.push(`🔒 Кейс [${caseKey}]: Окупаемость ${caseRtp}%, но снижение цены заблокировано щитом IRL Wallet Guard (лимит бюджета желаний).`);
      } else {
        const targetCaseCost = calculateBoundedAdjustment(costVal, expectedDropValue / 0.78, caps.min, caps.max);
        if (targetCaseCost < costVal) {
          riskScore += 6;
          breakdownReports.push(`⚠️ Кейс [${caseKey}]: Окупаемость занижена (${caseRtp}%, норма 75–82%).`);
          window.generatedAdvisorEdits.push({
            key: defKey,
            title: `📦 Доступность кейса [${caseKey}]`,
            desc: `Снизить стоимость открытия с ${costVal} до ${targetCaseCost} 🪙 (шаг не более -15%) для защиты от разочарования.`,
            newVal: targetCaseCost
          });
        }
      }
    } else {
      breakdownReports.push(`✅ Кейс [${caseKey}]: Окупаемость ${caseRtp}% (в коридоре нормы 75–82%). Оптимально.`);
    }
  };

  auditCase("case_std", eco.caseCostStandard || 80, "caseCostStandard", ECONOMY_CAPS.caseCostStandard);
  auditCase("case_prem", eco.caseCostPremium || 160, "caseCostPremium", ECONOMY_CAPS.caseCostPremium);
  auditCase("case_blk", eco.caseCostBlack || 320, "caseCostBlack", ECONOMY_CAPS.caseCostBlack);

  // АУДИТ 4: БАЛАНС МАКРОЭКОНОМИКИ И ЕДЫ (Коридор еды 8–20 🪙)
  const avgMiniGameReward = ((eco.maxRunner || 25) + (eco.maxTetris || 25) + (eco.maxFishing || 40) + (eco.maxMemory || 30)) / 4;
  if (avgMiniGameReward > 20 * 2.5) {
    riskScore += 8;
    breakdownReports.push(`⚠️ Бытовые расходы: Средняя награда за аркады (${Math.round(avgMiniGameReward)} 🪙) превышает стоимость еды в 2.5+ раза. Рекомендуется удерживать цены еды в коридоре 8–20 🪙.`);
  }

  // Отображение индикаторов риска
  riskScore = Math.min(100, Math.max(5, riskScore));
  const pBadge = document.getElementById("churnRiskPercentBadge");
  if (pBadge) {
    pBadge.innerText = `${riskScore}% (${riskScore > 50 ? "КРИТИЧЕСКИЙ РИСК" : riskScore > 25 ? "ТРЕБУЕТ ВНИМАНИЯ" : "БАЛАНС СТАБИЛЕН"})`;
    pBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${riskScore > 50 ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : riskScore > 25 ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"}`;
  }
  const emEl = document.getElementById("churnRiskEmoji");
  if (emEl) emEl.innerText = riskScore > 50 ? "🚨" : riskScore > 25 ? "⚠️" : "🛡️";

  const detEl = document.getElementById("churnRiskDetails");
  if (detEl) {
    detEl.innerHTML = breakdownReports.join("<br>");
  }

  const container = document.getElementById("advisorFormList");
  if (!container) return;
  container.innerHTML = "";

  if (window.generatedAdvisorEdits.length === 0) {
    container.innerHTML = `<div class="text-center text-emerald-400 py-8 font-semibold text-xs">✨ Все параметры экономики, RTP казино (84–92%) и окупаемость кейсов (75–82%) находятся в оптимальном коридоре! Отклонений не зафиксировано.</div>`;
  } else {
    window.generatedAdvisorEdits.forEach((it, idx) => {
      let actionControl = "";
      if (it.isActionOnly) {
        actionControl = `
          <button type="button" onclick="window.lowerWishChancesInCloud()" class="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs active:scale-95 transition cursor-pointer whitespace-nowrap shadow-sm">
            🛑 ${it.actionBtnText || 'Заморозить дроп'}
          </button>
        `;
      } else {
        actionControl = `
          <div class="flex items-center gap-2 shrink-0">
            <input type="number" id="advInput_${idx}" value="${it.newVal}" class="w-24 bg-[#0a0a0f] border border-indigo-500/50 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-amber-300 outline-none transition">
            <span class="text-xs text-gray-400 font-mono">${it.unit || '🪙'}</span>
          </div>
        `;
      }

      container.innerHTML += `
        <div class="bg-[#12131f] border border-white/5 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/10 transition">
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-xs text-gray-200">${it.title}</div>
            <div class="text-[11px] text-gray-400 mt-0.5 leading-relaxed">${it.desc}</div>
          </div>
          ${actionControl}
        </div>
      `;
    });
  }
};

window.applyAdvisorPackage = async function () {
  if (!window.currentCloudData || typeof window.currentCloudData !== "object") {
    window.currentCloudData = {};
  }
  if (!window.currentCloudData.economyConfig) {
    window.currentCloudData.economyConfig = Object.assign({}, DEFAULT_ECONOMY);
  }

  let appliedCount = 0;
  (window.generatedAdvisorEdits || []).forEach((it, idx) => {
    if (it.isActionOnly && typeof it.onApply === "function") {
      it.onApply();
      appliedCount++;
      return;
    }
    const inp = document.getElementById(`advInput_${idx}`);
    if (inp && it.key) {
      window.currentCloudData.economyConfig[it.key] = parseFloat(inp.value) || it.newVal;
      appliedCount++;
    }
  });

  const sel = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData[sel]) window.currentCloudData[sel] = {};
  if (!Array.isArray(window.currentCloudData[sel].audit)) window.currentCloudData[sel].audit = [];
  window.currentCloudData[sel].audit.push({
    text: `[AI-ADVISOR] Применил сбалансированный пакет экономики (применено: ${appliedCount} правил)`,
    icon: "🧠",
    date: new Date().toLocaleDateString("ru-RU"),
    time: new Date().toLocaleTimeString("ru-RU"),
    timestamp: Date.now()
  });

  if (typeof window.saveCloud === "function") {
    await window.saveCloud();
  }
  alert("Пакет ребаланса успешно зафиксирован в облаке!");
  if (typeof window.renderDashboard === "function") {
    window.renderDashboard();
  }
};

window.renderWishesGrid = function (wishes) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!wishes) {
    wishes = window.currentCloudData?.[targetUser]?.wishes || 
      (typeof window.readStorage === "function" ? window.readStorage(`${targetUser}_wishes`, null) || window.readStorage("katya_master_wishes", []) : []);
  }
  if (!Array.isArray(wishes)) wishes = [];

  const box = document.getElementById("wishesGrid");
  const count = document.getElementById("badgeWishCount");
  if (count) count.innerText = `${wishes.length} шт`;
  if (!box) return;
  box.innerHTML = "";

  if (wishes.length === 0) {
    box.innerHTML = `<div class="col-span-full text-center text-xs text-gray-500 py-8">Купоны еще не выбиты ✨</div>`;
    return;
  }

  const safeEscape = typeof window.escapeHtml === "function" ? window.escapeHtml : (s) => s || "";

  wishes.slice().reverse().forEach((w, rIdx) => {
    const origIdx = wishes.length - 1 - rIdx;
    const isUsed = w.status === "used";
    const code = safeEscape(w.code || "#WISH-????");
    const source = safeEscape(w.source || "Игра");
    const expiry = safeEscape(w.expiry || "Бессрочно");
    const date = safeEscape(w.date || "");
    const title = safeEscape(w.title || "Купон на желание");

    box.innerHTML += `
      <div class="bg-[#12131f] border ${isUsed ? "border-white/5 opacity-60" : "border-amber-500/30"} rounded-xl p-3.5 flex flex-col justify-between gap-2.5 shadow-sm hover:border-amber-400/50 transition">
        <div class="flex justify-between items-start gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xl">${isUsed ? "✅" : "💌"}</span>
            <span class="text-xs font-semibold text-gray-200 truncate">${title}</span>
          </div>
          <span class="mono-font text-[10px] bg-white/5 text-amber-300 border border-white/10 px-2 py-0.5 rounded font-bold shrink-0">${code}</span>
        </div>
        <div class="text-[11px] text-gray-400">
          <div>Источник: <b class="text-pink-300 font-semibold">${source}</b></div>
          <div class="text-emerald-400 text-[10px] mt-0.5">Срок: до ${expiry}</div>
        </div>
        <div class="text-[10px] text-gray-500 pt-2 border-t border-white/5 flex justify-between items-center">
          <span>${date}</span>
          ${isUsed 
            ? '<span class="text-emerald-400 font-semibold">Использован ✓</span>' 
            : `<button type="button" onclick="window.toggleWishStatus(${origIdx})" class="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 font-semibold text-[10px] transition cursor-pointer">Отметить</button>`
          }
        </div>
      </div>
    `;
  });
};

window.toggleWishStatus = async function (idx) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData || typeof window.currentCloudData !== "object") {
    window.currentCloudData = {};
  }
  if (!window.currentCloudData[targetUser]) {
    window.currentCloudData[targetUser] = {};
  }
  const userRecord = window.currentCloudData[targetUser];
  if (!Array.isArray(userRecord.wishes)) {
    userRecord.wishes = (typeof window.readStorage === "function" ? window.readStorage(`${targetUser}_wishes`, null) || window.readStorage("katya_master_wishes", []) : []);
  }

  if (userRecord.wishes && userRecord.wishes[idx]) {
    userRecord.wishes[idx].status = "used";
    userRecord.wishes[idx].usedAt = new Date().toLocaleString("ru-RU");

    if (typeof window.saveCloud === "function") {
      await window.saveCloud();
    }
    window.renderWishesGrid(userRecord.wishes);
    if (typeof window.renderDashboard === "function") {
      window.renderDashboard();
    }
  }
};

// Надежная регистрация слушателей событий при загрузке документа
function initEconomyEventListeners() {
  document.getElementById("btnSaveAllChances")?.addEventListener("click", window.saveAllChances);
  document.getElementById("btnApplyAdvisorPackage")?.addEventListener("click", window.applyAdvisorPackage);
  document.getElementById("btnSaveIrlBudget")?.addEventListener("click", window.saveIrlBudgetConfig);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEconomyEventListeners);
} else {
  initEconomyEventListeners();
}