/* =========================================================================
 * LEX LABS ENTERPRISE: CORE APPLICATION ENGINE
 * Файл: app.js (Ядро тамагочи, инвентарь, гардероб, облако, рулетка еды)
 * ========================================================================= */

/* =========================================================================
 * 0. ЧЁРНЫЙ ЯЩИК ЛОГОВ И ОШИБОК БРАУЗЕРА (CLIENT-SIDE TELEMETRY)
 * ========================================================================= */
window.CLIENT_LOGS_BUFFER = [];
window.LAST_CAUGHT_ERROR = null;

function pushClientLog(level, args) {
  try {
    const formattedArgs = Array.from(args).map(arg => {
      if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack || ""}`;
      if (typeof arg === "object") {
        try { return JSON.stringify(arg); } catch (e) { return String(arg); }
      }
      return String(arg);
    }).join(" ");

    window.CLIENT_LOGS_BUFFER.push({
      time: new Date().toLocaleTimeString("ru-RU"),
      level: level,
      msg: formattedArgs
    });

    if (window.CLIENT_LOGS_BUFFER.length > 25) {
      window.CLIENT_LOGS_BUFFER.shift();
    }
  } catch (e) {}
}

const _origConsoleError = console.error;
const _origConsoleWarn = console.warn;

console.error = function (...args) {
  pushClientLog("ERROR", args);
  _origConsoleError.apply(console, args);
};

console.warn = function (...args) {
  pushClientLog("WARN", args);
  _origConsoleWarn.apply(console, args);
};

window.addEventListener("error", function (e) {
  window.LAST_CAUGHT_ERROR = {
    message: e.message || "Unknown error",
    filename: (e.filename || "").split("/").pop(),
    lineno: e.lineno,
    colno: e.colno,
    stack: e.error ? e.error.stack : null,
    time: new Date().toLocaleTimeString("ru-RU")
  };
  pushClientLog("FATAL", [`${e.message} at ${window.LAST_CAUGHT_ERROR.filename}:${e.lineno}`]);
});

window.addEventListener("unhandledrejection", function (e) {
  const reason = e.reason instanceof Error ? e.reason.message : String(e.reason);
  window.LAST_CAUGHT_ERROR = {
    message: `Unhandled Promise: ${reason}`,
    stack: e.reason instanceof Error ? e.reason.stack : null,
    time: new Date().toLocaleTimeString("ru-RU")
  };
  pushClientLog("PROMISE_FAIL", [reason]);
});

function safeParseJSON(raw, fallback) {
  try {
    if (raw == null || raw === "") return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
window.safeParseJSON = safeParseJSON;

function readStorage(key, fallback) {
  return safeParseJSON(localStorage.getItem(key), fallback);
}
window.readStorage = readStorage;

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
window.escapeHtml = escapeHtml;

/* -------------------------------------------------------------------------
 * 1. ЗВУКОВОЙ ДВИЖОК (WEB AUDIO API)
 * ------------------------------------------------------------------------- */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTone(freq, type = "sine", duration = 0.12, gainVal = 0.15) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  purr() {
    this.playTone(180, "triangle", 0.22, 0.2);
    setTimeout(() => this.playTone(220, "sine", 0.18, 0.2), 70);
  }

  pop() {
    this.playTone(600, "sine", 0.05, 0.15);
  }

  feed() {
    this.playTone(420, "triangle", 0.1, 0.2);
    setTimeout(() => this.playTone(560, "triangle", 0.12, 0.2), 85);
  }

  poop() {
    this.playTone(220, "triangle", 0.15, 0.2);
    setTimeout(() => this.playTone(170, "sine", 0.2, 0.2), 80);
  }

  clean() {
    this.playTone(650, "sine", 0.08, 0.2);
    setTimeout(() => this.playTone(850, "sine", 0.12, 0.2), 70);
  }

  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => setTimeout(() => this.playTone(f, "sine", 0.2, 0.22), i * 100));
  }

  epicWin() {
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((f, i) => setTimeout(() => this.playTone(f, "triangle", 0.25, 0.3), i * 80));
  }

  tick() {
    this.playTone(760, "triangle", 0.04, 0.08);
  }
}

window.sound = new SoundEngine();

function triggerHaptic() {
  if (navigator.vibrate) {
    try { navigator.vibrate(25); } catch (e) {}
  }
}
window.triggerHaptic = triggerHaptic;

/* -------------------------------------------------------------------------
 * 2. ИЗОЛЯЦИЯ СРЕДЫ, ИДЕНТИФИКАЦИЯ И ХРАНИЛИЩЕ
 * ------------------------------------------------------------------------- */
const isLocalExecution = window.location.protocol === "file:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
if (isLocalExecution) {
  document.getElementById("localSandboxWarning")?.classList.remove("hidden");
}

let currentUser = localStorage.getItem("active_player_profile");
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("user")) {
  currentUser = urlParams.get("user");
} else if (!currentUser) {
  const savedPet = readStorage("katya_master_pet_state", null);
  if (savedPet && (savedPet.level > 1 || savedPet.coins > 25 || savedPet.xp > 20)) {
    currentUser = "katya";
  } else {
    currentUser = "player_" + Math.random().toString(36).substring(2, 7);
  }
}
localStorage.setItem("active_player_profile", currentUser);
window.currentUser = currentUser;

const TELEGRAM_BOT_TOKEN = "8860557268:AAEXppOhH3jzprkzThf0phM828_Y3ALP_YU";
const TELEGRAM_CHAT_ID = "409697238";
const JSONBIN_BIN_ID = "6acb3d30ac6210605a272eb6";
const JSONBIN_API_KEY = "$2a$10$JBnAcYGGmJL6Q5lDn45nHeW4jsBStn1Z/4XRrRormnfaKG7YbqUN2";

function safeHydrate(key, defaults) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(defaults));
      return JSON.parse(JSON.stringify(defaults));
    }
    const parsed = JSON.parse(stored);
    if (typeof defaults === "object" && !Array.isArray(defaults)) {
      return Object.assign({}, defaults, parsed);
    }
    return parsed;
  } catch (e) {
    return defaults;
  }
}

// Глобальные состояния
window.activeEquipment = safeHydrate("katya_active_equipment", { head: "crown", eyes: "none", body: "bow", legs: "none" });
window.ownedItems = safeHydrate("katya_owned_items", ["bow", "crown"]);
window.ownedRooms = safeHydrate("katya_master_rooms", ["neon"]);

window.ACTIVE_ECONOMY = {
  caseCostStandard: 80,
  caseCostPremium: 160,
  caseCostBlack: 320,
  caseCostHalloween: 130,
  dailyBonus: 15,
  maxRunner: 25,
  maxTetris: 25
};

window.ACTIVE_WISH_CHANCES = {
  subway: 0.4,
  tetris: 0.5,
  catcher: 0.3,
  rhythm: 0.3,
  zen: 0.005,
  poop: 0.15,
  roulette: 0.08,
  dailyBonus: 0.2
};

const defaultPetState = {
  name: "Зефирка",
  level: 1,
  xp: 20,
  coins: 25,
  hunger: 80,
  happy: 75,
  energy: 65,
  clean: 90,
  isSleeping: false,
  activeRoom: "neon",
  color: "pink",
  sleepStartedAt: 0,
  lastWokeUpAt: 0
};

window.pet = safeHydrate("katya_master_pet_state", defaultPetState);
window.analytics = safeHydrate("katya_master_analytics", {
  date: new Date().toDateString(),
  sessionsCount: 0,
  totalSecondsPlayed: 0,
  spentCoins: 0,
  casesOpened: 0
});
window.wishesVault = safeHydrate("katya_master_wishes_vault", []);
window.caseHistory = safeHydrate("katya_master_case_history", []);
window.poops = safeHydrate("katya_master_poops", []);
window.freeFoodData = safeHydrate("katya_master_free_food", { count: 3, date: new Date().toDateString() });
if (window.freeFoodData.date !== new Date().toDateString()) {
  window.freeFoodData = { count: 3, date: new Date().toDateString() };
  localStorage.setItem("katya_master_free_food", JSON.stringify(window.freeFoodData));
}
window.wheelItems = safeHydrate("katya_master_wheel_items", [
  "🍣 Запеченные роллы",
  "🍕 Додо: Сырная пицца",
  "🍰 Бенто-торт с ягодами",
  "🍗 Rostic's Баскет",
  "🧆 Шашлык на углях",
  "🧇 Сладкие вафли"
]);

const FOOD_MENU = [
  { id: "sushi", name: "Запеченные роллы", icon: "🍣", hunger: 28, happy: 15, cost: 18 },
  { id: "pizza", name: "Додо Пицца", icon: "🍕", hunger: 25, happy: 12, cost: 16 },
  { id: "kfc", name: "Баскет Rostic's", icon: "🍗", hunger: 25, happy: 12, cost: 16 },
  { id: "bento", name: "Бенто-торт", icon: "🍰", hunger: 18, happy: 20, cost: 15 },
  { id: "earl_grey", name: "Greenfield Earl Grey", icon: "🫖", hunger: 8, happy: 12, cost: 8 },
  { id: "puer", name: "Шу Пуэр в пиале", icon: "🍵", hunger: 6, happy: 15, cost: 10 },
  { id: "cheese", name: "Сырная тарелка", icon: "🧀", hunger: 16, happy: 14, cost: 12 },
  { id: "chips", name: "Чипсы / Арахис", icon: "🥜", hunger: 14, happy: 10, cost: 9 }
];

if (window.analytics.date !== new Date().toDateString()) {
  window.analytics.date = new Date().toDateString();
  window.analytics.sessionsCount = 0;
  window.analytics.totalSecondsPlayed = 0;
  window.analytics.spentCoins = 0;
  window.analytics.casesOpened = 0;
}
window.analytics.sessionsCount++;
localStorage.setItem("katya_master_analytics", JSON.stringify(window.analytics));

function savePet(triggerCloud = true) {
  localStorage.setItem("katya_master_pet_state", JSON.stringify(window.pet));
  localStorage.setItem("katya_master_last_time", Date.now());
  if (triggerCloud) {
    syncToCloud();
  }
}
window.savePet = savePet;

function logAuditEvent(text, icon = "📌") {
  let audit = readStorage("katya_master_audit_events", []);
  audit.push({
    text,
    icon,
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  });
  if (audit.length > 250) audit.shift();
  localStorage.setItem("katya_master_audit_events", JSON.stringify(audit));
  syncToCloud();
}
window.logAuditEvent = logAuditEvent;

/* -------------------------------------------------------------------------
 * 3. ОБЛАЧНАЯ СИНХРОНИЗАЦИЯ (БЕЗ ЗАТИРАНИЙ И БЕЗ БЕСКОНЕЧНЫХ ЦИКЛОВ)
 * ------------------------------------------------------------------------- */
let cloudSyncTimer = null;
let isSyncInProgress = false;

function syncToCloud() {
  if (isLocalExecution) return;
  clearTimeout(cloudSyncTimer);

  cloudSyncTimer = setTimeout(async () => {
    cloudSyncTimer = null;
    if (isSyncInProgress) return;
    isSyncInProgress = true;

    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
        headers: { "X-Master-Key": JSONBIN_API_KEY }
      });
      if (!res.ok) throw new Error("Fetch failed");
      const root = (await res.json()).record || {};

      const cloudFeedback = Array.isArray(root[currentUser]?.feedback) ? root[currentUser].feedback : [];
      const localFeedback = readStorage("katya_master_feedback", []);

      // Полный честный merge: сохраняем статусы из облака и добавляем новые локальные отзывы
      const mergedMap = new Map();
      
      // Сначала заносим облачные (у них приоритет по статусам разработки)
      cloudFeedback.forEach(item => {
        if (item && item.id) mergedMap.set(item.id, Object.assign({}, item));
      });

      // Дополняем локальными (если есть новые отчёты Кати)
      localFeedback.forEach(localItem => {
        if (!localItem || !localItem.id) return;
        if (mergedMap.has(localItem.id)) {
          const existing = mergedMap.get(localItem.id);
          // Если задача закрыта в облаке, фиксируем локально
          localItem.status = existing.status || localItem.status;
          localItem.devReport = existing.devReport || localItem.devReport;
          localItem.timeSpentSec = existing.timeSpentSec || localItem.timeSpentSec;
          localItem.rewardGranted = existing.rewardGranted || localItem.rewardGranted;
        } else {
          // Новый отчёт — добавляем в облачный снимок
          mergedMap.set(localItem.id, localItem);
        }
      });

      const finalFeedback = Array.from(mergedMap.values());
      localStorage.setItem("katya_master_feedback", JSON.stringify(finalFeedback));

      // Формируем чистый объект игрока
      root[currentUser] = {
        pet: window.pet,
        activeEquipment: window.activeEquipment,
        ownedItems: window.ownedItems,
        ownedRooms: window.ownedRooms,
        analytics: window.analytics,
        wishes: window.wishesVault,
        caseHistory: window.caseHistory,
        feedback: finalFeedback,
        rewardNotifications: (() => {
          const localList = readStorage("katya_reward_notifications", []);
          const claimedIds = new Set(readStorage("katya_claimed_reward_ids", []));
          const cloudList = Array.isArray(root[currentUser]?.rewardNotifications) ? root[currentUser].rewardNotifications : [];
          
          const map = new Map();
          cloudList.forEach(item => { if (item && item.id) map.set(item.id, item); });
          localList.forEach(item => { if (item && item.id) map.set(item.id, item); });

          // Принудительно гарантируем claimed для всех выплаченных
          const merged = Array.from(map.values());
          merged.forEach(item => {
            if (claimedIds.has(item.id)) item.claimed = true;
          });
          return merged;
        })(),
        devChangelog: root[currentUser]?.devChangelog || [],
        rouletteHistory: readStorage("katya_master_roulette_history", []),
        audit: readStorage("katya_master_audit_events", []),
        lastActive: new Date().toLocaleString("ru-RU"),
        clientUpdatedAt: Date.now()
      };

      await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          "X-Master-Key": JSONBIN_API_KEY 
        },
        body: JSON.stringify(root)
      });
    } catch (e) {
      console.warn("[CloudSync] Push error:", e);
    } finally {
      isSyncInProgress = false;
    }
  }, 1500);
}
window.syncToCloud = syncToCloud;

async function pullCloudSettings() {
  if (document.hidden || document.visibilityState !== "visible") return;
  // Если у игрока есть не отправленные локальные действия (таймер взведён) или идёт сохранение — не перезатираем
  if (isLocalExecution || isSyncInProgress || cloudSyncTimer !== null) return;

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY }
    });
    if (!res.ok) return;
    const root = (await res.json()).record || {};
    window.currentCloudData = root;

    let needUIUpdate = false;

    // 1. Сверка экономики
    if (root.economyConfig) {
      window.ACTIVE_ECONOMY = Object.assign(window.ACTIVE_ECONOMY, root.economyConfig);
      const lblStd = document.getElementById("labelCaseStandardCost");
      const lblPrem = document.getElementById("labelCasePremiumCost");
      const lblBlk = document.getElementById("labelCaseBlackCost");
      if (lblStd) lblStd.innerText = `${window.ACTIVE_ECONOMY.caseCostStandard || 80} 🪙`;
      if (lblPrem) lblPrem.innerText = `${window.ACTIVE_ECONOMY.caseCostPremium || 160} 🪙`;
      if (lblBlk) lblBlk.innerText = `${window.ACTIVE_ECONOMY.caseCostBlack || 320} 🪙`;
    }

    if (root.wishChances) {
      window.ACTIVE_WISH_CHANCES = Object.assign(window.ACTIVE_WISH_CHANCES, root.wishChances);
    }

    const remoteUser = root[currentUser] || root["katya"];

// 2. Сверка питомца (с защитой от отката локального прогресса)
    const lastLocalAction = parseInt(localStorage.getItem("katya_master_last_time"), 10) || 0;
    const isRecentlyActive = (Date.now() - lastLocalAction) < 3000;

    if (remoteUser && remoteUser.pet && !isRecentlyActive && cloudSyncTimer === null) {
      const rp = remoteUser.pet;
      const numericFields = ["coins", "level", "xp", "hunger", "happy", "energy", "clean"];

      numericFields.forEach((f) => {
        if (typeof rp[f] === "number" && rp[f] !== window.pet[f]) {
          // Если на клиенте значение больше (например, накликан опыт/счастье), не понижаем его пулом
          if ((f === "xp" || f === "happy" || f === "coins") && window.pet[f] > rp[f]) {
            return;
          }
          window.pet[f] = rp[f];
          needUIUpdate = true;
        }
      });

      if (rp.name && rp.name !== window.pet.name) {
        window.pet.name = rp.name;
        needUIUpdate = true;
      }
      if (rp.activeRoom && rp.activeRoom !== window.pet.activeRoom) {
        window.pet.activeRoom = rp.activeRoom;
        needUIUpdate = true;
      }
      if (rp.color && rp.color !== window.pet.color) {
        window.pet.color = rp.color;
        needUIUpdate = true;
      }
    }

    // 3. Синхронизация статусов задач из облака в локальный кэш
    if (remoteUser && Array.isArray(remoteUser.feedback)) {
      localStorage.setItem("katya_master_feedback", JSON.stringify(remoteUser.feedback));
    }

    // 4. Сверка вещей и комнат
    if (remoteUser && Array.isArray(remoteUser.ownedItems)) {
      remoteUser.ownedItems.forEach((it) => {
        if (!window.ownedItems.includes(it)) {
          window.ownedItems.push(it);
          needUIUpdate = true;
        }
      });
      localStorage.setItem("katya_owned_items", JSON.stringify(window.ownedItems));
    }

    if (remoteUser && Array.isArray(remoteUser.ownedRooms)) {
      remoteUser.ownedRooms.forEach((rm) => {
        if (!window.ownedRooms.includes(rm)) {
          window.ownedRooms.push(rm);
          needUIUpdate = true;
        }
      });
      localStorage.setItem("katya_master_rooms", JSON.stringify(window.ownedRooms));
    }

// 5. Сверка тикетов и обновление бейджа на кнопке мессенджера
    if (remoteUser && Array.isArray(remoteUser.feedback)) {
      const claimedIds = new Set(readStorage("katya_claimed_reward_ids", []));
      let uncollectedCount = 0;

      remoteUser.feedback.forEach(ticket => {
        if (ticket.status === "done" && ticket.rewardAmount > 0 && !ticket.claimed && !claimedIds.has(ticket.id)) {
          uncollectedCount++;
        }
      });

      const badge = document.getElementById("badgeSupportUnread");
      if (badge) {
        badge.innerText = uncollectedCount;
        badge.classList.toggle("hidden", uncollectedCount === 0);
      }
    }
  } catch (e) {
    console.warn("[PullCloudSettings] Error:", e);
  }
}

pullCloudSettings();
if (!isLocalExecution) {
  setInterval(pullCloudSettings, 15000);
}

/* -------------------------------------------------------------------------
 * 4. ВИЗУАЛ ПИТОМЦА, ДЕКОРАЦИИ И НОЧНОЙ РЕЖИМ
 * ------------------------------------------------------------------------- */
function applyCatColor(colorKey) {
  let main = "#f5e0dc";
  let accent = "#f2cdcd";

  if (window.GAME_ITEMS_DB?.color) {
    const cItem = window.GAME_ITEMS_DB.color.find((c) => c.id === colorKey);
    if (cItem) {
      main = cItem.hex;
      accent = cItem.accent;
    }
  }

  document.getElementById("catHead")?.setAttribute("fill", main);
  document.getElementById("catBody")?.setAttribute("fill", main);
  document.getElementById("catEarL")?.setAttribute("fill", main);
  document.getElementById("catEarR")?.setAttribute("fill", main);
  document.getElementById("catFootL")?.setAttribute("fill", accent);
  document.getElementById("catFootR")?.setAttribute("fill", accent);
  document.getElementById("catTail")?.setAttribute("stroke", accent);
}
window.applyCatColor = applyCatColor;

function applyRoomTheme(themeId) {
  const card = document.getElementById("petRoomCard");
  const sceneryLayer = document.getElementById("roomSceneryLayer");
  if (!card) return;

  const validTheme = themeId || "neon";

  if (sceneryLayer && window.ROOM_SCENERY_TEMPLATES) {
    sceneryLayer.innerHTML = window.ROOM_SCENERY_TEMPLATES[validTheme] || window.ROOM_SCENERY_TEMPLATES.neon;
  }

  if (sceneryLayer) {
    sceneryLayer.style.filter = window.pet.isSleeping ? "brightness(0.35) saturate(0.55)" : "brightness(1) saturate(1)";
  }

  const themeBorderColors = {
    neon: "border-[#818cf8]/40 shadow-[0_0_25px_rgba(99,102,241,0.25)]",
    sunny_balcony: "border-amber-400/50 shadow-[0_0_25px_rgba(251,191,36,0.25)]",
    cardboard_box: "border-amber-700/60 shadow-[0_0_20px_rgba(180,83,9,0.25)]",
    cozy: "border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]",
    rainy_cafe: "border-sky-500/40 shadow-[0_0_25px_rgba(56,189,248,0.25)]",
    forest_camp: "border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.25)]",
    city: "border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    japan: "border-pink-500/50 shadow-[0_0_30px_rgba(244,114,182,0.3)]",
    library_ancient: "border-amber-600/40 shadow-[0_0_25px_rgba(217,119,6,0.25)]",
    underwater_dome: "border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]",
    space: "border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]",
    taganrog_sea: "border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.3)]",
    crystal_cave: "border-fuchsia-500/50 shadow-[0_0_30px_rgba(217,70,239,0.3)]",
    cyber_penthouse: "border-rose-500/50 shadow-[0_0_35px_rgba(244,63,94,0.35)]",
    singularity_core: "border-white/60 shadow-[0_0_40px_rgba(255,255,255,0.4)]",
    hw_room_crypt: "border-purple-600/60 shadow-[0_0_30px_rgba(147,51,234,0.35)]",
    hw_room_patch: "border-orange-500/60 shadow-[0_0_35px_rgba(249,115,22,0.4)]",
    hw_room_castle: "border-red-600/60 shadow-[0_0_35px_rgba(220,38,38,0.4)]",
    hw_room_mist: "border-slate-400/50 shadow-[0_0_25px_rgba(148,163,184,0.3)]",
    hw_room_cauldron: "border-green-500/60 shadow-[0_0_35px_rgba(34,197,94,0.4)]",
    hw_room_web: "border-stone-500/50 shadow-[0_0_25px_rgba(120,113,108,0.3)]"
  };

  card.className = `relative border-2 rounded-3xl p-4 flex flex-col items-center transition-all duration-700 overflow-hidden min-h-[300px] ${themeBorderColors[validTheme] || themeBorderColors.neon}`;
}
window.applyRoomTheme = applyRoomTheme;

function updatePetLayers() {
  const headId = window.activeEquipment?.head || "none";
  const eyesId = window.activeEquipment?.eyes || "none";
  const bodyId = window.activeEquipment?.body || "none";
  const legsId = window.activeEquipment?.legs || "none";

  const isCoveringEars = [
    "hw_bat_ears", "hw_witch_hat", "hw_pumpkin_helm",
    "astronaut_helm", "beanie", "detective_hat"
  ].includes(headId);
  document.getElementById("defaultCatEars")?.classList.toggle("hidden", isCoveringEars);

  const backSlot = document.getElementById("svgSlotBack");
  if (backSlot) {
    backSlot.innerHTML = (bodyId === "wings_angel") ? (window.ITEM_SVG_TEMPLATES?.wings_angel || "") : "";
  }

  renderSvgSlot("svgSlotHead", headId, "head");
  renderSvgSlot("svgSlotEyes", eyesId, "eyes");
  renderSvgSlot("svgSlotBody", bodyId, "body");
  renderSvgSlot("svgSlotLegs", legsId, "legs");
}

function renderSvgSlot(slotElementId, itemId, category) {
  const slotEl = document.getElementById(slotElementId);
  if (!slotEl) return;

  if (!itemId || itemId === "none") {
    slotEl.innerHTML = "";
    return;
  }

  if (window.ITEM_SVG_TEMPLATES && window.ITEM_SVG_TEMPLATES[itemId]) {
    slotEl.innerHTML = window.ITEM_SVG_TEMPLATES[itemId];
    return;
  }

  let item = null;
  if (window.GAME_ITEMS_DB?.[category]) {
    item = window.GAME_ITEMS_DB[category].find((x) => x.id === itemId);
  }
  if (!item && window.HALLOWEEN_CASE_CONFIG?.drops) {
    item = window.HALLOWEEN_CASE_CONFIG.drops.find((x) => x.id === itemId);
  }

  if (item && item.icon) {
    const rarity = window.ITEM_RARITIES?.[item.rarity] || { color: "#fb923c" };
    const coords = {
      svgSlotHead: { x: 100, y: 46, size: 28 },
      svgSlotEyes: { x: 100, y: 92, size: 22 },
      svgSlotBody: { x: 100, y: 138, size: 26 },
      svgSlotLegs: { x: 100, y: 174, size: 22 }
    }[slotElementId] || { x: 100, y: 100, size: 22 };

    slotEl.innerHTML = `
      <g filter="drop-shadow(0 0 6px ${rarity.color})">
        <text 
          x="${coords.x}" 
          y="${coords.y}" 
          font-size="${coords.size}" 
          text-anchor="middle" 
          dominant-baseline="central"
        >${item.icon}</text>
      </g>
    `;
  } else {
    slotEl.innerHTML = "";
  }
}
window.updatePetLayers = updatePetLayers;

function updatePetUI(shouldSync = true) {
  document.getElementById("headerPetName").innerText = window.pet.name;
  document.getElementById("petNameLabel").innerText = window.pet.name;
  document.getElementById("headerCoins").innerText = window.pet.coins;
  document.getElementById("headerLevel").innerText = window.pet.level;

  const casinoHubCoins = document.getElementById("casinoHubCoins");
  if (casinoHubCoins) casinoHubCoins.innerText = window.pet.coins;

  const maxXp = window.pet.level * 100;
  const xpPercent = Math.min(100, Math.floor((window.pet.xp / maxXp) * 100));
  document.getElementById("xpBar").style.width = xpPercent + "%";
  document.getElementById("xpText").innerText = `${window.pet.xp}/${maxXp}`;

  const hunger = Math.round(window.pet.hunger);
  const happy = Math.round(window.pet.happy);
  const energy = Math.round(window.pet.energy);
  const clean = Math.round(window.pet.clean);

  document.getElementById("statHungerVal").innerText = `${hunger}%`;
  document.getElementById("statHungerBar").style.width = `${hunger}%`;
  document.getElementById("statHappyVal").innerText = `${happy}%`;
  document.getElementById("statHappyBar").style.width = `${happy}%`;
  document.getElementById("statEnergyVal").innerText = `${energy}%`;
  document.getElementById("statEnergyBar").style.width = `${energy}%`;
  document.getElementById("statCleanVal").innerText = `${clean}%`;
  document.getElementById("statCleanBar").style.width = `${clean}%`;

  const sleepOverlay = document.getElementById("sleepOverlay");
  const zzzContainer = document.getElementById("zzzContainer");
  const eyesNormal = document.getElementById("eyesNormal");
  const eyesHappy = document.getElementById("eyesHappy");
  const eyesSleep = document.getElementById("eyesSleep");
  const sleepIcon = document.getElementById("sleepIcon");
  const sleepText = document.getElementById("sleepText");
  const catSvg = document.getElementById("catSvg");
  const bubble = document.getElementById("catSpeechBubble");

  if (window.pet.isSleeping) {
    if (sleepOverlay) sleepOverlay.style.opacity = "1";
    if (zzzContainer) zzzContainer.classList.remove("hidden");
    if (eyesNormal) eyesNormal.classList.add("hidden");
    if (eyesHappy) eyesHappy.classList.add("hidden");
    if (eyesSleep) eyesSleep.classList.remove("hidden");
    if (sleepIcon) sleepIcon.innerText = "☀️";
    if (sleepText) sleepText.innerText = "Разбудить";
    if (bubble) bubble.innerText = `«Zzz... ${window.pet.name} сладко спит...» 🌙`;
    if (catSvg) catSvg.classList.add("brightness-75");
  } else {
    if (sleepOverlay) sleepOverlay.style.opacity = "0";
    if (zzzContainer) zzzContainer.classList.add("hidden");
    if (sleepIcon) sleepIcon.innerText = "🌙";
    if (sleepText) sleepText.innerText = "Уложить";
    if (eyesSleep) eyesSleep.classList.add("hidden");
    if (catSvg) catSvg.classList.remove("brightness-75");

    if (window.pet.happy > 70) {
      eyesNormal?.classList.add("hidden");
      eyesHappy?.classList.remove("hidden");
    } else {
      eyesHappy?.classList.add("hidden");
      eyesNormal?.classList.remove("hidden");
    }
  }

  applyCatColor(window.pet.color || "pink");
  applyRoomTheme(window.pet.activeRoom || "neon");
  updatePetLayers();
  renderPoops();
  savePet(shouldSync);
}
window.updatePetUI = updatePetUI;

/* -------------------------------------------------------------------------
 * 5. ОФЛАЙН-РАСЧЁТЫ, ОПЫТ, КАКАШКИ И ТАМАГОЧИ-ДЕЙСТВИЯ
 * ------------------------------------------------------------------------- */
function applyOfflineDecay() {
  const now = Date.now();
  const last = parseInt(localStorage.getItem("katya_master_last_time"), 10) || now;
  const hours = (now - last) / (1000 * 60 * 60);

  if (hours > 0.05) {
    window.pet.hunger = Math.max(5, Math.round((window.pet.hunger || 80) - hours * 12));
    window.pet.clean = Math.max(5, Math.round((window.pet.clean || 90) - hours * 8));
    window.pet.happy = Math.max(5, Math.round((window.pet.happy || 75) - hours * 9));

    if (window.pet.isSleeping) {
      window.pet.energy = Math.min(100, Math.round((window.pet.energy || 65) + hours * 25));
      if (window.pet.energy >= 100) {
        window.pet.isSleeping = false;
        window.pet.lastWokeUpAt = now;
      }
    } else {
      window.pet.energy = Math.max(5, Math.round((window.pet.energy || 65) - hours * 8));
    }
    if (hours >= 2 && window.poops.length < 3) spawnPoop(false);
  }
  localStorage.setItem("katya_master_last_time", now);
}

function spawnFloatingText(text, x, y) {
  const el = document.createElement("div");
  el.className = "absolute font-extrabold text-pink-300 text-lg pointer-events-none select-none z-50";
  el.style.left = (x || 100) + "px";
  el.style.top = (y || 80) + "px";
  el.style.animation = "floatParticle 0.8s ease-out forwards";
  el.innerText = text;
  document.getElementById("particlesLayer")?.appendChild(el);
  setTimeout(() => el.remove(), 800);
}
window.spawnFloatingText = spawnFloatingText;

function addXP(amount) {
  window.pet.xp += amount;
  const maxXp = window.pet.level * 100;
  if (window.pet.xp >= maxXp) {
    window.pet.xp -= maxXp;
    window.pet.level += 1;
    window.pet.coins += 20;
    if (window.sound?.win) window.sound.win();
    if (typeof confetti === "function") confetti({ particleCount: 45, spread: 60, origin: { y: 0.5 } });
    document.getElementById("catSpeechBubble").innerText = `🎉 Новый ${window.pet.level} уровень! Награда: +20 🪙`;
    logAuditEvent(`Получен уровень ${window.pet.level} (+20 🪙)`, "⭐");
  }
  updatePetUI();
}
window.addXP = addXP;

function spawnPoop(playSound = true) {
  if (window.poops.length >= 4) return;
  window.poops.push({
    id: Date.now() + Math.random(),
    x: Math.floor(Math.random() * 220 + 20),
    y: Math.floor(Math.random() * 120 + 110)
  });
  localStorage.setItem("katya_master_poops", JSON.stringify(window.poops));
  window.pet.clean = Math.max(5, window.pet.clean - 25);
  if (playSound) {
    if (window.sound?.poop) window.sound.poop();
    triggerHaptic();
    document.getElementById("catSpeechBubble").innerText = "«Ой... Котик сделал делишки! Убери, пожалуйста 🙈»";
  }
  updatePetUI();
}

function renderPoops() {
  const pL = document.getElementById("poopLayer");
  if (!pL) return;
  pL.innerHTML = "";
  window.poops.forEach((p, idx) => {
    const el = document.createElement("div");
    el.className = "absolute text-3xl cursor-pointer select-none animate-poop active:scale-125 z-40 p-2";
    el.style.left = p.x + "px";
    el.style.top = p.y + "px";
    el.innerHTML = "💩";

    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.poops.splice(idx, 1);
      localStorage.setItem("katya_master_poops", JSON.stringify(window.poops));
      if (window.sound?.clean) window.sound.clean();
      triggerHaptic();
      window.pet.clean = Math.min(100, window.pet.clean + 20);
      window.pet.coins += 2;
      addXP(4);
      spawnFloatingText("+2 🪙", p.x, p.y);
      logAuditEvent("Убрала какашки котика (+2 🪙)", "🧼");
      updatePetUI();
    });
    pL.appendChild(el);
  });
}

// Клик по котику (поглаживание)
document.getElementById("catTapZone")?.addEventListener("click", (e) => {
  if (window.pet.isSleeping) return;
  if (window.sound?.purr) window.sound.purr();
  triggerHaptic();

  // Фиксируем время действия игрока, чтобы pullCloudSettings не перетёр изменения
  localStorage.setItem("katya_master_last_time", Date.now());

  window.pet.happy = Math.min(100, window.pet.happy + 2);
  
  const rect = document.getElementById("particlesLayer")?.getBoundingClientRect();
  const rx = rect ? e.clientX - rect.left - 15 : 100;
  const ry = rect ? e.clientY - rect.top - 20 : 80;
  spawnFloatingText("💖", rx, ry);

  const phrases = [
    `«Муррр! ${window.pet.name} так любит ласку!» ✨`,
    "«Мяу! Катя — самое солнышко!» 💕",
    "«Уррр! Котик замурчал от счастья!» 🐾",
    "«Муррр... Покрутишь рулетку вкусняшек?» 🍣"
  ];
  document.getElementById("catSpeechBubble").innerText = phrases[Math.floor(Math.random() * phrases.length)];
  
  // addXP(2) внутри себя вызовет updatePetUI() и поставит syncToCloud на дебаунс
  addXP(2);
});

// Уложить спать / разбудить
document.getElementById("btnActionSleep")?.addEventListener("click", () => {
  const now = Date.now();

  if (window.pet.isSleeping) {
    const sleepDurationSec = Math.floor((now - (window.pet.sleepStartedAt || now)) / 1000);
    window.pet.isSleeping = false;
    window.pet.lastWokeUpAt = now;

    if (window.sound?.playTone) window.sound.playTone(320, "sine", 0.2);
    triggerHaptic();

    if (sleepDurationSec >= 60) {
      const earnedXP = Math.min(15, Math.max(2, Math.floor(sleepDurationSec / 120)));
      addXP(earnedXP);
      spawnFloatingText(`+${earnedXP} XP ★`, 100, 70);
      logAuditEvent(`Котик проснулся (отдыхал ${Math.floor(sleepDurationSec / 60)} мин, +${earnedXP} XP)`, "☀️");
    } else {
      logAuditEvent("Котика разбудили слишком быстро", "☀️");
    }

    updatePetUI();
    return;
  }

  if (window.pet.energy >= 85) {
    if (window.sound?.pop) window.sound.pop();
    alert(`«${window.pet.name} полон сил (${window.pet.energy}%) и совсем не хочет спать! ⚡ Поиграйте в мини-игры!»`);
    return;
  }

  const awakeSec = Math.floor((now - (window.pet.lastWokeUpAt || 0)) / 1000);
  if (awakeSec < 180 && window.pet.lastWokeUpAt > 0) {
    if (window.sound?.pop) window.sound.pop();
    const waitSec = 180 - awakeSec;
    alert(`«${window.pet.name} только недавно проснулся! Котик сможет уснуть снова через ${waitSec} сек 🐾»`);
    return;
  }

  window.pet.isSleeping = true;
  window.pet.sleepStartedAt = now;

  if (window.sound?.playTone) window.sound.playTone(280, "sine", 0.2);
  triggerHaptic();
  logAuditEvent("Уложила котика спать", "🌙");
  updatePetUI();
});

// Купание
document.getElementById("btnActionWash")?.addEventListener("click", () => {
  if (window.pet.isSleeping) {
    if (window.sound?.pop) window.sound.pop();
    alert("Не купай спящего котика! Сначала разбуди его ☀️");
    return;
  }
  if (window.sound?.clean) window.sound.clean();
  triggerHaptic();
  window.pet.clean = Math.min(100, window.pet.clean + 25);
  window.pet.happy = Math.min(100, window.pet.happy + 4);
  addXP(6);
  document.getElementById("catSpeechBubble").innerText = `«Буль-буль! ${window.pet.name} весь в пене и вкусно пахнет!» 🫧`;
  logAuditEvent("Искупала котика с пеной", "🫧");
  updatePetUI();
});

// Кормление
document.getElementById("btnActionFeed")?.addEventListener("click", () => {
  if (window.pet.isSleeping) {
    if (window.sound?.pop) window.sound.pop();
    alert("Котик спит! Разбуди его перед едой 🌙");
    return;
  }
  renderFoodShop();
  document.getElementById("modalFeed")?.classList.remove("hidden");
});

// Мини-игры
document.getElementById("btnActionWork")?.addEventListener("click", () => {
  if (window.pet.isSleeping) {
    if (window.sound?.pop) window.sound.pop();
    alert("Котик спит! Нажми 'Разбудить', чтобы играть 🎮");
    return;
  }
  document.getElementById("modalWork")?.classList.remove("hidden");
});

// Переименование котика
document.getElementById("btnRenamePet")?.addEventListener("click", () => {
  const newName = prompt("Введи новое имя котика:", window.pet.name);
  if (newName && newName.trim()) {
    window.pet.name = newName.trim();
    logAuditEvent(`Котик переименован в «${window.pet.name}»`, "✏️");
    updatePetUI();
  }
});

/* -------------------------------------------------------------------------
 * 6. КАФЕ ВКУСНЯШЕК (FOOD SHOP)
 * ------------------------------------------------------------------------- */
function renderFoodShop() {
  document.getElementById("feedCoinsVal").innerText = window.pet.coins;
  const box = document.getElementById("foodShopList");
  if (!box) return;
  box.innerHTML = "";
  FOOD_MENU.forEach((item) => {
    box.innerHTML += `
      <div class="bg-[#181825] border border-[#313244] p-2 rounded-2xl flex flex-col items-center justify-between gap-1">
        <span class="text-3xl">${item.icon}</span>
        <div class="text-center"><div class="text-xs font-bold">${item.name}</div><div class="text-[10px] text-emerald-400">+${item.hunger}%</div></div>
        <button class="w-full py-1.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-[11px] active:scale-95 transition cursor-pointer" onclick="buyFood('${item.id}')">${item.cost} 🪙</button>
      </div>
    `;
  });
}

window.buyFood = function (id) {
  const item = FOOD_MENU.find((f) => f.id === id);
  if (!item) return;
  if (window.pet.coins < item.cost) {
    alert("Не хватает монеток! 🎮 Поиграй в мини-игры");
    return;
  }
  window.pet.coins -= item.cost;
  window.analytics.spentCoins = (window.analytics.spentCoins || 0) + item.cost;
  window.pet.hunger = Math.min(100, window.pet.hunger + item.hunger);
  window.pet.happy = Math.min(100, window.pet.happy + item.happy);
  addXP(Math.round(item.cost * 0.8));
  if (window.sound?.feed) window.sound.feed();
  triggerHaptic();
  spawnFloatingText(`${item.icon} +${item.hunger}%`, 100, 70);
  logAuditEvent(`Купила еду: ${item.name} (-${item.cost} 🪙)`, item.icon);
  renderFoodShop();
  updatePetUI();
};

document.getElementById("btnFreeFood")?.addEventListener("click", () => {
  if (window.freeFoodData.count <= 0) {
    alert("Бесплатный творожок закончился на сегодня! ⏳");
    return;
  }
  window.freeFoodData.count--;
  localStorage.setItem("katya_master_free_food", JSON.stringify(window.freeFoodData));
  if (window.sound?.feed) window.sound.feed();
  triggerHaptic();
  window.pet.hunger = Math.min(100, window.pet.hunger + 8);
  window.pet.happy = Math.min(100, window.pet.happy + 4);
  addXP(4);
  spawnFloatingText("🥣 +8%", 100, 70);
  document.getElementById("freeFoodCount").innerText = window.freeFoodData.count;
  logAuditEvent("Скушала бесплатный творожок", "🥣");
  updatePetUI();
});

/* -------------------------------------------------------------------------
 * 7. ВИТРИНА МАГАЗИНА И ГАРДЕРОБ
 * ------------------------------------------------------------------------- */
document.getElementById("btnWardrobe")?.addEventListener("click", () => {
  switchWardrobeTab("outfits");
  document.getElementById("modalWardrobe")?.classList.remove("hidden");
  logAuditEvent("Открыла Гардероб и Витрину", "🛍️");
});

function switchWardrobeTab(tabKey) {
  const tabs = [
    { btnId: "tabWardrobeOutfits", secId: "wardrobeOutfitsSection", key: "outfits", render: () => renderWardrobeCategory("body", "wardrobeOutfitsSection") },
    { btnId: "tabWardrobeAccs", secId: "wardrobeAccSection", key: "accs", render: renderWardrobeAccs },
    { btnId: "tabWardrobeRooms", secId: "wardrobeRoomsSection", key: "rooms", render: renderWardrobeRooms },
    { btnId: "tabWardrobeColors", secId: "wardrobeColorSection", key: "colors", render: renderColorShop }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.btnId);
    const sec = document.getElementById(t.secId);
    if (!btn || !sec) return;

    if (t.key === tabKey) {
      btn.className = "flex-1 py-1.5 rounded-xl bg-pink-500 text-white font-extrabold transition-all text-[11px] shadow-sm cursor-pointer";
      sec.classList.remove("hidden");
      sec.classList.add("grid");
      t.render();
    } else {
      btn.className = "flex-1 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all text-[11px] font-bold cursor-pointer";
      sec.classList.add("hidden");
      sec.classList.remove("grid");
    }
  });

  const coinsEl = document.getElementById("shopCoinsVal");
  if (coinsEl && window.pet) coinsEl.innerText = window.pet.coins;
}

document.getElementById("tabWardrobeOutfits")?.addEventListener("click", () => switchWardrobeTab("outfits"));
document.getElementById("tabWardrobeAccs")?.addEventListener("click", () => switchWardrobeTab("accs"));
document.getElementById("tabWardrobeRooms")?.addEventListener("click", () => switchWardrobeTab("rooms"));
document.getElementById("tabWardrobeColors")?.addEventListener("click", () => switchWardrobeTab("colors"));

function getRarityBadge(rarityKey) {
  switch (rarityKey) {
    case "rare":
      return `<span class="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-purple-950/70 text-purple-300 border border-purple-500/40">Редкий</span>`;
    case "epic":
      return `<span class="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-fuchsia-950/70 text-fuchsia-300 border border-fuchsia-500/40">Эпический</span>`;
    case "legendary":
      return `<span class="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-amber-950/80 text-amber-300 border border-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.25)]">Легендарный</span>`;
    case "mythic":
      return `<span class="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]">★ Мифический</span>`;
    case "halloween":
      return `<span class="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-orange-950/80 text-orange-300 border border-orange-500/40">🎃 Хеллоуин</span>`;
    case "common":
    default:
      return `<span class="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-slate-800/80 text-slate-300 border border-slate-600/40">Обычный</span>`;
  }
}

function renderUnifiedWardrobeCard({
  name,
  subtitle,
  rarityKey,
  previewHtml,
  isEquipped,
  isOwned,
  isCaseExclusive,
  caseName,
  cost,
  equipAction,
  unequipAction,
  buyAction,
  activeLabel = "Надето",
  equipLabel = "Надеть"
}) {
  const badgeHtml = getRarityBadge(rarityKey);

  let actionHtml = "";
  if (isEquipped) {
    if (unequipAction) {
      actionHtml = `
        <button onclick="${unequipAction}" class="w-full py-1.5 px-2 rounded-xl bg-emerald-500/15 hover:bg-rose-500/15 border border-emerald-500/30 hover:border-rose-500/40 text-emerald-300 hover:text-rose-300 text-[11px] font-bold flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all cursor-pointer group/act" title="Надето (нажмите, чтобы снять)">
          <span class="group-hover/act:hidden flex items-center gap-1"><span>✓</span> ${activeLabel}</span>
          <span class="hidden group-hover/act:inline">Снять ✕</span>
        </button>`;
    } else {
      actionHtml = `
        <div class="w-full py-1.5 px-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
          <span>✓</span> ${activeLabel}
        </div>`;
    }
  } else if (isOwned) {
    actionHtml = `
      <button onclick="${equipAction}" class="w-full py-1.5 px-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/40 hover:border-pink-500 text-pink-200 hover:text-white text-[11px] font-bold active:scale-95 transition-all shadow-sm cursor-pointer">
        ${equipLabel}
      </button>`;
  } else if (isCaseExclusive) {
    actionHtml = `
      <span class="w-full py-1.5 px-2 rounded-xl bg-slate-800/80 border border-amber-500/30 text-amber-300 text-[10px] font-bold block truncate text-center" title="${caseName || 'Кейс'}">
        📦 ${caseName || 'Кейс'}
      </span>`;
  } else {
    actionHtml = `
      <button onclick="${buyAction}" class="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-[11px] font-extrabold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-[0_2px_8px_rgba(245,158,11,0.25)] cursor-pointer">
        <span>${cost}</span> <span class="text-xs">🪙</span>
      </button>`;
  }

  const borderClass = isEquipped
    ? "border-emerald-500/45 bg-gradient-to-b from-emerald-950/25 via-[#131528] to-[#131528] shadow-[0_0_15px_rgba(16,185,129,0.12)]"
    : "border-white/10 hover:border-white/20 bg-[#131528]/90 hover:bg-[#181a32]";

  return `
    <div class="relative ${borderClass} border rounded-2xl p-2.5 flex flex-col justify-between items-center text-center transition-all duration-200 group">
      <div class="w-full flex items-center justify-between gap-1 mb-1">
        ${badgeHtml}
        ${isEquipped ? `<span class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" title="Активно"></span>` : ''}
      </div>

      ${previewHtml}

      <div class="w-full my-1.5 min-h-[34px] flex flex-col items-center justify-center text-center">
        <span class="text-xs font-bold text-slate-100 line-clamp-1 leading-tight w-full" title="${name}">${name}</span>
        ${subtitle ? `<span class="text-[10px] text-slate-400 line-clamp-1 leading-tight mt-0.5 w-full" title="${subtitle}">${subtitle}</span>` : ''}
      </div>

      <div class="w-full mt-auto">
        ${actionHtml}
      </div>
    </div>
  `;
}

function renderWardrobeCategory(slotType, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !window.GAME_ITEMS_DB) return;
  container.innerHTML = "";

  const slotsToRender = slotType === "body" ? ["body", "legs"] : [slotType];

  slotsToRender.forEach((slot) => {
    (window.GAME_ITEMS_DB[slot] || []).forEach((item) => {
      if (item.id === "none") return;
      const isOwned = window.ownedItems.includes(item.id);
      const isEquipped = window.activeEquipment?.[slot] === item.id;
      const rarity = window.ITEM_RARITIES?.[item.rarity] || window.ITEM_RARITIES?.common;
      const isCaseExclusive = item.source === "case";

      const previewHtml = `
        <div class="w-14 h-14 rounded-2xl bg-[#0e101f] border border-white/5 flex items-center justify-center text-3xl my-1 group-hover:scale-105 transition-transform duration-200 select-none relative overflow-hidden" style="filter: ${rarity?.auraEffect || 'none'}">
          <span>${item.icon}</span>
        </div>`;

      container.innerHTML += renderUnifiedWardrobeCard({
        name: item.name,
        subtitle: item.desc || (slot === "body" ? "Верх" : "Низ"),
        rarityKey: item.rarity,
        previewHtml,
        isEquipped,
        isOwned,
        isCaseExclusive,
        caseName: item.caseName,
        cost: item.cost,
        equipAction: `equipSlot('${slot}', '${item.id}')`,
        unequipAction: `equipSlot('${slot}', 'none')`,
        buyAction: `buyShopItem('${item.id}', ${item.cost}, '${slot}')`,
        activeLabel: "Надето",
        equipLabel: "Надеть"
      });
    });
  });
}

function renderWardrobeAccs() {
  const box = document.getElementById("wardrobeAccSection");
  if (!box || !window.GAME_ITEMS_DB) return;
  box.innerHTML = "";

  ["head", "eyes"].forEach((slot) => {
    (window.GAME_ITEMS_DB[slot] || []).forEach((item) => {
      if (item.id === "none") return;
      const isOwned = window.ownedItems.includes(item.id);
      const isEquipped = window.activeEquipment?.[slot] === item.id;
      const rarity = window.ITEM_RARITIES?.[item.rarity] || window.ITEM_RARITIES?.common;
      const isCaseExclusive = item.source === "case";

      const previewHtml = `
        <div class="w-14 h-14 rounded-2xl bg-[#0e101f] border border-white/5 flex items-center justify-center text-3xl my-1 group-hover:scale-105 transition-transform duration-200 select-none relative overflow-hidden" style="filter: ${rarity?.auraEffect || 'none'}">
          <span>${item.icon}</span>
        </div>`;

      box.innerHTML += renderUnifiedWardrobeCard({
        name: item.name,
        subtitle: item.desc || (slot === "head" ? "Шляпа" : "Очки"),
        rarityKey: item.rarity,
        previewHtml,
        isEquipped,
        isOwned,
        isCaseExclusive,
        caseName: item.caseName,
        cost: item.cost,
        equipAction: `equipSlot('${slot}', '${item.id}')`,
        unequipAction: `equipSlot('${slot}', 'none')`,
        buyAction: `buyShopItem('${item.id}', ${item.cost}, '${slot}')`,
        activeLabel: "Надето",
        equipLabel: "Надеть"
      });
    });
  });
}

function renderWardrobeRooms() {
  const box = document.getElementById("wardrobeRoomsSection");
  if (!box || !window.GAME_ITEMS_DB?.room) return;
  box.innerHTML = "";

  window.GAME_ITEMS_DB.room.forEach((r) => {
    const isOwned = r.id === "neon" || window.ownedRooms.includes(r.id);
    const isAct = window.pet?.activeRoom === r.id;
    const isCaseExclusive = r.source === "case";

    const previewHtml = `
      <div class="w-full h-14 rounded-2xl ${r.class || 'bg-[#0e101f]'} border border-white/10 flex items-center justify-center text-2xl my-1 group-hover:scale-105 transition-transform duration-200 select-none relative overflow-hidden shadow-inner">
        <span class="z-10 drop-shadow-md select-none">${r.icon}</span>
        <div class="absolute inset-0 bg-black/25 pointer-events-none"></div>
      </div>`;

    box.innerHTML += renderUnifiedWardrobeCard({
      name: r.name,
      subtitle: r.desc || "",
      rarityKey: r.rarity,
      previewHtml,
      isEquipped: isAct,
      isOwned,
      isCaseExclusive,
      caseName: r.caseName,
      cost: r.cost,
      equipAction: `window.pet.activeRoom='${r.id}'; sound.pop(); updatePetUI(); renderWardrobeRooms();`,
      unequipAction: null,
      buyAction: `buyRoomTheme('${r.id}', ${r.cost})`,
      activeLabel: "Включено",
      equipLabel: "Включить"
    });
  });
}

function renderColorShop() {
  const box = document.getElementById("wardrobeColorSection");
  if (!box || !window.GAME_ITEMS_DB?.color) return;
  box.innerHTML = "";

  window.GAME_ITEMS_DB.color.forEach((c) => {
    const isCurrent = window.pet?.color === c.id;
    const isOwned = c.id === "pink" || window.ownedItems.includes("color_" + c.id);
    const isCaseExclusive = c.source === "case";

    const previewHtml = `
      <div class="w-14 h-14 rounded-2xl bg-[#0e101f] border border-white/5 flex items-center justify-center my-1 group-hover:scale-105 transition-transform duration-200 select-none relative">
        <div class="w-9 h-9 rounded-full border-2 border-white/70 shadow-md flex items-center justify-center" style="background-color: ${c.hex}">
          <span class="text-xs select-none">🐾</span>
        </div>
      </div>`;

    box.innerHTML += renderUnifiedWardrobeCard({
      name: c.name,
      subtitle: "Окрас шерстки",
      rarityKey: c.rarity,
      previewHtml,
      isEquipped: isCurrent,
      isOwned,
      isCaseExclusive,
      caseName: c.caseName,
      cost: c.cost,
      equipAction: `window.pet.color='${c.id}'; sound.pop(); updatePetUI(); renderColorShop();`,
      unequipAction: null,
      buyAction: `buyShopItem('color_${c.id}', ${c.cost}, 'color')`,
      activeLabel: "Выбрано",
      equipLabel: "Выбрать"
    });
  });
}

window.equipSlot = function (slot, id) {
  if (!window.activeEquipment) window.activeEquipment = {};
  window.activeEquipment[slot] = id;
  localStorage.setItem("katya_active_equipment", JSON.stringify(window.activeEquipment));
  if (window.sound?.pop) window.sound.pop();
  updatePetUI();
  renderWardrobeCategory("body", "wardrobeOutfitsSection");
  renderWardrobeAccs();
  const coinsEl = document.getElementById("shopCoinsVal");
  if (coinsEl && window.pet) coinsEl.innerText = window.pet.coins;
};

window.buyShopItem = function (id, cost, slot) {
  if (window.pet.coins < cost) {
    alert("Не хватает монеток! 💼 Заработай в играх");
    return;
  }
  window.pet.coins -= cost;
  window.analytics.spentCoins = (window.analytics.spentCoins || 0) + cost;

  if (!window.ownedItems.includes(id)) window.ownedItems.push(id);
  if (slot === "color") {
    window.pet.color = String(id).replace(/^color_/, "");
  } else {
    window.activeEquipment[slot] = id;
  }

  localStorage.setItem("katya_owned_items", JSON.stringify(window.ownedItems));
  localStorage.setItem("katya_active_equipment", JSON.stringify(window.activeEquipment));

  if (window.sound?.win) window.sound.win();
  updatePetUI();
  renderWardrobeCategory("body", "wardrobeOutfitsSection");
  renderWardrobeAccs();
  renderColorShop();

  const coinsEl = document.getElementById("shopCoinsVal");
  if (coinsEl && window.pet) coinsEl.innerText = window.pet.coins;
};

window.buyRoomTheme = function (id, cost) {
  if (window.pet.coins < cost) {
    alert("Не хватает монеток! 💼 Заработай в играх");
    return;
  }
  window.pet.coins -= cost;
  window.analytics.spentCoins = (window.analytics.spentCoins || 0) + cost;
  window.ownedRooms.push(id);
  window.pet.activeRoom = id;

  localStorage.setItem("katya_master_rooms", JSON.stringify(window.ownedRooms));
  if (window.sound?.win) window.sound.win();
  updatePetUI();
  renderWardrobeRooms();

  const coinsEl = document.getElementById("shopCoinsVal");
  if (coinsEl && window.pet) coinsEl.innerText = window.pet.coins;
};

// Алиасы для совместимости с внешними вызовами
window.buyItem = window.buyShopItem;
window.equipItem = window.equipSlot;
window.unequipAll = function () {
  if (typeof window.unequipAllCosmetics === "function") {
    window.unequipAllCosmetics();
  } else {
    window.activeEquipment = { head: "none", eyes: "none", body: "none", legs: "none" };
    localStorage.setItem("katya_active_equipment", JSON.stringify(window.activeEquipment));
    updatePetUI();
  }
  renderWardrobeCategory("body", "wardrobeOutfitsSection");
  renderWardrobeAccs();
};

document.getElementById("btnRemoveAllOutfits")?.addEventListener("click", () => {
  window.activeEquipment = { head: "none", eyes: "none", body: "none", legs: "none" };
  localStorage.setItem("katya_active_equipment", JSON.stringify(window.activeEquipment));
  if (window.sound?.pop) window.sound.pop();
  updatePetUI();
  renderWardrobeCategory("body", "wardrobeOutfitsSection");
  renderWardrobeAccs();
});

/* -------------------------------------------------------------------------
 * 8. ЛИЧНЫЙ ИНВЕНТАРЬ (INVENTORY MODAL)
 * ------------------------------------------------------------------------- */
let currentInvTab = "all";

document.getElementById("btnOpenInventory")?.addEventListener("click", () => {
  document.getElementById("modalInventory")?.classList.remove("hidden");
  renderInventoryGrid();
  logAuditEvent("Открыла личный инвентарь", "🎒");
});

window.switchInvFilter = function (tab) {
  currentInvTab = tab;
  document.querySelectorAll(".inv-tab-btn").forEach((b) => {
    b.className = b.dataset.invtab === tab
      ? "inv-tab-btn flex-1 py-1 px-2 rounded-lg bg-indigo-600 text-white whitespace-nowrap font-black"
      : "inv-tab-btn flex-1 py-1 px-2 rounded-lg text-gray-400 whitespace-nowrap";
  });
  renderInventoryGrid();
};

function renderInventoryGrid() {
  const grid = document.getElementById("inventoryItemsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  let allOwned = [];

  ["head", "eyes", "body", "legs", "room"].forEach((slot) => {
    const list = window.GAME_ITEMS_DB?.[slot] || [];
    list.forEach((item) => {
      if (!item || item.id === "none") return;

      const isBase = item.id === "neon";
      const isOwned = isBase || (window.ownedItems && window.ownedItems.includes(item.id)) || (window.ownedRooms && window.ownedRooms.includes(item.id));

      if (isOwned) {
        allOwned.push(Object.assign({}, item, { slotType: slot }));
      }
    });
  });

  let filtered = allOwned;
  if (currentInvTab !== "all") {
    filtered = (currentInvTab === "halloween")
      ? allOwned.filter((x) => x.rarity === "halloween")
      : allOwned.filter((x) => x.slotType === currentInvTab);
  }

  const countEl = document.getElementById("invTotalCount");
  if (countEl) countEl.innerText = allOwned.length;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-3 text-center text-xs text-gray-500 py-8">В этой категории пока пусто ✨</div>`;
    return;
  }

  filtered.forEach((it) => {
    const isEquipped = (it.slotType === "room")
      ? (window.pet.activeRoom === it.id)
      : (window.activeEquipment && window.activeEquipment[it.slotType] === it.id);

    const r = window.ITEM_RARITIES?.[it.rarity] || {
      name: "Обычный",
      borderClass: "border-[#313244]",
      glowClass: "",
      badgeBg: "bg-slate-800 text-slate-300 border-slate-600/50"
    };

    grid.innerHTML += `
      <div class="bg-[#18192a] border-2 ${isEquipped ? "border-pink-500 shadow-[0_0_15px_rgba(244,114,182,0.35)]" : r.borderClass} ${r.glowClass} p-2 rounded-2xl flex flex-col items-center justify-between text-center relative group min-h-[115px]">
        <div class="w-full flex justify-between items-center text-[9px]">
          <span class="px-1.5 py-0.5 rounded font-mono font-bold border ${r.badgeBg}">${r.name}</span>
        </div>
        <span class="text-3xl my-1 select-none">${it.icon}</span>
        <span class="text-[11px] font-bold text-gray-200 leading-tight line-clamp-2 w-full px-0.5" title="${it.name}">${it.name}</span>
        
        ${isEquipped
          ? `<button onclick="unequipSpecificItem('${it.slotType}')" class="w-full mt-1.5 py-1 rounded-lg bg-pink-500/20 border border-pink-500 text-pink-300 hover:bg-rose-500 hover:text-white text-[10px] font-bold active:scale-95 transition cursor-pointer">Снять ✕</button>`
          : `<button onclick="equipFromInventory('${it.slotType}', '${it.id}')" class="w-full mt-1.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold active:scale-95 transition cursor-pointer">Надеть</button>`}
      </div>
    `;
  });
}

window.unequipSpecificItem = function (slotType) {
  if (slotType === "room") {
    window.pet.activeRoom = "neon";
  } else if (window.activeEquipment) {
    window.activeEquipment[slotType] = "none";
    localStorage.setItem("katya_active_equipment", JSON.stringify(window.activeEquipment));
  }
  if (window.sound?.pop) window.sound.pop();
  updatePetUI();
  renderInventoryGrid();
};

window.equipFromInventory = function (slotType, id) {
  if (slotType === "room") {
    window.pet.activeRoom = id;
  } else {
    window.activeEquipment[slotType] = id;
    localStorage.setItem("katya_active_equipment", JSON.stringify(window.activeEquipment));
  }
  if (window.sound?.pop) window.sound.pop();
  updatePetUI();
  renderInventoryGrid();
};

window.unequipAllCosmetics = function () {
  window.activeEquipment = { head: "none", eyes: "none", body: "none", legs: "none" };
  window.pet.activeRoom = "neon";
  localStorage.setItem("katya_active_equipment", JSON.stringify(window.activeEquipment));
  updatePetUI();
  renderInventoryGrid();
};

/* -------------------------------------------------------------------------
 * 9. РУЛЕТКА ВКУСНОСТЕЙ (CANVAS 600×600)
 * ------------------------------------------------------------------------- */
const rCanvas = document.getElementById("rouletteCanvas");
const rCtx = rCanvas?.getContext("2d");
let currentAngle = 0;
let isWheelSpinning = false;
const WHEEL_PALETTE = ["#FF5E57", "#FFA940", "#FFD53F", "#1DD1A1", "#48DBFB", "#9B59B6", "#FF6B81", "#54A0FF"];

function drawWheel() {
  if (!rCtx || !rCanvas) return;
  const w = rCanvas.width;
  const cx = w / 2;
  const cy = w / 2;
  const radius = cx - 28;
  const count = window.wheelItems.length;

  rCtx.clearRect(0, 0, w, w);
  if (count === 0) return;
  const arc = (2 * Math.PI) / count;

  for (let i = 0; i < count; i++) {
    rCtx.beginPath();
    rCtx.fillStyle = WHEEL_PALETTE[i % WHEEL_PALETTE.length];
    rCtx.moveTo(cx, cy);
    rCtx.arc(cx, cy, radius, currentAngle + i * arc, currentAngle + (i + 1) * arc);
    rCtx.fill();
    rCtx.save();
    rCtx.translate(cx, cy);
    rCtx.rotate(currentAngle + i * arc + arc / 2);
    rCtx.fillStyle = "#ffffff";
    rCtx.font = "bold 22px 'Nunito', sans-serif";
    rCtx.textAlign = "right";
    rCtx.fillText(window.wheelItems[i], radius - 35, 8);
    rCtx.restore();
  }

  rCtx.beginPath();
  rCtx.arc(cx, cy, 45, 0, 2 * Math.PI);
  rCtx.fillStyle = "#1e1e2e";
  rCtx.fill();
  rCtx.fillStyle = "#f38ba8";
  rCtx.font = "26px sans-serif";
  rCtx.textAlign = "center";
  rCtx.fillText("💖", cx, cy + 8);
}

document.getElementById("btnSpinWheel")?.addEventListener("click", () => {
  if (isWheelSpinning || window.wheelItems.length < 2) return;
  isWheelSpinning = true;
  const startRot = currentAngle;
  const targetRot = startRot + 6 * 2 * Math.PI + Math.random() * 2 * Math.PI;
  const st = performance.now();

  function anim(time) {
    const p = Math.min((time - st) / 4500, 1);
    currentAngle = startRot + (targetRot - startRot) * (1 - Math.pow(1 - p, 3));
    drawWheel();

    if (p < 1) {
      requestAnimationFrame(anim);
    } else {
      isWheelSpinning = false;
      const arc = (2 * Math.PI) / window.wheelItems.length;
      const idx = Math.floor(((3 * Math.PI / 2 - (currentAngle % (2 * Math.PI)) + 4 * Math.PI) % (2 * Math.PI)) / arc) % window.wheelItems.length;
      const winner = window.wheelItems[idx];
      const winId = "#WIN-" + Math.floor(1000 + Math.random() * 9000);

      if (window.sound?.win) window.sound.win();
      if (typeof confetti === "function") confetti({ particleCount: 75, spread: 80 });

      document.getElementById("rouletteResultText").innerHTML = `🎉 Заказываем:<br><span class="text-pink-400 font-black">${escapeHtml(winner)}</span> (${winId})!`;

      let rHist = readStorage("katya_master_roulette_history", []);
      rHist.push({ id: winId, item: winner, time: new Date().toLocaleString("ru-RU") });
      if (rHist.length > 50) rHist.shift();
      localStorage.setItem("katya_master_roulette_history", JSON.stringify(rHist));

      window.pet.coins += 8;
      logAuditEvent(`Рулетка: заказ «${winner}» [${winId}] (+8 🪙)`, "🎰");
      updatePetUI();
    }
  }
  requestAnimationFrame(anim);
});

document.getElementById("btnOpenWheelSettings")?.addEventListener("click", () => {
  renderWheelSettingsList();
  document.getElementById("modalWheelSettings")?.classList.remove("hidden");
});

function renderWheelSettingsList() {
  const list = document.getElementById("settingsWheelList");
  if (!list) return;
  list.innerHTML = "";
  window.wheelItems.forEach((item, idx) => {
    list.innerHTML += `
      <div class="flex items-center justify-between bg-[#181825] border border-[#313244] px-3 py-2 rounded-xl text-xs">
        <span class="truncate pr-2">${escapeHtml(item)}</span>
        <button class="text-rose-400 hover:text-rose-300 font-bold px-1 cursor-pointer" onclick="deleteWheelItem(${idx})">✕</button>
      </div>
    `;
  });
}

window.deleteWheelItem = function (idx) {
  if (window.wheelItems.length <= 2) {
    alert("Оставь минимум 2 варианта блюд!");
    return;
  }
  window.wheelItems.splice(idx, 1);
  localStorage.setItem("katya_master_wheel_items", JSON.stringify(window.wheelItems));
  renderWheelSettingsList();
  drawWheel();
};

document.getElementById("btnAddWheelItem")?.addEventListener("click", () => {
  const input = document.getElementById("inputNewItem");
  const val = input ? input.value.trim() : "";
  if (val) {
    window.wheelItems.push(val);
    localStorage.setItem("katya_master_wheel_items", JSON.stringify(window.wheelItems));
    if (input) input.value = "";
    renderWheelSettingsList();
    drawWheel();
  }
});

/* -------------------------------------------------------------------------
 * 10. ПОЛНОЦЕННЫЙ САППОРТ / ОПРОСНИК И БЛАГОДАРНОСТИ
 * ------------------------------------------------------------------------- */
window.currentFeedbackCategory = "💖 Любовь";
window.currentFeedbackRating = 5;
window.attachedScreenshotBase64 = null;
window.attachedScreenshotFile = null;

window.closeThanksModal = function () {
  if (window.currentPendingReward) {
    window.currentPendingReward.claimed = true;
    logAuditEvent(`Получила благодарность от разработчика (+${window.currentPendingReward.coins || 0} 🪙)`, "💖");
    window.currentPendingReward = null;
    syncToCloud();
  }
  document.getElementById("modalProjectThanks")?.classList.add("hidden");
  updatePetUI();
};

window.openSupportModal = function () {
  const modal = document.getElementById("modalSupport");
  const input = document.getElementById("supportMessageInput");
  if (input) input.value = "";
  const counter = document.getElementById("supportCharCounter");
  if (counter) counter.innerText = "0/600";
  window.resetSupportImage();
  window.onFeedbackCat("💖 Любовь");
  window.onStarClick(5);
  modal?.classList.remove("hidden");
  if (window.sound?.pop) window.sound.pop();
};

window.closeSupportModal = function () {
  document.getElementById("modalSupport")?.classList.add("hidden");
};

document.getElementById("btnOpenSupport")?.addEventListener("click", window.openSupportModal);

window.onFeedbackCat = function (cat) {
  window.currentFeedbackCategory = cat;
  const btnLove = document.getElementById("typeBtnLove");
  const btnIdea = document.getElementById("typeBtnIdea");
  const btnBug = document.getElementById("typeBtnBug");

  const activeCls = "support-cat-btn py-1.5 rounded-xl bg-pink-500 text-white shadow-sm transition font-bold cursor-pointer";
  const inactiveCls = "support-cat-btn py-1.5 rounded-xl text-gray-400 hover:text-white transition font-bold cursor-pointer";

  if (btnLove) btnLove.className = (cat === "💖 Любовь") ? activeCls : inactiveCls;
  if (btnIdea) btnIdea.className = (cat === "💡 Идея") ? activeCls : inactiveCls;
  if (btnBug) btnBug.className = (cat === "🪲 Баг") ? activeCls : inactiveCls;
  if (window.sound?.pop) window.sound.pop();
};

window.onStarClick = function (stars) {
  window.currentFeedbackRating = stars;
  const starElements = document.querySelectorAll("#supportRatingStars .star-item");
  starElements.forEach((el, idx) => {
    el.className = (idx < stars) ? "star-item text-amber-400 p-0.5 select-none" : "star-item text-gray-600 p-0.5 select-none";
  });
  if (window.sound?.pop) window.sound.pop();
};

window.onSupportFileChange = function (e) {
  if (e.target.files && e.target.files[0]) {
    window.processImageFile(e.target.files[0]);
  }
};

window.processImageFile = function (file) {
  if (!file || !file.type.startsWith("image/")) return;
  window.attachedScreenshotFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDim = 800;
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
        else { w = Math.round((w * maxDim) / h); h = maxDim; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      window.attachedScreenshotBase64 = canvas.toDataURL("image/jpeg", 0.7);

      const preview = document.getElementById("supportImagePreview");
      const container = document.getElementById("imagePreviewContainer");
      const prompt = document.getElementById("uploadPrompt");
      if (preview) preview.src = window.attachedScreenshotBase64;
      container?.classList.remove("hidden");
      prompt?.classList.add("hidden");
      if (window.sound?.pop) window.sound.pop();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

window.resetSupportImage = function (e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  window.attachedScreenshotBase64 = null;
  window.attachedScreenshotFile = null;
  const input = document.getElementById("supportImageInput");
  const preview = document.getElementById("supportImagePreview");
  const container = document.getElementById("imagePreviewContainer");
  const prompt = document.getElementById("uploadPrompt");
  if (input) input.value = "";
  if (preview) preview.src = "";
  container?.classList.add("hidden");
  prompt?.classList.remove("hidden");
};

window.addEventListener("paste", (e) => {
  if (document.getElementById("modalSupport")?.classList.contains("hidden")) return;
  const items = e.clipboardData?.items;
  if (!items) return;
  for (let it of items) {
    if (it.type.indexOf("image") !== -1) {
      window.processImageFile(it.getAsFile());
      break;
    }
  }
});

document.getElementById("supportMessageInput")?.addEventListener("input", (e) => {
  const counter = document.getElementById("supportCharCounter");
  if (counter) counter.innerText = `${e.target.value.length}/600`;
});

// Отправка отчёта БЕЗ VPN: чисто через JSONBin
window.submitFeedbackReport = async function () {
  const input = document.getElementById("supportMessageInput");
  const text = input ? input.value.trim() : "";
  const sendBtn = document.getElementById("btnSendSupportMessage");
  const attachLogs = document.getElementById("attachLogsCheckbox")?.checked ?? true;

  if (!text) {
    alert("Напиши хотя бы пару слов перед отправкой! 🐾");
    return;
  }

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.innerText = "ОТПРАВЛЯЕМ... ⏳";
  }

  const techLogs = attachLogs ? {
    userAgent: navigator.userAgent,
    screen: window.innerWidth + "x" + window.innerHeight,
    lastError: window.LAST_CAUGHT_ERROR || null,
    consoleHistory: Array.isArray(window.CLIENT_LOGS_BUFFER) ? [...window.CLIENT_LOGS_BUFFER] : []
  } : null;

  const feedbackData = {
    id: "fb_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    category: window.currentFeedbackCategory,
    rating: window.currentFeedbackRating,
    text: text,
    status: "inbox",
    petName: window.pet?.name || "Зефирка",
    petLevel: window.pet?.level || 1,
    coins: window.pet?.coins || 0,
    hasImage: !!window.attachedScreenshotBase64,
    image: window.attachedScreenshotBase64 || null,
    techLogs: techLogs,
    tgSent: false, // <--- Метка: дашборд увидит и перешлёт тебе в TG
    date: new Date().toLocaleString("ru-RU")
  };

  try {
    // 1. Сохраняем локально
    let storedFeedback = readStorage("katya_master_feedback", []);
    storedFeedback.unshift(feedbackData);
    if (storedFeedback.length > 50) storedFeedback.pop();
    localStorage.setItem("katya_master_feedback", JSON.stringify(storedFeedback));

    // 2. Отправляем в облако JSONBin
    await syncToCloud();

    if (window.sound?.win) window.sound.win();
    if (typeof confetti === "function") confetti({ particleCount: 70, spread: 80 });

    alert("Послание успешно сохранено и передано разработчику! 💖✨");
    window.closeSupportModal();
    logAuditEvent("Отправила отзыв [" + window.currentFeedbackCategory + "]", "💌");

  } catch (err) {
    console.error("Feedback submit error:", err);
    alert("Сообщение сохранено в игре, разработчик увидит его в дашборде! 🐾");
    window.closeSupportModal();
  } finally {
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.innerHTML = "<span>ОТПРАВИТЬ ОТЧЁТ</span> <span>🚀</span>";
    }
  }
};

/* =========================================================================
 * 10. МЕССЕНДЖЕР СЛУЖБЫ ЗАБОТЫ (СПИСОК ТИКЕТОВ И ЧАТ)
 * ========================================================================= */
window.activeChatTicketId = null;
window.newTicketCat = "💖 Любовь";
window.newTicketRatingVal = 5;
window.newTicketBase64 = null;
window.chatAttachedBase64 = null;

window.openSupportMessenger = function () {
  document.getElementById("modalSupportMessenger")?.classList.remove("hidden");
  supportShowScreen("list");
};

window.closeSupportMessenger = function () {
  document.getElementById("modalSupportMessenger")?.classList.add("hidden");
};

document.getElementById("btnOpenSupport")?.addEventListener("click", window.openSupportMessenger);

// Переключение экранов: list | chat | new
window.supportShowScreen = function (screenName) {
  const sList = document.getElementById("msgScreenList");
  const sChat = document.getElementById("msgScreenChat");
  const sNew = document.getElementById("msgScreenNew");
  const btnBack = document.getElementById("msgNavBackBtn");
  const btnCreate = document.getElementById("msgNavCreateBtn");

  sList?.classList.add("hidden");
  sChat?.classList.add("hidden");
  sNew?.classList.add("hidden");

  if (screenName === "list") {
    sList?.classList.remove("hidden");
    btnBack?.classList.add("hidden");
    btnCreate?.classList.remove("hidden");
    document.getElementById("msgHeaderTitle").innerText = "Служба заботы";
    document.getElementById("msgHeaderSubtitle").innerText = "Прямой диалог с Алексеем ✨";
    renderTicketListView();
  } else if (screenName === "chat") {
    sChat?.classList.remove("hidden");
    btnBack?.classList.remove("hidden");
    btnCreate?.classList.add("hidden");
  } else if (screenName === "new") {
    sNew?.classList.remove("hidden");
    btnBack?.classList.add("hidden");
    btnCreate?.classList.add("hidden");
    document.getElementById("msgHeaderTitle").innerText = "Новое обращение";
    document.getElementById("msgHeaderSubtitle").innerText = "Опиши проблему или идею ✨";
  }
};

// 1. Отрисовка списка тикетов
function renderTicketListView() {
  const container = document.getElementById("msgTicketsContainer");
  const empty = document.getElementById("msgTicketsEmpty");
  if (!container) return;

  const list = readStorage("katya_master_feedback", []);
  const claimedIds = new Set(readStorage("katya_claimed_reward_ids", []));

  container.innerHTML = "";
  if (list.length === 0) {
    empty?.classList.remove("hidden");
    return;
  }
  empty?.classList.add("hidden");

  list.forEach(ticket => {
    const isDone = ticket.status === "done";
    const isClaimed = claimedIds.has(ticket.id) || ticket.claimed === true;
    const hasReward = isDone && ticket.rewardAmount > 0 && !ticket.claimed && !claimedIds.has(ticket.id);
    const msgs = Array.isArray(ticket.messages) ? ticket.messages : [];
    const lastMsgText = msgs.length > 0 ? msgs[msgs.length - 1].text : (ticket.text || "");

    if (isDone && isClaimed) return;

    let badgeClass = "bg-slate-700 text-gray-300";
    let badgeText = "Принято";
    if (ticket.status === "in_progress") { badgeClass = "bg-amber-500/20 text-amber-300 border border-amber-500/30"; badgeText = "В работе ⚙️"; }
    else if (ticket.status === "testing") { badgeClass = "bg-purple-500/20 text-purple-300 border border-purple-500/30"; badgeText = "Тест 🧪"; }
    else if (isDone) { badgeClass = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"; badgeText = "Решено ✓"; }

    const card = document.createElement("div");
    card.className = "bg-[#131528] hover:bg-[#181b33] border border-white/5 hover:border-pink-500/40 rounded-2xl p-3 flex flex-col gap-1.5 transition active:scale-[0.99] cursor-pointer shadow-md";
    card.onclick = () => openTicketChat(ticket.id);

    card.innerHTML = `
      <div class="flex justify-between items-center text-[10px]">
        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded-full font-mono font-bold ${badgeClass}">${badgeText}</span>
          <span class="text-pink-300 font-bold">${escapeHtml(ticket.category || "Обращение")}</span>
        </div>
        <span class="text-gray-500 font-mono">${ticket.date ? ticket.date.split(",")[0] : ""}</span>
      </div>
      <p class="text-xs text-gray-200 line-clamp-2 leading-relaxed">${escapeHtml(lastMsgText)}</p>
      <div class="flex justify-between items-center text-[10px] text-gray-400 pt-1 border-t border-white/5 font-mono">
        <span>#${ticket.id.slice(-6)} • ${msgs.length} сообщ.</span>
        ${hasReward ? '<span class="text-amber-300 font-black animate-pulse">🎁 Забрать +' + (ticket.rewardAmount || 35) + ' 🪙</span>' : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

let isPlayerChatPolling = false;
let lastPlayerChatHash = "";

// 2. Открытие чата конкретного тикета
function openTicketChat(ticketId) {
  window.activeChatTicketId = ticketId;
  lastPlayerChatHash = "";
  supportShowScreen("chat");

  const list = readStorage("katya_master_feedback", []);
  const claimedIds = new Set(readStorage("katya_claimed_reward_ids", []));
  const ticket = list.find(t => t.id === ticketId);
  if (!ticket) return;

  document.getElementById("msgHeaderTitle").innerText = `Тикет #${ticket.id.slice(-6)}`;
  document.getElementById("msgHeaderSubtitle").innerText = ticket.category || "Обращение";

  const badgeCat = document.getElementById("chatTicketCategoryBadge");
  const badgeSt = document.getElementById("chatTicketStatusBadge");
  const claimBtn = document.getElementById("btnClaimChatReward");

  if (badgeCat) badgeCat.innerText = ticket.category;
  if (badgeSt) {
    if (ticket.status === "done") {
      badgeSt.innerText = "РЕШЕНО ✓";
      badgeSt.className = "text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    } else {
      badgeSt.innerText = ticket.status === "in_progress" ? "В РАБОТЕ ⚙️" : "ПРИНЯТО 📥";
      badgeSt.className = "text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30";
    }
  }

  // Кнопка забрать монеты
  const isDone = ticket.status === "done";
  const reward = ticket.rewardAmount || 35;
  const isClaimed = claimedIds.has(ticket.id) || ticket.claimed === true;

  if (isDone && ticket.rewardGranted && !isClaimed) {
    if (claimBtn) {
      claimBtn.innerText = `Забрать +${reward} 🪙`;
      claimBtn.classList.remove("hidden");
    }
  } else {
    claimBtn?.classList.add("hidden");
  }

  // Интерактивный блок CSAT при закрытом тикете
  const csatBox = document.getElementById("chatCsatContainer");
  if (csatBox) {
    if (isDone) {
      csatBox.classList.remove("hidden");
      if (ticket.csatRating) {
        csatBox.innerHTML = `
          <div class="py-1 text-center text-xs font-bold text-pink-300 flex items-center justify-center gap-1.5">
            <span>⭐ Твоя оценка: ${ticket.csatRating}/5</span>
            <span class="text-slate-400">• Спасибо за отзыв! ❤️</span>
          </div>
        `;
      } else {
        updateCsatStarsUI(5);
      }
    } else {
      csatBox.classList.add("hidden");
    }
  }

  renderChatTimeline(ticket);
}

window.currentCsatSelected = 5;

window.setChatCsatRating = function (val) {
  window.currentCsatSelected = val;
  updateCsatStarsUI(val);
};

function updateCsatStarsUI(score) {
  const lbl = document.getElementById("csatCurrentScoreLabel");
  if (lbl) lbl.innerText = `${score} / 5`;
  document.querySelectorAll("#csatStarsRow .csat-star").forEach((btn, idx) => {
    if (idx < score) {
      btn.className = "csat-star text-amber-400 hover:scale-125 transition cursor-pointer";
    } else {
      btn.className = "csat-star text-slate-600 hover:scale-125 transition cursor-pointer";
    }
  });
}

window.submitQuickCsat = async function (comment) {
  const ticketId = window.activeChatTicketId;
  if (!ticketId) return;
  let list = readStorage("katya_master_feedback", []);
  const ticket = list.find(t => t.id === ticketId);
  if (!ticket) return;

  const rating = window.currentCsatSelected || 5;
  ticket.csatRating = rating;
  ticket.csatComment = comment || "";

  if (!Array.isArray(ticket.messages)) ticket.messages = [];
  const sysMsg = {
    id: "csat_" + Date.now(),
    author: "system",
    text: `⭐ Катя оценила решение на ${rating}/5: «${comment || "Всё отлично!"}»`,
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now()
  };
  ticket.messages.push(sysMsg);
  localStorage.setItem("katya_master_feedback", JSON.stringify(list));

  const csatBox = document.getElementById("chatCsatContainer");
  if (csatBox) {
    csatBox.innerHTML = `
      <div class="py-1 text-center text-xs font-bold text-pink-300">
        Спасибо за оценку (${rating}/5)! Твой отзыв очень важен ❤️
      </div>
    `;
  }

  renderChatTimeline(ticket);
  syncToCloud();
};

// Хронологическая нормализация и дедупликация сообщений
function normalizeAndSortPlayerMessages(rawMsgs, fallbackText, fallbackDate) {
  const map = new Map();

  if ((!Array.isArray(rawMsgs) || rawMsgs.length === 0) && fallbackText) {
    const initId = "m_init";
    map.set(initId, {
      id: initId,
      author: "katya",
      text: fallbackText,
      time: fallbackDate ? (fallbackDate.split(",")[1] || "").trim() : "",
      timestamp: fallbackDate ? (Date.parse(fallbackDate) || 0) : 0,
      sending: false,
      system: false
    });
  }

  if (Array.isArray(rawMsgs)) {
    rawMsgs.forEach(m => {
      if (!m) return;
      const id = m.id || ("msg_" + Math.random().toString(36).substring(2, 9));
      let ts = m.timestamp;
      if (!ts) {
        const match = id.match(/\d{10,}/);
        if (match) ts = parseInt(match[0], 10);
        else if (m.time) {
          const parsed = Date.parse((fallbackDate ? fallbackDate.split(",")[0] : "") + " " + m.time);
          ts = !isNaN(parsed) ? parsed : Date.now();
        } else {
          ts = Date.now();
        }
      }

      const isSys = m.author === "system" ||
        (typeof m.text === "string" && (
          m.text.startsWith("⚡") ||
          m.text.startsWith("🎁") ||
          m.text.startsWith("🐾") ||
          m.text.startsWith("📋") ||
          m.text.startsWith("[SUPPORT") ||
          m.text.startsWith("⭐")
        ));

      map.set(id, {
        id: id,
        author: isSys ? "system" : (m.author || "katya"),
        text: m.text || "",
        image: m.image || null,
        time: m.time || "",
        timestamp: ts,
        sending: !!m.sending,
        system: isSys
      });
    });
  }

  return Array.from(map.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

// 3. Отрисовка пузырей переписки
function renderChatTimeline(ticket) {
  const box = document.getElementById("chatMessagesTimeline");
  if (!box || !ticket) return;
  box.innerHTML = "";

  const sortedMsgs = normalizeAndSortPlayerMessages(ticket.messages, ticket.text, ticket.date);

  sortedMsgs.forEach(msg => {
    // Системные события (по центру)
    if (msg.system) {
      const sysBubble = document.createElement("div");
      sysBubble.className = "w-full flex justify-center my-1 select-text";
      sysBubble.innerHTML = `
        <div class="px-3 py-1 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5 shadow-sm max-w-[85%] text-center leading-normal">
          <span>${escapeHtml(msg.text)}</span>
          ${msg.time ? `<span class="opacity-50 text-[9px]">• ${escapeHtml(msg.time)}</span>` : ""}
        </div>
      `;
      box.appendChild(sysBubble);
      return;
    }

    const isKatya = msg.author === "katya";
    const bubble = document.createElement("div");
    bubble.className = `flex flex-col ${isKatya ? "items-end" : "items-start"} gap-1 w-full`;

    const card = document.createElement("div");
    card.className = `max-w-[85%] rounded-2xl ${isKatya ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-tr-sm' : 'bg-[#181a30] border border-cyan-500/30 text-gray-200 rounded-tl-sm'} p-3 text-xs shadow-md flex flex-col gap-1`;

    const authorLabel = isKatya ? "Вы (Катя)" : "🛠️ Алексей (Разработчик)";
    const safeText = escapeHtml(msg.text);
    const safeTime = msg.time ? escapeHtml(msg.time) : "";
    const tickStatus = msg.sending ? "⏳" : "✓✓";

    card.innerHTML = `
      <div class="text-[9px] font-mono opacity-70 mb-0.5">${authorLabel}</div>
      ${safeText ? `<div class="whitespace-pre-wrap leading-relaxed select-text">${safeText}</div>` : ""}
    `;

    // Отображение прикрепленного изображения
    if (msg.image) {
      const imgWrap = document.createElement("div");
      imgWrap.className = "mt-1 rounded-xl overflow-hidden border border-white/20 max-h-48 cursor-pointer relative group";
      imgWrap.innerHTML = `
        <img src="${msg.image}" alt="Вложение" class="w-full h-full max-h-48 object-cover rounded-xl transition hover:opacity-95 active:scale-[0.99]" />
        <span class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">🔍 Увеличить</span>
      `;
      imgWrap.onclick = () => window.openFullImage(msg.image);
      card.appendChild(imgWrap);
    }

    // Нижний колонтитул со временем и статусом отправки
    const footer = document.createElement("div");
    footer.className = "text-[9px] font-mono opacity-65 self-end mt-0.5 flex items-center gap-1 justify-end";
    footer.innerHTML = `<span>${safeTime}</span><span>${tickStatus}</span>`;
    card.appendChild(footer);

    bubble.appendChild(card);
    box.appendChild(bubble);
  });

  if (typeof window.scrollChatToBottom === "function") {
    window.scrollChatToBottom(box, true);
  } else {
    box.scrollTop = box.scrollHeight;
  }
}

window.insertPlayerChatChip = function (text) {
  const input = document.getElementById("chatTextInput");
  if (!input) return;
  input.value = text;
  input.focus();
};

// Надежная оптимистичная отправка сообщения от Кати
window.sendPlayerChatMessage = async function () {
  const input = document.getElementById("chatTextInput");
  const sendBtn = document.getElementById("btnSendPlayerChat");
  const text = input ? input.value.trim() : "";
  const img = window.chatAttachedBase64;
  const ticketId = window.activeChatTicketId;
  if (!text && !img) return;
  if (!ticketId) return;

  let list = readStorage("katya_master_feedback", []);
  const ticket = list.find(t => t.id === ticketId);
  if (!ticket) return;

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.classList.add("opacity-50", "pointer-events-none");
  }
  window.isChatSendingMessage = true;

  const now = Date.now();
  const optimisticMsg = {
    id: "msg_" + now + "_" + Math.random().toString(36).substring(2, 5),
    author: "katya",
    text: text,
    image: img || null,
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    timestamp: now,
    sending: true
  };

  if (!Array.isArray(ticket.messages)) ticket.messages = [];
  ticket.messages.push(optimisticMsg);
  localStorage.setItem("katya_master_feedback", JSON.stringify(list));

  if (input) input.value = "";
  clearChatAttachment();
  renderChatTimeline(ticket);

  // Мгновенный пуш в JSONBin под текущим профилем
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY }
    });
    if (res.ok) {
      const root = (await res.json()).record || {};
      if (!root[currentUser]) root[currentUser] = {};
      
      let cloudList = Array.isArray(root[currentUser].feedback) ? root[currentUser].feedback : list;
      let cloudTicket = cloudList.find(t => t.id === ticketId);
      
      if (cloudTicket) {
        if (!Array.isArray(cloudTicket.messages)) cloudTicket.messages = [];
        const msgMap = new Map();
        cloudTicket.messages.forEach(m => { if (m && m.id) msgMap.set(m.id, m); });
        optimisticMsg.sending = false;
        msgMap.set(optimisticMsg.id, optimisticMsg);
        cloudTicket.messages = Array.from(msgMap.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      } else {
        cloudList.unshift(ticket);
      }

      root[currentUser].feedback = cloudList;

      await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_API_KEY },
        body: JSON.stringify(root)
      });
    }
    optimisticMsg.sending = false;
    localStorage.setItem("katya_master_feedback", JSON.stringify(list));
    renderChatTimeline(ticket);
  } catch (e) {
    console.warn("Player chat sync error:", e);
    optimisticMsg.sending = false;
    renderChatTimeline(ticket);
  } finally {
    window.isChatSendingMessage = false;
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.classList.remove("opacity-50", "pointer-events-none");
    }
    input?.focus();
  }
};
// 5. Забрать награду за закрытый баг (без дюпа)
window.claimActiveChatReward = function () {
  const ticketId = window.activeChatTicketId;
  let list = readStorage("katya_master_feedback", []);
  let claimedIds = new Set(readStorage("katya_claimed_reward_ids", []));
  const ticket = list.find(t => t.id === ticketId);

  if (!ticket || claimedIds.has(ticketId) || ticket.claimed === true) return;

  ticket.claimed = true;
  claimedIds.add(ticketId);

  const reward = ticket.rewardAmount || 35;
  window.pet.coins = (window.pet.coins || 0) + reward;

  localStorage.setItem("katya_claimed_reward_ids", JSON.stringify(Array.from(claimedIds)));
  localStorage.setItem("katya_master_feedback", JSON.stringify(list));

  if (window.sound?.win) window.sound.win();
  if (typeof confetti === "function") confetti({ particleCount: 80, spread: 70 });

  updatePetUI();
  syncToCloud();
  openTicketChat(ticketId);
};

