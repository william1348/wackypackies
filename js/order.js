var itemArray = [];
var currentCategory = null;
var categoryArray = [];
var addOnsArray = [];
var allItemsArray = [];
var finalAllItemsArray = [];
var addOnItemIndex = 0;

//pricing
var preTotalPrice = 0;
var finalTotalPrice = 0;
var totalAddOns = 0;
var basePrice = 0;
var shippingPrice = 0;

// todo - move to db
var FREE_SHIPPING_POINT =25;
var DEFAULT_SHIPPING_PRICE = 7;

// order #
var orderID = -1;

$(document).ready(function(){
	  initialize();

    // populate category, populate add on items carousel
    var category = getUrlParameter(CATEGORY);
    $.ajax({
        url: BASE_URL + CATEGORY + "/" + category
    }).then(function(data){
       setCurrentCategory(data.category);
       // populate default items for selected category
    	 populateItems();
       // populate left container details for selected category
       populateSelected();
    });

    $.ajax({
        url: BASE_URL + ITEMS
    }).then(function(data){
       populateAllItems(data.items);
    });

    // populate all categories (left column)
    $.ajax({
        url: BASE_URL + CATEGORIES
    }).then(function(data) {
       populateCategories(data.categories);
    });

    // toggle ready for payment button (on back press)
    readyForPayment();

    //THEMES - v2
    $.ajax({
        url: BASE_URL + THEMES
    }).then(function(data) {
       populateThemes(data.themes);
    });
});

function initialize(){
  $('#header').load("header.html", onHeaderLoaded);

  // generate order ID
  if(orderID == -1){
      orderID = generateOrderID();
  }

  $('#save-button').click(function(){
      toggleCustomize(false);
      saveForm();
      return false;
      if(!$('#upload-image-button-real').val()){

      }
     // return false;
  });
  $('#customize-edit-text').click(function(){
      toggleCustomize(true);
  });

  $('#payment-button').click(function(){
    // finalTotalPrice = parseFloat($('#totalPrice').text());
    console.log('payment-button: totalPrice: ' + totalPrice);
    if(readyForPayment()){
      prepareItemForPayment();
     //  window.location = 'payment.html';
    }else{
      showError();
      toggleCustomize(true);
      return false;
    }
    // alert('total price ' + totalPrice + " poop" + typeof totalPrice);
  });

  $('#add-new-item-button').click(function(){
    showAddItem(true);  
  });
  $('#cancel-item-button').click(function(){
    showAddItem(false);
  }); 

  $('.customize-input').on('input',function(e){
    hideError();
      readyForPayment();
  });

  $('#upload-image-button-mask').click(function(){
      $('#upload-image-button-real').click();
      return false;
  });

  $('#upload-image-button-mask-new').click(function(){
      $('#upload-image-button-real-new').click();
      return false;
  });

  $('#upload-image-button-real').change(function(){
      $('#file-name').text($(this).val());
      if($(this).val()){
        $('#input-instructions').show();
        $("#upload-image-button-mask-new").show();
        $("#upload-image-button-mask").hide();
        showPreview(this);
      }else{
        $("#upload-image-button-mask-new").hide();
        $("#upload-image-button-mask").show();
      }
      showClearImagesButton();
  });

  $('#upload-image-button-real-new').change(function(){
      $('#file-name-2').text($(this).val());
      if($(this).val()){
        $('#input-instructions').show();
        $("#upload-image-button-mask-new").hide();
        $("#upload-image-button-mask").hide();
        showPreview(this);
      }else{
        $("#upload-image-button-mask-new").hide();
        $("#upload-image-button-mask").hide();
      }
      showClearImagesButton();
  });

  $('#clear-images-button').click(function(){
    $("#upload-image-button-real-new").val('');
    $("#upload-image-button-real").val('');
    $('#file-name').text("");
    $('#file-name-2').text("");
    $('#clear-images-button').hide();
    $("#upload-image-button-mask-new").hide();
    $("#upload-image-button-mask").show();
    $('#input-instructions').hide();
    $('#file-preview-img').attr('src', "");
    $('#file-preview-img-2').attr('src', "");
    $('#file-preview').hide();
    $('#file-preview-2').hide();
    return false;
  });

  // $('#upload-image-help').click(function(){
  //   if($('#upload-image-help').is(":visible")){
  //     $('upload-help-container').hide();
  //   }else{
  //     $('upload-help-container').show();
  //   }
  //   return false;
  // });

  $('#subscribe-email').click(function(){
      subscribeEmail();
  });

  populateForm();
}


