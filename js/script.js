document.addEventListener('DOMContentLoaded', function() {
    // Элементы модальных окон
    const menuModal = document.getElementById('menuModal');
    const settingsModal = document.getElementById('settingsModal');
    const authModal = document.getElementById('authModal');
    const cookiesModal = document.getElementById('cookiesModal');
    
    // Кнопки
    const menuBtn = document.getElementById('menuBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const acceptCookies = document.getElementById('acceptCookies');
    const declineCookies = document.getElementById('declineCookies');
    
    // Настройки
    const themeSelect = document.getElementById('themeSelect');
    const languageSelect = document.getElementById('languageSelect');
    const greeting = document.getElementById('greeting');

    // Проверка авторизации и cookies при загрузке
    checkAuthAndCookies();

    // Обработчики открытия модальных окон
    menuBtn.onclick = () => menuModal.style.display = 'block';
    settingsBtn.onclick = () => settingsModal.style.display = 'block';

    // Закрытие модальных окон
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = () => {
            menuModal.style.display = 'none';
            settingsModal.style.display = 'none';
        }
    });

    // Закрытие при клике вне окна
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            menuModal.style.display = 'none';
            settingsModal.style.display = 'none';
            authModal.style.display = 'none';
            cookiesModal.style.display = 'none';
        }
    }

    // Обработчики cookies
    acceptCookies.onclick = acceptCookiesHandler;
    declineCookies.onclick = declineCookiesHandler;

    // Обработчики настроек
    themeSelect.onchange = updateTheme;
    languageSelect.onchange = updateLanguage;

    // Загрузка сохраненных настроек
    loadSettings();

    function checkAuthAndCookies() {
        const user = localStorage.getItem('telegramUser');
        const cookiesAccepted = localStorage.getItem('cookiesAccepted');

        if (!user) {
            authModal.style.display = 'block';
        } else {
            updateGreeting(user);
        }

        if (!cookiesAccepted && user) {
            setTimeout(() => {
                cookiesModal.style.display = 'block';
            }, 1000);
        }
    }

    function updateGreeting(userData) {
        const user = JSON.parse(userData);
        const name = user.first_name || 'Гость';
        greeting.textContent = `Привет ${name}!`;
    }

    function acceptCookiesHandler() {
        localStorage.setItem('cookiesAccepted', 'true');
        cookiesModal.style.display = 'none';
    }

    function declineCookiesHandler() {
        localStorage.clear();
        cookiesModal.style.display = 'none';
        authModal.style.display = 'block';
    }

    function updateTheme() {
        const theme = themeSelect.value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    function updateLanguage() {
        const language = languageSelect.value;
        localStorage.setItem('language', language);
        applyLanguage(language);
    }

    function applyLanguage(lang) {
        const translations = {
            ru: {
                menu: 'Меню',
                settings: 'Настройки',
                greeting: 'Привет',
                lastVideo: 'Последний ролик'
            },
            uk: {
                menu: 'Меню',
                settings: 'Налаштування',
                greeting: 'Привіт',
                lastVideo: 'Останнє відео'
            },
            be: {
                menu: 'Меню',
                settings: 'Налады',
                greeting: 'Прывітанне',
                lastVideo: 'Апошняе відэа'
            },
            en: {
                menu: 'Menu',
                settings: 'Settings',
                greeting: 'Hello',
                lastVideo: 'Last video'
            }
        };

        const t = translations[lang];
        document.getElementById('menuBtn').textContent = t.menu;
        document.getElementById('settingsBtn').textContent = t.settings;
        document.querySelector('.video-section h3').textContent = t.lastVideo;
        
        const user = localStorage.getItem('telegramUser');
        if (user) {
            const userData = JSON.parse(user);
            const name = userData.first_name || '';
            greeting.textContent = `${t.greeting} ${name}!`;
        }
    }

    function loadSettings() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const savedLanguage = localStorage.getItem('language') || 'ru';
        
        themeSelect.value = savedTheme;
        languageSelect.value = savedLanguage;
        
        updateTheme();
        applyLanguage(savedLanguage);
    }
});

// Функция для обработки авторизации Telegram
function onTelegramAuth(user) {
    localStorage.setItem('telegramUser', JSON.stringify(user));
    document.getElementById('authModal').style.display = 'none';
    
    const greeting = document.getElementById('greeting');
    greeting.textContent = `Привет ${user.first_name}!`;
    
    // Показываем окно cookies после авторизации
    setTimeout(() => {
        document.getElementById('cookiesModal').style.display = 'block';
    }, 500);
}
