var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

function subscribeEmail(email){
  var body = {
    "email" : email
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

// function formatPrice(input){
//     console.log('format price! ' + input);
//     var inputString = input.toString();
//     if(inputString.includes(".") && (inputString.length - inputString.indexOf(".") == 2)){
//         console.log('here');
//         inputString = inputString + "0";
//         result = parseFloat(inputString).toFixed(2);
//         console.log('result ' + result);
//         return result;
//     }else{
//         return parseFloat(input).toFixed(2);
//     }

// }

function generateOrderID(){
    return Math.floor(Math.random()*90000) + 10000;
}

function formatPrice(input){
    console.log('format price! ' + input);
    var inputString = input.toString();
    if(inputString.includes(".") && (inputString.length - inputString.indexOf(".") == 3)){
        decimal = inputString.indexOf(".");
        console.log('nezt two ' + inputString[decimal+1] + ' ' + inputString[decimal + 2]);
        // $10.00 - return $10
        if(inputString[decimal + 1] == "0" && inputString[decimal + 2] == "0"){
            return inputString.slice(0, decimal);
        }
        inputString = inputString + "0";
        result = parseFloat(inputString).toFixed(2);
        console.log('result ' + result);
        return result;
    }else if(!inputString.includes(".")){
        return parseFloat(inputString);
    }else{
        console.log('length ' + (inputString.length - inputString.indexOf(".")));
        return parseFloat(input).toFixed(2);
    }

}