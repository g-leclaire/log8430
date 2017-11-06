// Inspired by https://github.com/deezer/javascript-samples

var time_current = 0.0;
var time_total = 0.0;

$(function() {
	$("#player-play").click(DZ.player.play);
	$("#player-pause").click(DZ.player.pause);
	$("#player-slider").click(sliderClicked);
	$("#go").click(launchSearch);
	
	DZ.init({
		appId: '118825',
		channelUrl: 'http://vladimir.sh/playground/deezer_light/channel.html',
		player: {
		}
	});
	
	DZ.Event.subscribe('player_position', function(e){
		time_current = e[0];
		if (e[1])
			time_total = +e[1];
		var width = (time_current / time_total * 100) + '%';
		$("#player-progress").css("width", width);
	});
	
	DZ.Event.subscribe('player_loaded', function(){
		DZ.getLoginStatus(function(response) {
			if (response.authResponse) {
				console.log('logged');
			} else {
				console.log('not logged');
			}
		}, {scope: 'manage_library,basic_access'});
	})
});

var playSong = function(song) {
	DZ.player.playTracks([song.id], 0, function(response){
		console.log("play reponse: ", response.tracks);
	});
	$("#currently-playing").html(song.artist.name + ' - ' + song.title)
};

var launchSearch = function() {
	$("#results").html('');
	
	DZ.api('/search/track?q=' + encodeURIComponent($("#search-input").val()), function(response){
		console.log('search response: ', response.data);
		response.data.slice(0, 20).forEach(function(song) {
			var $li = $('<li><a>' + song.artist.name + ' - ' + song.title + '</a></li>');
			$li.click(function(){ playSong(song); });
			$("#results").append($li);
		});
	});
}

var sliderClicked = function(e) {
	var slider = $(e.delegateTarget);
	var x = e.clientX - slider.offset().left;
	DZ.player.seek(x / slider.width() * 100);	
	
	//var result = searchSong("rihanna", SearchField.TITLE);
	//console.log("songs: " + result);
};

SearchField =  {
	TITLE: 0,
	ARTIST: 1,
	ALBUM: 2
}

function searchSong(text, field) {
	var songs = [];
  var field = "";
  if (field == SearchField.TITLE)
	  field = "track";
  else if (field == SearchField.ARTIST)
	  field = "artist";
  else if (field == SearchField.ALBUM)
	  field = "album";
  
  DZ.api('/search/' + field + '?q=' + encodeURIComponent(text), function(response){
		//var songs = [];
		response.data.slice(0, 20).forEach(function(song) {
			var formattedSong = {
				title: song.title,
				artist: song.artist.name,
				year: null,
				id: song.id,
				href: song.link
			}
			songs.push(formattedSong);
		});
		//console.log(songs);
	});
	return songs;
}
