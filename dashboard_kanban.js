/* =========================================================================
 * LEX LABS ENTERPRISE: KANBAN & BUG TRACKER MODULE
 * Файл: dashboard_kanban.js
 * ========================================================================= */

window.activeTimerInterval = null;
window.timerRunning = false;

function getFeedbackStorageKey(user) {
  return user && user !== "katya" ? `${user}_master_feedback` : "katya_master_feedback";
}

function getFeedbackList(userRecord, targetUser) {
  if (Array.isArray(userRecord?.feedback)) return userRecord.feedback;
  const key = getFeedbackStorageKey(targetUser);
  if (typeof window.readStorage === "function") {
    const list = window.readStorage(key, null);
    if (Array.isArray(list)) return list;
    if (key !== "katya_master_feedback") {
      const fallbackList = window.readStorage("katya_master_feedback", []);
      if (Array.isArray(fallbackList)) return fallbackList;
    }
  }
  return [];
}

window.closeBugDetailModal = function () {
  if (window.activeTimerInterval) {
    clearInterval(window.activeTimerInterval);
    window.activeTimerInterval = null;
  }
  window.timerRunning = false;
  document.getElementById("modalBugDetail")?.classList.add("hidden");
};

window.renderKanbanBoard = function () {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  const list = getFeedbackList(userRecord, targetUser);

  const colInbox = document.getElementById("colInbox");
  const colInProgress = document.getElementById("colInProgress");
  const colTesting = document.getElementById("colTesting");
  const colDone = document.getElementById("colDone");
  if (!colInbox || !colInProgress || !colTesting || !colDone) return;

  colInbox.innerHTML = "";
  colInProgress.innerHTML = "";
  colTesting.innerHTML = "";
  colDone.innerHTML = "";

  let counts = { inbox: 0, in_progress: 0, testing: 0, done: 0 };

  list.forEach((item) => {
    if (!item.category?.includes("Баг")) return;
    if (!item.id) item.id = "bug_" + (item.date ? Date.parse(item.date) || Date.now() : Date.now());

    const status = item.status || "inbox";
    if (counts[status] !== undefined) counts[status]++;

    const isUnread = item.isRead === false || item.isRead === undefined;
    const timeSpentSec = item.timeSpentSec || 0;
    const timeStr = formatSecondsToHms(timeSpentSec);

    const card = document.createElement("div");
    card.className = `bg-[#18192a] border ${isUnread ? "border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]" : "border-[#2e304f]"} hover:border-pink-500 rounded-2xl p-2.5 flex flex-col gap-1.5 shadow transition cursor-pointer relative active:scale-98`;
    
    card.onclick = () => window.openBugDetailModal(item.id);

    const safeText = typeof window.escapeHtml === "function" ? window.escapeHtml(item.text) : escapeHtml(item.text);

    card.innerHTML = `
      <div class="flex justify-between items-center text-[10px]">
        <div class="flex items-center gap-1.5">
          ${isUnread ? '<span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>' : ''}
          <span class="text-amber-400 font-bold">${"★".repeat(item.rating || 5)}</span>
        </div>
        <span class="text-gray-500 font-mono text-[9px]">${item.date ? item.date.split(",")[1] || item.date : ""}</span>
      </div>
      <p class="text-xs text-gray-200 line-clamp-2 leading-tight font-sans">${safeText}</p>
      <div class="flex justify-between items-center text-[10px] text-gray-400 pt-1 border-t border-white/5 mt-0.5">
        <span class="flex items-center gap-1 font-mono text-amber-300"><span>⏱️</span> <span>${timeStr}</span></span>
        <div class="flex items-center gap-1">
          ${item.image ? '<span title="Прикреплен скриншот">📷</span>' : ''}
          ${item.techLogs ? '<span title="Есть логи сбоя">🛠️</span>' : ''}
          ${item.status === "done" ? '<span class="text-emerald-400 font-bold">✓ Закрыт</span>' : ''}
        </div>
      </div>
    `;

    if (status === "done") colDone.appendChild(card);
    else if (status === "testing") colTesting.appendChild(card);
    else if (status === "in_progress") colInProgress.appendChild(card);
    else colInbox.appendChild(card);
  });

  document.getElementById("countInbox").innerText = counts.inbox;
  document.getElementById("countInProgress").innerText = counts.in_progress;
  document.getElementById("countTesting").innerText = counts.testing;
  document.getElementById("countDone").innerText = counts.done;

  window.updateDevStats(list);
  if (typeof window.updateUnreadBadges === "function") {
    window.updateUnreadBadges();
  }
};