function subscribeEmail(){
  var body = {
    "email" : "wkung42@gmail.com"
  }
  $.ajax({
      url: BASE_URL + "subscribe",
      data: body,
      dataType: 'json',
      type: 'POST'
    }).then(function(data){
      alert('email subscribed');
    });
}

function showPreview(input){
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      if($('#file-preview-img').attr('src')){
        $('#file-preview-img-2').attr('src', e.target.result);
        $('#file-preview-2').show();
      }else{
        $('#file-preview-img').attr('src', e.target.result);
         $('#file-preview').show();
      }
    }
    reader.readAsDataURL(input.files[0]); // convert to base64 string
  }
}

function showClearImagesButton(){
  if($('#file-name-2').text() || ($('#file-name').text())){
    $('#clear-images-button').show();
  }else{
    $('#clear-images-button').hide();
  }
}

function showError(){
  $('#error-message').text("Please complete missing fields");
}

function hideError(){
  $('#error-message').text("");
}

function readyForPayment(){
    if(!$('#input-to').val() || !$('#input-from').val() || !$('#input-message').val()){
      $('#payment-button').removeClass();
      $('#payment-button').addClass('payment-not-ready');
      return false;
    }
    $('#payment-button').removeClass();
    $('#payment-button').addClass('payment-ready');
    return true;
}


function showAddItem(show){
  consolidateAddOns();
  $('#previous-item-button').click(function(){
        selectNextAddOnItem(false);
        showNextAddOnItem();
  });
  $('#next-item-button').click(function(){
      selectNextAddOnItem(true);
      showNextAddOnItem();
  });
  if(show){
     showNextAddOnItem();
     console.log('should show here')
     $('#new-item-container').show();
    $('#new-item-controls').show();
     $('#cancel-item-button').show();
    $('#add-new-item-button').hide();
    $('#add-item-button').show();
  }else{
    $('#new-item-container').hide();
    $('#new-item-controls').hide();
    $('#cancel-item-button').hide();
    $('#add-new-item-button').show();
    $('#add-item-button').hide();
  }
}

function onHeaderLoaded(){

}


// removing duplicates between all add on items and items currently in package
function consolidateAddOns(){
  console.log('consolidating...');
  allItemsArray = finalAllItemsArray;
  for(var i=0;i<allItemsArray.length;i++){
    for(var j=0;j<addOnsArray.length;j++){
      if(allItemsArray[i].id == addOnsArray[j].id){
        allItemsArray.splice(i, 1);
      }
    }
  }
}


function selectNextAddOnItem(indexUp){
  if(indexUp){
    addOnItemIndex = addOnItemIndex + 1;
    console.log('next item. index : ' + addOnItemIndex + ' total array length ' + allItemsArray.length);
    if(addOnItemIndex >= allItemsArray.length){
      addOnItemIndex = 0;
    }
  }else{
    addOnItemIndex = addOnItemIndex - 1;
    if(addOnItemIndex < 0){
      addOnItemIndex = allItemsArray.length + addOnItemIndex;
    }
  }
  return getNextAddOnItem();
}


function getNextAddOnItem(){
  console.log('get next add on item index ' + addOnItemIndex);
  return allItemsArray[addOnItemIndex];
}


