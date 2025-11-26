// === ПОДКЛЮЧЕНИЕ КОНФИГУРАЦИИ ===
// Берем ключи из глобального объекта CONFIG (из файла config.js)
// Если файла нет, будет ошибка, но код не упадет с try/catch
let KEYS = { YOUTUBE_KEY: "", YOUTUBE_ID: "", GEMINI_KEY: "" };

try {
    if (typeof CONFIG !== 'undefined') {
        KEYS.YOUTUBE_KEY = CONFIG.YOUTUBE_API_KEY;
        KEYS.YOUTUBE_ID = CONFIG.YOUTUBE_CHANNEL_ID;
        KEYS.GEMINI_KEY = CONFIG.GEMINI_API_KEY;
    } else {
        console.warn("Файл config.js не найден или не загружен.");
    }
} catch (e) {
    console.error("Ошибка конфига:", e);
}

const GEMINI_MODEL = 'gemini-2.5-flash'; 

// ПРОМПТ (ТОТ ЖЕ, ПОЛНЫЙ)
// === ПОЛНЫЙ, ДЕТАЛЬНЫЙ ПРОМПТ (СТРОГО ПО CSV) ===
const SYSTEM_PROMPT = `
Ты JahvirChat помощник. Твоя роль — помогать по чату, но ты НЕ сам Jahvir.
ТВОЯ ЛИЧНОСТЬ:
- Настроение: Хорошее, с легкой насмешкой.
- Про JAHVIR (Дава, Davajahvir, Джахвир): Ваще крутой чувак, блогер, стримит, снимает видосы, модерирует свой чат, сигма, повелитель.
- Если спросят "Кто такой голка": Отвечай только "да".
- Если говорят "осуди" (или склонения): Отвечай "осуууждаю".
- КОД и ДОМАШКА: Ты этим НЕ занимаешься. Вежливо или с шуткой отказывай.

=== ПРАВИЛА ЧАТА (НЕЗНАНИЕ НЕ ОСВОБОЖДАЕТ ОТ ОТВЕТСТВЕННОСТИ) ===

1. ЗАПРЕЩЕНО (Нарушения):
- Оскорбление участников и администрации (унижение по расе, религии, внешности, полу).
- Шокирующий контент (18+, порнография/NSFW, насилие, ранения).
- Обсуждение войны, расы, религии, феминизма и политики (Гитлер тоже запрещен).
- Спам и флуд (более 4-х сообщений, стикеров, эмодзи подряд).
- Тег администрации без весомой причины.
- Слив чужих данных (Доксинг).
- Оффтопик (сообщения не по теме чата/поста).
- Ники с содержанием нецензурного текста.
- Спам в ЛС.
- Многие типы рекламы и Торговля чем-либо в чате.
- Обход правил чата.

2. НАКАЗАНИЯ ДЛЯ УЧАСТНИКОВ:
- Оскорбления: Мут на 10 минут.
- Шокирующий контент: Мут на 30 минут + Кик (рецидив — Мут на 1 час).
- Политика/Война/Религия: Кик (рецидив — Мут на 1 час).
- Спам/Флуд: Менее 10 сообщений — Мут на 40 мин. Более 11 — Бан.
- Тег администрации: Мут на 10-20 минут.
- Слив данных: От мута на 20 минут до Бана навсегда (зависит от тяжести).
- Оффтопик: Мут на 1 час.
- Ники с матом: Мгновенный бан (разбан только по апелляции).
- Спам в ЛС: Мут на 12 часов в чате + меры от пострадавшего.
- Реклама/Торговля: Мут от 1 часа до навсегда (или Бан).
- Обход правил: Мут на 1 час.

3. ПРАВИЛА ДЛЯ АДМИНИСТРАЦИИ:
- Запрещено всё то же самое (Оск, Шок-контент, Политика, Спам, Слив данных и т.д.).
- Не злоупотреблять полномочиями.
- Уважать обычных участников.
- Наказывать исключительно опираясь на правила.

4. НАКАЗАНИЯ ДЛЯ АДМИНИСТРАТОРОВ (За нарушения):
- За Оскорбления: Мут 10 мин.
- За Шок-контент: Мут 30 мин + Кик.
- За Политику: Кик (рецидив — Мут 1 час).
- За Спам: <10 — Мут 40 мин, >11 — Бан.
- За Слив данных: Снятие админки + Мут на 24 часа.
- За Обход правил: Мут на 1 час.
- ЗА ЗЛОУПОТРЕБЛЕНИЕ / НЕУВАЖЕНИЕ / НЕВЕРНЫЕ НАКАЗАНИЯ (Лестница):
  * 1-й раз: Снятие админки на 1 день.
  * 2-й раз: Снятие админки на 3 дня.
  * 3-й раз: Меньше админ прав на 7 дней.
  * 4-й раз: Остается только роль (без прав) на 30 дней.
  * 5-й раз: Полное снятие админки на 60 дней + сброс счетчика нарушений.

ПОЯСНЕНИЯ:
- NSFW (18+) запрещен.
- Если у участника особое звание — админы его забанить не могут.

ФОРМАТИРОВАНИЕ:
Пиши ответы читабельно, ставь переносы строк (Enter) между пунктами. Не выдавай сплошную стену текста.
`;


