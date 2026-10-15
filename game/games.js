/* =========================================================================
 * LEX LABS ENTERPRISE: MINI-GAMES ENGINE
 * Файл: games.js (Рыбалка, Память, Тетрис, Subway Cat, Курьер, Osu!)
 * ========================================================================= */

(function () {
  /* -------------------------------------------------------------------------
   * ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И НАГРАДЫ
   * ------------------------------------------------------------------------- */
  function getRewardLimit(key, fallback) {
    return window.currentCloudData?.economyConfig?.[key] || window.ACTIVE_ECONOMY?.[key] || fallback;
  }

  function getWishChance(gameKey, fallback) {
    return window.currentCloudData?.wishChances?.[gameKey] || window.ACTIVE_WISH_CHANCES?.[gameKey] || fallback;
  }

  // Выпадение и полноценное сохранение секретного купона
  function checkAndDropWish(gameKey, defaultChance, sourceTitle) {
    const chance = getWishChance(gameKey, defaultChance);
    if (Math.random() <= chance) {
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
      if (typeof confetti === "function") confetti({ particleCount: 160, spread: 100 });

      const modalWish = document.getElementById("modalSecretWish");
      const numEl = document.getElementById("wishCouponNumber");
      const expEl = document.getElementById("wishCouponExpiry");
      if (numEl) numEl.innerText = code;
      if (expEl) expEl.innerText = `Действителен до: ${expStr}`;
      if (modalWish) modalWish.classList.remove("hidden");
    }
  }

  /* =========================================================================
   * 1. КОШАЧЬЯ РЫБАЛКА (FISHING)
   * ========================================================================= */
  const modalFishing = document.getElementById("modalFishing");
  const btnFishingAction = document.getElementById("btnFishingAction");
  const fishingBobber = document.getElementById("fishingBobber");
  const fishingAlert = document.getElementById("fishingAlert");
  const fishingResult = document.getElementById("fishingResult");

  let fishingState = "idle";
  let fishingWaitTimer = null;
  let fishingBiteTimer = null;

  document.getElementById("btnJobFishing")?.addEventListener("click", () => {
    document.getElementById("modalWork")?.classList.add("hidden");
    modalFishing?.classList.remove("hidden");
    resetFishingUI();
    if (typeof window.logAuditEvent === "function") window.logAuditEvent("Запустила Кошачью Рыбалку", "🎣");
  });

  function resetFishingUI() {
    fishingState = "idle";
    clearTimeout(fishingWaitTimer);
    clearTimeout(fishingBiteTimer);
    if (fishingBobber) {
      fishingBobber.className = "text-5xl transition-transform duration-300 mt-6";
      fishingBobber.innerText = "🪝";
    }
    if (fishingAlert) fishingAlert.style.opacity = "0";
    if (fishingResult) fishingResult.innerText = "Закинь удочку в пруд!";
    if (btnFishingAction) {
      btnFishingAction.innerText = "ЗАБРОСИТЬ УДОЧКУ 🎣";
      btnFishingAction.className = "w-full max-w-sm py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xs active:scale-95 transition shadow-lg cursor-pointer";
    }
  }

  btnFishingAction?.addEventListener("click", () => {
    if (fishingState === "idle") {
      if (window.sound?.pop) window.sound.pop();
      fishingState = "waiting";
      if (fishingBobber) {
        fishingBobber.innerText = "🔴";
        fishingBobber.className = "text-5xl transition-transform duration-300 mt-10 animate-bounce";
      }
      if (fishingResult) fishingResult.innerText = "Ждем поклёвки... Терпение, котик!";
      if (btnFishingAction) {
        btnFishingAction.innerText = "ЖДЕМ ПОКЛЁВКИ... ⏳";
        btnFishingAction.className = "w-full max-w-sm py-3.5 rounded-2xl bg-gray-700 text-gray-400 font-black text-xs cursor-not-allowed";
      }

      const waitDelay = 1500 + Math.random() * 2200;
      fishingWaitTimer = setTimeout(() => {
        fishingState = "bite";
        if (window.sound?.playTone) window.sound.playTone(850, "triangle", 0.15, 0.3);
        if (typeof triggerHaptic === "function") triggerHaptic();

        if (fishingBobber) fishingBobber.className = "text-5xl transition-transform duration-100 mt-16 scale-125";
        if (fishingAlert) fishingAlert.style.opacity = "1";
        if (fishingResult) fishingResult.innerText = "ПОДСЕКАЙ БЫСТРЕЕ!";
        if (btnFishingAction) {
          btnFishingAction.innerText = "ПОДСЕЧЬ! 🎯";
          btnFishingAction.className = "w-full max-w-sm py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs active:scale-95 animate-pulse shadow-lg cursor-pointer";
        }

        fishingBiteTimer = setTimeout(() => {
          if (fishingState === "bite") {
            if (window.sound?.pop) window.sound.pop();
            if (fishingResult) fishingResult.innerText = "Эх, рыба сорвалась с крючка!";
            resetFishingUI();
          }
        }, 900);
      }, waitDelay);

    } else if (fishingState === "bite") {
      clearTimeout(fishingBiteTimer);
      fishingState = "idle";

      const roll = Math.random() * 100;
      let fishEmoji = "🐟", fishName = "Карасик", earned = 10;

      if (roll < 8) {
        fishEmoji = "👑"; fishName = "Золотая рыбка"; earned = 40;
        checkAndDropWish("fishing", 0.25, "Кошачья Рыбалка");
      } else if (roll < 25) {
        fishEmoji = "🐡"; fishName = "Королевский Осетр"; earned = 28;
      } else if (roll < 55) {
        fishEmoji = "🐠"; fishName = "Речная Форель"; earned = 18;
      }

      const maxReward = getRewardLimit("maxFishing", 40);
      earned = Math.min(maxReward, earned);

      window.pet.coins += earned;
      window.pet.energy = Math.max(5, (window.pet.energy || 60) - 10);
      if (typeof window.addXP === "function") window.addXP(earned);

      if (window.sound?.win) window.sound.win();
      if (typeof confetti === "function") confetti({ particleCount: 40, spread: 60 });

      if (fishingBobber) fishingBobber.innerText = fishEmoji;
      if (fishingAlert) fishingAlert.style.opacity = "0";
      if (fishingResult) fishingResult.innerHTML = `Поймана <b class="text-amber-300">${fishName}</b>! <span class="text-emerald-400">+${earned} 🪙</span>`;
      if (typeof window.logAuditEvent === "function") window.logAuditEvent(`Рыбалка: поймала «${fishName}» (+${earned} 🪙)`, "🎣");

      if (btnFishingAction) {
        btnFishingAction.innerText = "ЕЩЕ ЗАБРОС 🎣";
        btnFishingAction.className = "w-full max-w-sm py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xs active:scale-95 transition shadow-lg cursor-pointer";
      }

      if (typeof window.updatePetUI === "function") window.updatePetUI();
    }
  });

  /* =========================================================
   * 2. МУР-ПАМЯТЬ (MEMORY GAME)
   * ========================================================= */
  const modalMemory = document.getElementById("modalMemory");
  const memoryGrid = document.getElementById("memoryCardsGrid");
  const memoryTimerText = document.getElementById("memoryTimerText");

  let memoryTimer = null;
  let memoryTimeLeft = 25;
  let memoryFlipped = [];
  let memoryMatchedCount = 0;
  let isMemoryLocked = false;

  document.getElementById("btnJobMemory")?.addEventListener("click", () => {
    document.getElementById("modalWork")?.classList.add("hidden");
    modalMemory?.classList.remove("hidden");
    startMemoryGame();
    if (typeof window.logAuditEvent === "function") window.logAuditEvent("Запустила Мур-Память", "🧩");
  });

  function startMemoryGame() {
    memoryTimeLeft = 25;
    memoryFlipped = [];
    memoryMatchedCount = 0;
    isMemoryLocked = false;
    if (memoryTimerText) memoryTimerText.innerText = `${memoryTimeLeft}с`;
    if (!memoryGrid) return;
    memoryGrid.innerHTML = "";

    const items = ["🍣", "🍕", "🍰", "🐱", "👑", "🌸"];
    const cards = [...items, ...items].sort(() => Math.random() - 0.5);

    cards.forEach((sym, idx) => {
      const card = document.createElement("div");
      card.className = "h-16 bg-[#18192a] border border-[#2e304f] rounded-2xl flex items-center justify-center text-3xl cursor-pointer active:scale-90 transition-transform shadow-inner select-none";
      card.dataset.sym = sym;
      card.innerText = "❓";

      card.addEventListener("pointerdown", () => handleMemoryCardClick(card));
      memoryGrid.appendChild(card);
    });

    clearInterval(memoryTimer);
    memoryTimer = setInterval(() => {
      memoryTimeLeft--;
      if (memoryTimerText) memoryTimerText.innerText = `${memoryTimeLeft}с`;
      if (memoryTimeLeft <= 0) {
        clearInterval(memoryTimer);
        if (window.sound?.pop) window.sound.pop();
        alert("Время вышло! Попробуй собрать пары быстрее 🐾");
        modalMemory?.classList.add("hidden");
      }
    }, 1000);
  }

  function handleMemoryCardClick(card) {
    if (isMemoryLocked || card.innerText !== "❓") return;

    if (window.sound?.pop) window.sound.pop();
    card.innerText = card.dataset.sym;
    card.classList.add("border-pink-500", "bg-pink-950/40");
    memoryFlipped.push(card);

    if (memoryFlipped.length === 2) {
      isMemoryLocked = true;
      const [c1, c2] = memoryFlipped;

      if (c1.dataset.sym === c2.dataset.sym) {
        if (window.sound?.win) window.sound.win();
        if (typeof triggerHaptic === "function") triggerHaptic();
        c1.classList.add("border-emerald-400", "bg-emerald-950/40");
        c2.classList.add("border-emerald-400", "bg-emerald-950/40");
        memoryMatchedCount++;
        memoryFlipped = [];
        isMemoryLocked = false;

        if (memoryMatchedCount === 6) {
          clearInterval(memoryTimer);
          const maxRew = getRewardLimit("maxMemory", 30);
          const earned = Math.min(maxRew, 15 + Math.min(15, memoryTimeLeft));

          window.pet.coins += earned;
          window.pet.energy = Math.max(5, (window.pet.energy || 60) - 12);
          if (typeof window.addXP === "function") window.addXP(earned);

          if (typeof confetti === "function") confetti({ particleCount: 60, spread: 75 });
          if (typeof window.logAuditEvent === "function") window.logAuditEvent(`Мур-Память: все пары найдены (+${earned} 🪙)`, "🧩");

          if (typeof window.updatePetUI === "function") window.updatePetUI();
          setTimeout(() => {
            alert(`🎉 ОТЛИЧНАЯ ПАМЯТЬ! Все пары найдены!\nНаграда: +${earned} 🪙!`);
            modalMemory?.classList.add("hidden");
          }, 300);
        }
      } else {
        setTimeout(() => {
          c1.innerText = "❓";
          c2.innerText = "❓";
          c1.className = "h-16 bg-[#18192a] border border-[#2e304f] rounded-2xl flex items-center justify-center text-3xl cursor-pointer active:scale-90 transition-transform shadow-inner select-none";
          c2.className = "h-16 bg-[#18192a] border border-[#2e304f] rounded-2xl flex items-center justify-center text-3xl cursor-pointer active:scale-90 transition-transform shadow-inner select-none";
          memoryFlipped = [];
          isMemoryLocked = false;
        }, 650);
      }
    }
  }

  /* =========================================================
   * 3. КЭТ-ТЕТРИС (TETRIS ENGINE)
   * ========================================================= */
  const tetrisCanvas = document.getElementById("tetrisCanvas");
  const tCtx = tetrisCanvas?.getContext("2d");
  const modalTetris = document.getElementById("modalTetris");
  const tetrisOverlay = document.getElementById("tetrisOverlay");
  const tetrisScoreText = document.getElementById("tetrisScoreText");

  let tetrisBoard = [];
  let tetrisScore = 0;
  let tetrisTimer = null;
  let curPiece = null;

  const SHAPES = [
    { color: "#f38ba8", blocks: [[1, 1, 1, 1]] },
    { color: "#fab387", blocks: [[1, 1], [1, 1]] },
    { color: "#a6e3a1", blocks: [[0, 1, 1], [1, 1, 0]] },
    { color: "#89b4fa", blocks: [[1, 1, 0], [0, 1, 1]] },
    { color: "#cba6f7", blocks: [[1, 1, 1], [0, 1, 0]] },
    { color: "#f9e2af", blocks: [[1, 1, 1], [1, 0, 0]] }
  ];

  document.getElementById("btnJobTetris")?.addEventListener("click", () => {
    document.getElementById("modalWork")?.classList.add("hidden");
    modalTetris?.classList.remove("hidden");
    tetrisOverlay?.classList.remove("hidden");
  });

  document.getElementById("closeTetrisBtn")?.addEventListener("click", () => {
    clearInterval(tetrisTimer);
    modalTetris?.classList.add("hidden");
  });

  document.getElementById("btnStartTetris")?.addEventListener("click", () => {
    tetrisOverlay?.classList.add("hidden");
    tetrisBoard = Array.from({ length: 18 }, () => Array(10).fill(0));
    tetrisScore = 0;
    if (tetrisScoreText) tetrisScoreText.innerText = "Счет: 0";
    spawnRandomTetrisPiece();
    clearInterval(tetrisTimer);
    tetrisTimer = setInterval(updateTetris, 450);
    drawTetris();
  });

  function spawnRandomTetrisPiece() {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    curPiece = { x: 3, y: 0, blocks: s.blocks, color: s.color };
  }

  function checkTetrisCollision(dx, dy, shape) {
    if (!curPiece) return false;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const nx = curPiece.x + c + dx;
          const ny = curPiece.y + r + dy;
          if (nx < 0 || nx >= 10 || ny >= 18) return true;
          if (ny >= 0 && tetrisBoard[ny][nx]) return true;
        }
      }
    }
    return false;
  }

  function updateTetris() {
    if (!curPiece) return;
    if (!checkTetrisCollision(0, 1, curPiece.blocks)) {
      curPiece.y++;
    } else {
      curPiece.blocks.forEach((r, ri) => r.forEach((cell, ci) => {
        if (cell && (curPiece.y + ri) >= 0) {
          tetrisBoard[curPiece.y + ri][curPiece.x + ci] = curPiece.color;
        }
      }));

      // Очистка заполненных линий
      for (let r = 17; r >= 0; r--) {
        if (tetrisBoard[r].every(c => c !== 0)) {
          tetrisBoard.splice(r, 1);
          tetrisBoard.unshift(Array(10).fill(0));
          tetrisScore += 15;
          if (window.sound?.pop) window.sound.pop();
          r++;
        }
      }

      if (tetrisScoreText) tetrisScoreText.innerText = `Счет: ${tetrisScore}`;
      spawnRandomTetrisPiece();

      // Проверка на проигрыш (коллизия на спавне)
      if (checkTetrisCollision(0, 0, curPiece.blocks)) {
        clearInterval(tetrisTimer);
        const maxRew = getRewardLimit("maxTetris", 25);
        const earned = Math.min(maxRew, Math.max(8, Math.floor(tetrisScore / 3)));

        window.pet.coins += earned;
        window.pet.energy = Math.max(5, (window.pet.energy || 60) - 15);
        if (typeof window.addXP === "function") window.addXP(earned);

        if (window.sound?.win) window.sound.win();
        if (typeof confetti === "function") confetti({ particleCount: 40, spread: 60 });

        if (typeof window.logAuditEvent === "function") window.logAuditEvent(`Кэт-Тетрис окончен (Очки: ${tetrisScore}, +${earned} 🪙)`, "🧱");
        checkAndDropWish("tetris", 0.50, "Кэт-Тетрис");

        if (tetrisOverlay) {
          tetrisOverlay.classList.remove("hidden");
          tetrisOverlay.innerHTML = `
            <span class="text-4xl animate-bounce">🧱</span>
            <h4 class="cute-font text-amber-300 font-bold mt-1">Игра окончена!</h4>
            <p class="text-xs text-gray-200 mt-0.5">Очки: <b>${tetrisScore}</b><br>Награда: <b class="text-amber-300">+${earned} 🪙</b></p>
            <button class="cute-font bg-pink-500 hover:bg-pink-400 text-white font-bold py-2 px-5 rounded-xl mt-3 active:scale-95 transition" onclick="document.getElementById('btnStartTetris').click()">СЫГРАТЬ СНОВА ✨</button>
          `;
        }
        if (typeof window.updatePetUI === "function") window.updatePetUI();
      }
    }
    drawTetris();
  }

  function drawTetris() {
    if (!tCtx) return;
    tCtx.fillStyle = "#181825";
    tCtx.fillRect(0, 0, 200, 360);

    for (let r = 0; r < 18; r++) {
      for (let c = 0; c < 10; c++) {
        if (tetrisBoard[r][c]) {
          tCtx.fillStyle = tetrisBoard[r][c];
          tCtx.fillRect(c * 20, r * 20, 19, 19);
        }
      }
    }

    if (curPiece) {
      tCtx.fillStyle = curPiece.color;
      curPiece.blocks.forEach((row, ri) => row.forEach((cell, ci) => {
        if (cell) tCtx.fillRect((curPiece.x + ci) * 20, (curPiece.y + ri) * 20, 19, 19);
      }));
    }
  }

  document.getElementById("btnTetrisLeft")?.addEventListener("click", () => {
    if (curPiece && !checkTetrisCollision(-1, 0, curPiece.blocks)) {
      curPiece.x--;
      if (window.sound?.tick) window.sound.tick();
      drawTetris();
    }
  });

  document.getElementById("btnTetrisRight")?.addEventListener("click", () => {
    if (curPiece && !checkTetrisCollision(1, 0, curPiece.blocks)) {
      curPiece.x++;
      if (window.sound?.tick) window.sound.tick();
      drawTetris();
    }
  });

  document.getElementById("btnTetrisRotate")?.addEventListener("click", () => {
    if (!curPiece) return;
    const rot = curPiece.blocks[0].map((_, i) => curPiece.blocks.map(row => row[i]).reverse());
    if (!checkTetrisCollision(0, 0, rot)) {
      curPiece.blocks = rot;
      if (window.sound?.tick) window.sound.tick();
      drawTetris();
    }
  });

  document.getElementById("btnTetrisDown")?.addEventListener("click", updateTetris);

  /* =========================================================
   * 4. SUBWAY CAT RUNNER (ПСЕВДО-3D)
   * ========================================================= */
  const runnerCanvas = document.getElementById("runnerCanvas");
  const rCtx = runnerCanvas?.getContext("2d");
  const modalRunner = document.getElementById("modalRunner");
  const runnerOverlay = document.getElementById("runnerOverlay");
  const runnerScoreText = document.getElementById("runnerScoreText");
  const runnerShieldIcon = document.getElementById("runnerShieldIcon");
  const runnerMagnetIcon = document.getElementById("runnerMagnetIcon");

  let isRunnerRunning = false;
  let runnerAnimFrame = null;
  let runnerCoins = 0;
  let playerTargetLane = 0;
  let playerX = 0;
  let playerY = 0;
  let isJumping = false;
  let isSliding = false;
  let jumpVel = 0;
  let slideTimer = 0;
  let hasShield = false;
  let magnetTimer = 0;
  let trackObjects = [];

  document.getElementById("btnJobRunner")?.addEventListener("click", () => {
    document.getElementById("modalWork")?.classList.add("hidden");
    modalRunner?.classList.remove("hidden");
    runnerOverlay?.classList.remove("hidden");
  });

  document.getElementById("closeRunnerBtn")?.addEventListener("click", () => {
    isRunnerRunning = false;
    cancelAnimationFrame(runnerAnimFrame);
    modalRunner?.classList.add("hidden");
  });

  document.getElementById("btnStartRunner")?.addEventListener("click", () => {
    runnerOverlay?.classList.add("hidden");
    isRunnerRunning = true;
    runnerCoins = 0;
    playerTargetLane = 0;
    playerX = 0;
    playerY = 0;
    isJumping = false;
    isSliding = false;
    hasShield = false;
    magnetTimer = 0;
    trackObjects = [];

    if (runnerScoreText) runnerScoreText.innerText = "🪙 0";
    runnerShieldIcon?.classList.add("hidden");
    runnerMagnetIcon?.classList.add("hidden");

    let lastSpawnTime = performance.now();

    function runnerLoop(now) {
      if (!isRunnerRunning || !rCtx) return;

      // Спавн препятствий и монеток
      if (now - lastSpawnTime > 2100) {
        lastSpawnTime = now;
        const lane = Math.floor(Math.random() * 3) - 1;
        const rand = Math.random();

        if (rand < 0.35) trackObjects.push({ type: "barrier", lane, z: 1.0 });
        else if (rand < 0.55) trackObjects.push({ type: "gate", lane, z: 1.0 });
        else if (rand < 0.75) trackObjects.push({ type: "train", lane, z: 1.0 });
        else if (rand < 0.85) trackObjects.push({ type: Math.random() < 0.5 ? "magnet" : "board", lane, z: 1.0 });
        else {
          for (let i = 0; i < 3; i++) trackObjects.push({ type: "coin", lane, z: 1.0 + i * 0.08 });
        }
      }

      // Физика игрока
      playerX += (playerTargetLane - playerX) * 0.22;

      if (isJumping) {
        playerY += jumpVel;
        jumpVel -= 0.55;
        if (playerY <= 0) { playerY = 0; isJumping = false; }
      }

      if (isSliding) {
        slideTimer--;
        if (slideTimer <= 0) isSliding = false;
      }

      if (magnetTimer > 0) {
        magnetTimer--;
        runnerMagnetIcon?.classList.toggle("hidden", magnetTimer <= 0);
      }

      // Обновление объектов трассы и коллизии
      for (let i = trackObjects.length - 1; i >= 0; i--) {
        const obj = trackObjects[i];
        obj.z -= 0.0055;

        if (magnetTimer > 0 && obj.type === "coin" && obj.z < 0.7) {
          obj.lane += (playerTargetLane - obj.lane) * 0.18;
        }

        // Зона контакта
        if (obj.z < 0.22 && obj.z > 0.05 && Math.abs(obj.lane - playerX) < 0.5) {
          if (obj.type === "coin") {
            runnerCoins++;
            if (window.sound?.pop) window.sound.pop();
            if (typeof triggerHaptic === "function") triggerHaptic();
            if (runnerScoreText) runnerScoreText.innerText = `🪙 ${runnerCoins}`;
            trackObjects.splice(i, 1);
            continue;
          }
          if (obj.type === "magnet") {
            magnetTimer = 500;
            if (window.sound?.win) window.sound.win();
            trackObjects.splice(i, 1);
            continue;
          }
          if (obj.type === "board") {
            hasShield = true;
            runnerShieldIcon?.classList.remove("hidden");
            if (window.sound?.win) window.sound.win();
            trackObjects.splice(i, 1);
            continue;
          }

          // Препятствия
          if (obj.type === "barrier" && isJumping && playerY > 20) continue;
          if (obj.type === "gate" && isSliding) continue;

          // Спасение щитом
          if (hasShield) {
            hasShield = false;
            runnerShieldIcon?.classList.add("hidden");
            if (window.sound?.pop) window.sound.pop();
            trackObjects.splice(i, 1);
            continue;
          }

          // СТОЛКНОВЕНИЕ (ФИНИШ ЗАБЕГА)
          isRunnerRunning = false;
          cancelAnimationFrame(runnerAnimFrame);

          const maxRew = getRewardLimit("maxRunner", 25);
          const earned = Math.min(maxRew, Math.max(10, runnerCoins));

          window.pet.coins += earned;
          window.pet.energy = Math.max(5, (window.pet.energy || 60) - 15);
          if (typeof window.addXP === "function") window.addXP(earned);

          if (window.sound?.win) window.sound.win();
          if (typeof confetti === "function") confetti({ particleCount: 35, spread: 70 });

          if (typeof window.logAuditEvent === "function") window.logAuditEvent(`Subway Cat: забег окончен (Монеты: ${runnerCoins}, +${earned} 🪙)`, "🏃");
          checkAndDropWish("subway", 0.40, "Subway Cat");

          if (runnerOverlay) {
            runnerOverlay.classList.remove("hidden");
            runnerOverlay.innerHTML = `
              <span class="text-5xl animate-bounce">💥</span>
              <h4 class="cute-font text-amber-300 font-bold mt-2">Забег окончен!</h4>
              <p class="text-xs text-gray-200 mt-1">Собрано: <b>${runnerCoins}</b><br>Награда: <b class="text-amber-300">+${earned} 🪙</b></p>
              <button class="cute-font bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black py-2.5 px-6 rounded-2xl text-xs mt-4 active:scale-95 transition shadow-lg cursor-pointer" onclick="document.getElementById('btnStartRunner').click()">ЕЩЕ ЗАБЕГ 🛹</button>
            `;
          }

          if (typeof window.updatePetUI === "function") window.updatePetUI();
          return;
        }

        if (obj.z <= 0.01) trackObjects.splice(i, 1);
      }

      // Отрисовка перспективы
      const w = 300, h = 420, horY = h * 0.38;
      rCtx.fillStyle = "#111827"; rCtx.fillRect(0, horY, w, h - horY);
      rCtx.fillStyle = "#0a0a14"; rCtx.fillRect(0, 0, w, horY);

      function project(lane, z, yOff = 0) {
        const f = 1 - z;
        return { x: (w / 2) + lane * 130 * f, y: horY + (h - horY) * (f * f) - yOff * (f + 0.1), f };
      }

      // Рельсы
      rCtx.strokeStyle = "#f43f5e"; rCtx.lineWidth = 2;
      [-1.3, -0.42, 0.42, 1.3].forEach(l => {
        const top = project(l, 0.95), bot = project(l, 0.05);
        rCtx.beginPath(); rCtx.moveTo(top.x, top.y); rCtx.lineTo(bot.x, bot.y); rCtx.stroke();
      });

      // Препятствия
      trackObjects.sort((a, b) => b.z - a.z).forEach(obj => {
        const p = project(obj.lane, obj.z);
        const sz = Math.max(12, Math.floor(20 + 32 * p.f));
        rCtx.font = `${sz}px sans-serif`;
        rCtx.textAlign = "center";
        rCtx.fillText({ coin: "🪙", barrier: "🚧", gate: "⛔", train: "🚆", magnet: "🧲", board: "🛹" }[obj.type] || "❓", p.x, p.y);
      });

      // Игрок
      const pPos = project(playerX, 0.14, playerY);
      rCtx.font = hasShield ? "46px sans-serif" : "42px sans-serif";
      rCtx.textAlign = "center";
      rCtx.fillText(isSliding ? "🐾💨" : hasShield ? "🐱🛹" : "🐱", pPos.x, pPos.y);

      runnerAnimFrame = requestAnimationFrame(runnerLoop);
    }

    runnerAnimFrame = requestAnimationFrame(runnerLoop);
  });

  document.getElementById("btnCtrlLeft")?.addEventListener("click", () => {
    if (playerTargetLane > -1) { playerTargetLane--; if (window.sound?.tick) window.sound.tick(); }
  });
  document.getElementById("btnCtrlRight")?.addEventListener("click", () => {
    if (playerTargetLane < 1) { playerTargetLane++; if (window.sound?.tick) window.sound.tick(); }
  });
  document.getElementById("btnCtrlJump")?.addEventListener("click", () => {
    if (!isJumping && !isSliding) { isJumping = true; jumpVel = 11; if (window.sound?.tick) window.sound.tick(); }
  });
  document.getElementById("btnCtrlSlide")?.addEventListener("click", () => {
    if (!isSliding) { isSliding = true; slideTimer = 35; if (window.sound?.tick) window.sound.tick(); }
  });

  /* =========================================================
   * 5. КУРЬЕР ВКУСНЯШЕК (COURIER CLICKER)
   * ========================================================= */
  const modalMiniGame = document.getElementById("modalMiniGame");
  const miniGameCanvas = document.getElementById("miniGameCanvas");
  const gameStartOverlay = document.getElementById("gameStartOverlay");
  const gameScoreText = document.getElementById("gameScoreText");
  const gameTimerText = document.getElementById("gameTimerText");

  let courierScore = 0;
  let courierTimeLeft = 15;
  let courierTimer = null;
  let isCourierRunning = false;

  document.getElementById("btnJobCatcher")?.addEventListener("click", () => {
    document.getElementById("modalWork")?.classList.add("hidden");
    modalMiniGame?.classList.remove("hidden");
    gameStartOverlay?.classList.remove("hidden");
  });

  document.getElementById("closeMiniGameBtn")?.addEventListener("click", () => {
    isCourierRunning = false;
    clearInterval(courierTimer);
    modalMiniGame?.classList.add("hidden");
  });

  document.getElementById("btnStartGame")?.addEventListener("click", () => {
    gameStartOverlay?.classList.add("hidden");
    courierScore = 0;
    courierTimeLeft = 15;
    isCourierRunning = true;
    if (gameScoreText) gameScoreText.innerText = "Счет: 0";
    if (gameTimerText) gameTimerText.innerText = "15с";

    clearInterval(courierTimer);
    courierTimer = setInterval(() => {
      courierTimeLeft--;
      if (gameTimerText) gameTimerText.innerText = `${courierTimeLeft}с`;
      if (courierTimeLeft <= 0) endCourierGame();
    }, 1000);

    spawnCourierItem();
  });

  function spawnCourierItem() {
    if (!isCourierRunning || !miniGameCanvas) return;
    const foodList = ["🍣", "🍕", "🍤", "🍗", "🍓", "🧁"];
    const item = document.createElement("div");
    item.className = "absolute cursor-pointer text-4xl select-none active:scale-125 transition-transform";
    item.innerText = foodList[Math.floor(Math.random() * foodList.length)];
    item.style.left = Math.floor(Math.random() * (miniGameCanvas.clientWidth - 50)) + "px";
    item.style.top = Math.floor(Math.random() * (miniGameCanvas.clientHeight - 60)) + "px";

    item.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      if (window.sound?.pop) window.sound.pop();
      if (typeof triggerHaptic === "function") triggerHaptic();
      courierScore++;
      if (gameScoreText) gameScoreText.innerText = `Счет: ${courierScore}`;
      item.remove();
      spawnCourierItem();
    });

    miniGameCanvas.appendChild(item);
    setTimeout(() => {
      if (item.parentNode) {
        item.remove();
        if (isCourierRunning) spawnCourierItem();
      }
    }, 1050);
  }

  function endCourierGame() {
    isCourierRunning = false;
    clearInterval(courierTimer);
    miniGameCanvas?.querySelectorAll(".text-4xl").forEach(el => el.remove());

    const maxRew = getRewardLimit("catcher", 16);
    const earned = Math.min(maxRew, Math.max(8, Math.floor(courierScore * 1.2)));

    window.pet.coins += earned;
    window.pet.energy = Math.max(5, (window.pet.energy || 60) - 12);
    if (typeof window.addXP === "function") window.addXP(earned);

    if (window.sound?.win) window.sound.win();
    if (typeof confetti === "function") confetti({ particleCount: 25, spread: 60 });

    if (typeof window.logAuditEvent === "function") window.logAuditEvent(`Курьер: смена окончена (Доставлено: ${courierScore}, +${earned} 🪙)`, "🛵");
    checkAndDropWish("catcher", 0.30, "Курьер вкусняшек");

    if (gameStartOverlay) {
      gameStartOverlay.classList.remove("hidden");
      gameStartOverlay.innerHTML = `
        <span class="text-4xl">🛵</span>
        <h4 class="cute-font text-amber-300 font-bold text-base mt-2">Смена окончена!</h4>
        <p class="text-xs text-gray-300 mt-1">Доставлено: <b class="text-pink-300">${courierScore}</b><br>Награда: <b class="text-amber-300">+${earned} 🪙</b></p>
        <button class="cute-font bg-pink-500 hover:bg-pink-400 text-white font-bold py-2 px-5 rounded-2xl text-xs active:scale-95 transition shadow-lg mt-3 cursor-pointer" onclick="document.getElementById('btnStartGame').click()">ЕЩЕ СМЕНУ 🛵</button>
      `;
    }

    if (typeof window.updatePetUI === "function") window.updatePetUI();
  }

  /* =========================================================
   * 6. OSU! CAT STREAMER (RHYTHM GAME WITH WEB AUDIO SYNTH)
   * ========================================================= */
  const modalRhythm = document.getElementById("modalRhythmGame");
  const rhythmOverlay = document.getElementById("rhythmStartOverlay");
  const osuCanvas = document.getElementById("osuCanvas");
  const oCtx = osuCanvas?.getContext("2d");
  const osuScoreText = document.getElementById("osuScoreText");
  const osuAccuracyText = document.getElementById("osuAccuracyText");
  const osuComboText = document.getElementById("osuComboText");
  const osuGenreBadge = document.getElementById("osuGenreBadge");

  const OSU_GENRES = {
    mozart: { name: "Венский вальс (Моцарт)", bpm: 126, rootFreq: 261.63, scale: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16], style: "waltz" },
    storm: { name: "Вивальди «Шторм»", bpm: 144, rootFreq: 196.00, scale: [0, 2, 3, 5, 7, 8, 11, 12, 14, 15], style: "baroque" },
    moonlight: { name: "Лунная соната", bpm: 104, rootFreq: 220.00, scale: [0, 2, 3, 5, 7, 8, 10, 12], style: "piano" },
    kawaii: { name: "Kawaii Pop", bpm: 120, rootFreq: 293.66, scale: [0, 2, 4, 7, 9, 12, 14], style: "anime" },
    phonk: { name: "Drift Phonk", bpm: 136, rootFreq: 146.83, scale: [0, 1, 5, 7, 8, 12], style: "phonk" }
  };

  const OSU_DIFFS = {
    easy: { name: "Лапка", approachTime: 1.15, radius: 34, spawnStep: 2, hpDrain: 4, win300: 0.10, win100: 0.18, win50: 0.26, mult: 1.0 },
    normal: { name: "Хвостик", approachTime: 0.90, radius: 29, spawnStep: 1, hpDrain: 6, win300: 0.08, win100: 0.15, win50: 0.22, mult: 1.3 },
    hard: { name: "Тыгыдык", approachTime: 0.72, radius: 25, spawnStep: 0.5, hpDrain: 9, win300: 0.065, win100: 0.12, win50: 0.18, mult: 1.7 },
    insane: { name: "Безумие", approachTime: 0.52, radius: 21, spawnStep: 0.25, hpDrain: 12, win300: 0.05, win100: 0.09, win50: 0.14, mult: 2.2 }
  };

  let selectedOsuGenre = "mozart";
  let selectedOsuDiff = "normal";
  let isOsuRunning = false;
  let osuAudioCtx = null;
  let osuAnimFrame = null;
  let osuSchedulerTimer = null;

  let osuCircles = [];
  let osuFeedbacks = [];
  let osuScore = 0;
  let osuCombo = 0;
  let osuMaxCombo = 0;
  let osuHp = 100;
  let osuHits = { 300: 0, 100: 0, 50: 0, miss: 0 };
  let circleIdxCounter = 1;
  let nextOsuNoteTime = 0;
  let step16thCounter = 0;

  // Слушатели выбора трека и сложности
  document.querySelectorAll(".osu-genre-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".osu-genre-btn").forEach(b => {
        b.className = "osu-genre-btn py-1.5 px-2 rounded-xl bg-[#18192a] border border-[#2e304f] text-[11px] font-bold text-gray-300 active:scale-95 transition";
      });
      btn.className = "osu-genre-btn py-1.5 px-2 rounded-xl bg-purple-500/30 border-2 border-purple-500 text-[11px] font-bold text-purple-200 active:scale-95 transition";
      selectedOsuGenre = btn.dataset.genre || "mozart";
    });
  });

  document.querySelectorAll(".osu-diff-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".osu-diff-btn").forEach(b => {
        b.className = "osu-diff-btn py-1.5 rounded-xl bg-[#18192a] border border-[#2e304f] text-[10px] font-bold text-gray-400 active:scale-95 transition";
      });
      btn.className = "osu-diff-btn py-1.5 rounded-xl bg-pink-500/30 border-2 border-pink-500 text-[10px] font-bold text-pink-300 active:scale-95 transition";
      selectedOsuDiff = btn.dataset.diff || "normal";
    });
  });

  document.getElementById("btnJobRhythm")?.addEventListener("click", () => {
    document.getElementById("modalWork")?.classList.add("hidden");
    modalRhythm?.classList.remove("hidden");
    rhythmOverlay?.classList.remove("hidden");
    if (typeof window.logAuditEvent === "function") window.logAuditEvent("Открыла Osu! Cat Streamer", "🎧");
  });

  document.getElementById("closeRhythmBtn")?.addEventListener("click", stopOsuGame);
  document.getElementById("btnStartOsuGame")?.addEventListener("click", startOsuGame);

  function initOsuAudio() {
    if (!osuAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) osuAudioCtx = new AudioCtx();
    }
    if (osuAudioCtx?.state === "suspended") osuAudioCtx.resume();
  }

  function playSynthNote(freq, time, duration, type, gainVal) {
    if (!osuAudioCtx) return;
    try {
      const osc = osuAudioCtx.createOscillator();
      const gain = osuAudioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      osc.connect(gain);
      gain.connect(osuAudioCtx.destination);
      osc.start(time);
      osc.stop(time + duration);
    } catch(e) {}
  }

  function startOsuGame() {
    initOsuAudio();
    rhythmOverlay?.classList.add("hidden");

    isOsuRunning = true;
    osuCircles = [];
    osuFeedbacks = [];
    osuScore = 0;
    osuCombo = 0;
    osuMaxCombo = 0;
    osuHp = 100;
    osuHits = { 300: 0, 100: 0, 50: 0, miss: 0 };
    circleIdxCounter = 1;
    step16thCounter = 0;

    const g = OSU_GENRES[selectedOsuGenre];
    const d = OSU_DIFFS[selectedOsuDiff];
    if (osuGenreBadge) osuGenreBadge.innerText = `${g.name} • ${d.name}`;
    if (osuScoreText) osuScoreText.innerText = "0";
    if (osuAccuracyText) osuAccuracyText.innerText = "100.0%";
    if (osuComboText) osuComboText.innerText = "Комбо: 0x";

    nextOsuNoteTime = (osuAudioCtx?.currentTime || 0) + 0.3;
    clearInterval(osuSchedulerTimer);
    osuSchedulerTimer = setInterval(osuSchedulerLoop, 25);

    setTimeout(() => {
      if (isOsuRunning) finishOsuGame(true);
    }, 32000);

    cancelAnimationFrame(osuAnimFrame);
    function osuFrame() {
      if (!isOsuRunning) return;
      updateOsuGame();
      drawOsuGame();
      osuAnimFrame = requestAnimationFrame(osuFrame);
    }
    osuAnimFrame = requestAnimationFrame(osuFrame);
  }

  function stopOsuGame() {
    isOsuRunning = false;
    clearInterval(osuSchedulerTimer);
    cancelAnimationFrame(osuAnimFrame);
    modalRhythm?.classList.add("hidden");
  }

  function osuSchedulerLoop() {
    if (!isOsuRunning || !osuAudioCtx) return;
    const g = OSU_GENRES[selectedOsuGenre];
    const d = OSU_DIFFS[selectedOsuDiff];
    const stepDuration = (60 / g.bpm) / 4;

    while (nextOsuNoteTime < osuAudioCtx.currentTime + 0.15) {
      // Бит
      if (step16thCounter % 4 === 0) {
        playSynthNote(g.rootFreq * 0.5, nextOsuNoteTime, 0.2, "triangle", 0.3);
      }
      // Мелодия
      if (step16thCounter % 2 === 0) {
        const noteIdx = (step16thCounter + Math.floor(step16thCounter / 4)) % g.scale.length;
        const freq = g.rootFreq * Math.pow(2, g.scale[noteIdx] / 12);
        playSynthNote(freq, nextOsuNoteTime, 0.15, "sine", 0.2);
      }

      // Спавн кругов ритма
      const spawnSteps = Math.round(d.spawnStep * 4);
      if (step16thCounter % spawnSteps === 0 && osuCanvas) {
        const pad = d.radius + 30;
        const x = Math.floor(Math.random() * (osuCanvas.width - pad * 2) + pad);
        const y = Math.floor(Math.random() * (osuCanvas.height - pad * 2 - 40) + pad + 30);
        osuCircles.push({
          id: circleIdxCounter,
          x, y,
          radius: d.radius,
          targetTime: nextOsuNoteTime,
          color: ["#ec4899", "#a855f7", "#3b82f6", "#f59e0b", "#10b981"][circleIdxCounter % 5],
          hit: false
        });
        circleIdxCounter = (circleIdxCounter >= 9) ? 1 : circleIdxCounter + 1;
      }

      nextOsuNoteTime += stepDuration;
      step16thCounter++;
    }
  }

  function updateOsuGame() {
    if (!osuAudioCtx) return;
    const curTime = osuAudioCtx.currentTime;
    const d = OSU_DIFFS[selectedOsuDiff];

    for (let i = osuCircles.length - 1; i >= 0; i--) {
      const c = osuCircles[i];
      if (!c.hit && curTime > c.targetTime + d.win50) {
        registerOsuHit(null, c);
        osuCircles.splice(i, 1);
      }
    }

    for (let i = osuFeedbacks.length - 1; i >= 0; i--) {
      const fb = osuFeedbacks[i];
      fb.alpha -= 0.035;
      fb.y -= 0.8;
      if (fb.alpha <= 0) osuFeedbacks.splice(i, 1);
    }

    osuHp = Math.max(0, osuHp - 0.03);
    if (osuHp <= 0) finishOsuGame(false);
  }

  function registerOsuHit(grade, circleObj) {
    const d = OSU_DIFFS[selectedOsuDiff];

    if (grade === 300) {
      osuScore += Math.round(300 * (1 + osuCombo * 0.05) * d.mult);
      osuCombo++;
      osuHp = Math.min(100, osuHp + 5);
      osuHits[300]++;
      if (window.sound?.pop) window.sound.pop();
      if (typeof triggerHaptic === "function") triggerHaptic();
      osuFeedbacks.push({ text: "300", x: circleObj.x, y: circleObj.y, color: "#fde047", alpha: 1.0 });
    } else if (grade === 100) {
      osuScore += Math.round(100 * (1 + osuCombo * 0.03) * d.mult);
      osuCombo++;
      osuHp = Math.min(100, osuHp + 2);
      osuHits[100]++;
      if (window.sound?.pop) window.sound.pop();
      osuFeedbacks.push({ text: "100", x: circleObj.x, y: circleObj.y, color: "#34d399", alpha: 1.0 });
    } else if (grade === 50) {
      osuScore += Math.round(50 * d.mult);
      osuCombo++;
      osuHits[50]++;
      if (window.sound?.pop) window.sound.pop();
      osuFeedbacks.push({ text: "50", x: circleObj.x, y: circleObj.y, color: "#60a5fa", alpha: 1.0 });
    } else {
      osuCombo = 0;
      osuHp = Math.max(0, osuHp - d.hpDrain);
      osuHits.miss++;
      osuFeedbacks.push({ text: "MISS", x: circleObj.x, y: circleObj.y, color: "#f43f5e", alpha: 1.0 });
    }

    if (osuCombo > osuMaxCombo) osuMaxCombo = osuCombo;
    const totalHits = osuHits[300] + osuHits[100] + osuHits[50] + osuHits.miss;
    const acc = totalHits > 0
      ? ((osuHits[300] * 300 + osuHits[100] * 100 + osuHits[50] * 50) / (totalHits * 300)) * 100
      : 100;

    if (osuScoreText) osuScoreText.innerText = osuScore.toLocaleString();
    if (osuAccuracyText) osuAccuracyText.innerText = `${acc.toFixed(1)}%`;
    if (osuComboText) osuComboText.innerText = `Комбо: ${osuCombo}x`;
  }

  osuCanvas?.addEventListener("pointerdown", (e) => {
    if (!isOsuRunning || !osuAudioCtx || !osuCanvas) return;
    const rect = osuCanvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (osuCanvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (osuCanvas.height / rect.height);
    const curTime = osuAudioCtx.currentTime;
    const d = OSU_DIFFS[selectedOsuDiff];

    for (let i = 0; i < osuCircles.length; i++) {
      const c = osuCircles[i];
      if (c.hit) continue;
      const dist = Math.hypot(clickX - c.x, clickY - c.y);
      if (dist <= c.radius * 1.35) {
        const diff = Math.abs(curTime - c.targetTime);
        if (diff <= d.win300) { c.hit = true; registerOsuHit(300, c); osuCircles.splice(i, 1); return; }
        else if (diff <= d.win100) { c.hit = true; registerOsuHit(100, c); osuCircles.splice(i, 1); return; }
        else if (diff <= d.win50) { c.hit = true; registerOsuHit(50, c); osuCircles.splice(i, 1); return; }
      }
    }
  });

  function drawOsuGame() {
    if (!oCtx || !osuCanvas) return;
    const w = osuCanvas.width, h = osuCanvas.height;
    const curTime = osuAudioCtx ? osuAudioCtx.currentTime : 0;
    const d = OSU_DIFFS[selectedOsuDiff];

    oCtx.clearRect(0, 0, w, h);

    // HP Bar
    oCtx.fillStyle = "#1e1b4b";
    oCtx.fillRect(10, 8, w - 20, 6);
    oCtx.fillStyle = osuHp > 50 ? "#34d399" : osuHp > 25 ? "#fbbf24" : "#f43f5e";
    oCtx.fillRect(10, 8, (w - 20) * (osuHp / 100), 6);

    // Круги ритма
    osuCircles.forEach(c => {
      const timeUntil = c.targetTime - curTime;
      if (timeUntil > d.approachTime) return;

      const progress = Math.max(0, timeUntil / d.approachTime);
      const appRadius = c.radius + (c.radius * 2.2 * progress);

      oCtx.save();
      oCtx.beginPath();
      oCtx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      oCtx.fillStyle = "#181825";
      oCtx.fill();
      oCtx.lineWidth = 4;
      oCtx.strokeStyle = c.color;
      oCtx.shadowColor = c.color;
      oCtx.shadowBlur = 10;
      oCtx.stroke();

      oCtx.fillStyle = "#ffffff";
      oCtx.font = `bold ${Math.round(c.radius * 0.85)}px 'Comfortaa', sans-serif`;
      oCtx.textAlign = "center";
      oCtx.textBaseline = "middle";
      oCtx.fillText(c.id, c.x, c.y + 1);
      oCtx.restore();

      if (progress > 0) {
        oCtx.save();
        oCtx.beginPath();
        oCtx.arc(c.x, c.y, appRadius, 0, Math.PI * 2);
        oCtx.lineWidth = 2.5;
        oCtx.strokeStyle = c.color;
        oCtx.globalAlpha = Math.min(1.0, 1.2 - progress * 0.5);
        oCtx.stroke();
        oCtx.restore();
      }
    });

    // Фидбеки (300 / 100 / 50 / MISS)
    osuFeedbacks.forEach(fb => {
      oCtx.save();
      oCtx.globalAlpha = Math.max(0, fb.alpha);
      oCtx.fillStyle = fb.color;
      oCtx.shadowColor = fb.color;
      oCtx.shadowBlur = 8;
      oCtx.font = "bold 20px 'Comfortaa', sans-serif";
      oCtx.textAlign = "center";
      oCtx.fillText(fb.text, fb.x, fb.y);
      oCtx.restore();
    });
  }

  function finishOsuGame(isVictory) {
    isOsuRunning = false;
    clearInterval(osuSchedulerTimer);
    cancelAnimationFrame(osuAnimFrame);

    const d = OSU_DIFFS[selectedOsuDiff];
    let earned = isVictory
      ? Math.min(40, Math.max(12, Math.round((osuScore / 350) * d.mult)))
      : 4;

    window.pet.coins += earned;
    window.pet.energy = Math.max(5, (window.pet.energy || 60) - 14);
    if (typeof window.addXP === "function") window.addXP(earned);

    if (isVictory) {
      if (window.sound?.win) window.sound.win();
      if (typeof confetti === "function") confetti({ particleCount: 50, spread: 75 });
      if (typeof window.logAuditEvent === "function") window.logAuditEvent(`Osu! Cat: трек «${OSU_GENRES[selectedOsuGenre].name}» пройден (+${earned} 🪙)`, "🎧");
      checkAndDropWish("rhythm", 0.35, "Ритм-игра Osu! Cat");
    } else {
      if (window.sound?.pop) window.sound.pop();
      if (typeof window.logAuditEvent === "function") window.logAuditEvent("Osu! Cat: прервано (HP 0%)", "💔");
    }

    if (typeof window.updatePetUI === "function") window.updatePetUI();

    if (rhythmOverlay) {
      rhythmOverlay.classList.remove("hidden");
      rhythmOverlay.innerHTML = `
        <div class="my-auto flex flex-col items-center gap-2">
          <span class="text-5xl animate-bounce">${isVictory ? "🏆" : "😿"}</span>
          <h4 class="cute-font text-purple-300 font-black text-lg">${isVictory ? "ТРЕК ПРОЙДЕН!" : "ЛАПКИ УСТАЛИ!"}</h4>
          <div class="bg-[#18192a] border border-[#2e304f] rounded-2xl p-3 w-64 text-xs flex flex-col gap-1 my-1">
            <div class="flex justify-between"><span>Счет:</span><b class="text-amber-300">${osuScore.toLocaleString()}</b></div>
            <div class="flex justify-between"><span>Макс. комбо:</span><b class="text-pink-400">${osuMaxCombo}x</b></div>
            <div class="flex justify-between pt-1 border-t border-[#2e304f]"><span>Награда:</span><b class="text-amber-300 text-sm">+${earned} 🪙</b></div>
          </div>
          <button class="cute-font bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black py-2.5 px-7 rounded-2xl text-xs active:scale-95 transition shadow-lg mt-2 cursor-pointer" onclick="document.getElementById('modalRhythmGame').classList.add('hidden')">
            ЗАКРЫТЬ ✕
          </button>
        </div>
      `;
    }
  }

  /* -------------------------------------------------------------------------
   * ЭКСПОРТ ДВИЖКА МИНИ-ИГР
   * ------------------------------------------------------------------------- */
  window.GamesEngine = {
    startFishing: () => btnFishingAction?.click(),
    startMemory: startMemoryGame,
    startTetris: () => document.getElementById("btnStartTetris")?.click(),
    startRunner: () => document.getElementById("btnStartRunner")?.click(),
    startCourier: () => document.getElementById("btnStartGame")?.click()
  };
})();