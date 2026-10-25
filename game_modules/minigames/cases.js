/* =========================================================================
 * LEX LABS ENTERPRISE: CASES & SEASONAL EVENTS ENGINE
 * Файл: cases.js
 * ========================================================================= */

// 1. БАЗА ДАННЫХ СТАНДАРТНЫХ КЕЙСОВ КАЗИНО
window.CASES_DATA = {
  standard: {
    id: "case_standard",
    title: "Стандартный Лутбокс",
    costKey: "caseCostStandard",
    defaultCost: 80,
    oddsCategory: "case_std",
    items: [
      { id: "std_coins_20", name: "20 🪙 в копилку", icon: "🪙", color: "#60a5fa", chance: 45, desc: "Частичный возврат монет", type: "coins", amount: 20 },
      { id: "std_food", name: "Сытный кошачий обед", icon: "🍱", color: "#60a5fa", chance: 35, desc: "+50% к сытости котика", type: "food", hunger: 50 },
      { id: "std_scarf", name: "Теплый синий шарф", icon: "🧣", color: "#c084fc", chance: 15, desc: "Одежда на шею", type: "item", slot: "body" },
      { id: "std_gold", name: "Мешочек 60 🪙", icon: "💰", color: "#fbbf24", chance: 5, desc: "Золотой возврат", type: "coins", amount: 60 }
    ]
  },
  premium: {
    id: "case_premium",
    title: "Премиум Кейс Таганрога",
    costKey: "caseCostPremium",
    defaultCost: 160,
    oddsCategory: "case_prem",
    items: [
      { id: "prem_coffee", name: "Сладкий кофе в Таганрог", icon: "☕", color: "#ef4444", chance: 12, desc: "Доставка стаканчика кофе Кате", type: "service" },
      { id: "prem_hoodie", name: "Розовое оверсайз-худи", icon: "👗", color: "#f472b6", chance: 25, desc: "Уютный наряд для котика", type: "item", slot: "body" },
      { id: "prem_cinema", name: "Уютный Киновечер онлайн", icon: "🎬", color: "#f472b6", chance: 20, desc: "Выбор фильма и совместный просмотр", type: "service" },
      { id: "prem_song", name: "Кавер/Трек от Алексея", icon: "🎵", color: "#c084fc", chance: 23, desc: "Персональное аудиосообщение", type: "service" },
      { id: "prem_coins", name: "Мешок золота: 80 🪙", icon: "💰", color: "#c084fc", chance: 20, desc: "Возврат монет", type: "coins", amount: 80 }
    ]
  },
  black: {
    id: "case_black",
    title: "★ CLASSIFIED BLACK BOX ★",
    costKey: "caseCostBlack",
    defaultCost: 320,
    oddsCategory: "case_blk",
    isClassified: true,
    items: [
      { id: "blk_super_box", name: "★ СЕКРЕТНЫЙ БОКС В ТАГАНРОГ ★", icon: "⭐", color: "#fbbf24", chance: 5, desc: "Золотой суперприз: посылка в ПВЗ!", isEpic: true, type: "service" },
      { id: "blk_wish_coupon", name: "💌 СЕКРЕТНЫЙ КУПОН НА ЖЕЛАНИЕ", icon: "💌", color: "#fbbf24", chance: 10, desc: "Любое желание Кати!", isEpic: true, type: "wish" },
      { id: "blk_argument", name: "Иммунитет в споре (Правота)", icon: "🛡️", color: "#f472b6", chance: 30, desc: "Безоговорочная победа в споре", type: "service" },
      { id: "blk_coffee_dessert", name: "Кофе + Бенто-торт в Таганрог", icon: "🍰", color: "#ef4444", chance: 25, desc: "Сладкая доставка", type: "service" },
      { id: "blk_gold_back", name: "Мега-сокровищница 150 🪙", icon: "💰", color: "#c084fc", chance: 30, desc: "Возврат половины стоимости кейса", type: "coins", amount: 150 }
    ]
  }
};

