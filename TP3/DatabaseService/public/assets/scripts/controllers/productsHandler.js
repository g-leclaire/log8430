'use strict';

var replaceProductsHtml = function(products) {
	// Empty html
	$("#products-list").html('');
	
	// Fill with products
	products.forEach(function(product) {
		$("#products-list").append(generateProductHtml(product));
	});
	
	// Update number of products
	$("#products-count").html(products.length + " produits");
}

$(function(){
	$( "#filter-cameras" ).click(function() {
		filterClick($(this), "cameras")
	});
	$( "#filter-consoles" ).click(function() {
		filterClick($(this), "consoles")
	});
	$( "#filter-screens" ).click(function() {
		filterClick($(this), "screens")
	});
	$( "#filter-computers" ).click(function() {
		filterClick($(this), "computers")
	});
	$( "#filter-all" ).click(function() {
		filterClick($(this), "")
	});
	$( "#sort-price" ).click(function() {
		sortClick($(this), sortPrice)
	});
	$( "#sort-price-inv" ).click(function() {
		sortClick($(this), sortPriceInv)
	});
	$( "#sort-name" ).click(function() {
		sortClick($(this), sortName)
	});
	$( "#sort-name-inv" ).click(function() {
		sortClick($(this), sortNameInv)
	});
	
	reloadProducts(sortPrice, "");
});