'use strict';

var totalItems = 0;

var generateCartCount = function(){
	var totalItemCount = 0;
	loadcurrentIDList().done(function(){
		if(currentIDStorage != 'undefined'){
			for(var i in currentIDStorage){
				totalItemCount += parseInt(currentIDStorage[i].quantity);
			}
			totalItems = totalItemCount;
		}
		return totalItemCount;
	});
	return totalItemCount;
	
}

var addCartBadgeHtml = function(){
	$(".count").text(totalItems.toString());
}

function replaceCartCount(){
	console.log("called");
	retrieveAllProducts().done(function(products){	
		generateCartCount();
	if(currentIDStorage.length>0){
		addCartBadgeHtml();
		$(".count").show();
	}else{
		$(".count").hide();		
	}
	});

}

$(function(){
	totalItems = 0;
	replaceCartCount();
});