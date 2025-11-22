class AxelAI {
    constructor() {
        this.conversationHistory = [];
        this.isProcessing = false;
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
            this.addMessage('Извините, произошла ошибка. Попробуйте еще раз.', 'ai');
            console.error('AI Error:', error);
        }
        
        this.isProcessing = false;
    }
    
    async getAIResponse(userMessage) {
        // Добавляем сообщение в историю
        this.conversationHistory.push({ role: 'user', content: userMessage });
        
        // Используем локальные ответы
        return this.getLocalResponse(userMessage);
    }
    
    getLocalResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Умные локальные ответы
        if (lowerMessage.includes('привет') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Привет! 👋 Я Axel AI, твой умный помощник. Чем могу помочь сегодня?";
        } 
        else if (lowerMessage.includes('как дела') || lowerMessage.includes('как ты')) {
            return "У меня всё отлично! Готов помогать тебе с любыми вопросами. 💫";
        }
        else if (lowerMessage.includes('помощь') || lowerMessage.includes('help') || lowerMessage.includes('что ты умееш')) {
            return `Я могу помочь тебе с:
• Ответами на вопросы 📚
• Решением проблем 💡
• Креативными идеями 🎨
• Общими знаниями 🌟
• И многим другим!

Просто задай вопрос и я постараюсь помочь! ✨`;
        }
        else if (lowerMessage.includes('погода')) {
            return "🌤️ К сожалению, я не могу получить актуальные данные о погоде в этом режиме. Но надеюсь, что сегодня хорошая погода!";
        }
        else if (lowerMessage.includes('код') || lowerMessage.includes('программир') || lowerMessage.includes('html') || lowerMessage.includes('css') || lowerMessage.includes('javascript')) {
            return `💻 О, программирование! Я могу помочь с общими советами по коду.

Пример (HTML структура):
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Мой сайт</title>
</head>
<body>
    <h1>Привет, мир!</h1>
</body>
</html>
\`\`\`
Нужна помощь с конкретным вопросом?`;
        }
        else if (lowerMessage.includes('совет') || lowerMessage.includes('идея') || lowerMessage.includes('рекомендац')) {
            return "💡 Вот несколько идей:\n• Попробуй новый хобби\n• Почитай интересную книгу\n• Сделай небольшую прогулку\n• Изучи что-то новое\n\nНадеюсь, эти идеи будут полезны!";
        }
        else if (lowerMessage.includes('шутк') || lowerMessage.includes('юмор') || lowerMessage.includes('смех')) {
            const jokes = [
                "Почему программисты путают Хэллоуин и Рождество? Потому что Oct 31 == Dec 25! 😄",
                "Как называют программиста, который боится женщин? SQL-инъекция! 💻",
                "Сколько программистов нужно, чтобы поменять лампочку? Ни одного, это hardware проблема! 💡"
            ];
            return jokes[Math.floor(Math.random() * jokes.length)];
        }
        else if (lowerMessage.includes('время') || lowerMessage.includes('дата')) {
            const now = new Date();
            return `🕐 Сейчас: ${now.toLocaleString('ru-RU')}`;
        }
        else {
            const randomResponses = [
                "Интересный вопрос! 🤔 Расскажи подробнее, что тебя интересует?",
                "Хм, давай подумаем над этим вместе! 💭",
                "Отличный вопрос! Давай разберем его подробнее. 🚀",
                "Интересно! Могу предложить несколько мыслей по этому поводу. 💫",
                "Давай обсудим это! Что именно тебя интересует? 🎯"
            ];
            return randomResponses[Math.floor(Math.random() * randomResponses.length)];
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
                    Привет! 👋 Я Axel AI, твой интеллектуальный помощник. 
                    Чем могу помочь?
                </div>
            </div>
        `;
    }
}

// Инициализация Axel AI когда страница загружена
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('chatMessages')) {
        window.axelAI = new AxelAI();
    }
});
