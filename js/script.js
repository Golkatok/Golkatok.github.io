/* ===== Меню ===== */
document.getElementById("menu-btn").onclick = () => {
  document.getElementById("menu-popup").style.display = "block";
};
document.getElementById("settings-btn").onclick = () => {
  document.getElementById("settings-popup").style.display = "block";
};

/* ===== Cookie ===== */
document.getElementById("cookie-accept").onclick = () => {
  localStorage.setItem("cookies", "yes");
  document.getElementById("cookie-popup").style.display = "none";
};

/* ===== Показать popup Cookie если впервые ===== */
if (!localStorage.getItem("cookies")) {
  document.getElementById("cookie-popup").style.display = "flex";
}

/* ===== Проверка Telegram авторизации ===== */
const savedUser = localStorage.getItem("tg_user");
if (!savedUser) {
  document.getElementById("tg-login-popup").style.display = "flex";
} else {
  const u = JSON.parse(savedUser);
  document.getElementById("welcome-name").textContent = u.first_name;
}

/* ===== Настройки темы ===== */
document.getElementById("theme-select").onchange = e => {
  localStorage.setItem("theme", e.target.value);
  if (e.target.value === "light") {
    document.body.style.background = "#fafafa";
    document.body.style.color = "#111";
  } else {
    document.body.style.background = "#0d0d14";
    document.body.style.color = "white";
  }
};

/* Применить сохранённую тему */
let savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.style.background = "#fafafa";
  document.body.style.color = "#111";
}

/* ===== Локализация ===== */
const translations = {
  ru: {
    menu: "Меню",
    settings: "Настройки",
    theme: "Тема",
    language: "Язык"
  },
  uk: {
    menu: "Меню",
    settings: "Налаштування",
    theme: "Тема",
    language: "Мова"
  },
  by: {
    menu: "Меню",
    settings: "Налады",
    theme: "Тэма",
    language: "Мова"
  },
  en: {
    menu: "Menu",
    settings: "Settings",
    theme: "Theme",
    language: "Language"
  }
};

document.getElementById("lang-select").onchange = e => {
  localStorage.setItem("lang", e.target.value);
  applyLang(e.target.value);
};

function applyLang(code) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.innerText = translations[code][el.dataset.i18n];
  });
}

applyLang(localStorage.getItem("lang") || "ru");
