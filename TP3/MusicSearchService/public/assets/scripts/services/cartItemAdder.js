'use strict';

var addItemClick = function(button){	
	var amountToAdd = parseInt($('#product-quantity').val());
	var itemID = $.currentProductId();
	var json = {
		productId: parseInt(itemID),
		quantity: amountToAdd
	};

	$.ajax({
		type: 'POST',
		url: 'api/shopping-cart',
		contentType: 'application/json',
		data: JSON.stringify(json)
	}).done(function(){
		loadcurrentIDList();
	});

}

var removeItemFromCart = function(itemID, listID){
	var product;
	getProductFromCart(parseInt(itemID)).done(function(data){
		product = data;
			var newQuantity = data.quantity - 1;
	var json = {
		quantity: newQuantity
	};

	$.ajax({
		type: 'PUT',
		url: 'api/shopping-cart/'+ itemID,
		contentType: 'application/json',
		data: JSON.stringify(json)
	}).done(function(){
		loadcurrentIDList();
	});
	});

}

var addItemFromCart = function(itemID, listID){
	var product;
	getProductFromCart(parseInt(itemID)).done(function(data){
		product = data;
			var newQuantity = data.quantity + 1;
	var json = {
		quantity: newQuantity
	};

	$.ajax({
		type: 'PUT',
		url: 'api/shopping-cart/'+ itemID,
		contentType: 'application/json',
		data: JSON.stringify(json)
	});
	});
}

var decrementQuantity = function(button){
	var itemIDToRemove = button.closest("tr").attr('id');
	var amount = parseInt(button.parent().next().text());
	amount--;
	button.parent().next().text(amount.toString());
	removeItemFromCart(itemIDToRemove, currentIDStorage);
	checkRemoveButtonStatus(button);	
}

var incrementQuantity = function(button){
	var itemIDToAdd = button.closest("tr").attr('id');
	var amount = parseInt(button.parent().prev().text());
	amount++;
	button.parent().prev().text(amount.toString());

		addItemFromCart(itemIDToAdd, loadcurrentIDList());
		checkRemoveButtonStatus(button.parent().prev().prev().find('.remove-quantity-button'));
}

var removeProductFromCart = function(button, listID){
	var productIDToRemove = button.closest("tr").attr('id');
	for(var i in listID){
		if(listID[i].id == productIDToRemove){
			listID.splice(i, 1);
		}
	}
}

var emptyCart = function(){
	$.ajax({
		type: 'DELETE',
		url: 'api/shopping-cart'
	});
}


$(function(){
	$("#add-to-cart-form").submit(function(){	
		$("#dialog").css("display", "inline-block");

		setTimeout(function() {
		$("#dialog").fadeOut(500);
		}, 4500);
		
		addItemClick($(this));

		return false;
	});
});