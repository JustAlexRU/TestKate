/**
 * @fileoverview LEX LABS ENTERPRISE: CRM CHAT & ATTACHMENTS MODULE
 * @module admin/dashboard_chat
 * 
 * @description
 * Зона ответственности (Single Responsibility):
 * Мессенджер оператора с игроком, хронологическая сортировка сообщений,
 * сжатие и прикрепление скриншотов через Canvas/FileReader, полноэкранный Lightbox-просмотр,
 * оптимистичный UI и защита от race conditions.
 *
 * @exports
 * - window.currentOpenBugId — ID текущего открытого тикета в диалоге разработчика
 * - window.crmChatActiveBase64 — Base64-данные прикрепленного скриншота
 * - window.crmOnChatFileSelected(event) — загрузка и сжатие выбранного изображения
 * - window.crmClearChatImage() — сброс прикрепленного скриншота и превью
 * - window.openFullImage(src) — открытие скриншота в модальном окне LightBox
 * - window.closeFullImage() — закрытие модального окна LightBox
 * - window.scrollChatToBottom(container, smooth) — надежный автоскролл ленты вниз
 * - window.normalizeAndSortMessages(rawMsgs, fallbackText, fallbackDate) — дедупликация и хронологическая сортировка
 * - window.renderCrmChatTimeline(bug) — хронологический рендер сообщений чата тикета
 * - window.crmSendOperatorMessage() — оптимистичная отправка ответа оператора с защитой от спама
 */

if (window.currentOpenBugId === undefined) {
  window.currentOpenBugId = null;
}
window.crmChatActiveBase64 = null;
window.isChatSendingMessage = false;

/**
 * Надежный автоскролл к последнему сообщению в ленте чата
 */
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

  // Если в сообщениях есть картинки, докручиваем после их загрузки
  const imgs = container.querySelectorAll("img");
  imgs.forEach(img => {
    if (!img.complete) {
      img.addEventListener("load", doScroll, { once: true });
      img.addEventListener("error", doScroll, { once: true });
    }
  });
}
window.scrollChatToBottom = scrollChatToBottom;

/**
 * Дедупликация по msg.id и строгая хронологическая сортировка сообщений (старые сверху, новые снизу)
 */
function normalizeAndSortMessages(rawMsgs, fallbackText, fallbackDate) {
  const map = new Map();

  // Если массив пуст, но есть изначальный текст тикета
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
window.normalizeAndSortMessages = normalizeAndSortMessages;

// Утилиты работы со скриншотами и полноэкранным просмотром (Lightbox)
window.crmOnChatFileSelected = function (e) {
  const file = e?.target?.files?.[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > 800 || h > 800) {
        if (w > h) {
          h = Math.round(800 * h / w);
          w = 800;
        } else {
          w = Math.round(800 * w / h);
          h = 800;
        }
      }
      c.width = w;
      c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      window.crmChatActiveBase64 = c.toDataURL("image/jpeg", 0.7);
      const preview = document.getElementById("crmChatImgPreview");
      if (preview) preview.src = window.crmChatActiveBase64;
      document.getElementById("crmChatImgPreviewBox")?.classList.remove("hidden");
    };
    img.src = ev.target.result;
  };
  r.readAsDataURL(file);
};

window.crmClearChatImage = function () {
  window.crmChatActiveBase64 = null;
  const inp = document.getElementById("crmChatFileInput");
  if (inp) inp.value = "";
  const preview = document.getElementById("crmChatImgPreview");
  if (preview) preview.src = "";
  document.getElementById("crmChatImgPreviewBox")?.classList.add("hidden");
};

/**
 * Открытие изображения во встроенном модальном окне Lightbox
 */
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

/**
 * Закрытие модального окна Lightbox
 */
window.closeFullImage = function () {
  const modal = document.getElementById("modalChatLightbox");
  if (modal) modal.classList.add("hidden");
};

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    window.closeFullImage();
  }
});

/**
 * Хронологический рендеринг ленты сообщений (Kanban Bug Detail Dialog)
 */
