var $ = require('jquery');
const musicScript = require('./musicScript');

var jamendoSong = '{"id":"1452541","name":"On Everything","duration":239,"artist_id":"498582","artist_name":"Axel Antunes","artist_idstr":"Axel_Antunes","album_name":"#1","album_id":"168787","license_ccurl":"http://creativecommons.org/licenses/by-sa/3.0/","position":1,"releasedate":"2017-05-29","album_image":"https://imgjam2.jamendo.com/albums/s168/168787/covers/1.200.jpg","audio":"https://mp3l.jamendo.com/?trackid=1452541&format=mp31&from=app-d328628b","audiodownload":"https://mp3d.jamendo.com/download/track/1452541/mp32/","prourl":"","shorturl":"http://jamen.do/t/1452541","shareurl":"http://www.jamendo.com/track/1452541","image":"https://imgjam2.jamendo.com/albums/s168/168787/covers/1.200.jpg"}';
var deezerSong = JSON.parse('{"id":118655608,"readable":true,"title":"Unspeakable World","title_short":"Unspeakable World","title_version":"","link":"https://www.deezer.com/track/118655608","duration":283,"rank":305535,"explicit_lyrics":false,"preview":"https://e-cdns-preview-9.dzcdn.net/stream/992022ec4f11760ff134dd41c61c9e99-2.mp3","artist":{"id":4052492,"name":"GoGo Penguin","link":"https://www.deezer.com/artist/4052492","picture":"https://api.deezer.com/artist/4052492/image","picture_small":"https://e-cdns-images.dzcdn.net/images/artist/93e964a5b63342ebf7ea6a59885e50be/56x56-000000-80-0-0.jpg","picture_medium":"https://e-cdns-images.dzcdn.net/images/artist/93e964a5b63342ebf7ea6a59885e50be/250x250-000000-80-0-0.jpg","picture_big":"https://e-cdns-images.dzcdn.net/images/artist/93e964a5b63342ebf7ea6a59885e50be/500x500-000000-80-0-0.jpg","picture_xl":"https://e-cdns-images.dzcdn.net/images/artist/93e964a5b63342ebf7ea6a59885e50be/1000x1000-000000-80-0-0.jpg","tracklist":"https://api.deezer.com/artist/4052492/top?limit=50","type":"artist"},"album":{"id":12337850,"title":"Man Made Object (Deluxe)","cover":"https://api.deezer.com/album/12337850/image","cover_small":"https://e-cdns-images.dzcdn.net/images/cover/0eb8f51eb7f1d5cbe87b14cb5784d8cb/56x56-000000-80-0-0.jpg","cover_medium":"https://e-cdns-images.dzcdn.net/images/cover/0eb8f51eb7f1d5cbe87b14cb5784d8cb/250x250-000000-80-0-0.jpg","cover_big":"https://e-cdns-images.dzcdn.net/images/cover/0eb8f51eb7f1d5cbe87b14cb5784d8cb/500x500-000000-80-0-0.jpg","cover_xl":"https://e-cdns-images.dzcdn.net/images/cover/0eb8f51eb7f1d5cbe87b14cb5784d8cb/1000x1000-000000-80-0-0.jpg","tracklist":"https://api.deezer.com/album/12337850/tracks","type":"album"},"type":"track"}');
var formattedSong = {
    title: "Unspeakable World",
    artist: "GoGo Penguin",
    cover: "https://e-cdns-images.dzcdn.net/images/cover/0eb8f51eb7f1d5cbe87b14cb5784d8cb/56x56-000000-80-0-0.jpg",
    preview: "https://e-cdns-preview-9.dzcdn.net/stream/992022ec4f11760ff134dd41c61c9e99-2.mp3",
    link: "https://www.deezer.com/track/118655608",
    service: "deezer"
};

test('generateSongHtml', () => {
  songHtml = musicScript.generateSongHtml(formattedSong);

  expect(songHtml.find("img").length).toBe(1);
  expect(songHtml.find(".musicDesc").length).toBe(1);
  expect(songHtml.find(".music-player").length).toBe(1);
  expect(songHtml.hasClass("song")).toBeTruthy();
});

test('formatJamendoSong', () => {
  formattedSong = musicScript.formatJamendoSong(jamendoSong);

  expect(formattedSong.title).toBe(deezerSong.name);
  expect(formattedSong.artist).toBe(deezerSong.artist_name);
  expect(formattedSong.cover).toBe(deezerSong.album_image);
  expect(formattedSong.preview).toBe(deezerSong.audio);
  expect(formattedSong.link).toBe(deezerSong.shareurl);
  expect(formattedSong.service).toBe("jamendo");
});

test('formatDeezerSong', () => {
  formattedSong = musicScript.formatDeezerSong(deezerSong);

  expect(formattedSong.title).toBe(deezerSong.title);
  expect(formattedSong.artist).toBe(deezerSong.artist.name);
  expect(formattedSong.cover).toBe(deezerSong.album.cover_small);
  expect(formattedSong.preview).toBe(deezerSong.preview);
  expect(formattedSong.link).toBe(deezerSong.link);
  expect(formattedSong.service).toBe("deezer");
});