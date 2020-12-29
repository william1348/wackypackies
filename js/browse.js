var categoryArray = [];

$(document).ready(function(){
	  initialize();
});

function initialize(){
  $.ajax({
        url: BASE_URL + CATEGORIES
    }).then(function(data) {
       populateCategories(data.categories);
    });

      $('#header').load("header.html", onHeaderLoaded);
}

function onHeaderLoaded(){
  
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