function showNextAddOnItem(){
  if(allItemsArray.length == 0) {
    console.log('all items shown!!');
    return false; 
  }
  var obj = getNextAddOnItem();
  console.log('item name ' + obj.name);
  var $item = $('<div>', {id: "new-item"});
  var $item_img = $('<div>', {class: "item-img-container"});
  $item_img.append('<img class="item-img" src="img/teddy_sample.jpeg"/>');
  $item.append($item_img);
  var $item_description = $('<div>', {class: "item-desc-container"});
  $item_description.append('<div class="item-title">' + obj.name + '</div>');
  $item_description.append('<div class="item-description">' + obj.description + '</div>');
  $item.append($item_description);
  $('#new-item-container').text("");
  $('#new-item-container').append($item);
  $('#add-item-button').html('ADD FOR $<b>' + obj.price + '</b>');
  $('#add-item-button').off('click');
  $('#add-item-button').click(function(){
    var allAddOnsArray = addOnsArray;
    allAddOnsArray.push(obj);
    populateAddons(allAddOnsArray);
    consolidateAddOns();
    showAddItem(false);
    addOnItemIndex = 0;
  });
}


function toggleCustomize(show){
  if(show){
    $('#customize-container').slideDown();
    $('#customize-edit-text').fadeOut();
  }else{
    $('#customize-container').slideUp(500);
      $('#customize-edit-text').fadeIn(500);
  }
  return false;
}


function populateCategories(list){
  console.log(list);
  for(var i=0;i<list.length;i++){
    var category = new Category(list[i].id, list[i].name, list[i].description, list[i].base, list[i].included, list[i].addons);
    if(category.id != -1){ // build your own
          categoryArray.push(category);
        }
  //  console.log( " name " + category.name + " id " + category.id + " included " + category.included + " add ons " + list[i].addons.toString());
  }

  for(var j=0;j<categoryArray.length;j++){
    var $currentRow;
    if(j % 2 == 0){
      var $row = $('<div>', {class: "row"});
      $('#categories-container').append($row);
      $currentRow = $row;
    }

    // closures
    (function () {
      var obj = categoryArray[j];
      includedArray = categoryArray[j].included;
      var $category = $('<div>', {class: "order-section one-half column"});
      $category.id = obj.id;
      $category.append($('<div>', {class: "home-section-image-container"}));
      $category.append("<img class='home-section-image' src='img/box.png'>" );
      $category.append("<h3 class='section-title order-section-title'>" + obj.name + "</h3>");
      $currentRow.append($category);
      $category.click(function(){
        window.location= "/order.html?category=" + $category.id;
      });
    }()); 
  }
}


// add on items
function populateAllItems(items){
  console.log(' populate all items. size ' + items.length);
  for(var i=0;i<items.length;i++){
    obj = items[i];
    allItemsArray.push(new Item(obj.id, obj.is_addon, obj.name, obj.description, obj.count, obj.options, obj.price, obj.src));
    //console.log('all item: ' + obj.name);
  }
  finalAllItemsArray = allItemsArray;
}

function setCurrentCategory(category){
  if(category == null) return;
  currentCategory = new Category(category.id, category.name, category.description, category.base_price, category.included, category.addons);
}


// left container, selected category details
function populateSelected(){
  if(currentCategory == null){
      console.log('populateSelected::error');
      return;
    }else{
     $('#detail-title').text(currentCategory.name);
     $('#category-name').text(currentCategory.name);
     $('#included-description').text(currentCategory.description);
  }
}


// items for category
function populateItems(){
  if(currentCategory == null){
    console.log('populateItems::error');
    return;
  }else{
    basePrice = currentCategory.base_price;
    populateAddons(currentCategory.addons);
  }
}

// function populateItemCarousel(items){
//   for(var i=0;i<items.length;i++){
//     for(var j=0;j<currentCategory.addons.length;j++){
//       if(currentCategory.addons[j].id == items[i].id){
//         items.splice(i, 1);
//       }
//     }
//   }
//   AVAILABLE_ITEMS = items;
// }

function populateThemes(themes){
  var $container = $('#themes-container');
  var $themeTitle = $('#theme-title');
  for(var i=0;i<themes.length;i++){
    (function(){
      var $item = $('<div>', {class: "theme-item"});
      $item.css({"background-color" : themes[i].color});
      $item.name = themes[i].name;
//    $item.append('hi ' + themes[i].name);
      $container.append($item);
      $item.click(function(){
        $('.theme-item').removeAttr("id");
        $item.attr('id', "theme-selected");
       // $themeTitle.text($item.name);
      });
    }()); 
  }
}

