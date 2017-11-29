var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");



router.get("/", function(req, res) {
  var Order = mongoose.model("Order");

  Order.find({}, function(err, orders) {
	  return res.status(200).json(orders);
  });
});

router.get("/:id", function(req, res) {
  var Order = mongoose.model("Order");
  var search = {};
  search.id = req.params.id;

  Order.find(search, function(err, orders) {
	  if (orders !== null && orders.length === 1) {
		  return res.status(200).json(orders[0]);
	  } else {
		  return res.sendStatus(404);
	  }
  });
});

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

function validateString(string) {
  return (typeof string === 'string' && string.length > 0);
}

function validateInteger(string) {
  var re = /[0-9]\d*/;
  return re.test(string);
}

function validateProducts(products) {
  if (typeof products === 'undefined' || products.constructor !== Array || products.length < 1) {
    return false;
  }

  var areProductsValid = true;

  products.forEach(function(product) {
    if (!validateInteger(product.id) ||
        !validateInteger(product.quantity) ||
        parseInt(product.quantity) < 1) {
      areProductsValid = false;	
	}
  });

  return areProductsValid;
}

// Source: https://stackoverflow.com/questions/46155/how-to-validate-email-address-in-javascript
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

// Source: https://stackoverflow.com/questions/4338267/validate-phone-number-with-javascript
function validatePhone(phone) {
  var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  return re.test(phone);
}

module.exports = router;
