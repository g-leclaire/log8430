var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");



router.get("/", function(req, res) {
  var products = mongoose.model("Product");

  // Define category
  var search = {};
  if ("category" in req.query) {
    if (req.query.category === "computers" || req.query.category === "cameras" || req.query.category === "consoles" || req.query.category === "screens") {
        search.category = req.query.category;
      } else {
      res.sendStatus(400);
      res.end();
      return;
    }
  }

  // Define sort
  var sort = {sort: {price: 1}};
  var sortNameAsc = false;
  var sortNameDsc = false;
  if ("criteria" in req.query) {
	  if (req.query.criteria === "price-asc") {
      sort.sort = {price: 1};
    } else if (req.query.criteria === "price-dsc") {
      sort.sort = {price: -1};
    } else if (req.query.criteria === "alpha-asc") {
      sortNameAsc = true;
    } else if (req.query.criteria === "alpha-dsc") {
      sortNameDsc = true;
    } else {
		  res.sendStatus(400);
		  res.end();
		  return;
	  }
  }

  products.find(search, null, sort, function(err, products) {
    // Sort name
    if (sortNameAsc) {
      products.sort(function(a, b) {return caseInsensitiveCompare(a.name, b.name);});
    } else if (sortNameDsc) {
      products.sort(function(a, b) {return caseInsensitiveCompare(b.name, a.name)});
    }

	  res.json(products);
    res.end();
	  return;
  });
});

router.get("/:id", function(req, res) {
  var products = mongoose.model("Product");
  var search = {};
  search.id = req.params.id;

  products.find(search, function(err, products) {
	  if (products != null && products.length > 0) {
		  res.status(200).json(products[0]);
	  } else {
		  res.sendStatus(404);
	  }
	  res.end();
    return;
  });
});

router.post("/", function(req, res) {
  var Product = mongoose.model("Product");
  var parsedProduct = req.body;
  var invalidButNoDbError = false;

	var newProduct = new Product();
	newProduct.id = parsedProduct.id;
  newProduct.name = parsedProduct.name;
  newProduct.price= parsedProduct.price;
  newProduct.image = parsedProduct.image;
  newProduct.category = parsedProduct.category;
  newProduct.description = parsedProduct.description;
  newProduct.features = parsedProduct.features;

  var isEmptyFeatures = false;
  if(newProduct.features.length > 0){
	  newProduct.features.forEach(function(feature){
	  	if(!feature){
	  		isEmptyFeatures = true;
	  	}
	  });
	}


  if(!newProduct.name || !newProduct.image || (newProduct.category != "cameras" &&
  	 newProduct.category != "computers" && newProduct.category != "consoles" && newProduct.category != "screens") || !newProduct.description || newProduct.features.length <= 0 || isEmptyFeatures){
  	invalidButNoDbError = true;
  	res.sendStatus(400);
  }
  if(!invalidButNoDbError){
	  newProduct.save(function(err){
	  	if(err){
	  		return res.status(400).send(err);
	  	}
			res.status(201).json({message: 'Produit ajouté avec succès!'});
	  });
	}
});


router.delete("/:id", function(req, res) {
	var products = mongoose.model("Product");
  var search = {};
  search.id = req.params.id;

	products.findOne(search, function(err, model){
		if(err || model == null){
			return res.sendStatus(404);
		}
		model.remove(function(err){
			return res.sendStatus(204);
		});
	});
});

router.delete("/",  function(req, res) {
  var Product = mongoose.model("Product");
  Product.remove({}, function(err){
  	if(err)
  		return res.send(err);
  	res.status(204).json({message: 'Products collection removed!'});
  });
});

function caseInsensitiveCompare(a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

module.exports = router;
