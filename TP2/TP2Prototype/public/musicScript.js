var time_current = 0.0;
var time_total = 0.0;
var access_token = null;
refresh_token = null;
error = null;

/*class Song {
	constructor() {
		this.title = "";
        this.artist = "";
        this.year = "";
        this.id = "";
        this.href = "";
        this.player = null;
	}
}*/

class Player
{
    play()
    {
        // To redefine in subclasses.
    }
}

class DeezerPlayer extends Player
{
    constructor(songId)
    {
        super();
        this.songId = songId;
    }

    play()
    {
        DZ.player.playTracks([this.songId], 0, function (response) {
        });
    }
}

class SpotifyPlayer extends Player
{
    constructor(songLink)
    {
        super();
        this.songLink = songLink;
    }

    play()
    {
        window.open(this.songLink);
    }
}









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
        console.log(localStorage);
        $('#' + $(this).data('tab')).show();

    })

    if (localStorage.getItem('current_tab'))
    {
        console.log(localStorage);
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


        var val = $('input[name=playlist-name]').val();

        var playlists = localStorage.getItem('playlists');
        if (!playlists)
        {
            playlists = [];
        }
        else
        {
            playlists = JSON.parse(localStorage.getItem('playlists'));

        }

        if ($.inArray(val, playlists) != -1)
        {
            alert('playlist name already taken');

        }
        else
        {
            playlists.unshift(val);

            localStorage.setItem('playlists', JSON.stringify(playlists));
            console.log(playlists);
        }
        $(this)[0].reset();
        updatePlaylists();

    });

    //Update playlists

    updatePlaylists();








});

function addToPlaylist()
{


    var song=$(this).closest('.song');


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

    song.append($('<div id="choose-playlist"><label>choose a playlist:</label></div>'));


    playlists.forEach(function(item)
    {
        $('#choose-playlist').append($('<button></button>').html(item).on('click',function()
        {


            //Gather all the information  needed

            var song=$(this).closest('.song');


            song.find('.addToPlaylist').remove();
            song.append($('<div></div>').addClass('playlist-name').html($(this).html()));
            $('#choose-playlist').remove();

            var obj=
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
            updatePlaylists();

        }));
    });






    // now do some stuff to animate
}

function updatePlaylists()
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
                        console.log(playlist);
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



    var songs= localStorage.getItem('playlist_musics');

    if(!songs)
    {
        return;
    }


    songs= JSON.parse(songs);



    $('#playListTab').find('.song').remove();
    songs.forEach(function(item)
    {

        $('#playListTab').append(
            $('<div></div>')
                .addClass('song jamendo-song')
                .append(
                    $('<img>')
                        .attr('src', item.img))
                .append(
                    $('<div></div>').addClass('musicDesc')
                        .append($('<span ></span>').addClass('deezer-tag').html(item.player))
                        .append($('<p></p>').addClass('title').text(item.title))
                        .append($('<p></p>').addClass('artist').text(item.artist))
                )
                .append($('<div></div>').addClass('music-player')
                    .append('<label>Preview:</label>')
                    .append($('<audio controls></audio>')
                        .append('<source>').attr('src', item.preview).prop('type', 'audio/mpeg')
                    )
                    .append('<a href="' + item.href + '" target="_blank"><i class="fa fa-volume-up" aria-hidden="true"></i>\nFull song on '+item.player+'</a>')
                )
                .append($('<div></div>').addClass('playlist-name').html(item.playlist_name))
                .append($('<button class="removeFromPlaylist"></button>').text('x').on('click',function(){removeFromPlaylist(item)})))
    });


}


function removeFromPlaylist(item)
{

    console.log(item);
    var playlists = localStorage.getItem('playlist_musics');
    if (!playlists)
    {
        playlists = [];
    }
    else
    {
        playlists = JSON.parse(localStorage.getItem('playlist_musics'));

    }


    $.each(playlists, function(i){
        if(playlists[i].title === item.title) {
            playlists.splice(i,1);
            return false;
        }
    });

    localStorage.setItem('playlist_musics', JSON.stringify(playlists));
    updatePlaylists();


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
    updatePlaylists();


}






