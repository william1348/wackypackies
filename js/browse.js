var categoryArray = [];
var itemsArray = [];
$(document).ready(function(){
	  initialize();
});

function initialize(){
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

    $('#header').load("header.html", onHeaderLoaded);
    $('#footer').load("footer.html", onHeaderLoaded);
    $('#navigation').load("navigation.html", onHeaderLoaded);

    $('.tab').click(function(){
      $('.tab').removeClass('tab-selected');
      $(this).addClass("tab-selected");
      if( $(this).attr('name') == "packies"){
        $('#category-container').fadeIn();
        $('#items-container').fadeOut();
      }else{
        $('#items-container').fadeIn();
        $('#category-container').fadeOut();
      }
    });
}

function onHeaderLoaded(){
  
}

function populateItems(list){
  for(var i=0;i<list.length;i++){
    var obj = list[i];
    var item = new Item(obj.id, obj.is_addon, obj.name, obj.description, obj.count, obj.options, obj.price, obj.src);
    itemsArray.push(item);
  }
  console.log(list);

  for(var j=0;j<itemsArray.length;j++){
    var $currentRow;
    if(j % 3 == 0){
      var $row = $('<div>', {class: "row"});
      $('#items-container').append($row);
      $currentRow = $row;
    }

    // closures
    (function () {
      var obj = itemsArray[j];
      console.log(obj);
      var $item = $('<div>', {class: "browse-section one-third column"});
      $item.id = obj.id;
      $item.append("<img class='browse-item-img' src='" + IMG_DIRECTORY + "box.jpeg" + "'>" );
      $item.append("<div class='browse-item-title'>" + obj.name + "</div>");
      $item.append("<div class='browse-item-description'>" + obj.description + "</div>");
      $currentRow.append($item);
    }()); 
  }
}

function populateCategories(list){
  console.log(list);
  for(var i=0;i<list.length;i++){
      var category = new Category(list[i].id, list[i].name,list[i].description, list[i].included, list[i].addons);
      if(category.id != -1){
        categoryArray.push(category);
      }
  //  console.log( " name " + category.name + " id " + category.id + " included " + category.included + " add ons " + list[i].addons.toString());
  }

  for(var j=0;j<categoryArray.length;j++){
    var $currentRow;
    if(j % 2 == 0){
      var $row = $('<div>', {class: "row"});
      $('#category-container').append($row);
      $currentRow = $row;
    }

    // closures
    (function () {
      var obj = categoryArray[j];
      includedArray = categoryArray[j].included;
      var $category = $('<div>', {class: "browse-section one-half column"});
      $category.id = obj.id;
      $category.append($('<div>', {class: "browse-section-image-container"}));
      $category.append("<img class='browse-section-image' src='img/box.png'>" );
      $category.append("<div class='browse-section-description'>" +obj.description + "</div>");
      $category.append("<h3 class='section-title browse-section-title'>" + obj.name + "</h3>");
      $currentRow.append($category);
        $category.click(function(){
          window.location= "/order.html?category=" + $category.id;
        });
    }()); 
  }
}