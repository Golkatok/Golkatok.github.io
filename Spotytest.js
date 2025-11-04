// redirect на Spotify login
const clientId = "ТВОЙ_CLIENT_ID";
const redirectUri = "https://твойдомен/SpotifyCallback.html";
const scopes = "user-read-private user-read-email";

function loginWithSpotify() {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
  window.location.href = authUrl;
}
