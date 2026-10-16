/**
 * @fileoverview LEX LABS ENTERPRISE: STORAGE LAYER
 * @module core/storage
 * 
 * @description
 * Централизованный отказоустойчивый слой работы с локальным хранилищем (LocalStorage).
 * Предотвращает необработанные исключения (QuotaExceededError, синтаксический брак JSON).
 */

/**
 * Безопасный парсинг JSON-строки с возвратом значения по умолчанию при сбое
 * @param {string|any} str - Строка для парсинга
 * @param {any} fallback - Значение по умолчанию
 * @returns {any}
 */
function safeParseJSON(str, fallback) {
  if (typeof str !== "string") {
    if (str !== null && str !== undefined && typeof str === "object") return str;
    return fallback;
  }
  try {
    const val = JSON.parse(str);
    return val !== null && val !== undefined ? val : fallback;
  } catch (e) {
    return fallback;
  }
}

/**
 * Безопасное чтение ключа из LocalStorage
 * @param {string} key - Ключ хранилища
 * @param {any} fallback - Значение при отсутствии ключа или повреждении
 * @returns {any}
 */
function readStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined || item === "") return fallback;
    return safeParseJSON(item, fallback);
  } catch (e) {
    console.warn(`[Storage] Ошибка чтения ключа "${key}":`, e);
    return fallback;
  }
}

/**
 * Безопасная запись ключа в LocalStorage с защитой от переполнения квоты (QuotaExceededError)
 * @param {string} key - Ключ хранилища
 * @param {any} value - Значение (будет автоматически сериализовано в JSON, если не строка)
 * @returns {boolean} true при успешной записи, false при сбое
 */
function writeStorage(key, value) {
  try {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (e) {
    console.error(`[Storage] Превышена квота или ошибка записи ключа "${key}":`, e);
    // Попытка экстренной очистки временных кэшей для освобождения места
    try {
      localStorage.removeItem("lex_dashboard_temp_cache");
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (_) {
      return false;
    }
  }
}

/**
 * Безопасное удаление ключа из LocalStorage
 * @param {string} key - Ключ для удаления
 * @returns {boolean}
 */
function removeStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.warn(`[Storage] Ошибка удаления ключа "${key}":`, e);
    return false;
  }
}

// Экспорт в глобальный контекст window
window.safeParseJSON = safeParseJSON;
window.readStorage = readStorage;
window.writeStorage = writeStorage;
window.removeStorage = removeStorage;
