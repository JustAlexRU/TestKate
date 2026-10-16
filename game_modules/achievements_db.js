/* =========================================================================
 * LEX LABS ENTERPRISE: ACHIEVEMENTS & GAMERSCORE ENGINE
 * Файл: game_modules/achievements_db.js
 * ========================================================================= */

// 1. ПОЛНЫЙ РЕЕСТР ДОСТИЖЕНИЙ (45+ АЧИВОК ПО ВСЕМ МЕХАНИКАМ ИГРЫ)
window.ACHIEVEMENTS_CATALOG = [
  // =========================================================================
  // ВЕТКА 1: ДОМАШНИЙ УЮТ И ЗАБОТА (PET)
  // =========================================================================
  {
    id: "pet_first_feed",
    title: "Первая миска",
    desc: "Впервые покормить Зефирку любимой вкусняшкой",
    category: "pet",
    tier: "bronze",
    icon: "🥣",
    score: 10,
    maxProgress: 1,
    reward: { coins: 15 },
    hint: "Загляни в Кафе вкусняшек и угости котика"
  },
  {
    id: "pet_gourmet_50",
    title: "Гурман высшей пробы",
    desc: "Покормить питомца 50 раз аппетитными блюдами",
    category: "pet",
    tier: "silver",
    icon: "👑",
    score: 25,
    maxProgress: 50,
    reward: { coins: 80, sparks: 1 },
    hint: "Сытый котик — счастливый котик"
  },
  {
    id: "pet_bath_clean",
    title: "Банный день",
    desc: "Помыть котика до 100% чистоты с пенными пузырями",
    category: "pet",
    tier: "bronze",
    icon: "🧼",
    score: 10,
    maxProgress: 1,
    reward: { coins: 20 },
    hint: "Нажми кнопку «Помыть» когда котик испачкается"
  },
  {
    id: "pet_poop_10",
    title: "Золотая лопатка",
    desc: "Убрать 10 кучек какашек на полу комнаты",
    category: "pet",
    tier: "silver",
    icon: "💩",
    score: 25,
    maxProgress: 10,
    reward: { coins: 40, sparks: 1 },
    hint: "Уборка приносит монетки и чистоту!"
  },
  {
    id: "pet_zen_500",
    title: "Кошачий Дзэн",
    desc: "Намурчать 500 поглаживаний в дзэн-режиме (ASMR Clicker)",
    category: "pet",
    tier: "silver",
    icon: "🪶",
    score: 25,
    maxProgress: 500,
    reward: { coins: 50 },
    hint: "Зайди в Дзэн-сад и дари ласку"
  },
  {
    id: "pet_sleep_full",
    title: "Сладких снов",
    desc: "Уложить Зефирку спать и восстановить 100% энергии",
    category: "pet",
    tier: "bronze",
    icon: "🌙",
    score: 10,
    maxProgress: 1,
    reward: { coins: 25 },
    hint: "Дай котику отдохнуть, когда кончится энергия"
  },
  {
    id: "pet_streak_7",
    title: "Верная подруга",
    desc: "Забрать ежедневный Daily Bonus 7 раз",
    category: "pet",
    tier: "gold",
    icon: "📅",
    score: 50,
    maxProgress: 7,
    reward: { coins: 120, sparks: 3 },
    hint: "Заходи каждый день за бонусом"
  },
  {
    id: "pet_level_10",
    title: "Большой котик",
    desc: "Достичь 10-го уровня развития питомца (XP System)",
    category: "pet",
    tier: "gold",
    icon: "📈",
    score: 50,
    maxProgress: 10,
    reward: { coins: 150, sparks: 2, title: "Заботливая Мама" },
    hint: "Зарабатывай опыт в играх и заботе"
  },
  {
    id: "pet_perfect_stats",
    title: "Абсолютная гармония",
    desc: "Одновременно довести все 4 шкалы котика до 100%",
    category: "pet",
    tier: "gold",
    icon: "🌟",
    score: 50,
    maxProgress: 1,
    reward: { coins: 100, sparks: 2 },
    hint: "Сытость, Энергия, Счастье и Чистота на максимум!"
  },

  // =========================================================================
  // ВЕТКА 2: ИКОНА СТИЛЯ И АТЕЛЬЕ (WARDROBE)
  // =========================================================================
  {
    id: "wardrobe_first_outfit",
    title: "Первый бантик",
    desc: "Надеть свой первый аксессуар или наряд в гардеробе",
    category: "wardrobe",
    tier: "bronze",
    icon: "🎀",
    score: 10,
    maxProgress: 1,
    reward: { coins: 15 },
    hint: "Загляни в гардероб и примерь вещь"
  },
  {
    id: "wardrobe_colors_5",
    title: "Хамелеон",
    desc: "Примерить 5 различных окрасов шерстки",
    category: "wardrobe",
    tier: "bronze",
    icon: "🎨",
    score: 10,
    maxProgress: 5,
    reward: { coins: 30 },
    hint: "Выбирай разные стили шерстки в гардеробе"
  },
  {
    id: "wardrobe_rooms_3",
    title: "Смена обстановки",
    desc: "Разблокировать и обустроить 3 разных интерьера комнат",
    category: "wardrobe",
    tier: "silver",
    icon: "🏰",
    score: 25,
    maxProgress: 3,
    reward: { coins: 60 },
    hint: "Открывай новые комнаты для Зефирки"
  },
  {
    id: "wardrobe_royal_fit",
    title: "Королевский выход",
    desc: "Надеть эпический, легендарный или мифический предмет",
    category: "wardrobe",
    tier: "gold",
    icon: "👑",
    score: 50,
    maxProgress: 1,
    reward: { coins: 100, sparks: 2 },
    hint: "Золотая корона или кибер-венец преобразят образ"
  },
  {
    id: "sparks_first_10",
    title: "Звёздная кузница",
    desc: "Накопить первые 10 Звёздных Искр ✨ за повторные вещи",
    category: "wardrobe",
    tier: "silver",
    icon: "✨",
    score: 25,
    maxProgress: 10,
    reward: { coins: 50 },
    hint: "Повторки в кейсах превращаются в искры"
  },
  {
    id: "atelier_first_craft",
    title: "Клиентка Haute Couture",
    desc: "Совершить свой первый обмен в «✨ Ателье»",
    category: "wardrobe",
    tier: "silver",
    icon: "🧵",
    score: 25,
    maxProgress: 1,
    reward: { coins: 40 },
    hint: "Обменяй искры на рецепт в гардеробе"
  },
  {
    id: "atelier_pity_exchange",
    title: "Никакого рандома!",
    desc: "Использовать гарантированный обмен на наряд без дубликатов",
    category: "wardrobe",
    tier: "gold",
    icon: "🎯",
    score: 50,
    maxProgress: 1,
    reward: { coins: 75, sparks: 2 },
    hint: "Pity-рецепт в Ателье за 10 искр"
  },
  {
    id: "wardrobe_compliments_5",
    title: "Любимица Лёши",
    desc: "Собрать 5 персональных романтических комплиментов при повторках",
    category: "wardrobe",
    tier: "gold",
    icon: "💖",
    score: 50,
    maxProgress: 5,
    reward: { coins: 100, sparks: 2, title: "Муза Создателя" },
    hint: "Лёша любуется каждым твоим нарядом"
  },
  {
    id: "wardrobe_hw_bundle",
    title: "Королева Самайна",
    desc: "Собрать любой полный хеллоуинский сет вещей",
    category: "wardrobe",
    tier: "mythic",
    icon: "🎃",
    score: 100,
    maxProgress: 1,
    reward: { coins: 250, sparks: 5 },
    hint: "Сет Ведьмы, Вампира, Призрака или Демона"
  },

  // =========================================================================
  // ВЕТКА 3: ОХОТНИЦА ЗА СОКРОВИЩАМИ (CASES)
  // =========================================================================
  {
    id: "cases_open_first",
    title: "Анбоксинг",
    desc: "Открыть свой первый лутбокс",
    category: "cases",
    tier: "bronze",
    icon: "📦",
    score: 10,
    maxProgress: 1,
    reward: { coins: 20 },
    hint: "Испытай удачу в Стандартном кейсе"
  },
  {
    id: "cases_premium_gift",
    title: "Таганрогский курьер",
    desc: "Выбить из Премиум-кейса доставку кофе, киновечер или трек",
    category: "cases",
    tier: "silver",
    icon: "☕",
    score: 25,
    maxProgress: 1,
    reward: { coins: 60 },
    hint: "Кейс Таганрога полон теплых сюрпризов"
  },
  {
    id: "cases_black_box",
    title: "Совершенно секретно",
    desc: "Вскрыть засекреченный Classified Black Box",
    category: "cases",
    tier: "gold",
    icon: "🕶️",
    score: 50,
    maxProgress: 1,
    reward: { coins: 120, sparks: 2 },
    hint: "Черный ящик за 320 монет"
  },
  {
    id: "cases_immunity",
    title: "Железный аргумент",
    desc: "Получить предмет «Иммунитет в споре (Правота)» в Black Box",
    category: "cases",
    tier: "gold",
    icon: "🛡️",
    score: 50,
    maxProgress: 1,
    reward: { coins: 100, title: "Всегда Права" },
    hint: "Безоговорочная победа в любом споре"
  },
  {
    id: "cases_halloween_5",
    title: "Покорительница склепа",
    desc: "Открыть Хеллоуинский кейс 5 раз за сезон",
    category: "cases",
    tier: "silver",
    icon: "🪦",
    score: 25,
    maxProgress: 5,
    reward: { coins: 70, sparks: 2 },
    hint: "Склеп Джека скрывает тайны"
  },
  {
    id: "cases_super_box",
    title: "Дроп мечты",
    desc: "Выбить суперприз: Секретный бокс в Таганрог / посылку в ПВЗ",
    category: "cases",
    tier: "mythic",
    icon: "⭐",
    score: 100,
    maxProgress: 1,
    reward: { coins: 300, sparks: 5, title: "Счастливица" },
    hint: "Золотой суперприз Black Box с шансом 5%"
  },

  // =========================================================================
  // ВЕТКА 4: КАЗИНО «У ЗЕФИРКИ» (CASINO)
  // =========================================================================
  {
    id: "casino_slots_win",
    title: "Три лапки в ряд",
    desc: "Поймать выигрышную комбинацию в слотах «777 Лапки»",
    category: "casino",
    tier: "bronze",
    icon: "🎰",
    score: 10,
    maxProgress: 1,
    reward: { coins: 25 },
    hint: "Крути барабаны слотов в Казино"
  },
  {
    id: "casino_slots_jackpot",
    title: "Суши-Джекпот",
    desc: "Выбить комбинацию из 3 котиков 🐱🐱🐱 или 3 корон 👑👑👑",
    category: "casino",
    tier: "gold",
    icon: "🍣",
    score: 50,
    maxProgress: 1,
    reward: { coins: 150 },
    hint: "Главный джекпот слотов"
  },
  {
    id: "casino_crash_x5",
    title: "На волоске",
    desc: "Забрать куш в Мур-Краше на коэффициенте x5.00 или выше",
    category: "casino",
    tier: "silver",
    icon: "🚀",
    score: 25,
    maxProgress: 1,
    reward: { coins: 60 },
    hint: "Вовремя нажми Cashout во время полета"
  },
  {
    id: "casino_crash_x10",
    title: "Алмазные нервы",
    desc: "Успешно забрать выигрыш в Мур-Краше на множителе x10.00+",
    category: "casino",
    tier: "gold",
    icon: "🌌",
    score: 50,
    maxProgress: 1,
    reward: { coins: 200, sparks: 3, title: "Ракетный Снайпер" },
    hint: "Полет сквозь стратосферу к звездам"
  },
  {
    id: "casino_dice_win",
    title: "Везучий бросок",
    desc: "Угадать точный исход броска в Кошачьих Костях",
    category: "casino",
    tier: "silver",
    icon: "🎲",
    score: 25,
    maxProgress: 1,
    reward: { coins: 50 },
    hint: "Бросай кости на удачу"
  },
  {
    id: "casino_scratch_5",
    title: "Монетка на удачу",
    desc: "Стереть защитный слой на 5 скретч-картах",
    category: "casino",
    tier: "bronze",
    icon: "🪙",
    score: 10,
    maxProgress: 5,
    reward: { coins: 30 },
    hint: "Стирай билетики в разделе Скретч"
  },
  {
    id: "casino_roulette_spin",
    title: "Кулинарный выбор",
    desc: "Прокрутить Рулетку вкусностей (600×600) в кафе",
    category: "casino",
    tier: "bronze",
    icon: "🍕",
    score: 10,
    maxProgress: 1,
    reward: { coins: 20 },
    hint: "Испытай колесо фортуны еды"
  },

  // =========================================================================
  // ВЕТКА 5: АРКАДНАЯ ЛЕГЕНДА (ARCADE)
  // =========================================================================
  {
    id: "arcade_fish_first",
    title: "Удачный заброс",
    desc: "Поймать свою первую рыбку в «Кошачьей Рыбалке»",
    category: "arcade",
    tier: "bronze",
    icon: "🎣",
    score: 10,
    maxProgress: 1,
    reward: { coins: 15 },
    hint: "Подсекай, как только поплавок дернется"
  },
  {
    id: "arcade_fish_gold",
    title: "Владычица морей",
    desc: "Поймать легендарную Золотую рыбку 👑 в пруду",
    category: "arcade",
    tier: "gold",
    icon: "👑",
    score: 50,
    maxProgress: 1,
    reward: { coins: 100, sparks: 2 },
    hint: "Редкий улов с шансом 8%"
  },
  {
    id: "arcade_memory_win",
    title: "Абсолютная память",
    desc: "Успешно завершить парную игру Мемори",
    category: "arcade",
    tier: "silver",
    icon: "🧠",
    score: 25,
    maxProgress: 1,
    reward: { coins: 60 },
    hint: "Найди все совпадающие пары карточек"
  },
  {
    id: "arcade_tetris_clear",
    title: "Мастер Тетриса",
    desc: "Набрать 300 или более очков в Кото-Тетрисе",
    category: "arcade",
    tier: "silver",
    icon: "🧱",
    score: 25,
    maxProgress: 300,
    reward: { coins: 70 },
    hint: "Укладывай фигуры и очищай линии"
  },
  {
    id: "arcade_runner_dist",
    title: "Кошачий паркур",
    desc: "Пробежать 300 метров в Subway Cat Runner",
    category: "arcade",
    tier: "silver",
    icon: "🏃",
    score: 25,
    maxProgress: 300,
    reward: { coins: 80 },
    hint: "Уворачивайся от преград и прыгай"
  },
  {
    id: "arcade_courier_orders",
    title: "Молниеносный курьер",
    desc: "Успешно завершить заказ в мини-игре доставки еды",
    category: "arcade",
    tier: "silver",
    icon: "🍱",
    score: 25,
    maxProgress: 1,
    reward: { coins: 50 },
    hint: "Быстро собирай заказы для клиентов"
  },
  {
    id: "arcade_rhythm_combo",
    title: "Ритм-машина",
    desc: "Набрать серию комбо из 15 нот в Osu! Cat Streamer",
    category: "arcade",
    tier: "gold",
    icon: "🎵",
    score: 50,
    maxProgress: 15,
    reward: { coins: 120, sparks: 2 },
    hint: "Попадай точно в такт Web Audio битов"
  },
  {
    id: "arcade_master_all",
    title: "Мастер всех игр",
    desc: "Сыграть во все 6 аркадных мини-игр хотя бы по разу",
    category: "arcade",
    tier: "gold",
    icon: "🏆",
    score: 50,
    maxProgress: 6,
    reward: { coins: 150, sparks: 3, title: "Геймерша Года" },
    hint: "Рыбалка, Мемори, Тетрис, Раннер, Курьер, Osu"
  },

  // =========================================================================
  // ВЕТКА 6: СЛУЖБА ЗАБОТЫ И РОМАНТИКА (LOVE)
  // =========================================================================
  {
    id: "love_first_wish",
    title: "Первое желание",
    desc: "Получить и сохранить в сейф купон желания #WISH-...",
    category: "love",
    tier: "silver",
    icon: "💌",
    score: 25,
    maxProgress: 1,
    reward: { coins: 50, sparks: 1 },
    hint: "Купоны выпадают в кейсах и аркадах"
  },
  {
    id: "love_vault_3",
    title: "Шкатулка сокровищ",
    desc: "Собрать в Wishes Vault коллекцию из 3 активных купонов",
    category: "love",
    tier: "gold",
    icon: "🗝️",
    score: 50,
    maxProgress: 3,
    reward: { coins: 100, sparks: 2 },
    hint: "Копи купоны на романтические свидания"
  },
  {
    id: "love_support_chat",
    title: "На связи с разработчиком",
    desc: "Отправить свое первое сообщение в Службу Заботы",
    category: "love",
    tier: "bronze",
    icon: "💬",
    score: 10,
    maxProgress: 1,
    reward: { coins: 25 },
    hint: "Нажми на иконку письма 💌 в верхнем меню"
  },
  {
    id: "love_csat_5star",
    title: "Высшая оценка",
    desc: "Поставить 5★ CSAT оператору после закрытия тикета",
    category: "love",
    tier: "bronze",
    icon: "⭐",
    score: 10,
    maxProgress: 1,
    reward: { coins: 30 },
    hint: "Поблагодари Лёшу за заботу о котике"
  },
  {
    id: "love_real_gift",
    title: "Особая посылка",
    desc: "Получить романтическую доставку или подарок в Таганрог",
    category: "love",
    tier: "mythic",
    icon: "🎁",
    score: 100,
    maxProgress: 1,
    reward: { coins: 200, sparks: 5, title: "Любимая Катя" },
    hint: "Кофе, торт или подарок от Лёши"
  },

  // =========================================================================
  // ВЕТКА 7: СЕКРЕТНЫЕ И ПАСХАЛКИ (SECRET)
  // =========================================================================
  {
    id: "secret_midnight_snack",
    title: "Ночной дожор",
    desc: "Покормить Зефирку глубокой ночью (с 00:00 до 04:00)",
    category: "secret",
    tier: "silver",
    icon: "🌙",
    score: 25,
    maxProgress: 1,
    reward: { coins: 40 },
    secret: true,
    hint: "Когда весь город спит, холодильник зовёт..."
  },
  {
    id: "secret_spam_clicks",
    title: "Затисканный котик",
    desc: "Сделать 25 быстрых кликов по котику менее чем за 4 секунды",
    category: "secret",
    tier: "silver",
    icon: "⚡",
    score: 25,
    maxProgress: 25,
    reward: { coins: 50 },
    secret: true,
    hint: "Ласки много не бывает!"
  },
  {
    id: "secret_insomnia",
    title: "Бессонница",
    desc: "Попытаться уложить котика спать, когда энергия полная (100%)",
    category: "secret",
    tier: "bronze",
    icon: "💤",
    score: 10,
    maxProgress: 1,
    reward: { coins: 20 },
    secret: true,
    hint: "Кто же спит в самый разгар бодрости?"
  },
  {
    id: "secret_queen_name",
    title: "Царские почести",
    desc: "Надеть Золотую корону и назвать котика «Царица Катя»",
    category: "secret",
    tier: "gold",
    icon: "👑",
    score: 50,
    maxProgress: 1,
    reward: { coins: 100, sparks: 2 },
    secret: true,
    hint: "Королевское имя и царский убор"
  },
  {
    id: "secret_wardrobe_afk",
    title: "Слишком красива",
    desc: "Любоваться нарядами в гардеробе больше 2 минут",
    category: "secret",
    tier: "bronze",
    icon: "🪞",
    score: 10,
    maxProgress: 1,
    reward: { coins: 30 },
    secret: true,
    hint: "Выбор идеального образа требует времени"
  },
  {
    id: "secret_pin_try",
    title: "Хакерша",
    desc: "Нажать трижды на уровень питомца для вызова дашборда",
    category: "secret",
    tier: "gold",
    icon: "🔒",
    score: 50,
    maxProgress: 1,
    reward: { coins: 100, sparks: 3 },
    secret: true,
    hint: "Секретный проход в Mission Control"
  }
];

