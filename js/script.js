// Глобальные переменные для достижений
let userAchievements = {};
let sessionStartTime = Date.now();
let totalTimeSpent = 0;
let visitedPages = new Set();
let dailyAchievements = [];
let lastDailyUpdate = null;

// Достижения
const ACHIEVEMENTS = {
    first_visit: {
        id: 'first_visit',
        name: 'Первый шаг',
        description: 'Впервые посетить сайт',
        icon: '🚀',
        rarity: 'common',
        points: 10
    },
    time_10_min: {
        id: 'time_10_min',
        name: 'Задержался надолго',
        description: 'Провести 10 минут на сайте',
        icon: '⏰',
        rarity: 'common',
        points: 15
    },
    explorer: {
        id: 'explorer',
        name: 'Исследователь',
        description: 'Посетить все разделы сайта',
        icon: '🧭',
        rarity: 'rare',
        points: 30
    },
    collector: {
        id: 'collector',
        name: 'Коллекционер',
        description: 'Получить все достижения',
        icon: '🏆',
        rarity: 'legendary',
        points: 100
    },
    theme_master: {
        id: 'theme_master',
        name: 'Художник',
        description: 'Использовать все цветовые схемы',
        icon: '🎨',
        rarity: 'rare',
        points: 25
    },
    polyglot: {
        id: 'polyglot',
        name: 'Полиглот',
        description: 'Использовать все языки',
        icon: '🌎',
        rarity: 'rare',
        points: 25
    },
    speedrunner: {
        id: 'speedrunner',
        name: 'Спидраннер',
        description: 'Выполнить 5 достижений за один день',
        icon: '⚡',
        rarity: 'epic',
        points: 50
    },
    loyal_fan: {
        id: 'loyal_fan',
        name: 'Верный фанат',
        description: 'Посещать сайт 7 дней подряд',
        icon: '❤️',
        rarity: 'epic',
        points: 40
    },
    ai_user: {
        id: 'ai_user',
        name: 'Искусственный интеллект',
        description: 'Отправить сообщение в Axel AI',
        icon: '🤖',
        rarity: 'common',
        points: 20
    }
};

