/**
 * @fileoverview LEX LABS ENTERPRISE: CRM CHAT & ATTACHMENTS MODULE
 * @module admin/dashboard_chat
 * 
 * @description
 * Зона ответственности (Single Responsibility):
 * Мессенджер оператора с игроком, хронологическая сортировка сообщений,
 * сжатие и прикрепление скриншотов через Canvas/FileReader, полноэкранный просмотр.
 *
 * @exports
 * - window.currentOpenBugId — ID текущего открытого тикета в диалоге разработчика
 * - window.crmChatActiveBase64 — Base64-данные прикрепленного скриншота
 * - window.crmOnChatFileSelected(event) — загрузка и сжатие выбранного изображения
 * - window.crmClearChatImage() — сброс прикрепленного скриншота и превью
 * - window.openFullImage(src) — открытие скриншота в модальном окне во весь экран
 * - window.renderCrmChatTimeline(bug) — хронологический рендер сообщений чата тикета
 * - window.crmSendOperatorMessage() — отправка ответа оператора с синхронизацией в Cloud
 */

if (window.currentOpenBugId === undefined) {
  window.currentOpenBugId = null;
}
window.crmChatActiveBase64 = null;

// Утилиты работы со скриншотами и полноэкранным просмотром
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

window.openFullImage = function (src) {
  if (!src) return;
  window.open(src, "_blank");
};

// Рендеринг ленты сообщений
function renderCrmChatTimeline(bug) {
  const area = document.getElementById("crmChatMessagesArea");
  if (!area) return;
  area.innerHTML = "";

  const msgs = Array.isArray(bug.messages) ? bug.messages : [];
  if (msgs.length === 0 && bug.text) {
    msgs.push({
      id: "m_init",
      author: "katya",
      text: bug.text,
      image: bug.image || null,
      time: bug.date ? bug.date.split(",")[1] || "" : "",
      timestamp: bug.date ? Date.parse(bug.date) || 0 : 0
    });
  }

  msgs.forEach(msg => {
    const isAlex = msg.author === "alex";
    const bubble = document.createElement("div");
    bubble.className = `flex flex-col ${isAlex ? "items-end" : "items-start"} gap-1 w-full`;

    const safeText = typeof window.escapeHtml === "function" ? window.escapeHtml(msg.text) : (msg.text || "");
    const safeTime = msg.time ? "• " + (typeof window.escapeHtml === "function" ? window.escapeHtml(msg.time) : msg.time) : "";
    const authorLabel = isAlex ? "Алексей (Вы)" : "Катя";

    const card = document.createElement("div");
    card.className = `max-w-[80%] rounded-2xl ${isAlex ? 'bg-amber-400 text-black font-medium rounded-tr-sm shadow-md' : 'bg-[#1b1d30] border border-white/10 text-gray-100 rounded-tl-sm shadow'} p-3 text-xs`;

    card.innerHTML = `
      <div class="text-[9px] font-mono opacity-60 mb-0.5">${authorLabel} ${safeTime}</div>
      <div class="whitespace-pre-wrap leading-relaxed select-text">${safeText}</div>
    `;

    if (msg.image) {
      const imgEl = document.createElement("img");
      imgEl.src = msg.image;
      imgEl.className = "max-h-36 rounded-xl border border-white/10 cursor-pointer object-contain mt-1";
      imgEl.onclick = () => {
        if (typeof window.openFullImage === "function") {
          window.openFullImage(msg.image);
        }
      };
      card.appendChild(imgEl);
    }

    bubble.appendChild(card);
    area.appendChild(bubble);
  });

  setTimeout(() => {
    area.scrollTop = area.scrollHeight;
  }, 30);
}
window.renderCrmChatTimeline = renderCrmChatTimeline;

// Безопасная отправка сообщения оператора с глубоким слиянием (Deep Merge) по ID
window.crmSendOperatorMessage = async function () {
  const input = document.getElementById("crmChatTextInput");
  const text = input ? input.value.trim() : "";
  const img = window.crmChatActiveBase64;
  const bugId = window.currentOpenBugId;

  if (!text && !img) return;

  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const now = Date.now();
  
  const newMsg = {
    id: "msg_alex_" + now + "_" + Math.random().toString(36).substring(2, 5),
    author: "alex",
    text: text,
    image: img || null,
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    timestamp: now
  };

  try {
    // 1. Сначала скачиваем актуальное состояние из облака
    const cloudRoot = await fetchCloudData();
    if (!cloudRoot) return;

    if (!cloudRoot[targetUser]) cloudRoot[targetUser] = {};
    if (!Array.isArray(cloudRoot[targetUser].feedback)) cloudRoot[targetUser].feedback = [];

    let cloudList = cloudRoot[targetUser].feedback;
    let cloudBug = cloudList.find(b => b.id === bugId);

    if (!cloudBug) {
      // Если тикета нет в облаке, берем его из локального состояния или хранилища
      const localList = window.currentCloudData?.[targetUser]?.feedback || 
        (typeof window.readStorage === "function" ? window.readStorage("katya_master_feedback", []) : []);
      cloudBug = localList.find(b => b.id === bugId);
      if (cloudBug) cloudList.push(cloudBug);
    }

    if (cloudBug) {
      if (!Array.isArray(cloudBug.messages)) cloudBug.messages = [];
      
      // Сливаем старые сообщения с новым по уникальному ID, исключая дубли
      const msgMap = new Map();
      cloudBug.messages.forEach(m => { if (m && m.id) msgMap.set(m.id, m); });
      msgMap.set(newMsg.id, newMsg); // добавляем наше свежее сообщение

      // Хронологическая сортировка (по timestamp или дате создания)
      cloudBug.messages = Array.from(msgMap.values()).sort((a, b) => {
        const tA = a.timestamp || (a.id === "m_init" ? 0 : parseInt((a.id || "").match(/\d{10,}/)?.[0] || 0, 10));
        const tB = b.timestamp || (b.id === "m_init" ? 0 : parseInt((b.id || "").match(/\d{10,}/)?.[0] || 0, 10));
        return tA - tB;
      });
    }

    window.currentCloudData = cloudRoot;

    // 2. Отправляем обратно в JSONBin
    await saveCloud();

    // 3. Чистим поле ввода и мгновенно обновляем интерфейс
    if (input) input.value = "";
    window.crmClearChatImage();
    if (cloudBug) renderCrmChatTimeline(cloudBug);

  } catch (e) {
    console.error("[Chat] Operator send error:", e);
  }
};

// Отправка по Enter
document.getElementById("crmChatTextInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    window.crmSendOperatorMessage();
  }
});

// Фоновый опрос для синхронизации чата каждые 10 секунд с защитой от наложения и неактивных вкладок
let isPolling = false;
setInterval(async () => {
  if (document.hidden || document.visibilityState !== "visible") return;
  if (!window.currentOpenBugId || isPolling) return;
  
  isPolling = true;
  try {
    const cloudRoot = typeof fetchCloudData === "function" ? await fetchCloudData() : null;
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
      renderCrmChatTimeline(targetBug);
    }
  } catch (e) {
  } finally {
    isPolling = false;
  }
}, 10000);