/**
 * Obtains parameters from the hash of the URL
 * @return Object
 * Source : https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
function getHashParams()
{
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q))
    {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}


//Fonction affichant le contenu de la tab Musique
function afficherMusique()
{
    //On affiche la tab correspondante
    $("#musiqueTab").show().find('.song').remove();


    //On va chercher les chansons a afficher de Deezer
    getDeezerSongs();
    //On va chercher les chansons a afficher de Spotify
    getSpotifySongs();
    getJamendoSongs();
}


function sort()// Synchronous
{


    //Sort
    $('#musiqueTab .song').sort(
        function (a, b) {
            return $(a).find('p').text().toLowerCase() > $(b).find('p').text().toLowerCase();
        }).appendTo('#musiqueTab');




    //Find which music is in playlist

    $('#musiqueTab .song').each(function()
    {

        var song=$(this);
        var obj=
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


    });










}


function getSpotifySongs()
{


    var params = getHashParams();

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
                $('#musiqueTab').append(
                    $('<div></div>')
                        .addClass('song jamendo-song')
                        .append(
                            $('<img>')
                                .attr('src', song.album.images[1].url))
                        .append(
                            $('<div></div>').addClass('musicDesc')
                                .append($('<span ></span>').addClass('spotify-tag').html('spotify'))
                                .append($('<p></p>').addClass('title').text(song.name))
                                .append($('<p></p>').addClass('artist').text(song.artists[0].name))
                        )

                        .append($('<div></div>').addClass('music-player')
                            .append('<label>Preview:</label>')
                            .append($('<audio controls></audio>')
                                .append('<source>').attr('src', song.preview_url).prop('type', 'audio/mpeg')
                            )
                            .append('<a href="' + song.href + '" target="_blank"><i class="fa fa-volume-up" aria-hidden="true"></i> Full song on Spotify</a>')
                        )

                        .append($('<button class="addToPlaylist"></button>').text('+').on('click',addToPlaylist))
                )
            });
            sort();// Sort all elements;
        }
    });


}


function getJamendoSongs()
{
    $.getJSON(
        "https://api.jamendo.com/v3.0/tracks/?client_id=d328628b&format=jsonpretty&limit=20&namesearch=" + encodeURI($('#searchField').val())
        , function (data) {

            var results = data.results;
            results.forEach(function (song) {
                console.log(song);
                    $('#musiqueTab').append(
                        $('<div></div>')
                            .addClass('song jamendo-song')
                            .append(
                                $('<img>')
                                    .attr('src', song.album_image))
                            .append(
                                $('<div></div>').addClass('musicDesc')
                                    .append($('<span ></span>').addClass('jamendo-tag').html('jamendo'))
                                    .append($('<p></p>').addClass('title').text(song.name))
                                    .append($('<p></p>').addClass('artist').text(song.artist_name))
                            )
                            .append($('<div></div>').addClass('music-player')
                                .append('<label>Preview:</label>')
                                .append($('<audio controls></audio>')
                                    .append('<source>').attr('src', song.audio).prop('type', 'audio/mpeg')
                                )
                                .append('<a href="' + song.href + '" target="_blank"><i class="fa fa-volume-up" aria-hidden="true"></i>\nFull song on Jamendo</a>')
                            )
                            .append($('<button class="addToPlaylist"></button>').text('+').on('click',addToPlaylist)))
                }
            )
            ;
            sort();// Sort all elements;
        })

}

function getDeezerSongs()
{
    DZ.api('/search/' + "track" + '?q=' + encodeURIComponent($('#searchField')), function (response) {
        var result = response.data;

        result.forEach(function (song) {
            $('#musiqueTab').append(
                $('<div></div>')
                    .addClass('song jamendo-song')
                    .append(
                        $('<img>')
                            .attr('src', song.album.cover_small))
                    .append(
                        $('<div></div>').addClass('musicDesc')
                            .append($('<span ></span>').addClass('deezer-tag').html('deezer'))
                            .append($('<p></p>').addClass('title').text(song.title))
                            .append($('<p></p>').addClass('artist').text(song.artist.name))
                    )
                    .append($('<div></div>').addClass('music-player')
                        .append('<label>Preview:</label>')
                        .append($('<audio controls></audio>')
                            .append('<source>').attr('src', song.preview).prop('type', 'audio/mpeg')
                        )
                        .append('<a href="' + song.link + '" target="_blank"><i class="fa fa-volume-up" aria-hidden="true"></i>\nFull song on Deezer</a>')
                    )
                    .append($('<button class="addToPlaylist"></button>').text('+').on('click',addToPlaylist)))
        });
    });
}


//Fonction affichant le contenu de la tab Recherche PlayList
function afficherResultatPlayList()
{
    $("#playListTab").show();

    var playListTab = document.getElementById("playListTab");

    //On vide la liste de playLists
    while (playListTab.firstChild)
        playListTab.removeChild(playListTab.firstChild);

    //On va chercher les playlists a afficher de Deezer
    getDeezerPlayLists();

    //On va chercher les playlists a afficher de Spotify
    getSpotifyPlayLists();

}

//Fonction affichant le contenu de la tab Mes PlayLists
function afficherMaPlayList()
{
    $("#mesPlaylistTab").show();

    var myPlayListTab = document.getElementById("mesPlaylistTab");

    //On vide la liste de mes playLists
    while (myPlayListTab.firstChild)
        myPlayListTab.removeChild(myPlayListTab.firstChild);

    var maPlayListJson = localStorage.getItem("myPlayList");
    var maPlayList = JSON.parse(maPlayListJson);

    if (maPlayList != null)
    {
        //for(var i = 0 ; i < maPlayList.length; i++)
        maPlayList.slice().forEach(function (song) {
            /*On ajoute la section dans l'affichage*/
            var songDiv = document.createElement("div");
            songDiv.className = "song";

            //Si le type de la chanson est un spotify
            if (song.type == "spotify")
            {
                song.objet.player = new SpotifyPlayer(song.objet.external_urls.spotify);
                //songDiv.innerHTML = "<div class=\"song\"><a href=\"" + song.objet.external_urls.spotify + "\"><img src=\"http://pixel.nymag.com/imgs/daily/vulture/2015/06/26/26-spotify.w529.h529.jpg\" class=\"logo\" alt=\"deezerLogo\"></img><div class=\"musicDesc\"><p>" + song.objet.artists[0].name + ' - ' + song.objet.name + "</p><button id=\"add-to-playList\">X</button></div></a></div>"
                songDiv.innerHTML = "<div class=\"song\"><img src=\"http://pixel.nymag.com/imgs/daily/vulture/2015/06/26/26-spotify.w529.h529.jpg\" class=\"logo\" alt=\"deezerLogo\"></img><div class=\"musicDesc\"><p>" + song.objet.artists[0].name + ' - ' + song.objet.name + "</p><button id=\"add-to-playList\">X</button></div></div>"
                myPlayListTab.appendChild(songDiv);
                //On ajoute l'evenement lorsque le bouton de retrait est cliqué
                document.getElementById("mesPlaylistTab").lastChild.lastChild.onclick = function (e) {
                    song.objet.player.play();
                }
                document.getElementById("mesPlaylistTab").lastChild.lastChild.lastChild.lastChild.lastChild.onclick = function (e) {
                    var nouvelleEntree = song;
                    retirerChanson(nouvelleEntree);
                    //On evite le comportement par defaut pour eviter une redirection de l'ancre (<a...>)
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
            else if (song.type == "deezer")
            {
                song.objet.player = new DeezerPlayer(song.objet.id);
                songDiv.innerHTML = "<div class=\"song\"><img src=\"https://e-cdns-files.dzcdn.net/img/common/ogdeezer.jpg\" class=\"logo\" alt=\"deezerLogo\"></img><div class=\"musicDesc\"><p>" + song.objet.artist + ' - ' + song.objet.title + "</p><button id=\"add-to-playList\">X</button></div></div>"

                //let newSongDiv = $("<p>##########</p>");
                //$("mesPlaylistTab").append(newSongDiv);
                myPlayListTab.appendChild(songDiv);
                //On ajoute l'evenement du click sur la description pour faire jouer la chanson
                document.getElementById("mesPlaylistTab").lastChild.lastChild.onclick = function (e) {
                    song.objet.player.play();
                }
                document.getElementById("mesPlaylistTab").lastChild.lastChild.lastChild.lastChild.onclick = function (e) {
                    retirerChanson(song);
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        });
    }
}


