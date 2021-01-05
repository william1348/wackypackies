
$(document).ready(function(){
	initialize();

});

function initialize(){
    $('#header').load("header.html", onHeaderLoaded);
    $('#footer').load("footer.html", onHeaderLoaded);
    $('#navigation').load("navigation.html", onHeaderLoaded);
  }

function onHeaderLoaded(){
  
}