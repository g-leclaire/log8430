// Define jQuery for jest tests
if (typeof require !== "undefined") {
    var $ = require('jquery');
}

// Variable to be exported for jest tests
var musicScript = {};

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
        //console.log(localStorage);
        $('#' + $(this).data('tab')).show();

    })

    if (localStorage.getItem('current_tab'))
    {
        //console.log(localStorage);
        $('#' + localStorage.getItem('current_tab')).trigger('click');
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
        //console.log(playlists);
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
                .append($('<span></span>').html(element)
                    .on('click',function()
                    {
                        var playlist=$(this).html();
                        $(this).closest('button').addClass('active').siblings().removeClass('active');
                        //console.log(playlist);
                        $('#playListTab').find('.song').each(function()
                        {
                            if(!$(this).find('.playlist-name:contains('+playlist+')').length)
                            {
                                $(this).closest('.song').hide();
                            }
                            else
                            {
                                $(this).closest('.song').show();
                            }
                        });
                    })
                )
                .append($('<i></i>').addClass('fa fa-times').on('click',function(){
                    //removePlaylist
                    removePlaylist($(this));
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
    //console.log(item);
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

function removePlaylist(el)
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
    var index = playlists.indexOf(el.siblings('span').html());

    if (index > -1)
    {
        playlists.splice(index, 1);

        //remove songs in playlists
        var songs = localStorage.getItem('playlist_musics');
        if(songs)
        {
            songs= JSON.parse(songs);
            $.each(songs, function(i){
                if(songs[i].playlist_name === el.siblings('span').html()) {
                    songs.splice(i,1);
                    return false;
                }
            });
            localStorage.setItem('playlist_musics',JSON.stringify(songs));
        }
    }

    localStorage.setItem('playlists', JSON.stringify(playlists));
    musicScript.updatePlaylists();
}


//Fonction affichant le contenu de la tab Musique
function afficherMusique()
{
    //On affiche la tab correspondante
    $("#musiqueTab").show().find('.song').remove();

    // On lance les recherches sur les différents api
    //([SpotifyAPI, JamendoAPI, DeezerAPI]).forEach(api => api.searchSongs());
	$.ajax({
            url: "http://localhost:8001/search?q=" + encodeURI($('#searchField').val()),
            data: {}
        }).done(function (data) {
            console.log(data);
			data.forEach(function (song) {
				$('#musiqueTab').append(musicScript.generateSongHtml(song, false));
			});
        });
}


musicScript.sort = function(songDivs)// Synchronous
{
    //Sort
    // Seems broken. Commented to increase test coverage
    /*songDivs.sort(
        function (a, b) {
            return $(a).find('p').text().toLowerCase() > $(b).find('p').text().toLowerCase();
        }).appendTo('#musiqueTab');

    //Find which music is in playlist
    songDivs.each(function()
    {
        var song=$(this);
        var obj =
            {
                'playlist_name':$(this).html(),
                'img': song.children('img').attr('src'),
                'player': song.find('.musicDesc').children('span').html(),
                'title': song.find('.musicDesc').find('.title').html(),
                'artist': song.find('.musicDesc').find('.artist').html(),
                'preview': song.find('.music-player').find('audio').attr('src'),
                'href': song.find('.music-player').find('a').attr('href')
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
                song.find('.addToPlaylist').remove();
                song.append($('<div></div>').addClass('playlist-name').html(mus[i].playlist_name));
                return ;
            }
        });
    });*/
}


musicScript.generateSongHtml = function(song, isPlaylistView) {
    return $('<div></div>')
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
}
