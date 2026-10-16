/**
 * @fileoverview LEX LABS ENTERPRISE: CORE UTILITIES
 * @module core/utils
 * 
 * @description
 * Централизованные базовые утилиты: XSS-санитайзинг, форматирование дат,
 * форматирование валют и чисел, генерация криптостойких и уникальных идентификаторов.
 */

/**
 * Канонический XSS-санитайзер HTML.
 * Защищает от инъекций разметки при интерполяции строк в innerHTML.
 * @param {string|null|undefined} str - Исходная строка
 * @returns {string} Экранированная безопасная строка
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Форматирование даты в локализованный вид (ДД.ММ.ГГГГ)
 * @param {Date|number|string} date - Дата
 * @param {Intl.DateTimeFormatOptions} [options] - Опции форматирования
 * @returns {string}
 */
function formatDate(date, options) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString("ru-RU", options || { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Форматирование времени (ЧЧ:ММ)
 * @param {Date|number|string} date - Дата/время
 * @param {Intl.DateTimeFormatOptions} [options] - Опции форматирования
 * @returns {string}
 */
function formatTime(date, options) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ru-RU", options || { hour: "2-digit", minute: "2-digit" });
}

/**
 * Форматирование даты и времени (ДД.ММ.ГГГГ ЧЧ:ММ)
 * @param {Date|number|string} date - Дата
 * @returns {string}
 */
function formatDateTime(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return `${formatDate(d)} ${formatTime(d)}`;
}

/**
 * Форматирование секунд в формат Ч:ММ:СС или М:СС
 * @param {number} sec - Количество секунд
 * @returns {string}
 */
function formatSecondsToHms(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs} ч ${mins.toString().padStart(2, "0")} мин`;
  }
  return `${mins} мин ${secs.toString().padStart(2, "0")} сек`;
}

/**
 * Форматирование игровых монет (1 250 🪙)
 * @param {number} amount - Количество монет
 * @param {string} [currency='🪙'] - Символ валюты
 * @returns {string}
 */
function formatCurrency(amount, currency = "🪙") {
  const num = Math.round(Number(amount) || 0);
  return `${num.toLocaleString("ru-RU")} ${currency}`;
}

/**
 * Форматирование реальных рублей (5 000 ₽)
 * @param {number} amount - Сумма в рублях
 * @returns {string}
 */
function formatRubles(amount) {
  const num = Math.round(Number(amount) || 0);
  return `${num.toLocaleString("ru-RU")} ₽`;
}

/**
 * Генератор уникальных ID с префиксом и временным отпечатком
 * @param {string} [prefix='id'] - Префикс сущности (например 'ticket', 'bug', 'wish')
 * @returns {string} Уникальный идентификатор
 */
function generateId(prefix = "id") {
  const rnd = Math.random().toString(36).substring(2, 9);
  const ts = Date.now().toString(36);
  return `${prefix ? prefix + "-" : ""}${ts}-${rnd}`;
}

// Экспорт в глобальный контекст window
window.escapeHtml = escapeHtml;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.formatDateTime = formatDateTime;
window.formatSecondsToHms = formatSecondsToHms;
window.formatCurrency = formatCurrency;
window.formatRubles = formatRubles;
window.generateId = generateId;
