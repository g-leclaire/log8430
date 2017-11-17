var $ = require('jquery');
const musicScript = require('./musicScript');

var deezerSong = JSON.parse('{"id":118655608,"readable":true,"title":"Unspeakable World","title_short":"Unspeakable World","title_version":"","link":"https://www.deezer.com/track/118655608","duration":283,"rank":305535,"explicit_lyrics":false,"preview":"https://e-cdns-preview-9.dzcdn.net/stream/992022ec4f11760ff134dd41c61c9e99-2.mp3","artist":{"id":4052492,"name":"GoGo Penguin","link":"https://www.deezer.com/artist/4052492","picture":"https://api.deezer.com/artist/4052492/image","picture_small":"https://e-cdns-images.dzcdn.net/images/artist/93e964a5b63342ebf7ea6a59885e50be/56x56-000000-80-0-0.jpg","picture_medium":"https://e-cdns-images.dzcdn.net/images/artist/93e964a5b63342ebf7ea6a59885e50be/250x250-000000-80-0-0.jpg","picture_big":"https://e-cdns-images.dzcdn.net/images/artist/93e964a5b63342ebf7ea6a59885e50be/500x500-000000-80-0-0.jpg","picture_xl":"https://e-cdns-images.dzcdn.net/images/artist/93e964a5b63342ebf7ea6a59885e50be/1000x1000-000000-80-0-0.jpg","tracklist":"https://api.deezer.com/artist/4052492/top?limit=50","type":"artist"},"album":{"id":12337850,"title":"Man Made Object (Deluxe)","cover":"https://api.deezer.com/album/12337850/image","cover_small":"https://e-cdns-images.dzcdn.net/images/cover/0eb8f51eb7f1d5cbe87b14cb5784d8cb/56x56-000000-80-0-0.jpg","cover_medium":"https://e-cdns-images.dzcdn.net/images/cover/0eb8f51eb7f1d5cbe87b14cb5784d8cb/250x250-000000-80-0-0.jpg","cover_big":"https://e-cdns-images.dzcdn.net/images/cover/0eb8f51eb7f1d5cbe87b14cb5784d8cb/500x500-000000-80-0-0.jpg","cover_xl":"https://e-cdns-images.dzcdn.net/images/cover/0eb8f51eb7f1d5cbe87b14cb5784d8cb/1000x1000-000000-80-0-0.jpg","tracklist":"https://api.deezer.com/album/12337850/tracks","type":"album"},"type":"track"}');

test('generateDeezerSongHtml', () => {
  songHtml = musicScript.generateDeezerSongHtml(deezerSong);

  expect(songHtml.find("img").length).toBe(1);
  expect(songHtml.find(".musicDesc").length).toBe(1);
  expect(songHtml.find(".music-player").length).toBe(1);
  expect(songHtml.hasClass("song")).toBeTruthy();

});