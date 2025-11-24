// === КОНФИГУРАЦИЯ ===

// Ключ для YOUTUBE (статистика и видео)
const YOUTUBE_API_KEY = "AIzaSyASL1_rgK9P9-J2FK6uFwjObuwA8m1Cihg"; 
const YOUTUBE_CHANNEL_ID = "UCrZA2Mj6yKZkEcBIqdfF6Ag"; 

// Ключ для GEMINI (JahvirChat AI)
const GEMINI_API_KEY = "AIzaSyDDlr6C2i9XnXrNRTusikjBMdTxTloIlwY";
const GEMINI_MODEL = 'gemini-2.5-flash'; 

// ПРОМПТ
const SYSTEM_PROMPT = `
Ты JahvirChat помощник. НЕ Jahvir, а именно помощник по чату.
ТВОЯ ЛИЧНОСТЬ:
- Настроение: Хорошее, с легкой насмешкой.
- Про JAHVIR (Дава, Davajahvir): Ваще крутой чувак, блогер, стримит, снимает видосы, модерирует свой чат, сигма, повелитель.
- Если спросят "Кто такой голка": Отвечай только "да".
- Если говорят "осуди": Отвечай "осуууждаю".
- КОД и ДОМАШКА: Ты этим НЕ занимаешься. Отказывай.

ПРАВИЛА ЧАТА:
1. ЗАПРЕЩЕНО: Оскорбления, Шок-контент (18+), Политика/Религия, Спам, Тег админов без причины, Доксинг, Оффтопик, Реклама.
2. НАКАЗАНИЯ: Мут, Кик, Бан.

ФОРМАТИРОВАНИЕ:
Пиши читабельно. Используй переносы строк (Enter).
`;

const tg = window.Telegram.WebApp;
tg.expand(); 

// === STARTUP ===
window.onload = () => {
    console.log("App Started"); // Отладка
    loadTelegramUserData();
    
    // Темы
    const savedTheme = localStorage.getItem('axel_theme') || 'theme-system';
    const savedScheme = localStorage.getItem('axel_scheme') || 'scheme-ocean';
    applyTheme(savedTheme);
    applyScheme(savedScheme);
    
    document.getElementById('theme-select').value = savedTheme;
    document.getElementById('scheme-select').value = savedScheme;

    // Загрузка статистики
    loadYouTubeStats();
};

// === TELEGRAM USER ===
function loadTelegramUserData() {
    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');

    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        nameEl.innerText = user.first_name || 'User';
        
        // Аватарка
        if (user.photo_url) {
            avatarEl.src = user.photo_url;
        } else {
            avatarEl.src = `https://ui-avatars.com/api/?name=${user.first_name}&background=random&color=fff&bold=true`;
        }
        
        // Авто-тема
        if (localStorage.getItem('axel_theme') === 'theme-system') {
             if (tg.colorScheme === 'dark') document.body.classList.add('theme-dark');
        }
    } else {
        // Тест в браузере
        nameEl.innerText = "Tester";
        avatarEl.src = "https://via.placeholder.com/150"; 
    }
}

// === NAVIGATION ===
function toggleMenu() { document.getElementById('menu-dropdown').classList.toggle('hidden'); }
function toggleSettings() { document.getElementById('settings-modal').classList.toggle('hidden'); }

function navigate(pageId) {
    document.getElementById('menu-dropdown').classList.add('hidden');
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden-page'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    
    let targetId = 'page-placeholder';
    if (pageId === 'home') targetId = 'page-home';
    if (pageId === 'jahvir-ai') targetId = 'page-jahvir-ai';
    
    const target = document.getElementById(targetId);
    target.classList.remove('hidden-page');
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
let chatHistory = [];

function clearHistory() {
    chatHistory = [];
    document.getElementById('chat-output').innerHTML = '<div class="message bot">Память очищена.</div>';
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    input.value = '';
    input.disabled = true;

    // Память (последние 6 сообщений)
    if (chatHistory.length > 6) chatHistory = chatHistory.slice(-6);

    let contents = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }];
    chatHistory.forEach(msg => contents.push(msg));
    contents.push({ role: "user", parts: [{ text: text }] });

    // ИСПОЛЬЗУЕМ ПРАВИЛЬНЫЙ GEMINI KEY
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: contents })
        });
        const data = await res.json();

        if (data.error) {
            console.error("Gemini Error:", data.error);
            appendMessage("Ошибка ИИ: " + data.error.message, 'bot');
        } else {
            const reply = data.candidates[0].content.parts[0].text;
            chatHistory.push({ role: "user", parts: [{ text: text }] });
            chatHistory.push({ role: "model", parts: [{ text: reply }] });
            appendMessage(reply, 'bot');
        }
    } catch (e) {
        console.error("Network Error:", e);
        appendMessage("Нет интернета или сбой API.", 'bot');
    } finally {
        input.disabled = false;
        input.focus();
    }
}

function appendMessage(txt, type) {
    const box = document.getElementById('chat-output');
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper`;
    
    const div = document.createElement('div');
    div.className = `message ${type}`;
    // Markdown bold + newlines
    let formatted = txt.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    div.innerHTML = formatted;
    
    wrapper.appendChild(div);

    if (type === 'bot') {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<span class="material-icons-round" style="font-size:12px">content_copy</span> Коп.';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(txt);
            copyBtn.innerHTML = '<span class="material-icons-round" style="font-size:12px">check</span>';
            setTimeout(() => copyBtn.innerHTML = '<span class="material-icons-round" style="font-size:12px">content_copy</span> Коп.', 2000);
        };
        wrapper.appendChild(copyBtn);
        wrapper.style.alignItems = 'flex-start';
    } else {
        wrapper.style.alignItems = 'flex-end';
    }

    box.appendChild(wrapper);
    box.scrollTop = box.scrollHeight;
}

// === YOUTUBE API ===
async function loadYouTubeStats() {
    const subsEl = document.getElementById('yt-subs');
    const videoTitleEl = document.getElementById('yt-video');
    const videoContainer = document.getElementById('video-player-container');

    console.log("Загрузка YouTube...");

    try {
        // 1. ПОДПИСЧИКИ (Используем YOUTUBE_API_KEY)
        const chanRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
        
        if (!chanRes.ok) throw new Error(`Status ${chanRes.status}`);
        
        const chanData = await chanRes.json();
        
        if (chanData.items && chanData.items.length > 0) {
            const count = Number(chanData.items[0].statistics.subscriberCount);
            subsEl.innerText = count.toLocaleString(); 
        } else {
            subsEl.innerText = "Недоступно";
            console.warn("Канал не найден или скрыта статистика");
        }

        // 2. ПОСЛЕДНЕЕ ВИДЕО
        const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&order=date&maxResults=1&type=video`);
        
        if (!vidRes.ok) throw new Error(`Video Error ${vidRes.status}`);
        
        const vidData = await vidRes.json();
        
        if (vidData.items && vidData.items.length > 0) {
            const video = vidData.items[0];
            videoTitleEl.innerText = video.snippet.title;
            const videoId = video.id.videoId;
            videoContainer.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" title="Player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            videoTitleEl.innerText = "Нет видео";
        }

    } catch (e) {
        console.error("YouTube Fatal Error:", e);
        // Если ошибка 403 - значит квота кончилась или ключ не тот
        if (e.message.includes("403")) {
            subsEl.innerText = "Лимит API";
            videoTitleEl.innerText = "Ключ устал";
        } else {
            subsEl.innerText = "Ошибка";
            videoTitleEl.innerText = "Сбой сети";
        }
    }
}

document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
                
