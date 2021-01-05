var addOnsArray = [];
var finalPrice = -1;
var finalPriceCents = -1;
var email = "";
var name = "";
var orderID;
var to;
var from;
var message;
var address;

$(document).ready(function(){
	  initialize();
});

function initialize(){
  //showPaymentComplete();
  //saveOrderDB();
  $('#header').load("header.html", onHeaderLoaded);
  $('#footer').load("footer.html", onHeaderLoaded);

  category = localStorage.getItem('category');
  finalPrice = localStorage.getItem('finalPrice');
  message = localStorage.getItem('message');
  to = localStorage.getItem('to');
  from = localStorage.getItem('from');
  addOnsArray = JSON.parse(localStorage.getItem('itemsArray'));
  if(addOnsArray == null || finalPrice == -1){
    // show nothing in cart error
    return;
  }
  $('#sq-creditcard').text('Pay $' + finalPrice);
  $('#hidden-final-price').text(finalPrice);
  $('#category-name').text(category);
  $('#to').text(to);
  $('#from').text(from);
  $('#message').text(message);

  $('#shipping-form-edit').hide();

  $('#shipping-form').submit(function () {
     toggleSquarePayment(true);
     return false;
  });

  $('#shipping-form-edit').click(function(){
      toggleSquarePayment(false);
  });

  $('#new-order-button').click(function(){
    clearForm();
    window.location = "index.html";
  });
  $('#sq-creditcard').click(function(event){
    if(!readyForPayment()){
      showPaymentError();
      return false;
    }
    onGetCardNonce(event);
  });

  populateAddOns();
  populatePriceTotal();
}

function readyForPayment(){
  if(!$('#email-input').val() || !$('#name-input').val() || !$('#address').val() || !$('#city').val() || !$('#state').val() || !$('#zip').val()){
    return false;
  }
  return true;
}

function populatePriceTotal(){
  $('#price-total').text("TOTAL: $" + finalPrice);
}

function toggleSquarePayment(show){
  if(show){
    $('#shipping-form').slideUp();
    // $('#square-payment-container').slideDown();
    $('#shipping-form-edit').show();
  }else{
    $('#shipping-form').slideDown();
    // $('#square-payment-container').slideUp();
    $('#shipping-form-edit').hide();
  }
}

function clearForm(){
  localStorage.removeItem('to');
  localStorage.removeItem('from');
  localStorage.removeItem('message');
  localStorage.removeItem('itemsArray');
}

function populateAddOns(){
  // for(var i=0;i<addOnsArray.length;i++){
  //   $('#addons-container').append('item: ' + addOnsArray[i].name + '\n\n');
  // }

  if(addOnsArray.length == 0) {
    console.log('showAddOns : error');
    return false; 
  }
  for(var i=0;i<addOnsArray.length;i++){
    var $item = $('<div>', {class: "item"});
    $item.append( addOnsArray[i].name);
    $('#addons-container').append($item);
  }
}

function showPaymentComplete(){
  console.log('payment complete');
  $('#before-payment').hide();
  $('#after-payment').show();
  $("#order-email").append(email);
  //$("#order-number").text(number);
  // $("#order-name").append(name);
  $('#order-number').append(orderID);
  clearForm();
}

function saveOrderDB(){
  orderID = generateOrderID();
  email = $('#email-input').val();
  name = $('#name-input').val();
  address = $('#address').val() + " " + $('#city').val() + " " + $('#state').val() + " " + $('#zip').val();
  var body = {
    "name" : $('#name-input').val(),
    "details" : {
      "to" : to,
      "from" : from,
      "message" : message
    },
    "address" : address,
    "email" : email,
    "id" : orderID
  }
  $.ajax({
      url: BASE_URL + "complete",
      data: body,
      dataType: 'json',
      type: 'POST'
    }).then(function(data){
       setCurrentCategory(data.category);
       // populate default items for selected category
       populateItems();
       // populate left container details for selected category
       populateSelected();
    });
}

function showPaymentError(){
  $('#error-message').text("Please complete shipping info");
  $('#error-message').show();
  toggleSquarePayment(false);
}

function hidePaymentError(){
  $('#error-message').hide();
}

function onHeaderLoaded(){
  //
}