// 6. Создание нового тикета
window.setNewCat = function (cat) {
  window.newTicketCat = cat;
  ["Love", "Idea", "Bug"].forEach(k => {
    const b = document.getElementById(`tabNewCat${k}`);
    if (b) b.className = b.innerText.includes(cat.split(" ")[1]) || b.innerText.includes(cat)
      ? "py-1.5 rounded-xl bg-pink-500 text-white font-bold cursor-pointer"
      : "py-1.5 rounded-xl text-gray-400 font-bold cursor-pointer";
  });
};

window.setNewStars = function (stars) {
  window.newTicketRatingVal = stars;
  document.querySelectorAll("#newTicketStars .star-item").forEach((s, i) => {
    s.className = (i < stars) ? "star-item text-amber-400 p-0.5" : "star-item text-gray-600 p-0.5";
  });
};

window.submitSupportTicket = function () {
  const input = document.getElementById("newTicketDesc");
  const text = input ? input.value.trim() : "";
  if (!text) {
    alert("Напиши хотя бы пару слов перед отправкой! 🐾");
    return;
  }

  const techLogs = {
    userAgent: navigator.userAgent,
    screen: window.innerWidth + "x" + window.innerHeight,
    lastError: window.LAST_CAUGHT_ERROR || null,
    consoleHistory: Array.isArray(window.CLIENT_LOGS_BUFFER) ? [...window.CLIENT_LOGS_BUFFER] : []
  };

  const initialMsg = {
    id: "m_init_" + Date.now(),
    author: "katya",
    text: text,
    image: window.newTicketBase64 || null,
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  };

  const newTicket = {
    id: "t_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    category: window.newTicketCat,
    rating: window.newTicketRatingVal,
    text: text,
    status: "inbox",
    petName: window.pet?.name || "Зефирка",
    petLevel: window.pet?.level || 1,
    coins: window.pet?.coins || 0,
    techLogs: techLogs,
    messages: [initialMsg],
    rewardAmount: 35,
    rewardGranted: false,
    claimed: false,
    tgSent: false,
    date: new Date().toLocaleString("ru-RU")
  };

  let list = readStorage("katya_master_feedback", []);
  list.unshift(newTicket);
  localStorage.setItem("katya_master_feedback", JSON.stringify(list));

  if (input) input.value = "";
  clearNewTicketFile();

  if (window.sound?.win) window.sound.win();
  if (typeof confetti === "function") confetti({ particleCount: 50, spread: 60 });

  syncToCloud();
  openTicketChat(newTicket.id);
};

