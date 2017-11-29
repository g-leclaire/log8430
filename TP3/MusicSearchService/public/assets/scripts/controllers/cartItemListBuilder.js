'use strict';

var htmlUpdatePromise;
var cartTotal = 0;
var TotalCartPriceString = 0;
var currentProductList = new Array(); 

var countItem = function(product, listID){
	console.log(currentProductList);
	var count = 0;
	for(var i in listID){
		if(listID[i].productId == product.id){
			count = parseInt(listID[i].quantity);
		}
	}
	return count;
}

var sortName = function(a, b){
	return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0);
}

function sortAlphabetically(productList){
	return productList.sort(sortName);
}

function getTotalCartPrice(productList, listID){
	var TotalCartPrice = 0;
	var productsAlreadyAddedToTotal = new Array();
	for(var i = 0; i < listID.length; i++){
		(function(i){
		getProductByID(productList, listID[i].productId).done(function(product){
			if($.inArray(product, productsAlreadyAddedToTotal) == -1){
				var productTotal = countItem(product, listID) * product.price;
				TotalCartPrice += productTotal;
				productsAlreadyAddedToTotal.push(product);
				if(i == listID.length-1)
					TotalCartPriceString = TotalCartPrice.toFixed(2).toString().replace(".", ",");
			}
		});
		})(i);
			
	}

	return cartTotal.toFixed(2).toString().replace(".", ",");
}

var generateCartHtml = function(productList){
	var itemListHTML;
	cartTotal = 0;
	if(productList.length > 0){
		productList.forEach(function(product){
		var itemTotal = product.price*countItem(product, currentIDStorage);
		cartTotal += itemTotal;
		itemListHTML += 
		'<tr id="'+product.id+'">'+
			'<td><button class="remove-item-button" title="Supprimer"><i class="fa fa-times"></i></button></td>'+
			'<td><a href="./produit?id=#'+ product.id +'">'+ product.name +'</a></td>' +
			'<td class="price" id="product-price">'+product.price.toString().replace(".", ",")+'&thinsp;$</td>'+
			'<td>' +
				'<div class="row">'+
					'<div class="col">'+
					'<button class="remove-quantity-button" title="Retirer" disabled=""><i class="fa fa-minus"></i></button>'+
					'</div>'+
					'<div class="col quantity" id="item-count">' + countItem(product, currentIDStorage)+'</div>' +
					'<div class="col">' +
					'<button class="add-quantity-button" title="Ajouter"><i class="fa fa-plus"></i></button>' +
					'</div>' +
				'</div>'+
			'</td>' +
			'<td id="total-amount">'+ itemTotal.toFixed(2).toString().replace(".", ",") +'&thinsp;$</td>'
			'</tr>';
		});

	} else{
		itemListHTML = '<p>' + 'Aucun produit dans le panier.' + '</p>';
	}
	return itemListHTML;
}

var replaceCartTotalHtml = function(productList, listID){
	if(productList.length > 0){
		var cartTotalText = 'Total: <strong>' + getTotalCartPrice(productList, listID) +'&thinsp;$</strong>';
		$(".shopping-cart-total").html(cartTotalText);
	} else {
		$(".shopping-cart-total").html('');
	}
}

var replaceCartHtml = function(productList){
	var htmlToAdd = generateCartHtml(productList);
	if(productList.length > 0){
		$(".shopping-cart-table").find('tbody').append(htmlToAdd);
	} else{
		$(".shopping-cart-table").remove();
		$(".btn").remove();
		$(".shopping-cart-total").remove();
		$("article").append(htmlToAdd);
	}
}

function waitUntilProductListIsLoaded(products){
	for(var i = 0; i < currentIDStorage.length; i++){
		(function(i){
			getProductByID(products, currentIDStorage[i].productId).done(function(productFound){
				if(!currentProductList.includes(productFound)){
						currentProductList.push(productFound);
				}
				if(i==currentIDStorage.length-1){
					updateCartHtml(currentProductList, currentIDStorage);
					replaceCartCount();
					initialCheck();
				}
			}).then(result =>{
				//loadcurrentIDList();
		$(".remove-quantity-button").click(function() {
			decrementQuantity($(this));
			loadcurrentIDList();
			updateHtml($(this), products);
			checkRemoveButtonStatus($(this));
		});
		$('.add-quantity-button').click(function(){
			incrementQuantity($(this));
			loadcurrentIDList();
			updateHtml($(this), products);
		});
		$('.remove-item-button').click(function(){
			removeItemValidation($(this), products);
		});
		$('#remove-all-items-button').click(function(){
			emptyCartValidation($(this), products);
		});
			});

		})(i);
		htmlUpdatePromise = new Promise((resolve,reject)=>{
			resolve("Success");
		})		

	}
}

function updateCartHtml(productList, IDList){
	var sortedCurrentProductList = sortAlphabetically(productList);
	replaceCartHtml(sortedCurrentProductList);
	replaceCartTotalHtml(productList, IDList);
}

$(function(){
	retrieveAllProducts().done(function(products){	
		loadcurrentIDList();
		if(currentIDStorage.length > 0){
			waitUntilProductListIsLoaded(products);
		} else {
			replaceCartHtml(currentProductList);
			replaceCartTotalHtml(currentProductList, currentIDStorage);	
		}

	});
});