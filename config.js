// config.js - Общая конфигурация для всех страниц
window.APP_CONFIG = {
    // Проекты Supabase
    SUPABASE_PROJECTS: {
        // Основной проект (посты)
        MAIN: {
            URL: 'https://wyhtxlfasssxunrdsviq.supabase.co',
            ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aHR4bGZhc3NzeHVucmRzdmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NTEyNzcsImV4cCI6MjA4MzIyNzI3N30.LVoxX-hLG4s6dT4l5FtnF0LCQ8Pc5o1JHKZbRMNZXKU',
            SERVICE_KEY: 'ВАШ_СЕРВИСНЫЙ_КЛЮЧ_ТУТ' // НИКОГДА не публикуйте в клиентском коде!
        },
        
        // Проект для реакций
        REACTIONS: {
            URL: 'https://yzycbchfolbliszmhatc.supabase.co',
            KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6eWNiY2hmb2xibGlzem1oYXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNDkyOTEsImV4cCI6MjA4MzYyNTI5MX0.u7WnpEUhoK-RlKU46f1_EgB7nfLp-rkCfDxXH0hTs5Q'
        }
    },
    
    // YouTube API
    YOUTUBE: {
        API_KEY: 'AIzaSyDrkWy7DEmVOZcjY34GFcJxRW-8LEM-aJc',
        CHANNEL_ID: 'UCrZA2Mj6yKZkEcBIqdfF6Ag'
    },
    
    // Безопасность и доступ
    SECURITY: {
        ADMIN_USERNAMES: ['golka_tok', 'David3153'],
        ADMIN_PIN_CODE: '9076', // PIN вместо цветового кода
        MIN_VISIBLE_TABS: 2,    // Минимум 2 видимых раздела
        USER_VERSION_PAGE: 'jahbot6754.html',
        ADMIN_VERSION_PAGE: 'jahvolka9046.html'
    },
    
    // Реакции
    REACTIONS: {
        EMOJIS: ['👍', '❤️', '🔥', '😮', '😢', '👏'],
        COLORS: {
            '👍': '#34C759',
            '❤️': '#FF2D55',
            '🔥': '#FF9500',
            '😮': '#5AC8FA',
            '😢': '#007AFF',
            '👏': '#FFCC00'
        }
    },
    
    // Категории постов
    CATEGORIES: {
        'news': { name: 'Новости', color: '#007AFF' },
        'announcements': { name: 'Анонсы', color: '#FF2D55' },
        'updates': { name: 'Обновления', color: '#34C759' },
        'other': { name: 'Другое', color: '#AF52DE' }
    },
    
    // Настройки по умолчанию
    DEFAULTS: {
        THEME: 'auto',
        ACCENT_COLOR: '#007AFF',
        VISIBLE_TABS: ['home', 'social', 'posts', 'ai']
    }
};

// 🔒 Скрытый код админа (зашифрованный разными способами)
window.ADMIN_CODES = {
    // Способ 1: Разбит на части
    part1: () => '90',
    part2: () => '76',
    
    // Способ 2: Base64
    base64: () => atob('OTA3Ng=='),
    
    // Способ 3: Из чисел
    numbers: () => [9, 0, 7, 6].join(''),
    
    // Способ 4: Математическая операция
    math: () => (10000 - 924).toString(),
    
    // Способ 5: Из символов ASCII
    ascii: () => String.fromCharCode(57, 48, 55, 54),
    
    // Получить код (проверяет все варианты)
    getCode: function(input) {
        const validCodes = [
            '9076',
            this.part1() + this.part2(),
            this.base64(),
            this.numbers(),
            this.math(),
            this.ascii()
        ];
        return validCodes.includes(input);
    }
};
