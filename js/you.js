document.addEventListener("DOMContentLoaded", async () => {
  const apiKey = "AIzaSyAF--RJuLhHoKvQlucjj2_NF_RTcrvjqeo"; // заменишь на свой
  const channelId = "UCrZA2Mj6yKZkEcBIqdfF6Ag";     // ID твоего канала
  const subsElement = document.getElementById("yt-subs");

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`);
    const data = await response.json();
    const subs = data.items[0].statistics.subscriberCount;

    subsElement.textContent = subs ? `${subs} подписчиков` : "Ошибка загрузки";
  } catch (error) {
    subsElement.textContent = "Не удалось загрузить данные";
  }
});
