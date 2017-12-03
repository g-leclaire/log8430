// Define jQuery for jest tests
if (typeof require !== "undefined") {
    var $ = require('jquery');
}

// Variable to be exported for jest tests
var musicScript = {};

var access_token = null;
refresh_token = null;
error = null;

//Fonction appellée à l'ouverture de la page
$(document).ready(function () {

    //Search input/
    $('#searchField').on('input', function () {
        afficherMusique();
    }).trigger('input');


    //Tabs
    $('.tablinks').on('click', function () {
        $(this).addClass('active').siblings().removeClass('active');
        localStorage.setItem('current_tab', $(this).prop('id'))
        $('.tabcontent').hide();
        $('#' + $(this).data('tab')).show();

    })

    if (localStorage.getItem('current_tab'))
    {
        $('#' + localStorage.getItem('current_tab')).trigger('click');
    }


    /*Initialisation de Deezer*/
    DZ.init({
        appId: '118825',
        channelUrl: 'http://vladimir.sh/playground/deezer_light/channel.html',
        player: {}
    });


    //Spotify
    if (access_token)
    {
        $("#login").hide();
    }
    else
    {
        $('#login i').on('click', function () {
            $(this).closest('#login').hide();
        });
    }


    // Create playlist
    $('#create-playlist-form').on('submit', function (e) {
        e.preventDefault();
        musicScript.createPlaylist($(this), $('input[name=playlist-name]').val());
    });

    musicScript.updatePlaylists();
});

musicScript.createPlaylist = function(form, playlistName) {
    var playlists = localStorage.getItem('playlists');
    if (!playlists)
    {
        playlists = [];
    }
    else
    {
        playlists = JSON.parse(localStorage.getItem('playlists'));
    }

    if ($.inArray(playlistName, playlists) != -1)
    {
        alert('playlist name already taken');
    }
    else
    {
        playlists.unshift(playlistName);

        localStorage.setItem('playlists', JSON.stringify(playlists));
    }
    form[0].reset();
    musicScript.updatePlaylists();
}


musicScript.addToPlaylist = function(songDiv)
{
    var playlists=localStorage.getItem('playlists');


    if(!playlists)
    {
        playlists=[];
    }
    else
    {
        playlists=JSON.parse(playlists);
    }


    $('#choose-playlist').remove();

    songDiv.append($('<div id="choose-playlist"><label>choose a playlist:</label></div>'));


    playlists.forEach(function(item)
    {
        $('#choose-playlist').append($('<button></button>').html(item).on('click',function() {musicScript.choosePlaylist($(this).closest('.song'), $(this).html());}));
    });
    return songDiv;
}


musicScript.choosePlaylist = function(songDiv, playlist)
{
    songDiv.find('.addToPlaylist').remove();
    songDiv.append($('<div></div>').addClass('playlist-name').html(playlist));
    $('#choose-playlist').remove();

    var obj=
        {
            'playlist_name': playlist,
            'img': songDiv.children('img').attr('src'),
            'player': songDiv.find('.musicDesc').children('span').html(),
            'title': songDiv.find('.musicDesc').find('.title').html(),
            'artist': songDiv.find('.musicDesc').find('.artist').html(),
            'preview': songDiv.find('.music-player').find('audio').attr('src'),
            'href': songDiv.find('.music-player').find('a').attr('href')
        };


    var mus=localStorage.getItem('playlist_musics');


    if (!mus)
    {
        mus = [];
    }
    else
    {
        mus = JSON.parse(mus);

    }


    var cont=true;


    $.each(mus, function(i){
        if(mus[i].title === obj.title) {
            cont=false;
            alert('music already exist');

            return ;
        }
    });

    if(!cont)
    {
        return;
    }

    mus.push(obj);


    localStorage.setItem('playlist_musics',JSON.stringify(mus));
    musicScript.updatePlaylists();
}


