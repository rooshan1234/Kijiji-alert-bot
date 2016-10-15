var kijiji = require ("kijiji-scraper");
var fs = require ("fs");
var path = require ("path");

var MAX_CARS_TO_SEND = 4;

var carBuffer  = "carBuffer.json";
var carBufferFile = path.join(__dirname, carBuffer);


fs.readFile(carBufferFile, {encoding : 'utf-8'}, function(err, data) {
		if (err) throw err;
		
		var obj = JSON.parse(data);
		var length = obj.length;

		var carsToEmails = MAX_CARS_TO_SEND;
		if (length < MAX_CARS_TO_SEND){
			carsToEmails = length;
		}

		console.log ("We are going to send: " + carsToEmails + " cars\n");
		obj.splice(0,carsToEmails);

		console.log(obj);

		fs.writeFile (carBufferFile, JSON.stringify(obj), function(err) {
			if (err) throw err;
		});

	});


