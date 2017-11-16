var access_token = null;
refresh_token = null;
error = null;

class Song {
	constructor() {
		this.title = "";
        this.artist = "";
        this.year = "";
        this.id = "";
        this.href = "";
        this.imgSrc = "";
        this.player = new Player();
	}

    buildDiv(isPlaylist) {
	    let playlistButtonLabel = isPlaylist ? "X" : "+";
        let songDiv = $("<div class=\"song\"><img src=\"" + this.imgSrc + "\" class=\"logo\" alt=\"logo\"></img><div class=\"musicDesc\"><p>" + this.artist + ' - ' + this.title + "</p><button id=\"add-to-playList\">" + playlistButtonLabel + "</button></div></div>");
        let song = this;
        songDiv.data("song", song);

        // Play event
        songDiv.find("p").click(function (e) {
            song.player.play();
        });

        // Add to playlist event
        songDiv.find("#add-to-playList").click(function (e) {
            let playlistElement = {type: song.type, objet: song.JSONObject};
            if (isPlaylist)
                retirerChanson(playlistElement);
            else
                ajouterChanson(playlistElement);
        });

        return songDiv;
    }

	static createFromDeezerJSONObject(songJSONObject) {
	    let song = new Song();
        song.type = "deezer";
        song.JSONObject = songJSONObject;
	    song.imgSrc = "https://e-cdns-files.dzcdn.net/img/common/ogdeezer.jpg";
	    song.title = songJSONObject.title;
        song.artist = songJSONObject.artist.name;
        song.id = songJSONObject.id;
        song.player = new DeezerPlayer(songJSONObject.id);
        return song;
    }

    static createFromSpotifyJSONObject(songJSONObject) {
	    let song = new Song();song
        song.type = "spotify";
        song.JSONObject = songJSONObject;
        song.imgSrc = "http://pixel.nymag.com/imgs/daily/vulture/2015/06/26/26-spotify.w529.h529.jpg";
        song.title = songJSONObject.name;
        song.artist = songJSONObject.artists[0].name;
        song.href = songJSONObject.external_urls.spotify;
        song.player = new SpotifyPlayer(songJSONObject.external_urls.spotify);
        return song;
    }
}

class Player {
    play() {
    	// To redefine in subclasses.
    }
}

class DeezerPlayer extends Player {
	constructor(songId) {
        super();
        this.songId = songId;
	}

    play() {
        DZ.player.playTracks([this.songId], 0, function(response){
            console.log("play reponse: ", response.tracks);
        });
    }
}

class SpotifyPlayer extends Player {
    constructor(songLink) {
        super();
        this.songLink = songLink;
    }

    play() {
        window.open(this.songLink);
    }
}