function renderCrmChatTimeline(bug) {
  const area = document.getElementById("crmChatMessagesArea");
  if (!area || !bug) return;
  area.innerHTML = "";

  const escapeFn = typeof window.escapeHtml === "function" ? window.escapeHtml : (str => str || "");
  const sortedMsgs = normalizeAndSortMessages(bug.messages, bug.text, bug.date);

  sortedMsgs.forEach(msg => {
    // 1. Системные события (центрированные бейджи)
    if (msg.system) {
      const sysBubble = document.createElement("div");
      sysBubble.className = "w-full flex justify-center my-1 select-text";
      sysBubble.innerHTML = `
        <div class="px-3 py-1 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-slate-400 flex items-center gap-1.5 shadow-sm max-w-[85%] text-center leading-normal">
          <span>${escapeFn(msg.text)}</span>
          ${msg.time ? `<span class="opacity-50 text-[9px]">• ${escapeFn(msg.time)}</span>` : ""}
        </div>
      `;
      area.appendChild(sysBubble);
      return;
    }

    // 2. Пользовательские сообщения
    const isAlex = msg.author === "alex";
    const bubble = document.createElement("div");
    bubble.className = `flex flex-col ${isAlex ? "items-end" : "items-start"} gap-1 w-full`;

    const safeText = escapeFn(msg.text);
    const safeTime = msg.time ? escapeFn(msg.time) : "";
    const authorLabel = isAlex ? "Алексей (Вы)" : "Катя";
    const tickStatus = msg.sending ? "⏳" : "✓✓";

    const card = document.createElement("div");
    card.className = `max-w-[80%] rounded-2xl ${isAlex ? 'bg-amber-400 text-black font-medium rounded-tr-sm shadow-md' : 'bg-[#1b1d30] border border-white/10 text-gray-100 rounded-tl-sm shadow'} p-3 text-xs flex flex-col gap-1`;

    card.innerHTML = `
      <div class="text-[9px] font-mono opacity-60 mb-0.5">${authorLabel}</div>
      ${safeText ? `<div class="whitespace-pre-wrap leading-relaxed select-text">${safeText}</div>` : ""}
    `;

    // Медиа-вложение
    if (msg.image) {
      const imgWrap = document.createElement("div");
      imgWrap.className = "mt-1 rounded-xl overflow-hidden border border-black/10 max-h-48 cursor-pointer relative group";
      imgWrap.innerHTML = `
        <img src="${msg.image}" alt="Скриншот" class="w-full h-full max-h-48 object-cover rounded-xl transition hover:opacity-95 active:scale-[0.99]" />
        <span class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">🔍 Увеличить</span>
      `;
      imgWrap.onclick = () => window.openFullImage(msg.image);
      card.appendChild(imgWrap);
    }

    // Нижний бар баббла: время и статус доставки
    const footer = document.createElement("div");
    footer.className = `text-[9px] font-mono opacity-60 self-end mt-0.5 flex items-center gap-1 justify-end`;
    footer.innerHTML = `<span>${safeTime}</span><span>${tickStatus}</span>`;
    card.appendChild(footer);

    bubble.appendChild(card);
    area.appendChild(bubble);
  });

  scrollChatToBottom(area, true);
}
window.renderCrmChatTimeline = renderCrmChatTimeline;

/**
 * Оптимистичная отправка сообщения оператора с предотвращением спам-кликов и конфликтов
 */
