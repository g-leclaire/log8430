var express = require("express");
var router = express.Router();
var request = require('request');

router.get("/", function(req, res) {
    return res.status(200).send("Ça fonctionne.");
});


router.get("/:query", function(req, res) {
    JamendoAPI.searchSongs(res, req.params.query);
});

/*
router.post("/", function(req, res) {
  // Validate first name
  if (!validateString(req.body.firstName)) {
    return res.status(400).send("Le prénom doit être une chaîne non vide.");
  }
  // Validate last name
  if (!validateString(req.body.lastName)) {
    return res.status(400).send("Le nom doit être une chaîne non vide.");
  }
  // Validate email
  if (!validateEmail(req.body.email)) {
    return res.status(400).send("L'adresse courriel est invalide.");
  }
  // Validate phone
  if (!validatePhone(req.body.phone)) {
    return res.status(400).send("Le numéro de téléphone est invalide.");
  }
  // Validate products
  if (!validateProducts(req.body.products)) {
    return res.status(400).send("Les produits de la commande sont invalides.");
  }
  // Validate order id
  if (!validateInteger(req.body.id)) {
    return res.status(400).send("L'identifiant de commande doit être un entier.");
  }

  // Check if all order products exist
  var Product = mongoose.model("Product");
  Product.find({}, function(err, existingProducts) {
    if (existingProducts.length < 1) {
      return res.status(400).send("Il n'y a pas de produits dans la base de données.");
    }
    else {
      // Double loop to avoid doing a request for each order product
      var oneIdIsInvalid = false;
      req.body.products.forEach(function(orderProduct) {
        var isIdValid = false;
        existingProducts.forEach(function(existingProduct) {
          if (existingProduct.id === orderProduct.id)
            isIdValid = true;
        });
        if (!isIdValid) {
          oneIdIsInvalid = true;
        }
      });
      if (oneIdIsInvalid) {
        return res.status(400).send("Un id de produit est invalide");
      }

      // Check if order id is unique
      var Order = mongoose.model("Order");
      Order.findOne({id: req.body.id}, function(err, order) {
        if (order) {
          return res.status(400).send("L'identifiant de commande est déjà utilisé");
        }

        // Create order
        var newOrder = new Order({
          id: req.body.id,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phone: req.body.phone,
          email: req.body.email,
          products: req.body.products
        });
        newOrder.save(function (err, newOrder) {
          if (err)
            return res.status(400).send("Erreur de sauvegarde.");
          else
            return res.status(201).json(newOrder);
        });
      });
    }
  });
});


router.delete("/:id", function(req, res) {
	var Order = mongoose.model("Order");
  var search = {};
  search.id = req.params.id;

  Order.remove(search, function(err, result) {
	  if (JSON.parse(result).n < 1) {
      return res.sendStatus(404);
    } else {
      return res.sendStatus(204);
	  }
  });
});

router.delete("/",  function(req, res) {
  var Order = mongoose.model("Order");
  Order.remove({}, function(err){
  	if(err)
  		return res.send(err);
  	else {
      return res.status(204).json({message: 'Commandes supprimées!'});
    }
  });
});
*/

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
        $.ajax({
            url: 'https://api.spotify.com/v1/search?q=' + encodeURIComponent($('#searchField').val()) + '&type=track&limit=10',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function (response) {

                var results = response.tracks.items;
                results.forEach(function (song) {
                    $('#musiqueTab').append(musicScript.generateSongHtml(musicScript.formatSpotifySong(song, false)));
                });
                musicScript.sort($('#musiqueTab .song'));// Sort all elements;
            }
        });
    }
}

var JamendoAPI = {
    searchSongs: function(res, query) {
        request("https://api.jamendo.com/v3.0/tracks/?client_id=d328628b&format=jsonpretty&limit=20&namesearch=" + encodeURI(query),
            function (error, response, body) {
                //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                var songs = [];
                JSON.parse(body).results.forEach(function (song) {
                    songs.push(formatJamendoSong(song, false));
                });
                res.status(200).send(songs);
            });
    }
}

var DeezerAPI = {
    searchSongs: function() {
        if ($('#searchField').val().length > 0) {
            DZ.api('/search/' + "track" + '?q=' + encodeURI($('#searchField').val()), function (response) {
                var songs = [];
                response.data.forEach(function (song) {
                    songs.push(formatDeezerSong(song, false));
                });
            });
        }
    }
}

formatJamendoSong = function(song) {
    return {
        title: song.name,
        artist: song.artist_name,
        img: song.album_image,
        preview: song.audio,
        href: song.shareurl,
        player: "jamendo"
    };
}


formatDeezerSong = function(song) {
    return {
        title: song.title,
        artist: song.artist.name,
        img: song.album.cover_small,
        preview: song.preview,
        href: song.link,
        player: "deezer"
    };
}

formatSpotifySong = function(song) {
    return {
        title: song.name,
        artist: song.artists[0].name,
        img: song.album.images[1].url,
        preview: song.preview_url,
        href: song.href,
        player: "spotify"
    };
}

module.exports = router;
