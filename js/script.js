// --- КОНФИГУРАЦИЯ ---
// Сюда мы "зашиваем" поведение бота
const AXEL_SYSTEM_PROMPT = "Ты - Axel AI, помощник на этом сайте. Твой стиль общения: дружелюбный, немного дерзкий, используешь сленг. Ты любишь говорить о коде и играх.";

// --- НАВИГАЦИЯ ---
function toggleMenu() {
    document.getElementById('menu-dropdown').classList.toggle('hidden');
}

function toggleSettings() {
    document.getElementById('settings-modal').classList.toggle('hidden');
}

// Закрытие меню при клике вне его (для удобства)
document.addEventListener('click', (e) => {
    const menu = document.getElementById('menu-dropdown');
    const btn = document.querySelector('.header-content');
    if (!menu.classList.contains('hidden') && !btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

function navigate(pageId) {
    // Скрываем все страницы
    const pages = ['home', 'axel-ai', 'placeholder'];
    document.getElementById('page-home').classList.add('hidden-page');
    document.getElementById('page-axel-ai').classList.add('hidden-page');
    document.getElementById('page-placeholder').classList.add('hidden-page');

    // Скрываем меню
    document.getElementById('menu-dropdown').classList.add('hidden');

    // Логика выбора страницы
    if (pageId === 'home') {
        document.getElementById('page-home').classList.remove('hidden-page');
    } else if (pageId === 'axel-ai') {
        document.getElementById('page-axel-ai').classList.remove('hidden-page');
    } else {
        // Для новостей, игр и т.д. показываем заглушку
        document.getElementById('page-placeholder').classList.remove('hidden-page');
    }
}

// --- НАСТРОЙКИ (ТЕМА И ЦВЕТ) ---
function changeTheme(themeClass) {
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-system');
    
    if (themeClass === 'theme-system') {
        // Простая проверка системной темы
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.add('theme-light');
        }
    } else {
        document.body.classList.add(themeClass);
    }
    localStorage.setItem('axel_theme', themeClass);
}

function changeScheme(schemeClass) {
    document.body.classList.remove('scheme-sunset', 'scheme-ocean', 'scheme-forest', 'scheme-berry', 'scheme-neon');
    document.body.classList.add(schemeClass);
    localStorage.setItem('axel_scheme', schemeClass);
}

// Загрузка настроек при старте
window.onload = () => {
    const savedTheme = localStorage.getItem('axel_theme') || 'theme-system';
    const savedScheme = localStorage.getItem('axel_scheme') || 'scheme-ocean';
    const savedKey = localStorage.getItem('axel_ai_key') || '';
    
    changeTheme(savedTheme);
    changeScheme(savedScheme);
    
    document.getElementById('theme-select').value = savedTheme;
    document.getElementById('scheme-select').value = savedScheme;
    document.getElementById('api-key-input').value = savedKey;

    // Симуляция загрузки YouTube (Т.к. нужен реальный API ключ для запроса)
    mockYouTubeLoad();
};

// Сохранение API ключа при вводе
document.getElementById('api-key-input').addEventListener('input', (e) => {
    localStorage.setItem('axel_ai_key', e.target.value);
});


// --- YOUTUBE API (Симуляция/Реализация) ---
function mockYouTubeLoad() {
    // В реальном проекте здесь был бы fetch к Google API
    // Для примера ставим красивые значения через задержку
    setTimeout(() => {
        document.getElementById('yt-subs').innerText = "1,050,000"; // Пример
        document.getElementById('yt-video').innerText = "КАК СОЗДАТЬ ИИ ЗА 5 МИНУТ?"; // Пример
    }, 1000);
}

// --- AXEL AI (GEMINI API) ---
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const output = document.getElementById('chat-output');
    const apiKey = localStorage.getItem('axel_ai_key');
    const userText = input.value.trim();

    if (!userText) return;
    if (!apiKey) {
        alert("Пожалуйста, введите API ключ в настройках!");
        return;
    }

    // 1. Добавляем сообщение пользователя
    appendMessage(userText, 'user');
    input.value = '';
    input.disabled = true; // Блокируем ввод пока ждем ответ

    // 2. Формируем запрос к Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{
            parts: [{ text: AXEL_SYSTEM_PROMPT + "\nUser: " + userText }] 
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            appendMessage("Ошибка API: " + data.error.message, 'bot');
        } else {
            const aiResponse = data.candidates[0].content.parts[0].text;
            appendMessage(aiResponse, 'bot');
        }

    } catch (error) {
        appendMessage("Ошибка сети: " + error.message, 'bot');
    } finally {
        input.disabled = false;
        input.focus();
    }
}

function appendMessage(text, sender) {
    const output = document.getElementById('chat-output');
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerText = text;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight; // Прокрутка вниз
}

// Отправка по Enter
document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
                                
