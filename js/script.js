/**
 * Axel Hub Core Logic
 * Complete implementation of original functionality in SPA structure.
 */

const CONFIG = {
    defaultChannelId: 'UCrZA2Mj6yKZkEcBIqdfF6Ag', // Твой канал по умолчанию
    defaultVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Заглушка
};

// Словарь переводов
const TRANSLATIONS = {
    ru: { greeting: 'Привет', subscribers: 'подписчиков', lastVideo: 'Последний ролик', navigation: 'Навигация', home: 'Главная', social: 'Соц. Сети', news: 'Новости', games: 'Мини-игры', settings: 'Настройки', theme: 'Тема', colorScheme: 'Схема', language: 'Язык', achievements: 'Достижения', authTitle: 'Авторизация', authText: 'Войдите для персонализации', cookiesText: 'Мы используем cookies.', accept: 'Принять', decline: 'Отклонить', light: 'Светлая', dark: 'Тёмная', auto: 'Системная' },
    en: { greeting: 'Hello', subscribers: 'subscribers', lastVideo: 'Last Video', navigation: 'Navigation', home: 'Home', social: 'Social', news: 'News', games: 'Mini-Games', settings: 'Settings', theme: 'Theme', colorScheme: 'Scheme', language: 'Language', achievements: 'Achievements', authTitle: 'Login', authText: 'Login via Telegram', cookiesText: 'We use cookies.', accept: 'Accept', decline: 'Decline', light: 'Light', dark: 'Dark', auto: 'System' },
    uk: { greeting: 'Привіт', subscribers: 'підписників', lastVideo: 'Останнє відео', navigation: 'Навігація', home: 'Головна', social: 'Соц. Мережі', news: 'Новини', games: 'Міні-ігри', settings: 'Налаштування', theme: 'Тема', colorScheme: 'Схема', language: 'Мова', achievements: 'Досягнення', authTitle: 'Авторизація', authText: 'Увійдіть через Telegram', cookiesText: 'Ми використовуємо cookies.', accept: 'Прийняти', decline: 'Відхилити', light: 'Світла', dark: 'Темна', auto: 'Системна' },
    be: { greeting: 'Прывітанне', subscribers: 'падпісчыкаў', lastVideo: 'Апошняе відэа', navigation: 'Навігацыя', home: 'Галоўная', social: 'Сац. Сеткі', news: 'Навіны', games: 'Міні-гульні', settings: 'Налады', theme: 'Тэма', colorScheme: 'Схема', language: 'Мова', achievements: 'Дасягненні', authTitle: 'Аўтарызацыя', authText: 'Увайдзіце праз Telegram', cookiesText: 'Мы выкарыстоўваем cookies.', accept: 'Прыняць', decline: 'Адхіліць', light: 'Светлая', dark: 'Цёмная', auto: 'Сістэмная' }
};

class App {
    constructor() {
        this.settings = new SettingsManager();
        this.ui = new UIManager();
        this.i18n = new LanguageManager();
        this.auth = new AuthManager();
        this.achievements = new AchievementManager();
        this.social = new SocialManager(this.settings);
        this.chat = new ChatBot(this.settings, this.achievements);

        this.init();
    }

    init() {
        this.settings.load();
        this.i18n.setLanguage(this.settings.get('language') || 'ru');
        this.ui.bindEvents();
        this.chat.bindEvents();
        this.auth.check();
        this.achievements.render();
        
        // Загрузка данных с задержкой, чтобы не блокировать UI
        setTimeout(() => this.social.loadYouTubeStats(), 1000);
    }
}

class SettingsManager {
    constructor() {
        this.inputs = {
            theme: document.getElementById('themeSelect'),
            scheme: document.getElementById('colorSchemeSelect'),
            lang: document.getElementById('languageSelect'),
            aiKey: document.getElementById('googleAIKey'),
            ytKey: document.getElementById('youtubeApiKey'),
            channelId: document.getElementById('youtubeChannelId')
        };
        this.bindEvents();
    }

    bindEvents() {
        this.inputs.theme.addEventListener('change', (e) => this.update('theme', e.target.value));
        this.inputs.scheme.addEventListener('change', (e) => this.update('scheme', e.target.value));
        this.inputs.lang.addEventListener('change', (e) => {
            this.update('language', e.target.value);
            window.app.i18n.setLanguage(e.target.value);
        });
        
        ['aiKey', 'ytKey', 'channelId'].forEach(key => {
            this.inputs[key].addEventListener('change', (e) => this.update(key, e.target.value));
        });
    }

    update(key, value) {
        localStorage.setItem(`axel_${key}`, value);
        this.apply(key, value);
        
        // Триггер обновления данных при смене ключей
        if (key === 'ytKey' || key === 'channelId') window.app.social.loadYouTubeStats();
    }

    get(key) { return localStorage.getItem(`axel_${key}`); }

