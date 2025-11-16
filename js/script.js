// Глобальная функция для Telegram авторизации
window.onTelegramAuth = function(user) {
    console.log('Telegram user authenticated:', user);
    
    // Сохраняем данные пользователя
    localStorage.setItem('telegramUser', JSON.stringify(user));
    localStorage.setItem('userAuth', 'true');
    
    // Обновляем приветствие
    updateGreeting(user);
    
    // Закрываем модальное окно авторизации
    document.getElementById('authModal').style.display = 'none';
    
    // Показываем уведомление
    showNotification(`Добро пожаловать, ${user.first_name || 'Гость'}!`);
    
    // Показываем окно cookies после авторизации
    setTimeout(() => {
        if (!localStorage.getItem('cookiesAccepted')) {
            document.getElementById('cookiesModal').style.display = 'block';
        }
    }, 1000);
};

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация приложения
    initializeApp();
});

function initializeApp() {
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

    // Инициализация Telegram Widget
    initializeTelegramWidget();

    // Проверка авторизации и cookies при загрузке
    checkAuthAndCookies();

    // Обработчики открытия модальных окон
    menuBtn.addEventListener('click', () => {
        menuModal.style.display = 'block';
        menuModal.querySelector('.modal-content').style.animation = 'slideUp 0.3s ease';
    });
    
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
        settingsModal.querySelector('.modal-content').style.animation = 'slideUp 0.3s ease';
    });

    // Закрытие модальных окон
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Закрытие при клике вне окна
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // Обработчики cookies
    acceptCookies.addEventListener('click', acceptCookiesHandler);
    declineCookies.addEventListener('click', declineCookiesHandler);

    // Обработчики настроек
    themeSelect.addEventListener('change', updateTheme);
    languageSelect.addEventListener('change', updateLanguage);

    // Загрузка сохраненных настроек
    loadSettings();

    // Инициализация адаптивности
    initializeResponsive();
}

function initializeTelegramWidget() {
    const widgetContainer = document.getElementById('telegram-widget');
    
    // Создаем скрипт для Telegram Widget
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'Jahvirapelacionsbot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    
    widgetContainer.appendChild(script);
}

function checkAuthAndCookies() {
    const user = localStorage.getItem('telegramUser');
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    const userAuth = localStorage.getItem('userAuth');

    // Проверяем авторизацию
    if (!userAuth || userAuth !== 'true') {
        // Показываем окно авторизации с задержкой для лучшего UX
        setTimeout(() => {
            document.getElementById('authModal').style.display = 'block';
        }, 500);
    } else if (user) {
        updateGreeting(JSON.parse(user));
    }

    // Проверяем принятие cookies
    if (!cookiesAccepted && userAuth === 'true') {
        setTimeout(() => {
            document.getElementById('cookiesModal').style.display = 'block';
        }, 1500);
    }
}

function updateGreeting(userData) {
    const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
    const greeting = document.getElementById('greeting');
    const name = user.first_name || user.username || 'Гость';
    
    // Получаем текущий язык для приветствия
    const language = localStorage.getItem('language') || 'ru';
    const greetings = {
        ru: 'Привет',
        uk: 'Привіт',
        be: 'Прывітанне',
        en: 'Hello'
    };
    
    greeting.textContent = `${greetings[language]} ${name}!`;
    greeting.style.opacity = '0';
    greeting.style.transform = 'translateY(20px)';
    
    // Анимация появления
    setTimeout(() => {
        greeting.style.transition = 'all 0.5s ease';
        greeting.style.opacity = '1';
        greeting.style.transform = 'translateY(0)';
    }, 100);
}

function acceptCookiesHandler() {
    localStorage.setItem('cookiesAccepted', 'true');
    document.getElementById('cookiesModal').style.display = 'none';
    showNotification('Cookies приняты!');
}

function declineCookiesHandler() {
    // Очищаем только cookies-related данные, оставляя авторизацию
    localStorage.removeItem('cookiesAccepted');
    localStorage.removeItem('theme');
    localStorage.removeItem('language');
    document.getElementById('cookiesModal').style.display = 'none';
    showNotification('Cookies отклонены. Некоторые функции могут работать некорректно.');
}