// Цветовые и визуальные параметры рангов
window.ACHIEVEMENT_TIERS = {
  bronze: {
    name: "Бронза",
    score: 10,
    color: "#cd7f32",
    badgeBg: "bg-amber-950/70 text-amber-400 border-amber-600/40",
    borderGlow: "border-amber-600/50 shadow-[0_0_12px_rgba(205,127,50,0.25)]"
  },
  silver: {
    name: "Серебро",
    score: 25,
    color: "#cbd5e1",
    badgeBg: "bg-slate-800 text-slate-200 border-slate-500/50",
    borderGlow: "border-slate-400/60 shadow-[0_0_14px_rgba(203,213,225,0.3)]"
  },
  gold: {
    name: "Золото",
    score: 50,
    color: "#fbbf24",
    badgeBg: "bg-amber-900/80 text-amber-300 border-amber-400/60",
    borderGlow: "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.45)]"
  },
  mythic: {
    name: "Мифическое",
    score: 100,
    color: "#f43f5e",
    badgeBg: "bg-rose-950/90 text-rose-300 border-rose-500/70",
    borderGlow: "border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse"
  }
};

// 2. ХРАНИЛИЩЕ СОСТОЯНИЯ ДОСТИЖЕНИЙ
function getAchievementsStorageKey() {
  const user = window.currentUser || localStorage.getItem("active_player_profile") || "katya";
  return `${user}_master_achievements`;
}