(function () {
  let isSpinningStandard = false;
  let isSpinningHalloween = false;
  let activeStandardCaseKey = "standard";

  /* -------------------------------------------------------------------------
   * 2. ДИНАМИЧЕСКИЙ РАСЧЕТ СТОИМОСТИ И ШАНСОВ
   * ------------------------------------------------------------------------- */
  function getCaseCost(caseKey) {
    const eco = window.currentCloudData?.economyConfig || window.ACTIVE_ECONOMY || {};

    if (caseKey === "standard") return eco.caseCostStandard || 80;
    if (caseKey === "premium")  return eco.caseCostPremium  || 160;
    if (caseKey === "black")    return eco.caseCostBlack    || 320;
    if (caseKey === "halloween") return eco.caseCostHalloween || window.HALLOWEEN_CASE_CONFIG?.cost || 130;

    return 100;
  }

  function getCaseDrops(caseKey) {
    const cloudAllChances = window.currentCloudData?.allChances;
    const cloudCaseSettings = window.currentCloudData?.caseSettings;

    if (caseKey === "halloween") {
      if (cloudAllChances?.case_hw && Array.isArray(cloudAllChances.case_hw)) {
        return cloudAllChances.case_hw;
      }
      return window.HALLOWEEN_CASE_CONFIG?.drops || [];
    }

    const mapKey = { standard: "case_std", premium: "case_prem", black: "case_blk" }[caseKey];
    if (cloudAllChances?.[mapKey] && Array.isArray(cloudAllChances[mapKey])) {
      return cloudAllChances[mapKey];
    }
    if (cloudCaseSettings?.[caseKey] && Array.isArray(cloudCaseSettings[caseKey])) {
      return cloudCaseSettings[caseKey];
    }

    return window.CASES_DATA?.[caseKey]?.items || [];
  }

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
   * 3. ЛОГИКА СТАНДАРТНЫХ КЕЙСОВ (CS:GO РУЛЕТКА)
   * ------------------------------------------------------------------------- */
  window.launchCaseRoulette = function (caseKey) {
    activeStandardCaseKey = caseKey;
    const cData = window.CASES_DATA?.[caseKey];
    if (!cData) return;

    // Закрываем хаб казино
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

    track.style.transition = "none";
    track.style.transform = "translateX(0px)";
    track.innerHTML = "";

    const items = getCaseDrops(caseKey);

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

  document.getElementById("btnOpenCase")?.addEventListener("click", () => {
    if (isSpinningStandard) return;

    const cost = getCaseCost(activeStandardCaseKey);
    const cData = window.CASES_DATA?.[activeStandardCaseKey];

    if ((window.pet?.coins || 0) < cost) {
      alert(`Нужно ${cost} 🪙 для открытия кейса! Поиграй в мини-игры 🎮`);
      return;
    }

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

    track.style.transition = "none";
    track.style.transform = "translateX(0px)";
    void track.offsetWidth;

    const drops = getCaseDrops(activeStandardCaseKey);
    const winningItem = pickWinningItem(drops);

    const cards = track.children;
    if (cards[42]) {
      cards[42].style.borderColor = winningItem.color || "#fbbf24";
      cards[42].innerHTML = `
        <span class="text-2xl">${winningItem.icon}</span>
        <span class="text-[9px] text-gray-300 font-bold mt-1 truncate max-w-[70px]">${winningItem.name}</span>
      `;
    }

    track.style.transition = "transform 5s cubic-bezier(0.12, 0.8, 0.2, 1)";
    track.style.transform = `translateX(-${42 * 88 - 150 + 44}px)`;

    let tickInterval = setInterval(() => {
      if (window.sound && typeof window.sound.tick === "function") window.sound.tick();
    }, 140);

    setTimeout(() => {
      clearInterval(tickInterval);
      tickInterval = setInterval(() => {
        if (window.sound && typeof window.sound.tick === "function") window.sound.tick();
      }, 300);
    }, 3000);

    setTimeout(() => {
      clearInterval(tickInterval);
      isSpinningStandard = false;
      if (btnOpen) btnOpen.disabled = false;

      const wonTitle = document.getElementById("caseWonTitle");
      const wonDesc = document.getElementById("caseWonDesc");

      if (winningItem.isEpic) {
        if (window.sound?.epicWin) window.sound.epicWin();
        document.getElementById("caseRouletteCard")?.classList.add("animate-epic-glow");
        if (typeof confetti === "function") confetti({ particleCount: 150, spread: 100 });
      } else {
        if (window.sound?.win) window.sound.win();
        if (typeof confetti === "function") confetti({ particleCount: 40, spread: 60 });
      }

      const isCosmetic = winningItem.type === "item" || !!winningItem.slot || 
        (!["coins", "food", "service", "wish"].includes(winningItem.type) && 
         !winningItem.id?.includes("coins") && 
         !winningItem.id?.includes("food") && 
         !winningItem.id?.includes("wish") && 
         !winningItem.id?.startsWith("blk_") && 
         !winningItem.id?.startsWith("prem_coffee") && 
         !winningItem.id?.startsWith("prem_cinema") && 
         !winningItem.id?.startsWith("prem_song"));

      let dupData = null;
      if (isCosmetic && isCosmeticOwned(winningItem.id, winningItem.slot)) {
        dupData = handleDuplicateReward(winningItem, winningItem.chance, cData?.title || "Кейс");
      } else {
        applyItemReward(winningItem);
      }

      if (dupData) {
        if (wonTitle) {
          wonTitle.innerHTML = `<span class="text-amber-300">✨ ПОВТОРКА! +${dupData.sparks} ИСКР ✨</span><br><span class="text-xs opacity-90 text-purple-200">${winningItem.icon} ${winningItem.name}</span>`;
        }
        if (wonDesc) {
          wonDesc.innerHTML = `<span class="text-emerald-300 font-bold text-xs">🍣 Котик накормлен деликатесом (+40% сытости, +30% радости)!</span><br><span class="text-pink-300 italic text-[11px] leading-relaxed mt-1 block">💌 «${dupData.compliment}»</span>`;
        }
      } else {
        if (wonTitle) {
          wonTitle.innerText = `${winningItem.icon} ${winningItem.name}`;
          wonTitle.style.color = winningItem.color || "#fbbf24";
        }
        if (wonDesc) wonDesc.innerText = winningItem.desc || "Получено из кейса";
      }
      document.getElementById("caseWonBanner")?.classList.remove("hidden");

      logCaseDrop(cData?.title || "Кейс", winningItem, dupData);
      if (typeof window.updatePetUI === "function") window.updatePetUI();

      // Lex Labs Achievements hooks
      if (typeof window.trackAchievement === "function") {
        window.trackAchievement("cases_open_first", 1);
        if (activeStandardCaseKey === "black") {
          window.trackAchievement("cases_black_box", 1);
        }
        if (winningItem.id === "blk_super_box") {
          window.trackAchievement("cases_super_box", 1);
          window.trackAchievement("love_real_gift", 1);
        } else if (winningItem.id === "blk_argument") {
          window.trackAchievement("cases_immunity", 1);
        } else if (["prem_coffee", "prem_hoodie", "prem_cinema", "prem_song"].includes(winningItem.id)) {
          window.trackAchievement("cases_premium_gift", 1);
        }
        if (dupData) {
          window.trackAchievement("wardrobe_compliments_5", 1);
        }
      }
      if (typeof window.checkCareAchievements === "function") window.checkCareAchievements();
    }, 5200);
  });


  // Слушатели кнопок вызова кейсов из меню казино
  document.getElementById("btnLaunchCaseStandard")?.addEventListener("click", () => window.launchCaseRoulette("standard"));
  document.getElementById("btnLaunchCasePremium")?.addEventListener("click",  () => window.launchCaseRoulette("premium"));
  document.getElementById("btnLaunchCaseBlack")?.addEventListener("click",    () => window.launchCaseRoulette("black"));

  /* -------------------------------------------------------------------------
   * 4. ЛОГИКА ХЕЛЛОУИНСКОГО СКЛЕПА
   * ------------------------------------------------------------------------- */
  const hwModal = document.getElementById("modalHalloweenCase");
  const hwTrack = document.getElementById("hwRouletteTrack");
  const hwOpenBtn = document.getElementById("btnOpenHalloweenCase");

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

  hwOpenBtn?.addEventListener("click", () => {
    if (isSpinningHalloween) return;
    const cost = getCaseCost("halloween");

    if ((window.pet?.coins || 0) < cost) {
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

    hwTrack.style.transition = "none";
    hwTrack.style.transform = "translateX(0px)";
    void hwTrack.offsetWidth;

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

      if (winningDrop.isBundle && Array.isArray(winningDrop.itemsIncluded)) {
        if (window.sound?.epicWin) window.sound.epicWin();
        if (typeof confetti === "function") confetti({ particleCount: 180, spread: 110 });

        const newItems = [];
        const dupItems = [];
        let bundleSparks = 0;

        winningDrop.itemsIncluded.forEach((itemId) => {
          if (isCosmeticOwned(itemId)) {
            dupItems.push(itemId);
            const partSparks = typeof window.calculateDuplicateSparks === "function"
              ? window.calculateDuplicateSparks(itemId, 5)
              : 3;
            bundleSparks += partSparks;
          } else {
            newItems.push(itemId);
            unlockCosmeticItem(itemId);
          }
        });

        let compliment = "Ты просто космос! ✨";
        if (dupItems.length > 0) {
          window.pet.starSparks = (window.pet.starSparks || 0) + bundleSparks;
          window.pet.hunger = Math.min(100, (window.pet.hunger || 0) + 40);
          window.pet.happy = Math.min(100, (window.pet.happy || 0) + 30);
          const compliments = window.ROMANTIC_COMPLIMENTS || [];
          compliment = compliments[Math.floor(Math.random() * compliments.length)] || compliment;
          if (typeof window.logAuditEvent === "function") {
            window.logAuditEvent(`Сет «${winningDrop.name}»: ${newItems.length} новых, ${dupItems.length} повторок (+${bundleSparks} ✨)`, "🎃");
          }
        }

        if (titleEl) titleEl.innerText = `${winningDrop.icon} ${winningDrop.name}`;
        if (descEl) {
          if (dupItems.length > 0) {
            descEl.innerHTML = `<span class="text-amber-300 font-bold">Новых элементов: ${newItems.length} шт</span> | <span class="text-purple-300 font-bold">Повторок: ${dupItems.length} (+${bundleSparks} ✨)</span><br><span class="text-emerald-300 font-bold text-xs">🍣 Котик сыт и доволен!</span><br><span class="text-pink-300 italic text-[11px] leading-relaxed mt-1 block">💌 «${compliment}»</span>`;
          } else {
            descEl.innerText = "🎃 ДЖЕКПОТ! Все элементы сета добавлены в гардероб!";
          }
        }
        document.getElementById("hwWonBanner")?.classList.remove("hidden");

        if (dupItems.length > 0) {
          alert(`🎃 ДЖЕКПОТ ИВЕНТА: ${winningDrop.name}!\n\n✨ Новых элементов добавлено: ${newItems.length} шт\n💎 За ${dupItems.length} повторок начислено: +${bundleSparks} Звёздных Искр!\n🍣 Котик накормлен деликатесом!`);
        } else {
          alert(`🎃 ДЖЕКПОТ ИВЕНТА!\nВы выбили ${winningDrop.name}!\nВсе элементы костюма и локация добавлены в инвентарь!`);
        }
      } else {
        if (isCosmeticOwned(winningDrop.id, winningDrop.slot)) {
          const dupData = handleDuplicateReward(winningDrop, winningDrop.chance, "Хеллоуинский Склеп");
          if (titleEl) {
            titleEl.innerHTML = `<span class="text-amber-300">✨ ПОВТОРКА! +${dupData.sparks} ИСКР ✨</span><br><span class="text-xs opacity-90 text-orange-200">${winningDrop.icon} ${winningDrop.name}</span>`;
          }
          if (descEl) {
            descEl.innerHTML = `<span class="text-emerald-300 font-bold text-xs">🍣 Котик накормлен деликатесом (+40% сытости, +30% радости)!</span><br><span class="text-pink-300 italic text-[11px] leading-relaxed mt-1 block">💌 «${dupData.compliment}»</span>`;
          }
        } else {
          unlockCosmeticItem(winningDrop.id, winningDrop.slot);
          if (titleEl) titleEl.innerText = `${winningDrop.icon} ${winningDrop.name}`;
          if (descEl) descEl.innerText = winningDrop.desc || "Хеллоуинский артефакт";
        }
        document.getElementById("hwWonBanner")?.classList.remove("hidden");

        if (window.sound?.win) window.sound.win();
        if (typeof confetti === "function") confetti({ particleCount: 50, spread: 60 });
      }

      logCaseDrop("Хеллоуинский Склеп", winningDrop);
      if (typeof window.updatePetUI === "function") window.updatePetUI();

      if (typeof window.trackAchievement === "function") {
        window.trackAchievement("cases_halloween_5", 1);
        if (winningDrop.isBundle) {
          window.trackAchievement("wardrobe_hw_bundle", 1);
        }
      }
      if (typeof window.checkCareAchievements === "function") window.checkCareAchievements();
    }, 5200);
  });

  /* -------------------------------------------------------------------------
   * 5. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ВЫДАЧИ И АТЕЛЬЕ
   * ------------------------------------------------------------------------- */
  function isColorItem(itemId, slotHint = null) {
    if (slotHint === "color" || itemId?.startsWith("color_")) return true;
    if (window.GAME_ITEMS_DB?.color?.some(c => c.id === itemId)) return true;
    return false;
  }

  function isRoomItem(itemId, slotHint = null) {
    if (slotHint === "room" || itemId?.includes("room_")) return true;
    if (window.GAME_ITEMS_DB?.room?.some(r => r.id === itemId)) return true;
    return false;
  }

  function isCosmeticOwned(itemId, slotHint = null) {
    if (!itemId) return false;
    if (isRoomItem(itemId, slotHint)) {
      const rooms = window.ownedRooms || ["neon"];
      return rooms.includes(itemId);
    }
    if (isColorItem(itemId, slotHint)) {
      const cId = itemId.replace(/^color_/, "");
      const items = window.ownedItems || [];
      return items.includes("color_" + cId) || items.includes(cId) || window.pet?.color === cId;
    }
    const items = window.ownedItems || [];
    return items.includes(itemId);
  }

  function handleDuplicateReward(item, dropChance, caseTitle) {
    const sparks = typeof window.calculateDuplicateSparks === "function"
      ? window.calculateDuplicateSparks(item, dropChance)
      : 2;

    window.pet.starSparks = (window.pet.starSparks || 0) + sparks;
    // Королевский деликатес для котика
    window.pet.hunger = Math.min(100, (window.pet.hunger || 0) + 40);
    window.pet.happy = Math.min(100, (window.pet.happy || 0) + 30);
    window.pet.energy = Math.min(100, (window.pet.energy || 0) + 15);

    const compliments = window.ROMANTIC_COMPLIMENTS || [
      "Этот наряд у тебя уже есть, но ты в нём просто великолепна! 😍"
    ];
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];

    if (typeof window.logAuditEvent === "function") {
      window.logAuditEvent(`Повторка «${item.name || item.id}»: +${sparks} ✨ и угощение котику!`, "✨");
    }

    return {
      sparks,
      compliment
    };
  }

  function unlockCosmeticItem(itemId, slotHint = null) {
    if (!itemId) return;

    if (isRoomItem(itemId, slotHint)) {
      if (!window.ownedRooms) window.ownedRooms = ["neon"];
      if (!window.ownedRooms.includes(itemId)) {
        window.ownedRooms.push(itemId);
        localStorage.setItem("katya_master_rooms", JSON.stringify(window.ownedRooms));
      }
      window.pet.activeRoom = itemId;
      return;
    }

    if (isColorItem(itemId, slotHint)) {
      const cId = itemId.replace(/^color_/, "");
      window.pet.color = cId;
      if (!window.ownedItems) window.ownedItems = [];
      if (!window.ownedItems.includes("color_" + cId)) window.ownedItems.push("color_" + cId);
      if (!window.ownedItems.includes(cId)) window.ownedItems.push(cId);
      localStorage.setItem("katya_owned_items", JSON.stringify(window.ownedItems));
      return;
    }

    if (!window.ownedItems) window.ownedItems = [];
    if (!window.ownedItems.includes(itemId)) {
      window.ownedItems.push(itemId);
      localStorage.setItem("katya_owned_items", JSON.stringify(window.ownedItems));
    }

    let detectedSlot = slotHint;
    if (!detectedSlot && window.GAME_ITEMS_DB) {
      for (const slot of ["head", "eyes", "body", "legs"]) {
        if (window.GAME_ITEMS_DB[slot]?.some(x => x.id === itemId)) {
          detectedSlot = slot;
          break;
        }
      }
    }
    if (!detectedSlot) {
      if (itemId.includes("hat") || itemId.includes("helm") || itemId.includes("ears") || itemId.includes("horns")) {
        detectedSlot = "head";
      } else if (itemId.includes("eyes") || itemId.includes("web") || itemId.includes("glasses") || itemId.includes("stitches") || itemId.includes("mask") || itemId.includes("glow")) {
        detectedSlot = "eyes";
      } else if (itemId.includes("robe") || itemId.includes("cape") || itemId.includes("sheet") || itemId.includes("hoodie") || itemId.includes("scarf") || itemId.includes("suit") || itemId.includes("wraps")) {
        detectedSlot = "body";
      } else if (itemId.includes("skirt") || itemId.includes("shoes") || itemId.includes("tights") || itemId.includes("boots") || itemId.includes("trousers") || itemId.includes("hooves") || itemId.includes("chains")) {
        detectedSlot = "legs";
      }
    }

    if (detectedSlot) {
      if (!window.activeEquipment) window.activeEquipment = {};
      window.activeEquipment[detectedSlot] = itemId;
      localStorage.setItem("katya_active_equipment", JSON.stringify(window.activeEquipment));
    }
  }


  function applyItemReward(item) {
    if (!item) return;

    // Возврат монет
    if (item.type === "coins" || item.id.includes("coins") || item.id.includes("gold")) {
      const match = item.name.match(/\d+/);
      const amount = match ? parseInt(match[0], 10) : (item.amount || 50);
      window.pet.coins += amount;
      return;
    }

    // Сытный обед
    if (item.type === "food" || item.id.includes("food")) {
      window.pet.hunger = Math.min(100, (window.pet.hunger || 0) + 50);
      window.pet.happy = Math.min(100, (window.pet.happy || 0) + 20);
      return;
    }

    // Секретный купон на желание Кати
    if (item.type === "wish" || item.id === "blk_wish_coupon") {
      createSecretCoupon("Black Box");
      return;
    }

    // Предмет гардероба
    unlockCosmeticItem(item.id, item.slot || item.type);
  }

  function createSecretCoupon(sourceName) {
    const code = "#WISH-" + Math.floor(10000 + Math.random() * 90000);
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + 3);
    const expStr = expDate.toLocaleDateString("ru-RU");

    const newCoupon = {
      code: code,
      source: sourceName,
      date: new Date().toLocaleDateString("ru-RU"),
      expiry: expStr,
      status: "active"
    };

    let vault = JSON.parse(localStorage.getItem("katya_master_wishes_vault")) || window.wishesVault || [];
    vault.push(newCoupon);
    window.wishesVault = vault;
    localStorage.setItem("katya_master_wishes_vault", JSON.stringify(vault));

    const modalWish = document.getElementById("modalSecretWish");
    const numEl = document.getElementById("wishCouponNumber");
    const expEl = document.getElementById("wishCouponExpiry");
    if (numEl) numEl.innerText = code;
    if (expEl) expEl.innerText = `Действителен до: ${expStr}`;
    if (modalWish) modalWish.classList.remove("hidden");
  }

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

  function exchangeAtelierRecipe(recipeId) {
    const recipes = window.ATELIER_RECIPES || [];
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const currentSparks = window.pet?.starSparks || 0;
    if (currentSparks < recipe.cost) {
      alert(`Нужно ${recipe.cost} ✨ Звёздных Искр для этого обмена! Открывай кейсы, чтобы получать искры за повторки 🎁`);
      return;
    }

    window.pet.starSparks = currentSparks - recipe.cost;

    if (recipe.type === "coins") {
      window.pet.coins = (window.pet.coins || 0) + (recipe.amount || 100);
      alert(`✨ Обмен успешен!\nВам начислено +${recipe.amount || 100} 🪙 в копилку!`);
    } else if (recipe.type === "wish") {
      createSecretCoupon("Ателье Звёздных Искр");
      alert(`💌 ВОЛШЕБНЫЙ ОБМЕН!\nВам выдан новый секретный купон на романтическое желание!`);
    } else if (recipe.type === "item_pity") {
      const db = window.GAME_ITEMS_DB || {};
      const slots = ["head", "eyes", "body", "legs"];
      const missingItems = [];

      slots.forEach(slot => {
        if (Array.isArray(db[slot])) {
          db[slot].forEach(it => {
            if (it.id !== "none" && !isCosmeticOwned(it.id, slot)) {
              missingItems.push(Object.assign({ slotHint: slot }, it));
            }
          });
        }
      });

      if (window.HALLOWEEN_CASE_CONFIG?.drops) {
        window.HALLOWEEN_CASE_CONFIG.drops.forEach(d => {
          if (!d.isBundle && !isCosmeticOwned(d.id, d.slot)) {
            missingItems.push(Object.assign({ slotHint: d.slot }, d));
          }
        });
      }

      if (missingItems.length > 0) {
        const awarded = missingItems[Math.floor(Math.random() * missingItems.length)];
        unlockCosmeticItem(awarded.id, awarded.slotHint || awarded.slot);
        alert(`✨ АТЕЛЬЕ: ИНДИВИДУАЛЬНЫЙ ПОШИВ!\n\nВы получили новый наряд:\n${awarded.icon || "👗"} ${awarded.name}!\nПредмет добавлен в гардероб!`);
      } else {
        window.pet.coins = (window.pet.coins || 0) + 250;
        alert(`👑 ВСЕ НАГРАДЫ УЖЕ СОБРАНЫ!\nВся коллекция гардероба у вас в руках! Начислено +250 🪙 компенсации!`);
      }
    }

    if (window.sound?.win) window.sound.win();
    if (typeof confetti === "function") confetti({ particleCount: 70, spread: 80 });

    if (typeof window.logAuditEvent === "function") {
      window.logAuditEvent(`Обмен в Ателье: «${recipe.title}» (-${recipe.cost} ✨)`, "✨");
    }

    if (typeof window.trackAchievement === "function") {
      window.trackAchievement("atelier_first_craft", 1);
      if (recipe.type === "item_pity") {
        window.trackAchievement("atelier_pity_exchange", 1);
      }
    }
    if (typeof window.checkCareAchievements === "function") window.checkCareAchievements();

    if (typeof window.updatePetUI === "function") window.updatePetUI();
    if (typeof window.renderWardrobeAtelierTab === "function") window.renderWardrobeAtelierTab();
    if (typeof window.savePet === "function") window.savePet();
  }

  window.exchangeAtelierRecipe = exchangeAtelierRecipe;

  window.CasesEngine = {
    getCaseCost,
    getCaseDrops,
    openStandardCase: (key) => window.launchCaseRoulette(key),
    openHalloweenCase: () => hwOpenBtn?.click(),
    exchangeAtelierRecipe,
    isCosmeticOwned,
    handleDuplicateReward
  };
})();