// Сжатие и прикрепление картинок
function compressToCanvas(file, cb) {
  const r = new FileReader();
  r.onload = e => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const max = 800;
      let w = img.width, h = img.height;
      if (w > max || h > max) {
        if (w > h) { h = Math.round((h * max) / w); w = max; }
        else { w = Math.round((w * max) / h); h = max; }
      }
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      cb(c.toDataURL("image/jpeg", 0.7));
    };
    img.src = e.target.result;
  };
  r.readAsDataURL(file);
}

window.onNewTicketFile = function (e) {
  const file = e.target.files?.[0];
  if (!file) return;
  compressToCanvas(file, b64 => {
    window.newTicketBase64 = b64;
    document.getElementById("newTicketFilePreviewImg").src = b64;
    document.getElementById("newTicketFilePreviewBox")?.classList.remove("hidden");
    document.getElementById("newTicketFilePrompt")?.classList.add("hidden");
  });
};

window.clearNewTicketFile = function (e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  window.newTicketBase64 = null;
  const inp = document.getElementById("newTicketFileInput");
  if (inp) inp.value = "";
  document.getElementById("newTicketFilePreviewBox")?.classList.add("hidden");
  document.getElementById("newTicketFilePrompt")?.classList.remove("hidden");
};

window.onChatFileSelected = function (e) {
  const file = e.target.files?.[0];
  if (!file) return;
  compressToCanvas(file, b64 => {
    window.chatAttachedBase64 = b64;
    document.getElementById("chatAttachmentPreviewImg").src = b64;
    document.getElementById("chatAttachmentPreviewBox")?.classList.remove("hidden");
  });
};

