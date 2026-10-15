/**
 * @fileoverview LEX LABS ENTERPRISE: DASHBOARD API GATEWAY & DATA UTILS
 * @module admin/dashboard_api
 * 
 * @description
 * Зона ответственности (Single Responsibility):
 * Сетевой шлюз Cloud API (JSONBin), локальный кэш и базовые безопасные утилиты
 * парсинга данных, чтения LocalStorage и санитайзинга HTML-разметки.
 *
 * @exports
 * - window.safeParseJSON(str, fallback) — безопасный парсинг JSON без исключений
 * - window.readStorage(key, fallback) — безопасное чтение LocalStorage с защитой от повреждений
 * - window.escapeHtml(str) — XSS-санитайзер строк перед выводом в innerHTML
 * - window.currentCloudData — глобальное хранилище последнего снимка облачных данных
 * - window.fetchCloudData() — получение актуального снапшота из JSONBin
 * - window.saveCloud(data) — сохранение состояния в JSONBin с проверкой res.ok
 * - window.saveLocal() — экстренное сохранение в локальное хранилище браузера
 * - window.forceManualSync() — принудительная синхронизация стейта по кнопке UI
 */

// Базовые безопасные утилиты хранилища и рендеринга
function safeParseJSON(str, fallback) {
  if (typeof str !== "string") return fallback;
  try {
    const val = JSON.parse(str);
    return val !== null && val !== undefined ? val : fallback;
  } catch (e) {
    return fallback;
  }
}
window.safeParseJSON = safeParseJSON;

function readStorage(key, fallback) {
  try {
    return safeParseJSON(localStorage.getItem(key), fallback);
  } catch (e) {
    return fallback;
  }
}
window.readStorage = readStorage;

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

const JSONBIN_BIN_ID = "6acb3d30ac6210605a272eb6";
const JSONBIN_API_KEY = "$2a$10$JBnAcYGGmJL6Q5lDn45nHeW4jsBStn1Z/4XRrRormnfaKG7YbqUN2";

window.currentCloudData = {};

async function fetchCloudData() {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_API_KEY }
    });
    if (!res.ok) throw new Error("JSONBin network unreachable");
    const cloud = await res.json();
    window.currentCloudData = cloud.record || {};
    return window.currentCloudData;
  } catch (e) {
    console.error("[API] Fetch error:", e);
    return null;
  }
}
window.fetchCloudData = fetchCloudData;

async function saveCloud(data) {
  try {
    const payload = data !== undefined ? data : window.currentCloudData;
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_API_KEY },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`JSONBin network error: ${res.status}`);
    return true;
  } catch (e) {
    console.error("[API] Save error:", e);
    return false;
  }
}
window.saveCloud = saveCloud;