/*
function getSpotifySongs()
{
    /!*On raffraichit les tokens a partir de l'URL*!/

    var params = getHashParams();

    access_token = params.access_token;
    refresh_token = params.refresh_token;
    error = params.error;

    /!*On fait une requete pour raffraichir les tokens*!/
    $.ajax({
        url: '/refresh_token',
        data: {
            'refresh_token': refresh_token
        }
    }).done(function (data) {
        access_token = data.access_token;
    });


    getSpotifySongs_();

    return;

    /!*On va chercher la valeur de la recherche*!/
    var searchEntry = document.getElementById("searchField").value;
    //On va chercher les chansons de Spotify
    $.ajax({
        url: 'https://api.spotify.com/v1/search?q=' + searchEntry + '&type=track&limit=10',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function (response) {
            var musicTab = document.getElementById("musiqueTab");
            /!*Pour chacun des resultats obtenus*!/
            //for(var i = 0 ; i < response.tracks.items.length; i++)
            response.tracks.items.slice(0, 10).forEach(function (song) {
                /!*On ajoute la section dans l'affichage*!/
                var songDiv = document.createElement("div");
                songDiv.className = "song";
                /!*<div id=\"player\"><button id=\"player-play\">></button><button id=\"player-pause\">ll</button><div id=\"player-slider\"><div id=\"player-progress\" ><div id=\"player-progress-hand\"></div></div></div></div>*!/
                songDiv.innerHTML = "<img src=\"http://pixel.nymag.com/imgs/daily/vulture/2015/06/26/26-spotify.w529.h529.jpg\" class=\"logo\" alt=\"deezerLogo\"></img><div class=\"musicDesc\"><p>" + song.artists[0].name + ' - ' + song.name + "</p><button id=\"add-to-playList\">+</button></div>"
                musicTab.appendChild(songDiv);

                document.getElementById("musiqueTab").lastChild.onclick = function (e) {
                    let player = new SpotifyPlayer(song.external_urls.spotify);
                    player.play();
                }

                var nouvelleEntree = {type: "spotify", objet: song};
                /!*Evenement lorsque le bouton d'ajout de chanson est clique*!/
                document.getElementById("musiqueTab").lastChild.lastChild.lastChild.lastChild.lastChild.onclick = function (e) {
                    ajouterChanson(nouvelleEntree);
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            sort();
        }
    })
}
*/

