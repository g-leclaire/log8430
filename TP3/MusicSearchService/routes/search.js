var express = require("express");
var router = express.Router();
var request = require('request');
var test = require("../managers/test");

router.get("/", function(req, res) {
    return res.status(200).send("Ça fonctionne.");
});


router.get("/:query", function(req, res) {
    searchSongs(req, res);
});

function searchSongs(req, res) {
    JamendoAPI.searchSongs(req.params.query, res, []);
}

var SpotifyAPI = {
    searchSongs: function() {
        var params = musicScript.getWindowHashParams();

        access_token = params.access_token;
        refresh_token = params.refresh_token;
        error = params.error;

        /*On fait une requete pour raffraichir les tokens*/
        $.ajax({
            url: '/refresh_token',
            data: {
                'refresh_token': refresh_token
            }
        }).done(function (data) {
            access_token = data.access_token;
        });


        /*On va chercher la valeur de la recherche*/
        $.ajax({
            url: 'https://api.spotify.com/v1/search?q=' + encodeURIComponent($('#searchField').val()) + '&type=track&limit=10',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function (response) {

                var results = response.tracks.items;
                results.forEach(function (song) {
                    $('#musiqueTab').append(musicScript.generateSongHtml(musicScript.formatSpotifySong(song, false)));
                });
                musicScript.sort($('#musiqueTab .song'));// Sort all elements;
            }
        });
    }
}

var JamendoAPI = {
    searchSongs: function(query, res, songs) {
        request("https://api.jamendo.com/v3.0/tracks/?client_id=d328628b&format=jsonpretty&limit=20&namesearch=" + encodeURI(query),
            function (error, response, body) {
                console.log('Jamendo response: ', response && response.statusCode);
                JSON.parse(body).results.forEach(function (song) {
                    songs.push(formatJamendoSong(song, false));
                });
                DeezerAPI.searchSongs(query, res, songs);
            });
    }
}

var DeezerAPI = {
    searchSongs: function(query, res, songs) {
        if (typeof query === 'string' && query.length > 0) {
            request("https://api.deezer.com/search/track?q=" + encodeURI(query),
                function (error, response, body) {
                    console.log('Deezer response: ', response && response.statusCode);
                    JSON.parse(body).data.forEach(function (song) {
                        songs.push(formatDeezerSong(song, false));
                    });
                    res.status(200).send(songs);
                });
        }
    }
}

formatJamendoSong = function(song) {
    return {
        title: song.name,
        artist: song.artist_name,
        img: song.album_image,
        preview: song.audio,
        href: song.shareurl,
        player: "jamendo"
    };
}


formatDeezerSong = function(song) {
    return {
        title: song.title,
        artist: song.artist.name,
        img: song.album.cover_small,
        preview: song.preview,
        href: song.link,
        player: "deezer"
    };
}

formatSpotifySong = function(song) {
    return {
        title: song.name,
        artist: song.artists[0].name,
        img: song.album.images[1].url,
        preview: song.preview_url,
        href: song.href,
        player: "spotify"
    };
}

module.exports = router;
