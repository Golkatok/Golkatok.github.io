// === КОНФИГУРАЦИИ ===

// 1. НАСТРОЙКИ YOUTUBE
// Вставьте ваши ключи прямо сюда:
const YOUTUBE_API_KEY = "ВСТАВЬТЕ_ВАШ_КЛЮЧ_YOUTUBE_API"; 
const YOUTUBE_CHANNEL_ID = "UC_ВСТАВЬТЕ_ID_КАНАЛА"; 

// 2. НАСТРОЙКИ AI (Обновлено: Gemini 2.5 Flash)
// Актуальные модели: 'gemini-2.5-flash' (быстрая) или 'gemini-3.0-pro' (мощная)
const GEMINI_MODEL = 'gemini-2.5-flash'; 

const SYSTEM_PROMPT = "Ты Axel AI. Твой стиль: краткий, дерзкий, молодежный. Ты помогаешь с кодом и любишь игры.";

// === TELEGRAM WEB APP INIT ===
const tg = window.Telegram.WebApp;
tg.expand(); // На весь экран

// === СОСТОЯНИЕ ===
let geminiKey = localStorage.getItem('axel_gemini_key') || '';

// === ИНИЦИАЛИЗАЦИЯ ===
window.onload = () => {
    // Данные юзера из Телеграм
    loadTelegramUserData();

    // Темы и настройки
    const savedTheme = localStorage.getItem('axel_theme') || 'theme-system';
    const savedScheme = localStorage.getItem('axel_scheme') || 'scheme-ocean';
    applyTheme(savedTheme);
    applyScheme(savedScheme);
    
    // Заполнение UI
    document.getElementById('theme-select').value = savedTheme;
    document.getElementById('scheme-select').value = savedScheme;
    document.getElementById('gemini-key-input').value = geminiKey;

    // Загрузка статистики YT
    loadYouTubeStats();

    // Проверка статуса ИИ
    checkAIStatus();
};

// === ЛОГИКА TELEGRAM ===
function loadTelegramUserData() {
    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');

    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        nameEl.innerText = user.first_name || 'User';
        
        if (user.photo_url) {
            avatarEl.src = user.photo_url;
        } else {
            avatarEl.src = `https://ui-avatars.com/api/?name=${user.first_name}&background=random`;
        }
        
        // Синхронизация темы с Telegram
        if (localStorage.getItem('axel_theme') === 'theme-system') {
             if (tg.colorScheme === 'dark') document.body.classList.add('theme-dark');
        }
    } else {
        // Тестовый режим (в браузере)
        nameEl.innerText = "Tester";
        avatarEl.src = "https://via.placeholder.com/150"; 
    }
}

// === НАВИГАЦИЯ ===
function toggleMenu() { document.getElementById('menu-dropdown').classList.toggle('hidden'); }
function toggleSettings() { document.getElementById('settings-modal').classList.toggle('hidden'); }

function navigate(pageId) {
    document.getElementById('menu-dropdown').classList.add('hidden');
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden-page'));
    
    const target = document.getElementById('page-' + pageId) || document.getElementById('page-placeholder');
    target.classList.remove('hidden-page');
    target.classList.add('active-page');
}

// === ТЕМЫ И СХЕМЫ ===
function changeTheme(val) {
    localStorage.setItem('axel_theme', val);
    applyTheme(val);
}
function applyTheme(val) {
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-system');
    if (val === 'theme-system') {
        if (tg.colorScheme === 'dark' || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.add('theme-light');
        }
    } else {
        document.body.classList.add(val);
    }
}
function changeScheme(val) {
    localStorage.setItem('axel_scheme', val);
    applyScheme(val);
}
function applyScheme(val) {
    document.body.className = document.body.className.replace(/scheme-\w+/g, '');
    document.body.classList.add(val);
}

// === AI LOGIC (GEMINI 2.5 FLASH) ===
function saveGeminiKey(val) {
    geminiKey = val.trim();
    localStorage.setItem('axel_gemini_key', geminiKey);
    checkAIStatus();
}

function checkAIStatus() {
    const statusEl = document.getElementById('ai-status');
    const inputEl = document.getElementById('chat-input');
    const btnEl = document.getElementById('send-btn');

    // Если ключа нет - Оффлайн
    if (geminiKey.length > 5) { 
        statusEl.innerText = "Online (v2.5)";
        statusEl.className = "status-text online";
        inputEl.disabled = false;
        inputEl.placeholder = "Напиши что-нибудь...";
        btnEl.disabled = false;
    } else {
        statusEl.innerText = "Offline (Нет ключа)";
        statusEl.className = "status-text offline";
        inputEl.disabled = true;
        inputEl.placeholder = "Введите API Key в настройках";
        btnEl.disabled = true;
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    input.value = '';
    input.disabled = true;

    // Запрос к актуальной версии
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`;
    
    const payload = {
        contents: [{ parts: [{ text: SYSTEM_PROMPT + "\nUser: " + text }] }]
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.error) {
            // Если 2.5 вдруг недоступна для конкретного ключа, выводим ошибку
            appendMessage("Ошибка API: " + data.error.message, 'bot');
        } else {
            const reply = data.candidates[0].content.parts[0].text;
            appendMessage(reply, 'bot');
        }
    } catch (e) {
        appendMessage("Ошибка сети или неверная модель.", 'bot');
    } finally {
        input.disabled = false;
        input.focus();
    }
}

function appendMessage(txt, type) {
    const box = document.getElementById('chat-output');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = txt.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // Markdown Bold
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

// === YOUTUBE API V3 ===
async function loadYouTubeStats() {
    const subsEl = document.getElementById('yt-subs');
    const videoEl = document.getElementById('yt-video');

    // Проверка, не забыли ли заменить заглушку
    if (YOUTUBE_API_KEY.includes("ВСТАВЬТЕ")) {
        subsEl.innerText = "Вставь API Key";
        videoEl.innerText = "в код script.js";
        return;
    }

    try {
        // Подписчики
        const chanRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
        const chanData = await chanRes.json();
        
        if (chanData.items) {
            const count = Number(chanData.items[0].statistics.subscriberCount);
            subsEl.innerText = count.toLocaleString();
        } else {
             subsEl.innerText = "Ошибка ID";
        }

        // Последнее видео
        const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&order=date&maxResults=1`);
        const vidData = await vidRes.json();
        
        if (vidData.items && vidData.items.length > 0) {
            videoEl.innerText = vidData.items[0].snippet.title;
        } else {
            videoEl.innerText = "Видео не найдены";
        }
    } catch (e) {
        console.error("Youtube Error:", e);
        subsEl.innerText = "Err";
    }
}

// Enter для отправки
document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
    
