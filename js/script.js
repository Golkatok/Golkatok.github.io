// File: js/script.js
/* eslint-env browser */

/
 * I18n dictionary.
 * Keys must match data-i18n-key values in HTML.
 */
const I18N = {
  ru: {
    menu: "Меню",
    settings: "Настройки",
    home: "Главная",
    social: "Соц. Сети",
    news: "Новости",
    miniGames: "Мини-игры",
    greeting: "Привет {name}!",
    lastVideo: "последний ролик",
    theme: "Тема",
    language: "Язык",
    light: "Светлая",
    dark: "Тёмная",
    system: "Системная",
    save: "Сохранить",
    close: "Закрыть",
    cookieText: "Мы используем файлы cookies, чтобы запомнить вас при повторном входе.",
    cookieAccept: "Принять",
    cookieDecline: "Отклонить",
    loginTitle: "Вход через Telegram",
    logout: "Выйти",
    loggedAs: "Вы вошли как {name}",
  },
  uk: {
    menu: "Меню",
    settings: "Налаштування",
    home: "Головна",
    social: "Соцмережі",
    news: "Новини",
    miniGames: "Міні-ігри",
    greeting: "Привіт, {name}!",
    lastVideo: "останнє відео",
    theme: "Тема",
    language: "Мова",
    light: "Світла",
    dark: "Темна",
    system: "Системна",
    save: "Зберегти",
    close: "Закрити",
    cookieText: "Ми використовуємо файли cookies, щоб запам’ятати вас під час наступного входу.",
    cookieAccept: "Прийняти",
    cookieDecline: "Відхилити",
    loginTitle: "Вхід через Telegram",
    logout: "Вийти",
    loggedAs: "Ви увійшлі як {name}",
  },
  be: {
    menu: "Меню",
    settings: "Налады",
    home: "Галоўная",
    social: "Сац. сеткі",
    news: "Навіны",
    miniGames: "Міні-гульні",
    greeting: "Прывітанне, {name}!",
    lastVideo: "апошняе відэа",
    theme: "Тэма",
    language: "Мова",
    light: "Светлая",
    dark: "Цёмная",
    system: "Сістэмная",
    save: "Захаваць",
    close: "Закрыць",
    cookieText: "Мы выкарыстоўваем cookies, каб запомніць вас пры наступным уваходзе.",
    cookieAccept: "Прыняць",
    cookieDecline: "Адхіліць",
    loginTitle: "Уваход праз Telegram",
    logout: "Выйсці",
    loggedAs: "Вы ўвайшлі як {name}",
  },
  en: {
    menu: "Menu",
    settings: "Settings",
    home: "Home",
    social: "Social",
    news: "News",
    miniGames: "Mini-games",
    greeting: "Hello, {name}!",
    lastVideo: "latest video",
    theme: "Theme",
    language: "Language",
    light: "Light",
    dark: "Dark",
    system: "System",
    save: "Save",
    close: "Close",
    cookieText: "We use cookies to remember you on your next visit.",
    cookieAccept: "Accept",
    cookieDecline: "Decline",
    loginTitle: "Sign in with Telegram",
    logout: "Log out",
    loggedAs: "You are signed in as {name}",
  },
};

/ Storage helpers (respect cookie consent). */
const Storage = (() => {
  const LS = window.localStorage;
  const SS = window.sessionStorage;

  function consentAccepted() {
    return LS.getItem("cookieConsent") === "accepted";
  }

  return {
    set(key, value) {
      const data = JSON.stringify(value);
      if (key === "user" && !consentAccepted()) {
        // Avoid persistent storage without consent
        try { SS.setItem(key, data); } catch {}
        return;
      }
      try { LS.setItem(key, data); } catch {}
    },
    get(key) {
      try {
        const fromLS = localStorage.getItem(key);
        if (fromLS) return JSON.parse(fromLS);
        const fromSS = sessionStorage.getItem(key);
        if (fromSS) return JSON.parse(fromSS);
      } catch {}
      return null;
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch {}
      try { sessionStorage.removeItem(key); } catch {}
    },
  };
})();

/ Apply theme to <html>. */
function applyTheme(pref) {
  let theme = pref;
  if (pref === "system") {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    theme = mq.matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", theme || "light");
}

/ Replace placeholders like {name}. */
function fmt(str, params) {
  return str.replace(/\{(\w+)\}/g, (_, k) => (params?.[k] ?? ""));
}

/ Apply i18n texts to elements with [data-i18n-key]. */
function applyI18n(lang, name) {
  const dict = I18N[lang] || I18N.ru;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n-key]").forEach((el) => {
    const key = el.getAttribute("data-i18n-key");
    const s = dict[key];
    if (!s) return;
    const needsFmt = el.getAttribute("data-i18n-fmt");
    el.textContent = needsFmt ? fmt(s, { name }) : s;
  });
}