/**
 * Obtains parameters from the hash of the URL
 * @return Object
 * Source : https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
	  q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
	 hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}


//Fonction affichant le contenu de la tab Musique
function afficherMusique()
{
	//On affiche la tab correspondante
	$("#musiqueTab").show();
	
	var musicTab = document.getElementById("musiqueTab");
	
	//On vide la liste de chansons
	while(musicTab.firstChild)
		musicTab.removeChild(musicTab.firstChild);

    let searchEntry = document.getElementById("searchField").value;

    //On va chercher les chansons a afficher de Deezer
	launchDeezerSongsSearch(searchEntry);

	//On va chercher les chansons a afficher de Spotify
	launchSpotifySongsSearch(searchEntry);
}

//Fonction affichant le contenu de la tab Recherche PlayList
function afficherResultatPlayList()
{
	$("#playListTab").show();
	
	var playListTab = document.getElementById("playListTab");
	
	//On vide la liste de playLists
	while(playListTab.firstChild)
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
	while(myPlayListTab.firstChild)
		myPlayListTab.removeChild(myPlayListTab.firstChild);
	
	var maPlayListJson = localStorage.getItem("myPlayList");
	var maPlayList = JSON.parse(maPlayListJson);
	
	if(maPlayList != null)
	{
		maPlayList.forEach(function(playlistElement)
		{
			if(playlistElement.type == "spotify")
                $("#mesPlaylistTab").append(Song.createFromSpotifyJSONObject(playlistElement.objet).buildDiv(true));
			else if(playlistElement.type == "deezer")
                $("#mesPlaylistTab").append(Song.createFromDeezerJSONObject(playlistElement.objet).buildDiv(true));
		});
	}
}

//Fonction cachant toutes les tabs
function cacherTabs()
{
	var allTabs = $(".tabcontent");
	allTabs.hide();
}

function launchSpotifySongsSearch(searchEntry)
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
	}).done(function(data) {
	  access_token = data.access_token;
	});

	// On va chercher les chansons de Spotify
	$.ajax({
		url: 'https://api.spotify.com/v1/search?q=' + searchEntry + '&type=track&limit=10',
		headers: {
		  'Authorization': 'Bearer ' + access_token
		},
		success: function(response) {
			// On prend les 10 premiers resultats
			response.tracks.items.slice(0, 10).forEach(function(songJSONObject) {
                $("#musiqueTab").append(Song.createFromSpotifyJSONObject(songJSONObject).buildDiv(false));
			});
		}
	})
}

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
	}).done(function(data) {
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
		success: function(response) {
			var playListTab = document.getElementById("playListTab");
			/*Pour chacun des resultats obtenus*/
			for(var i = 0 ; i < response.playlists.items.length; i++)
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

function launchDeezerSongsSearch(searchEntry)
{
	// Si on n'a pas de valeur de recherche, alors on ne prend aucune chanson
	if(searchEntry == "") return;
	/*Allons chercher les chansons a afficher*/
	DZ.api('/search/' + "track" + '?q=' + encodeURIComponent(searchEntry), function(response){
		/*On selectionne les 10 premiers resultats*/
		response.data.slice(0, 10).forEach(function(songJSONObject) {
			$("#musiqueTab").append(Song.createFromDeezerJSONObject(songJSONObject).buildDiv(false));
		});
	});
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
	
	if(myPlayList == null)
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
	
	if(myPlayList != null)
	{
		for(var i = 0; i < myPlayList.length; i++)
		{
			if(myPlayList[i].type == "spotify")
			{
				if(myPlayList[i].objet.name === chanson.objet.name)
				{
						//console.log("FOUND SPOTIFY!");
						myPlayList.splice(i,1);
						break;
				}
			}
			else if(myPlayList[i].type == "deezer")
			{
				if(myPlayList[i].objet.title === chanson.objet.title)
				{
					myPlayList.splice(i,1);
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

var playAlbum = function(album) {
	console.log(album);
	DZ.player.playAlbum(album.id, 0, function(response){
		console.log("track list", response.tracks);
	});
}

//Fonction appellée à l'ouverture de la page
$(document).ready(function(){
	//afficherMusique("");
	
	document.getElementById("musicButton").onclick = function(){
		cacherTabs();
		$(".tablinks").removeClass("active");
		$("#musicButton").addClass("active");
		afficherMusique();
	};
	
	document.getElementById("playListButton").onclick = function(){
		cacherTabs();
		$(".tablinks").removeClass("active");
		$("#playListButton").addClass("active");
		afficherResultatPlayList();
	};
	
	document.getElementById("mesPlayListButton").onclick = function(){
		cacherTabs();
		$(".tablinks").removeClass("active");
		$("#mesPlayListButton").addClass("active");
		afficherMaPlayList();
	};
	
	document.getElementById("OkButton").onclick = function()
	{
		cacherTabs();
		$(".tablinks").removeClass("active");
		$("#musicButton").addClass("active");
		afficherMusique();
	}
	
	/*Initialisation de Deezer*/
	DZ.init({
		appId: '118825',
		channelUrl: 'http://vladimir.sh/playground/deezer_light/channel.html',
		player: {
		}
	});
	
	if(access_token)
		$("#login").hide();
});