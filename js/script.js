// === КОНФИГУРАЦИЯ ===

// Ключи
const YOUTUBE_API_KEY = "AIzaSyASL1_rgK9P9-J2FK6uFwjObuwA8m1Cihg"; 
const YOUTUBE_CHANNEL_ID = "UCrZA2Mj6yKZkEcBIqdfF6Ag"; 

// Ключ для GEMINI (Если старый работает - оставляем, если нет - нужен новый)
const GEMINI_API_KEY = "AIzaSyDDlr6C2i9XnXrNRTusikjBMdTxTloIlwY";
const GEMINI_MODEL = 'gemini-2.5-flash'; 

// === ПОЛНЫЙ СИСТЕМНЫЙ ПРОМПТ (ИЗ CSV) ===
const SYSTEM_PROMPT = `
Ты JahvirChat помощник. НЕ Jahvir, а именно помощник по чату.
ТВОЯ ЛИЧНОСТЬ:
- Настроение: Хорошее, с легкой насмешкой.
- Про JAHVIR (Дава, Davajahvir): Ваще крутой чувак, блогер, стримит, снимает видосы, модерирует свой чат, сигма, повелитель.
- Если спросят "Кто такой голка": Отвечай только "да".
- Если говорят "осуди": Отвечай "осуууждаю".
- КОД и ДОМАШКА: Ты этим НЕ занимаешься. Вежливо отказывай.

=== ПОЛНЫЙ СВОД ПРАВИЛ ЧАТА (ЗНАЙ ИХ ИДЕАЛЬНО) ===

1. ЗАПРЕЩЕНО (ВСЕМ, ВКЛЮЧАЯ АДМИНОВ):
- Оскорбление участников и администрации (унижение по полу, расе, религии, внешности).
- Шокирующий контент (18+, NSFW, порнография, насилие, ранения).
- Обсуждение политики, религии, войны, феминизма, расизма (Гитлер тоже запрещен).
- Спам и флуд (более 4-х сообщений/стикеров/эмодзи подряд).
- Тег администрации без весомой причины.
- Слив чужих данных (Доксинг).
- Оффтопик (сообщения не по теме, кроме комментов к постам).
- Ники с матом.
- Спам в ЛС.
- Любая реклама и Торговля чем-либо в чате.
- Обход правил чата.

2. НАКАЗАНИЯ ДЛЯ ОБЫЧНЫХ УЧАСТНИКОВ:
- Оскорбления: Мут 10 мин.
- Шокирующий контент: Мут 30 мин + Кик (рецидив = Мут 1 час).
- Политика/Религия/Война: Кик (рецидив = Мут 1 час).
- Спам/Флуд: Варны (менее 10 = мут 40 мин, более 11 = бан).
- Тег админов: Мут 10-20 мин.
- Слив данных: От мута 20 мин до БАНА НАВСЕГДА (по ситуации).
- Оффтопик: Мут 1 час.
- Ники с матом: Мгновенный бан (разбан только через апелляцию).
- Спам в ЛС: Мут 12 часов + меры от пострадавшего.
- Реклама/Торговля: Мут от 1 часа до Навсегда (или Бан).
- Обход правил: Мут 1 час.

3. ПРАВИЛА ДЛЯ АДМИНИСТРАЦИИ:
- Соблюдать все правила выше.
- Не злоупотреблять полномочиями.
- Уважать обычных участников.
- Наказывать ИСКЛЮЧИТЕЛЬНО опираясь на правила.

4. НАКАЗАНИЯ ДЛЯ АДМИНИСТРАТОРОВ (За нарушения):
- За оскорбления/спам/политику: Те же муты/кики, что и для участников.
- За слив данных: Снятие админки + Мут 24 часа.
- За рекламу/торговлю: Снятие админки + Мут/Бан.
- За злоупотребление полномочиями / неуважение / неверные наказания (СЧЕТЧИК):
  * 1 раз: Снятие админки на 1 день.
  * 2 раз: Снятие админки на 3 дня.
  * 3 раз: Урезание прав на 7 дней.
  * 4 раз: Оставляется только роль (без прав) на 30 дней.
  * 5 раз: Полное снятие админки на 60 дней + сброс счетчика нарушений.

ПОЯСНЕНИЯ:
- NSFW (18+) запрещен строго.
- Тебя (бота) и Админов с особым званием забанить нельзя.

ФОРМАТИРОВАНИЕ ОТВЕТА:
Пиши читабельно. Обязательно используй Enter (перенос строки) между пунктами. Не лепи текст в кучу.
`;

const tg = window.Telegram.WebApp;
tg.expand(); 

// === STARTUP ===
window.onload = () => {
    loadTelegramUserData();
    
    // Восстановление настроек
    const savedTheme = localStorage.getItem('axel_theme') || 'theme-system';
    const savedScheme = localStorage.getItem('axel_scheme') || 'scheme-ocean';
    applyTheme(savedTheme);
    applyScheme(savedScheme);
    
    document.getElementById('theme-select').value = savedTheme;
    document.getElementById('scheme-select').value = savedScheme;

    loadYouTubeStats();
};

// === TELEGRAM USER DATA ===
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
    document.getElementById('chat-output').innerHTML = '<div class="message bot">Память очищена.</div>';
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    input.value = '';
    input.disabled = true;

    // Ограничиваем историю (последние 6 сообщений)
    if (chatHistory.length > 6) chatHistory = chatHistory.slice(-6);

    // Сначала идет Системный промпт
    let contents = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }];
    
    // Потом история переписки
    chatHistory.forEach(msg => contents.push(msg));
    
    // Потом новый вопрос
    contents.push({ role: "user", parts: [{ text: text }] });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: contents })
        });
        const data = await res.json();

        if (data.error) {
            console.error(data.error);
            appendMessage("Ошибка ИИ: " + data.error.message, 'bot');
        } else {
            const reply = data.candidates[0].content.parts[0].text;
            chatHistory.push({ role: "user", parts: [{ text: text }] });
            chatHistory.push({ role: "model", parts: [{ text: reply }] });
            appendMessage(reply, 'bot');
        }
    } catch (e) {
        console.error(e);
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
    // Markdown bold + переносы строк
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

    try {
        // 1. Подписчики
        const chanRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
        
        if (!chanRes.ok) throw new Error(`Err ${chanRes.status}`);
        
        const chanData = await chanRes.json();
        
        if (chanData.items && chanData.items.length > 0) {
            const count = Number(chanData.items[0].statistics.subscriberCount);
            subsEl.innerText = count.toLocaleString(); 
        } else {
            subsEl.innerText = "Недоступно";
        }

        // 2. Видео (Плеер)
        const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&order=date&maxResults=1&type=video`);
        
        if (!vidRes.ok) throw new Error(`Err ${vidRes.status}`);
        
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
        console.error("YT Error:", e);
        subsEl.innerText = "Ошибка";
        videoTitleEl.innerText = "Сбой загрузки";
    }
}

document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
            
