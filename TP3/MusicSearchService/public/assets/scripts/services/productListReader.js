'use strict';

var temp;

var retrieveAllProducts = function() {
	return $.get("./api/products");
};

var getProductByID = function(productList, id){
	temp =  $.get("./api/products/"+id);
	return $.get("./api/products/"+id);
};