function updateTheme() {
    const themeSelect = document.getElementById('themeSelect');
    const theme = themeSelect.value;
    
    if (theme === 'auto') {
        // Определяем системную тему
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    localStorage.setItem('theme', theme);
    showNotification(`Тема изменена на: ${themeSelect.options[themeSelect.selectedIndex].text}`);
}

function updateLanguage() {
    const languageSelect = document.getElementById('languageSelect');
    const language = languageSelect.value;
    
    localStorage.setItem('language', language);
    applyLanguage(language);
    showNotification(`Язык изменен на: ${languageSelect.options[languageSelect.selectedIndex].text}`);
}

function applyLanguage(lang) {
    const translations = {
        ru: {
            menu: 'Меню',
            settings: 'Настройки',
            greeting: 'Привет',
            lastVideo: 'Последний ролик',
            navigation: 'Навигация',
            theme: 'Тема',
            language: 'Язык',
            authTitle: 'Авторизация',
            authText: 'Войдите через Telegram для персонализации',
            cookiesTitle: 'Файлы Cookies',
            cookiesText: 'Мы используем cookies для сохранения ваших настроек и авторизации. Это помогает нам запомнить вас при повторном посещении.',
            accept: 'Принять',
            decline: 'Отклонить'
        },
        uk: {
            menu: 'Меню',
            settings: 'Налаштування',
            greeting: 'Привіт',
            lastVideo: 'Останнє відео',
            navigation: 'Навігація',
            theme: 'Тема',
            language: 'Мова',
            authTitle: 'Авторизація',
            authText: 'Увійдіть через Telegram для персоналізації',
            cookiesTitle: 'Файли Cookies',
            cookiesText: 'Ми використовуємо cookies для збереження ваших налаштувань та авторизації. Це допомагає нам запам\'ятати вас при повторному відвідуванні.',
            accept: 'Прийняти',
            decline: 'Відхилити'
        },
        be: {
            menu: 'Меню',
            settings: 'Налады',
            greeting: 'Прывітанне',
            lastVideo: 'Апошняе відэа',
            navigation: 'Навігацыя',
            theme: 'Тэма',
            language: 'Мова',
            authTitle: 'Аўтарызацыя',
            authText: 'Увайдзіце праз Telegram для персаналізацыі',
            cookiesTitle: 'Файлы Cookies',
            cookiesText: 'Мы выкарыстоўваем cookies для захавання вашых наладаў і аўтарызацыі. Гэта дапамагае нам запомніць вас пры паўторным наведванні.',
            accept: 'Прыняць',
            decline: 'Адхіліць'
        },
        en: {
            menu: 'Menu',
            settings: 'Settings',
            greeting: 'Hello',
            lastVideo: 'Last video',
            navigation: 'Navigation',
            theme: 'Theme',
            language: 'Language',
            authTitle: 'Authorization',
            authText: 'Log in via Telegram for personalization',
            cookiesTitle: 'Cookies',
            cookiesText: 'We use cookies to save your settings and authorization. This helps us remember you on repeat visits.',
            accept: 'Accept',
            decline: 'Decline'
        }
    };

    const t = translations[lang];
    
    // Обновляем тексты
    document.querySelector('#menuModal h2').textContent = t.navigation;
    document.querySelector('#settingsModal h2').textContent = t.settings;
    document.querySelector('#authModal h2').textContent = t.authTitle;
    document.querySelector('#authModal p').textContent = t.authText;
    document.querySelector('#cookiesModal h2').innerHTML = `<i class="fas fa-cookie-bite"></i> ${t.cookiesTitle}`;
    document.querySelector('#cookiesModal p').textContent = t.cookiesText;
    document.querySelector('#acceptCookies').innerHTML = `<i class="fas fa-check"></i> ${t.accept}`;
    document.querySelector('#declineCookies').innerHTML = `<i class="fas fa-times"></i> ${t.decline}`;
    document.querySelector('.video-section h3').innerHTML = `<i class="fas fa-play-circle"></i> ${t.lastVideo}`;
    
    // Обновляем настройки
    document.querySelectorAll('.setting-group label')[0].innerHTML = `<i class="fas fa-palette"></i> ${t.theme}:`;
    document.querySelectorAll('.setting-group label')[1].innerHTML = `<i class="fas fa-language"></i> ${t.language}:`;
    
    // Обновляем приветствие если пользователь авторизован
    const user = localStorage.getItem('telegramUser');
    if (user) {
        const userData = JSON.parse(user);
        const name = userData.first_name || userData.username || '';
        document.getElementById('greeting').textContent = `${t.greeting} ${name}!`;
    }
}

function loadSettings() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    const savedLanguage = localStorage.getItem('language') || 'ru';
    
    document.getElementById('themeSelect').value = savedTheme;
    document.getElementById('languageSelect').value = savedLanguage;
    
    updateTheme();
    applyLanguage(savedLanguage);
}

function initializeResponsive() {
    // Обработчик изменения размера окна
    window.addEventListener('resize', function() {
        // При необходимости можно добавить дополнительную логику адаптивности
        console.log('Window resized:', window.innerWidth);
    });
}

function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        box-shadow: var(--shadow);
        z-index: 1002;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Обработчик системной темы
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const theme = localStorage.getItem('theme');
    if (theme === 'auto') {
        updateTheme();
    }
});
