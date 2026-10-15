/* =========================================================================
 * LEX LABS ENTERPRISE: ECONOMY, ODDS & AI ADVISOR MODULE
 * Файл: dashboard_economy.js
 * ========================================================================= */

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
  if (window.currentCloudData?.allChances?.[modeKey] && window.currentCloudData.allChances[modeKey].length > 0) {
    items = window.currentCloudData.allChances[modeKey];
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
document.getElementById("btnSaveAllChances")?.addEventListener("click", window.saveAllChances);

window.renderEconomyInputs = function () {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};

  const food = window.currentCloudData?.customFood || 
    (typeof window.readStorage === "function" ? window.readStorage("customFood", null) : null) || 
    { sushi: 18, pizza: 16, kfc: 16, bento: 15, earl_grey: 8, puer: 10, cheese: 12, chips: 9 };
    
  const foodBox = document.getElementById("ecoContainer_food");
  if (foodBox) {
    foodBox.innerHTML = "";
    Object.keys(food).forEach((k) => {
      foodBox.innerHTML += `<div><label class="text-gray-400 block mb-1 font-bold">${k}:</label><input type="number" id="ecoFood_${k}" value="${food[k]}" class="w-full bg-[#0b0c16] border border-[#2a2d4a] rounded-xl px-2.5 py-1.5 text-amber-300 font-bold outline-none"></div>`;
    });
  }

  const rew = Object.assign({}, DEFAULT_ECONOMY, window.currentCloudData?.economyConfig || {});
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
    const el = document.getElementById(map[key]);
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

  if (typeof window.saveCloud === "function") {
    await window.saveCloud();
  }
  alert("Конфигурация цен и наград успешно зафиксирована!");
  if (typeof window.renderDashboard === "function") {
    window.renderDashboard();
  }
};

window.generatedAdvisorEdits = [];

