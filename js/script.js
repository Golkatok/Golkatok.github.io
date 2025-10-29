const menuBtn = document.getElementById('menuBtn');
const flyMenu = document.getElementById('flyMenu');
const searchBtn = document.getElementById('searchBtn');
const searchPanel = document.getElementById('searchPanel');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const settingsBtn = document.getElementById('settingsBtn');

menuBtn.addEventListener('click', () => {
  flyMenu.classList.toggle('show');
  searchPanel.classList.remove('show');
});

searchBtn.addEventListener('click', () => {
  searchPanel.classList.toggle('show');
  flyMenu.classList.remove('show');
});

searchClear.addEventListener('click', () => searchPanel.classList.remove('show'));

searchForm.addEventListener('submit', (e) => {
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

settingsBtn.addEventListener('click', () => {
  alert('Открыть настройки (сюда можно добавить действия).');
});

document.addEventListener('click', (e) => {
  if (!flyMenu.contains(e.target) && !menuBtn.contains(e.target)) flyMenu.classList.remove('show');
  if (!searchPanel.contains(e.target) && !searchBtn.contains(e.target)) {
    if (e.target !== searchInput) searchPanel.classList.remove('show');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    flyMenu.classList.remove('show');
    searchPanel.classList.remove('show');
  }
});
