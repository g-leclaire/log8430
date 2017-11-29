'use strict';

$(function(){
	$.validator.addMethod("regex", function(value, element, regexpr) {          
		return regexpr.test(value);
		}, "La date d'expiration de votre carte de crédit est invalide.");
	
	$("#order-form").validate({
		rules: {
			phone: {
				required: true,
				phoneUS: true
			},
			creditcardexpiry: {
				required: true,
				regex: /^(0[1-9]|1[012])[- /.][0-9][0-9]$/
			},
			creditcard: {
				creditcard: true
			}
		}
	});
});