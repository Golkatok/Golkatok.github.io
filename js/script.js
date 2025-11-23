// === КОНФИГУРАЦИИ ===

// ВАШИ КЛЮЧИ (ЖЕСТКО ЗАШИТЫ)
const YOUTUBE_API_KEY = "AIzaSyD3opTxFhIJSNfJILXGRxuWSbFpmyxEuzc"; 
const YOUTUBE_CHANNEL_ID = "UCrZA2Mj6yKZkEcBIqdfF6Ag"; 

// AI МОДЕЛЬ
const GEMINI_MODEL = 'gemini-2.5-flash'; 

// ПРОМПТ (Интегрированы правила из CSV)
const SYSTEM_PROMPT = `
Ты JahvirChat ИИ. 
ТВОЯ ЛИЧНОСТЬ:
- Настроение: Хорошее, с легкой насмешкой.
- Ты помогаешь со всем, КРОМЕ написания кода и домашнего задания (вежливо отказывай).
- Если пользователь пишет "осуди" (или склонения), ты отвечаешь строго: "осуууждаю".

ТВОИ ЗНАНИЯ (ПРАВИЛА ЧАТА):
В чате ЗАПРЕЩЕНО:
1. Оскорбление участников и администрации.
2. Шокирующий контент (18+, жестокость).
3. Обсуждение политики, религии, войны, феминизма.
4. Спам, флуд, спам в ЛС.
5. Тегать администрацию без веской причины.
6. Слив чужих данных (Доксинг).
7. Оффтопик (сообщение не по теме).
8. Ники с матом.
9. Реклама и торговля чем-либо.
10. Обход правил.

НАКАЗАНИЯ (Ты можешь их цитировать, но не выдаешь):
- Мут (от 10 минут до 12 часов) за легкие нарушения.
- Кик (удаление из чата) за средние.
- Бан (от временного до навсегда) за рекламу, шок-контент, обман, спам ботами.
- Администрации также запрещено нарушать правила.
`;

// === INIT TELEGRAM ===
const tg = window.Telegram.WebApp;
tg.expand(); 

let geminiKey = localStorage.getItem('axel_gemini_key') || '';

// === STARTUP ===
window.onload = () => {
    loadTelegramUserData();
    
    // Theme & Scheme
    const savedTheme = localStorage.getItem('axel_theme') || 'theme-system';
    const savedScheme = localStorage.getItem('axel_scheme') || 'scheme-ocean';
    applyTheme(savedTheme);
    applyScheme(savedScheme);
    
    // UI Values
    document.getElementById('theme-select').value = savedTheme;
    document.getElementById('scheme-select').value = savedScheme;
    document.getElementById('gemini-key-input').value = geminiKey;

    loadYouTubeStats();
    checkAIStatus();
};

// === TELEGRAM DATA ===
function loadTelegramUserData() {
    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');

    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        nameEl.innerText = user.first_name || 'User';
        
        if (user.photo_url) {
            avatarEl.src = user.photo_url;
        } else {
            avatarEl.src = `https://ui-avatars.com/api/?name=${user.first_name}&background=random&color=fff`;
        }
        
        // Auto-dark theme from Telegram
        if (localStorage.getItem('axel_theme') === 'theme-system') {
             if (tg.colorScheme === 'dark') document.body.classList.add('theme-dark');
        }
    } else {
        nameEl.innerText = "Tester";
        avatarEl.src = "https://via.placeholder.com/150"; 
    }
}

// === NAVIGATION ===
function toggleMenu() { document.getElementById('menu-dropdown').classList.toggle('hidden'); }
function toggleSettings() { document.getElementById('settings-modal').classList.toggle('hidden'); }
function toggleHelp() { document.getElementById('help-modal').classList.toggle('hidden'); }

// Open AI Studio in same tab
function openAiStudio() {
    window.location.href = "https://aistudio.google.com/app/apikey";
}

function navigate(pageId) {
    document.getElementById('menu-dropdown').classList.add('hidden');
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden-page'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    
    // Mapping pages
    let targetId = 'page-placeholder';
    if (pageId === 'home') targetId = 'page-home';
    if (pageId === 'jahvir-ai') targetId = 'page-jahvir-ai';
    
    const target = document.getElementById(targetId);
    target.classList.remove('hidden-page');
    // Small delay for animation trigger if needed, or CSS class
    setTimeout(() => target.classList.add('active-page'), 10);
}

// === THEME MANAGER ===
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

// === AI LOGIC ===
function saveGeminiKey(val) {
    geminiKey = val.trim();
    localStorage.setItem('axel_gemini_key', geminiKey);
    checkAIStatus();
}

function checkAIStatus() {
    const statusEl = document.getElementById('ai-status');
    const inputEl = document.getElementById('chat-input');
    const btnEl = document.getElementById('send-btn');

    if (geminiKey.length > 10) { 
        statusEl.innerText = "Online";
        statusEl.className = "status-text online";
        inputEl.disabled = false;
        inputEl.placeholder = "Спроси меня о чем-нибудь...";
        btnEl.disabled = false;
    } else {
        statusEl.innerText = "Offline (Нужен ключ)";
        statusEl.className = "status-text offline";
        inputEl.disabled = true;
        inputEl.placeholder = "Введите ключ в настройках";
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
            appendMessage("Ошибка API: " + data.error.message, 'bot');
        } else {
            const reply = data.candidates[0].content.parts[0].text;
            appendMessage(reply, 'bot');
        }
    } catch (e) {
        appendMessage("Ошибка сети.", 'bot');
    } finally {
        input.disabled = false;
        input.focus();
    }
}

function appendMessage(txt, type) {
    const box = document.getElementById('chat-output');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = txt.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); 
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

// === YOUTUBE API ===
async function loadYouTubeStats() {
    const subsEl = document.getElementById('yt-subs');
    const videoEl = document.getElementById('yt-video');

    try {
        // Subs
        const chanRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
        const chanData = await chanRes.json();
        
        if (chanData.items) {
            subsEl.innerText = Number(chanData.items[0].statistics.subscriberCount).toLocaleString();
        }

        // Video
        const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&order=date&maxResults=1`);
        const vidData = await vidRes.json();
        
        if (vidData.items && vidData.items.length > 0) {
            videoEl.innerText = vidData.items[0].snippet.title;
        } else {
            videoEl.innerText = "Нет видео";
        }
    } catch (e) {
        console.error("Youtube Error:", e);
        subsEl.innerText = "Err";
    }
}

document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
