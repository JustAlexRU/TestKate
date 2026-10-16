/**
 * @fileoverview LEX LABS ENTERPRISE: OPERATOR AUTHENTICATION
 * @module admin_modules/admin_auth
 * 
 * @description
 * Авторизация операторов Mission Control (PIN 1703), сессионный токен в sessionStorage,
 * выбор активного сотрудника и блокировка доступа к дешборду до ввода валидного PIN.
 */

/**
 * Проверка статуса авторизации оператора
 */
function checkAuth() {
  const authOverlay = document.getElementById("authOverlay");
  const dashboardContent = document.getElementById("dashboardContent");
  const pinInput = document.getElementById("pinInput");
  const currentOperatorLabel = document.getElementById("currentOperatorLabel");

  const authKey = window.SESSION_AUTH_KEY || "lex_dashboard_auth_token";
  const opKey = window.SESSION_OPERATOR_KEY || "lex_dashboard_operator";

  if (sessionStorage.getItem(authKey) === "authorized") {
    authOverlay?.classList.add("hidden");
    dashboardContent?.classList.remove("hidden");
    if (currentOperatorLabel) {
      currentOperatorLabel.innerText = sessionStorage.getItem(opKey) || "Алексей";
    }
    if (typeof window.renderDashboard === "function") {
      window.renderDashboard();
    }
  } else {
    authOverlay?.classList.remove("hidden");
    dashboardContent?.classList.add("hidden");
    setTimeout(() => pinInput?.focus(), 150);
  }
}
window.checkAuth = checkAuth;

/**
 * Инициализация обработчиков экрана ввода PIN-кода
 */
function initAdminAuth() {
  const btnSubmit = document.getElementById("btnSubmitPin");
  const pinInput = document.getElementById("pinInput");
  const pinError = document.getElementById("pinError");
  const employeeSelect = document.getElementById("employeeSelect");
  const authCard = document.getElementById("authCard");
  const btnLogout = document.getElementById("btnLogout");

  const authKey = window.SESSION_AUTH_KEY || "lex_dashboard_auth_token";
  const opKey = window.SESSION_OPERATOR_KEY || "lex_dashboard_operator";
  const defaultPin = window.DASHBOARD_PIN || "1703";
  const employeePins = window.EMPLOYEE_PINS || { alex: "1703" };

  btnSubmit?.addEventListener("click", () => {
    const enteredPin = pinInput?.value ? pinInput.value.trim() : "";
    const selectedKey = employeeSelect ? employeeSelect.value.trim().toLowerCase() : "alex";
    const selectedText = employeeSelect && employeeSelect.selectedIndex >= 0 ? employeeSelect.options[employeeSelect.selectedIndex].text : "Алексей";
    const expectedPin = employeePins[selectedKey] || defaultPin;

    const isAuthorized = enteredPin.length > 0 && (enteredPin === expectedPin || enteredPin === defaultPin);

    if (isAuthorized) {
      sessionStorage.setItem(authKey, "authorized");
      const opName = selectedText.split(" ")[0] || "Алексей";
      sessionStorage.setItem(opKey, opName);
      if (pinError) pinError.style.opacity = "0";
      checkAuth();
    } else {
      if (pinError) pinError.style.opacity = "1";
      authCard?.classList.add("animate-shake");
      setTimeout(() => authCard?.classList.remove("animate-shake"), 400);
      pinInput?.select();
    }
  });

  pinInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      btnSubmit?.click();
    }
  });

  pinInput?.addEventListener("input", () => {
    if (pinError) pinError.style.opacity = "0";
  });

  btnLogout?.addEventListener("click", () => {
    sessionStorage.removeItem(authKey);
    checkAuth();
  });
}

// Привязка слушателей
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminAuth);
} else {
  initAdminAuth();
}
