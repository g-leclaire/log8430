var express = require("express");
var router = express.Router();
var request = require('request');

var bodyParser = require('body-parser')
require("../lib/db");
var Playlists = require("mongoose").model("Playlists"); //Inclusion du modele des produits 
var PlaylistMusic = require("mongoose").model("PlaylistMusic"); //Inclusion du modele des commandes

router.get("/", function(req, res) {
	allowAccess(res);
});

router.get('/service/playlist', function(req, res){ 
	allowAccess(res);
	//On creer la requete
    let productQuery = Playlists.find({}, {_id:0}, function(err, playlist){
        if(err)
        {
            console.log("Erreur lors de la saisi des donnees de la bdd");
        }
		var playlists = [];
		playlist.forEach(function(result)
        {
            playlists.push(result);
        });
		res.status(200, "OK").send(JSON.stringify(playlists));   
    });
});

router.options("/service/playlist", function(req, res) {
	allowAccess(res);
	console.log("OPTIONS PLAYLIST!!!");
	res.status(200).end();
});

router.post("/service/playlist", function(req, res) {
	allowAccess(res);
	var body = "";
	req.on("data", function(data){
		body += data;
	});
	req.on("end", function(){

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
				res.status(201, "Created").end();
			}
		});
		res.status(200).end();
	});			
});

router.delete("/service/playlist", function(req, res){
	allowAccess(res);
	var body = "";
	req.on("data", function(data){
		body += data;
	});
	req.on("end", function(){
		Playlists.remove({name: body}, function(err, numberRemoved){
			if(numberRemoved.result.n == 0 || err)
			{
				console.log("Erreur lors de la suppression");
			}
			res.status(200).end();
		});
	});
});

router.get("/service/music", function(req, res){
	allowAccess(res);
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

router.get("/service/music/:playlist", function(req, res){
	allowAccess(res);
	var paramPlaylistName = req.params.playlist;
	if(!paramPlaylistName)
	{
		res.status(401).end();
		return;
	}
	let productQuery = PlaylistMusic.find({playlist_name: paramPlaylistName}, {_id:0}, function(err, playlist){
        if(err)
        {
            console.log("Erreur lors de la saisi des donnees de la bdd");
        }
		var playlists = [];
		playlist.forEach(function(result)
        {
            playlists.push(result);
        });
		res.status(200, "OK").send(JSON.stringify(playlists));
	});		
	
});

router.options("/service/music", function(req, res) {
	allowAccess(res);
	res.status(200).end();
});

router.post("/service/music", function(req, res){
	allowAccess(res);
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
				res.status(201, "Created").end();
			}
		});
		res.status(200).end();
	});
});

router.delete("/service/music", function(req, res){
	allowAccess(res);
	console.log("DELETE Music");
	var body = "";
	req.on("data", function(data){
		body += data;
	});
	req.on("end", function(){
		var bodyJson = JSON.parse(body);
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

router.options("/service/music/:playlist", function(req, res) {
	allowAccess(res);
	console.log("OPTIONS Music in Playlist!!!");
	res.status(200).end();
});

router.delete("/service/music/:playlist", function(req, res){
	allowAccess(res);
	var paramPlaylistName = req.params.playlist;
	PlaylistMusic.remove({playlist_name: paramPlaylistName}, function(err, numberRemoved){
		if(numberRemoved.result.n == 0 || err)
		{
			console.log("Erreur lors de la suppression des chansons");
		}
		res.status(200).end();
	});
});

function allowAccess(res) {
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers','X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
}

module.exports = router;