window.loadAchievementsState = function () {
  try {
    const key = getAchievementsStorageKey();
    const stored = localStorage.getItem(key);
    if (!stored) return {};
    return JSON.parse(stored) || {};
  } catch (e) {
    console.error("[Achievements] Failed to load state:", e);
    return {};
  }
};

window.saveAchievementsState = function (state) {
  try {
    const key = getAchievementsStorageKey();
    localStorage.setItem(key, JSON.stringify(state));
    if (typeof window.syncPetCloudData === "function") {
      window.syncPetCloudData();
    }
  } catch (e) {
    console.error("[Achievements] Failed to save state:", e);
  }
};

window.achievementsState = window.loadAchievementsState();

// 3. СИСТЕМА ТРЕКИНГА И АВТО-ОТКРЫТИЯ
/**
 * Трекинг прогресса достижения
 * @param {string} achId - Идентификатор ачивки
 * @param {number} value - Значение инкремента или абсолютное значение
 * @param {object} options - { isAbsolute: boolean }
 */
window.trackAchievement = function (achId, value = 1, options = {}) {
  try {
    const ach = window.ACHIEVEMENTS_CATALOG.find(a => a.id === achId);
    if (!ach) return;

    if (!window.achievementsState) {
      window.achievementsState = window.loadAchievementsState();
    }

    const currentData = window.achievementsState[achId] || { currentProgress: 0, isUnlocked: false };
    if (currentData.isUnlocked) return; // Уже разблокировано

    let newProgress = 0;
    if (options.isAbsolute) {
      newProgress = Math.max(currentData.currentProgress || 0, Number(value) || 0);
    } else {
      newProgress = (currentData.currentProgress || 0) + (Number(value) || 1);
    }

    const isNowUnlocked = newProgress >= ach.maxProgress;

    window.achievementsState[achId] = {
      currentProgress: Math.min(newProgress, ach.maxProgress),
      isUnlocked: isNowUnlocked,
      unlockedAt: isNowUnlocked ? new Date().toLocaleDateString("ru-RU") : null
    };

    window.saveAchievementsState(window.achievementsState);

    if (isNowUnlocked) {
      window.unlockAchievementReward(ach);
    } else {
      window.updateAchievementsBadge();
    }
  } catch (e) {
    console.error("[Achievements] trackAchievement error:", e);
  }
};

