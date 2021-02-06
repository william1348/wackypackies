var BASE_URL = "https://wackypackies.com:8002/";
// // uncomment for local testing 
// var BASE_URL = "http://localhost:8000/";
var USERNAME = "username";
var PASSWORD = "password";
var CATEGORIES ="categories";
var CATEGORY = "category";
var ITEMS = "items";
var THEMES = "themes";
var PROCESS_PAYMENT = "process-payment";
var MAX_MOBILE_WIDTH = 650;

var IMG_DIRECTORY = "/img/"

function Category(id, name, description, base_price, included, addons, images) {
  this.id = id;
  this.name = name;
  this.included = included;
  this.addons = addons;
  this.base_price = base_price;
  this.description = description;
  this.images = images;
}

function Theme(id, name, color, src){
	this.id = id;
	this.name = name;
	this.color = color;
	this.src = src;
}

function Item(id, is_addon, name, description, count, options, price, src){
	this.id = id;
	this.is_addon = is_addon;
	this.name = name;
	this.description = description;
	this.count = count;
	this.options = options;
	this.price = price;
	this.src = src;
}