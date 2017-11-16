var time_current = 0.0;
var time_total = 0.0;
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
        this.player = null;
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
		//555640
        DZ.player.playTracks([this.songId], 0, function(response){
            console.log("play reponse: ", response.tracks);
        });
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
	
	//On va chercher les chansons a afficher de Deezer
	getDeezerSongs();
	
	//On va chercher les chansons a afficher de Spotify
	getSpotifySongs();
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
		//for(var i = 0 ; i < maPlayList.length; i++)
		maPlayList.slice().forEach(function(song)
		{
			/*On ajoute la section dans l'affichage*/
			var songDiv = document.createElement("div");
			songDiv.className = "song";
			
			//Si le type de la chanson est un spotify
			if(song.type == "spotify")
			{
				songDiv.innerHTML = "<div class=\"song\"><a href=\"" + song.objet.external_urls.spotify + "\"><img src=\"http://pixel.nymag.com/imgs/daily/vulture/2015/06/26/26-spotify.w529.h529.jpg\" class=\"logo\" alt=\"deezerLogo\"></img><div class=\"musicDesc\"><p>" + song.objet.artists[0].name + ' - ' + song.objet.name + "</p><button id=\"add-to-playList\">X</button></div></a></div>"						
				myPlayListTab.appendChild(songDiv);
				//On ajoute l'evenement lorsque le bouton de retrait est cliqué
				document.getElementById("mesPlaylistTab").lastChild.lastChild.lastChild.lastChild.lastChild.onclick = function(e) {
					var nouvelleEntree = song;
					retirerChanson(nouvelleEntree);
					//On evite le comportement par defaut pour eviter une redirection de l'ancre (<a...>)
					e.preventDefault();
					e.stopPropagation();
				}
			}
			else if(song.type == "deezer")
			{
				songDiv.innerHTML = "<div class=\"song\"><img src=\"https://e-cdns-files.dzcdn.net/img/common/ogdeezer.jpg\" class=\"logo\" alt=\"deezerLogo\"></img><div class=\"musicDesc\"><p>" + song.artist + ' - ' + song.title + "</p><button id=\"add-to-playList\">X</button></div></div>"
				myPlayListTab.appendChild(songDiv);
				//On ajoute l'evenement du click sur la description pour faire jouer la chanson
				document.getElementById("mesPlaylistTab").lastChild.lastChild.onclick = function(e){
					playSong(song.objet);
				}
				document.getElementById("mesPlaylistTab").lastChild.lastChild.lastChild.lastChild.onclick = function(e) {
					retirerChanson(song);
					e.preventDefault();
					e.stopPropagation();
				}
			}			
		});
	}
}

//Fonction cachant toutes les tabs
function cacherTabs()
{
	var allTabs = $(".tabcontent");
	allTabs.hide();
}

function getSpotifySongs()
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
		url: 'https://api.spotify.com/v1/search?q=' + searchEntry + '&type=track&limit=10',
		headers: {
		  'Authorization': 'Bearer ' + access_token
		},
		success: function(response) {
			var musicTab = document.getElementById("musiqueTab");
			/*Pour chacun des resultats obtenus*/
			//for(var i = 0 ; i < response.tracks.items.length; i++)
			response.tracks.items.slice(0, 10).forEach(function(song)
			{
				/*On ajoute la section dans l'affichage*/
				var songDiv = document.createElement("div");
				songDiv.className = "song";
				/*<div id=\"player\"><button id=\"player-play\">></button><button id=\"player-pause\">ll</button><div id=\"player-slider\"><div id=\"player-progress\" ><div id=\"player-progress-hand\"></div></div></div></div>*/
				songDiv.innerHTML = "<div class=\"song\"><a href=\"" + song.external_urls.spotify + "\"><img src=\"http://pixel.nymag.com/imgs/daily/vulture/2015/06/26/26-spotify.w529.h529.jpg\" class=\"logo\" alt=\"deezerLogo\"></img><div class=\"musicDesc\"><p>" + song.artists[0].name + ' - ' + song.name + "</p><button id=\"add-to-playList\">+</button></div></a></div>"			
				musicTab.appendChild(songDiv);	

				var nouvelleEntree = {type: "spotify", objet: song};
				/*Evenement lorsque le bouton d'ajout de chanson est clique*/
				document.getElementById("musiqueTab").lastChild.lastChild.lastChild.lastChild.lastChild.onclick = function(e) {
					ajouterChanson(nouvelleEntree);
					e.preventDefault();
					e.stopPropagation();
				}
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

function getDeezerSongs()
{
	var songs = [];
	//On va chercher la valeur de recherche
	var searchEntry = document.getElementById("searchField").value;
	//Si on n'a pas de valeur de recherche, alors on ne prend aucune chanson
	if(searchEntry == "")
		return [];
	/*Allons chercher les chansons a afficher*/
	DZ.api('/search/' + "track" + '?q=' + encodeURIComponent(searchEntry), function(response){
		/*On selectionne les 10 premiers resultats*/
		var musicTab = document.getElementById("musiqueTab");
		var i = 0;
		console.log(response);
		response.data.slice(0, 10).forEach(function(foundSong) {
			i++;

			let song = new Song();
            song.title = foundSong.title;
            song.artist = foundSong.artist.name;
            song.year = null;
            song.id = foundSong.id;
            song.href = foundSong.link;
            song.player = new DeezerPlayer(foundSong.id);
			
			/*On ajoute la section dans l'affichage*/
			var songDiv = document.createElement("div");
			songDiv.className = "song";
			/*<div id=\"player\"><button id=\"player-play\">></button><button id=\"player-pause\">ll</button><div id=\"player-slider\"><div id=\"player-progress\" ><div id=\"player-progress-hand\"></div></div></div></div>*/
			songDiv.innerHTML = "<div class=\"song\"><img src=\"https://e-cdns-files.dzcdn.net/img/common/ogdeezer.jpg\" class=\"logo\" alt=\"deezerLogo\"></img><div class=\"musicDesc\"><p>" + song.artist + ' - ' + song.title + "</p><button id=\"add-to-playList\">+</button></div></div>"
			musicTab.appendChild(songDiv);
			
			//On ajoute les Bindings a cette chanson
			/*DZ.Event.subscribe('player_position', function(e,i){
				time_current = e[0];
				if (e[1])
					time_total = +e[1];
				var width = (time_current / time_total * 100) + '%';
				
			});*/
			// Evenement lorsqu'une chanson est cliquee
			document.getElementById("musiqueTab").lastChild.onclick = function(e){
                song.player.play();
			}
			
			var nouvelleEntree = {type: "deezer", objet: song};
			/*Evenement lorsque le bouton d'ajout de chanson est clique*/
			document.getElementById("musiqueTab").lastChild.lastChild.lastChild.lastChild.onclick = function(e) {
				console.log(nouvelleEntree);
				ajouterChanson(nouvelleEntree);
				e.stopPropagation();
			}

			//musicTab.getElementById("player-play").onclick = playSong(song);
			//$("#player-pause").click(DZ.player.pause);
			//$("#player-slider").click(sliderClicked);
			
			songs.push(song);
		});
	});
	return songs;
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

//Fonction permettant de faire jouer une chanson
var playSong = function(song) {
	song.player.play();
	/*DZ.player.playTracks([song.id], 0, function(response){
		console.log("play reponse: ", response.tracks);
	});*/
};

var playAlbum = function(album) {
	console.log(album);
	DZ.player.playAlbum(album.id, 0, function(response){
		console.log("track list", response.tracks);
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

//Fonction appellée à l'ouverture de la page
$(document).ready(function(){
	afficherMusique("");
	
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