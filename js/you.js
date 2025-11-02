// ========== НАСТРОЙКИ ==========
const API_KEY = "AIzaSyAF--RJuLhHoKvQlucjj2_NF_RTcrvjqeo";
const CHANNEL_ID = "UCrZA2Mj6yKZkEcBIqdfF6Ag"; // ID твоего канала
const POLL_INTERVAL = 5 * 100; // обновление раз в 60 секунд
// ===============================

const subEl = document.getElementById('subCount');
const nameEl = document.getElementById('channelName');
const errEl = document.getElementById('err');
const loadEl = document.getElementById('loading');

async function fetchSubs() {
  try {
    errEl.style.display = 'none';
    loadEl.style.display = 'block';
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${CHANNEL_ID}&key=${API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);

    const j = await resp.json();
    if (!j.items || j.items.length === 0) throw new Error('Канал не найден');

    const stats = j.items[0].statistics;
    const snippet = j.items[0].snippet;
    const count = stats.subscriberCount ?? '0';
    animateCount(count);
    nameEl.textContent = snippet.title || 'Канал';
  } catch (e) {
    console.error(e);
    errEl.style.display = 'block';
    errEl.textContent = 'Ошибка: ' + e.message;
  } finally {
    loadEl.style.display = 'none';
  }
}

// Плавная анимация изменения числа
let current = 0;
function animateCount(newCount) {
  const target = Number(newCount);
  if (isNaN(target)) {
    subEl.textContent = newCount;
    current = target;
    return;
  }

  const step = Math.max(1, Math.floor(Math.abs(target - current) / 20));
  const tick = () => {
    if (current === target) return;
    current += (current < target ? step : -step);
    if ((step > 1 && Math.abs(target - current) < step)) current = target;
    subEl.textContent = current.toLocaleString('ru-RU');
    requestAnimationFrame(tick);
  };
  tick();
}

// Первый запуск и обновление по интервалу
fetchSubs();
setInterval(fetchSubs, POLL_INTERVAL);