function getSpotifyPlayLists()
{
    /*On va chercher les parametres de l'URL*/
    var params = getHashParams();

    /*On raffraichit les tokens a partir de l'URL*/
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
    var searchEntry = document.getElementById("searchField").value;
    //On va chercher les chansons de Spotify
    $.ajax({
        url: 'https://api.spotify.com/v1/search?q=' + searchEntry + '&type=playlist&limit=10',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function (response) {
            var playListTab = document.getElementById("playListTab");
            /*Pour chacun des resultats obtenus*/
            for (var i = 0; i < response.playlists.items.length; i++)
            {
                /*On ajoute la section dans l'affichage*/
                var songDiv = document.createElement("div");
                songDiv.className = "song";
                /*<div id=\"player\"><button id=\"player-play\">></button><button id=\"player-pause\">ll</button><div id=\"player-slider\"><div id=\"player-progress\" ><div id=\"player-progress-hand\"></div></div></div></div>*/
                songDiv.innerHTML = "<div class=\"song\"><a href=\"" + response.playlists.items[i].external_urls.spotify + "\"><img src=\"http://pixel.nymag.com/imgs/daily/vulture/2015/06/26/26-spotify.w529.h529.jpg\" class=\"logo\" alt=\"deezerLogo\"></img><div class=\"musicDesc\"><p>" + response.playlists.items[i].name + "</p></div></a></div>"
                playListTab.appendChild(songDiv);
            }
        }
    })
}




