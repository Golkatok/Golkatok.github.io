// script.js — полная версия
(function(){
  // DOM elements
  const menuBtn = document.getElementById('menuBtn');
  const menuModal = document.getElementById('menuModal');
  const tgModal = document.getElementById('tgModal');
  const loginBtn = document.getElementById('loginBtn');
  const cookieBanner = document.getElementById('cookieBanner');
  const acceptCookies = document.getElementById('acceptCookies');
  const declineCookies = document.getElementById('declineCookies');
  const greeting = document.getElementById('greeting');
  const avatarImg = document.getElementById('avatarImg');
  const langButtons = document.querySelectorAll('.lang-btn');
  const i18nElements = document.querySelectorAll('[data-i18n]');

  // YouTube elements (may be null if removed)
  const ytFrame = document.getElementById('ytframe');
  const subscriberEl = document.getElementById('subscriber-count');

  // YouTube API config
  const YT_API_KEY = 'AIzaSyAF--RJuLhHoKvQlucjj2_NF_RTcrvjqeo';
  const YT_CHANNEL_ID = 'UCrZA2Mj6yKZkEcBIqdfF6Ag';

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
      tgHeading: 'Telegram login',
      tgHint: 'After successful authorization, the username will appear in the greeting.',
      cookieText: 'This site uses cookies to remember Telegram login and settings. Accept?',
      accept: 'Accept',
      decline: 'Decline'
    }
  };

  /* -------------------- Utility: modals & i18n -------------------- */
  function openModal(el){
    if(!el) return;
    el.setAttribute('aria-hidden','false');
  }
  function closeModalById(id){
    const el = document.getElementById(id);
    if(el) el.setAttribute('aria-hidden','true');
  }

  // Apply translations to elements with data-i18n
  function applyTranslations(lang){
    const dict = translations[lang] || translations.ru;
    i18nElements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if(!key) return;
      if(dict[key] !== undefined){
        el.textContent = dict[key];
      }
    });

    // greeting handling
    const saved = localStorage.getItem('telegramUser') || sessionStorage.getItem('telegramUser');
    if(saved){
      try {
        const user = JSON.parse(saved);
        setGreetingWithUser(user, lang);
        setLoginAsLogin(lang); // always show login button (no logout)
      } catch(e){
        setGreetingGuest(lang);
        setLoginAsLogin(lang);
      }
    } else {
      setGreetingGuest(lang);
      setLoginAsLogin(lang);
    }

    // highlight active lang button
    langButtons.forEach(b => {
      if(b.dataset.lang === lang) b.classList.add('active-lang');
      else b.classList.remove('active-lang');
    });

    // set html lang
    document.documentElement.lang = (lang === 'uk' ? 'uk' : (lang === 'en' ? 'en' : 'ru'));
  }

  function setGreetingGuest(lang){
    const txt = translations[lang].greeting_guest || translations.ru.greeting_guest;
    if(greeting) greeting.textContent = txt;
  }
  function setGreetingWithUser(user, lang){
    if(!greeting) return;
    const prefix = translations[lang].greeting_prefix || translations.ru.greeting_prefix;
    const name = (user && (user.first_name || user.username)) ? (user.first_name || user.username) : (translations[lang].greeting_guest || translations.ru.greeting_guest);
    greeting.textContent = prefix + ' ' + name + '!';
  }

  // Keep only login behavior (no logout button)
  function setLoginAsLogin(lang){
    if(!loginBtn) return;
    loginBtn.onclick = null;
    loginBtn.textContent = translations[lang].loginBtn || translations.ru.loginBtn;
    loginBtn.classList.add('primary');
    loginBtn.onclick = () => openModal(tgModal);
  }

  /* -------------------- Toast -------------------- */
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

  /* -------------------- Event wiring -------------------- */
  // menu open
  if(menuBtn){
    menuBtn.addEventListener('click', () => openModal(menuModal));
  }

  // modal close buttons (data-close attribute should contain modal id)
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e)=>{
      const target = btn.dataset.close;
      if(target) closeModalById(target);
      else {
        // try to detect parent modal
        const parent = btn.closest('.modal');
        if(parent && parent.id) parent.setAttribute('aria-hidden','true');
      }
    });
  });

  // close modal by clicking outside
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', (e) => {
      if(e.target === m) m.setAttribute('aria-hidden','true');
    });
  });

  // close by Esc
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      document.querySelectorAll('.modal').forEach(m => m.setAttribute('aria-hidden','true'));
    }
  });

  // cookie handlers
  if(acceptCookies){
    acceptCookies.addEventListener('click', () => {
      localStorage.setItem('cookieAccepted','yes');
      hideCookieBanner();
      // if no stored user yet, open tg modal
      if(!localStorage.getItem('telegramUser')){
        openModal(tgModal);
      }
    });
  }
  if(declineCookies){
    declineCookies.addEventListener('click', () => {
      localStorage.setItem('cookieAccepted','no');
      hideCookieBanner();
      // remove persistent stored user if any
      localStorage.removeItem('telegramUser');
    });
  }

  function showCookieBanner(){
    if(!cookieBanner) return;
    cookieBanner.classList.add('show');
    cookieBanner.setAttribute('aria-hidden','false');
  }
  function hideCookieBanner(){
    if(!cookieBanner) return;
    cookieBanner.classList.remove('show');
    cookieBanner.setAttribute('aria-hidden','true');
  }

  // language buttons
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if(!lang) return;
      localStorage.setItem('siteLang', lang);
      applyTranslations(lang);
    });
  });

  // detect browser lang
  function detectBrowserLang(){
    const nav = navigator.language || navigator.userLanguage || 'ru';
    if(nav.startsWith('uk')) return 'uk';
    if(nav.startsWith('en')) return 'en';
    if(nav.startsWith('be')) return 'ru';
    if(nav.startsWith('ru')) return 'ru';
    return 'ru';
  }

  /* -------------------- Telegram auth callback (global) -------------------- */
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
      setLoginAsLogin(lang);
      closeModalById('tgModal');
      showToast((translations[lang].loginBtn ? translations[lang].loginBtn + ' ' : '') + (user.first_name || user.username || ''));
    } catch (err) {
      console.error('onTelegramAuth error', err);
    }
  };

  /* -------------------- YouTube: latest video + subscriber count -------------------- */
  async function fetchLatestVideo(){
    if(!ytFrame) return;
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${YT_CHANNEL_ID}&part=snippet&order=date&maxResults=1&type=video`;
      const res = await fetch(url);
      if(!res.ok) throw new Error('YouTube search API error: '+res.status);
      const data = await res.json();
      if(data.items && data.items.length>0 && data.items[0].id && data.items[0].id.videoId){
        const videoId = data.items[0].id.videoId;
        // set iframe src only if changed to avoid reloads
        const newSrc = `https://www.youtube.com/embed/${videoId}`;
        if(ytFrame.src !== newSrc) ytFrame.src = newSrc;
      }
    } catch(e){
      console.error('fetchLatestVideo:', e);
    }
  }

  async function fetchSubscribers(){
    if(!subscriberEl) return;
    try {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YT_CHANNEL_ID}&key=${YT_API_KEY}`;
      const res = await fetch(url);
      if(!res.ok) throw new Error('YouTube channels API error: '+res.status);
      const data = await res.json();
      if(data.items && data.items.length>0 && data.items[0].statistics && data.items[0].statistics.subscriberCount !== undefined){
        // exact number, no rounding; formatted with thousand separators
        subscriberEl.textContent = Number(data.items[0].statistics.subscriberCount).toLocaleString('en-US');
      } else {
        subscriberEl.textContent = '—';
      }
    } catch(e){
      console.error('fetchSubscribers:', e);
      subscriberEl.textContent = 'Ошибка';
    }
  }

  /* -------------------- Init -------------------- */
  (function init(){
    // language init
    const savedLang = localStorage.getItem('siteLang') || detectBrowserLang() || 'ru';
    localStorage.setItem('siteLang', savedLang);
    applyTranslations(savedLang);

    // cookie / user init
    const cookie = localStorage.getItem('cookieAccepted');
    const saved = localStorage.getItem('telegramUser') || sessionStorage.getItem('telegramUser');

    if(cookie === null){
      // show cookie banner first visit
      showCookieBanner();
    } else if(cookie === 'no'){
      hideCookieBanner();
      // if session user exists, use it
      if(sessionStorage.getItem('telegramUser') && !localStorage.getItem('telegramUser')){
        try {
          const u = JSON.parse(sessionStorage.getItem('telegramUser'));
          setGreetingWithUser(u, savedLang);
          setLoginAsLogin(savedLang);
        } catch(e){}
      }
    } else { // cookie === 'yes'
      hideCookieBanner();
      if(localStorage.getItem('telegramUser')){
        try {
          const user = JSON.parse(localStorage.getItem('telegramUser'));
          setGreetingWithUser(user, savedLang);
          setLoginAsLogin(savedLang);
        } catch(e){ setGreetingGuest(savedLang); setLoginAsLogin(savedLang); }
      } else {
        // if cookies accepted but no stored user, prompt login
        openModal(tgModal);
      }
    }

    // wire up initial click handlers already set above
    // fetch youtube data (if elements present)
    fetchLatestVideo();
    fetchSubscribers();
    // refresh subscribers periodically
    setInterval(fetchSubscribers, 60000);
  })();

})();