window.runComprehensiveAiEconomyAudit = function (pet, analytics, audit = []) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  if (!pet) pet = userRecord.pet || (typeof window.readStorage === "function" ? window.readStorage("katya_master_pet_state", {}) : {});
  if (!analytics) analytics = userRecord.analytics || {};
  if (!audit || audit.length === 0) audit = userRecord.audit || [];

  const eco = Object.assign({}, DEFAULT_ECONOMY, window.currentCloudData?.economyConfig || {});
  const chances = window.currentCloudData?.allChances || {};

  window.generatedAdvisorEdits = [];
  let riskScore = 5;
  let breakdownReports = [];

  // АУДИТ 1: СЛОТЫ 777
  const slotBet = eco.betSlots || 20;
  const slotsList = chances.slots || FALLBACK_ODDS_DATABASE.slots;
  let evSlots = 0;
  slotsList.forEach(item => {
    const mult = item.multiplier !== undefined ? item.multiplier : (item.id === "slot_star" ? 15 : item.id === "slot_crown" ? 7.5 : item.id === "slot_coins" ? 4 : item.id === "slot_sushi" ? 2.5 : 0);
    evSlots += ((item.chance || 0) / 100) * (slotBet * mult);
  });
  const rtpSlots = slotBet > 0 ? Math.round((evSlots / slotBet) * 100) : 0;

  if (rtpSlots > 95) {
    riskScore += 25;
    const targetBet = Math.ceil(evSlots / 0.88 / 5) * 5;
    breakdownReports.push(`🚨 Слоты: RTP завышен до ${rtpSlots}% (Норма 85-90%). Казино работает в убыток.`);
    window.generatedAdvisorEdits.push({
      key: "betSlots",
      title: `🎰 Нормализация Слотов 777 (Текущий RTP: ${rtpSlots}%)`,
      desc: `Повысить ставку с ${slotBet} до ${targetBet} 🪙 для фиксации целевого возврата 88%.`,
      newVal: targetBet
    });
  }

  // АУДИТ 2: СКРЕТЧ-КАРТЫ
  const scrCost = eco.scratchTrio || 30;
  const scrList = chances.scratch || FALLBACK_ODDS_DATABASE.scratch;
  let evScratch = 0;
  scrList.forEach(item => {
    const mult = item.multiplier !== undefined ? item.multiplier : (item.id === "scr_jackpot" ? 10 : item.id === "scr_mid" ? 3 : item.id === "scr_small" ? 1.5 : 0);
    evScratch += ((item.chance || 0) / 100) * (scrCost * mult);
  });
  const rtpScratch = scrCost > 0 ? Math.round((evScratch / scrCost) * 100) : 0;

  if (rtpScratch > 90) {
    riskScore += 20;
    const targetTicketCost = Math.ceil(evScratch / 0.80 / 5) * 5;
    breakdownReports.push(`🎟️ Скретч-карты: RTP ${rtpScratch}%. Риск быстрого вымывания монетного фонда.`);
    window.generatedAdvisorEdits.push({
      key: "scratchTrio",
      title: `🎟️ Баланс билетов Скретч (RTP: ${rtpScratch}%)`,
      desc: `Скорректировать цену билета с ${scrCost} до ${targetTicketCost} 🪙.`,
      newVal: targetTicketCost
    });
  }

  // АУДИТ 3: КЕЙСЫ
  const auditCase = (caseKey, costVal, defKey) => {
    const drops = chances[caseKey] || FALLBACK_ODDS_DATABASE[caseKey] || [];
    let expectedDropValue = 0;
    drops.forEach(d => {
      expectedDropValue += ((d.chance || 0) / 100) * (d.value || 40);
    });
    const caseRtp = costVal > 0 ? Math.round((expectedDropValue / costVal) * 100) : 0;
    if (caseRtp > 105) {
      riskScore += 15;
      const targetCaseCost = Math.ceil(expectedDropValue / 0.85 / 10) * 10;
      breakdownReports.push(`📦 Кейс [${caseKey}]: Дроп окупается в среднем на ${caseRtp}% (Сверхдоходность).`);
      window.generatedAdvisorEdits.push({
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

  // АУДИТ 4: БАЛАНС МАКРОЭКОНОМИКИ
  const minFoodCost = 8;
  const avgMiniGameReward = ((eco.maxRunner || 25) + (eco.maxTetris || 25) + (eco.maxFishing || 40)) / 3;
  if (avgMiniGameReward > minFoodCost * 5) {
    riskScore += 10;
    breakdownReports.push(`⚠️ Гиперинфляция: За одну мини-игру питомец окупает 5+ приёмов пищи. Ценность ресурсов падает.`);
  }

  // Отображение индикаторов риска
  riskScore = Math.min(100, riskScore);
  const pBadge = document.getElementById("churnRiskPercentBadge");
  if (pBadge) {
    pBadge.innerText = `${riskScore}% (${riskScore > 50 ? "КРИТИЧЕСКИЙ РИСК" : riskScore > 25 ? "ТРЕБУЕТ ВНИМАНИЯ" : "БАЛАНС СТАБИЛЕН"})`;
    pBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${riskScore > 50 ? "bg-rose-500/30 text-rose-300 border border-rose-500" : riskScore > 25 ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"}`;
  }
  const emEl = document.getElementById("churnRiskEmoji");
  if (emEl) emEl.innerText = riskScore > 50 ? "🚨" : riskScore > 25 ? "⚠️" : "🛡️";

  const detEl = document.getElementById("churnRiskDetails");
  if (detEl) {
    detEl.innerHTML = breakdownReports.length > 0 
      ? breakdownReports.join("<br>") 
      : `Все модули казино сбалансированы: Слоты RTP <b>${rtpSlots}%</b>, Скретч RTP <b>${rtpScratch}%</b>. Эмиссия под контролем.`;
  }

  const container = document.getElementById("advisorFormList");
  if (!container) return;
  container.innerHTML = "";

  if (window.generatedAdvisorEdits.length === 0) {
    container.innerHTML = `<div class="text-center text-emerald-400 py-8 font-bold">✨ Экономическая модель и математика казино функционируют идеально!</div>`;
  } else {
    window.generatedAdvisorEdits.forEach((it, idx) => {
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
};

window.applyAdvisorPackage = async function () {
  if (!window.currentCloudData || typeof window.currentCloudData !== "object") {
    window.currentCloudData = {};
  }
  if (!window.currentCloudData.economyConfig) {
    window.currentCloudData.economyConfig = Object.assign({}, DEFAULT_ECONOMY);
  }

  (window.generatedAdvisorEdits || []).forEach((it, idx) => {
    const inp = document.getElementById(`advInput_${idx}`);
    if (inp) window.currentCloudData.economyConfig[it.key] = parseFloat(inp.value) || it.newVal;
  });

  const sel = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData[sel]) window.currentCloudData[sel] = {};
  if (!Array.isArray(window.currentCloudData[sel].audit)) window.currentCloudData[sel].audit = [];
  window.currentCloudData[sel].audit.push({
    text: `[AI-ADVISOR] Применил сбалансированный пакет экономики`,
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
document.getElementById("btnApplyAdvisorPackage")?.addEventListener("click", window.applyAdvisorPackage);

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
    box.innerHTML = `<div class="col-span-2 text-center text-xs text-gray-500 py-6">Купоны еще не выбиты ✨</div>`;
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
      <div class="bg-[#0a0b14] border ${isUsed ? "border-gray-700 opacity-60" : "border-amber-500/40"} rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-lg">
        <div class="flex justify-between items-start">
          <span class="text-2xl">${isUsed ? "✅" : "💌"}</span>
          <span class="mono-font text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">${code}</span>
        </div>
        <div>
          <div class="text-xs font-bold text-gray-200">${title}</div>
          <div class="text-[11px] text-gray-400 mt-1">Откуда: <b class="text-pink-300">${source}</b></div>
          <div class="text-[10px] text-emerald-400 mt-0.5">Срок: до ${expiry}</div>
        </div>
        <div class="text-[10px] text-gray-500 pt-2 border-t border-[#1f2138] flex justify-between items-center">
          <span>Выбит: ${date}</span>${isUsed ? '<span class="text-emerald-400 font-bold">Использован ✓</span>' : `<button type="button" onclick="window.toggleWishStatus(${origIdx})" class="px-2.5 py-1 rounded-lg bg-pink-500/80 hover:bg-pink-500 text-white font-bold transition cursor-pointer">Отметить исп.</button>`}
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