function populateAddons(addonsArray){
  addOnsArray = [];
  $('#items-container').text("");
  console.log('add on size ' + addonsArray.length);
  for(var j=0;j<addonsArray.length;j++){
    // closures
    (function () {
      var obj = addonsArray[j];
      var $item = $('<div>', {class: "item"});
      var $item_img = $('<div>', {class: "item-img-container"});
      $item_img.append('<img class="item-img" src="img/teddy_sample.jpeg"/>');
      $item.append($item_img);
      var $item_description = $('<div>', {class: "item-desc-container"});
      $item_description.append('<div class="item-title">' + obj.name + '</div>');
      $item_description.append('<div class="item-description">' + obj.description + '</div>');
      $item.append($item_description);
      var $item_price = $('<div>', {class: "item-price-container"});
      $item_price.append('<div class="item-price"> $ ' + obj.price + '</div>');
      $item.append($item_price);
      var $item_remove = $('<div>', {class: "item-remove"});
      $item.append($item_remove);
      $('#items-container').append($item);
      $item_remove.click(function(){
        removeItem(obj.id);
        $item.hide();
      });
      //console.log('total add ons: ' + totalAddOns + 'add on price: ' + obj.price);
      addOnsArray.push(new Item(obj.id, obj.is_addon, obj.name, obj.description, obj.count, obj.options, obj.price, obj.src));
    }()); 
  }
  updatePrices();
  $('#totalAddOns').text(formatPrice(totalAddOns));
  //alert('total add on price ' + totalAddOns);
}

function removeItem(id){
  var isInList = false;
  for(var k = 0;k<addOnsArray.length;k++){
    if(addOnsArray[k].id == id){
      // console.log('removing item;' + addOnsArray[k].id);
      isInList = true;
      addOnsArray.splice(k, 1);
    }
  }
  if(!isInList){
    console.log('removeItem error: item not in list');
  }
  consolidateAddOns();
  updatePrices();
}

function updatePrices(){
  totalAddOns = 0;
  // for(var k = 0;k<addOnsArray.length;k++){
  //   console.log('update prices. addon: ' + addOnsArray[k].price + ' name ' + addOnsArray[k].name + ' size ' + addOnsArray.length);
  // }
  for(var k = 0;k<addOnsArray.length;k++){
    totalAddOns += parseFloat(addOnsArray[k].price);
  }
  // set total addons
  $('#totalAddOns').text(formatPrice(totalAddOns));
  // set base price
  $('#basePrice').text(formatPrice(currentCategory.base_price));
  preTotalPrice = totalAddOns + basePrice;
  console.log('pre total price ' + preTotalPrice);
  //preTotalPrice = formatPrice(preTotalPrice);
  if(preTotalPrice >= FREE_SHIPPING_POINT){
    $('#shipping-price-paid').hide();
    $('#shipping-price-free').show();
    shippingPrice = 0;
  }else{
    $('#shipping-price-paid').show();
    $('#shipping-price-free').hide();
    $('#shippingPrice').text(DEFAULT_SHIPPING_PRICE);
    shippingPrice = DEFAULT_SHIPPING_PRICE;
  }
  finalTotalPrice = parseFloat(preTotalPrice + shippingPrice).toFixed(2);
  console.log('final total ' + finalTotalPrice);
  //finalTotalPrice = formatPrice(finalTotalPrice);
  $('#totalPrice').text(formatPrice(finalTotalPrice));
}

function saveForm(){
  $('#input-order-id').attr('value', orderID);
  localStorage.setItem('to', $('#input-to').val());
  localStorage.setItem('from', $('#input-from').val());
  localStorage.setItem('message', $('#input-message').val());
  localStorage.setItem('instructions', $('#input-instructions').val());
}

function populateForm(){
  $('#input-to').val(localStorage.getItem('to'));
  $('#input-from').val(localStorage.getItem('from'));
  $('#input-message').val(localStorage.getItem('message'));
}

function prepareItemForPayment(){
  localStorage.setItem('category', currentCategory.name);
  localStorage.setItem('itemsArray', JSON.stringify(addOnsArray));
  localStorage.setItem('finalPrice', finalTotalPrice);
  saveForm();
}