window.openBugDetailModal = function (bugId) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  let list = getFeedbackList(userRecord, targetUser);
  
  const bug = list.find(b => b.id === bugId);
  if (!bug) return;

  window.currentOpenBugId = bugId;
  if (bug.isRead !== true) {
    bug.isRead = true;
    saveFeedbackListToCloud(list);
  }

  document.getElementById("detailTicketIdLabel").innerText = `ТИКЕТ #${String(bug.id).slice(-6)}`;
  document.getElementById("detailTicketTextPreview").innerText = bug.text || "Без описания";
  document.getElementById("detailPetInfo").innerText = `${bug.petName || "Зефирка"} (Ур. ${bug.petLevel || 1})`;
  document.getElementById("detailCoinsInfo").innerText = `${bug.coins || 0} 🪙`;
  document.getElementById("detailScreenInfo").innerText = bug.techLogs?.screen || "390x728";
  document.getElementById("detailStatusSelect").value = bug.status || "inbox";
  document.getElementById("detailDevReportInput").value = bug.devReport || "";

  const btnLogs = document.getElementById("btnDetailOpenLogs");
  if (btnLogs) {
    if (bug.techLogs) {
      btnLogs.classList.remove("hidden");
      btnLogs.onclick = () => {
        if (typeof window.viewTechLogsById === "function") {
          window.viewTechLogsById(bugId);
        }
      };
    } else {
      btnLogs.classList.add("hidden");
    }
  }

  if (typeof window.renderCrmChatTimeline === "function") {
    window.renderCrmChatTimeline(bug);
  }

  clearInterval(window.activeTimerInterval);
  window.timerRunning = false;
  const btnTimer = document.getElementById("btnTimerToggle");
  if (btnTimer) btnTimer.innerText = "▶ Старт";
  updateTimerDisplay(bug.timeSpentSec || 0);

  const modalEl = document.getElementById("modalBugDetail");
  if (modalEl) {
    modalEl.classList.remove("hidden");
    const closeBtn = modalEl.querySelector("header button:last-child");
    if (closeBtn) {
      closeBtn.onclick = () => window.closeBugDetailModal();
    }
  }
};

window.toggleBugTimer = function () {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  let list = getFeedbackList(userRecord, targetUser);
  const bug = list.find(b => b.id === window.currentOpenBugId);
  if (!bug) return;

  const btn = document.getElementById("btnTimerToggle");
  if (!window.timerRunning) {
    window.timerRunning = true;
    if (btn) {
      btn.innerText = "⏸ Пауза";
      btn.className = "py-1.5 px-3 rounded-xl bg-rose-500 text-white font-black text-xs active:scale-95 transition cursor-pointer";
    }
    window.activeTimerInterval = setInterval(() => {
      bug.timeSpentSec = (bug.timeSpentSec || 0) + 1;
      updateTimerDisplay(bug.timeSpentSec);
    }, 1000);
  } else {
    window.timerRunning = false;
    clearInterval(window.activeTimerInterval);
    if (btn) {
      btn.innerText = "▶ Продолжить";
      btn.className = "py-1.5 px-3 rounded-xl bg-amber-500 text-black font-black text-xs active:scale-95 transition cursor-pointer";
    }
    saveFeedbackListToCloud(list);
  }
};

window.addManualMinutes = function (mins) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  let list = getFeedbackList(userRecord, targetUser);
  const bug = list.find(b => b.id === window.currentOpenBugId);
  if (!bug) return;

  bug.timeSpentSec = (bug.timeSpentSec || 0) + mins * 60;
  updateTimerDisplay(bug.timeSpentSec);
  saveFeedbackListToCloud(list);
};

function updateTimerDisplay(totalSec) {
  const el = document.getElementById("detailTimerDisplay");
  if (el) el.innerText = formatSecondsToHms(totalSec);
}

function formatSecondsToHms(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
}

window.updateDevStats = function (list) {
  if (!Array.isArray(list)) return;
  let totalSec = 0;
  let resolvedCount = 0;

  list.forEach(item => {
    if (item.category?.includes("Баг")) {
      totalSec += (item.timeSpentSec || 0);
      if (item.status === "done") resolvedCount++;
    }
  });

  const totalHours = Math.floor(totalSec / 3600);
  const totalMins = Math.floor((totalSec % 3600) / 60);
  const avgMins = resolvedCount > 0 ? Math.round((totalSec / 60) / resolvedCount) : 0;

  const elTotalTime = document.getElementById("devTotalTimeSpent");
  const elResolved = document.getElementById("devResolvedBugsCount");
  const elAvg = document.getElementById("devAvgFixTime");

  if (elTotalTime) elTotalTime.innerText = `${totalHours} ч ${totalMins} мин`;
  if (elResolved) elResolved.innerText = `${resolvedCount} шт`;
  if (elAvg) elAvg.innerText = `${avgMins} мин`;
};

