// ----------------------------
// Локализация
// ----------------------------
const i18n = {
    ru: {
        menu_title: "Меню",
        menu_main: "Главная",
        menu_social: "Соц. сети",
        menu_news: "Новости",
        menu_games: "Мини-игры",

        settings_title: "Настройки",
        settings_theme: "Тема:",
        settings_lang: "Язык:",
        theme_dark: "Тёмная",
        theme_light: "Светлая",

        auth_title: "Авторизация",
        auth_text: "Войдите через Telegram, чтобы продолжить",

        cookies_title: "Cookies",
        cookies_text: "Мы используем cookies, чтобы запомнить ваши настройки.",
        cookies_accept: "Принять",
        cookies_decline: "Отклонить",

        last_video: "Последний ролик:"
    },

    uk: {
        menu_title: "Меню",
        menu_main: "Головна",
        menu_social: "Соцмережі",
        menu_news: "Новини",
        menu_games: "Міні-ігри",

        settings_title: "Налаштування",
        settings_theme: "Тема:",
        settings_lang: "Мова:",
        theme_dark: "Темна",
        theme_light: "Світла",

        auth_title: "Авторизація",
        auth_text: "Увійдіть через Telegram, щоб продовжити",

        cookies_title: "Cookies",
        cookies_text: "Ми використовуємо cookies, щоб зберегти ваші налаштування.",
        cookies_accept: "Прийняти",
        cookies_decline: "Відхилити",

        last_video: "Останнє відео:"
    },

    by: {
        menu_title: "Меню",
        menu_main: "Галоўная",
        menu_social: "Сацсеткі",
        menu_news: "Навіны",
        menu_games: "Міні-гульні",

        settings_title: "Налады",
        settings_theme: "Тэма:",
        settings_lang: "Мова:",
        theme_dark: "Цёмная",
        theme_light: "Светлая",

        auth_title: "Аўтарызацыя",
        auth_text: "Увайдзіце праз Telegram, каб працягнуць",

        cookies_title: "Cookies",
        cookies_text: "Мы выкарыстоўваем cookies, каб запомніць вашы налады.",
        cookies_accept: "Прыняць",
        cookies_decline: "Адхіліць",

        last_video: "Апошняе відэа:"
    },

    en: {
        menu_title: "Menu",
        menu_main: "Home",
        menu_social: "Social",
        menu_news: "News",
        menu_games: "Mini-games",

        settings_title: "Settings",
        settings_theme: "Theme:",
        settings_lang: "Language:",
        theme_dark: "Dark",
        theme_light: "Light",

        auth_title: "Authorization",
        auth_text: "Login with Telegram to continue",

        cookies_title: "Cookies",
        cookies_text: "We use cookies to remember your preferences.",
        cookies_accept: "Accept",
        cookies_decline: "Decline",

        last_video: "Last video:"
    }
};

// Apply language
function applyLanguage(lang) {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        let key = el.getAttribute("data-i18n");
        el.innerText = i18n[lang][key];
    });
}

// ----------------------------
// Telegram Auth
// ----------------------------
function onTelegramAuth(user) {
    localStorage.setItem("tgUser", JSON.stringify(user));
    document.getElementById("telegramModal").style.display = "none";

    document.getElementById("hello-title").innerText =
        "Привет " + user.first_name + "!";
}

// ----------------------------
// Cookies
// ----------------------------
if (!localStorage.getItem("cookiesAccepted")) {
    document.getElementById("cookieModal").style.display = "flex";
}

document.getElementById("acceptCookies").onclick = () => {
    localStorage.setItem("cookiesAccepted", "yes");
    document.getElementById("cookieModal").style.display = "none";
};

document.getElementById("declineCookies").onclick = () => {
    document.getElementById("cookieModal").style.display = "none";
};

// ----------------------------
// Menu & Settings
// ----------------------------
document.getElementById("menuBtn").onclick = () => {
    document.getElementById("menuModal").style.display = "flex";
};

document.getElementById("settingsBtn").onclick = () => {
    document.getElementById("settingsModal").style.display = "flex";
};

function closeAllModals() {
    document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
}

// ----------------------------
// First visit auth
// ----------------------------
if (!localStorage.getItem("tgUser")) {
    document.getElementById("telegramModal").style.display = "flex";
}

// ----------------------------
// Language sync
// ----------------------------
const langSelect = document.getElementById("languageSelect");
let savedLang = localStorage.getItem("lang") || "ru";

langSelect.value = savedLang;
applyLanguage(savedLang);

langSelect.onchange = () => {
    let lang = langSelect.value;
    localStorage.setItem("lang", lang);
    applyLanguage(lang);
};
