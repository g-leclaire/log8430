'use strict';

$(function(){
	// Submit order
	$('#order-form').submit(function() {

		// Only execute if inputs are valid
		if ($(this).valid()) {

			// Retrieve orders
			$.get("./api/orders")
				.fail(function() {
					console.log("Erreur de récupération des commandes");
				}).done(function(orders) {

					// Retrieve content of shopping cart
					$.get("./api/shopping-cart")
						.fail(function() {
							console.log("Erreur de récupération du panier");
						}).done(function(cart) {

							var order = retrieveFormInfo();
							order.id = orders.length + 1;
							order.products = formatCartData(cart);

							sendOrder(order);
						});
				});
			return false;
		}
	});
});

function formatCartData(cart) {
	var products = [];
	cart.forEach(function(product) {
		products.push({
			id: product.productId,
			quantity: product.quantity
		});
	});
	return products;
}

function retrieveFormInfo() {
	return {
		firstName: $('#first-name').val(),
		lastName: $('#last-name').val(),
		email: $('#email').val(),
		phone: $('#phone').val()
	};
}

function sendOrder(order) {
	$.ajax({
		type: "POST",
		contentType: "application/json",
		url: "./api/orders",
		data: JSON.stringify(order),
		dataType: "json",
		success: function (response) {
      // Empty cart
      $.ajax({
        url: "./api/shopping-cart",
        type: 'DELETE'
      });

			// Redirect to confirmation
			window.location.href = './confirmation?name=' + order.firstName + ' ' + order.lastName + '&orderId=' + order.id;
		},
		error: function(xhr, textStatus, errorThrown) {
			alert("Erreur : " + xhr.responseText);
		}
	});
}