/**
 * Начисление наград и показ уведомлений при получении ачивки
 */
window.unlockAchievementReward = function (ach) {
  try {
    // Начисление монет
    if (ach.reward?.coins && window.pet) {
      window.pet.coins = (Number(window.pet.coins) || 0) + ach.reward.coins;
    }

    // Начисление искр
    if (ach.reward?.sparks && window.pet) {
      window.pet.starSparks = (Number(window.pet.starSparks) || 0) + ach.reward.sparks;
    }

    // Присвоение титула
    if (ach.reward?.title) {
      localStorage.setItem("katya_active_title", ach.reward.title);
      window.playerActiveTitle = ach.reward.title;
    }

    // Сохранение питомца
    if (window.pet) {
      localStorage.setItem("katya_master_pet_state", JSON.stringify(window.pet));
      if (typeof window.updatePetUI === "function") window.updatePetUI();
    }

    // Аудит
    if (typeof window.logAuditEvent === "function") {
      window.logAuditEvent(`🏆 Разблокировано достижение «${ach.title}» (+${ach.reward.coins || 0} 🪙)!`, "🏆");
    }

    // Звук
    if (ach.tier === "mythic" || ach.tier === "gold") {
      if (window.sound?.epicWin) window.sound.epicWin();
    } else {
      if (window.sound?.win) window.sound.win();
    }

    // Виброотклик
    if (typeof window.triggerHaptic === "function") window.triggerHaptic();

    // Конфетти
    if (typeof confetti === "function") {
      confetti({
        particleCount: ach.tier === "mythic" ? 180 : 100,
        spread: 80,
        origin: { y: 0.15 }
      });
    }

    // Toast-уведомление
    window.showAchievementToast(ach);
    window.updateAchievementsBadge();

  } catch (e) {
    console.error("[Achievements] unlockAchievementReward error:", e);
  }
};