    load() {
        const defaults = { theme: 'light', scheme: 'sunset', language: 'ru', channelId: CONFIG.defaultChannelId };
        
        for (const [key, input] of Object.entries(this.inputs)) {
            const val = this.get(key) || defaults[key] || '';
            input.value = val;
            this.apply(key, val);
        }
    }

    apply(key, value) {
        if (key === 'theme') {
            if (value === 'auto') {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
            } else {
                document.documentElement.setAttribute('data-theme', value);
            }
        }
        if (key === 'scheme') document.documentElement.setAttribute('data-color-scheme', value);
    }
}

class LanguageManager {
    setLanguage(lang) {
        const t = TRANSLATIONS[lang] || TRANSLATIONS.ru;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });
    }
}

class UIManager {
    constructor() {
        this.sections = document.querySelectorAll('main section');
        this.modals = document.querySelectorAll('.modal');
    }

    bindEvents() {
        // Открытие модалок
        document.getElementById('btn-menu').onclick = () => this.openModal('modal-menu');
        document.getElementById('btn-settings').onclick = () => this.openModal('modal-settings');
        document.getElementById('btn-achievements').onclick = () => this.openModal('modal-achievements');

        // Закрытие
        document.querySelectorAll('.close').forEach(btn => {
            btn.onclick = (e) => document.getElementById(e.target.dataset.close).style.display = 'none';
        });

        window.onclick = (e) => {
            if (e.target.classList.contains('modal')) e.target.style.display = 'none';
        };

        // Навигация
        document.querySelectorAll('.menu-link').forEach(btn => {
            btn.onclick = () => {
                this.switchSection(btn.dataset.target);
                document.getElementById('modal-menu').style.display = 'none';
            };
        });
    }

    openModal(id) {
        document.getElementById(id).style.display = 'flex';
    }

    switchSection(id) {
        this.sections.forEach(s => {
            s.classList.remove('active-section');
            s.classList.add('hidden-section');
        });
        const target = document.getElementById(id);
        if (target) {
            target.classList.remove('hidden-section');
            target.classList.add('active-section');
        }
    }

    showToast(msg) {
        const div = document.createElement('div');
        div.className = 'notification';
        div.textContent = msg;
        document.body.appendChild(div);
        setTimeout(() => div.classList.add('show'), 100);
        setTimeout(() => {
            div.classList.remove('show');
            setTimeout(() => div.remove(), 300);
        }, 3000);
    }
}

class AchievementManager {
    constructor() {
        this.list = [
            { id: 'login', title: 'Начало пути', desc: 'Войти в систему', icon: 'fa-door-open' },
            { id: 'chat_first', title: 'Первый контакт', desc: 'Написать Axel AI', icon: 'fa-comment' },
            { id: 'settings_tweak', title: 'Инженер', desc: 'Изменить настройки', icon: 'fa-cogs' }
        ];
        this.unlocked = JSON.parse(localStorage.getItem('axel_achievements') || '[]');
    }

    unlock(id) {
        if (!this.unlocked.includes(id)) {
            this.unlocked.push(id);
            localStorage.setItem('axel_achievements', JSON.stringify(this.unlocked));
            this.render();
            window.app.ui.showToast(`🏆 Достижение: ${this.list.find(a => a.id === id).title}`);
        }
    }

    render() {
        const container = document.getElementById('achievementsList');
        container.innerHTML = this.list.map(a => {
            const isUnlocked = this.unlocked.includes(a.id);
            return `
                <div class="achievement-item ${isUnlocked ? 'unlocked' : ''}">
                    <i class="fas ${a.icon} achievement-icon"></i>
                    <div>
                        <strong>${a.title}</strong>
                        <div style="font-size:0.8em">${a.desc}</div>
                    </div>
                    ${isUnlocked ? '<i class="fas fa-check" style="margin-left:auto;color:green"></i>' : '<i class="fas fa-lock" style="margin-left:auto"></i>'}
                </div>
            `;
        }).join('');
    }
}

class ChatBot {
    constructor(settings, achievements) {
        this.settings = settings;
        this.achievements = achievements;
        this.history = [];
        this.dom = {
            input: document.getElementById('chatInput'),
            send: document.getElementById('sendMessage'),
            clear: document.getElementById('clearChat'),
            msgs: document.getElementById('chatMessages')
        };
        this.isBusy = false;
    }

    bindEvents() {
        this.dom.send.onclick = () => this.send();
        this.dom.input.onkeypress = (e) => { if(e.key === 'Enter') this.send(); };
        this.dom.clear.onclick = () => {
            this.dom.msgs.innerHTML = '';
            this.history = [];
        };
    }

