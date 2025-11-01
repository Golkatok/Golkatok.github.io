// Элементы
const menuBtn = document.getElementById('menuBtn');
const settingsBtn = document.getElementById('settingsBtn');
const menu = document.getElementById('menu');
const settings = document.getElementById('settings');
const logoutBtn = document.getElementById('logoutBtn');
const themeToggle = document.getElementById('themeToggle');
const langSelect = document.getElementById('langSelect');

// Меню / Настройки
menuBtn.onclick = () => {
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  settings.style.display = 'none';
};
settingsBtn.onclick = () => {
  settings.style.display = settings.style.display === 'block' ? 'none' : 'block';
  menu.style.display = 'none';
};

// Cookies
const cookiePopup = document.getElementById('cookieConsent');
document.getElementById('acceptCookies').onclick = () => {
  localStorage.setItem('cookiesAccepted', 'true');
  cookiePopup.style.display = 'none';
};
document.getElementById('declineCookies').onclick = () => {
  cookiePopup.style.display = 'none';
};
if (localStorage.getItem('cookiesAccepted') === 'true') cookiePopup.style.display = 'none';

// Telegram Auth
function onTelegramAuth(user) {
  localStorage.setItem('tgName', user.first_name);
  document.getElementById('greeting').textContent = 'Привет, ' + user.first_name + '!';
  document.getElementById('telegramLogin').style.display = 'none';
}
if (localStorage.getItem('tgName')) {
  document.getElementById('greeting').textContent = 'Привет, ' + localStorage.getItem('tgName') + '!';
  document.getElementById('telegramLogin').style.display = 'none';
}

// Выход
logoutBtn.onclick = () => {
  localStorage.removeItem('tgName');
  location.reload();
};

// === Тема ===
function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.checked = true;
  } else {
    document.body.classList.remove('light-theme');
    themeToggle.checked = false;
  }
  localStorage.setItem('theme', theme);
}
themeToggle.addEventListener('change', () => {
  applyTheme(themeToggle.checked ? 'light' : 'dark');
});
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

// === Язык ===
function applyLang(lang) {
  const translations = {
    ru: { greeting: 'Привет', lastVideo: 'последний ролик', logout: 'Выйти с аккаунта' },
    uk: { greeting: 'Привіт', lastVideo: 'останнє відео', logout: 'Вийти з акаунту' },
    be: { greeting: 'Прывітанне', lastVideo: 'апошні ролік', logout: 'Выйсці з акаўнта' },
    en: { greeting: 'Hello', lastVideo: 'latest video', logout: 'Log out' },
  };
  const name = localStorage.getItem('tgName') || 'Гость';
  const t = translations[lang];
  document.getElementById('greeting').textContent = `${t.greeting}, ${name}!`;
  document.getElementById('lastVideoLabel').textContent = t.lastVideo;
  document.getElementById('logoutBtn').textContent = t.logout;
}
langSelect.addEventListener('change', (e) => {
  const lang = e.target.value;
  localStorage.setItem('lang', lang);
  applyLang(lang);
});
const savedLang = localStorage.getItem('lang') || 'ru';
langSelect.value = savedLang;
applyLang(savedLang);