async function saveFeedbackListToCloud(list) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  if (!window.currentCloudData || typeof window.currentCloudData !== "object") {
    window.currentCloudData = {};
  }
  if (!window.currentCloudData[targetUser]) {
    window.currentCloudData[targetUser] = {};
  }
  window.currentCloudData[targetUser].feedback = list;
  
  const storageKey = getFeedbackStorageKey(targetUser);
  try {
    localStorage.setItem(storageKey, JSON.stringify(list));
    if (targetUser === "katya") {
      localStorage.setItem("katya_master_feedback", JSON.stringify(list));
    }
  } catch (e) {}

  if (typeof window.saveCloud === "function") {
    await window.saveCloud();
  }
}
window.saveFeedbackListToCloud = saveFeedbackListToCloud;

function generateHumanFixReport(bug) {
  const userText = (bug.text || "").toLowerCase();
  const errorMsg = (bug.techLogs?.lastError?.message || "").toLowerCase();

  let humanTitle = "Инцидент успешно разрешён";
  let humanMessage = "";

  if (userText.includes("монет") || errorMsg.includes("coins") || errorMsg.includes("remoteuser")) {
    humanTitle = "Сбой баланса и начисления монет исправлен";
    humanMessage = "Ты поймала очень хитрый баг синхронизации: сервер иногда не успевал подтверждать входящий баланс и замораживал обновление кошелька. Я полностью переписал цепочку сверки данных, добавил надёжный мост и начислил тебе заслуженную компенсацию!";
  } else if (userText.includes("не нажима") || userText.includes("не тыка") || userText.includes("кнопк") || errorMsg.includes("not defined")) {
    humanTitle = "Блокировка нажатия кнопок снята";
    humanMessage = "Проблема была в конфликте событий экрана: слой анимации перехватывал клики раньше времени, из-за чего кнопки переставали реагировать на пальчик. Я освободил все обработчики, убрал наложение слоёв, теперь всё нажимается идеально мягко!";
  } else if (errorMsg.includes("fetch") || errorMsg.includes("network") || userText.includes("завис") || userText.includes("не груз")) {
    humanTitle = "Связь с сервером восстановлена";
    humanMessage = "Облачный шлюз иногда сбрасывал сетевой пакет при нестабильном сигнале. Я настроил защитный буфер и фоновый повтор отправки, так что больше игра виснуть не будет.";
  } else if (userText.includes("рулетк") || userText.includes("игр") || userText.includes("тетрис") || userText.includes("раннер")) {
    humanTitle = "Игровой модуль починен и оптимизирован";
    humanMessage = "В физике мини-игры происходил микро-сбой таймера кадров. Я обновил скрипт, оптимизировал отрисовку и сделал так, чтобы награды падали на счёт мгновенно.";
  } else {
    humanTitle = "Дефект кода локализован и устранён";
    humanMessage = "Спасибо за твою чуткость и внимательность! Я нашёл неточность в коде скрипта, которая вызывала эту заминку, полностью вычистил ошибку и перепроверил логи. Теперь всё летает как часы!";
  }
  return { humanTitle, humanMessage };
}

