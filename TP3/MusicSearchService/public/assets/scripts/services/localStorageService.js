'use strict';

var currentIDStorage = [];

var loadcurrentIDList=function(){
	var returnValue;
	var request = $.ajax({
		url: "http://localhost:8000/api/shopping-cart",
		method: "GET"
	})
	request.done(function(data){
		if(data != 'undefined'){
			returnValue= data;
		} else {
			returnValue=[];
		}
		if(returnValue == 'undefined'){
		currentIDStorage = [];
		} else {
			currentIDStorage = returnValue;
		}
		return request;
	});
	request.fail(function(){
		returnValue = [];
	});
	return request;
};

var getProductFromCart = function(id){
	return $.get("http://localhost:8000/api/shopping-cart/"+id);
}
