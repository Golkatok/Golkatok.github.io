// ======= Telegram Login =======
window.onTelegramAuth = function (user) {
  localStorage.setItem("tgUser", JSON.stringify(user));
  updateUserInfo(user);
};

// ======= Обновление интерфейса =======
function updateUserInfo(user) {
  const name = user?.first_name || "Гость";
  const nameEl = document.querySelector(".card h1");
  const logoutBtn = document.querySelector(".logout-btn");
  const tgLogin = document.getElementById("tgLogin");

  if (nameEl) nameEl.innerText = `Привет, ${name}!`;
  if (logoutBtn) logoutBtn.style.display = user ? "inline-block" : "none";
  if (tgLogin) tgLogin.style.display = user ? "none" : "inline-block";
}

// ======= Выход =======
function logout() {
  localStorage.removeItem("tgUser");
  updateUserInfo(null);
}

// ======= Инициализация DOM =======
document.addEventListener("DOMContentLoaded", () => {
  // Меню и настройки
  const menuBtn = document.getElementById("menuBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const menuModal = document.getElementById("menuModal");
  const settingsModal = document.getElementById("settingsModal");

  if (menuBtn && menuModal) {
    menuBtn.addEventListener("click", () => (menuModal.style.display = "flex"));
  }

  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener("click", () => (settingsModal.style.display = "flex"));
  }

  document.querySelectorAll(".modal").forEach((m) =>
    m.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) m.style.display = "none";
    })
  );

  // ======= Тема =======
  const themeSelect = document.getElementById("themeSelect");
  if (themeSelect) {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.body.classList.add("light");
      themeSelect.value = "light";
    }

    themeSelect.addEventListener("change", () => {
      const theme = themeSelect.value;
      document.body.classList.toggle("light", theme === "light");
      localStorage.setItem("theme", theme);
    });
  }

  // ======= Язык =======
  const langSelect = document.getElementById("langSelect");
  if (langSelect) {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) langSelect.value = savedLang;

    langSelect.addEventListener("change", () => {
      localStorage.setItem("lang", langSelect.value);
    });
  }

  // ======= Cookie =======
  const cookiePopup = document.getElementById("cookiePopup");
  if (cookiePopup && !localStorage.getItem("cookieAccepted")) {
    cookiePopup.style.display = "block";
    document.getElementById("acceptCookies").onclick = () => {
      localStorage.setItem("cookieAccepted", "true");
      cookiePopup.style.display = "none";
    };
    document.getElementById("declineCookies").onclick = () => {
      alert("Без cookies данные (например, вход через Telegram) не сохранятся.");
      cookiePopup.style.display = "none";
    };
  }

  // ======= Twitch Stream =======
  if (window.location.pathname.includes("news.html")) checkTwitchStream();

  // ======= Восстановление Telegram-пользователя =======
  const tgUser = localStorage.getItem("tgUser");
  updateUserInfo(tgUser ? JSON.parse(tgUser) : null);
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