// 4. ТАКТИЛЬНОЕ TOAST УВЕДОМЛЕНИЕ (LINEAR / VERCEL STYLE)
window.showAchievementToast = function (ach) {
  try {
    let toast = document.getElementById("achievementFloatingToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "achievementFloatingToast";
      toast.className = "fixed top-3 left-1/2 -translate-x-1/2 z-[120] w-[92%] max-w-sm transition-all duration-500 ease-out pointer-events-auto transform -translate-y-24 opacity-0";
      document.body.appendChild(toast);
    }

    const tierInfo = window.ACHIEVEMENT_TIERS[ach.tier] || window.ACHIEVEMENT_TIERS.bronze;
    const coinsReward = ach.reward?.coins ? `+${ach.reward.coins} 🪙` : "";
    const sparksReward = ach.reward?.sparks ? `+${ach.reward.sparks} ✨` : "";
    const rewardText = [coinsReward, sparksReward].filter(Boolean).join(" ");

    toast.innerHTML = `
      <div onclick="window.openAchievementsModal()" class="cursor-pointer bg-gradient-to-r from-[#141528] via-[#1a1c36] to-[#0f1022] border-2 ${tierInfo.borderGlow} rounded-2xl p-3 flex items-center justify-between shadow-2xl backdrop-blur-md active:scale-95 transition">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner shrink-0 animate-bounce">
            ${ach.icon}
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] uppercase tracking-wider font-extrabold text-amber-300 font-mono">🏆 ДОСТИЖЕНИЕ ПОЛУЧЕНО!</span>
              <span class="px-1.5 py-0.2 rounded text-[8px] font-black ${tierInfo.badgeBg}">+${ach.score} очков</span>
            </div>
            <div class="text-xs font-black text-white truncate max-w-[190px] cute-font">${ach.title}</div>
            <div class="text-[10px] text-slate-300 truncate max-w-[200px]">${ach.desc}</div>
          </div>
        </div>
        <div class="flex flex-col items-end shrink-0 pl-1">
          <span class="text-[10px] font-mono font-black text-amber-300">${rewardText}</span>
          <span class="text-[8px] text-slate-400">Открыть ➔</span>
        </div>
      </div>
    `;

    // Анимация выезда сверху
    requestAnimationFrame(() => {
      toast.classList.remove("-translate-y-24", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");
    });

    // Автоматическое скрытие через 4.5 секунды
    if (window._achToastTimer) clearTimeout(window._achToastTimer);
    window._achToastTimer = setTimeout(() => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("-translate-y-24", "opacity-0");
    }, 4500);

  } catch (e) {
    console.error("[Achievements] Toast error:", e);
  }
};

