var express = require("express");
var router = express.Router();
var request = require('request');
var test = require("../managers/test");

var SpotifyWebApi = require('spotify-web-api-node');

var spotifyTokenStart = new Date();
var spotifyTokenDuration = -1;

// Create the api object with the credentials
var spotifyApi = new SpotifyWebApi({
  clientId : '55a904c1f12a42238e0d4b6e10401cfd',
  clientSecret : '3f03dc78b1074383862c6dacea03062d'
});

router.get("/", function(req, res) {
    console.log('query: ', req.query.q);
    searchSongs(req, res);
});

function SpotifySuccessCallback(data, res, songs) {
    
}

function searchSongs(req, res) {
    Jamendo.searchSongs(req.query.q, res, []);
}

var Jamendo = {
    searchSongs: function(query, res, songs) {
        request("https://api.jamendo.com/v3.0/tracks/?client_id=d328628b&format=jsonpretty&limit=20&namesearch=" + encodeURI(query),
            function (error, response, body) {
                console.log('Jamendo response: ', response && response.statusCode);
                JSON.parse(body).results.forEach(function (song) {
                    songs.push(Jamendo.formatSong(song, false));
                });
                Deezer.searchSongs(query, res, songs);
            });
    },
    formatSong: function(song) {
        return {
            title: song.name,
            artist: song.artist_name,
            img: song.album_image,
            preview: song.audio,
            href: song.shareurl,
            player: "jamendo"
        };
    }
}

var Deezer = {
    searchSongs: function(query, res, songs) {
        if (typeof query === 'string' && query.length > 0) {
            request("https://api.deezer.com/search/track?q=" + encodeURI(query),
                function (error, response, body) {
                    console.log('Deezer response: ', response && response.statusCode);
                    JSON.parse(body).data.forEach(function (song) {
                        songs.push(Deezer.formatSong(song, false));
                    });
                    Spotify.searchSongs(query, res, songs);
                });
        }
    },
    formatSong: function(song) {
        return {
            title: song.title,
            artist: song.artist.name,
            img: song.album.cover_small,
            preview: song.preview,
            href: song.link,
            player: "deezer"
        };
    }   
}

var Spotify = {
    searchSongs: function(query, res, songs) {
        if (this.getTokenRemainingTime() > 0) {
            spotifyApi.searchTracks(query)
                .then(function(data) {
                    console.log("Spotify response: ", data.statusCode)
                    data.body.tracks.items.forEach(function(song) {
                        songs.push(Spotify.formatSong(song));
                    });
                    return res.status(200).send(songs);
            }, function(err) {
                    return res.status(200).send(songs);
                });
        } else {
            this.refreshToken(function() {Spotify.searchSongs(query, res, songs)});
        }
    },
    refreshToken: function(callback) {
        spotifyApi.clientCredentialsGrant()
          .then(function(data) {
            spotifyTokenStart = new Date();
            spotifyTokenDuration = parseInt(data.body['expires_in']);
            console.log('New spotify token: ' + data.body['access_token']);

            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
            if (callback)
                callback();
          }, function(err) {
                console.log('Something went wrong when retrieving an access token', err);
          });
    },
    getTokenRemainingTime: function() {
        var remainingTime = spotifyTokenDuration - (new Date() - spotifyTokenStart) / 1000;
        console.log("Spotify token expires in", remainingTime, "seconds");
        return remainingTime;
    },
    formatSong: function(song) {
        return {
            title: song.name,
            artist: song.artists[0].name,
            img: song.album.images[1].url,
            preview: song.preview_url,
            href: song.href,
            player: "spotify"
        };
    }
}

module.exports = router;
