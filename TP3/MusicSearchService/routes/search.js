var express = require("express");
var router = express.Router();
var request = require('request');
var test = require("../managers/test");
var SpotifyWebApi = require('spotify-web-api-node');

router.get("/", function(req, res) {
    console.log('Search query: ', req.query.q);
    searchSongs(req, res);
});

function searchSongs(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    Jamendo.searchSongs(req.query.q, res, []);
}

var Jamendo = {
    searchSongs: function(query, res, songs) {
        request("https://api.jamendo.com/v3.0/tracks/?client_id=d328628b&format=jsonpretty&limit=20&namesearch=" + encodeURI(query),
            function (error, response, body) {
                console.log('Jamendo response: ', response && response.statusCode);
                if (response.statusCode === 200) {
                    JSON.parse(body).results.forEach(function (song) {
                        songs.push(Jamendo.formatSong(song));
                    });
                }
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
        if (typeof query === 'string' && query.length > 0) { // No results for empty query
            request("https://api.deezer.com/search/track?q=" + encodeURI(query),
                function (error, response, body) {
                    console.log('Deezer response: ', response && response.statusCode);
                    if (response.statusCode === 200) {
                        JSON.parse(body).data.forEach(function (song) {
                            songs.push(Deezer.formatSong(song));
                        });
                    }
                    Spotify.searchSongs(query, res, songs);
                });
        }
        else {
            Spotify.searchSongs(query, res, songs);
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
            if (typeof query === 'string' && query.length > 0) { // No results for empty query
                this.api.searchTracks(query)
                    .then(function(data) {
                        console.log("Spotify response: ", data.statusCode)
                        if (data.statusCode === 200) {
                            data.body.tracks.items.forEach(function(song) {
                                songs.push(Spotify.formatSong(song));
                            });
                        }
                        return sendResponse(query, res, songs);
                    }, function(err) {
                        return sendResponse(query, res, songs);
                    });
            } else {
                return sendResponse(query, res, songs);
            }
        } else {
            this.refreshToken(function() {Spotify.searchSongs(query, res, songs)});
        }
    },
    refreshToken: function(callback) {
        this.api.clientCredentialsGrant()
          .then(function(data) {
            Spotify.tokenStart = new Date();
            Spotify.tokenDuration = parseInt(data.body['expires_in']);
            console.log('New spotify token: ' + data.body['access_token']);

            // Save the access token so that it's used in future calls
            Spotify.api.setAccessToken(data.body['access_token']);
            if (callback)
                callback();
          }, function(err) {
                console.log('Something went wrong when retrieving an access token', err);
          });
    },
    getTokenRemainingTime: function() {
        var remainingTime = this.tokenDuration - (new Date() - this.tokenStart) / 1000;
        console.log("Spotify token expires in", remainingTime, "seconds");
        return remainingTime;
    },
    formatSong: function(song) {
        return {
            title: song.name,
            artist: song.artists[0].name,
            img: song.album.images[1].url,
            preview: song.preview_url,
            href: song.external_urls.spotify,
            player: "spotify"
        };
    },
    api: new SpotifyWebApi({
      clientId : '55a904c1f12a42238e0d4b6e10401cfd',
      clientSecret : '3f03dc78b1074383862c6dacea03062d'
    }),
    tokenStart: new Date(),
    tokenDuration: -1
}

function sendResponse(query, res, songs) {
    if (songs.length > 0) {
        songs.sort(compareTitles);
        res.status(200);
    } else {
        res.status(500);
    }
    res.send({
        query: query,
        songs: songs
    });
}

function compareTitles(a,b) {
    if (a.title < b.title)
        return -1;
    if (a.title > b.title)
        return 1;
    return 0;
}

module.exports = router;