// 5. РАСЧЕТ GAMERSCORE И РАНГА ПРОФИЛЯ
window.getGamerscoreInfo = function () {
  const state = window.achievementsState || window.loadAchievementsState();
  let currentScore = 0;
  let totalScore = 0;
  let unlockedCount = 0;
  const totalCount = window.ACHIEVEMENTS_CATALOG.length;

  window.ACHIEVEMENTS_CATALOG.forEach(ach => {
    totalScore += ach.score;
    if (state[ach.id]?.isUnlocked) {
      currentScore += ach.score;
      unlockedCount++;
    }
  });

  const percent = Math.round((unlockedCount / Math.max(1, totalCount)) * 100);

  let rank = "Уютный Новичок 🐾";
  if (currentScore >= 1350) rank = "★ Владычица Мур-Мира ★ 💎";
  else if (currentScore >= 900) rank = "Королева Таганрога 👑";
  else if (currentScore >= 500) rank = "Хранительница Уюта ✨";
  else if (currentScore >= 200) rank = "Опытная Кото-Мама 🎀";

  return { currentScore, totalScore, unlockedCount, totalCount, percent, rank };
};

// Обновление бейджа на кнопке в хедере
window.updateAchievementsBadge = function () {
  try {
    const badge = document.getElementById("badgeAchievementsUnlocked");
    if (!badge) return;
    const info = window.getGamerscoreInfo();
    badge.innerText = `${info.unlockedCount}`;
    if (info.unlockedCount > 0) {
      badge.classList.remove("hidden");
    }
  } catch (e) {}
};