window.clearChatAttachment = function () {
  window.chatAttachedBase64 = null;
  const inp = document.getElementById("chatFileInput");
  if (inp) inp.value = "";
  document.getElementById("chatAttachmentPreviewBox")?.classList.add("hidden");
};

window.openFullImage = function (src) {
  if (!src) return;
  const modal = document.getElementById("modalChatLightbox");
  const img = document.getElementById("lightboxFullImage");
  if (modal && img) {
    img.src = src;
    modal.classList.remove("hidden");
  } else {
    window.open(src, "_blank");
  }
};

window.closeFullImage = function () {
  const modal = document.getElementById("modalChatLightbox");
  if (modal) modal.classList.add("hidden");
};

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    window.closeFullImage();
  }
});

function scrollChatToBottom(container, smooth = true) {
  if (!container) return;
  const doScroll = () => {
    container.scrollTop = container.scrollHeight;
    if (container.lastElementChild) {
      container.lastElementChild.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
    }
  };

  doScroll();
  requestAnimationFrame(doScroll);
  setTimeout(doScroll, 80);
  setTimeout(doScroll, 200);

  const imgs = container.querySelectorAll("img");
  imgs.forEach(img => {
    if (!img.complete) {
      img.addEventListener("load", doScroll, { once: true });
      img.addEventListener("error", doScroll, { once: true });
    }
  });
}
window.scrollChatToBottom = scrollChatToBottom;

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
window.escapeHtml = escapeHtml;

