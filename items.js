/* =========================================================================
 * LEX LABS ENTERPRISE: GLOBAL ITEMS, RARITIES & EVENT REPOSITORY
 * Файл: items.js
 * ========================================================================= */

// 1. СИСТЕМА РЕДКОСТЕЙ, ЭФФЕКТОВ И ЦВЕТОВЫХ ГРАНИЦ
window.ITEM_RARITIES = {
  common: {
    id: "common",
    name: "Обычный",
    color: "#94a3b8",
    badgeBg: "bg-slate-800 text-slate-300 border-slate-600/50",
    borderClass: "border-[#313244]",
    glowClass: "",
    auraEffect: "none"
  },
  rare: {
    id: "rare",
    name: "Редкий",
    color: "#38bdf8",
    badgeBg: "bg-sky-950/80 text-sky-300 border-sky-500/60",
    borderClass: "border-sky-500/60",
    glowClass: "shadow-[0_0_12px_rgba(56,189,248,0.3)] hover:shadow-[0_0_18px_rgba(56,189,248,0.5)]",
    auraEffect: "drop-shadow(0 0 4px #38bdf8)"
  },
  epic: {
    id: "epic",
    name: "Эпический",
    color: "#c084fc",
    badgeBg: "bg-purple-950/80 text-purple-300 border-purple-500/60",
    borderClass: "border-purple-500/70",
    glowClass: "shadow-[0_0_16px_rgba(192,132,252,0.4)] hover:shadow-[0_0_24px_rgba(192,132,252,0.6)] animate-pulse",
    auraEffect: "drop-shadow(0 0 6px #c084fc)"
  },
  legendary: {
    id: "legendary",
    name: "Легендарный",
    color: "#fbbf24",
    badgeBg: "bg-amber-950/80 text-amber-300 border-amber-400/70",
    borderClass: "border-amber-400 animate-pulse",
    glowClass: "shadow-[0_0_22px_rgba(251,191,36,0.5)] hover:shadow-[0_0_32px_rgba(251,191,36,0.8)]",
    auraEffect: "drop-shadow(0 0 9px #fbbf24)"
  },
  mythic: {
    id: "mythic",
    name: "★ Мифический",
    color: "#f43f5e",
    badgeBg: "bg-rose-950/90 text-rose-300 border-rose-400",
    borderClass: "border-rose-500 animate-epic-glow",
    glowClass: "shadow-[0_0_28px_rgba(244,63,94,0.65)] hover:shadow-[0_0_40px_rgba(244,63,94,0.9)]",
    auraEffect: "drop-shadow(0 0 12px #f43f5e)"
  },
  halloween: {
    id: "halloween",
    name: "🎃 Хеллоуин",
    color: "#fb923c",
    badgeBg: "bg-orange-950/90 text-orange-300 border-orange-500",
    borderClass: "border-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.45)]",
    glowClass: "animate-pulse hover:shadow-[0_0_30px_rgba(249,115,22,0.7)]",
    auraEffect: "drop-shadow(0 0 8px #f97316)"
  }
};