// Ежедневные достижения
const DAILY_ACHIEVEMENTS_POOL = [
    {
        id: 'daily_watcher',
        name: 'Наблюдатель',
        description: 'Посмотреть последнее видео до конца',
        icon: '👀',
        rarity: 'daily',
        points: 20
    },
    {
        id: 'daily_sharer',
        name: 'Шеритель',
        description: 'Поделиться сайтом с другом',
        icon: '📤',
        rarity: 'daily',
        points: 15
    },
    {
        id: 'daily_early_bird',
        name: 'Ранняя пташка',
        description: 'Посетить сайт до 12:00',
        icon: '🐦',
        rarity: 'daily',
        points: 10
    },
    {
        id: 'daily_night_owl',
        name: 'Ночная сова',
        description: 'Посетить сайт после 22:00',
        icon: '🦉',
        rarity: 'daily',
        points: 10
    },
    {
        id: 'daily_social',
        name: 'Социалка',
        description: 'Перейти в раздел Соц. Сети',
        icon: '💬',
        rarity: 'daily',
        points: 15
    },
    {
        id: 'daily_ai',
        name: 'AI Помощник',
        description: 'Задать вопрос Axel AI',
        icon: '🤖',
        rarity: 'daily',
        points: 25
    }
];

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
    
    // Проверяем достижение "Первый визит"
    checkAchievement('first_visit');
    
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
    const achievementsModal = document.getElementById('achievementsModal');
    
    // Кнопки
    const menuBtn = document.getElementById('menuBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const achievementsBtn = document.getElementById('achievementsBtn');
    const acceptCookies = document.getElementById('acceptCookies');
    const declineCookies = document.getElementById('declineCookies');

    // Инициализация систем
    initializeTelegramWidget();
    initializeAchievements();
    initializeTimeTracking();
    
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
    
    achievementsBtn.addEventListener('click', () => {
        achievementsModal.style.display = 'block';
        achievementsModal.querySelector('.modal-content').style.animation = 'slideUp 0.3s ease';
        updateAchievementsDisplay();
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
    const themeSelect = document.getElementById('themeSelect');
    const colorSchemeSelect = document.getElementById('colorSchemeSelect');
    const languageSelect = document.getElementById('languageSelect');
    const googleAIKey = document.getElementById('googleAIKey');
    const youtubeApiKey = document.getElementById('youtubeApiKey');
    const youtubeChannelId = document.getElementById('youtubeChannelId');

    if (themeSelect) themeSelect.addEventListener('change', updateTheme);
    if (colorSchemeSelect) colorSchemeSelect.addEventListener('change', updateColorScheme);
    if (languageSelect) languageSelect.addEventListener('change', updateLanguage);
    if (googleAIKey) {
        googleAIKey.addEventListener('change', function() {
            localStorage.setItem('googleAIKey', this.value);
        });
    }
    if (youtubeApiKey) {
        youtubeApiKey.addEventListener('change', function() {
            localStorage.setItem('youtubeApiKey', this.value);
        });
    }
    if (youtubeChannelId) {
        youtubeChannelId.addEventListener('change', function() {
            localStorage.setItem('youtubeChannelId', this.value);
        });
    }

    // Обработчики навигации в меню
    initializeMenuNavigation();

    // Загрузка сохраненных настроек
    loadSettings();

    // Загрузка данных YouTube и Twitch
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        fetchYouTubeData();
        fetchTwitchStatus();
    }

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
                
                // Добавляем страницу в историю посещений
                visitedPages.add(page);
                localStorage.setItem('visitedPages', JSON.stringify([...visitedPages]));
                checkExplorerAchievement();
                
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
    if (!widgetContainer) return;
    
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

// Система достижений
function initializeAchievements() {
    // Загружаем достижения из localStorage
    const saved = localStorage.getItem('userAchievements');
    userAchievements = saved ? JSON.parse(saved) : {};
    
    // Загружаем время из localStorage
    totalTimeSpent = parseInt(localStorage.getItem('totalTimeSpent') || '0');
    
    // Загружаем историю посещений
    const savedPages = localStorage.getItem('visitedPages');
    visitedPages = new Set(savedPages ? JSON.parse(savedPages) : []);
    
    // Добавляем текущую страницу
    visitedPages.add(window.location.pathname);
    localStorage.setItem('visitedPages', JSON.stringify([...visitedPages]));
    
    // Инициализация ежедневных достижений
    initializeDailyAchievements();
    
    // Проверяем достижения при загрузке
    checkExplorerAchievement();
    checkThemeMasterAchievement();
    checkPolyglotAchievement();
}

function initializeDailyAchievements() {
    const now = new Date();
    const today = now.toDateString();
    lastDailyUpdate = localStorage.getItem('lastDailyUpdate');
    
    // Если прошло больше 24 часов или первый запуск
    if (!lastDailyUpdate || lastDailyUpdate !== today) {
        // Выбираем случайное ежедневное достижение
        const randomAchievement = DAILY_ACHIEVEMENTS_POOL[
            Math.floor(Math.random() * DAILY_ACHIEVEMENTS_POOL.length)
        ];
        
        dailyAchievements = [randomAchievement];
        localStorage.setItem('dailyAchievements', JSON.stringify(dailyAchievements));
        localStorage.setItem('lastDailyUpdate', today);
        
        showNotification(`Новое ежедневное задание: ${randomAchievement.name}`);
    } else {
        // Загружаем сохранённые ежедневные достижения
        const saved = localStorage.getItem('dailyAchievements');
        dailyAchievements = saved ? JSON.parse(saved) : [];
    }
    
    // Запускаем таймер обновления
    startDailyTimer();
}

function startDailyTimer() {
    function updateTimer() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diff = tomorrow - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const timerElement = document.getElementById('refreshTimer');
        if (timerElement) {
            timerElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

function initializeTimeTracking() {
    sessionStartTime = Date.now();
    
    // Обновляем общее время каждые 10 секунд
    setInterval(() => {
        const sessionTime = Date.now() - sessionStartTime;
        totalTimeSpent += sessionTime;
        localStorage.setItem('totalTimeSpent', totalTimeSpent.toString());
        sessionStartTime = Date.now();
        
        // Проверяем достижение по времени
        if (totalTimeSpent >= 10 * 60 * 1000) { // 10 минут
            checkAchievement('time_10_min');
        }
        
        // Проверяем достижение скорости
        checkSpeedrunnerAchievement();
    }, 10000);
}

function checkAchievement(achievementId) {
    if (!userAchievements[achievementId]) {
        const achievement = ACHIEVEMENTS[achievementId];
        userAchievements[achievementId] = {
            unlocked: true,
            unlockedAt: new Date().toISOString(),
            points: achievement.points
        };
        
        localStorage.setItem('userAchievements', JSON.stringify(userAchievements));
        
        // Показываем уведомление о новом достижении
        showAchievementNotification(achievement);
        
        // Проверяем достижение "Коллекционер"
        checkCollectorAchievement();
        
        return true;
    }
    return false;
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'notification achievement-notification';
    notification.innerHTML = `
        <div class="achievement-unlocked">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-points">+${achievement.points} очков</div>
            </div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Обработчик закрытия
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

function checkExplorerAchievement() {
    // Проверяем, посещены ли все разделы
    const requiredPages = ['/index.html', '/social.html', '/news.html', '/mini-games.html', '/axel-ai.html'];
    const hasAllPages = requiredPages.every(page => visitedPages.has(page));
    
    if (hasAllPages) {
        checkAchievement('explorer');
    }
}

function checkCollectorAchievement() {
    const unlockedCount = Object.values(userAchievements).filter(a => a.unlocked).length;
    const totalCount = Object.keys(ACHIEVEMENTS).length;
    
    if (unlockedCount >= totalCount) {
        checkAchievement('collector');
    }
}

function checkThemeMasterAchievement() {
    const usedThemes = JSON.parse(localStorage.getItem('usedThemes') || '[]');
    if (usedThemes.length >= 5) { // Все цветовые схемы
        checkAchievement('theme_master');
    }
}

function checkPolyglotAchievement() {
    const usedLanguages = JSON.parse(localStorage.getItem('usedLanguages') || '[]');
    if (usedLanguages.length >= 4) { // Все языки
        checkPolyglotAchievement();
    }
}

function checkSpeedrunnerAchievement() {
    // Проверяем, сколько достижений получено за последние 24 часа
    const now = new Date();
    const recentAchievements = Object.values(userAchievements).filter(ach => {
        const unlockedDate = new Date(ach.unlockedAt);
        return (now - unlockedDate) <= 24 * 60 * 60 * 1000;
    });
    
    if (recentAchievements.length >= 5) {
        checkAchievement('speedrunner');
    }
}

function updateAchievementsDisplay() {
    const container = document.getElementById('achievementsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Отображаем все достижения
    Object.entries(ACHIEVEMENTS).forEach(([id, achievement]) => {
        const userAchievement = userAchievements[id];
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${userAchievement ? 'unlocked' : 'locked'} ${achievement.rarity}`;
        
        achievementElement.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-meta">
                    <span class="achievement-rarity">${getRarityText(achievement.rarity)}</span>
                    <span class="achievement-points">${achievement.points} очков</span>
                </div>
            </div>
            <div class="achievement-status">
                ${userAchievement ? '✅' : '🔒'}
            </div>
        `;
        
        container.appendChild(achievementElement);
    });
    
    // Отображаем ежедневное задание
    const dailyChallenge = document.getElementById('dailyChallenge');
    if (dailyChallenge && dailyAchievements.length > 0) {
        const daily = dailyAchievements[0];
        dailyChallenge.innerHTML = `
            <div class="achievement daily unlocked">
                <div class="achievement-icon">${daily.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${daily.name}</div>
                    <div class="achievement-desc">${daily.description}</div>
                    <div class="achievement-points">+${daily.points} очков</div>
                </div>
            </div>
        `;
    }
}

function getRarityText(rarity) {
    const rarityTexts = {
        common: 'Обычное',
        rare: 'Редкое',
        epic: 'Эпическое',
        legendary: 'Легендарное',
        daily: 'Ежедневное'
    };
    return rarityTexts[rarity] || rarity;
}

// YouTube Data API
async function fetchYouTubeData() {
    const apiKey = localStorage.getItem('youtubeApiKey') || 'YOUR_YOUTUBE_API_KEY';
    const channelId = localStorage.getItem('youtubeChannelId') || 'YOUR_CHANNEL_ID';
    
    if (apiKey === 'YOUR_YOUTUBE_API_KEY') {
        // Демо-данные
        showDemoYouTubeData();
        return;
    }
    
    try {
        // Получаем последнее видео
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=1&order=date&type=video&key=${apiKey}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (searchData.items && searchData.items[0]) {
            const videoId = searchData.items[0].id.videoId;
            
            // Обновляем видео
            const youtubeVideo = document.getElementById('youtubeVideo');
            if (youtubeVideo) {
                youtubeVideo.src = `https://www.youtube.com/embed/${videoId}`;
            }
            
            const videoTitle = document.getElementById('videoTitle');
            
