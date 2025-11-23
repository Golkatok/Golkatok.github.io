// === КОНФИГУРАЦИЯ AXEL AI ===
// Меняй этот текст, чтобы изменить характер ИИ
const SYSTEM_PROMPT = "Ты Axel AI. Твой тон: дерзкий, молодежный, но полезный. Ты эксперт в кодинге. Отвечай кратко и по делу.";

// === УПРАВЛЕНИЕ СОСТОЯНИЕМ ===
const state = {
    theme: localStorage.getItem('axel_theme') || 'theme-system',
    scheme: localStorage.getItem('axel_scheme') || 'scheme-ocean',
    geminiKey: localStorage.getItem('axel_gemini_key') || '',
    ytKey: localStorage.getItem('axel_yt_key') || '',
    ytChannel: localStorage.getItem('axel_yt_channel') || '',
    lang: 'ru'
};

// === ИНИЦИАЛИЗАЦИЯ ===
window.onload = () => {
    applyTheme(state.theme);
    applyScheme(state.scheme);
    
    // Заполняем поля настроек
    document.getElementById('theme-select').value = state.theme;
    document.getElementById('scheme-select').value = state.scheme;
    document.getElementById('gemini-key-input').value = state.geminiKey;
    document.getElementById('yt-key-input').value = state.ytKey;
    document.getElementById('yt-channel-input').value = state.ytChannel;

    loadYouTubeStats();
};

// === НАВИГАЦИЯ И UI ===
function toggleMenu() {
    const menu = document.getElementById('menu-dropdown');
    menu.classList.toggle('hidden');
}

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.toggle('hidden');
}

function navigate(page) {
    // Скрываем меню
    document.getElementById('menu-dropdown').classList.add('hidden');
    
    // Переключаем страницы
    document.querySelectorAll('.page').forEach(el => el.classList.add('hidden-page'));
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active-page'));
    
    const target = document.getElementById(`page-${page}`) || document.getElementById('page-placeholder');
    target.classList.remove('hidden-page');
    target.classList.add('active-page');
}

// === ТЕМЫ И СХЕМЫ ===
function changeTheme(val) {
    state.theme = val;
    applyTheme(val);
}

function applyTheme(themeName) {
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-system');
    if (themeName === 'theme-system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.add(isDark ? 'theme-dark' : 'theme-light');
    } else {
        document.body.classList.add(themeName);
    }
}

function changeScheme(val) {
    state.scheme = val;
    applyScheme(val);
}

function applyScheme(schemeName) {
    document.body.className = document.body.className.replace(/scheme-\w+/g, '');
    document.body.classList.add(schemeName);
}

function saveSettingsAndClose() {
    state.geminiKey = document.getElementById('gemini-key-input').value.trim();
    state.ytKey = document.getElementById('yt-key-input').value.trim();
    state.ytChannel = document.getElementById('yt-channel-input').value.trim();
    
    localStorage.setItem('axel_theme', state.theme);
    localStorage.setItem('axel_scheme', state.scheme);
    localStorage.setItem('axel_gemini_key', state.geminiKey);
    localStorage.setItem('axel_yt_key', state.ytKey);
    localStorage.setItem('axel_yt_channel', state.ytChannel);
    
    toggleSettings();
    loadYouTubeStats(); // Обновить данные, если ключи изменились
}

// === YOUTUBE API (РЕАЛЬНЫЙ) ===
async function loadYouTubeStats() {
    const subsEl = document.getElementById('yt-subs');
    const videoEl = document.getElementById('yt-video');

    if (!state.ytKey || !state.ytChannel) {
        subsEl.innerText = "Нет API Key";
        videoEl.innerText = "Укажите ключ в настройках";
        return;
    }

    try {
        // 1. Получаем подписчиков
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${state.ytChannel}&key=${state.ytKey}`;
        const channelRes = await fetch(channelUrl);
        const channelData = await channelRes.json();
        
        if (channelData.items && channelData.items.length > 0) {
            const subs = channelData.items[0].statistics.subscriberCount;
            subsEl.innerText = Number(subs).toLocaleString();
        }

        // 2. Получаем последнее видео
        const videoUrl = `https://www.googleapis.com/youtube/v3/search?key=${state.ytKey}&channelId=${state.ytChannel}&part=snippet,id&order=date&maxResults=1`;
        const videoRes = await fetch(videoUrl);
        const videoData = await videoRes.json();

        if (videoData.items && videoData.items.length > 0) {
            videoEl.innerText = videoData.items[0].snippet.title;
        } else {
            videoEl.innerText = "Нет видео";
        }

    } catch (e) {
        console.error(e);
        subsEl.innerText = "Ошибка";
        videoEl.innerText = "Ошибка API";
    }
}

// === GEMINI AI CHAT ===
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    if (!state.geminiKey) {
        alert("Введите API ключ Gemini в настройках!");
        toggleSettings();
        return;
    }

    // UI: Добавить сообщение юзера
    addMessage(text, 'user');
    input.value = '';
    input.disabled = true;

    // Формируем запрос
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${state.geminiKey}`;
    const payload = {
        contents: [{
            parts: [{ text: `${SYSTEM_PROMPT}\nUser message: ${text}` }]
        }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (data.error) {
            addMessage("Ошибка API: " + data.error.message, 'bot');
        } else {
            const answer = data.candidates[0].content.parts[0].text;
            addMessage(answer, 'bot');
        }
    } catch (e) {
        addMessage("Ошибка соединения.", 'bot');
    } finally {
        input.disabled = false;
        input.focus();
    }
}

function addMessage(text, type) {
    const chatDiv = document.getElementById('chat-output');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);
    
    // Простой рендеринг Markdown (жирный текст)
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    msgDiv.innerHTML = formattedText;
    
    chatDiv.appendChild(msgDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

// Enter для отправки
document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
