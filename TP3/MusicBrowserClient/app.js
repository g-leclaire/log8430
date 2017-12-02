/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '55a904c1f12a42238e0d4b6e10401cfd'; // Your client id
var client_secret = '3f03dc78b1074383862c6dacea03062d'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var bodyParser = require('body-parser')


var router = express.Router();
require("./lib/db");
var Playlists = require("mongoose").model("Playlists"); //Inclusion du modele des produits 
var PlaylistMusic = require("mongoose").model("PlaylistMusic"); //Inclusion du modele des commandes
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'))
   .use(cookieParser());
   
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/service/playlist', function(req, res){   
    //On creer la requete
    let productQuery = Playlists.find({}, {_id:0}, function(err, playlist){
        if(err)
        {
            console.log("Erreur lors de la saisi des donnees de la bdd");
        }
		var playlists = [];
		playlist.forEach(function(result)
        {
            //console.log(result);
            playlists.push(result);
        });
		res.status(200, "OK").send(JSON.stringify(playlists));   
    });
});

app.post("/service/playlist", function(req, res) {
	var body = "";
	req.on("data", function(data){
		body += data;
	});
	req.on("end", function(){

		//console.log("Body :");
		//console.log(body);
		var newObject = new Playlists({name: body});
		newObject.save(function(err)
		{
			if(err)
			{
				console.log("Erreur lors de la sauvegarde du nouveau produit");
				res.status(400, "Bad Request").end();
			}
			else
			{
				//console.log("Saved!");
				//console.log("Ajout de l'objet avec success!");
				res.status(201, "Created").end();
			}
		});
		res.status(200).end();
	});			
});

app.delete("/service/playlist", function(req, res){
	var body = "";
	req.on("data", function(data){
		body += data;
	});
	req.on("end", function(){
		//console.log("Trying to remove Playlist : " + body);
		Playlists.remove({name: body}, function(err, numberRemoved){
			if(numberRemoved.result.n == 0 || err)
			{
				console.log("Erreur lors de la suppression");
			}
			//console.log("Playlist retire!");
			res.status(200).end();
		});
	});
});

app.get("/service/music", function(req, res){

	let productQuery = PlaylistMusic.find({}, function(err, playlist){
			if(err)
			{
					console.log("Erreur lors de la saisi des donnees de la bdd");
					res.status(500).end();
			}
		  var songs = [];
		  playlist.forEach(function(result)
      {
          songs.push(result);
      });
	  	res.status(200, "OK").send(JSON.stringify(songs));
	});		
	
});

app.get("/service/music/:playlist", function(req, res){
	var paramPlaylistName = req.params.playlist;
	//console.log(paramPlaylistName);
	if(!paramPlaylistName)
	{
		res.status(401).end();
		return;
	}
	//console.log("Playlist : " + paramPlaylistName);
	let productQuery = PlaylistMusic.find({playlist_name: paramPlaylistName}, {_id:0}, function(err, playlist){
        if(err)
        {
            console.log("Erreur lors de la saisi des donnees de la bdd");
        }
		var playlists = [];
		playlist.forEach(function(result)
        {
            //console.log(result);
            playlists.push(result);
        });
		res.status(200, "OK").send(JSON.stringify(playlists));
	});		
	
});

app.post("/service/music", function(req, res){
	var body = "";
	req.on("data", function(data){
		body += data;
	});
	req.on("end", function(){
		var bodyJson = JSON.parse(body);
		var newObject = new PlaylistMusic({
			playlist_name: bodyJson.playlist_name,
			img: bodyJson.img,
			player: bodyJson.player,
			title: bodyJson.title,
			artist: bodyJson.artist,
			preview: bodyJson.preview,
			href: bodyJson.href
		});
		newObject.save(function(err)
		{
			if(err)
			{
				console.log("Erreur lors de la sauvegarde du nouveau produit");
				res.status(400, "Bad Request").end();
			}
			else
			{
				//console.log("Saved!");
				//console.log("Ajout de l'objet avec success!");
				res.status(201, "Created").end();
			}
		});
		res.status(200).end();
	});
});

app.delete("/service/music", function(req, res){
	var body = "";
	req.on("data", function(data){
		body += data;
	});
	req.on("end", function(){
		var bodyJson = JSON.parse(body);
		//console.log("Trying to remove Playlist : " + body);
		PlaylistMusic.remove({
			playlist_name: bodyJson.playlist_name,
			img: bodyJson.img,
			player: bodyJson.player,
			title: bodyJson.title,
			artist: bodyJson.artist,
			preview: bodyJson.preview,
			href: bodyJson.href
		}, function(err, numberRemoved){
			if(numberRemoved.result.n == 0 || err)
			{
				console.log("Erreur lors de la suppression");
			}
			console.log("Chanson retire de la playlist " + bodyJson.playlist_name + "!");
			res.status(200).end();
		});
	});
});

app.delete("/service/music/:playlist"), function(req, res){
	var paramPlaylistName = req.params.playlist;
	PlaylistMusic.remove({playlist_name: paramPlaylistName}, function(err, numberRemoved){
		if(numberRemoved.result.n == 0 || err)
		{
			console.log("Erreur lors de la suppression des chansons");
		}
		res.status(200).end();
	});
}

console.log('Listening on 8888');
app.listen(8888);