// 2. БАЗА ПРЕДМЕТОВ (МИНИМУМ ПО 20 В КАЖДОЙ КАТЕГОРИИ)
window.GAME_ITEMS_DB = {
  // ==========================================
  // ГОЛОВНЫЕ УБОРЫ (HEAD) - 21 предмет
  // ==========================================
  head: [
    { id: "none", name: "Без убора", icon: "🚫", rarity: "common", cost: 0, source: "shop", desc: "Естественная макушка" },
    { id: "flower", name: "Ромашка", icon: "🌸", rarity: "common", cost: 35, source: "shop", desc: "Полевой цветочек" },
    { id: "leaf", name: "Листик мяты", icon: "🍃", rarity: "common", cost: 40, source: "shop", desc: "Свежий аромат" },
    { id: "cap_red", name: "Кепка Red", icon: "🧢", rarity: "common", cost: 45, source: "shop", desc: "Уличный стиль" },
    { id: "beanie", name: "Шапка бини", icon: "🧶", rarity: "common", cost: 50, source: "shop", desc: "Теплая шерсть" },
    { id: "beret", name: "Французский берет", icon: "🎨", rarity: "rare", cost: 70, source: "shop", desc: "Шарм парижских улочек" },
    { id: "straw_hat", name: "Соломенная шляпа", icon: "👒", rarity: "rare", cost: 80, source: "shop", desc: "Защита от солнца" },
    { id: "party_hat", name: "Колпак именинника", icon: "🎉", rarity: "rare", cost: 85, source: "shop", desc: "Праздник каждый день" },
    { id: "headphones", name: "Геймерские ушки", icon: "🎧", rarity: "rare", cost: 95, source: "shop", desc: "RGB-подсветка" },
    { id: "detective_hat", name: "Шляпа сыщика", icon: "🕵️", rarity: "rare", cost: 100, source: "shop", desc: "В поисках улик" },
    { id: "crown", name: "Золотая корона", icon: "👑", rarity: "epic", cost: 130, source: "shop", desc: "Королевское величие" },
    { id: "wizard", name: "Шляпа Архимага", icon: "🧙", rarity: "epic", cost: 150, source: "shop", desc: "Заряжена маной" },
    { id: "chef_hat", name: "Колпак Шефа", icon: "👨‍🍳", rarity: "epic", cost: 120, source: "shop", desc: "Мастер кулинарии" },
    { id: "tiara", name: "Алмазная тиара", icon: "💎", rarity: "epic", cost: 160, source: "shop", desc: "Сверкает гранями" },
    { id: "halo_gold", name: "Ангельский нимб", icon: "😇", rarity: "legendary", cost: 0, source: "case", caseName: "Премиум Таганрог", desc: "Чистый свет" },
    { id: "astronaut_helm", name: "Шлем космонавта", icon: "🧑‍🚀", rarity: "legendary", cost: 0, source: "case", caseName: "Black Box", desc: "Герметичное стекло" },
    { id: "cyber_crown", name: "Кибер-Венец 2077", icon: "⚡", rarity: "mythic", cost: 0, source: "case", caseName: "★ Black Box ★", desc: "Нейроинтерфейс власти" },
    // Хеллоуин
    { id: "hw_witch_hat", name: "Колпак Ведьмы", icon: "🧙‍♀️", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Пахнет зельями" },
    { id: "hw_pumpkin_helm", name: "Тыква Джека", icon: "🎃", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Светится изнутри" },
    { id: "hw_bat_ears", name: "Ушки Летучей мыши", icon: "🦇", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Шелестят в ночи" },
    { id: "hw_demon_horns", name: "Рожки Демона", icon: "😈", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Огненный жар" }
  ],

  // ==========================================
  // ГЛАЗА И ЛИЦО (EYES) - 21 предмет
  // ==========================================
  eyes: [
    { id: "none", name: "Без очков", icon: "🚫", rarity: "common", cost: 0, source: "shop", desc: "Ясный кошачий взор" },
    { id: "glasses", name: "Круглые очки", icon: "👓", rarity: "common", cost: 50, source: "shop", desc: "Умный взгляд" },
    { id: "sunglasses", name: "Вайфареры", icon: "🕶️", rarity: "common", cost: 60, source: "shop", desc: "Стильная классика" },
    { id: "blush_pink", name: "Милый румянец", icon: "😳", rarity: "common", cost: 40, source: "shop", desc: "Кошачье смущение" },
    { id: "sleep_mask", name: "Маска для сна", icon: "😴", rarity: "common", cost: 45, source: "shop", desc: "Сладкие сны" },
    { id: "monocle", name: "Монокль лорда", icon: "🧐", rarity: "rare", cost: 85, source: "shop", desc: "Аристократично" },
    { id: "heart_glasses", name: "Очки-сердечки", icon: "🥰", rarity: "rare", cost: 90, source: "shop", desc: "Видеть любовь" },
    { id: "pixel_glasses", name: "Thug Life 8-bit", icon: "😎", rarity: "rare", cost: 95, source: "shop", desc: "Пиксельный стиль" },
    { id: "star_glasses", name: "Звездные очки", icon: "⭐", rarity: "rare", cost: 90, source: "shop", desc: "Рок-звезда" },
    { id: "anime_sparkle", name: "Аниме-блеск", icon: "✨", rarity: "epic", cost: 130, source: "shop", desc: "Искры восторга" },
    { id: "pirate_patch", name: "Повязка пирата", icon: "🏴‍☠️", rarity: "epic", cost: 120, source: "shop", desc: "Гроза морей" },
    { id: "steampunk_goggles", name: "Стимпанк-гогглы", icon: "⚙️", rarity: "epic", cost: 140, source: "shop", desc: "Латунь и шестерни" },
    { id: "vr_headset", name: "VR-очки", icon: "🥽", rarity: "epic", cost: 160, source: "shop", desc: "Виртуальный мир" },
    { id: "laser_eyes", name: "Лазерные глаза", icon: "👁️‍🗨️", rarity: "legendary", cost: 0, source: "case", caseName: "Премиум Таганрог", desc: "Прожигает взглядом" },
    { id: "cyber_visor", name: "Неоновый визор", icon: "📟", rarity: "legendary", cost: 0, source: "case", caseName: "Black Box", desc: "Тактический радар" },
    { id: "galaxy_gaze", name: "Взор Бездны", icon: "🔮", rarity: "mythic", cost: 0, source: "case", caseName: "★ Black Box ★", desc: "Тайна вселенной" },
    // Хеллоуин
    { id: "hw_vamp_eyes", name: "Алые глаза Вампира", icon: "🧛", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Жажда ночи" },
    { id: "hw_spider_web", name: "Вуаль Паутины", icon: "🕸️", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Тончайший шелк паука" },
    { id: "hw_zombie_stitches", name: "Шрам Франкенштейна", icon: "🧟", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Оживленный монстр" },
    { id: "hw_pumpkin_glow", name: "Тыквенный огонь", icon: "🕯️", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Зловещее пламя в глазах" },
    { id: "hw_skull_mask", name: "Маска Черепа", icon: "💀", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Праздник всех святых" }
  ],

  // ==========================================
  // ВЕРХНЯЯ ОДЕЖДА И ТЕЛО (BODY) - 21 предмет
  // ==========================================
  body: [
    { id: "none", name: "Без верха", icon: "🚫", rarity: "common", cost: 0, source: "shop", desc: "Пушистый животик" },
    { id: "bow", name: "Атласный бантик", icon: "🎀", rarity: "common", cost: 30, source: "shop", desc: "Розовая ленточка" },
    { id: "collar_bell", name: "Ошейник с колокольчиком", icon: "🔔", rarity: "common", cost: 40, source: "shop", desc: "Звенит при тыгыдыке" },
    { id: "bandana_blue", name: "Синяя бандана", icon: "🧣", rarity: "common", cost: 45, source: "shop", desc: "Ковбойский шарм" },
    { id: "tshirt_striped", name: "Полосатая тельняшка", icon: "👕", rarity: "common", cost: 50, source: "shop", desc: "Морской котик" },
    { id: "std_scarf", name: "Теплый синий шарф", icon: "🧣", rarity: "rare", cost: 70, source: "shop", desc: "Согреет осенью" },
    { id: "sweater_wool", name: "Вязаный свитер", icon: "🧶", rarity: "rare", cost: 85, source: "shop", desc: "Связан с любовью" },
    { id: "raincoat", name: "Желтый дождевик", icon: "🧥", rarity: "rare", cost: 95, source: "shop", desc: "Капли скатываются" },
    { id: "hawaiian_shirt", name: "Гавайская рубашка", icon: "🌺", rarity: "rare", cost: 90, source: "shop", desc: "Отпускное настроение" },
    { id: "prem_hoodie", name: "Розовое оверсайз-худи", icon: "👗", rarity: "epic", cost: 150, source: "shop", desc: "Уют Кати" },
    { id: "tuxedo", name: "Смокинг Джентльмена", icon: "🤵", rarity: "epic", cost: 160, source: "shop", desc: "Для важных приёмов" },
    { id: "kimono_sakura", name: "Шелковое кимоно", icon: "👘", rarity: "epic", cost: 175, source: "shop", desc: "Цветущая вишня" },
    { id: "leather_jacket", name: "Кожаная косуха", icon: "🏍️", rarity: "epic", cost: 170, source: "shop", desc: "Байкерский дух" },
    { id: "wings_angel", name: "Крылышки Ангела", icon: "🪽", rarity: "legendary", cost: 0, source: "case", caseName: "Премиум Таганрог", desc: "Невесомый пух" },
    { id: "cyber_armor", name: "Нано-кираса X1", icon: "🛡️", rarity: "legendary", cost: 0, source: "case", caseName: "Black Box", desc: "Титановый сплав" },
    { id: "cyber_exosuit", name: "Экзоскелет М-1", icon: "🦾", rarity: "mythic", cost: 0, source: "case", caseName: "★ Black Box ★", desc: "Мощь кибернетики" },
    // Хеллоуин
    { id: "hw_witch_robe", name: "Мантия Ведьмы", icon: "🔮", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Ткань ночного неба" },
    { id: "hw_ghost_sheet", name: "Саван Призрака", icon: "👻", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Летает над полом" },
    { id: "hw_vampire_cape", name: "Плащ Дракулы", icon: "🧛‍♂️", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Бархат цвета крови" },
    { id: "hw_skeleton_suit", name: "Костюм Скелетика", icon: "💀", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Светится в темноте" },
    { id: "hw_mummy_wraps", name: "Бинты Мумии", icon: "🩹", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Древние папирусы" }
  ],

  // ==========================================
  // НИЗ / ШТАНИШКИ И ЛАПКИ (LEGS) - 21 предмет
  // ==========================================
  legs: [
    { id: "none", name: "Без низа", icon: "🚫", rarity: "common", cost: 0, source: "shop", desc: "Мягкие подушечки лап" },
    { id: "socks_white", name: "Белые носочки", icon: "🧦", rarity: "common", cost: 25, source: "shop", desc: "Лапки в тепле" },
    { id: "shorts_denim", name: "Джинсовые шортики", icon: "🩳", rarity: "common", cost: 45, source: "shop", desc: "Летний вариант" },
    { id: "skirt_pink", name: "Розовая юбочка", icon: "🩰", rarity: "common", cost: 50, source: "shop", desc: "Воздушная пачка" },
    { id: "slippers_fish", name: "Тапочки-караси", icon: "🐟", rarity: "common", cost: 40, source: "shop", desc: "Шлепают при ходьбе" },
    { id: "pants_jeans", name: "Классические джинсы", icon: "👖", rarity: "rare", cost: 75, source: "shop", desc: "С подворотами" },
    { id: "sneakers_red", name: "Кроссовки Street", icon: "👟", rarity: "rare", cost: 85, source: "shop", desc: "Для быстрого тыгыдыка" },
    { id: "boots_rain", name: "Резиновые сапожки", icon: "🥾", rarity: "rare", cost: 70, source: "shop", desc: "Бегать по лужам" },
    { id: "skirt_plaid", name: "Шотландская юбка", icon: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", rarity: "rare", cost: 80, source: "shop", desc: "Тартан в клеточку" },
    { id: "roller_skates", name: "Ретро-ролики", icon: "🛼", rarity: "epic", cost: 130, source: "shop", desc: "Четыре колеса" },
    { id: "pants_cargo", name: "Штаны карго", icon: "🪖", rarity: "epic", cost: 125, source: "shop", desc: "Множество карманов" },
    { id: "boots_cowboy", name: "Ковбойские сапоги", icon: "🤠", rarity: "epic", cost: 140, source: "shop", desc: "Сапоги со шпорами" },
    { id: "hover_boots", name: "Гравитационные ботинки", icon: "🛸", rarity: "legendary", cost: 0, source: "case", caseName: "Премиум Таганрог", desc: "Парят над землей" },
    { id: "golden_paws", name: "Золотые сапожки", icon: "✨", rarity: "legendary", cost: 0, source: "case", caseName: "Black Box", desc: "Следы из золота" },
    { id: "cyber_runners", name: "Маглев-кроссовки", icon: "⚡", rarity: "mythic", cost: 0, source: "case", caseName: "★ Black Box ★", desc: "Скорость звука" },
    // Хеллоуин
    { id: "hw_witch_skirt", name: "Юбка с паучками", icon: "🕷️", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Рваный мистический край" },
    { id: "hw_pumpkin_shoes", name: "Тыквенные туфельки", icon: "🎃", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Оранжевый бархат" },
    { id: "hw_bone_trousers", name: "Костяные штаны", icon: "🦴", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Принт бедренных костей" },
    { id: "hw_striped_tights", name: "Полосатые чулки Ведьмы", icon: "🍭", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Черно-оранжевая полоска" },
    { id: "hw_demon_hooves", name: "Лапки Демона", icon: "🔥", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Оставляют искры" },
    { id: "hw_ghost_chains", name: "Кентервильские цепи", icon: "⛓️", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Гремят в темноте" }
  ],

  // ==========================================
  // ЛОКАЦИИ И ИНТЕРЬЕРЫ (ROOM) - 21 локация
  // ==========================================
  room: [
    { id: "neon", name: "Неоновая комната", icon: "🟣", class: "bg-theme-neon", rarity: "common", cost: 0, source: "shop", desc: "Базовый уютный свет" },
    { id: "sunny_balcony", name: "Солнечный балкон", icon: "🪴", class: "bg-gradient-to-b from-amber-900/40 via-[#181825] to-[#11111b]", rarity: "common", cost: 60, source: "shop", desc: "Цветы и теплые лучи" },
    { id: "cardboard_box", name: "Коробочный замок", icon: "📦", class: "bg-gradient-to-b from-amber-950/60 via-[#1e1e2e] to-[#0f0f17]", rarity: "common", cost: 50, source: "shop", desc: "Мечта любого кота" },
    { id: "cozy", name: "Шале с камином", icon: "🪵", class: "bg-theme-cozy", rarity: "rare", cost: 120, source: "shop", desc: "Потрескивающие дрова" },
    { id: "rainy_cafe", name: "Кафе под дождем", icon: "☕", class: "bg-gradient-to-b from-[#1c2a38] via-[#0f172a] to-[#020617]", rarity: "rare", cost: 140, source: "shop", desc: "Шум капель по стеклу" },
    { id: "forest_camp", name: "Палатка в лесу", icon: "⛺", class: "bg-gradient-to-b from-[#064e3b] via-[#022c22] to-[#01140e]", rarity: "rare", cost: 135, source: "shop", desc: "Запах сосен и костра" },
    { id: "city", name: "Панорама города", icon: "🌃", class: "bg-theme-city", rarity: "epic", cost: 210, source: "shop", desc: "Огни ночных небоскребов" },
    { id: "japan", name: "Сад цветущей сакуры", icon: "🌸", class: "bg-theme-japan", rarity: "epic", cost: 260, source: "shop", desc: "Лепестки кружатся в воздухе" },
    { id: "library_ancient", name: "Тайная библиотека", icon: "📚", class: "bg-gradient-to-b from-[#3b1d11] via-[#1c0f0a] to-[#0a0503]", rarity: "epic", cost: 230, source: "shop", desc: "Книги с древними свитками" },
    { id: "underwater_dome", name: "Батискаф на дне", icon: "🐠", class: "bg-gradient-to-b from-[#083344] via-[#082f49] to-[#020617]", rarity: "epic", cost: 250, source: "shop", desc: "Рыбки плавают за стеклом" },
    { id: "space", name: "Орбитальная станция", icon: "🌌", class: "bg-theme-space", rarity: "legendary", cost: 0, source: "case", caseName: "Премиум Таганрог", desc: "Вид на бескрайний космос" },
    { id: "taganrog_sea", name: "Набережная Таганрога", icon: "🌅", class: "bg-gradient-to-b from-orange-950/60 via-purple-950/40 to-[#0b0c16]", rarity: "legendary", cost: 0, source: "case", caseName: "Black Box", desc: "Закат над морем для двоих" },
    { id: "crystal_cave", name: "Хрустальная пещера", icon: "💎", class: "bg-gradient-to-b from-[#4a044e] via-[#2e1065] to-[#090514]", rarity: "legendary", cost: 0, source: "case", caseName: "Black Box", desc: "Светящиеся кристаллы" },
    { id: "cyber_penthouse", name: "Кибер-Пентхаус 2077", icon: "🏙️", class: "bg-gradient-to-b from-[#701a75] via-[#1e1b4b] to-[#020617]", rarity: "mythic", cost: 0, source: "case", caseName: "★ Black Box ★", desc: "Летающие автомобили и неон" },
    { id: "singularity_core", name: "Ядро Белой Дыры", icon: "💠", class: "bg-radial from-violet-900 via-fuchsia-950 to-black", rarity: "mythic", cost: 0, source: "case", caseName: "★ Black Box ★", desc: "Искривление пространства" },
    // Хеллоуин
    { id: "hw_room_crypt", name: "Древний Склеп", icon: "⚰️", class: "bg-gradient-to-b from-[#1b0826] via-[#090514] to-[#020005]", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Свечи, летучие мыши и полумрак" },
    { id: "hw_room_patch", name: "Поляна Джека", icon: "🎃", class: "bg-gradient-to-b from-[#3a1300] via-[#1a0800] to-[#080200]", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Сотни светящихся тыкв" },
    { id: "hw_room_castle", name: "Замок Дракулы", icon: "🏰", class: "bg-gradient-to-b from-[#450a0a] via-[#1c0202] to-[#050000]", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Трон владыки ночи" },
    { id: "hw_room_mist", name: "Кладбищенский туман", icon: "🪦", class: "bg-gradient-to-b from-[#131f24] via-[#0b1217] to-[#030608]", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Холодная луна сквозь дымку" },
    { id: "hw_room_cauldron", name: "Хижина Ведьмы", icon: "🧪", class: "bg-gradient-to-b from-[#14532d] via-[#052e16] to-[#021208]", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Бурлящий котел с зельем" },
    { id: "hw_room_web", name: "Чердак с пауками", icon: "🕸️", class: "bg-gradient-to-b from-[#292524] via-[#1c1917] to-[#0c0a09]", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин", desc: "Забытые сундуки и паутина" }
  ],

  // ==========================================
  // ОКРАСЫ ШЕРСТКИ (COLOR) - 20 окрасов
  // ==========================================
  color: [
    { id: "pink", name: "Зефирный розовый", hex: "#f5e0dc", accent: "#f2cdcd", rarity: "common", cost: 0, source: "shop" },
    { id: "peach", name: "Персиковый мур", hex: "#fed7aa", accent: "#fdba74", rarity: "common", cost: 30, source: "shop" },
    { id: "white", name: "Белоснежный", hex: "#f8fafc", accent: "#e2e8f0", rarity: "common", cost: 40, source: "shop" },
    { id: "grey", name: "Дымчатый пепел", hex: "#cbd5e1", accent: "#94a3b8", rarity: "common", cost: 45, source: "shop" },
    { id: "black", name: "Угольный ночной", hex: "#1e1e2e", accent: "#11111b", rarity: "common", cost: 50, source: "shop" },
    { id: "caramel", name: "Сливочная карамель", hex: "#fde68a", accent: "#f59e0b", rarity: "rare", cost: 75, source: "shop" },
    { id: "coffee", name: "Шоколадный капучино", hex: "#d6bc9f", accent: "#8c6239", rarity: "rare", cost: 85, source: "shop" },
    { id: "mint", name: "Мятный бриз", hex: "#a7f3d0", accent: "#34d399", rarity: "rare", cost: 90, source: "shop" },
    { id: "lavender", name: "Лавандовое облако", hex: "#e9d5ff", accent: "#c084fc", rarity: "rare", cost: 95, source: "shop" },
    { id: "midnight", name: "Полночный сапфир", hex: "#1e1e38", accent: "#38bdf8", rarity: "epic", cost: 160, source: "shop" },
    { id: "sakura_gold", name: "Сакура Gold", hex: "#fbcfe8", accent: "#fbbf24", rarity: "epic", cost: 180, source: "shop" },
    { id: "emerald_fur", name: "Изумрудный шелк", hex: "#6ee7b7", accent: "#059669", rarity: "epic", cost: 170, source: "shop" },
    { id: "ruby_velvet", name: "Рубиновый бархат", hex: "#fda4af", accent: "#e11d48", rarity: "epic", cost: 175, source: "shop" },
    { id: "cyber_chrome", name: "Жидкий хром", hex: "#94a3b8", accent: "#38bdf8", rarity: "legendary", cost: 0, source: "case", caseName: "Премиум Таганрог" },
    { id: "gold_ingot", name: "Чистое золото 999°", hex: "#fef08a", accent: "#eab308", rarity: "legendary", cost: 0, source: "case", caseName: "Black Box" },
    { id: "cosmic_void", name: "Космическая бездна", hex: "#2e1065", accent: "#ec4899", rarity: "mythic", cost: 0, source: "case", caseName: "★ Black Box ★" },
    // Хеллоуин
    { id: "hw_pumpkin_orange", name: "Тыквенный огонь", hex: "#fdba74", accent: "#ea580c", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин" },
    { id: "hw_ghost_white", name: "Призрачный саван", hex: "#ccfbf1", accent: "#5eead4", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин" },
    { id: "hw_toxic_slime", name: "Токсичная слизь", hex: "#bef264", accent: "#65a30d", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин" },
    { id: "hw_vamp_black", name: "Вампирский агат", hex: "#27272a", accent: "#991b1b", rarity: "halloween", cost: 0, source: "case", caseName: "Хеллоуин" }
  ]
};

// 3. ХЕЛЛОУИНСКИЙ КЕЙС СО СЛУЧАЙНЫМИ СЕТАМИ И ОДИНОЧНЫМИ ВЕЩАМИ
window.HALLOWEEN_CASE_CONFIG = {
  id: "case_halloween",
  title: "🎃 Хеллоуинский Склеп 2026",
  cost: 130,
  drops: [
    // ПОЛНЫЕ СЕТЫ ЦЕЛИКОМ (СУПЕРПРИЗЫ)
    {
      id: "bundle_witch_full",
      isBundle: true,
      name: "★ ПОЛНЫЙ СЕТ ВЕДЬМЫ ★",
      icon: "🧙‍♀️",
      color: "#f97316",
      chance: 4,
      desc: "Колпак + Мантия + Юбка с паучками + Поляна Джека!",
      itemsIncluded: ["hw_witch_hat", "hw_witch_robe", "hw_witch_skirt", "hw_room_patch"],
      isEpic: true
    },
    {
      id: "bundle_vampire_full",
      isBundle: true,
      name: "★ СЕТ ВЛАДЫКИ НОЧИ ★",
      icon: "🧛‍♂️",
      color: "#ef4444",
      chance: 3,
      desc: "Алые глаза + Плащ Дракулы + Замок Дракулы!",
      itemsIncluded: ["hw_vamp_eyes", "hw_vampire_cape", "hw_room_castle"],
      isEpic: true
    },
    {
      id: "bundle_ghost_full",
      isBundle: true,
      name: "★ СЕТ ПРИЗРАКА ★",
      icon: "👻",
      color: "#c084fc",
      chance: 5,
      desc: "Саван Призрака + Вуаль Паутины + Древний Склеп + Призрачный окрас!",
      itemsIncluded: ["hw_ghost_sheet", "hw_spider_web", "hw_room_crypt", "color_hw_ghost_white"],
      isEpic: true
    },
    {
      id: "bundle_demon_full",
      isBundle: true,
      name: "★ СЕТ ЛОРДА ДЕМОНОВ ★",
      icon: "😈",
      color: "#dc2626",
      chance: 3,
      desc: "Рожки демона + Огненные лапки + Хижина ведьмы!",
      itemsIncluded: ["hw_demon_horns", "hw_demon_hooves", "hw_room_cauldron"],
      isEpic: true
    },

    // ЛОКАЦИИ ПО ОТДЕЛЬНОСТИ
    { id: "hw_room_patch", slot: "room", name: "Локация: Поляна Джека", icon: "🎃", color: "#fb923c", chance: 7, desc: "Сотни светящихся тыкв" },
    { id: "hw_room_crypt", slot: "room", name: "Локация: Древний Склеп", icon: "⚰️", color: "#a855f7", chance: 7, desc: "Мистический склеп со свечами" },
    { id: "hw_room_mist", slot: "room", name: "Локация: Туманное кладбище", icon: "🪦", color: "#38bdf8", chance: 8, desc: "Холодная дымка и луна" },

    // ОДИНОЧНЫЕ ПРЕДМЕТЫ
    { id: "hw_pumpkin_helm", slot: "head", name: "Тыква Джека", icon: "🎃", color: "#fb923c", chance: 11, desc: "Светится изнутри" },
    { id: "hw_vampire_cape", slot: "body", name: "Плащ Дракулы", icon: "🧛", color: "#f43f5e", chance: 10, desc: "Атласный черный плащ" },
    { id: "hw_witch_hat", slot: "head", name: "Колпак Ведьмы", icon: "🧙‍♀️", color: "#c084fc", chance: 10, desc: "Остроконечная шляпа" },
    { id: "hw_skeleton_suit", slot: "body", name: "Костюм Скелетика", icon: "💀", color: "#94a3b8", chance: 11, desc: "Флуоресцентные кости" },
    { id: "hw_bat_ears", slot: "head", name: "Ушки Нетопыря", icon: "🦇", color: "#60a5fa", chance: 11, desc: "Шелестят в темноте" },
    { id: "hw_pumpkin_shoes", slot: "legs", name: "Тыквенные туфельки", icon: "🥿", color: "#ea580c", chance: 10, desc: "Мягкий оранжевый бархат" }
  ]
};