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
    const colorSchemeSelect = document.getElementById('colorSchemeSelect');
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
    colorSchemeSelect.addEventListener('change', updateColorScheme);
    languageSelect.addEventListener('change', updateLanguage);

    // Обработчики навигации в меню
    initializeMenuNavigation();

    // Загрузка сохраненных настроек
    loadSettings();

    // Инициализация адаптивности
    initializeResponsive();
}

function initializeMenuNavigation() {
    // Обработчики для кнопок навигации в меню
    document.querySelectorAll('.menu-link').forEach(button => {
        button.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) {
                // Закрываем меню
                document.getElementById('menuModal').style.display = 'none';
                
                // Плавный переход на страницу
                setTimeout(() => {
                    window.location.href = page;
                }, 300);
            }
        });
    });
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
    
    const greetingText = greetings[language] || 'Привет';
    greeting.textContent = `${greetingText} ${name}!`;
    
    // Анимация появления
    greeting.style.opacity = '0';
    greeting.style.transform = 'translateY(20px)';
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
    localStorage.removeItem('colorScheme');
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
    showNotification(`Тема изменена на: ${getTranslatedText('theme_' + theme)}`);
}

function updateColorScheme() {
    const colorSchemeSelect = document.getElementById('colorSchemeSelect');
    const colorScheme = colorSchemeSelect.value;
    
    // Удаляем все классы цветовых схем и добавляем нужную
    document.documentElement.removeAttribute('data-color-scheme');
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
    
    localStorage.setItem('colorScheme', colorScheme);
    
    const schemeNames = {
        sunset: 'Закат',
        ocean: 'Океан', 
        forest: 'Лес',
        berry: 'Ягоды',
        neon: 'Неон'
    };
    
    showNotification(`Цветовая схема изменена на: ${schemeNames[colorScheme]}`);
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
            // Меню
            navigation: 'Навигация',
            home: 'Главная',
            social: 'Соц. Сети',
            news: 'Новости',
            games: 'Мини-игры',
            
            // Настройки
            settings: 'Настройки',
            theme: 'Тема',
            colorScheme: 'Цветовая схема',
            language: 'Язык',
            light: 'Светлая',
            dark: 'Тёмная',
            auto: 'Системная',
            
            // Авторизация
            authTitle: 'Авторизация',
            authText: 'Войдите через Telegram для персонализации',
            
            // Cookies
            cookiesTitle: 'Файлы Cookies',
            cookiesText: 'Мы используем cookies для сохранения ваших настроек и авторизации. Это помогает нам запомнить вас при повторном посещении.',
            accept: 'Принять',
            decline: 'Отклонить',
            
            // Приветствие
            greeting: 'Привет',
            
            // Видео
            lastVideo: 'Последний ролик'
        },
        uk: {
            navigation: 'Навігація',
            home: 'Головна',
            social: 'Соц. Мережі',
            news: 'Новини',
            games: 'Міні-ігри',
            settings: 'Налаштування',
            theme: 'Тема',
            colorScheme: 'Кольорова схема',
            language: 'Мова',
            light: 'Світла',
            dark: 'Темна',
            auto: 'Системна',
            authTitle: 'Авторизація',
            authText: 'Увійдіть через Telegram для персоналізації',
            cookiesTitle: 'Файли Cookies',
            cookiesText: 'Ми використовуємо cookies для збереження ваших налаштувань та авторизації. Це допомагає нам запам\'ятати вас при повторному відвідуванні.',
            accept: 'Прийняти',
            decline: 'Відхилити',
            greeting: 'Привіт',
            lastVideo: 'Останнє відео'
        },
        be: {
            navigation: 'Навігацыя',
            home: 'Галоўная',
            social: 'Сац. Сеткі',
            news: 'Навіны',
            games: 'Міні-гульні',
            settings: 'Налады',
            theme: 'Тэма',
            colorScheme: 'Каляровая схема',
            language: 'Мова',
            light: 'Светлая',
            dark: 'Цёмная',
            auto: 'Сістэмная',
            authTitle: 'Аўтарызацыя',
            authText: 'Увайдзіце праз Telegram для персаналізацыі',
            cookiesTitle: 'Файлы Cookies',
            cookiesText: 'Мы выкарыстоўваем cookies для захавання вашых наладаў і аўтарызацыі. Гэта дапамагае нам запомніць вас пры паўторным наведванні.',
            accept: 'Прыняць',
            decline: 'Адхіліць',
            greeting: 'Прывітанне',
            lastVideo: 'Апошняе відэа'
        },
        en: {
            navigation: 'Navigation',
            home: 'Home',
            social: 'Social Networks',
            news: 'News',
            games: 'Mini Games',
            settings: 'Settings',
            theme: 'Theme',
            colorScheme: 'Color Scheme',
            language: 'Language',
            light: 'Light',
            dark: 'Dark',
            auto: 'System',
            authTitle: 'Authorization',
            authText: 'Log in via Telegram for personalization',
            cookiesTitle: 'Cookies',
            cookiesText: 'We use cookies to save your settings and authorization. This helps us remember you on repeat visits.',
            accept: 'Accept',
            decline: 'Decline',
            greeting: 'Hello',
            lastVideo: 'Last video'
        }
    };

    const t = translations[lang] || translations.ru;
    
    // Обновляем все элементы с data-i18n атрибутом
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            element.textContent = t[key];
        }
    });
    
    // Обновляем приветствие если пользователь авторизован
    const user = localStorage.getItem('telegramUser');
    if (user) {
        const userData = JSON.parse(user);
        const name = userData.first_name || userData.username || '';
        document.getElementById('greeting').textContent = `${t.greeting} ${name}!`;
    }
}

function getTranslatedText(key) {
    const language = localStorage.getItem('language') || 'ru';
    const translations = {
        ru: {
            theme_light: 'Светлая',
            theme_dark: 'Тёмная',
            theme_auto: 'Системная'
        },
        uk: {
            theme_light: 'Світла',
            theme_dark: 'Темна',
            theme_auto: 'Системна'
        },
        be: {
            theme_light: 'Светлая',
            theme_dark: 'Цёмная',
            theme_auto: 'Сістэмная'
        },
        en: {
            theme_light: 'Light',
            theme_dark: 'Dark',
            theme_auto: 'System'
        }
    };
    
    return (translations[language] && translations[language][key]) || key;
}

function loadSettings() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    const savedColorScheme = localStorage.getItem('colorScheme') || 'sunset';
    const savedLanguage = localStorage.getItem('language') || 'ru';
    
    document.getElementById('themeSelect').value = savedTheme;
    document.getElementById('colorSchemeSelect').value = savedColorScheme;
    document.getElementById('languageSelect').value = savedLanguage;
    
    updateTheme();
    updateColorScheme();
    applyLanguage(savedLanguage);
}

function initializeResponsive() {
    // Обработчик изменения размера окна
    window.addEventListener('resize', function() {
        // Дополнительная логика адаптивности при необходимости
    });
}

function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--gradient);
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
