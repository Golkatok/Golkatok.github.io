// === КОНФИГУРАЦИЯ ===

const YOUTUBE_API_KEY = "AIzaSyDDlr6C2i9XnXrNRTusikjBMdTxTloIlwY"; 
const YOUTUBE_CHANNEL_ID = "UCrZA2Mj6yKZkEcBIqdfF6Ag"; 
const GEMINI_MODEL = 'gemini-2.5-flash'; 

// ПОЛНЫЙ ПРОМПТ С CSV И ПРАВИЛАМИ
const SYSTEM_PROMPT = `
Ты JahvirChat помощник. НЕ Jahvir, а именно помощник по чату.
ТВОЯ ЛИЧНОСТЬ:
- Настроение: Хорошее, с легкой насмешкой.
- Про JAHVIR (Дава, Davajahvir): Ваще крутой чувак, блогер, стримит, снимает видосы, модерирует свой чат, сигма, повелитель.
- Если спросят "Кто такой голка": Отвечай только "да".
- Если говорят "осуди": Отвечай "осуууждаю".
- КОД и ДОМАШКА: Ты этим НЕ занимаешься. Отказывай.

ПРАВИЛА ЧАТА (СТРОГО):
1. ЗАПРЕЩЕНО:
- Оскорбление участников и администрации.
- Шокирующий контент (18+, жестокость, порнография).
- Обсуждение политики, религии, войны, феминизма, рас.
- Спам и флуд (более 4 сообщений подряд), спам в ЛС.
- Тег администрации без веской причины.
- Слив чужих данных (Доксинг).
- Оффтопик (не по теме).
- Ники с матом.
- Любая реклама и торговля.
- Обход правил.

2. НАКАЗАНИЯ:
- Мут (от 10 мин до 12 часов) - за спам, оск, флуд.
- Кик - за повторные нарушения.
- Бан - за рекламу, шок-контент, ботов, обман.

3. ДЛЯ АДМИНОВ:
- Им нельзя нарушать правила.
- Нельзя злоупотреблять правами.
- Наказание: снятие админки.

ФОРМАТИРОВАНИЕ:
Пиши читабельно. Используй переносы строк (Enter) между мыслями.
Не флиртуй с пользователем. Будь краток и полезен.
`;

const tg = window.Telegram.WebApp;
tg.expand(); 

// === STARTUP ===
window.onload = () => {
    loadTelegramUserData();
    
    // Восстановление темы
    const savedTheme = localStorage.getItem('axel_theme') || 'theme-system';
    const savedScheme = localStorage.getItem('axel_scheme') || 'scheme-ocean';
    applyTheme(savedTheme);
    applyScheme(savedScheme);
    
    document.getElementById('theme-select').value = savedTheme;
    document.getElementById('scheme-select').value = savedScheme;

    loadYouTubeStats();
};

// === TELEGRAM USER ===
function loadTelegramUserData() {
    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');

    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        nameEl.innerText = user.first_name || 'User';
        
        if (user.photo_url) {
            avatarEl.src = user.photo_url;
        } else {
            avatarEl.src = `https://ui-avatars.com/api/?name=${user.first_name}&background=random&color=fff&bold=true`;
        }
        
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
    const chatBox = document.getElementById('chat-output');
    chatBox.innerHTML = '<div class="message bot">Память очищена.</div>';
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    input.value = '';
    input.disabled = true;

    // Память (последние 3 обмена)
    if (chatHistory.length > 6) chatHistory = chatHistory.slice(-6);

    let contents = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }];
    chatHistory.forEach(msg => contents.push(msg));
    contents.push({ role: "user", parts: [{ text: text }] });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${YOUTUBE_API_KEY}`;
    // ВНИМАНИЕ: Тут я использую YOUTUBE_API_KEY, потому что в прошлом промпте ты дал один ключ на всё.
    // Если для Gemini нужен другой ключ, замени YOUTUBE_API_KEY на свою переменную.
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: contents })
        });
        const data = await res.json();

        if (data.error) {
            appendMessage("Ошибка API: " + data.error.message, 'bot');
        } else {
            const reply = data.candidates[0].content.parts[0].text;
            chatHistory.push({ role: "user", parts: [{ text: text }] });
            chatHistory.push({ role: "model", parts: [{ text: reply }] });
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
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper`;
    
    const div = document.createElement('div');
    div.className = `message ${type}`;
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

// === YOUTUBE API (С ОТЛАДКОЙ) ===
async function loadYouTubeStats() {
    const subsEl = document.getElementById('yt-subs');
    const videoTitleEl = document.getElementById('yt-video');
    const videoPreviewContainer = document.getElementById('video-preview-container');

    try {
        // 1. Подписчики
        const chanRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
        
        if (!chanRes.ok) {
            // Если ошибка (например 403), выводим код
            throw new Error(`Ошибка ${chanRes.status}`);
        }
        
        const chanData = await chanRes.json();
        
        if (chanData.items && chanData.items.length > 0) {
            subsEl.innerText = Number(chanData.items[0].statistics.subscriberCount).toLocaleString();
        } else {
            subsEl.innerText = "Канал не найден";
        }

        // 2. Последнее видео
        const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&order=date&maxResults=1`);
        
        if (!vidRes.ok) throw new Error(`Ошибка ${vidRes.status}`);
        
        const vidData = await vidRes.json();
        
        if (vidData.items && vidData.items.length > 0) {
            const video = vidData.items[0];
            videoTitleEl.innerText = video.snippet.title;
            
            // Картинка
            const thumbs = video.snippet.thumbnails;
            const thumbUrl = thumbs.maxres ? thumbs.maxres.url : (thumbs.high ? thumbs.high.url : thumbs.medium.url);
            
            videoPreviewContainer.innerHTML = `<img src="${thumbUrl}" alt="Preview" style="width:100%; height:100%; object-fit:cover; border-radius: 10px;">`;
        } else {
            videoTitleEl.innerText = "Видео нет";
        }

    } catch (e) {
        console.error("Youtube Error:", e);
        subsEl.innerText = e.message; // Покажем "Ошибка 403" если ключ забанен
        videoTitleEl.innerText = "Сбой API";
    }
}

document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
        
