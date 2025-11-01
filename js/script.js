// ======= Telegram Login =======
function onTelegramAuth(user) {
  localStorage.setItem("tgUser", JSON.stringify(user));
  document.querySelector(".card h1").innerText = `Привет, ${user.first_name}!`;
  document.querySelector(".logout-btn").style.display = "inline-block";
  document.getElementById("tgLogin").style.display = "none";
}

// ======= Выход =======
function logout() {
  localStorage.removeItem("tgUser");
  location.reload();
}

// ======= Меню и настройки =======
const menuBtn = document.getElementById("menuBtn");
const settingsBtn = document.getElementById("settingsBtn");
const menuModal = document.getElementById("menuModal");
const settingsModal = document.getElementById("settingsModal");

menuBtn.addEventListener("click", () => {
  menuModal.style.display = "flex";
});
settingsBtn.addEventListener("click", () => {
  settingsModal.style.display = "flex";
});
document.querySelectorAll(".modal").forEach(m => {
  m.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) m.style.display = "none";
  });
});

// ======= Темы =======
const themeSelect = document.getElementById("themeSelect");
themeSelect.addEventListener("change", () => {
  const theme = themeSelect.value;
  document.body.classList.toggle("light", theme === "light");
  localStorage.setItem("theme", theme);
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light");
  themeSelect.value = "light";
}

// ======= Язык =======
const langSelect = document.getElementById("langSelect");
langSelect.addEventListener("change", () => {
  localStorage.setItem("lang", langSelect.value);
});

const savedLang = localStorage.getItem("lang");
if (savedLang) langSelect.value = savedLang;

// ======= Cookie =======
const cookiePopup = document.getElementById("cookiePopup");
if (!localStorage.getItem("cookieAccepted")) {
  cookiePopup.style.display = "block";
}

document.getElementById("acceptCookies").addEventListener("click", () => {
  localStorage.setItem("cookieAccepted", "true");
  cookiePopup.style.display = "none";
});
document.getElementById("declineCookies").addEventListener("click", () => {
  alert("Без cookies данные (например, авторизация) не сохранятся.");
  cookiePopup.style.display = "none";
});

// ======= Twitch stream indicator =======
async function checkTwitchStream() {
  const username = "davasik";
  const url = `https://decapi.me/twitch/uptime/${username}`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    const statusEl = document.getElementById("streamStatus");

    if (!statusEl) return;

    if (text.includes("offline")) {
      statusEl.textContent = "Стрим: OFFLINE";
      statusEl.classList.remove("online");
      statusEl.classList.add("offline");
    } else {
      statusEl.textContent = "Стрим: ONLINE 🔴";
      statusEl.classList.remove("offline");
      statusEl.classList.add("online");
    }
  } catch (err) {
    console.error("Ошибка при проверке стрима:", err);
  }
}

// Проверяем стрим на новостной странице
if (window.location.pathname.includes("news.html")) {
  checkTwitchStream();
}

// ======= Инициализация =======
window.addEventListener("DOMContentLoaded", () => {
  const tgUser = localStorage.getItem("tgUser");
  if (tgUser) {
    const user = JSON.parse(tgUser);
    document.querySelector(".card h1").innerText = `Привет, ${user.first_name}!`;
    document.querySelector(".logout-btn").style.display = "inline-block";
    document.getElementById("tgLogin").style.display = "none";
  }
});
