'use strict';

$("#product-image").attr("src","");

$.currentProductId = function(){
	var results = new RegExp('[\?&]' + 'id' + '=([^&]*)').exec(window.location.href);
	if (results === null)
	  return null;
	else if (results[1][0] === "#")
		results[1] = results[1].substr(1);
	return parseInt(results[1]);
}

var loadProductInfo = function(id) {
	getProductByID(null, id)
    .fail(function() {
      $("#product-name").html("Page non trouvée!");
      $("#product-info").remove();
      $("#dialog").remove();
    }).done(function(product){
      if (product !== null) {
        $("#product-name").html(product.name);
        $("#product-image").attr("src","./assets/img/" + product.image).attr("alt", product.name);
        $("#product-desc").html(product.description);
        $("#product-price").html(product.price.toString().replace(".", ",") + "&thinsp;$");
        $("#product-features").html('');
        product.features.forEach(function(feature) {
          $("#product-features").append("<li>" + feature + "</li>");
        });
      }
	  });
};

$(function(){
	$("#dialog").hide();

	loadProductInfo($.currentProductId());
});
