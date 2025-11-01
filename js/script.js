// script.js
// Поведение модалок, темы, языка, Telegram auth, cookie consent, подстановка имени.

(function(){
  // DOM
  const menuBtn = document.getElementById('menuBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const menuModal = document.getElementById('menuModal');
  const settingsModal = document.getElementById('settingsModal');
  const tgModal = document.getElementById('tgModal');
  const loginBtn = document.getElementById('loginBtn');
  const cookieBanner = document.getElementById('cookieBanner');
  const acceptCookies = document.getElementById('acceptCookies');
  const declineCookies = document.getElementById('declineCookies');
  const greeting = document.getElementById('greeting');
  const avatarImg = document.getElementById('avatarImg');
  const themeSelect = document.getElementById('themeSelect');
  const langSelect = document.getElementById('langSelect');
  const saveSettings = document.getElementById('saveSettings');
  const resetSettings = document.getElementById('resetSettings');

  // util
  function openModal(el){
    el.setAttribute('aria-hidden','false');
  }
  function closeModalById(id){
    const el = document.getElementById(id);
    if(el) el.setAttribute('aria-hidden','true');
  }
  function toggleTheme(theme){
    if(theme === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
    localStorage.setItem('siteTheme', theme);
  }
  function setLang(lang){
    // minimal — сохраняем выбор. Расширение: подгрузка переводов.
    localStorage.setItem('siteLang', lang);
    // Выводим простой пример — можно расширить словарём.
    // Пока что менять только placeholder текста:
    // (в этом макете ничего динамического кроме сохранения)
  }

  // close buttons (делегирование)
  document.addEventListener('click', (e) => {
    const close = e.target.closest('[data-close]');
    if(close){
      const id = close.getAttribute('data-close');
      closeModalById(id);
    }
  });

  // btns open
  menuBtn.addEventListener('click', () => openModal(menuModal));
  settingsBtn.addEventListener('click', () => openModal(settingsModal));
  loginBtn.addEventListener('click', () => openModal(tgModal));

  // cookie logic
  function showCookieBanner(){
    cookieBanner.classList.add('show');
    cookieBanner.setAttribute('aria-hidden','false');
  }
  function hideCookieBanner(){
    cookieBanner.classList.remove('show');
    cookieBanner.setAttribute('aria-hidden','true');
  }

  acceptCookies.addEventListener('click', () => {
    localStorage.setItem('cookieAccepted','yes');
    hideCookieBanner();
    // если пользователь ещё не авторизован — показать Telegram modal
    const saved = localStorage.getItem('telegramUser');
    if(!saved){
      openModal(tgModal);
    }
  });

  declineCookies.addEventListener('click', () => {
    localStorage.setItem('cookieAccepted','no');
    hideCookieBanner();
    // если отказался — удаляем сохранённого юзера
    localStorage.removeItem('telegramUser');
  });

  // settings
  saveSettings.addEventListener('click', () => {
    toggleTheme(themeSelect.value);
    setLang(langSelect.value);
    closeModalById('settingsModal');
  });
  resetSettings.addEventListener('click', () => {
    toggleTheme('dark');
    setLang('ru');
    themeSelect.value = 'dark';
    langSelect.value = 'ru';
  });

  // load saved settings
  (function loadSettings(){
    const t = localStorage.getItem('siteTheme') || 'dark';
    const l = localStorage.getItem('siteLang') || 'ru';
    themeSelect.value = t;
    langSelect.value = l;
    toggleTheme(t);
  })();

  // Telegram auth handler (вызывается виджетом)
  window.onTelegramAuth = function(user){
    try {
      const cookieAccepted = localStorage.getItem('cookieAccepted') === 'yes';
      // Сохраняем юзера в localStorage только если пользователь дал согласие на cookies.
      if(cookieAccepted){
        localStorage.setItem('telegramUser', JSON.stringify(user));
      } else {
        // Если cookies не приняты — не сохраняем, но можно временно использовать в сессии
        sessionStorage.setItem('telegramUser', JSON.stringify(user));
      }

      // Обновляем UI
      applyTelegramUser(user);

      // Закрыть модалку если открыта
      closeModalById('tgModal');

      // Небольшое уведомление
      alert('Вход выполнен как ' + (user.first_name || '') + (user.last_name ? ' ' + user.last_name : '') + (user.username ? ' ( @' + user.username + ' )' : ''));
    } catch (err) {
      console.error('onTelegramAuth error', err);
    }
  };

  function applyTelegramUser(user){
    const name = user && (user.first_name || user.username) ? (user.first_name || user.username) : 'Гость';
    greeting.textContent = 'Привет ' + name + '!';
    // Если у пользователя есть username — можно составить ссылку на телеграм-аккаунт и использовать как avatar
    // Но виджет не даёт URL на аватар — поэтому оставляем static image или можно заменить на telegram profile pic если загрузите отдельно
    // Отмечаем в UI что пользователь вошёл
    loginBtn.textContent = 'Выйти';
    loginBtn.classList.remove('primary');
    loginBtn.addEventListener('click', logoutHandler);
  }

  function logoutHandler(e){
    // удаляем сохранённого юзера
    localStorage.removeItem('telegramUser');
    sessionStorage.removeItem('telegramUser');
    greeting.textContent = 'Привет Гость!';
    loginBtn.textContent = 'Войти через Telegram';
    loginBtn.classList.add('primary');
    // снять обработчик выхода, восстановить открытие модалки
    loginBtn.removeEventListener('click', logoutHandler);
    loginBtn.addEventListener('click', () => openModal(tgModal));
  }

  // On load: check cookie consent and saved telegram user
  (function init(){
    const cookie = localStorage.getItem('cookieAccepted');
    const saved = localStorage.getItem('telegramUser') || sessionStorage.getItem('telegramUser');

    if(cookie === null){
      // показать баннер согласия
      showCookieBanner();
    } else if(cookie === 'no'){
      hideCookieBanner();
    } else {
      hideCookieBanner();
      // если cookie приняты и есть сохранённый пользователь — применить
      if(saved){
        try {
          const user = JSON.parse(saved);
          applyTelegramUser(user);
        } catch(e){ console.warn('Invalid saved telegram user'); }
      } else {
        // нет сохранённого — показать модал авторизации
        openModal(tgModal);
      }
    }

    // Если cookie accepted = yes и пользователь сохранён — подставить
    if(cookie === 'yes' && localStorage.getItem('telegramUser')){
      try {
        const user = JSON.parse(localStorage.getItem('telegramUser'));
        applyTelegramUser(user);
      } catch(e){}
    }
  })();

  // Accessibility: close modal by Esc
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      document.querySelectorAll('.modal').forEach(m => m.setAttribute('aria-hidden','true'));
    }
  });

  // If user reloads and logged in via sessionStorage (cookie declined), try to populate greeting
  (function trySessionUser(){
    const s = sessionStorage.getItem('telegramUser');
    if(s && !localStorage.getItem('telegramUser')){
      try{
        const user = JSON.parse(s);
        greeting.textContent = 'Привет ' + (user.first_name || user.username || 'Гость') + '!';
      }catch(e){}
    }
  })();

})();
