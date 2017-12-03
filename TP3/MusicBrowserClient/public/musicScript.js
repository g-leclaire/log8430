// Define jQuery for jest tests
if (typeof require !== "undefined") {
    var $ = require('jquery');
}

// Variable to be exported for jest tests
var musicScript = {};

var waitingForResponse = 0;

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
	$.ajax({
		url: "http://localhost:8002/dbb/service/playlist",
		type: "GET",
		data: {},
		contentType: "",
		success:function(data){
			var array = [];
			JSON.parse(data).forEach(function(playlist){
				if(playlist.name == playlistName)
				{
					alert('playlist name already taken');
					form[0].reset();
					musicScript.updatePlaylists();
					return;
				}
				array.push(playlist.name);
			});
				array.push(playlistName);
				$.ajax({
					url: "http://localhost:8002/dbb/service/playlist",
					type: "POST",
					data: playlistName,
					contentType: "application/json;"
				}).then(function(err)
				{
					form[0].reset();
					musicScript.updatePlaylists();
				});
				//localStorage.setItem('playlists', JSON.stringify(playlists));
			
		}
	});
	
    //var playlists = localStorage.getItem('playlists');
	/*
    if (!playlists)
    {
        playlists = [];
    }
    else
    {
        playlists = JSON.parse(localStorage.getItem('playlists'));
    }
	*/
    
}


musicScript.addToPlaylist = function(songDiv)
{
    //var playlists=localStorage.getItem('playlists');
	$.ajax({
		url: "http://localhost:8002/dbb/service/playlist",
		type: "GET",
		data: {},
		contentType: "",
		success:function(data){
			
		var playlists = [];
		JSON.parse(data).forEach(function(playlist){
			playlists.push(playlist.name);
		});
		$('#choose-playlist').remove();

		songDiv.append($('<div id="choose-playlist"><label>choose a playlist:</label></div>'));


		playlists.forEach(function(item)
		{
			$('#choose-playlist').append($('<button></button>').html(item).on('click',function() {musicScript.choosePlaylist($(this).closest('.song'), $(this).html());}));
		});
		return songDiv;
	}});

    /*if(!playlists)
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
	*/
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

    /*var mus=localStorage.getItem('playlist_musics');


    if (!mus)
    {
        mus = [];
    }
    else
    {
        mus = JSON.parse(mus);

    }
	*/
	var mus = $.ajax({
		url: "http://localhost:8002/dbb/service/music/" + playlist,
		type: "GET",
		data: {},
		contentType: "application/json; charset=utf-8",
	}).then(function(musique)
	{
		 var cont=true;

		$.each(mus, function(i){
			if(mus[i].title === obj.title) {
				cont=false;
				alert('music already exist');
				return ;
			}
		});

		//mus.push(obj);
		$.ajax({
			url: "http://localhost:8002/dbb/service/music",
			type: "POST",
			data: JSON.stringify(obj),
			contentType: "application/json;"
		}).then(function(err){
			musicScript.updatePlaylists();
		});
	});
	//localStorage.setItem('playlist_musics',JSON.stringify(mus));
    
}


musicScript.updatePlaylists = function()
{
    $.ajax({
		url: "http://localhost:8002/dbb/service/playlist",
		type: "GET",
		data: {},
		contentType: "",
		success:function(data){
		//console.log("Updating!");
		var playlists = [];
		JSON.parse(data).forEach(function(playlist){
			playlists.push(playlist.name);
		});
		
		$('#playlists').empty();
		playlists.forEach(function (element) {
			$('#playlists').append(
				$('<button></button>')
					.on('click', function() {
						var playlist=$(this).find('span').html();
						localStorage.setItem("current_playlist", playlist);
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
						
						$.ajax({
							url: "http://localhost:8002/dbb/service/music/" + playlist,
							type: "GET",
							data: {},
							contentType: "",
						}).then(function(songs)
						{
							songs = JSON.parse(songs);
							
							$('#playListTab').find('.song').remove();
							songs.forEach(function(song)
							{
								$('#playListTab').append(musicScript.generateSongHtml(song, true));
							});
						});
					})
					.append($('<span></span>').html(element))
					.append($('<i></i>').addClass('fa fa-times').on('click',function(){
						removePlaylist($(this));
					}))
			)
		});

		if(!$('#playlists button').length)
		{
			$('#playlists').append($('<h3></h3>').html('you have no playlist'));

		}
		
		var nomPlaylist = localStorage.getItem("current_playlist");
		if(!nomPlaylist)
			nomPlaylist = "";
		//var songs = localStorage.getItem('playlist_musics');
		$.ajax({
			url: "http://localhost:8002/dbb/service/music/" + nomPlaylist,
			type: "GET",
			data: {},
			contentType: "",
		}).then(function(songs)
		{
			songs = JSON.parse(songs);
			$('#playListTab').find('.song').remove();
			songs.forEach(function(song)
			{
				$('#playListTab').append(musicScript.generateSongHtml(song, true));
			});
		});
	}});
	/*var playlists = localStorage.getItem('playlists');
    if (!playlists)
    {
        playlists = [];
    }
    else
    {
        playlists = JSON.parse(localStorage.getItem('playlists'));

    }
	*/

    
}


