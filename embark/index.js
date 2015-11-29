var Express = require('express');
var morgan = require('morgan')
var app = Express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var crypto = require('crypto');
var PythonShell = require('python-shell');

var fs = require("fs");

var db = mongoose.connection;
var Schema = mongoose.Schema;

db.on('error', console.error);

var User = require('./model/user');
var Employee = require('./model/employee');

app.use(morgan('combined'))
app.use(bodyParser.urlencoded({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
mongoose.connect('mongodb://localhost:27017/user');

app.post('/login', function(req, res){
	var d = JSON.stringify(req.body);
	var da=JSON.parse(d.toString());
	da['password'] = hashPass(da['password']);
	User.findOne({email_id: da['emailId'],
				  password: da['password']}, function(err, data){
		if (err || data == null) 
		{
			res.json({"status": "error", "error": "No Account Found"});	
		}
		else
		{
			data['session_token'] = randomString(10);
			data.save(function(error, data){});
			res.json({"status": "success", "error":null, "sessionToken": data['session_token']});
		}
	});
	res.end;
});

app.post('/signup', function(req, res) 
{
	console.log(req.body);
	var d = JSON.stringify(req.body);
	var da=JSON.parse(d.toString());
	console.log(da);
	user = new User({
		email_id: da['emailId'],
		password: da['password'],
		device_id: da['deviceId'],
		device: da['device'],	
		ip_address: da['ipAddress'],
		session_token: randomString(10)
	});
	user.save( function(error, data){
    		if(error)
    	{
        		res.json({"status": "error", "error": error});
    	}
    	else{
	        res.json({"status": "success", "error":null, "sessionToken": data['session_token']});
	    }
	});
});


app.post('/getDocuments', function(req, res)
{
	var d = JSON.stringify(req.body);
	var da=JSON.parse(d.toString());	
	User.findOne({email_id: da['emailId'],
                  session_token: da['sessionToken']}, function(err, data){
		if (err || data == null) 
		{
			res.json({"status": "error", "error": "No Account Found"});	
		}
		else
		{
			res.json({"status": "success", "error": null, "data": data});
		}
	});
	res.end;
});

app.post('/uploadDocuments', function(req, res)
{
	var d = JSON.stringify(req.body);
	var da=JSON.parse(d.toString());
	User.findOne({email_id: da['emailId'], session_token: da["sessionToken"]}, function(err, data){
		if (err || data == null) 
		{
			console.log("NOT FOUD");
			res.json({"status": "error", "error": "No Account Found"});	
		}
		else
		{
			data['documents'][da['document_id']]['status'] = "notVerifed";	
			var image_url  = '/home/appster/' + da['emailId'] +"_" + da['document_id'];
			if(da['side'] == 'front')
			{	

					console.log(da["document_id"]);
					base64_decode(da['image_src'],image_url+ '_front.jpeg');
					data['documents'][da['document_id']]['front_image_src'] = image_url+ '_front.jpeg';
					if(da['document_id'] == 1)
				   	{
				   		file = verifiedpan(data['documents'][da['document_id']], da["emailId"], "pan");
				   		console.log(file);
				   		fs.readFile("test.txt", function (err, data) {
  								  if(data.toString().indexOf("Yes") >= 0)
  								  {
  										data['documents'][da['document_id']]['status'] = "verifed";			  	
  								  }
								});
				   	}
			}
			else
			{
					base64_decode(da['image_src'], image_url+'_back.jpeg');
					data['documents'][da['document_id']]['back_image_src'] = image_url+ '_back.jpeg';
					if(da['document_id'] == 0)
				   	{
				   		data['documents'][da['document_id']]['status'] = "verifed";	
				   		file = verifiedadhar(data['documents'][da['document_id']], da["emailId"], "aadhar");
				   		console.log(file);

				   	}
			}
			data['documents'][da['document_id']]['image_name'] = da['image_name'];	
			data['documents'][da['document_id']]['status'] = "notVerifed";	
			data['documents'][da['document_id']]['random_generator'] = randomString(10);
			data.save(function(error, data){
			if(error)
   			{
   				res.json({"status": "error", "error": "Invalid douments"});
    		}
    		else
    		{ 			
	       			res.json({"status": "success", "error": null, "sessionToken":data["sessionToken"]});
	   		}
			});
		}
		
	});
	res.end;
});
app.post("/getDetails", function(req, res){

	var d = JSON.stringify(req.body);
	var da=JSON.parse(d.toString());	
	User.findOne({email_id: da['emailId'],
                  session_token: da['sessionToken']}, function(err, data)
    {
		if (err || data == null) 
		{
			res.json({"status": "error", "error": "No Account Found"});	
		}
		else
			{data['onboardingDetails']
			docs = getDocs(data['documents']);
			console.log("asd: " + data['onboardingDetails']);
			res.json({"status": "success", "error": null,
				"poi_dob": data['onboardingDetails']["poi"]["dob"],
				"poi_gender": data['onboardingDetails']["poi"]["gender"],
				"poi_name": data['onboardingDetails']["poi"]["name"],
				"poa_pc": data['onboardingDetails']["poa"]["pc"],
				"poa_state": data['onboardingDetails']["poa"]["state"],
				"poa_sub_dist": data['onboardingDetails']["poa"]["sub_dist"],
				"poa_dist": data['onboardingDetails']["poa"]["dist"],
				"poa_vtc": data['onboardingDetails']["poa"]["vtc"],
				"poa_co": data['onboardingDetails']["poa"]["co"],
				"uid_data": data['onboardingDetails']["uid_data"]
				,
		        "documents": docs});
		}
	});
	res.end;

});

app.post("/getRandomGen", function(req, res){

	var d = JSON.stringify(req.body);
	var da=JSON.parse(d.toString());	
	User.findOne({email_id: da['emailId'],
                  session_token: da['sessionToken']}, function(err, data)
    {
		if (err || data == null) 
		{
			res.json({"status": "error", "error": "No Account Found"});	
		}
		else
		{
			data["documents"][da["document_id"]]["random_generator"] == randomString(10);
			res.json({"status": "error", "error": null, "randomString": data["documents"][da["document_id"]]["random_generator"]});		
		}
	});
	res.end;

});

app.post("/userData", function(req, res){

	var d = JSON.stringify(req.body);
	var da=JSON.parse(d.toString());	
	User.findOne({email_id: da['emailId'],
                  session_token: da['sessionToken']}, function(err, data)
    {
		if (err || data == null) 
		{
			res.json({"status": "error", "error": "No Account Found"});	
		}
		else
		{
			data["documents"][da["document_id"]]["random_generator"] == randomString(10);
			res.json({"status": "error", "error": null, "randomString": data["documents"][da["document_id"]]["random_generator"]});		
		}
	});
	res.end;
});

app.post("/uploadAdharDetails", function(req, res)
{
	console.log('In UOLOAD')
	var d = JSON.stringify(req.body);
	var da=JSON.parse(d.toString());	
	User.findOne({email_id: da['emailId'],
                  session_token: da['sessionToken']}, function(err, data)
    {
		if (err || data == null) 
		{
			res.json({"status": "error", "error": "No Account Found"});	
		}
		else
		{
			data["onboardingDetails"] = {
			 "uid_data" : da["uid"],
			 "poi":{
			 		"name" : da["name"],
			 		"gender": da["gender"],
			 		"dob": da["yob"]
			 	},
			 "poa": {
			 	"co" :  da["co"],
			 	"vtc": da["vtc"],
			 	"dist": da["dist"],
			 	"sub_dist": da["subdist"],
			 	"state": da["state"],
			 	"pc": da["pc"]
			 	}
			 };
			data.save(function(error, data)
			{
				console.log(error);
				console.log(data);
			});
			res.json({"status": "success", "error": null});
		}
	});
	res.end;
});

app.post("/getDoc", function(req, res){
	var d = JSON.stringify(req.body);
	var da=JSON.parse(d.toString());
	User.findOne({email_id: da['emailId']}, function(err, data)
    {
		if (err || data == null) 
		{
			res.json({"status": "error", "error": "No Account Found"});	
		}
		else
		{
			var doc = data["documents"];
			var index = 0;
			for(index = 0 ; index < doc.length; index++)
			{
				if(doc[index]["random_generator"] == da['random'])
				{
					break;
				}
			}
			if(index == doc.length)
				res.json({"status": "error", "error": null, "data": "No Document FOund"});
			else
			{
				doc[index]["back_image_src"] = base64_encoding(doc[index]["back_image_src"]);
				doc[index]["front_image_src"] = base64_encoding(doc[index]["front_image_src"]);
				res.json({"status": "success", "error": null, "data": {"document": doc[index],
																	    "details": data["onboardingDetails"]}});
			}
		}
	});
	res.end;

});

function hashPass(pwd)
{
	return crypto.createHash('sha256').update(pwd).digest('base64');
}
function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

function verifiedadhar(document, emailId, documentType)
{
	   var options = {
  						scriptPath: '/home/jigar.shah/pytesser/',args: [document["back_image_src"], "/home/jigar.shah/"+emailId+"_"+document["document_id"]+".txt", documentType]
	};

	PythonShell.run("image-read-2.py", options, function (err, results) {
  // results is an array consisting of messages collected during execution
  console.log('results: %j', results);
});
	return "/home/jigar.shah/"+emailId+"_"+document["document_id"]+".txt";
}

function verifiedpan(document, emailId, documentType)
{

	var options = {
  						scriptPath: '/home/jigar.shah/pytesser/',args: [document["front_image_src"], "/home/jigar.shah/"+emailId+"_"+document["document_id"]+".txt", documentType]
	};

	PythonShell.run("image-read-2.py", options, function (err, results) {
  
  // results is an array consisting of messages collected during execution
  console.log('results: %j', results);
});
	return "/home/appster/"+emailId+"_"+document["document_id"]+".txt";
}

function getDocs(documents)
{
	docu = [false, false, false, false, false];
	for(var index = 0; index < documents.length; index++)
	{
		if(documents[index] == 'verified')
			docu[index] = true;
	}
	return docu;
}

function base64_decode(base64str,file) {
   var bitmap = new Buffer(base64str,'base64');
   //writing into an image file
   fs.writeFile(file, bitmap);
   //write a text file
    console.log('File created from base64 encoded string');
}
function base64_encoding(fileName)
{
	var base64Image = "";
	fs.readFile(fileName, function(err, original_data)
	{
    	if(err)
    	{
    		return null;
    	}
    	base64Image = new Buffer(original_data, 'binary').toString('base64');
    });
    return base64Image;
	}
app.listen('8000');
	