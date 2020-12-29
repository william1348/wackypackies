var carousel_width = -1;
var default_container_width = -1;
var tag_array = [];
var BASE_URL = "http://localhost:8000/";
var USERNAME = "username";
var PASSWORD = "password";
var CATEGORIES ="categories"
var ITEMS = "items"
var user = {};
var listingsArray = [];
var listingsSelectedArray = [];
var tagsArray = [];
var categoryArray = [];

$(document).ready(function(){
	initialize();

    $.ajax({
        url: BASE_URL + CATEGORIES
    }).then(function(data) {
    	 populateCategories(data.categories);
    });

    $.ajax({
        url: BASE_URL + ITEMS
    }).then(function(data) {
       populateItems(data.items);
    });
});

function populateCategories(list){
  console.log(list);
  for(var i=0;i<list.length;i++){
    if(list[i].id != -1){
      var category = new Category(list[i].id, list[i].name, list[i].included, list[i].addons);
      categoryArray.push(category);
    }
  //  console.log( " name " + category.name + " id " + category.id + " included " + category.included + " add ons " + list[i].addons.toString());
  }

  for(var j=0;j<categoryArray.length;j++){
    var $currentRow;
    if(j % 3 == 0){
      var $row = $('<div>', {class: "row"});
      $('#category-container').append($row);
      $currentRow = $row;
    }

    // closures
    (function () {
      var obj = categoryArray[j];
      includedArray = categoryArray[j].included;
      var $category = $('<div>', {class: "home-section one-third column"});
      $category.id = obj.id;
      $category.append($('<div>', {class: "home-section-image-container"}));
      $category.append("<img class='home-section-image' src='img/box.png'>" );
      $category.append("<h3 class='section-title home-section-title'>" + obj.name + "</h3>");
      $currentRow.append($category);
        $category.click(function(){
          window.location= "/order.html?category=" + $category.id;
        });
    }()); 
  }
}

function populateItems(data){
  for(var i=0;i<data.length;i++){
    console.log('item name: ' + data[i].name);
  }
  console.log('data ' + data.length);
}

function signout(){
  clearCookie(USERNAME);
  window.location.reload();
}


function onSigninClose(){
	$('#sign_in_container').hide();
	$('#register_button').show();
	$('#close_button').hide();
	$('#sign_in_button').css("border-radius", "0px 0px 3px 3px");
}

function signin(){
	console.log('signin click');
	if(!($('#sign_in_container').is(':visible'))){
		$('#sign_in_container').show();
		$('#signed_in_container').css("background", "#666");
		$('#register_button').hide();
		$('#sign_in_button').css("border-radius","3px");
		$('#close_button').show();
	}else{
		var username = $("#sign_in_username").val();
		var password = $("#sign_in_password").val();
		if((username.length > 0)&&(password.length > 0)){
			authenticateUser(username, md5(password));
		}else{
			showSigninError("Invalid Credentials", false);
		}
	}
	$('#cancel_button').show();
}


function register(){
	if(!($('#sign_in_container').is(':visible'))){
		$('#sign_in_container').show();
		$('#sign_in_email').show();
		$('#sign_in_button').hide();
		//$('#sign_in_button').css("border-radius","3px");
		//$('#signed_in_container').css("background","#666");
	}else{
		//$('#signed_in_container').css("background","");
		var username = $("#sign_in_username").val();
		var password = $("#sign_in_password").val();
		var email = $("#sign_in_email").val();

		if((username.length > 0)&&(password.length > 0) && (email.length > 0)){
			registerUser(username, password, email);
		}else{
			showSigninError("Please try again.", true);
		}
	}
}

function getName(){
  var name = getCookie(USERNAME);
  $('#sign_in_container').hide();
  if(name != null && name.length > 0){
    $("#signed_in_name").append("hello, " + name);
    $("#sign_out_button").show();
    $("#sign_in_button").hide();
    $('#signup_container').hide();
    $('#register_button').hide();
  }else{
     $("#sign_in_button").show();
     $("#signed_in_name").hide();
     $("#sign_out_button").hide();
  }
  console.log('name is : ' + name);
}


function setName(){
  var username = $('#username_input').val();
  var password = $('#password_input').val();

  //registerUser(username, password);
  setCookie(USERNAME, username, 5);
}


function showSigninError(message, floatRight){
	$('#sign_in_error').text(message);
	$('#sign_in_error').show();
	$('#sign_in_error').css("float", floatRight ? "right" : "none");
}


function authenticateUser(username, passwordHash){
	console.log('authenticate : ' + username + ' password ' + passwordHash);

	var requestBody = {
    	"Username" : username,
   	 	"PasswordHash" : passwordHash
  	}

 	$.ajax({
        url: BASE_URL + "user/authenticateUser",
        data: requestBody,
        dataType: 'json',
        type: 'POST',
        context: document.body,
        success: function(response) {
	        if(response.IsSuccess){
	        	setCookie(USERNAME, username, 5);
	         	console.log('authenticated user: ' + username);
	         	user = response.user;
	         	console.log(response);
	         	console.log('we got a user ' + user.userid);
 	            window.location.reload();
	        }else{
	            showSigninError("Invalid Credentials");
	        	console.log('invalid credentials for: ' + username);
	        }
     	}
    });
}


function registerUser(username, password, email){
	console.log('lets register a user');
	var passwordHash = md5(password);
  	var requestBody = {
    	"Username" : username,
   	 	"PasswordHash" : passwordHash
  	}

 	$.ajax({
        url: BASE_URL + "user/registerUser",
        data: requestBody,
        dataType: 'json',
        type: 'POST',
        context: document.body,
        success: function(response) {
	        if(response.IsSuccess){
	           // window.location.reload();
	           authenticateUser(username, passwordHash);
	         	console.log('registered, now lets try to login with: ' + username + " . password; " + passwordHash);
	        }else{
	        	console.log('username already taken ' + username);
	        }
     	}
    });
}


function setCookie(cname, cvalue, exdays) {
 	var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


function clearCookie(cname){
	document.cookie = cname + "=" + ";" + "expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}


$(window).resize(function() {

});


function initialize(){
	$('#header').load("header.html", onHeaderLoaded);
  $('#left-sample-image').click(function(){
      window.location= "/order.html?category=" + 1;
  });
  $('#build-your-own').click(function(){
      window.location= "/order.html?category=-1";
  });
}


function onHeaderLoaded(){
	
}


function setListeners(){
	
}
