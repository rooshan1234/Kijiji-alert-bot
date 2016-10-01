var kijiji = require ("kijiji-scraper");
var fs = require ("fs");
var path = require ("path");

var MAX_CAR_TO_SEARCH = 20;

var beginAdding = false;

//matching parameters
var fromKijijiTitle;
var fromKijijiDesc;
var fromKijijiPrice;
var fromKijijiPubDate;

var carBuffer  = "carBuffer.json";
var carBufferFile = path.join(__dirname, carBuffer);

var currentLatestCar = "currentLatestCar.json";
var currentLatestCarFile = path.join(__dirname, currentLatestCar);

var prefs = {
	"locationId" : 1700203,
	"categoryId" : 174
};

var params = {
	"transmission" : 2,
	"for-sale-by" : "ownr"
};

kijiji.query (prefs, params, function (err, ads) {

	fromKijijiTitle = ads[0].title;
	fromKijijiDesc = ads[0].innerAd.desc;
	fromKijijiPrice = ads[0].innerAd.info.Price;
	fromKijijiPubDate = ads[0].pubDate;

	fromKijijiTitle = fromKijijiTitle.replace(/ /g, "");
	fromKijijiTitle = fromKijijiTitle.replace(/\s+/g, "");
	fromKijijiTitle = fromKijijiTitle.replace(/\./g, "");
	fromKijijiTitle = fromKijijiTitle.replace(/\,/g, "");
	fromKijijiTitle = fromKijijiTitle.replace(/\-/g, "");
	fromKijijiTitle = fromKijijiTitle.replace(/\$/g, "");

	fromKijijiDesc = fromKijijiDesc.replace(/ /g, "");
	fromKijijiDesc = fromKijijiDesc.replace(/\s+/g, "");
	fromKijijiDesc = fromKijijiDesc.replace(/\"/g, "");
	fromKijijiDesc = fromKijijiDesc.replace(/\,/g, "");
	fromKijijiDesc = fromKijijiDesc.replace(/\./g, "");
	fromKijijiDesc = fromKijijiDesc.replace(/\!/g, "");
	fromKijijiDesc = fromKijijiDesc.replace(/\-/g, "");
	fromKijijiDesc = fromKijijiDesc.replace(/\*/g, "");
	fromKijijiDesc = fromKijijiDesc.replace(/\$/g, "");
	fromKijijiDesc = fromKijijiDesc.replace(/\'/g, "");

	fromKijijiPrice = fromKijijiPrice.replace(/ /g, "");
	fromKijijiPrice = fromKijijiPrice.replace(/\./g, "");
	fromKijijiPrice = fromKijijiPrice.replace(/\,/g, "");
	fromKijijiPrice = fromKijijiPrice.replace(/\$/g, "");

	console.log("Kijiji Information: " + fromKijijiTitle + "desc: " + fromKijijiDesc + "price: " + fromKijijiPrice);

	fs.readFile(currentLatestCarFile, {encoding : 'utf-8'}, function(err, data) {
		if (err) throw err;
		
		var obj = JSON.parse(data);
		var length = obj.length;

		//make sure the file is not empty
		if(length != 0){
			
			//check the last entry of the file
			var fileTitle = obj[0].title;
			var fileDesc = obj[0].desc;
			var filePrice = obj[0].price;

			//check current latest car, to see if we need to update the buffer
			if (fromKijijiTitle != fileTitle && fromKijijiDesc != fileDesc && 
					fromKijijiPrice != filePrice){
				//if its not the latest, we need to update to the latest car
				//in the car buffer and we need to update the current latest car

				//lets update the current current car buffer
				beginAdding = false;

				fs.readFile(carBufferFile, {encoding : 'utf-8'}, function(err, data) {
					var carBufferDataObj = JSON.parse(data);
					var carBufferDataLength = carBufferDataObj.length;

					var carBufferTitle = carBufferDataObj[0].title;
					var carBufferDesc = carBufferDataObj[0].desc;
					var carBufferPrice = carBufferDataObj[0].price;

					for (var i = MAX_CAR_TO_SEARCH - 1; i >= 0 ; i--){
						fromKijijiTitle = ads[i].title;
						fromKijijiDesc = ads[i].innerAd.desc;
						fromKijijiPrice = ads[i].innerAd.info.Price;

						if (fromKijijiTitle == carBufferTitle && fromKijijiDesc == carBufferDesc && 
							fromKijijiPrice == carBufferPrice){
								beginAdding = true;
								console.log("car found, will start adding cars after this!");
								continue;	
						}

						if (beginAdding && ads[0].title != fileTitle && ads[0].innerAd.desc!= fileDesc && ads[0].innerAd.info.Price != filePrice){

							//create new object and push it to the file
							var temp = new Object();
							temp['title'] = fromKijijiTitle;
							temp['desc'] = fromKijijiDesc;
							temp['price'] = fromKijijiPrice;

							obj.push(temp);

							fs.writeFile (carBufferFile, JSON.stringify(obj), function(err) {
								if (err) throw err;
							});
						}
					}
				});


			}
		}

	});
});