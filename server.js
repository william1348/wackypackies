var express = require("express")
var formidable = require("formidable");
var bodyParser = require('body-parser');
const crypto = require('crypto');
const squareConnect = require('square-connect');
var fs = require('fs');
var http = require('http');
var https = require('https');
var cors = require('cors');

var privateKey  = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

// /root/.acme.sh/wackypackies.com_ecc/wackypackies.com.cer 
// [Wed Jan 13 18:19:08 UTC 2021] Your cert key is in  /root/.acme.sh/wackypackies.com_ecc/wackypackies.com.key 
// [Wed Jan 13 18:19:08 UTC 2021] The intermediate CA cert is in  /root/.acme.sh/wackypackies.com_ecc/ca.cer 
// [Wed Jan 13 18:19:08 UTC 2021] And the full chain certs is there:  /root/.acme.sh/wackypackies.com_ecc/fullchain.cer 

var app = express()
const port = 8001;
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(8002);

app.use(cors())
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

const MongoClient = require('mongodb').MongoClient
// square
const accessToken = "EAAAEGfyJWlDjkxT_yPl0d79jIOPBpXOujuyc52LyPaCtGuWrrjbw0M_ElPR4_WX";
// Set Square Connect credentials and environment
const defaultClient = squareConnect.ApiClient.instance;

// Configure OAuth2 access token for authorization: oauth2
const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = accessToken;

// Set 'basePath' to switch between sandbox env and production env
// sandbox: https://connect.squareupsandbox.com
// production: https://connect.squareup.com
defaultClient.basePath = 'https://connect.squareupsandbox.com';

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/test', function(req,res){
	res.json({result: "success!" })
});

app.post('/process-payment', async (req, res) => {
  const request_params = req.body;

  // length of idempotency_key should be less than 45
  const idempotency_key = crypto.randomBytes(22).toString('hex');

  // Charge the customer's card
  const payments_api = new squareConnect.PaymentsApi();
  const request_body = {
    source_id: request_params.nonce,
    amount_money: request_params.amount_money,
    // amount_money: {
    //   amount: 5000, // $1.00 charge
    //   currency: 'USD'
    // },
    idempotency_key: idempotency_key
  };

  try {
    const response = await payments_api.createPayment(request_body);
    res.status(200).json({
      'title': 'Payment Successful',
      'result': response
    });
  } catch(error) {
    res.status(500).json({
      'title': 'Payment Failure',
      'result': error.response.text
    });
  }
});
var dbUrl ='mongodb+srv://admin:password1234@project.cib5r.mongodb.net/project?retryWrites=true&w=majority';

//var dbUrl = 'mongodb+srv://admin:password1234@project.cib5r.mongodb.net/project-shard-00-01.cib5r.mongodb.net:27017?retryWrites=true&w=majority';

