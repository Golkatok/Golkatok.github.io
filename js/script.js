// элементы
const menuBtn = document.getElementById('menuBtn');
const flyMenu = document.getElementById('flyMenu');
const searchBtn = document.getElementById('searchBtn');
const searchPanel = document.getElementById('searchPanel');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const settingsBtn = document.getElementById('settingsBtn');

// показать / скрыть вылетающее меню (слева)
menuBtn.addEventListener('click', () => {
  const visible = flyMenu.style.display === 'block';
  flyMenu.style.display = visible ? 'none' : 'block';
});

// поиск: показать/скрыть панель
searchBtn.addEventListener('click', () => {
  const isOpen = searchPanel.style.display === 'flex';
  if(isOpen){
    hideSearch();
  } else {
    showSearch();
  }
});

searchClear.addEventListener('click', hideSearch);

function showSearch(){
  searchPanel.style.display = 'flex';
  searchPanel.setAttribute('aria-hidden','false');
  searchInput.focus();
}
function hideSearch(){
  clearHighlights();
  searchPanel.style.display = 'none';
  searchPanel.setAttribute('aria-hidden','true');
  searchInput.value = '';
}

// реальный поиск по странице: подсветка совпадений
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = (searchInput.value || '').trim();
  clearHighlights();
  if(!q) return;
  highlightText(q);
});

// функция подсветки (простой, работает для обычного текста)
function highlightText(query){
  const body = document.querySelector('body');
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false);
  const nodes = [];
  while(walker.nextNode()){
    const n = walker.currentNode;
    if(n.parentNode && !['SCRIPT','STYLE'].includes(n.parentNode.tagName) && n.nodeValue.trim()){
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
    while((match = regex.exec(text)) !== null){
      const start = match.index;
      const end = regex.lastIndex;
      if(start > lastIndex){
        frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
      }
      const mark = document.createElement('span');
      mark.className = 'highlighted';
      mark.textContent = text.slice(start, end);
      frag.appendChild(mark);
      lastIndex = end;
    }
    if(lastIndex === 0){
      // no matches, leave original
      return;
    }
    if(lastIndex < text.length){
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    parent.replaceChild(frag, textNode);
  });

  // прокрутка к первому совпадению
  const first = document.querySelector('.highlighted');
  if(first){
    first.scrollIntoView({behavior:'smooth', block:'center'});
  }
}

function clearHighlights(){
  const marks = document.querySelectorAll('.highlighted');
  marks.forEach(m => {
    const txt = document.createTextNode(m.textContent);
    m.parentNode.replaceChild(txt, m);
  });
}

// escape regexp
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// settings btn (пока заглушка)
settingsBtn.addEventListener('click', () => {
  alert('Открыть настройки (сюда можно добавить действия).');
});

// закрываем меню при клике за пределами
document.addEventListener('click', (e) => {
  if(!flyMenu.contains(e.target) && !menuBtn.contains(e.target)){
    flyMenu.style.display = 'none';
  }
  if(!searchPanel.contains(e.target) && !searchBtn.contains(e.target)){
    // не закрываем если клик по input
    if(e.target !== searchInput) hideSearch();
  }
});

// клавиша Esc закрывает
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    flyMenu.style.display = 'none';
    hideSearch();
  }
});