/ Modal open/close utilities. */
const Modal = {
  open(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.setAttribute("aria-hidden", "false");
    // trap focus minimal
    setTimeout(() => {
      const btn = m.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      btn?.focus();
    }, 0);
  },
  close(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.setAttribute("aria-hidden", "true");
  },
};

function setGreeting(name, lang) {
  const dict = I18N[lang]  I18N.ru;
  const el = document.getElementById("greeting");
  el.textContent = fmt(dict.greeting, { name: name  "Гость" });
  const signedAs = document.getElementById("signedAs");
  signedAs.textContent = fmt(dict.loggedAs, { name: name  "Гость" });
  document.getElementById("logoutBtn").hidden = !name;
}

/** Init cookie banner and behavior. */
function initCookies(lang) {
  const banner = document.getElementById("cookieBanner");
  const consent = localStorage.getItem("cookieConsent");
  if (!consent) {
    banner.hidden = false;
  }
  document.getElementById("cookieAccept").addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "accepted");
    // migrate session user to local if exists
    const user = Storage.get("user");
    if (user) {
      try { localStorage.setItem("user", JSON.stringify(user)); } catch {}
    }
    banner.hidden = true;
  });
  document.getElementById("cookieDecline").addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "declined");
    // purge persistent data
    try { localStorage.removeItem("user"); } catch {}
    banner.hidden = true;
  });
  // Re-apply text (in case lang changed before banner shown)
  applyI18n(lang, Storage.get("user")?.first_name  "Гость");
}

/** Setup Settings modal values and saving. */
function initSettings(lang, theme) {
  const form = document.getElementById("settingsForm");
  // Theme radios
  const themeVal = theme  "light";
  form.theme.value = themeVal;
  // Language select
  document.getElementById("langSelect").value = lang  "ru";

document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const newTheme = form.theme.value;
    const newLang = document.getElementById("langSelect").value;
    try { localStorage.setItem("theme", JSON.stringify(newTheme)); } catch {}
    try { localStorage.setItem("lang", JSON.stringify(newLang)); } catch {}
    applyTheme(newTheme);
    const user = Storage.get("user");
    applyI18n(newLang, user?.first_name  "Гость");
    setGreeting(user?.first_name, newLang);
    Modal.close("settingsModal");
  });
}

/** Wire UI events. */
function wireEvents() {
  document.getElementById("menuBtn").addEventListener("click", () => Modal.open("menuModal"));
  document.getElementById("settingsBtn").addEventListener("click", () => Modal.open("settingsModal"));
  document.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const id = el.getAttribute("data-close");
      Modal.close(id);
    });
  });
  // Close by ESC or backdrop click is handled via [data-close] on backdrop
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      ["menuModal", "settingsModal", "tgModal"].forEach(Modal.close);
    }
  });

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    Storage.remove("user");
    setGreeting(null, getLang());
  });
}

/** Decide whether to show TG login on first visit. */
function maybeShowTelegramLogin() {
  const hasUser = !!Storage.get("user");
  if (!hasUser) {
    Modal.open("tgModal");
  }
}

/** Read persisted language or default RU. */
function getLang() {
  try {
    const v = localStorage.getItem("lang");
    if (v) return JSON.parse(v);
  } catch {}
  return "ru";
}

/** Read persisted theme or default light. */
function getTheme() {
  try {
    const v = localStorage.getItem("theme");
    if (v) return JSON.parse(v);
  } catch {}
  return "light";
}

/** Global Telegram auth callback (called by widget). */
window.onTelegramAuth = function onTelegramAuth(user) {
  // Minimal validation
  if (!user  !user.first_name) {
    alert("Telegram auth failed.");
    return;
  }
  const consent = localStorage.getItem("cookieConsent") === "accepted";
  if (consent) {
    try { localStorage.setItem("user", JSON.stringify(user)); } catch {}
  } else {
    try { sessionStorage.setItem("user", JSON.stringify(user)); } catch {}
  }
  const lang = getLang();
  applyI18n(lang, user.first_name);
  setGreeting(user.first_name, lang);
  alert(Logged in as ${user.first_name} ${user.last_name ?? ""} (${user.id}${user.username ? ", @" + user.username : ""}));
  Modal.close("tgModal");
};

(function init() {
  const theme = getTheme();
  applyTheme(theme);

  const lang = getLang();
  const user = Storage.get("user");
  applyI18n(lang, user?.first_name || "Гость");
  setGreeting(user?.first_name, lang);

  wireEvents();
  initSettings(lang, theme);
  initCookies(lang);
  maybeShowTelegramLogin();
})();
