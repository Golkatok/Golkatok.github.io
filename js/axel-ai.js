class AxelAI {
    constructor() {
        this.apiKey = localStorage.getItem('googleAIKey') || '';
        this.conversationHistory = [];
        this.isProcessing = false;
        this.model = 'gemini-2.0-flash-exp'; // Используем быструю модель Gemini
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadConversationHistory();
    }
    
    bindEvents() {
        const sendButton = document.getElementById('sendMessage');
        const chatInput = document.getElementById('chatInput');
        const clearChat = document.getElementById('clearChat');
        
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        if (clearChat) {
            clearChat.addEventListener('click', () => {
                if (confirm('Очистить всю историю сообщений?')) {
                    this.clearConversation();
                }
            });
        }
    }
    
    async sendMessage() {
        if (this.isProcessing) return;
        
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        // Очищаем поле ввода
        chatInput.value = '';
        
        // Добавляем сообщение пользователя в чат
        this.addMessage(message, 'user');
        
        // Проверяем достижение AI
        if (window.checkAIAchievement) {
            window.checkAIAchievement();
        }
        
        // Показываем индикатор набора
        this.showTypingIndicator();
        
        this.isProcessing = true;
        
        try {
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
            this.saveConversationHistory();
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage(this.getErrorMessage(error), 'ai');
            console.error('AI Error:', error);
        }
        
        this.isProcessing = false;
    }
    
    async getAIResponse(userMessage) {
        // Добавляем сообщение в историю
        this.conversationHistory.push({ role: 'user', content: userMessage });
        
        // Если API ключ не установлен, используем демо-режим
        if (!this.apiKey || !this.apiKey.startsWith('AIza')) {
            return this.getDemoResponse(userMessage);
        }
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: this.buildPrompt(userMessage)
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                        topP: 0.8,
                        topK: 40
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response format from API');
            }
            
            const aiMessage = data.candidates[0].content.parts[0].text;
            
            // Добавляем ответ AI в историю
            this.conversationHistory.push({ role: 'assistant', content: aiMessage });
            
            return aiMessage;
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }
    
    buildPrompt(userMessage) {
        // Строим промпт с контекстом истории
        let prompt = `Ты - Axel AI, полезный и дружелюбный помощник. Отвечай на русском языке.
Будь краток, но информативен. Используй эмодзи где это уместно.

Текущая дата: ${new Date().toLocaleDateString('ru-RU')}

Контекст предыдущих сообщений:\n`;

        // Добавляем последние 4 сообщения для контекста
        const recentHistory = this.conversationHistory.slice(-4);
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Axel AI';
            prompt += `${role}: ${msg.content}\n`;
        });

        prompt += `\nТекущий запрос пользователя: ${userMessage}`;
        
        return prompt;
    }
    
    getDemoResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Умные демо-ответы для разных типов запросов
        if (lowerMessage.includes('привет') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Привет! 👋 Я Axel AI, твой умный помощник на базе Google Gemini. Чтобы использовать мои возможности, добавь Google AI Studio API ключ в настройках! 🚀";
        } 
        else if (lowerMessage.includes('как дела') || lowerMessage.includes('как ты')) {
            return "У меня всё отлично! Готов помогать тебе с любыми вопросами. Просто добавь API ключ Google AI Studio для полного доступа к моим способностям! 💫";
        }
        else if (lowerMessage.includes('помощь') || lowerMessage.includes('help') || lowerMessage.includes('что ты умееш')) {
            return `Я могу помочь тебе с:
• Ответами на вопросы 📚
• Решением проблем 💡
• Креативными идеями 🎨
• Кодом и технологиями 💻
• Анализом текста 📊
• И многим другим!

Для начала работы:
1. Открой настройки (иконка ⚙️)
2. Введи свой Google AI Studio API ключ
3. Начни общение! ✨`;
        }
        else if (lowerMessage.includes('api') || lowerMessage.includes('ключ') || lowerMessage.includes('google')) {
            return `Чтобы получить API ключ:
1. Перейди на aistudio.google.com
2. Войди через Google аккаунт
3. Нажми "Get API key" и создай новый ключ
4. Скопируй его (начинается с AIza...) и вставь в настройках здесь

После этого я смогу полноценно с тобой общаться! 🔑`;
        }
        else if (lowerMessage.includes('погода')) {
            return "🌤️ Я бы с радостью рассказал о погоде, но для доступа к актуальным данным мне нужен API ключ Google AI Studio. Добавь его в настройках!";
        }
        else if (lowerMessage.includes('код') || lowerMessage.includes('программир') || lowerMessage.includes('html') || lowerMessage.includes('css') || lowerMessage.includes('javascript')) {
            return `💻 О, программирование! Я могу помочь с:
• Написанием кода
• Поиском ошибок
• Оптимизацией
• Объяснением концепций

Пример (демо-режим):
\`\`\`javascript
// Приветствие на JavaScript
function greet(name) {
    return \`Привет, \${name}! 👋\`;
}
console.log(greet("Друг"));
\`\`\`
Добавь API ключ для более сложных задач! 🚀`;
        }
        else if (lowerMessage.includes('совет') || lowerMessage.includes('идея') || lowerMessage.includes('рекомендац')) {
            return "💡 У меня много интересных идей! Но чтобы дать персональный совет, мне нужен доступ к Google AI Studio API. Добавь ключ в настройках, и я помогу с креативными решениями!";
        }
        else if (lowerMessage.includes('шутк') || lowerMessage.includes('юмор') || lowerMessage.includes('смех')) {
            const jokes = [
                "Почему программисты путают Хэллоуин и Рождество? Потому что Oct 31 == Dec 25! 😄",
                "Как называют программиста, который боится женщин? SQL-инъекция! 💻",
                "Сколько программистов нужно, чтобы поменять лампочку? Ни одного, это hardware проблема! 💡"
            ];
            return jokes[Math.floor(Math.random() * jokes.length)] + "\n\nДобавь API ключ для большего количества шуток! 🎭";
        }
        else {
            const randomResponses = [
                "Интересный вопрос! 🤔 В демо-режиме мои возможности ограничены. Добавь Google AI Studio API ключ в настройках для полноценного общения!",
                "Отличный запрос! 🚀 Чтобы я мог дать качественный ответ, пожалуйста, настрой API ключ Google AI Studio.",
                "Я бы с радостью помог, но для этого нужен доступ к Google AI Studio API. Ты можешь добавить ключ в настройках сайта! ⚙️",
                "Отличная тема для обсуждения! 💫 В демо-режиме я не могу полноценно ответить. Добавь API ключ для умных бесед!",
                "Интересно! 🎯 Чтобы я мог глубоко разобраться в этом вопросе, мне нужен Google AI Studio API ключ. Настрой его в разделе настроек!"
            ];
            return randomResponses[Math.floor(Math.random() * randomResponses.length)];
        }
    }
    
    getErrorMessage(error) {
        if (error.message.includes('quota') || error.message.includes('limit')) {
            return "⚠️ Достигнут лимит использования API. Проверь квоты в Google AI Studio.";
        } else if (error.message.includes('invalid api key') || error.message.includes('authentication')) {
            return "🔑 Неверный API ключ. Проверь его в настройках и попробуй снова.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            return "🌐 Проблемы с сетью. Проверь подключение к интернету.";
        } else if (error.message.includes('safety')) {
            return "🛡️ Запрос был заблокирован системой безопасности. Попробуй переформулировать вопрос.";
        } else {
            return `❌ Произошла ошибка: ${error.message}. Проверь настройки API ключа.`;
        }
    }
    
    addMessage(content, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarIcon = sender === 'user' ? 'fa-user' : 'fa-robot';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${avatarIcon}"></i>
            </div>
            <div class="message-content">
                ${this.formatMessage(content)}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    formatMessage(content) {
        // Улучшенное форматирование текста
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
            .replace(/\n/g, '<br>');
    }
    
    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    loadConversationHistory() {
        const saved = localStorage.getItem('axelAIConversation');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
            
            // Восстанавливаем историю чата (только последние 10 сообщений)
            const recentHistory = this.conversationHistory.slice(-10);
            const chatMessages = document.getElementById('chatMessages');
            
            // Очищаем стандартное приветствие если есть история
            if (recentHistory.length > 0) {
                chatMessages.innerHTML = '';
            }
            
            // Восстанавливаем сообщения
            recentHistory.forEach(msg => {
                this.addMessage(msg.content, msg.role === 'user' ? 'user' : 'ai');
            });
        }
    }
    
    saveConversationHistory() {
        // Сохраняем только последние 20 сообщений чтобы не перегружать localStorage
        const recentHistory = this.conversationHistory.slice(-20);
        localStorage.setItem('axelAIConversation', JSON.stringify(recentHistory));
    }
    
    clearConversation() {
        this.conversationHistory = [];
        localStorage.removeItem('axelAIConversation');
        
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    Привет! 👋 Я Axel AI, твой интеллектуальный помощник на базе Google Gemini. 
                    Чем могу помочь? Для полноценной работы добавь Google AI Studio API ключ в настройках! 🚀
                </div>
            </div>
        `;
    }
    
    // Метод для обновления API ключа
    updateApiKey(newKey) {
        this.apiKey = newKey;
        localStorage.setItem('googleAIKey', newKey);
    }
}

// Инициализация Axel AI когда страница загружена
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('chatMessages')) {
        window.axelAI = new AxelAI();
        
        // Обновляем API ключ при изменении в настройках
        const googleAIKeyInput = document.getElementById('googleAIKey');
        if (googleAIKeyInput && window.axelAI) {
            googleAIKeyInput.addEventListener('change', function() {
                window.axelAI.updateApiKey(this.value);
            });
        }
    }
});

// Глобальные функции для управления Axel AI
window.AxelAI = {
    clearHistory: function() {
        if (window.axelAI) {
            window.axelAI.clearConversation();
        }
    },
    
    setApiKey: function(key) {
        if (window.axelAI) {
            window.axelAI.updateApiKey(key);
        }
    },
    
    getStats: function() {
        if (window.axelAI) {
            return {
                messageCount: window.axelAI.conversationHistory.length,
                isConfigured: !!window.axelAI.apiKey && window.axelAI.apiKey.startsWith('AIza')
            };
        }
        return null;
    }
};
