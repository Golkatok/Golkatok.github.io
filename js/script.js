// script.js
// Поведение модалок, тема (без UI настроек), языковой переключатель, Telegram auth, cookie consent, подстановка имени.

(function(){
  // DOM
  const menuBtn = document.getElementById('menuBtn');
  const menuModal = document.getElementById('menuModal');
  const tgModal = document.getElementById('tgModal');
  const loginBtn = document.getElementById('loginBtn');
  const cookieBanner = document.getElementById('cookieBanner');
  const acceptCookies = document.getElementById('acceptCookies');
  const declineCookies = document.getElementById('declineCookies');
  const greeting = document.getElementById('greeting');
  const avatarImg = document.getElementById('avatarImg');
  const langSwitcher = document.getElementById('langSwitcher');
  const langButtons = document.querySelectorAll('.lang-btn');

  // Elements with translations (data-i18n)
  const i18nElements = document.querySelectorAll('[data-i18n]');

  // Translations
  const translations = {
    ru: {
      menuBtn: '☰ Меню',
      menuHeading: 'Выберите страницу',
      menuHome: 'Главная',
      menuSocial: 'Соц. Сети',
      menuNews: 'Новости',
      menuGames: 'Мини-игры',
      greeting_guest: 'Привет Гость!',
      greeting_prefix: 'Привет',
      lastLabel: 'Последний ролик:',
      loginBtn: 'Войти через Telegram',
      logoutBtn: 'Выйти',
      tgHeading: 'Вход через Telegram',
      tgHint: 'После успешной авторизации имя пользователя будет подставлено в приветствии.',
      cookieText: 'Этот сайт использует cookies для запоминания входа через Telegram и настроек. Принять?',
      accept: 'Принять',
      decline: 'Отклонить'
    },
    uk: {
      menuBtn: '☰ Меню',
      menuHeading: 'Оберіть сторінку',
      menuHome: 'Головна',
      menuSocial: 'Соц. Мережі',
      menuNews: 'Новини',
      menuGames: 'Міні-ігри',
      greeting_guest: 'Привіт Гість!',
      greeting_prefix: 'Привіт',
      lastLabel: 'Останнє відео:',
      loginBtn: 'Увійти через Telegram',
      logoutBtn: 'Вийти',
      tgHeading: 'Вхід через Telegram',
      tgHint: 'Після успішної авторизації імʼя користувача зʼявиться у привітанні.',
      cookieText: 'Цей сайт використовує cookies для запамʼятовування входу через Telegram та налаштувань. Прийняти?',
      accept: 'Прийняти',
      decline: 'Відхилити'
    },
    en: {
      menuBtn: '☰ Menu',
      menuHeading: 'Choose a page',
      menuHome: 'Home',
      menuSocial: 'Social',
      menuNews: 'News',
      menuGames: 'Mini-games',
      greeting_guest: 'Hello Guest!',
      greeting_prefix: 'Hello',
      lastLabel: 'Latest video:',
      loginBtn: 'Login with Telegram',
      logoutBtn: 'Logout',
      tgHeading: 'Telegram login',
      tgHint: 'After successful authorization, the username will appear in the greeting.',
      cookieText: 'This site uses cookies to remember Telegram login and settings. Accept?',
      accept: 'Accept',
      decline: 'Decline'
    }
  };

  // util modal
  function openModal(el){
    if(!el) return;
    el.setAttribute('aria-hidden','false');
  }
  function closeModalById(id){
    const el = document.getElementById(id);
    if(el) el.setAttribute('aria-hidden','true');
  }

  // i18n apply
  function applyTranslations(lang){
    const dict = translations[lang] || translations.ru;
    i18nElements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if(!key) return;
      // if element is input/textarea, set placeholder or value? We only use text nodes here.
      // If key exists in dict -> set textContent, else fallback to key
      if(dict[key] !== undefined){
        el.textContent = dict[key];
      } else {
        // special handling for greeting: greeting may show name; leave handled elsewhere
        if(key === 'greeting'){
          // handled separately
        }
      }
    });

    // update dynamic greeting if user exists
    const saved = localStorage.getItem('telegramUser') || sessionStorage.getItem('telegramUser');
    if(saved){
      try {
        const user = JSON.parse(saved);
        setGreetingWithUser(user, lang);
        setLoginAsLogout(lang);
      } catch(e){
        setGreetingGuest(lang);
        setLoginAsLogin(lang);
      }
    } else {
      setGreetingGuest(lang);
      setLoginAsLogin(lang);
    }

    // highlight active lang btn
    langButtons.forEach(b => {
      if(b.dataset.lang === lang) b.classList.add('active-lang');
      else b.classList.remove('active-lang');
    });

    // set html lang attribute for accessibility / screen readers
    document.documentElement.lang = (lang === 'uk' ? 'uk' : (lang === 'be' ? 'be' : (lang === 'en' ? 'en' : 'ru')));
  }

  // greeting helpers
  function setGreetingGuest(lang){
    const txt = translations[lang].greeting_guest || translations.ru.greeting_guest;
    greeting.textContent = txt;
  }
  function setGreetingWithUser(user, lang){
    const prefix = translations[lang].greeting_prefix || translations.ru.greeting_prefix;
    const name = (user && (user.first_name || user.username)) ? (user.first_name || user.username) : (translations[lang].greeting_guest || translations.ru.greeting_guest);
    greeting.textContent = prefix + ' ' + name + '!';
  }

  // cookie banner show/hide
  function showCookieBanner(){
    cookieBanner.classList.add('show');
    cookieBanner.setAttribute('aria-hidden','false');
  }
  function hideCookieBanner(){
    cookieBanner.classList.remove('show');
    cookieBanner.setAttribute('aria-hidden','true');
  }

  // Login / logout safe handlers (no double listeners)
  function setLoginAsLogout(lang){
    loginBtn.onclick = null;
    loginBtn.textContent = translations[lang].logoutBtn || translations.ru.logoutBtn;
    loginBtn.classList.remove('primary');
    loginBtn.onclick = logoutHandler;
  }
  function setLoginAsLogin(lang){
    loginBtn.onclick = null;
    loginBtn.textContent = translations[lang].loginBtn || translations.ru.loginBtn;
    loginBtn.classList.add('primary');
    loginBtn.onclick = () => openModal(tgModal);
  }

  function logoutHandler(){
    localStorage.removeItem('telegramUser');
    sessionStorage.removeItem('telegramUser');
    const lang = localStorage.getItem('siteLang') || 'ru';
    setGreetingGuest(lang);
    setLoginAsLogin(lang);
  }

  // attach menu button
  menuBtn.addEventListener('click', () => openModal(menuModal));

  // cookie handlers
  acceptCookies.addEventListener('click', () => {
    localStorage.setItem('cookieAccepted','yes');
    hideCookieBanner();
    const saved = localStorage.getItem('telegramUser');
    if(!saved){
      openModal(tgModal);
    }
  });

  declineCookies.addEventListener('click', () => {
    localStorage.setItem('cookieAccepted','no');
    hideCookieBanner();
    localStorage.removeItem('telegramUser');
  });

  // Telegram auth callback
  window.onTelegramAuth = function(user){
    try {
      const cookieAccepted = localStorage.getItem('cookieAccepted') === 'yes';
      if(cookieAccepted){
        localStorage.setItem('telegramUser', JSON.stringify(user));
      } else {
        sessionStorage.setItem('telegramUser', JSON.stringify(user));
      }
      const lang = localStorage.getItem('siteLang') || 'ru';
      setGreetingWithUser(user, lang);
      setLoginAsLogout(lang);
      closeModalById('tgModal');
      // unobtrusive toast instead of alert
      showToast((translations[lang].loginBtn ? translations[lang].loginBtn + ' ' : '') + (user.first_name || user.username || ''));
    } catch (err) {
      console.error('onTelegramAuth error', err);
    }
  };

  // Tiny toast
  function showToast(msg, ms = 2200){
    let t = document.getElementById('siteToast');
    if(!t){
      t = document.createElement('div');
      t.id = 'siteToast';
      t.style.position = 'fixed';
      t.style.right = '16px';
      t.style.bottom = '16px';
      t.style.padding = '10px 14px';
      t.style.borderRadius = '10px';
      t.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
      t.style.background = 'var(--card)';
      t.style.color = 'var(--text)';
      t.style.zIndex = 2000;
      t.style.transition = 'opacity 240ms ease';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._h);
    t._h = setTimeout(()=>{ t.style.opacity = '0'; }, ms);
  }

  // on load: language, cookie and user init
  (function init(){
    const savedLang = localStorage.getItem('siteLang') || detectBrowserLang() || 'ru';
    localStorage.setItem('siteLang', savedLang);
    applyTranslations(savedLang);

    const cookie = localStorage.getItem('cookieAccepted');
    const saved = localStorage.getItem('telegramUser') || sessionStorage.getItem('telegramUser');

    if(cookie === null){
      showCookieBanner();
    } else if(cookie === 'no'){
      hideCookieBanner();
      // try session user
      if(sessionStorage.getItem('telegramUser') && !localStorage.getItem('telegramUser')){
        try {
          const u = JSON.parse(sessionStorage.getItem('telegramUser'));
          setGreetingWithUser(u, savedLang);
          setLoginAsLogout(savedLang);
        } catch(e){}
      }
    } else { // yes
      hideCookieBanner();
      if(localStorage.getItem('telegramUser')){
        try {
          const user = JSON.parse(localStorage.getItem('telegramUser'));
          setGreetingWithUser(user, savedLang);
          setLoginAsLogout(savedLang);
        } catch(e){ setGreetingGuest(savedLang); setLoginAsLogin(savedLang); }
      } else {
        // show login modal if no user saved
        openModal(tgModal);
      }
    }
  })();

  // language buttons
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if(!lang) return;
      localStorage.setItem('siteLang', lang);
      applyTranslations(lang);
    });
  });

  // helper: detect browser language simple mapping
  function detectBrowserLang(){
    const nav = navigator.language || navigator.userLanguage || 'ru';
    if(nav.startsWith('uk')) return 'uk';
    if(nav.startsWith('en')) return 'en';
    if(nav.startsWith('be')) return 'ru'; // fallback
    if(nav.startsWith('ru')) return 'ru';
    return 'ru';
  }

  // Accessibility: close modal by Esc
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      document.querySelectorAll('.modal').forEach(m => m.setAttribute('aria-hidden','true'));
    }
  });

  // close modal by clicking outside
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', (e) => {
      if(e.target === m) m.setAttribute('aria-hidden','true');
    });
  });

})();