window.crmSendOperatorMessage = async function () {
  const input = document.getElementById("crmChatTextInput");
  const sendBtn = document.getElementById("btnSendCrmMsg");
  const text = input ? input.value.trim() : "";
  const img = window.crmChatActiveBase64;
  const bugId = window.currentOpenBugId;

  if (!text && !img) return;
  if (!bugId) return;

  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const now = Date.now();
  
  const optimisticMsg = {
    id: "msg_alex_" + now + "_" + Math.random().toString(36).substring(2, 5),
    author: "alex",
    text: text,
    image: img || null,
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    timestamp: now,
    sending: true
  };

  // 1. Блокируем кнопку отправки и фоновый опрос на время отправки
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.classList.add("opacity-50", "pointer-events-none");
  }
  window.isChatSendingMessage = true;

  // 2. Оптимистичное локальное обновление UI
  if (!window.currentCloudData) window.currentCloudData = {};
  if (!window.currentCloudData[targetUser]) window.currentCloudData[targetUser] = {};
  if (!Array.isArray(window.currentCloudData[targetUser].feedback)) {
    window.currentCloudData[targetUser].feedback = typeof window.readStorage === "function"
      ? window.readStorage("katya_master_feedback", [])
      : [];
  }

  const list = window.currentCloudData[targetUser].feedback;
  let targetBug = list.find(b => b.id === bugId);
  if (!targetBug) {
    const localList = typeof window.readStorage === "function" ? window.readStorage("katya_master_feedback", []) : [];
    targetBug = localList.find(b => b.id === bugId);
    if (targetBug) list.push(targetBug);
  }

  if (targetBug) {
    if (!Array.isArray(targetBug.messages)) targetBug.messages = [];
    targetBug.messages.push(optimisticMsg);
    renderCrmChatTimeline(targetBug);
  }

  // Очищаем инпут и превью
  if (input) input.value = "";
  window.crmClearChatImage();

  try {
    // 3. Сохранение в облако с дедупликацией
    const cloudRoot = typeof window.fetchCloudData === "function" ? await window.fetchCloudData() : window.currentCloudData;
    const currentList = cloudRoot?.[targetUser]?.feedback || list;
    const cloudBug = currentList.find(b => b.id === bugId);

    if (cloudBug) {
      if (!Array.isArray(cloudBug.messages)) cloudBug.messages = [];
      const msgMap = new Map();
      cloudBug.messages.forEach(m => { if (m && m.id) msgMap.set(m.id, m); });
      optimisticMsg.sending = false;
      msgMap.set(optimisticMsg.id, optimisticMsg);

      cloudBug.messages = Array.from(msgMap.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    }

    if (typeof window.saveCloud === "function") {
      await window.saveCloud();
    }

    if (cloudBug) {
      renderCrmChatTimeline(cloudBug);
    }
  } catch (e) {
    console.error("[Chat] Operator send error:", e);
    optimisticMsg.sending = false;
    if (targetBug) renderCrmChatTimeline(targetBug);
  } finally {
    window.isChatSendingMessage = false;
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.classList.remove("opacity-50", "pointer-events-none");
    }
    input?.focus();
  }
};

// Отправка по Enter (Shift+Enter для новой строки)
document.getElementById("crmChatTextInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    window.crmSendOperatorMessage();
  }
});

// Фоновый опрос для синхронизации чата каждые 10 секунд с защитой от наложения и гонок
let isPolling = false;
let lastRenderedChatHash = "";

setInterval(async () => {
  if (document.hidden || document.visibilityState !== "visible") return;
  if (!window.currentOpenBugId || isPolling || window.isChatSendingMessage) return;
  
  isPolling = true;
  try {
    const cloudRoot = typeof window.fetchCloudData === "function" ? await window.fetchCloudData() : null;
    if (!cloudRoot) return;

    let targetBug = null;
    if (cloudRoot && typeof cloudRoot === "object") {
      Object.keys(cloudRoot).forEach(userKey => {
        const uRec = cloudRoot[userKey];
        if (uRec && Array.isArray(uRec.feedback)) {
          const found = uRec.feedback.find(b => b.id === window.currentOpenBugId);
          if (found) targetBug = found;
        }
      });
    }

    if (targetBug) {
      const msgs = Array.isArray(targetBug.messages) ? targetBug.messages : [];
      const currentHash = `${targetBug.status}_${msgs.length}_${msgs.length > 0 ? msgs[msgs.length - 1].id : ""}`;
      
      // Перерисовываем только если действительно появились новые сообщения или сменился статус!
      if (currentHash !== lastRenderedChatHash) {
        lastRenderedChatHash = currentHash;
        renderCrmChatTimeline(targetBug);
      }
    }
  } catch (e) {
  } finally {
    isPolling = false;
  }
}, 10000);