MongoClient.connect(dbUrl, (err, client) => {
    console.log('we connected');
	if (err) return console.log(err)
	db = client.db('project') 
	app.listen(port, ()=>{
		console.log('hi we are live on port ' + port);
	});

	app.post('/payment.html', (req, res) => {
		var form = new formidable.IncomingForm({
	        uploadDir: __dirname + '/storage',
	        keepExtensions: true,
	        multiples: true,
	    });
	    form.multiples = true;
	    files = [],
    	fields = [];
    	var orderID = -1;
    	console.log(form.fields);

		form.on('field', function(field, value) {
	        console.log('fieldDDDDDDD: ' + field + ' value ' + value);
	        if(field == "input-order-id"){
	        	console.log('order id is now ' + value);
	        	orderID = value;
	        }
	        fields.push([field, value]);

	       // res.redirect("/payment.html");
	    })
	    form.on('fileBegin', function(field, file) {
	        console.log('on file yo : ' + field + ' file ' + file);
	        file.path = form.uploadDir + "/" + orderID  + "-" + file.name;
	        files.push([field, file]);
	        //res.redirect("/payment.html");
	    })
	    form.on('end', function() {
    		console.log('doneDDDDDD');
    	  res.redirect('/payment.html');
		});

		// form.on('fileBegin', function (name, file){
		// 	console.log('file names ' + file.name);
  //       	//file.path = __dirname +'/storage/' + file.name;
	 //    });

	 //    form.on('file', function (name, file){
	 //        console.log('Uploaded ' + file.name);
	 //    //     backURL=req.header('Referer') || '/';
  // 			 res.redirect("/payment.html");
	 //    });
		form.parse(req);
	});	

	// GET CATEGORIES
	app.get('/categories', (req, res)=>{
		db.collection("categories").find({}).toArray(function(error, result) {
		    if (err) throw err;
	    	res.json({"IsSuccess" : true, "categories" : result})	
			console.log('categories: ' + result);
		});
	});

	// GET CATEGORIES
	app.get('/themes', (req, res)=>{
		db.collection("themes").find({}).toArray(function(error, result) {
		    if (err) throw err;
	    	res.json({"IsSuccess" : true, "themes" : result})	
		});
	});

	// GET FULL CATEGORY OBJECT
	app.get('/category/:id', (req, res)=>{
		console.log('req is ' + req);
		var category_id = parseInt(req.params.id);
		console.log('try to find category ' + category_id);
		db.collection("categories").findOne({"id": category_id}, function(error, categoriesResult) {
			db.collection("items").find({}).toArray(function(error, itemsResult){
				if(categoriesResult == null) return;
				var categoryAddons = categoriesResult.addons;
				var categoryIncluded = categoriesResult.included;
				console.log('add ons ' + categoryAddons + ' included ' + categoryIncluded);
				var finalIncludedArray = [];
				var finalAddonsArray = [];
				for(var i=0;i<itemsResult.length;i++){
					console.log(' from items array. id ' + itemsResult[i].id);
					if(categoryAddons != null && categoryAddons.includes(itemsResult[i].id)){
						finalAddonsArray.push(itemsResult[i]);
						console.log('adding ' + itemsResult[i].id + ' to array');
					}else if (categoryIncluded != null && categoryIncluded.includes(itemsResult[i].id)){
						finalIncludedArray.push(itemsResult[i]);
					}
				}
				console.log('# included ' + finalIncludedArray.length + ' # add on ' + finalAddonsArray.length);
				console.log('category: ' + categoriesResult);
				categoriesResult.included = finalIncludedArray;
				categoriesResult.addons = finalAddonsArray;
				res.json({"IsSuccess" : true, "category" : categoriesResult});
			});
		});
	});


	// GET TAGS
	app.get('/tags', (req, res)=>{
		db.collection("tags").findOne({}, function(error, result) {
		    if (err) throw err;
	    	res.json({"IsSuccess" : true, "tags" : result.tags})	
			console.log('tags list' + result + "error " + error);
		});
	});


	// GET ITEMS
	app.get('/items', (req, res)=>{
		db.collection("items").find({}).toArray(function(error, result) {
		    if (err) throw err;
	    	res.json({"IsSuccess" : true, "items" : result})	
	    	console.log('items length: ' + result.length)
		});
	});


 	// body { int songid, string comment, string name, string date} //  
	app.post('/insertComment', (req, res)=>{
		console.log(' insert comment for ' + req.body.songid);
		var songid = parseInt(req.body.songid);
		var comment = req.body.comment;
		var name = req.body.name;
		var date = req.body.date;
		db.collection("comments").findOne({"id" : songid}, function(error, result) {
		    if(error || result == null){
		    	console.log(' there was an error: ' + error);
		    	res.json({"IsSuccess" : false, "Error" : error});
		    	return;
		    }
		    var commentObject = result;
		    var commentArray = result.comments;
		    commentArray.push({"name" : name, "comment" : comment, "date" : date});
		    commentObject.comments = commentArray;
		    db.collection("comments").update({"id" : songid}, commentObject);
		    res.json({"IsSuccess" : true, "comment" : commentObject})
		});
	});



 	// body { int songid, int rating} //  
	app.post('/submitRating', (req, res)=>{
		console.log(' update rating ' + req.body.songid);
		var songid = parseInt(req.body.songid);
		var rating = parseInt(req.body.rating);

		db.collection("songs").findOne({"id" : songid}, function(error, result) {
		    if(error || result == null){
		    	console.log(' there was an error updating the rating: ' + error);
		    	res.json({"IsSuccess" : false, "Error" : error});
		    	return;
		    }
		    var songObject = result;
		    var rating = 1;
		    var ratingCount = parseInt(songObject.ratingCount);
		    newRatingCount = ratingCount + 1;
		    songObject.ratingCount = newRatingCount;
		    db.collection("songs").update({"id" : songid}, songObject);
		   
		   // db.collection("comments").update({"id" : songid}, commentObject);
		    res.json({"IsSuccess" : true, "result" : songObject});
		});
	});


	// REGISTRATION
	app.post('/user/registerUser', (req, res)=>{
		db.collection("users").find({}).toArray(function(error, users) {
		    if (err) throw err;
		    if(check_user_valid(users, req.body.Username)){
				save_user(users.length+1, req);
		    	res.json({"IsSuccess" : true, "UserId" : 1})	
				console.log('we good 1');
		    }else{
		    	res.json({"IsSuccess" : false, "ErrorMessage" : "User already reigstered", "ErrorCode" : 1})		
		    	console.log('already taken. no gucci');
		    }
		});
	});


	// LOGIN
	app.post('/user/authenticateUser', (req, res)=>{
		var query = {Username: req.body.Username.toLowerCase()};
		db.collection("users").find(query).toArray(function(err, result){
		if (err) throw err;
		if(result.length == 1){
			console.log('found the user at least... ' + ' password provided: ' + req.body.PasswordHash + ' and actual password is : ' + result[0].PasswordHash);
			if(result[0].PasswordHash == req.body.PasswordHash){
				res.json({IsSuccess: true, Message: "Successful Login", user : result[0]});
			}else{
				res.json({IsSuccess: false, ErrorMessage: "Incorrect Username or Password", ErrorCode: "2"});
			}
		}else{
			console.log('couldnt even find the user... ' );
			res.json({IsSuccess: false, ErrorMessage: "Incorrect Username or Password", ErrorCode: "1"});
		}
		    console.log(result);
		    return;
		});
	});


	// EMAIL SUBSCRIBE
	app.post('/subscribe', (req, res)=>{
		console.log('email subscribe');
		var body = req.body;
		console.log('email is ' + body.email);
		db.collection("subscribeEmails").insertOne(body, function(err, res) {
	    if (err) throw err;
	  });
	});


	// SAVE ORDER
	app.post('/complete', (req, res)=>{
		console.log('save order');
		var order = req.body;
		console.log(order);
		db.collection("orders").insertOne(order, function(err, res) {
	    if (err) throw err;
	  });
	});

	var check_user_valid = function(users, newUserName){
		console.log("check users. users size: " + users.length + " new username: " + newUserName) ;
		for(var i =0;i<users.length;i++){
			if(users[i].Username == newUserName){
				console.log('duplicate: ' + newUserName + ' is the same as ' + users[i].Username);
				return false;
			}
			console.log('user: ' + users[i].Username + "\n");
		}
		return true;
	};


	// GET COMMENTS
	app.get('/comments/:songid', (req, res)=>{
		var songid = parseInt(req.params.songid);
		//console.log('getting comments for : ' + songid);
		db.collection("comments").findOne({"id" : songid}, function(error, result) {
		    if (err) throw err;
	    	res.json({"IsSuccess" : true, "comments" : result})	
			console.log('we good 3');
		});
	});


	var save_user = function(id, request){
		var newid;
		db.collection("counters").findOne({}, function(err, result){
 			newid = result.usersCounter + 1;
 			var obj = {
				Username : request.body.Username.toLowerCase(),
				PasswordHash : request.body.PasswordHash,
				userid : newid
			};

			db.collection('users').insertOne(obj, (err, result)=>{
				if(err){
					console.log('error: save_user')
					return console.log(err)
				}

				db.collection("counters").updateOne({"id" : 1}, {$set:{'usersCounter':newid}});
		 			console.log('2 new id is : ' + newid);
       			 });
				console.log('success: save_user')
			});
	};


})