function getDeezerPlayLists()
{
    /*
    var songs = [];
    //On va chercher la valeur de recherche
    var searchEntry = document.getElementById("searchField").value;
    //Si on n'a pas de valeur de recherche, alors on ne prend aucune chanson
    if(searchEntry == "")
        return [];
    // Allons chercher les chansons a afficher
    DZ.api('/search/' + "album" + '?q=' + encodeURIComponent(searchEntry), function(response){
        // On selectionne les 10 premiers resultats
        var playListTab = document.getElementById("playListTab");
        var i = 0;
        response.data.slice(0, 10).forEach(function(album) {
            i++;
            var formattedSong = {
                title: album.title,
                artist: album.artist.name,
                year: null,
                id: album.id,
                href: album.link
            }

            // On ajoute la section dans l'affichage
            var songDiv = document.createElement("div");
            songDiv.className = "song";
            //<div id=\"player\"><button id=\"player-play\">></button><button id=\"player-pause\">ll</button><div id=\"player-slider\"><div id=\"player-progress\" ><div id=\"player-progress-hand\"></div></div></div></div>
            songDiv.innerHTML = "<div class=\"song\"><img src=\"https://e-cdns-files.dzcdn.net/img/common/ogdeezer.jpg\" class=\"logo\" alt=\"deezerLogo\"></img><div class=\"musicDesc\"><p>" + album.artist.name + ' - ' + album.title + "</p></div></div>"
            playListTab.appendChild(songDiv);

            // On ajoute les Bindings a cette chanson
            DZ.Event.subscribe('player_position', function(e,i){
                time_current = e[0];
                if (e[1])
                    time_total = +e[1];
                var width = (time_current / time_total * 100) + '%';

            });
            playListTab.lastChild.onclick = function(e){
                    playAlbum(album);
            }


            //musicTab.getElementById("player-play").onclick = playSong(album);
            //$("#player-pause").click(DZ.player.pause);
            //$("#player-slider").click(sliderClicked);

            songs.push(formattedSong);
        });
    });
    return songs;
    */
}

//Fonction permettant l'ajout d'une chanson a notre PlayList
function ajouterChanson(chanson)
{
    var myPlayListJson = localStorage.getItem("myPlayList");
    var myPlayList = JSON.parse(myPlayListJson);

    if (myPlayList == null)
    {
        myPlayList = [];
    }
    myPlayList.push(chanson);
    myPlayListJson = JSON.stringify(myPlayList);
    localStorage.setItem("myPlayList", myPlayListJson);
}

//Fonction permettant de retirer une chanson de notre PlayList
function retirerChanson(chanson)
{
    //console.log(chanson);
    var myPlayListJson = localStorage.getItem("myPlayList");
    var myPlayList = JSON.parse(myPlayListJson);

    if (myPlayList != null)
    {
        for (var i = 0; i < myPlayList.length; i++)
        {
            if (myPlayList[i].type == "spotify")
            {
                if (myPlayList[i].objet.name === chanson.objet.name)
                {
                    //console.log("FOUND SPOTIFY!");
                    myPlayList.splice(i, 1);
                    break;
                }
            }
            else if (myPlayList[i].type == "deezer")
            {
                if (myPlayList[i].objet.title === chanson.objet.title)
                {
                    myPlayList.splice(i, 1);
                    break;
                }
            }
        }
    }

    /*On actualise notre objet dans le localStorage*/
    myPlayListJson = JSON.stringify(myPlayList);
    localStorage.setItem("myPlayList", myPlayListJson);

    /*On reaffiche notre vue*/
    afficherMaPlayList();

}

//Fonction permettant de faire jouer une chanson
var playSong = function (song) {
    //song.player.play();
    DZ.player.playTracks([song.id], 0, function (response) {
    });
};

var playAlbum = function (album) {
    DZ.player.playAlbum(album.id, 0, function (response) {
    });
}

/*
var stopSong = function() {
	DZ.player.pause
}


var sliderClicked = function(e) {
	var slider = $(e.delegateTarget);
	var x = e.clientX - slider.offset().left;
	DZ.player.seek(x / slider.width() * 100);	
	
};
*/