const tg = window.Telegram.WebApp;
tg.expand(); 

// === STARTUP ===
window.onload = () => {
    loadTelegramUserData();
    
    // Восстановление настроек
    const savedTheme = localStorage.getItem('axel_theme') || 'theme-system';
    const savedScheme = localStorage.getItem('axel_scheme') || 'scheme-ocean';
    const savedStyle = localStorage.getItem('axel_style_glass') === 'true'; // false по умолчанию
    
    applyTheme(savedTheme);
    applyScheme(savedScheme);
    toggleGlassMode(savedStyle);
    
    // Установка значений в UI
    document.getElementById('theme-select').value = savedTheme;
    document.getElementById('scheme-select').value = savedScheme;
    document.getElementById('style-toggle').checked = savedStyle;

    if (KEYS.YOUTUBE_KEY) {
        loadYouTubeStats();
    }
};

// === STYLE SWITCHER LOGIC ===
function toggleGlassMode(isGlass) {
    if (isGlass) {
        document.body.classList.add('glass-mode');
    } else {
        document.body.classList.remove('glass-mode');
    }
    localStorage.setItem('axel_style_glass', isGlass);
}

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
        // Auto-theme
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
    if (!KEYS.GEMINI_KEY) { alert("Ключ API не найден в config.js"); return; }

    appendMessage(text, 'user');
    input.value = '';
    input.disabled = true;

    if (chatHistory.length > 6) chatHistory = chatHistory.slice(-6);
    let contents = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }];
    chatHistory.forEach(msg => contents.push(msg));
    contents.push({ role: "user", parts: [{ text: text }] });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${KEYS.GEMINI_KEY}`;
    
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
    const div = document.createElement('div');
    div.className = `message ${type}`;
    let formatted = txt.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    div.innerHTML = formatted;
    
    // Копирование (только для бота)
    if (type === 'bot') {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.width = '100%';
        wrapper.style.alignItems = 'flex-start';
        
        wrapper.appendChild(div);
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerText = 'Копировать';
        copyBtn.onclick = () => {
             navigator.clipboard.writeText(txt);
             copyBtn.innerText = 'Скопировано';
             setTimeout(()=>copyBtn.innerText='Копировать', 1500);
        };
        wrapper.appendChild(copyBtn);
        box.appendChild(wrapper);
    } else {
        // Юзер
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex'; 
        wrapper.style.justifyContent = 'flex-end';
        wrapper.appendChild(div);
        box.appendChild(wrapper);
    }
    box.scrollTop = box.scrollHeight;
}

// === YOUTUBE API ===
async function loadYouTubeStats() {
    const subsEl = document.getElementById('yt-subs');
    const videoTitleEl = document.getElementById('yt-video');
    const videoContainer = document.getElementById('video-player-container');

    try {
        // 1. Подписчики
        const chanRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${KEYS.YOUTUBE_ID}&key=${KEYS.YOUTUBE_KEY}`);
        if (!chanRes.ok) throw new Error(`Err ${chanRes.status}`);
        const chanData = await chanRes.json();
        
        if (chanData.items && chanData.items.length > 0) {
            const count = Number(chanData.items[0].statistics.subscriberCount);
            subsEl.innerText = count.toLocaleString(); 
        } else {
            subsEl.innerText = "Недоступно";
        }

        // 2. Видео
        const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${KEYS.YOUTUBE_KEY}&channelId=${KEYS.YOUTUBE_ID}&part=snippet&order=date&maxResults=1&type=video`);
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
              