window.saveBugDetailModal = async function () {
  const saveBtn = document.getElementById("btnSaveBugDetail");
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerText = "СОХРАНЕНИЕ... ⏳";
  }

  try {
    const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
    if (!window.currentCloudData || typeof window.currentCloudData !== "object") {
      window.currentCloudData = {};
    }
    if (!window.currentCloudData[targetUser]) {
      window.currentCloudData[targetUser] = {};
    }
    const userRecord = window.currentCloudData[targetUser];
    let list = getFeedbackList(userRecord, targetUser);

    const bug = list.find(b => b.id === window.currentOpenBugId);
    if (!bug) {
      window.closeBugDetailModal();
      return;
    }

    const newStatus = document.getElementById("detailStatusSelect")?.value || "inbox";
    const devReport = document.getElementById("detailDevReportInput")?.value.trim() || "";

    bug.devReport = devReport;
    bug.status = newStatus;

    if (window.activeTimerInterval) {
      clearInterval(window.activeTimerInterval);
      window.activeTimerInterval = null;
    }
    window.timerRunning = false;

    // Регистрация закрытия бага и начисление бонуса
    if (newStatus === "done" && !bug.rewardGranted) {
      const rewardStr = prompt("Баг закрыт! Сумма компенсации игроку в монетах:", "35");
      if (rewardStr !== null) {
        const coinsAmount = parseInt(rewardStr, 10) || 0;
        bug.rewardGranted = true;
        bug.rewardAmount = coinsAmount;
        bug.resolvedAt = new Date().toLocaleString("ru-RU");

        const generated = generateHumanFixReport(bug);
        const finalReportText = devReport || generated.humanMessage;

        if (!Array.isArray(userRecord.rewardNotifications)) userRecord.rewardNotifications = [];
        userRecord.rewardNotifications.push({
          id: "fix_" + Date.now(),
          bugId: bug.id,
          humanTitle: generated.humanTitle,
          humanMessage: finalReportText,
          devReport: finalReportText,
          coins: coinsAmount,
          date: new Date().toLocaleString("ru-RU"),
          claimed: false
        });

        if (coinsAmount > 0) {
          if (!userRecord.pet) userRecord.pet = {};
          userRecord.pet.coins = (userRecord.pet.coins || 0) + coinsAmount;
        }

        // Проводка в Changelog
        if (!Array.isArray(userRecord.devChangelog)) userRecord.devChangelog = [];
        userRecord.devChangelog.unshift({
          bugId: bug.id,
          title: (bug.text || "").substring(0, 50),
          timeSpentSec: bug.timeSpentSec || 0,
          devReport: devReport,
          resolvedAt: bug.resolvedAt
        });

        // Проводка в аудит
        if (!Array.isArray(userRecord.audit)) userRecord.audit = [];
        userRecord.audit.push({
          text: `[FIX] Закрыт баг #${bug.id} (+${coinsAmount} 🪙 компенсация)`,
          icon: "🛠️",
          date: new Date().toLocaleDateString("ru-RU"),
          time: new Date().toLocaleTimeString("ru-RU"),
          timestamp: Date.now()
        });
      }
    }

    await saveFeedbackListToCloud(list);

  } catch (err) {
    console.error("Ошибка сохранения задачи:", err);
  } finally {
    window.closeBugDetailModal();
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerText = "💾 СОХРАНИТЬ И ЗАВЕРШИТЬ РЕШЕНИЕ";
    }
    if (typeof window.renderKanbanBoard === "function") {
      window.renderKanbanBoard();
    }
  }
};

function escapeHtml(str) {
  if (typeof window.escapeHtml === "function") return window.escapeHtml(str);
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
if (typeof window.escapeHtml !== "function") {
  window.escapeHtml = escapeHtml;
}

window.copyAiDebugPromptById = function (bugId) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  const list = getFeedbackList(userRecord, targetUser);
  const item = list.find(b => b.id === bugId);
  if (!item) return;

  const logs = item.techLogs || {};
  let errorBlock = "Ошибок не зафиксировано";
  if (logs.lastError) {
    errorBlock = `Сообщение: ${logs.lastError.message || ""}\nФайл: ${logs.lastError.filename || "неизвестно"}\nСтрока: ${logs.lastError.lineno ?? "?"}\nСтек:\n${logs.lastError.stack || ""}`;
  }

  let consoleBlock = "Пусто";
  if (Array.isArray(logs.consoleHistory) && logs.consoleHistory.length > 0) {
    consoleBlock = logs.consoleHistory.map(l => `[${l?.time || ""} ${l?.level || ""}] ${l?.msg || ""}`).join("\n");
  }

  let chatBlock = "Только стартовое обращение:\nКатя: " + (item.text || "Без описания");
  if (Array.isArray(item.messages) && item.messages.length > 0) {
    chatBlock = item.messages.map(m => `[${m?.time || ""}] ${m?.author === "katya" ? "Катя" : "Алексей"}: ${m?.text || ""}`).join("\n");
  }

  const promptText = 
"Привет! В моем проекте Тамагочи обнаружен баг. Помоги проанализировать и написать готовое решение.\n\n" +
"### Контекст:\n" +
"- Тикет: #" + String(item.id || "").slice(-6) + " (" + (item.category || "Баг") + ")\n" +
"- Состояние: " + (item.petName || "Зефирка") + ", уровень " + (item.petLevel || 1) + ", баланс: " + (item.coins || 0) + " 🪙\n" +
"- Экран: " + (logs.screen || "Неизвестно") + "\n\n" +
"### Диалог в тикете:\n" +
"```\n" + chatBlock + "\n```\n\n" +
"### Ошибка:\n" +
"```\n" + errorBlock + "\n```\n\n" +
"### Консоль:\n" +
"```\n" + consoleBlock + "\n```";

  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    navigator.clipboard.writeText(promptText).then(() => {
      alert("🤖 Промт с полной историей чата скопирован в буфер обмена!");
    }).catch(() => {
      prompt("Скопируй промт:", promptText);
    });
  } else {
    prompt("Скопируй промт:", promptText);
  }
};

