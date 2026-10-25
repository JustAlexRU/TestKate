/**
 * @fileoverview LEX LABS ENTERPRISE: CORE CONFIGURATION
 * @module core/config
 * 
 * @description
 * Централизованные константы системы: ключи доступа к Cloud API (JSONBin),
 * Circuit Breaker / Quota Guard, PIN-коды авторизации операторов Support Desk,
 * сессионные ключи, версии и лимиты.
 */

// Сетевой транспорт JSONBin Cloud с поддержкой переопределения и квота-контроля
var CUSTOM_BIN_ID = null;
var CUSTOM_API_KEY = null;
try {
  CUSTOM_BIN_ID = localStorage.getItem("lex_custom_jsonbin_bin_id");
  CUSTOM_API_KEY = localStorage.getItem("lex_custom_jsonbin_api_key");
} catch (_) {}

var DEFAULT_JSONBIN_BIN_ID = "6acb3d30ac6210605a272eb6";
var DEFAULT_JSONBIN_API_KEY = "$2a$10$JBnAcYGGmJL6Q5lDn45nHeW4jsBStn1Z/4XRrRormnfaKG7YbqUN2";

var JSONBIN_BIN_ID = (CUSTOM_BIN_ID && CUSTOM_BIN_ID.trim()) ? CUSTOM_BIN_ID.trim() : DEFAULT_JSONBIN_BIN_ID;
var JSONBIN_API_KEY = (CUSTOM_API_KEY && CUSTOM_API_KEY.trim()) ? CUSTOM_API_KEY.trim() : DEFAULT_JSONBIN_API_KEY;

// Состояние Circuit Breaker / Quota Guard (защита от сетевого спама при HTTP 403 / 429)
var CLOUD_QUOTA_EXHAUSTED = false;
try {
  CLOUD_QUOTA_EXHAUSTED = (localStorage.getItem("lex_cloud_quota_exhausted") === "true");
} catch (_) {}

/**
 * Установка пользовательских ключей доступа к JSONBin Cloud
 * @param {string} binId
 * @param {string} apiKey
 */
function setCloudCredentials(binId, apiKey) {
  try {
    if (binId && binId.trim()) {
      localStorage.setItem("lex_custom_jsonbin_bin_id", binId.trim());
      window.JSONBIN_BIN_ID = binId.trim();
    }
    if (apiKey && apiKey.trim()) {
      localStorage.setItem("lex_custom_jsonbin_api_key", apiKey.trim());
      window.JSONBIN_API_KEY = apiKey.trim();
    }
    localStorage.removeItem("lex_cloud_quota_exhausted");
    window.CLOUD_QUOTA_EXHAUSTED = false;
  } catch (e) {
    console.error("[Config] Failed to set cloud credentials:", e);
  }
}

/**
 * Сброс ключей доступа к дефолтным системным значениям
 */
function resetCloudCredentials() {
  try {
    localStorage.removeItem("lex_custom_jsonbin_bin_id");
    localStorage.removeItem("lex_custom_jsonbin_api_key");
    localStorage.removeItem("lex_cloud_quota_exhausted");
    window.JSONBIN_BIN_ID = DEFAULT_JSONBIN_BIN_ID;
    window.JSONBIN_API_KEY = DEFAULT_JSONBIN_API_KEY;
    window.CLOUD_QUOTA_EXHAUSTED = false;
  } catch (e) {
    console.error("[Config] Failed to reset cloud credentials:", e);
  }
}

// Авторизация операторов Mission Control
var DASHBOARD_PIN = "1703";
var EMPLOYEE_PINS = {
  alex: "1703",       // Алексей (Lead Dev / Architect)
  lead: "1703",
  architect: "1703",
  developer: "1703",
  admin: "1703",
  "алексей": "1703"
};

// Сессионные ключи браузера (sessionStorage)
var SESSION_AUTH_KEY = "lex_dashboard_auth_token";
var SESSION_OPERATOR_KEY = "lex_dashboard_operator";

// Версионирование (Single Source of Truth)
var APP_VERSION = "2.8.2";
var APP_BUILD = 282;

// Финансовые и макроэкономические лимиты
var IRL_BUDGET_LIMIT = 5000; // Месячный лимит реальных рублей на подарки

// Экспорт в глобальный контекст window
window.DEFAULT_JSONBIN_BIN_ID = DEFAULT_JSONBIN_BIN_ID;
window.DEFAULT_JSONBIN_API_KEY = DEFAULT_JSONBIN_API_KEY;
window.JSONBIN_BIN_ID = JSONBIN_BIN_ID;
window.JSONBIN_API_KEY = JSONBIN_API_KEY;
window.CLOUD_QUOTA_EXHAUSTED = CLOUD_QUOTA_EXHAUSTED;
window.setCloudCredentials = setCloudCredentials;
window.resetCloudCredentials = resetCloudCredentials;
window.DASHBOARD_PIN = DASHBOARD_PIN;
window.EMPLOYEE_PINS = EMPLOYEE_PINS;
window.SESSION_AUTH_KEY = SESSION_AUTH_KEY;
window.SESSION_OPERATOR_KEY = SESSION_OPERATOR_KEY;
window.DASHBOARD_VERSION = APP_VERSION;
window.DASHBOARD_BUILD = APP_BUILD;
window.APP_VERSION = APP_VERSION;
window.APP_BUILD = APP_BUILD;
window.IRL_BUDGET_LIMIT = IRL_BUDGET_LIMIT;