/* -------------------------------------------------------------------------
 * 11. ДЗЕН-КЛИКЕР (ASMR), DAILY БОНУС И СИСТЕМНЫЕ СЛУШАТЕЛИ
 * ------------------------------------------------------------------------- */
let zenClicks = 0;
document.getElementById("btnZenClicker")?.addEventListener("click", () => {
  document.getElementById("modalZen")?.classList.remove("hidden");
});

document.getElementById("zenTapArea")?.addEventListener("pointerdown", () => {
  zenClicks++;
  if (window.sound?.purr) window.sound.purr();
  triggerHaptic();
  window.pet.happy = Math.min(100, Math.round(window.pet.happy + 1));
  const clickCountEl = document.getElementById("zenTotalClicks");
  if (clickCountEl) clickCountEl.innerText = zenClicks;

  if (zenClicks % 80 === 0) {
    window.pet.coins += 10;
    if (window.sound?.win) window.sound.win();
    if (typeof confetti === "function") confetti({ particleCount: 25 });
    alert("🎁 Сундучок Дзена: +10 🪙!");
    updatePetUI();
  }
});

document.getElementById("btnDailyBonus")?.addEventListener("click", () => {
  const last = parseInt(localStorage.getItem("katya_master_last_bonus"), 10) || 0;
  if (Date.now() - last < 86400000) {
    alert("Ежедневный бонус уже получен! Заходи завтра 🎁");
    return;
  }
  localStorage.setItem("katya_master_last_bonus", Date.now());
  const bonusReward = window.ACTIVE_ECONOMY?.dailyBonus || 15;
  window.pet.coins += bonusReward;
  window.pet.happy = Math.min(100, window.pet.happy + 20);
  addXP(15);
  if (window.sound?.win) window.sound.win();
  if (typeof confetti === "function") confetti({ particleCount: 35 });
  alert(`🎁 Ежедневный бонус: +${bonusReward} 🪙!`);
  logAuditEvent(`Собрала ежедневный бонус (+${bonusReward} 🪙)`, "🎁");
  updatePetUI();
});

