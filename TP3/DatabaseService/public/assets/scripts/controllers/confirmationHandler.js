'use strict';

function loadName(){
	return localStorage.getItem('name');
}

function loadConfirmationNumber(){
	return localStorage.getItem('confirmation-number');
}

function generateUserInfo(){
	$('#name').text(loadName());
	$('#confirmation-number').text(loadConfirmationNumber());
}

$(function(){
	//generateUserInfo();
});