function removeFromPlaylist(song)
{
    //console.log(item);
    //var playlists = localStorage.getItem('playlist_musics');
    //playlists = musicScript.removeFromPlaylistItem(song, playlists);
    //localStorage.setItem('playlist_musics', playlists);
	$.ajax({
		url: "http://localhost:8002/dbb/service/music",
		type: "DELETE",
		data: JSON.stringify({
			playlist_name: song.playlist_name,
			img: song.img,
			player: song.player,
			title: song.title,
			artist: song.artist,
			preview: song.preview,
			href: song.href
		}),
		contentType: "application/json;"
	}).then(function(musique)
	{
		musicScript.updatePlaylists();
	});
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
	$.ajax({
		url: "http://localhost:8002/dbb/service/playlist",
		type: "GET",
		data: {},
		contentType: "",
		success:function(data){
			
		var playlists = [];
		JSON.parse(data).forEach(function(playlist){
			playlists.push(playlist.name);
		});
		var index = playlists.indexOf(el.siblings('span').html());
		if (index > -1)
		{
			playlists.splice(index, 1);

			//remove songs in playlists
			/*var songs = localStorage.getItem('playlist_musics');
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
			}*/
			$.ajax({
				url: "http://localhost:8002/dbb/service/music/" + el.siblings('span').html(),
				type: "DELETE",
				data: {},
				contentType: "application/json;"
			}).then(function(err){	
				$.ajax({
					url: "http://localhost:8002/dbb/service/playlist",
					type: "DELETE",
					data: el.siblings('span').html(),
					contentType: "application/json;"
				}).then(function(musique)
				{
					musicScript.updatePlaylists();
				});
			});
			
			
		}
		
		
	}});
    
	/*var playlists = localStorage.getItem('playlists');
    if (!playlists)
    {
        playlists = [];
    }
    else
    {
        playlists = JSON.parse(localStorage.getItem('playlists'));
    }*/
    

    //localStorage.setItem('playlists', JSON.stringify(playlists));
    
}


//Fonction affichant le contenu de la tab Musique
function afficherMusique()
{
    //On affiche la tab correspondante
	
	// Enlever les anciennes chansons
	$("#musiqueTab").show().find('.song').remove();
	// Afficher le loading
	$('#loading').show();

    // On lance les recherches avec le service de recherche
	$.ajax({
            url: "http://localhost:8001/search?q=" + encodeURI($('#searchField').val()),
            data: {}
        }).done(function (data) {
			// Afficher seulement la réponse du dernier appel
			if (data.query === $('#searchField').val()) {
				// Cacher le loading
				$('#loading').hide();
				// Ajouter les nouvelles chansons
				data.songs.forEach(function (song) {
					$('#musiqueTab').append(musicScript.generateSongHtml(song, false));
				});

				updatePlaylistButtons();
			}
        });
}

function updatePlaylistButtons() {
	var mus = $.ajax({
		url: "http://localhost:8002/dbb/service/music",
		type: "GET",
		data: {},
		contentType: "application/json; charset=utf-8",
	}).then(function(musique)
	{
		var songDivs = $('#musiqueTab .song');
		songDivs.each(function()
		{
			var songDiv = $(this);
			var songHref = songDiv.find('.music-player').find('a').attr('href');

			JSON.parse(musique).forEach(function(playlistSong) {
				if(playlistSong.href === songHref) {
					songDiv.find('.addToPlaylist').remove();
					songDiv.append($('<div></div>').addClass('playlist-name').html(playlistSong.playlist_name));
					return;
				}
			});
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