document.getElementById("navTabPet")?.addEventListener("click", () => {
  document.getElementById("tabPet")?.classList.remove("hidden");
  document.getElementById("tabRoulette")?.classList.add("hidden");
  document.getElementById("navTabPet").className = "flex flex-col items-center gap-0.5 text-pink-400 font-extrabold transition";
  document.getElementById("navTabRoulette").className = "flex flex-col items-center gap-0.5 text-gray-400 hover:text-pink-300 transition";
});

document.getElementById("navTabRoulette")?.addEventListener("click", () => {
  document.getElementById("tabRoulette")?.classList.remove("hidden");
  document.getElementById("tabRoulette")?.classList.add("flex");
  document.getElementById("tabPet")?.classList.add("hidden");
  document.getElementById("navTabRoulette").className = "flex flex-col items-center gap-0.5 text-pink-400 font-extrabold transition";
  document.getElementById("navTabPet").className = "flex flex-col items-center gap-0.5 text-gray-400 hover:text-pink-300 transition";
  drawWheel();
});

document.getElementById("soundToggleBtn")?.addEventListener("click", () => {
  window.sound.enabled = !window.sound.enabled;
  const btn = document.getElementById("soundToggleBtn");
  if (btn) {
    btn.innerText = window.sound.enabled ? "🔔" : "🔕";
    btn.classList.toggle("opacity-50", !window.sound.enabled);
  }
});

