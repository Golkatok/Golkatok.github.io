/* ---------------------------
   UI: меню / поиск / настройки
   --------------------------- */

const menuBtn = document.getElementById('menuBtn');
const flyMenu = document.getElementById('flyMenu');
const searchBtn = document.getElementById('searchBtn');
const searchPanel = document.getElementById('searchPanel');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const themeSwitch = document.getElementById('themeSwitch');

if (menuBtn) menuBtn.addEventListener('click', () => {
  flyMenu.classList.toggle('show');
  searchPanel.classList.remove('show');
  settingsPanel.classList.remove('show');
});

if (searchBtn) searchBtn.addEventListener('click', () => {
  searchPanel.classList.toggle('show');
  flyMenu.classList.remove('show');
  settingsPanel.classList.remove('show');
});

if (searchClear) searchClear.addEventListener('click', () => searchPanel.classList.remove('show'));

if (searchForm) searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = (searchInput.value || '').trim();
  clearHighlights();
  if (!q) return;
  highlightText(q);
});

function highlightText(query) {
  const body = document.querySelector('body');
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false);
  const nodes = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (n.parentNode && !['SCRIPT','STYLE'].includes(n.parentNode.tagName) && n.nodeValue.trim()) {
      nodes.push(n);
    }
  }
  const regex = new RegExp(escapeRegExp(query), 'gi');
  nodes.forEach(textNode => {
    const parent = textNode.parentNode;
    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    const text = textNode.nodeValue;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = regex.lastIndex;
      if (start > lastIndex) frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
      const mark = document.createElement('span');
      mark.className = 'highlighted';
      mark.textContent = text.slice(start, end);
      frag.appendChild(mark);
      lastIndex = end;
    }
    if (lastIndex === 0) return;
    if (lastIndex < text.length) frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    parent.replaceChild(frag, textNode);
  });
  const first = document.querySelector('.highlighted');
  if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearHighlights() {
  document.querySelectorAll('.highlighted').forEach(m => {
    const txt = document.createTextNode(m.textContent);
    m.parentNode.replaceChild(txt, m);
  });
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

if (settingsBtn) settingsBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('show');
  flyMenu.classList.remove('show');
  searchPanel.classList.remove('show');
});

// клик вне блоков закрывает их
document.addEventListener('click', (e) => {
  if (flyMenu && !flyMenu.contains(e.target) && !menuBtn.contains(e.target)) flyMenu.classList.remove('show');
  if (searchPanel && !searchPanel.contains(e.target) && !searchBtn.contains(e.target)) {
    if (e.target !== searchInput) searchPanel.classList.remove('show');
  }
  if (settingsPanel && settingsPanel.classList.contains('show') && !settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
    settingsPanel.classList.remove('show');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (flyMenu) flyMenu.classList.remove('show');
    if (searchPanel) searchPanel.classList.remove('show');
    if (settingsPanel) settingsPanel.classList.remove('show');
  }
});

/* ---------------------------
   Theme switch
   --------------------------- */
if (themeSwitch) {
  // apply default from checkbox
  applyTheme(themeSwitch.checked);
  themeSwitch.addEventListener('change', () => applyTheme(themeSwitch.checked));
}

function applyTheme(darkChecked) {
  if (darkChecked) {
    document.body.classList.remove('light');
  } else {
    document.body.classList.add('light');
  }
}

/* ---------------------------
   Telegram auth integration
   --------------------------- */

// UI elements for profile
const telegramLoginContainer = document.getElementById('telegram-login');
const userInfoBlock = document.getElementById('user-info');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const userUsername = document.getElementById('user-username');
const logoutBtn = document.getElementById('logoutBtn');
const loginSection = document.getElementById('mainCard');

function showUserInfo(user) {
  // Hide login widget area
  if (telegramLoginContainer) telegramLoginContainer.classList.add('hidden');
  if (loginSection) loginSection.classList.add('has-user'); // optional
  // Fill UI
  if (userPhoto) userPhoto.src = user.photo_url || `https://placekitten.com/200/200`;
  if (userName) userName.textContent = `${user.first_name || ''}${user.last_name ? ' ' + user.last_name : ''}`.trim();
  if (userUsername) userUsername.textContent = user.username ? '@' + user.username : '';
  if (userInfoBlock) userInfoBlock.classList.remove('hidden');
}

function hideUserInfo() {
  if (telegramLoginContainer) telegramLoginContainer.classList.remove('hidden');
  if (loginSection) loginSection.classList.remove('has-user');
  if (userInfoBlock) userInfoBlock.classList.add('hidden');
  if (userPhoto) userPhoto.src = '';
  if (userName) userName.textContent = '';
  if (userUsername) userUsername.textContent = '';
}

// logout
if (logoutBtn) logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('telegramUser');
  hideUserInfo();
});

// on load, restore
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('telegramUser');
  if (saved) {
    try {
      const u = JSON.parse(saved);
      showUserInfo(u);
    } catch (e) { localStorage.removeItem('telegramUser'); }
  }

  // If telegramlogin.js already defined global onTelegramAuth (your file),
  // we keep it and wrap so both your alert and our UI run.
  // Save existing global (if any)
  const existing = window.onTelegramAuth;
  // Define wrapper that calls existing then our handler
  window.onTelegramAuth = function(user) {
    try {
      if (typeof existing === 'function') {
        try { existing(user); } catch (e) { console.warn('existing onTelegramAuth error', e); }
      }
    } finally {
      try {
        // Save and show
        localStorage.setItem('telegramUser', JSON.stringify(user));
        showUserInfo(user);
      } catch (err) { console.error('onTelegramAuth wrapper error', err); }
    }
  };
});
