document.getElementById("spotify-login").addEventListener("click", () => {
  const clientId = "0389aee26c424efca9c19679d57d825d";
  const redirectUri = "https://golkatok.github.io/SpotifyCallback.html";
  const scopes = "user-read-email user-read-private";

  const authUrl =
    `https://accounts.spotify.com/authorize?client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}`;

  window.location.href = authUrl;
});
