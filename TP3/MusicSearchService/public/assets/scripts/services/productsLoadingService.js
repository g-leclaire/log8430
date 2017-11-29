'use strict';

var changeSelectedButton = function(button) {
	button.siblings().removeClass("selected");
	button.addClass("selected");
};

var sortName = function(a, b){
	return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0);
};

var sortNameInv = function(a, b){
	return (a.name.toLowerCase() < b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() < a.name.toLowerCase()) ? -1 : 0);
};

var sortPrice = function(a, b){
	return a.price - b.price;
};

var sortPriceInv = function(a, b){
	return b.price - a.price;
};

var currentSort = sortPrice;
var currentCategory = "";

var sortClick = function(button, sort) {
	currentSort = sort;
	changeSelectedButton(button);
	reloadProducts(sort, currentCategory);
};

var filterClick = function(button, category) {
	currentCategory = category;
	changeSelectedButton(button);
	reloadProducts(currentSort, category);
};

var reloadProducts = function(sort, category) {
	// Retrieve products
	retrieveAllProducts()
		.fail(function(xhr, status) {
			console.log("Erreur " + status + " : " + xhr.responseText);
		}).done(function(products) {
			// Filter
			if (category !== "")
				products = products.filter(product => product.category === category);
			// Sort
			products.sort(sort);
			// Replace html
			replaceProductsHtml(products);
		});
};

var generateProductHtml = function(product){
	return '<div class="product"><a href="./produit?id=' + product.id
				+ '" title="En savoir plus..."><h2>' + product.name+ '</h2><img alt="' + product.name
				+ '" src="./assets/img/' + product.image + '"><p><small>Prix</small> ' + product.price.toString().replace(".", ",")
				+ '&thinsp;$</p></a></div></div>'
};