// Последнее видео с YouTube + подписчики
(function(){
  const apiKey = 'AIzaSyAF--RJuLhHoKvQlucjj2_NF_RTcrvjqeo';
  const channelId = 'UCrZA2Mj6yKZkEcBIqdfF6Ag';

  const ytFrame = document.getElementById('ytframe');
  const subscriberEl = document.getElementById('subscriber-count');

  // Получаем последнее видео
  async function fetchLatestVideo(){
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=1&type=video`);
      if(!res.ok) throw new Error('YouTube API error');
      const data = await res.json();
      if(data.items && data.items.length>0){
        const videoId = data.items[0].id.videoId;
        ytFrame.src = `https://www.youtube.com/embed/${videoId}`;
      }
    } catch(e){
      console.error(e);
    }
  }

  // Получаем количество подписчиков
  async function fetchSubscribers(){
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`);
      if(!res.ok) throw new Error('YouTube API error');
      const data = await res.json();
      if(data.items && data.items.length>0){
        subscriberEl.textContent = Number(data.items[0].statistics.subscriberCount).toLocaleString('en-US');
      } else {
        subscriberEl.textContent = 'Ошибка';
      }
    } catch(e){
      console.error(e);
      subscriberEl.textContent = 'Ошибка';
    }
  }

  fetchLatestVideo();
  fetchSubscribers();
  setInterval(fetchSubscribers,5000); // обновление подписчиков раз в минуту
})();
