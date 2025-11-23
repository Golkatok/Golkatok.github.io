// === КОНФИГУРАЦИЯ ===

const YOUTUBE_API_KEY = "AIzaSyDDlr6C2i9XnXrNRTusikjBMdTxTloIlwY"; 
const YOUTUBE_CHANNEL_ID = "UCrZA2Mj6yKZkEcBIqdfF6Ag"; 
const GEMINI_MODEL = 'gemini-2.5-flash'; 

// ПРАВИЛА И ПЕРСОНА (Из CSV и ТЗ)
const SYSTEM_PROMPT = `
Ты JahvirChat помощник. Ты НЕ сам JahvirChat, а помощник по чату jahvir.
ТВОЯ ЛИЧНОСТЬ:
- Твоё настроение: Хорошее, с насмешкой немного.
- ИНФА О JAHVIR (Дава, Davajahvir, Джахвир): Ваще крутой чувак, блогер, стримит, снимает видосы, модерирует свой чат, сигма, повелитель.
- Если спрашивают "Кто такой голка" (или подобное), отвечай просто: "да".
- Если тебя просят написать КОД или сделать ДОМАШНЕЕ ЗАДАНИЕ - ты отказываешься (вежливо или с шуткой), ты этим не занимаешься.
- Если тебе говорят "осуди" (или "осуждаю" и т.д.), ты отвечаешь строго: "осуууждаю".
- ФОРМАТИРОВАНИЕ: Делай ответы читабельными. Часто используй перенос строки (Enter), чтобы текст не был сплошной кашей.

ПРАВИЛА ЧАТА (Знай их наизусть):
1. ЗАПРЕЩЕНО: Оскорбления, Шокирующий контент (18+, насилие), Политика/Религия/Война/Феминизм (даже упоминание Гитлера), Спам (флуд >4 сообщений), Тегать админов без причины, Слив данных (Доксинг), Оффтопик, Маты в никах, Спам в ЛС, Реклама, Торговля.
2. НАКАЗАНИЯ: Мут (10 мин - 12 часов), Кик, Бан (за рекламу, шок-контент, ботов).
3. АДМИНЫ: Им тоже нельзя нарушать. Если админ нарушает - его снимают с роли.

Помни, ты помощник, а не модератор, ты просто подсказываешь правила.
`;

// === INIT TELEGRAM ===
const tg = window.Telegram.WebApp;
tg.expand(); 

// === STATE & MEMORY ===
// API Key теперь в коде, но сохраняем его в localstorage для совместимости логики
let geminiKey = "AIzaSyDDlr6C2i9XnXrNRTusikjBMdTxTloIlwY"; 

// Память чата (Rolling window: System + Last 3 exchanges)
let chatHistory = [];

// === STARTUP ===
window.onload = () => {
    loadTelegramUserData();
    
    // State restoration
    const savedTheme = localStorage.getItem('axel_theme') || 'theme-system';
    const savedScheme = localStorage.getItem('axel_scheme') || 'scheme-ocean';
    applyTheme(savedTheme);
    applyScheme(savedScheme);
    
    document.getElementById('theme-select').value = savedTheme;
    document.getElementById('scheme-select').value = savedScheme;

    loadYouTubeStats();
};

// === TELEGRAM DATA ===
function loadTelegramUserData() {
    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');

    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        nameEl.innerText = user.first_name || 'User';
        
        // Сохраняем инфу в LocalStorage (как просили)
        localStorage.setItem('jahvir_user_id', user.id);
        localStorage.setItem('jahvir_user_name', user.first_name);
        
        if (user.photo_url) {
            avatarEl.src = user.photo_url;
        } else {
            avatarEl.src = `https://ui-avatars.com/api/?name=${user.first_name}&background=random&color=fff`;
        }
        
        // Auto-dark theme
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

// Очистка памяти
function clearHistory() {
    chatHistory = [];
    const chatBox = document.getElementById('chat-output');
    chatBox.innerHTML = '<div class="message bot">Память очищена. Я снова чист!</div>';
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    input.value = '';
    input.disabled = true;

    // 1. Формируем контекст (System + History + New Message)
    // Ограничиваем историю 6 сообщениями (3 пары вопрос-ответ)
    if (chatHistory.length > 6) {
        chatHistory = chatHistory.slice(chatHistory.length - 6);
    }

    let contents = [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] } // Системный промпт как первое сообщение юзера (трюк для Gemini)
    ];

    // Добавляем историю
    chatHistory.forEach(msg => {
        contents.push(msg);
    });

    // Добавляем текущий запрос
    contents.push({ role: "user", parts: [{ text: text }] });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`;
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: contents })
        });
        const data = await res.json();

        if (data.error) {
            appendMessage("Ошибка: " + data.error.message, 'bot');
        } else {
            const reply = data.candidates[0].content.parts[0].text;
            
            // Сохраняем в историю
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
    
    // Обертка для сообщения и кнопки
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper`;
    
    // Само сообщение
    const div = document.createElement('div');
    div.className = `message ${type}`;
    
    // Форматирование: **bold**, \n -> <br>
    let formatted = txt.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    formatted = formatted.replace(/\n/g, '<br>');
    div.innerHTML = formatted;
    
    wrapper.appendChild(div);

    // Добавляем кнопку копирования для бота
    if (type === 'bot') {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<span class="material-icons-round" style="font-size:14px">content_copy</span> Коп.';
        copyBtn.onclick = () => copyText(txt);
        wrapper.appendChild(copyBtn);
        // Выравнивание обертки влево
        wrapper.style.alignItems = 'flex-start';
    } else {
        // Выравнивание обертки вправо
        wrapper.style.alignItems = 'flex-end';
    }

    box.appendChild(wrapper);
    box.scrollTop = box.scrollHeight;
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Визуальное подтверждение можно добавить, но пока просто копируем
    });
}

// === YOUTUBE API ===
async function loadYouTubeStats() {
    const subsEl = document.getElementById('yt-subs');
    const videoTitleEl = document.getElementById('yt-video');
    const videoPreviewContainer = document.getElementById('video-preview-container');

    try {
        // Subs
        const chanRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
        const chanData = await chanRes.json();
        
        if (chanData.items) {
            subsEl.innerText = Number(chanData.items[0].statistics.subscriberCount).toLocaleString();
        }

        // Last Video
        const vidRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&order=date&maxResults=1`);
        const vidData = await vidRes.json();
        
        if (vidData.items && vidData.items.length > 0) {
            const video = vidData.items[0];
            videoTitleEl.innerText = video.snippet.title;
            
            // Вставляем картинку (Thumbnail)
            const thumbUrl = video.snippet.thumbnails.high.url;
            videoPreviewContainer.innerHTML = `<img src="${thumbUrl}" alt="Video Preview">`;
        } else {
            videoTitleEl.innerText = "Нет видео";
        }
    } catch (e) {
        console.error("Youtube Error:", e);
        subsEl.innerText = "Err";
    }
}

document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
        
