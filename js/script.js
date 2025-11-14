// -------------------- МЕНЮ --------------------
const menuBtn = document.getElementById('menu-btn');
const menuModal = document.getElementById('menu-modal');
const menuClose = document.getElementById('menu-close');

menuBtn.onclick = () => menuModal.style.display = 'block';
menuClose.onclick = () => menuModal.style.display = 'none';

// -------------------- НАСТРОЙКИ --------------------
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsClose = document.getElementById('settings-close');

settingsBtn.onclick = () => settingsModal.style.display = 'block';
settingsClose.onclick = () => settingsModal.style.display = 'none';

// Закрытие модальных окон при клике вне них
window.onclick = function(event) {
    if (event.target === menuModal) menuModal.style.display = 'none';
    if (event.target === settingsModal) settingsModal.style.display = 'none';
}

// -------------------- ТЕМЫ --------------------
const themeSelect = document.getElementById('theme-select');
themeSelect.onchange = function() {
    if (this.value === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
}

// -------------------- ЯЗЫК --------------------
const langSelect = document.getElementById('lang-select');
// Здесь можно добавить динамическую замену текста по языку

// -------------------- COOKIE --------------------
const cookieBanner = document.getElementById('cookie-banner');
const acceptCookies = document.getElementById('accept-cookies');
const declineCookies = document.getElementById('decline-cookies');

acceptCookies.onclick = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    cookieBanner.style.display = 'none';
    telegramLoginDiv.style.display = 'block'; // показываем Telegram виджет
};

declineCookies.onclick = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    cookieBanner.style.display = 'none';
    telegramLoginDiv.style.display = 'none'; // скрываем Telegram виджет
};

// -------------------- TELEGRAM --------------------
const telegramLoginDiv = document.getElementById('telegram-login');
const greeting = document.getElementById('greeting');

function onTelegramAuth(user) {
    // Сохраняем имя в localStorage
    localStorage.setItem('telegramName', user.first_name);
    greeting.textContent = `Привет, ${user.first_name}!`;
    alert('Logged in as ' + user.first_name + ' ' + (user.last_name || '') + ' (' + user.id + (user.username ? ', @' + user.username : '') + ')');
    // Скрываем виджет после авторизации
    telegramLoginDiv.style.display = 'none';
}

// -------------------- ЗАГРУЗКА СТРАНИЦЫ --------------------
window.addEventListener('load', () => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    const telegramName = localStorage.getItem('telegramName');

    if (cookiesAccepted === 'true') {
        // Cookie приняты
        if (telegramName) {
            greeting.textContent = `Привет, ${telegramName}!`;
        }
        telegramLoginDiv.style.display = telegramName ? 'none' : 'block';
        cookieBanner.style.display = 'none';
    } else {
        // Cookie ещё не приняты
        telegramLoginDiv.style.display = 'block';
        cookieBanner.style.display = 'block';
    }
});