// 6. ИНТЕРФЕЙС «ЗАЛ СЛАВЫ» (MODAL ACHIEVEMENTS)
window.currentAchievementCategory = "all";

window.openAchievementsModal = function () {
  const modal = document.getElementById("modalAchievements");
  if (!modal) return;
  modal.classList.remove("hidden");
  window.renderAchievementsUI();
};

window.closeAchievementsModal = function () {
  const modal = document.getElementById("modalAchievements");
  if (modal) modal.classList.add("hidden");
};

window.switchAchievementsTab = function (cat) {
  window.currentAchievementCategory = cat;
  window.renderAchievementsUI();
};

window.renderAchievementsUI = function () {
  try {
    const info = window.getGamerscoreInfo();
    const state = window.achievementsState || window.loadAchievementsState();

    // Заполнение хедера
    const scoreEl = document.getElementById("achMasterScore");
    const countEl = document.getElementById("achUnlockedCount");
    const rankEl = document.getElementById("achRankBadge");
    const barEl = document.getElementById("achProgressBar");
    const percentEl = document.getElementById("achPercentLabel");

    if (scoreEl) scoreEl.innerText = `${info.currentScore} / ${info.totalScore}`;
    if (countEl) countEl.innerText = `${info.unlockedCount} из ${info.totalCount} открыто`;
    if (rankEl) rankEl.innerText = info.rank;
    if (barEl) barEl.style.width = `${info.percent}%`;
    if (percentEl) percentEl.innerText = `${info.percent}%`;

    // Стили кнопок категорий
    const tabs = ["all", "pet", "wardrobe", "cases", "casino", "arcade", "love", "secret"];
    tabs.forEach(t => {
      const btn = document.getElementById(`achTab_${t}`);
      if (btn) {
        if (t === window.currentAchievementCategory) {
          btn.className = "px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-[10px] whitespace-nowrap shadow-md transition shrink-0 cursor-pointer";
        } else {
          btn.className = "px-3 py-1.5 rounded-xl bg-[#141527] text-slate-400 hover:text-white border border-white/5 font-bold text-[10px] whitespace-nowrap transition shrink-0 cursor-pointer";
        }
      }
    });

    // Фильтрация списка
    const listContainer = document.getElementById("achievementsGridList");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    const filtered = window.ACHIEVEMENTS_CATALOG.filter(ach => {
      if (window.currentAchievementCategory === "all") return true;
      return ach.category === window.currentAchievementCategory;
    });

    filtered.forEach(ach => {
      const data = state[ach.id] || { currentProgress: 0, isUnlocked: false };
      const isUnlocked = data.isUnlocked;
      const progress = Math.min(data.currentProgress || 0, ach.maxProgress);
      const tierInfo = window.ACHIEVEMENT_TIERS[ach.tier] || window.ACHIEVEMENT_TIERS.bronze;

      // Если секретная и еще не открыта - скрываем название и описание
      const isHiddenSecret = ach.secret && !isUnlocked;
      const displayTitle = isHiddenSecret ? "Секретное достижение" : ach.title;
      const displayDesc = isHiddenSecret ? (ach.hint || "Условие скрыто... Исследуй мир Зефирки!") : ach.desc;
      const displayIcon = isHiddenSecret ? "🔒" : ach.icon;

      const card = document.createElement("div");
      card.className = `relative p-3 rounded-2xl border transition-all ${
        isUnlocked
          ? `bg-[#131528] ${tierInfo.borderGlow} shadow-lg`
          : "bg-[#0d0e1c] border-white/5 opacity-80"
      } flex flex-col gap-2`;

      const rewardParts = [];
      if (ach.reward?.coins) rewardParts.push(`+${ach.reward.coins} 🪙`);
      if (ach.reward?.sparks) rewardParts.push(`+${ach.reward.sparks} ✨`);
      if (ach.reward?.title) rewardParts.push(`«${ach.reward.title}»`);
      const rewardString = rewardParts.join(" • ");

      card.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl ${
              isUnlocked ? "bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-400/40" : "bg-[#181a30] border border-white/5 text-gray-500"
            } flex items-center justify-center text-2xl shrink-0">
              ${displayIcon}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="cute-font text-xs font-black ${isUnlocked ? "text-amber-200" : "text-slate-300"}">${displayTitle}</span>
                <span class="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold ${tierInfo.badgeBg}">+${ach.score}</span>
              </div>
              <div class="text-[10px] ${isUnlocked ? "text-slate-300" : "text-slate-400"} mt-0.5 leading-snug">${displayDesc}</div>
            </div>
          </div>
          <div class="shrink-0">
            ${isUnlocked 
              ? `<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">✓ Открыто</span>`
              : `<span class="text-[9px] font-mono text-slate-500">${progress}/${ach.maxProgress}</span>`
            }
          </div>
        </div>

        <!-- Прогресс-бар если не открыто и шагов больше 1 -->
        ${(!isUnlocked && ach.maxProgress > 1) ? `
          <div class="w-full bg-[#080914] h-1.5 rounded-full overflow-hidden border border-white/5 mt-1">
            <div class="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all" style="width: ${Math.round((progress/ach.maxProgress)*100)}%;"></div>
          </div>
        ` : ""}

        <div class="flex justify-between items-center text-[9px] text-slate-400 border-t border-white/5 pt-1.5 mt-0.5">
          <span class="text-amber-300/80 font-mono">${rewardString}</span>
          ${isUnlocked && data.unlockedAt ? `<span class="text-slate-500">${data.unlockedAt}</span>` : ""}
        </div>
      `;

      listContainer.appendChild(card);
    });

  } catch (e) {
    console.error("[Achievements] Render error:", e);
  }
};

// 7. СЛУШАТЕЛИ СОСТОЯНИЯ ПИТОМЦА ДЛЯ АВТО-ВАЛИДАЦИИ
window.checkCareAchievements = function () {
  try {
    if (!window.pet) return;

    // Проверка идеальных характеристик
    if (window.pet.hunger >= 100 && window.pet.energy >= 100 && window.pet.happy >= 100 && window.pet.clean >= 100) {
      window.trackAchievement("pet_perfect_stats", 1, { isAbsolute: true });
    }

    // Проверка уровня
    if (window.pet.level >= 10) {
      window.trackAchievement("pet_level_10", window.pet.level, { isAbsolute: true });
    }

    // Проверка Звёздных Искр
    if (typeof window.pet.starSparks === "number" && window.pet.starSparks >= 10) {
      window.trackAchievement("sparks_first_10", window.pet.starSparks, { isAbsolute: true });
    }

    // Проверка пасхалки Царица Катя
    if (window.pet.name === "Царица Катя" && window.activeEquipment?.head === "crown") {
      window.trackAchievement("secret_queen_name", 1, { isAbsolute: true });
    }

    // Проверка коллекций комнат
    if (Array.isArray(window.ownedRooms) && window.ownedRooms.length >= 3) {
      window.trackAchievement("wardrobe_rooms_3", window.ownedRooms.length, { isAbsolute: true });
    }

    // Проверка купонов в сейфе
    const vault = window.wishesVault || JSON.parse(localStorage.getItem("katya_master_wishes_vault")) || [];
    const activeWishes = Array.isArray(vault) ? vault.filter(w => w.status !== "used").length : 0;
    if (activeWishes >= 3) {
      window.trackAchievement("love_vault_3", activeWishes, { isAbsolute: true });
    }

  } catch (e) {}
};

// Первичная инициализация бейджа
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (typeof window.updateAchievementsBadge === "function") {
      window.updateAchievementsBadge();
    }
  }, 1000);
});