musicScript.updatePlaylists = function()
{
    var playlists = localStorage.getItem('playlists');
    if (!playlists)
    {
        playlists = [];
    }
    else
    {
        playlists = JSON.parse(localStorage.getItem('playlists'));
    }

    $('#playlists').empty();
    playlists.forEach(function (element) {
        $('#playlists').append(
            $('<button></button>')
                .on('click', function() {
                    var playlist = $(this).find('span').html();
                    $(this).addClass('active').siblings().removeClass('active');
                    $('#playListTab').find('.song').each(function()
                    {
                        var songDiv = $(this);
                        if(!songDiv.find('.playlist-name:contains('+playlist+')').length)
                        {
                            songDiv.hide();
                        }
                        else
                        {
                            songDiv.show();
                        }
                    });
                })
                .append($('<span></span>').html(element))
                .append($('<i></i>').addClass('fa fa-times').on('click',function(){
                    musicScript.removePlaylist($(this));
                }))
        )
    });

    if(!$('#playlists button').length)
    {
        $('#playlists').append($('<h3></h3>').html('you have no playlist'));

    }

    var songs = localStorage.getItem('playlist_musics');

    if(!songs)
    {
        return;
    }

    songs = JSON.parse(songs);

    $('#playListTab').find('.song').remove();
    songs.forEach(function(song)
    {
        $('#playListTab').append(musicScript.generateSongHtml(song, true));
    });
}


function removeFromPlaylist(song)
{
    var playlists = localStorage.getItem('playlist_musics');
    playlists = musicScript.removeFromPlaylistItem(song, playlists);
    localStorage.setItem('playlist_musics', playlists);
    musicScript.updatePlaylists();
}


musicScript.removeFromPlaylistItem = function(song, playlistItem) {

    var playlists;
    if (!playlistItem)
    {
        playlists = [];
    }
    else
    {
        playlists = JSON.parse(playlistItem);
    }

    $.each(playlists, function(i){
        if(playlists[i].title === song.title) {
            playlists.splice(i,1);
            return false;
        }
    });

    return JSON.stringify(playlists);
}

musicScript.removePlaylist = function(el)
{
    var playlists = localStorage.getItem('playlists');
    if (!playlists)
    {
        playlists = [];
    }
    else
    {
        playlists = JSON.parse(localStorage.getItem('playlists'));
    }
    var playlistName = el.siblings('span').html();
    var index = playlists.indexOf(playlistName);

    if (index > -1)
    {
        playlists.splice(index, 1);

        //remove songs in playlists
        var songs = localStorage.getItem('playlist_musics');
        if(songs)
        {
            songs = JSON.parse(songs);
            for (var i = songs.length - 1; i >= 0; i--) {
                if(songs[i].playlist_name === playlistName) {
                    songs.splice(i,1);
                }
            }

            localStorage.setItem('playlist_musics',JSON.stringify(songs));
        }
    }

    localStorage.setItem('playlists', JSON.stringify(playlists));
    musicScript.updatePlaylists();
}

musicScript.getWindowHashParams = function() {
    return musicScript.getHashParams(window.location.hash.substring(1));
}

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 * Source : https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
musicScript.getHashParams = function(hash)
{
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = hash;
    while (e = r.exec(q))
    {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
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
        var query = $('#searchField').val();
        $.ajax({
            url: 'https://api.spotify.com/v1/search?q=' + encodeURIComponent(query) + '&type=track&limit=10',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function (response) {
                // Only use the response if the search query has not changed
                if (query === $('#searchField').val()) {
                    var results = response.tracks.items;
                    results.forEach(function (song) {
                        $('#musiqueTab').append(musicScript.generateSongHtml(musicScript.formatSpotifySong(song, false)));
                    });
                    musicScript.sort($('#musiqueTab .song'));// Sort all elements;
                }
            }
        });
    }
}

var JamendoAPI = {
    searchSongs: function() {
        var query = $('#searchField').val();
        $.getJSON(
            "https://api.jamendo.com/v3.0/tracks/?client_id=d328628b&format=jsonpretty&limit=20&namesearch=" + encodeURI(query),
            function (data) {
                // Only use the response if the search query has not changed
                if (query === $('#searchField').val()) {
                    data.results.forEach(function (song) {
                        $('#musiqueTab').append(musicScript.generateSongHtml(musicScript.formatJamendoSong(song, false)));
                    });
                    musicScript.sort($('#musiqueTab .song'));// Sort all elements;
                }
            });
    }
}