window.viewTechLogsById = function (bugId) {
  const targetUser = document.getElementById("targetPlayerSelect")?.value || "katya";
  const userRecord = window.currentCloudData?.[targetUser] || {};
  const list = getFeedbackList(userRecord, targetUser);
  const item = list.find(b => b.id === bugId);
  if (!item || !item.techLogs) return;

  const logs = item.techLogs;
  const safeEscape = typeof window.escapeHtml === "function" ? window.escapeHtml : escapeHtml;

  let modal = document.getElementById("modalTechLogsViewer");
  let content = document.getElementById("techLogsContent");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modalTechLogsViewer";
    modal.className = "fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none";
    modal.innerHTML = `
      <div class="w-full max-w-2xl bg-[#0e0f1a] border border-[#2e304f] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh]">
        <div class="flex justify-between items-center border-b border-white/5 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🛠️</span>
            <h3 class="font-bold text-sm text-gray-100">Технический стек и логи сбоя</h3>
          </div>
          <button type="button" onclick="document.getElementById('modalTechLogsViewer').classList.add('hidden')" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer">✕</button>
        </div>
        <div id="techLogsContent" class="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-1"></div>
        <div class="pt-2 border-t border-white/5 flex justify-end">
          <button type="button" onclick="document.getElementById('modalTechLogsViewer').classList.add('hidden')" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-bold transition cursor-pointer">Закрыть</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    content = document.getElementById("techLogsContent");
  }

  if (!content) return;

  let html = `
    <div class="p-2.5 rounded-xl bg-[#141526] border border-[#2e304f] space-y-1">
      <div><b>User-Agent:</b> <span class="text-gray-400">${safeEscape(logs.userAgent || "N/A")}</span></div>
      <div><b>Экран:</b> <span class="text-amber-300 font-bold">${safeEscape(logs.screen || "N/A")}</span></div>
    </div>
  `;

  if (logs.lastError) {
    html += `
      <div class="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300">
        <div class="font-bold flex items-center gap-1.5 text-rose-400">🚨 Критический сбой скрипта:</div>
        <div class="mt-1 font-sans text-xs">${safeEscape(logs.lastError.message || "Неизвестная ошибка")}</div>
        <div class="text-[10px] text-gray-400 mt-1">Файл: <b>${safeEscape(logs.lastError.filename || "N/A")}</b>, строка: <b>${logs.lastError.lineno ?? "N/A"}</b></div>
        ${logs.lastError.stack ? `<pre class="mt-1.5 text-[9px] text-rose-200/70 overflow-x-auto whitespace-pre-wrap bg-black/40 p-2 rounded-lg border border-rose-500/20">${safeEscape(logs.lastError.stack)}</pre>` : ""}
      </div>
    `;
  }

  if (Array.isArray(logs.consoleHistory) && logs.consoleHistory.length > 0) {
    html += `<div class="font-bold text-gray-400 pt-1">Хронология консоли (${logs.consoleHistory.length}):</div>`;
    logs.consoleHistory.forEach(l => {
      const isError = l?.level === "ERROR" || l?.level === "FATAL";
      const color = isError ? "text-rose-400" : "text-amber-400";
      html += `
        <div class="text-[11px] p-2 rounded-lg bg-[#0e0f1a] border border-white/5 flex gap-2 items-start">
          <span class="text-gray-500 font-bold flex-shrink-0">${safeEscape(l?.time || "")}</span>
          <span class="${color} font-bold flex-shrink-0">[${safeEscape(l?.level || "INFO")}]</span>
          <span class="text-gray-300 break-all">${safeEscape(l?.msg || "")}</span>
        </div>
      `;
    });
  }

  content.innerHTML = html;
  modal.classList.remove("hidden");
};
