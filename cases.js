/* =========================================================================
 * LEX LABS ENTERPRISE: CASES & SEASONAL EVENTS ENGINE
 * Файл: cases.js
 * ========================================================================= */

(function () {
  // Внутреннее состояние движка кейсов
  let isSpinningStandard = false;
  let isSpinningHalloween = false;
  let activeStandardCaseKey = "standard";

  /* -------------------------------------------------------------------------
   * 1. ДИНАМИЧЕСКИЙ РАСЧЕТ СТОИМОСТИ И ШАНСОВ (СВЯЗЬ С ДАШБОРДОМ)
   * ------------------------------------------------------------------------- */
  
  // Получение актуальной цены кейса с учетом правок из Дашборда
  function getCaseCost(caseKey) {
    const eco = window.currentCloudData?.economyConfig || window.ACTIVE_ECONOMY || {};

    if (caseKey === "standard") return eco.caseCostStandard || 80;
    if (caseKey === "premium")  return eco.caseCostPremium  || 160;
    if (caseKey === "black")    return eco.caseCostBlack    || 320;
    if (caseKey === "halloween") return eco.caseCostHalloween || window.HALLOWEEN_CASE_CONFIG?.cost || 130;

    return 100;
  }

  // Получение пула призов и актуальных шансов из облака или локальной базы
  function getCaseDrops(caseKey) {
    // Проверка правок шансов из Дашборда (allChances или caseSettings)
    const cloudAllChances = window.currentCloudData?.allChances;
    const cloudCaseSettings = window.currentCloudData?.caseSettings;

    if (caseKey === "halloween") {
      if (cloudAllChances?.case_hw && Array.isArray(cloudAllChances.case_hw)) {
        return cloudAllChances.case_hw;
      }
      return window.HALLOWEEN_CASE_CONFIG?.drops || [];
    }

    // Для стандартных кейсов
    const mapKey = { standard: "case_std", premium: "case_prem", black: "case_blk" }[caseKey];
    if (cloudAllChances?.[mapKey] && Array.isArray(cloudAllChances[mapKey])) {
      return cloudAllChances[mapKey];
    }
    if (cloudCaseSettings?.[caseKey] && Array.isArray(cloudCaseSettings[caseKey])) {
      return cloudCaseSettings[caseKey];
    }

    return window.CASES_DATA?.[caseKey]?.items || [];
  }

  // Взвешенный рандомайзер по процентам
  function pickWinningItem(items) {
    if (!items || items.length === 0) return null;
    let rand = Math.random() * 100;
    let cumulative = 0;
    let fallback = items[items.length - 1];

    for (let it of items) {
      cumulative += Number(it.chance) || 0;
      if (rand <= cumulative) {
        return it;
      }
    }
    return fallback;
  }

  /* -------------------------------------------------------------------------
   * 2. ЛОГИКА СТАНДАРТНЫХ КЕЙСОВ (CS:GO РУЛЕТКА)
   * ------------------------------------------------------------------------- */

  // Запуск окна и генерация первичной ленты
  window.launchCaseRoulette = function (caseKey) {
    activeStandardCaseKey = caseKey;
    const cData = window.CASES_DATA?.[caseKey];
    if (!cData) return;

    // Закрываем главное окно казино
    document.getElementById("modalCasinoHub")?.classList.add("hidden");

    const cost = getCaseCost(caseKey);
    const titleEl = document.getElementById("activeCaseTitle");
    const costEl = document.getElementById("activeCaseCostLabel");
    const bannerEl = document.getElementById("caseWonBanner");
    const cardEl = document.getElementById("caseRouletteCard");

    if (titleEl) titleEl.innerText = cData.title;
    if (costEl) costEl.innerText = `${cost} 🪙`;
    if (bannerEl) bannerEl.classList.add("hidden");
    if (cardEl) cardEl.classList.remove("animate-epic-glow");

    const track = document.getElementById("caseRouletteTrack");
    if (!track) return;

    // Мгновенный сброс ленты
    track.style.transition = "none";
    track.style.transform = "translateX(0px)";
    track.innerHTML = "";

    const items = getCaseDrops(caseKey);

    // Заполнение ленты 55 случайными карточками
    for (let i = 0; i < 55; i++) {
      const item = items[Math.floor(Math.random() * items.length)] || { name: "Приз", icon: "🎁", color: "#60a5fa" };
      const card = document.createElement("div");
      card.className = "flex-shrink-0 w-20 h-20 bg-[#1e1e2e] rounded-xl flex flex-col items-center justify-center p-1 border-b-4 text-center select-none";
      card.style.borderColor = item.color || "#60a5fa";
      card.innerHTML = `
        <span class="text-2xl">${cData.isClassified ? "❓" : item.icon}</span>
        <span class="text-[9px] text-gray-300 font-bold mt-1 truncate max-w-[70px]">${cData.isClassified ? "???" : item.name}</span>
      `;
      track.appendChild(card);
    }

    document.getElementById("modalCsgoCase")?.classList.remove("hidden");
  };

  // Клик по кнопке «ОТКРЫТЬ КЕЙС»
  document.getElementById("btnOpenCase")?.addEventListener("click", () => {
    if (isSpinningStandard) return;

    const cost = getCaseCost(activeStandardCaseKey);
    const cData = window.CASES_DATA?.[activeStandardCaseKey];

    // Проверка баланса
    if (window.pet.coins < cost) {
      alert(`Нужно ${cost} 🪙 для открытия кейса! Поиграй в мини-игры 🎮`);
      return;
    }

    // Списание средств
    window.pet.coins -= cost;
    if (window.analytics) {
      window.analytics.spentCoins = (window.analytics.spentCoins || 0) + cost;
      window.analytics.casesOpened = (window.analytics.casesOpened || 0) + 1;
    }
    if (typeof window.updatePetUI === "function") window.updatePetUI();

    isSpinningStandard = true;
    const btnOpen = document.getElementById("btnOpenCase");
    if (btnOpen) btnOpen.disabled = true;

    document.getElementById("caseWonBanner")?.classList.add("hidden");
    document.getElementById("caseRouletteCard")?.classList.remove("animate-epic-glow");

    const track = document.getElementById("caseRouletteTrack");
    if (!track) return;

    // Сброс дорожки и принудительный reflow браузера
    track.style.transition = "none";
    track.style.transform = "translateX(0px)";
    void track.offsetWidth;

    // Расчет победителя
    const drops = getCaseDrops(activeStandardCaseKey);
    const winningItem = pickWinningItem(drops);

    // Подстановка на финишную позицию (карточка #42)
    const cards = track.children;
    if (cards[42]) {
      cards[42].style.borderColor = winningItem.color || "#fbbf24";
      cards[42].innerHTML = `
        <span class="text-2xl">${winningItem.icon}</span>
        <span class="text-[9px] text-gray-300 font-bold mt-1 truncate max-w-[70px]">${winningItem.name}</span>
      `;
    }

    // Запуск прокрутки (5 секунд)
    track.style.transition = "transform 5s cubic-bezier(0.12, 0.8, 0.2, 1)";
    track.style.transform = `translateX(-${42 * 88 - 150 + 44}px)`;

    // Тиканье рулетки
    let tickInterval = setInterval(() => {
      if (window.sound && typeof window.sound.tick === "function") window.sound.tick();
    }, 140);

    setTimeout(() => {
      clearInterval(tickInterval);
      tickInterval = setInterval(() => {
        if (window.sound && typeof window.sound.tick === "function") window.sound.tick();
      }, 300);
    }, 3000);

    // Финал открытия
    setTimeout(() => {
      clearInterval(tickInterval);
      isSpinningStandard = false;
      if (btnOpen) btnOpen.disabled = false;

      // Отрисовка баннера
      const wonTitle = document.getElementById("caseWonTitle");
      const wonDesc = document.getElementById("caseWonDesc");
      if (wonTitle) {
        wonTitle.innerText = `${winningItem.icon} ${winningItem.name}`;
        wonTitle.style.color = winningItem.color || "#fbbf24";
      }
      if (wonDesc) wonDesc.innerText = winningItem.desc || "Получено из кейса";
      document.getElementById("caseWonBanner")?.classList.remove("hidden");

      // Звуки и эффекты
      if (winningItem.isEpic) {
        if (window.sound?.epicWin) window.sound.epicWin();
        document.getElementById("caseRouletteCard")?.classList.add("animate-epic-glow");
        if (typeof confetti === "function") confetti({ particleCount: 150, spread: 100 });
      } else {
        if (window.sound?.win) window.sound.win();
        if (typeof confetti === "function") confetti({ particleCount: 40, spread: 60 });
      }

      // Выдача награды в инвентарь/гардероб
      applyItemReward(winningItem);

      // Логирование и аналитика
      logCaseDrop(cData?.title || "Кейс", winningItem);
      if (typeof window.updatePetUI === "function") window.updatePetUI();
    }, 5200);
  });

  // Быстрые слушатели кнопок вызова стандартных кейсов
  document.getElementById("btnLaunchCaseStandard")?.addEventListener("click", () => window.launchCaseRoulette("standard"));
  document.getElementById("btnLaunchCasePremium")?.addEventListener("click",  () => window.launchCaseRoulette("premium"));
  document.getElementById("btnLaunchCaseBlack")?.addEventListener("click",    () => window.launchCaseRoulette("black"));

  /* -------------------------------------------------------------------------
   * 3. ЛОГИКА СЕЗОННОГО ХЕЛЛОУИНСКОГО СКЛЕПА (БАНДЛЫ И СЕТЫ)
   * ------------------------------------------------------------------------- */
  
  const hwModal = document.getElementById("modalHalloweenCase");
  const hwTrack = document.getElementById("hwRouletteTrack");
  const hwOpenBtn = document.getElementById("btnOpenHalloweenCase");

  // Открытие окна ивента
  document.getElementById("btnLaunchHalloweenModal")?.addEventListener("click", () => {
    hwModal?.classList.remove("hidden");
    initHalloweenTrack();
    if (typeof window.logAuditEvent === "function") window.logAuditEvent("Открыла Хеллоуинский Склеп", "🎃");
  });

  function initHalloweenTrack() {
    if (!hwTrack) return;
    hwTrack.style.transition = "none";
    hwTrack.style.transform = "translateX(0px)";
    hwTrack.innerHTML = "";
    document.getElementById("hwWonBanner")?.classList.add("hidden");

    const drops = getCaseDrops("halloween");

    for (let i = 0; i < 55; i++) {
      const item = drops[Math.floor(Math.random() * drops.length)] || { name: "Тыква", icon: "🎃", color: "#fb923c" };
      const card = document.createElement("div");
      card.className = "flex-shrink-0 w-20 h-20 bg-[#250d03] border-b-4 border-orange-500 rounded-xl flex flex-col items-center justify-center p-1 text-center select-none";
      card.innerHTML = `
        <span class="text-2xl">${item.icon}</span>
        <span class="text-[9px] text-amber-200 font-bold mt-1 truncate max-w-[70px]">${item.name}</span>
      `;
      hwTrack.appendChild(card);
    }
  }

  // Клик по кнопке «ОТКРЫТЬ СКЛЕП»
  hwOpenBtn?.addEventListener("click", () => {
    if (isSpinningHalloween) return;
    const cost = getCaseCost("halloween");

    if (window.pet.coins < cost) {
      alert(`Нужно ${cost} 🪙 для открытия склепа!`);
      return;
    }

    window.pet.coins -= cost;
    if (window.analytics) {
      window.analytics.spentCoins = (window.analytics.spentCoins || 0) + cost;
      window.analytics.casesOpened = (window.analytics.casesOpened || 0) + 1;
    }
    if (typeof window.updatePetUI === "function") window.updatePetUI();

    isSpinningHalloween = true;
    if (hwOpenBtn) hwOpenBtn.disabled = true;

    document.getElementById("hwWonBanner")?.classList.add("hidden");

    // Сброс и reflow ленты
    hwTrack.style.transition = "none";
    hwTrack.style.transform = "translateX(0px)";
    void hwTrack.offsetWidth;

    // Выбор приза (одиночный предмет или готовый бандл)
    const drops = getCaseDrops("halloween");
    const winningDrop = pickWinningItem(drops);

    const cards = hwTrack.children;
    if (cards[42]) {
      cards[42].style.borderColor = winningDrop.color || "#f97316";
      cards[42].innerHTML = `
        <span class="text-2xl">${winningDrop.icon}</span>
        <span class="text-[9px] text-amber-200 font-bold mt-1 truncate max-w-[70px]">${winningDrop.name}</span>
      `;
    }

    hwTrack.style.transition = "transform 5s cubic-bezier(0.12, 0.8, 0.2, 1)";
    hwTrack.style.transform = `translateX(-${42 * 88 - 150 + 44}px)`;

    let tickTimer = setInterval(() => {
      if (window.sound?.tick) window.sound.tick();
    }, 140);

    setTimeout(() => {
      clearInterval(tickTimer);
      tickTimer = setInterval(() => {
        if (window.sound?.tick) window.sound.tick();
      }, 300);
    }, 3000);

    setTimeout(() => {
      clearInterval(tickTimer);
      isSpinningHalloween = false;
      if (hwOpenBtn) hwOpenBtn.disabled = false;

      const titleEl = document.getElementById("hwWonTitle");
      const descEl = document.getElementById("hwWonDesc");
      if (titleEl) titleEl.innerText = `${winningDrop.icon} ${winningDrop.name}`;
      if (descEl) descEl.innerText = winningDrop.desc || "Хеллоуинский артефакт";
      document.getElementById("hwWonBanner")?.classList.remove("hidden");

      // ВЫДАЧА НАГРАДЫ: БАНДЛ ЦЕЛИКОМ ИЛИ ОДИНОЧНЫЙ ЭЛЕМЕНТ
      if (winningDrop.isBundle && Array.isArray(winningDrop.itemsIncluded)) {
        // ДЖЕКПОТ: Распаковка полного костюма
        if (window.sound?.epicWin) window.sound.epicWin();
        if (typeof confetti === "function") confetti({ particleCount: 180, spread: 110 });

        winningDrop.itemsIncluded.forEach((itemId) => {
          unlockCosmeticItem(itemId);
        });

        alert(`🎃 ДЖЕКПОТ ИВЕНТА!\nВы выбили ${winningDrop.name}!\nВсе элементы костюма и локация добавлены в инвентарь и надеты!`);
      } else {
        // Одиночный предмет
        if (window.sound?.win) window.sound.win();
        if (typeof confetti === "function") confetti({ particleCount: 50, spread: 60 });
        unlockCosmeticItem(winningDrop.id, winningDrop.slot);
      }

      logCaseDrop("Хеллоуинский Склеп", winningDrop);
      if (typeof window.updatePetUI === "function") window.updatePetUI();
    }, 5200);
  });

  /* -------------------------------------------------------------------------
   * 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ВЫДАЧИ И РАСПАКОВКИ
   * ------------------------------------------------------------------------- */
  
  // Разблокировка и экипировка конкретного ID предмета
  function unlockCosmeticItem(itemId, slotHint = null) {
    if (!itemId) return;

    // Проверка, является ли предмет комнатой
    if (itemId.includes("room_") || slotHint === "room") {
      if (!window.ownedRooms.includes(itemId)) {
        window.ownedRooms.push(itemId);
        localStorage.setItem("katya_master_rooms", JSON.stringify(window.ownedRooms));
      }
      window.pet.activeRoom = itemId;
      return;
    }

    // Проверка, является ли предмет окрасом шерстки
    if (itemId.startsWith("color_")) {
      const cId = itemId.replace("color_", "");
      window.pet.color = cId;
      if (!window.ownedItems.includes(itemId)) {
        window.ownedItems.push(itemId);
        localStorage.setItem("katya_owned_items", JSON.stringify(window.ownedItems));
      }
      return;
    }

    // Обычные элементы одежды (голова, глаза, тело, лапки)
    if (!window.ownedItems.includes(itemId)) {
      window.ownedItems.push(itemId);
      localStorage.setItem("katya_owned_items", JSON.stringify(window.ownedItems));
    }

    // Автоматическая экипировка по ключевым словам или переданному слоту
    if (slotHint === "head" || itemId.includes("hat") || itemId.includes("helm") || itemId.includes("ears") || itemId.includes("horns")) {
      window.activeEquipment.head = itemId;
    } else if (slotHint === "eyes" || itemId.includes("eyes") || itemId.includes("web") || itemId.includes("glasses")) {
      window.activeEquipment.eyes = itemId;
    } else if (slotHint === "body" || itemId.includes("robe") || itemId.includes("cape") || itemId.includes("sheet") || itemId.includes("hoodie") || itemId.includes("scarf")) {
      window.activeEquipment.body = itemId;
    } else if (slotHint === "legs" || itemId.includes("skirt") || itemId.includes("shoes") || itemId.includes("tights") || itemId.includes("boots")) {
      window.activeEquipment.legs = itemId;
    }

    localStorage.setItem("katya_active_equipment", JSON.stringify(window.activeEquipment));
  }

  // Применение стандартных наград (монеты, еда, одежда)
  function applyItemReward(item) {
    if (!item) return;

    // Если это возврат монет
    if (item.id.includes("coins") || item.id.includes("gold")) {
      const match = item.name.match(/\d+/);
      const amount = match ? parseInt(match[0], 10) : 50;
      window.pet.coins += amount;
      return;
    }

    // Если это кошачий сытный обед
    if (item.id.includes("food")) {
      window.pet.hunger = Math.min(100, (window.pet.hunger || 0) + 50);
      window.pet.happy = Math.min(100, (window.pet.happy || 0) + 20);
      return;
    }

    // Если это одежда/аксессуар
    unlockCosmeticItem(item.id, item.type);
  }

  // Логирование открытия кейса в историю и аудит
  function logCaseDrop(caseTitle, item) {
    if (!item) return;

    const historyEntry = {
      id: item.id,
      name: item.name,
      icon: item.icon,
      desc: item.desc || "",
      caseTitle: caseTitle,
      isEpic: !!(item.isEpic || item.isBundle),
      time: new Date().toLocaleString("ru-RU")
    };

    if (window.caseHistory) {
      window.caseHistory.push(historyEntry);
      localStorage.setItem("katya_master_case_history", JSON.stringify(window.caseHistory));
    }

    if (typeof window.logAuditEvent === "function") {
      window.logAuditEvent(`Открыла ${caseTitle}: «${item.name}»`, item.icon);
    }

    if (typeof window.savePet === "function") {
      window.savePet();
    }
  }

  /* -------------------------------------------------------------------------
   * 5. ЭКСПОРТ ДВИЖКА ДЛЯ ВНЕШНЕГО УПРАВЛЕНИЯ
   * ------------------------------------------------------------------------- */
  window.CasesEngine = {
    getCaseCost,
    getCaseDrops,
    openStandardCase: (key) => window.launchCaseRoulette(key),
    openHalloweenCase: () => hwOpenBtn?.click()
  };
})();