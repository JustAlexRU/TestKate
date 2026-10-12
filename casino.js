/* =========================================================================
 * LEX LABS ENTERPRISE: CASINO & GAMBLING ENGINE
 * Файл: casino.js
 * ========================================================================= */

(function () {
  /* -------------------------------------------------------------------------
   * 1. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И НАСТРОЙКИ
   * ------------------------------------------------------------------------- */
  function getBet(key, fallback) {
    return window.currentCloudData?.economyConfig?.[key] || window.ACTIVE_ECONOMY?.[key] || fallback;
  }

  function getOdds(category, fallbackKey) {
    if (window.currentCloudData?.allChances?.[category] && Array.isArray(window.currentCloudData.allChances[category])) {
      return window.currentCloudData.allChances[category];
    }
    if (window.DEFAULT_ODDS_DATABASE?.[fallbackKey || category]) {
      return window.DEFAULT_ODDS_DATABASE[fallbackKey || category];
    }
    return [];
  }

  function syncBalance() {
    if (typeof window.updatePetUI === "function") {
      window.updatePetUI();
    }
    const casinoCoins = document.getElementById("casinoHubCoins");
    if (casinoCoins && window.pet) {
      casinoCoins.innerText = window.pet.coins;
    }
  }

  function triggerWishWin(sourceTitle) {
    const code = "#WISH-" + Math.floor(10000 + Math.random() * 90000);
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + 3);
    const expStr = expDate.toLocaleDateString("ru-RU");

    const newCoupon = {
      code: code,
      source: sourceTitle,
      date: new Date().toLocaleDateString("ru-RU"),
      expiry: expStr,
      status: "active"
    };

    let vault = JSON.parse(localStorage.getItem("katya_master_wishes_vault")) || window.wishesVault || [];
    vault.push(newCoupon);
    window.wishesVault = vault;
    localStorage.setItem("katya_master_wishes_vault", JSON.stringify(vault));

    if (typeof window.logAuditEvent === "function") {
      window.logAuditEvent(`Выбила секретный купон на желание [${code}] в «${sourceTitle}»!`, "💌");
    }

    if (window.sound?.epicWin) window.sound.epicWin();
    if (typeof confetti === "function") confetti({ particleCount: 150, spread: 100 });

    const modalWish = document.getElementById("modalSecretWish");
    const numEl = document.getElementById("wishCouponNumber");
    const expEl = document.getElementById("wishCouponExpiry");
    if (numEl) numEl.innerText = code;
    if (expEl) expEl.innerText = `Действителен до: ${expStr}`;
    if (modalWish) modalWish.classList.remove("hidden");

    syncBalance();
  }

  /* -------------------------------------------------------------------------
   * 2. НАВИГАЦИЯ ПО ВКЛАДКАМ КАЗИНО ХАБА
   * ------------------------------------------------------------------------- */
  const modalHub = document.getElementById("modalCasinoHub");

  document.getElementById("btnCasinoHub")?.addEventListener("click", () => {
    syncBalance();
    modalHub?.classList.remove("hidden");
    if (typeof window.logAuditEvent === "function") {
      window.logAuditEvent("Открыла Казино «У Зефирки»", "🎰");
    }
  });

  const tabActiveCls = "flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-[10px] whitespace-nowrap shadow-md transition";
  const tabInactiveCls = "flex-1 py-1.5 px-2 rounded-xl text-gray-400 hover:text-white text-[10px] font-bold whitespace-nowrap transition";

  function switchCasinoTab(activeTabId, activeSectionId) {
    ["tabCasinoCases", "tabCasinoScratch", "tabCasinoSlots", "tabCasinoCrash", "tabCasinoDice"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.className = (id === activeTabId) ? tabActiveCls : tabInactiveCls;
    });

    ["casinoSectionCases", "casinoSectionScratch", "casinoSectionSlots", "casinoSectionCrash", "casinoSectionDice"].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === activeSectionId) {
          el.classList.remove("hidden");
          el.classList.add("flex");
        } else {
          el.classList.add("hidden");
          el.classList.remove("flex");
        }
      }
    });
  }

  document.getElementById("tabCasinoCases")?.addEventListener("click", () => switchCasinoTab("tabCasinoCases", "casinoSectionCases"));
  document.getElementById("tabCasinoScratch")?.addEventListener("click", () => switchCasinoTab("tabCasinoScratch", "casinoSectionScratch"));
  document.getElementById("tabCasinoSlots")?.addEventListener("click", () => switchCasinoTab("tabCasinoSlots", "casinoSectionSlots"));
  document.getElementById("tabCasinoCrash")?.addEventListener("click", () => switchCasinoTab("tabCasinoCrash", "casinoSectionCrash"));
  document.getElementById("tabCasinoDice")?.addEventListener("click", () => switchCasinoTab("tabCasinoDice", "casinoSectionDice"));

  /* -------------------------------------------------------------------------
   * 3. СЛОТЫ «777 ЛАПКИ» (SLOTS 777)
   * ------------------------------------------------------------------------- */
  const slotSymbols = ["🐱", "🍣", "🪙", "👑", "⭐", "💌", "🌸"];
  let isSlotSpinning = false;

  document.getElementById("btnSpinSlots")?.addEventListener("click", () => {
    if (isSlotSpinning) return;

    const betCost = getBet("betSlots", 20);
    if ((window.pet?.coins || 0) < betCost) {
      alert(`Нужно ${betCost} 🪙 для спина! Заработай в играх 🎮`);
      return;
    }

    window.pet.coins -= betCost;
    if (window.analytics) window.analytics.spentCoins = (window.analytics.spentCoins || 0) + betCost;
    syncBalance();

    isSlotSpinning = true;
    const spinBtn = document.getElementById("btnSpinSlots");
    if (spinBtn) spinBtn.disabled = true;

    const statusText = document.getElementById("slotStatusText");
    if (statusText) statusText.innerText = "Барабаны крутятся... 🎰";

    const odds = getOdds("slots");
    const pWish  = odds.find(x => x.id === "slot_wish")?.chance  || 1;
    const pStar  = odds.find(x => x.id === "slot_star")?.chance  || 2;
    const pCrown = odds.find(x => x.id === "slot_crown")?.chance || 5;
    const pCoins = odds.find(x => x.id === "slot_coins")?.chance || 12;
    const pSushi = odds.find(x => x.id === "slot_sushi")?.chance || 25;

    let spinsCount = 0;
    const spinInterval = setInterval(() => {
      document.getElementById("slotReel1").innerText = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
      document.getElementById("slotReel2").innerText = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
      document.getElementById("slotReel3").innerText = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];

      if (window.sound?.tick) window.sound.tick();
      spinsCount++;

      if (spinsCount > 16) {
        clearInterval(spinInterval);
        isSlotSpinning = false;
        if (spinBtn) spinBtn.disabled = false;

        const roll = Math.random() * 100;
        let r1, r2, r3, wonAmount = 0;
        let cumulative = 0;

        if (roll < (cumulative += pWish)) {
          r1 = r2 = r3 = "💌";
          triggerWishWin("Слоты 777");
        } else if (roll < (cumulative += pStar)) {
          r1 = r2 = r3 = "⭐";
          wonAmount = 150;
        } else if (roll < (cumulative += pCrown)) {
          r1 = r2 = r3 = "👑";
          wonAmount = 80;
        } else if (roll < (cumulative += pCoins)) {
          r1 = r2 = r3 = "🪙";
          wonAmount = 40;
        } else if (roll < (cumulative += pSushi)) {
          r1 = r2 = r3 = "🍣";
          wonAmount = 20;
        } else {
          // Реалистичный случайный набор несовпадающих символов
          do {
            r1 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            r2 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            r3 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
          } while (r1 === r2 && r2 === r3);
        }

        document.getElementById("slotReel1").innerText = r1;
        document.getElementById("slotReel2").innerText = r2;
        document.getElementById("slotReel3").innerText = r3;

        if (wonAmount > 0) {
          if (window.sound?.win) window.sound.win();
          if (typeof confetti === "function") confetti({ particleCount: 50, spread: 60 });
          window.pet.coins += wonAmount;
          if (statusText) statusText.innerHTML = `🎉 ПОБЕДА! <b class="text-amber-300">+${wonAmount} 🪙</b>`;
          if (typeof window.logAuditEvent === "function") window.logAuditEvent(`Слоты 777: выигрыш +${wonAmount} 🪙`, "🎰");
        } else if (r1 !== "💌") {
          if (window.sound?.pop) window.sound.pop();
          if (statusText) statusText.innerText = "Мимо! Попробуй еще разок 🐾";
        }

        syncBalance();
      }
    }, 90);
  });

  /* -------------------------------------------------------------------------
   * 4. МУР-КРАШ (CRASH ROCKET ENGINE)
   * ------------------------------------------------------------------------- */
  let isCrashRunning = false;
  let crashMultiplier = 1.00;
  let crashCrashPoint = 1.00;
  let crashTimer = null;

  const btnCrashStart = document.getElementById("btnCrashStart");
  const btnCrashCashout = document.getElementById("btnCrashCashout");
  const multText = document.getElementById("crashMultiplierText");
  const rocketIcon = document.getElementById("crashRocketIcon");
  const statusLabel = document.getElementById("crashStatusLabel");

  btnCrashStart?.addEventListener("click", () => {
    if (isCrashRunning) return;

    const crashBet = getBet("betCrash", 25);
    if ((window.pet?.coins || 0) < crashBet) {
      alert(`Нужно ${crashBet} 🪙 для запуска ракеты!`);
      return;
    }

    window.pet.coins -= crashBet;
    if (window.analytics) window.analytics.spentCoins = (window.analytics.spentCoins || 0) + crashBet;
    syncBalance();

    isCrashRunning = true;
    crashMultiplier = 1.00;

    const odds = getOdds("crash");
    const crEarly = odds.find(x => x.id === "cr_early")?.chance || 15;
    const crMid   = odds.find(x => x.id === "cr_mid")?.chance   || 50;
    const crHigh  = odds.find(x => x.id === "cr_high")?.chance  || 25;

    const roll = Math.random() * 100;
    if (roll < crEarly) {
      crashCrashPoint = 1.05 + Math.random() * 0.20;
    } else if (roll < (crEarly + crMid)) {
      crashCrashPoint = 1.30 + Math.random() * 1.50;
    } else if (roll < (crEarly + crMid + crHigh)) {
      crashCrashPoint = 2.80 + Math.random() * 2.70;
    } else {
      crashCrashPoint = 6.00 + Math.random() * 6.00;
    }

    if (btnCrashStart) {
      btnCrashStart.disabled = true;
      btnCrashStart.className = "flex-1 py-3.5 rounded-2xl bg-gray-700 text-gray-500 font-black text-xs cursor-not-allowed";
    }
    if (btnCrashCashout) {
      btnCrashCashout.disabled = false;
      btnCrashCashout.className = "flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 text-white font-black text-xs active:scale-95 shadow-lg animate-pulse cursor-pointer";
    }

    if (multText) multText.className = "mono-font text-4xl font-black text-amber-300";
    if (rocketIcon) {
      rocketIcon.innerText = "🚀";
      rocketIcon.style.transform = "translateY(-10px) rotate(-15deg)";
    }
    if (statusLabel) statusLabel.innerText = "Ракета летит! Забери выигрыш!";

    if (window.sound?.playTone) window.sound.playTone(400, "sine", 0.1, 0.1);

    crashTimer = setInterval(() => {
      crashMultiplier += 0.03 * (crashMultiplier * 0.35);
      if (multText) multText.innerText = `${crashMultiplier.toFixed(2)}x`;
      if (window.sound?.tick) window.sound.tick();

      if (crashMultiplier >= crashCrashPoint) {
        clearInterval(crashTimer);
        isCrashRunning = false;

        if (window.sound?.playTone) window.sound.playTone(110, "sawtooth", 0.3, 0.4);
        if (typeof triggerHaptic === "function") triggerHaptic();

        if (multText) multText.className = "mono-font text-4xl font-black text-rose-500";
        if (rocketIcon) {
          rocketIcon.innerText = "💥";
          rocketIcon.style.transform = "translateY(0px) rotate(0deg)";
        }
        if (statusLabel) statusLabel.innerText = `КРАШ на ${crashMultiplier.toFixed(2)}x! Ставка сгорела 🙀`;

        if (btnCrashCashout) {
          btnCrashCashout.disabled = true;
          btnCrashCashout.className = "flex-1 py-3.5 rounded-2xl bg-gray-700 text-gray-500 font-black text-xs cursor-not-allowed";
        }
        if (btnCrashStart) {
          btnCrashStart.disabled = false;
          btnCrashStart.className = "flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs active:scale-95 transition shadow-lg cursor-pointer";
        }
      }
    }, 100);
  });

  btnCrashCashout?.addEventListener("click", () => {
    if (!isCrashRunning) return;
    clearInterval(crashTimer);
    isCrashRunning = false;

    const crashBet = getBet("betCrash", 25);
    const wonCoins = Math.floor(crashBet * crashMultiplier);
    window.pet.coins += wonCoins;

    if (window.sound?.win) window.sound.win();
    if (typeof confetti === "function") confetti({ particleCount: 50, spread: 60 });

    if (statusLabel) {
      statusLabel.innerHTML = `ВЫИГРЫШ: <b class="text-amber-300">+${wonCoins} 🪙</b> (на ${crashMultiplier.toFixed(2)}x)!`;
    }
    if (typeof window.logAuditEvent === "function") {
      window.logAuditEvent(`Мур-Краш: зафиксировала x${crashMultiplier.toFixed(2)} (+${wonCoins} 🪙)`, "🚀");
    }

    btnCrashCashout.disabled = true;
    btnCrashCashout.className = "flex-1 py-3.5 rounded-2xl bg-gray-700 text-gray-500 font-black text-xs cursor-not-allowed";
    btnCrashStart.disabled = false;
    btnCrashStart.className = "flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs active:scale-95 transition shadow-lg cursor-pointer";

    syncBalance();
  });

  /* -------------------------------------------------------------------------
   * 5. КОШАЧЬИ КОСТИ (DICE GAME)
   * ------------------------------------------------------------------------- */
  window.playDiceGame = function (choice) {
    const diceBet = getBet("betDice", 15);
    if ((window.pet?.coins || 0) < diceBet) {
      alert(`Нужно ${diceBet} 🪙 для броска костей!`);
      return;
    }

    window.pet.coins -= diceBet;
    if (window.analytics) window.analytics.spentCoins = (window.analytics.spentCoins || 0) + diceBet;
    syncBalance();

    if (window.sound?.tick) window.sound.tick();
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const sum = d1 + d2;
    const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

    const val1 = document.getElementById("diceVal1");
    const val2 = document.getElementById("diceVal2");
    const sumText = document.getElementById("diceSumText");

    if (val1) val1.innerText = diceEmojis[d1 - 1];
    if (val2) val2.innerText = diceEmojis[d2 - 1];

    let won = 0;
    if (choice === "lo" && sum < 7) won = Math.round(diceBet * 2);
    else if (choice === "hi" && sum > 7) won = Math.round(diceBet * 2);
    else if (choice === "seven" && sum === 7) won = Math.round(diceBet * 5);

    if (won > 0) {
      if (sumText) sumText.innerHTML = `Сумма: <b class="text-emerald-400">${sum}</b> (Выигрыш +${won} 🪙!)`;
      if (window.sound?.win) window.sound.win();
      if (typeof confetti === "function") confetti({ particleCount: 35 });
      window.pet.coins += won;
      if (typeof window.logAuditEvent === "function") {
        window.logAuditEvent(`Кости: победа на «${choice}» (сумма ${sum}, +${won} 🪙)`, "🎲");
      }
    } else {
      if (sumText) sumText.innerHTML = `Сумма: <b class="text-rose-400">${sum}</b> (Мимо 🐾)`;
      if (window.sound?.pop) window.sound.pop();
    }
    syncBalance();
  };

  /* -------------------------------------------------------------------------
   * 6. СКРЕТЧ-КАРТЫ (SCRATCH CARDS)
   * ------------------------------------------------------------------------- */
  const modalScratch = document.getElementById("modalScratchCard");
  const scratchCanvas = document.getElementById("scratchCanvas");
  const sCtx = scratchCanvas ? scratchCanvas.getContext("2d") : null;
  const underlay = document.getElementById("scratchPrizeUnderlay");
  const progressVal = document.getElementById("scratchProgressVal");

  // Блокировка нативного свайпа страницы на мобилках
  if (scratchCanvas) {
    scratchCanvas.style.touchAction = "none";
  }

  let isScratching = false;
  let isScratchClaimed = false;
  let scratchPrizeData = null;

  window.openScratchCard = function (type) {
    const costs = {
      trio: getBet("scratchTrio", 30),
      fish: getBet("scratchFish", 75),
      vip:  getBet("scratchVip", 150)
    };
    const cost = costs[type] || 30;

    if ((window.pet?.coins || 0) < cost) {
      alert(`Нужно ${cost} 🪙 для покупки билета!`);
      return;
    }

    window.pet.coins -= cost;
    if (window.analytics) window.analytics.spentCoins = (window.analytics.spentCoins || 0) + cost;
    syncBalance();

    isScratchClaimed = false;
    modalHub?.classList.add("hidden");
    modalScratch?.classList.remove("hidden");

    buildScratchCard(type);
    initScratchLayer(type);

    if (typeof window.logAuditEvent === "function") {
      window.logAuditEvent(`Купила скретч-билет «${type}» (-${cost} 🪙)`, "🎟️");
    }
  };

  function buildScratchCard(type) {
    if (!underlay) return;
    underlay.innerHTML = "";
    if (progressVal) progressVal.innerText = "0%";

    const odds = getOdds("scratch");

    if (type === "fish") {
      document.getElementById("scratchTicketTitle").innerText = "🐟 «Золотая Рыбка»";
      underlay.className = "absolute inset-0 p-3 grid grid-cols-2 grid-rows-2 gap-3 items-center justify-items-center";

      const pFishWin = odds.find(x => x.id === "scr_fish_win")?.chance || 32;
      const isWinner = (Math.random() * 100) < pFishWin;

      scratchPrizeData = { won: isWinner, amount: 200, type: "fish" };
      let items = isWinner ? ["🐟", "🐚", "🦀", "🌿"] : ["🐚", "👢", "🌿", "🦀"];
      items.sort(() => Math.random() - 0.5);

      items.forEach(it => {
        underlay.innerHTML += `<div class="w-24 h-16 bg-[#121424] border border-[#2e304f] rounded-xl flex items-center justify-center text-4xl shadow-inner select-none">${it}</div>`;
      });

    } else if (type === "trio") {
      document.getElementById("scratchTicketTitle").innerText = "🎟️ Лотерея «Мур-Трио»";
      underlay.className = "absolute inset-0 p-3 grid grid-cols-3 grid-rows-2 gap-2 items-center justify-items-center";

      const roll = Math.random() * 100;
      const pCoupon = odds.find(x => x.id === "scr_trio_coupon")?.chance || 8;
      const pCoins  = odds.find(x => x.id === "scr_trio_coins")?.chance  || 45;

      let winSym = null, winAmount = 0;
      if (roll < pCoupon) { winSym = "💌"; winAmount = "КУПОН"; }
      else if (roll < (pCoupon + pCoins)) { winSym = "🪙"; winAmount = 60; }

      scratchPrizeData = { won: !!winSym, sym: winSym, amount: winAmount, type: "trio" };
      let symbols = winSym ? [winSym, winSym, winSym] : ["🍣", "🍕", "🍰", "🍣", "🍕", "🍰"];
      if (winSym) {
        const pool = ["🍣", "🍕", "🍰", "⭐", "🐾"].filter(s => s !== winSym);
        pool.sort(() => Math.random() - 0.5);
        symbols.push(pool[0], pool[1], pool[2]);
      }
      symbols.sort(() => Math.random() - 0.5);

      symbols.forEach(sym => {
        underlay.innerHTML += `<div class="w-16 h-16 bg-[#18192a] border border-[#2e304f] rounded-xl flex items-center justify-center text-3xl shadow-inner select-none">${sym}</div>`;
      });

    } else {
      document.getElementById("scratchTicketTitle").innerText = "⭐ «Таганрог VIP Express»";
      underlay.className = "absolute inset-0 p-4 flex flex-col items-center justify-center text-center";

      const roll = Math.random() * 100;
      const pVipCoupon  = odds.find(x => x.id === "scr_vip_coupon")?.chance  || 12;
      const pVipJackpot = odds.find(x => x.id === "scr_vip_jackpot")?.chance || 35;

      let prizeName = "Утешительный приз: 60 🪙", isWish = false, amount = 60;
      if (roll < pVipCoupon) {
        prizeName = "💌 СЕКРЕТНЫЙ КУПОН НА ЖЕЛАНИЕ!"; isWish = true;
      } else if (roll < (pVipCoupon + pVipJackpot)) {
        prizeName = "💰 Джекпот: 250 🪙!"; amount = 250;
      }

      scratchPrizeData = { won: true, prizeName, isWish, amount, type: "vip" };
      underlay.innerHTML = `
        <div class="bg-gradient-to-r from-amber-950/60 to-purple-950/60 border-2 border-amber-400 p-3 rounded-2xl w-full flex flex-col items-center shadow-lg">
          <span class="text-4xl animate-bounce">⭐</span>
          <div class="cute-font text-amber-300 font-black text-sm mt-1">${prizeName}</div>
          <div class="text-[10px] text-gray-300 mt-0.5">VIP Сертификат Lex Labs</div>
        </div>
      `;
    }
  }

  function initScratchLayer(type) {
    if (!sCtx || !scratchCanvas) return;
    sCtx.globalCompositeOperation = "source-over";
    const w = scratchCanvas.width, h = scratchCanvas.height;
    const grad = sCtx.createLinearGradient(0, 0, w, h);

    if (type === "vip") {
      grad.addColorStop(0, "#f59e0b"); grad.addColorStop(0.5, "#fef08a"); grad.addColorStop(1, "#b45309");
    } else {
      grad.addColorStop(0, "#94a3b8"); grad.addColorStop(0.5, "#f1f5f9"); grad.addColorStop(1, "#475569");
    }

    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, w, h);
    sCtx.fillStyle = type === "vip" ? "#78350f" : "#1e293b";
    sCtx.font = "bold 18px 'Comfortaa', sans-serif";
    sCtx.textAlign = "center";
    sCtx.fillText("🪙 СОТРИ ЛАПКОЙ! 🪙", w / 2, h / 2 - 10);
    sCtx.font = "bold 11px 'Nunito', sans-serif";
    sCtx.fillText("Сотри 55% защитного слоя", w / 2, h / 2 + 15);
  }

  function scratchBrush(x, y) {
    if (isScratchClaimed || !sCtx) return;
    sCtx.globalCompositeOperation = "destination-out";
    sCtx.beginPath();
    sCtx.arc(x, y, 22, 0, Math.PI * 2);
    sCtx.fill();

    if (window.sound?.playTone) {
      window.sound.playTone(800 + Math.random() * 300, "sawtooth", 0.03, 0.05);
    }
    checkScratchProgress();
  }

  function checkScratchProgress() {
    if (isScratchClaimed || !sCtx || !scratchCanvas) return;
    const w = scratchCanvas.width, h = scratchCanvas.height;
    const pixels = sCtx.getImageData(0, 0, w, h).data;
    let cleared = 0;
    for (let i = 3; i < pixels.length; i += 128) {
      if (pixels[i] === 0) cleared++;
    }
    const percent = Math.min(100, Math.round((cleared / (pixels.length / 128)) * 100));
    if (progressVal) progressVal.innerText = `${percent}%`;

    if (percent >= 55) {
      claimScratchAward();
    }
  }

  function claimScratchAward() {
    if (isScratchClaimed) return;
    isScratchClaimed = true;

    if (sCtx && scratchCanvas) {
      sCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    }
    if (progressVal) progressVal.innerText = "100%";
    if (!scratchPrizeData) return;

    if (scratchPrizeData.won) {
      if (window.sound?.win) window.sound.win();
      if (typeof confetti === "function") confetti({ particleCount: 75, spread: 80 });

      if (scratchPrizeData.type === "fish") {
        window.pet.coins += scratchPrizeData.amount;
        if (typeof window.logAuditEvent === "function") {
          window.logAuditEvent(`Лотерея «Золотая Рыбка»: ДЖЕКПОТ +${scratchPrizeData.amount} 🪙!`, "🐟");
        }
        alert(`🐟 ЗОЛОТАЯ РЫБКА НАЙДЕНА!\nТвой суперприз: +${scratchPrizeData.amount} 🪙!`);
      } else if (scratchPrizeData.type === "trio") {
        if (scratchPrizeData.amount === "КУПОН") {
          triggerWishWin("Лотерея «Мур-Трио»");
        } else {
          window.pet.coins += scratchPrizeData.amount;
          if (typeof window.logAuditEvent === "function") {
            window.logAuditEvent(`Лотерея «Мур-Трио»: выигрыш +${scratchPrizeData.amount} 🪙`, "🎟️");
          }
          alert(`🎉 ТРИ В РЯД!\nВыигрыш: +${scratchPrizeData.amount} 🪙!`);
        }
      } else if (scratchPrizeData.type === "vip") {
        if (scratchPrizeData.isWish) {
          triggerWishWin("Таганрог VIP Express");
        } else {
          window.pet.coins += scratchPrizeData.amount;
          if (typeof window.logAuditEvent === "function") {
            window.logAuditEvent(`Лотерея «VIP Express»: выигрыш +${scratchPrizeData.amount} 🪙`, "⭐");
          }
          alert(`⭐ VIP СЕРТИФИКАТ!\nНаграда: ${scratchPrizeData.prizeName}`);
        }
      }
    } else {
      if (window.sound?.pop) window.sound.pop();
      alert("В этот раз мимо! Попробуй другой билетик 🐾");
    }

    syncBalance();
  }

  function handleScratchPointer(e) {
    if (!isScratching || !scratchCanvas) return;
    e.preventDefault();
    const r = scratchCanvas.getBoundingClientRect();
    scratchBrush(
      (e.clientX - r.left) * (scratchCanvas.width / r.width),
      (e.clientY - r.top) * (scratchCanvas.height / r.height)
    );
  }

  scratchCanvas?.addEventListener("pointerdown", (e) => {
    isScratching = true;
    handleScratchPointer(e);
  });

  scratchCanvas?.addEventListener("pointermove", handleScratchPointer);
  window.addEventListener("pointerup", () => { isScratching = false; });
  window.addEventListener("pointercancel", () => { isScratching = false; });

  document.getElementById("btnScratchAutoReveal")?.addEventListener("click", claimScratchAward);
  document.getElementById("closeScratchBtn")?.addEventListener("click", () => modalScratch?.classList.add("hidden"));

  /* -------------------------------------------------------------------------
   * 7. ЭКСПОРТ ДВИЖКА
   * ------------------------------------------------------------------------- */
  window.CasinoEngine = {
    getBet,
    getOdds,
    syncBalance,
    openScratch: (type) => window.openScratchCard(type),
    playDice: (choice) => window.playDiceGame(choice)
  };
})();