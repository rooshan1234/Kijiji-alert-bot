var kijiji = require ("kijiji-scraper");
var fs = require ("fs");
var path = require ("path");

var MAX_CARS_TO_SEND = 4;

var latestCarFile = "latestCarFile.json";
var filePathToLastestCarFile = path.join(__dirname, latestCarFile);


fs.readFile(filePathToLastestCarFile, {encoding : 'utf-8'}, function(err, data) {
		if (err) throw err;
		
		var obj = JSON.parse(data);
		var length = obj.length;

	});

