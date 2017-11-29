var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

router.get("/", function(req, res) {
	var sessionData = req.session.cart;
	if(typeof sessionData === 'undefined'){
		sessionData = JSON.parse('[]');
	}
	res.json(sessionData);
 
});

router.get("/:productId", function(req, res) {
	var sessionData = req.session.cart;
	var productFound = false;
	var foundProductIndex = undefined;
	var productId = req.params.productId;
	if(req.session.cart){
		for(var i = 0; i < sessionData.length; i++){
			if(sessionData[i].productId == productId){
				productFound = true;
				foundProductIndex = i;
			}
		}
	}
	if(typeof sessionData === 'undefined' || !productFound){
		res.sendStatus(404);
	} else {
		res.status(200).json(sessionData[foundProductIndex]);
	}	
});

router.post("/", function(req, res) {
	var sessionData = req.session.cart;
	var products = mongoose.model("Product");
  var productAlreadyInCart = false;
  var parsedProduct = req.body;
  var search = {};
  search.id = parsedProduct.productId;

	if(req.session.cart){
	  for(var i = 0; i < sessionData.length; i++){
			if(sessionData[i].productId == search.id){
				productAlreadyInCart = true;
			}
	  }
	} else {
		req.session.cart = [];
	}

  products.find(search, function(err, productsFound) {
	  if (!productAlreadyInCart && parsedProduct.quantity > 0 && !err && productsFound.length != 0) {
	  	req.session.cart.push(req.body);
		  res.sendStatus(201);
	  } else {
		  res.sendStatus(400);
	  }
	  res.end();
	  return;
	});
});

router.put("/:productId", function(req, res) {
	var sessionData = req.session.cart;
	var products = mongoose.model("Product");
	var updatedQuantity = req.body.quantity;
	var productAlreadyInCart = false;
	var foundProductIndex = 0;
  var productId = req.params.productId;
	if(req.session.cart){
	  for(var i = 0; i < sessionData.length; i++){
			if(sessionData[i].productId == productId){
				productAlreadyInCart = true;
				foundProductIndex = i;
			}
	  }
	}
  if(productAlreadyInCart){
  	if(updatedQuantity > 0){
  		req.session.cart[foundProductIndex].quantity = updatedQuantity;
  		res.sendStatus(204);
  	} else {
  		res.sendStatus(400);
  	}
  } else {
  	res.sendStatus(404);
  }
  res.end();
  return;

});

router.delete("/:productId", function(req, res) {
	var sessionData = req.session.cart;
	var productId = req.params.productId;
	var foundProductIndex = 0;
	var productIsInCart = false;
	if(req.session.cart){
		for(var i = 0; i < sessionData.length; i++){
			if(sessionData[i].productId == productId){
				productIsInCart = true;
				req.session.cart.splice(i,1);
			}
	  }
	}
	if(productIsInCart){
		res.sendStatus(204);
	} else {
		res.sendStatus(404);
	}
});

router.delete("/", function(req, res) {
	req.session.cart = [];
	res.sendStatus(204);
});

module.exports = router;
