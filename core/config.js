/**
 * @fileoverview LEX LABS ENTERPRISE: CORE CONFIGURATION
 * @module core/config
 * 
 * @description
 * Централизованные константы системы: ключи доступа к Cloud API (JSONBin),
 * PIN-коды авторизации операторов Support Desk, сессионные ключи, версии и лимиты.
 */

// Сетевой транспорт JSONBin Cloud
var JSONBIN_BIN_ID = "6acb3d30ac6210605a272eb6";
var JSONBIN_API_KEY = "$2a$10$JBnAcYGGmJL6Q5lDn45nHeW4jsBStn1Z/4XRrRormnfaKG7YbqUN2";

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
var APP_VERSION = "2.8.1";
var APP_BUILD = 281;

// Финансовые и макроэкономические лимиты
var IRL_BUDGET_LIMIT = 5000; // Месячный лимит реальных рублей на подарки

// Экспорт в глобальный контекст window
window.JSONBIN_BIN_ID = JSONBIN_BIN_ID;
window.JSONBIN_API_KEY = JSONBIN_API_KEY;
window.DASHBOARD_PIN = DASHBOARD_PIN;
window.EMPLOYEE_PINS = EMPLOYEE_PINS;
window.SESSION_AUTH_KEY = SESSION_AUTH_KEY;
window.SESSION_OPERATOR_KEY = SESSION_OPERATOR_KEY;
window.DASHBOARD_VERSION = APP_VERSION;
window.DASHBOARD_BUILD = APP_BUILD;
window.APP_VERSION = APP_VERSION;
window.APP_BUILD = APP_BUILD;
window.IRL_BUDGET_LIMIT = IRL_BUDGET_LIMIT;