let secretClicks = 0;
document.getElementById("headerLevel")?.addEventListener("click", () => {
  secretClicks++;
  if (secretClicks >= 3) {
    window.location.href = "dashboard.html";
  }
  setTimeout(() => (secretClicks = 0), 1500);
});

document.querySelectorAll(".closeModalBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(`
      #modalCasinoHub, #modalScratchCard, #modalFishing, #modalMemory, 
      #modalCsgoCase, #modalHalloweenCase, #modalWardrobe, #modalInventory, 
      #modalFeed, #modalWork, #modalTetris, #modalRunner, #modalMiniGame, 
      #modalRhythmGame, #modalZen, #modalSecretWish, #modalWheelSettings
    `).forEach((m) => m.classList.add("hidden"));
  });
});

document.getElementById("btnCloseWishModal")?.addEventListener("click", () => {
  document.getElementById("modalSecretWish")?.classList.add("hidden");
});

// Периодическое уменьшение характеристик (каждые 30 секунд)
setInterval(() => {
  if (window.pet.isSleeping) {
    window.pet.energy = Math.min(100, (window.pet.energy || 0) + 3);
    
    if (window.pet.energy >= 100) {
      window.pet.isSleeping = false;
      window.pet.lastWokeUpAt = Date.now();
      addXP(6);
      logAuditEvent("Котик полностью выспался и проснулся сам! ☀️", "⭐");
    }
  } else {
    window.pet.hunger = Math.max(5, (window.pet.hunger || 0) - 1);
    window.pet.happy = Math.max(5, (window.pet.happy || 0) - 1);
    window.pet.energy = Math.max(5, (window.pet.energy || 0) - 1);
    window.pet.clean = Math.max(5, (window.pet.clean || 0) - 1);
    if (window.pet.hunger > 35 && Math.random() < 0.12) {
      spawnPoop(true);
    }
  }
  updatePetUI();
}, 30000);

// Проверка новых сообщений и генерация браузерного Push-уведомления
function checkPlayerInboxNotifications(feedbackList) {
  const lastSeenMsgId = localStorage.getItem("katya_last_seen_msg_id") || "";
  let latestMsg = null;

  feedbackList.forEach(ticket => {
    if (Array.isArray(ticket.messages)) {
      ticket.messages.forEach(msg => {
        if (msg.author === "alex") {
          latestMsg = msg;
        }
      });
    }
  });

  if (latestMsg && latestMsg.id !== lastSeenMsgId) {
    localStorage.setItem("katya_last_seen_msg_id", latestMsg.id);
    if (window.sound?.pop) window.sound.pop();

    // Автоматический браузерный пуш (без запроса разрешений)
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Служба заботы 💌", {
        body: `Алексей ответил в тикете: "${latestMsg.text.substring(0, 50)}..."`,
        icon: "https://cdn-icons-png.flaticon.com/512/616/616408.png"
      });
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Служба заботы 💌", {
            body: `Алексей ответил в тикете: "${latestMsg.text.substring(0, 50)}..."`,
            icon: "https://cdn-icons-png.flaticon.com/512/616/616408.png"
          });
        }
      });
    }
  }
}

/* =========================================================================
 * МЕССЕНДЖЕР СЛУЖБЫ ЗАБОТЫ У ИГРОКА (КАТЯ): ПОЛУЧЕНИЕ НАГРАД И АВТО-СКРЫТИЕ
 * ========================================================================= */

// Функция проверки и обновления бейджа на кнопке мессенджера в игре
function updatePlayerSupportBadge() {
  const list = readStorage("katya_master_feedback", []);
  const claimedIds = new Set(readStorage("katya_claimed_reward_ids", []));
  let uncollectedCount = 0;

  list.forEach(ticket => {
    if (ticket.status === "done" && ticket.rewardAmount > 0 && !ticket.claimed && !claimedIds.has(ticket.id)) {
      uncollectedCount++;
    }
  });

  const badge = document.getElementById("badgeSupportUnread");
  if (badge) {
    badge.innerText = uncollectedCount;
    badge.classList.toggle("hidden", uncollectedCount === 0);
  }
}

// Переопределяем функцию рендеринга списка тикетов у Кати (с авто-скрытием забраных)
window.renderTicketListView = function () {
  const container = document.getElementById("msgTicketsContainer");
  const empty = document.getElementById("msgTicketsEmpty");
  if (!container) return;

  const list = readStorage("katya_master_feedback", []);
  const claimedIds = new Set(readStorage("katya_claimed_reward_ids", []));

  container.innerHTML = "";
  let visibleCount = 0;

  list.forEach(ticket => {
    const isDone = ticket.status === "done";
    const isClaimed = claimedIds.has(ticket.id) || ticket.claimed === true;
    
    // АВТО-СКРЫТИЕ: если тикет выполнен и награда уже забрана игроком, скрываем чат
    if (isDone && isClaimed) return;
    visibleCount++;

    const hasReward = isDone && ticket.rewardAmount > 0 && !ticket.claimed && !claimedIds.has(ticket.id);
    const msgs = Array.isArray(ticket.messages) ? ticket.messages : [];
    const lastMsgText = msgs.length > 0 ? msgs[msgs.length - 1].text : (ticket.text || "");

    let badgeClass = "bg-slate-700 text-gray-300";
    let badgeText = "Отправлено";
    if (ticket.status === "in_progress") { badgeClass = "bg-amber-500/20 text-amber-300 border border-amber-500/30"; badgeText = "В работе ⚙️"; }
    else if (ticket.status === "testing") { badgeClass = "bg-purple-500/20 text-purple-300 border border-purple-500/30"; badgeText = "Проверка 🧪"; }
    else if (isDone) { badgeClass = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"; badgeText = "Завершено ✓"; }

    const card = document.createElement("div");
    card.className = "bg-[#131528] hover:bg-[#181b33] border border-white/5 hover:border-pink-500/40 rounded-2xl p-3 flex flex-col gap-1.5 transition active:scale-[0.99] cursor-pointer shadow-md";
    card.onclick = () => openTicketChat(ticket.id);

    card.innerHTML = `
      <div class="flex justify-between items-center text-[10px]">
        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded-full font-mono font-bold ${badgeClass}">${badgeText}</span>
          <span class="text-pink-300 font-bold">${ticket.category || "Обращение"}</span>
        </div>
        <span class="text-gray-500 font-mono">${ticket.date ? ticket.date.split(",")[0] : ""}</span>
      </div>
      <p class="text-xs text-gray-200 line-clamp-2 leading-relaxed">${escapeHtml(lastMsgText)}</p>
      <div class="flex justify-between items-center text-[10px] text-gray-400 pt-1 border-t border-white/5 font-mono">
        <span>#${ticket.id.slice(-6)} • ${msgs.length} сообщ.</span>
        ${hasReward ? '<span class="text-amber-300 font-black animate-pulse">🎁 Забрать +' + (ticket.rewardAmount || 35) + ' 🪙</span>' : ''}
      </div>
    `;
    container.appendChild(card);
  });

  if (visibleCount === 0) {
    empty?.classList.remove("hidden");
  } else {
    empty?.classList.add("hidden");
  }

  updatePlayerSupportBadge();
};

// Функция Кати для сбора награды за закрытый тикет
window.claimActiveChatReward = function () {
  const ticketId = window.activeChatTicketId;
  let list = readStorage("katya_master_feedback", []);
  let claimedIds = new Set(readStorage("katya_claimed_reward_ids", []));
  const ticket = list.find(t => t.id === ticketId);

  if (!ticket || claimedIds.has(ticketId) || ticket.claimed === true) return;

  ticket.claimed = true;
  claimedIds.add(ticketId);

  const reward = ticket.rewardAmount || 35;
  window.pet.coins = (window.pet.coins || 0) + reward;

  localStorage.setItem("katya_claimed_reward_ids", JSON.stringify(Array.from(claimedIds)));
  localStorage.setItem("katya_master_feedback", JSON.stringify(list));

  if (window.sound?.win) window.sound.win();
  if (typeof confetti === "function") confetti({ particleCount: 80, spread: 70 });

  updatePetUI();
  syncToCloud();
  
  // После сбора награды закрываем чат и возвращаемся к списку (чатисчезнет)
  supportShowScreen("list");
  updatePlayerSupportBadge();
};

// Вызываем обновление бейджа при старте игры в app.js
document.addEventListener("DOMContentLoaded", () => {
  updatePlayerSupportBadge();
});

// Автоматическое подтягивание новых сообщений от разработчика каждые 5 секунд с защитой от наложения и дерганья
setInterval(async () => {
  if (document.hidden || document.visibilityState !== "visible") return;
  if (!window.activeChatTicketId) return;
  if (window.isChatSendingMessage) return;
  if (isPlayerChatPolling) return;
  isPlayerChatPolling = true;

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY }
    });
    if (!res.ok) return;
    const root = (await res.json()).record || {};
    const remoteUser = root[currentUser] || root["katya"];
    
    if (remoteUser) {
      if (remoteUser.pet && typeof window.updatePetUI === "function") {
        window.pet = Object.assign(window.pet || {}, remoteUser.pet);
        localStorage.setItem("katya_master_pet_state", JSON.stringify(window.pet));
        updatePetUI();
      }
      if (Array.isArray(remoteUser.wishes)) {
        localStorage.setItem("katya_master_wishes_vault", JSON.stringify(remoteUser.wishes));
      }
      if (Array.isArray(remoteUser.feedback)) {
        localStorage.setItem("katya_master_feedback", JSON.stringify(remoteUser.feedback));
        const ticket = remoteUser.feedback.find(t => t.id === window.activeChatTicketId);
        if (ticket) {
          const msgs = ticket.messages || [];
          const lastMsgId = msgs.length > 0 ? (msgs[msgs.length - 1].id || msgs[msgs.length - 1].timestamp || "") : "";
          const currentHash = `${ticket.id}_${ticket.status}_${msgs.length}_${lastMsgId}_${ticket.claimed}`;
          if (currentHash !== lastPlayerChatHash) {
            lastPlayerChatHash = currentHash;
            renderChatTimeline(ticket);
          }
        }
      }
    }
  } catch (e) {
  } finally {
    isPlayerChatPolling = false;
  }
}, 5000);


/* -------------------------------------------------------------------------
 * 12. ПЕРВИЧНЫЙ ЗАПУСК
 * ------------------------------------------------------------------------- */
applyOfflineDecay();
updatePetUI();
drawWheel();
syncToCloud();