    async send() {
        const text = this.dom.input.value.trim();
        if (!text || this.isBusy) return;

        this.addMsg(text, 'user');
        this.dom.input.value = '';
        this.achievements.unlock('chat_first');
        
        const apiKey = this.settings.get('aiKey');
        if (!apiKey) {
            setTimeout(() => this.addMsg('⚠️ Нужен API ключ Google AI Studio в настройках.', 'ai'), 500);
            return;
        }

        this.isBusy = true;
        this.showTyping();

        try {
            const reply = await this.fetchGemini(text, apiKey);
            this.removeTyping();
            this.addMsg(reply, 'ai');
        } catch (e) {
            this.removeTyping();
            this.addMsg(`Ошибка: ${e.message}`, 'ai');
        }
        this.isBusy = false;
    }

    async fetchGemini(text, key) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`;
        const payload = {
            contents: [...this.history.slice(-5).map(m => ({ role: m.role==='ai'?'model':'user', parts:[{text:m.text}] })), { role: 'user', parts:[{text}] }]
        };
        const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload), headers: {'Content-Type': 'application/json'} });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error?.message || 'API Error');
        return data.candidates[0].content.parts[0].text;
    }

    addMsg(text, role) {
        const div = document.createElement('div');
        div.className = `message ${role === 'user' ? 'user-message' : 'ai-message'}`;
        div.innerHTML = `
            <div class="message-avatar"><i class="fas ${role==='user'?'fa-user':'fa-robot'}"></i></div>
            <div class="message-content">${text.replace(/\n/g, '<br>')}</div>
        `;
        this.dom.msgs.appendChild(div);
        this.dom.msgs.scrollTop = this.dom.msgs.scrollHeight;
        this.history.push({ role, text });
    }

    showTyping() {
        const div = document.createElement('div');
        div.id = 'typing'; div.className = 'message ai-message';
        div.innerHTML = `<div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content">...</div>`;
        this.dom.msgs.appendChild(div);
        this.dom.msgs.scrollTop = this.dom.msgs.scrollHeight;
    }
    removeTyping() { document.getElementById('typing')?.remove(); }
}

class SocialManager {
    constructor(settings) {
        this.settings = settings;
    }

    async loadYouTubeStats() {
        const key = this.settings.get('ytKey');
        const channelId = this.settings.get('channelId') || CONFIG.defaultChannelId;
        
        if (!key) return; // Без ключа не грузим

        try {
            // 1. Получаем статистику канала
            const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${key}`);
            const channelData = await channelRes.json();
            
            if (channelData.items?.[0]) {
                const stats = channelData.items[0].statistics;
                const count = parseInt(stats.subscriberCount).toLocaleString();
                document.getElementById('subscriberCount').textContent = count;
            }

            // 2. Получаем последнее видео
            const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${key}&channelId=${channelId}&part=snippet,id&order=date&maxResults=1`);
            const searchData = await searchRes.json();

            if (searchData.items?.[0]) {
                const videoId = searchData.items[0].id.videoId;
                const snippet = searchData.items[0].snippet;
                
                document.getElementById('youtubeVideo').src = `https://www.youtube.com/embed/${videoId}`;
                document.getElementById('videoTitle').textContent = snippet.title;
                document.getElementById('videoDate').textContent = new Date(snippet.publishedAt).toLocaleDateString();

                // 3. Статистика видео
                const vidStatsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${key}`);
                const vidStatsData = await vidStatsRes.json();
                if (vidStatsData.items?.[0]) {
                    const vStats = vidStatsData.items[0].statistics;
                    document.getElementById('viewCount').textContent = parseInt(vStats.viewCount).toLocaleString();
                    document.getElementById('likeCount').textContent = parseInt(vStats.likeCount).toLocaleString();
                }
            }
        } catch (e) {
            console.error('YouTube API Error:', e);
        }
    }
}

class AuthManager {
    constructor() {
        this.modal = document.getElementById('modal-auth');
        this.cookiesModal = document.getElementById('modal-cookies');
    }

    check() {
        const user = localStorage.getItem('axel_user');
        const cookies = localStorage.getItem('axel_cookies');

        if (!user) {
            setTimeout(() => this.modal.style.display = 'flex', 1000);
        } else {
            this.updateGreeting(JSON.parse(user));
        }

        if (!cookies && user) {
            setTimeout(() => this.cookiesModal.style.display = 'flex', 2000);
        }

        // Mock Auth Handler
        document.getElementById('mockAuthBtn').onclick = () => {
            const mockUser = { first_name: 'Тестер' };
            localStorage.setItem('axel_user', JSON.stringify(mockUser));
            this.updateGreeting(mockUser);
            this.modal.style.display = 'none';
            window.app.achievements.unlock('login');
            if (!cookies) this.cookiesModal.style.display = 'flex';
        };

        // Cookies Handlers
        document.getElementById('acceptCookies').onclick = () => {
            localStorage.setItem('axel_cookies', 'true');
            this.cookiesModal.style.display = 'none';
        };
        document.getElementById('declineCookies').onclick = () => this.cookiesModal.style.display = 'none';
    }

    updateGreeting(user) {
        document.getElementById('user-name').textContent = user.first_name || 'Друг';
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => window.app = new App());
                
