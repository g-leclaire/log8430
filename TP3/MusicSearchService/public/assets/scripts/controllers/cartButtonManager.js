'use strict';

var checkRemoveButtonStatus = function(button){
	var amount = parseInt(button.parent().next().text());
	if(amount > 1){
		button.prop('disabled',false);
	} else {
		button.prop('disabled',true);
	}
}

var initialCheck = function(){
	var removeButtons = $('.remove-quantity-button');
	if(removeButtons.length > 0){
		for(var i = 0; i < removeButtons.length; i++){
			checkRemoveButtonStatus($(removeButtons[i]));
		}
	}
}

var updateProductCount = function(button, productList){
	getProductByID(productList, button.closest("tr").attr('id')).done(function(product){
		var productAmount = countItem(product, currentIDStorage);
		button.parent().next().text(productAmount.toString());
		return productAmount;
	
	});

}

var updateProductRemoval = function(button, productList){

	var productIDToRemove = button.closest("tr").attr('id');

	$.ajax({
		type: 'DELETE',
		url: 'api/shopping-cart/' + productIDToRemove,
		contentType: 'application/json',
	}).done(function(){
		loadcurrentIDList().done(function(){
			button.closest("tbody").find('#'+productIDToRemove).remove();
			if(currentIDStorage.length <= 0){
				replaceCartHtml(0);
					replaceCartTotalHtml(0);
					replaceCartCount();
			}
		});
	});

	//replaceCartCount();
}

var updateProductTotal = function(button, productList){
	var productTotal = 0;
	var productID = button.closest("tr").attr('id');
	getProductByID(productList, productID).done(function(product){
			getProductFromCart(productID).done(function(itemFromCart){
				var productQuantity = itemFromCart.quantity;
				var productPrice = product.price;
			productTotal = (productQuantity * productPrice);
			var updatedProductTotalHtml = productTotal.toFixed(2).toString().replace(".", ",") +' $';
			button.closest("tr").find('#total-amount').text(updatedProductTotalHtml);
//			replaceCartCount();
			});
			updateCartTotalPrice(button, productList);
		});
}

var updateCartTotalPrice = function(button, productList){
	var updatedCartTotal = 0;
	loadcurrentIDList().done(function(){
		for(var i = 0; i<currentIDStorage.length;i++){
		var productPrice = 0;
		var productAmountInCart = currentIDStorage[i].quantity;
		var currentProductID = currentIDStorage[i].productId;
		for(var j = 0; j<productList.length;j++){
			if(productList[j].id == currentProductID){
				productPrice = productList[j].price;
			}
		}
		updatedCartTotal = updatedCartTotal + (productPrice * productAmountInCart);
	}
		// currentIDStorage.forEach(function(item)){
		// 	updatedCartTotal += item.quantity;
		// }
		var updatedCartTotalHtml = updatedCartTotal.toString().replace(".", ",")+' $';
		$('.shopping-cart-total').find("strong").text(updatedCartTotalHtml);
	});

}

var updateHtml = function(button, productList){
	//updateProductCount(button, productList);
	updateProductTotal(button, productList);
	// /updateCartTotalPrice(button, productList);
//	replaceCartCount();
}

var removeItemValidation = function(button, productList){
	var itemToBeRemoved = confirm("Voulez-vous supprimer le produit du panier?");
	if(itemToBeRemoved){

		removeProductFromCart(button, currentIDStorage);
		updateProductRemoval(button, productList);

	}
}

var emptyCartValidation = function(button, productList){
	var cartToBeEmptied = confirm("Voulez-vous supprimer tous les produits du panier?");
	if(cartToBeEmptied){
		emptyCart();
			
				replaceCartHtml(0);
				replaceCartTotalHtml(0);
				replaceCartCount();
			
	}
}

$(function(){
	retrieveAllProducts().done(function(products){	
		initialCheck();
	});	

});