var DeezerAPI = {
    searchSongs: function() {
        var query = $('#searchField').val();
        if (query.length > 0) {
            DZ.api('/search/' + "track" + '?q=' + encodeURI(query), function (response) {
                // Only use the response if the search query has not changed
                if (query === $('#searchField').val()) {
                    response.data.forEach(function (song) {
                        $('#musiqueTab').append(musicScript.generateSongHtml(musicScript.formatDeezerSong(song, false)));
                    });
                    musicScript.sort($('#musiqueTab .song'));
                }
            });
        }
    }
}


//Fonction affichant le contenu de la tab Musique
function afficherMusique()
{
    // Enlever les chansons existantes
    $("#musiqueTab").show().find('.song').remove();

    // On lance les recherches sur les différents api
    ([SpotifyAPI, JamendoAPI, DeezerAPI]).forEach(api => api.searchSongs());
}


musicScript.sort = function(songDivs)// Synchronous
{
    //Sort
    var songs = songDivs.get();
    songs.sort(
        function (a, b) {
            aTitle = $(a).find('.title').text().toLowerCase();
            bTitle = $(b).find('.title').text().toLowerCase();
            var isABefore = aTitle < bTitle;
            console.log(aTitle, isABefore, bTitle);
            return isABefore ? -1 : 1;
        });
    
        for (var i = 0; i < songs.length; i++) {
        songs[i].parentNode.appendChild(songs[i]);
    }

    //Find which music is in playlist to add the playlist name
    songDivs.each(function()
    {
        var songDiv = $(this);
        var songHref = songDiv.find('.music-player').find('a').attr('href');

        var mus=localStorage.getItem('playlist_musics');

        if (!mus)
        {
            mus = [];
        }
        else
        {
            mus = JSON.parse(mus);
        }

        $.each(mus, function(i){
            if(mus[i].href === songHref) {
                songDiv.find('.addToPlaylist').remove();
                songDiv.append($('<div></div>').addClass('playlist-name').html(mus[i].playlist_name));
                return ;
            }
        });
    });
}


musicScript.generateSongHtml = function(song, isPlaylistView) {
    var songDiv = $('<div></div>')
        .addClass('song jamendo-song')
        .append(
            $('<img>')
                .attr('src', song.img))
        .append(
            $('<div></div>').addClass('musicDesc')
                .append($('<span ></span>').addClass(song.player + '-tag').html(song.player))
                .append($('<p></p>').addClass('title').text(song.title))
                .append($('<p></p>').addClass('artist').text(song.artist))
        )
        .append($('<div></div>').addClass('music-player')
            .append('<label>Preview:</label>')
            .append($('<audio controls></audio>')
                .append('<source>').attr('src', song.preview).prop('type', 'audio/mpeg')
            )
            .append('<a href="' + song.href + '" target="_blank"><i class="fa fa-volume-up" aria-hidden="true"></i>\nFull song on ' + song.player + '</a>')
        )
        .append(isPlaylistView ? $('<button class="removeFromPlaylist"></button>').text('x').on('click',function(){removeFromPlaylist(song)})
            : $('<button class="addToPlaylist"></button>').text('+').on('click', function() {musicScript.addToPlaylist($(this).closest('.song'))}))

    if (typeof song.playlist_name !== 'undefined') {
        songDiv.append($('<div></div>').addClass('playlist-name').html(song.playlist_name));
    }

    return songDiv;
}


musicScript.formatJamendoSong = function(song) {
    return {
        title: song.name,
        artist: song.artist_name,
        img: song.album_image,
        preview: song.audio,
        href: song.shareurl,
        player: "jamendo"
    };
}


musicScript.formatDeezerSong = function(song) {
    return {
        title: song.title,
        artist: song.artist.name,
        img: song.album.cover_small,
        preview: song.preview,
        href: song.link,
        player: "deezer"
    };
}

musicScript.formatSpotifySong = function(song) {
    return {
        title: song.name,
        artist: song.artists[0].name,
        img: song.album.images[1].url,
        preview: song.preview_url,
        href: song.external_urls.spotify,
        player: "spotify"
    };
}


// Module export for jest tests
if (typeof module !== 'undefined') {
    module.exports = musicScript;
}
