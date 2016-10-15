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
	"transmission" : 1,
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

	/*fromKijijiPrice = fromKijijiPrice.replace(/ /g, "");
	fromKijijiPrice = fromKijijiPrice.replace(/\./g, "");
	fromKijijiPrice = fromKijijiPrice.replace(/\,/g, "");
	fromKijijiPrice = fromKijijiPrice.replace(/\$/g, "");*/

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

				fs.readFile(carBufferFile, {encoding : 'utf-8'}, function(err, bufferdata) {
					var carBufferDataObj = JSON.parse(bufferdata);
					var carBufferDataLength = carBufferDataObj.length;
					
					console.log("CAR BUFFER LENGTH IS: " + carBufferDataLength);

					if (carBufferDataLength != 0){
						console.log("updated car buffer....")

						var carBufferTitle = carBufferDataObj[carBufferDataLength - 1].title;
						var carBufferDesc = carBufferDataObj[carBufferDataLength - 1].desc;
						var carBufferPrice = carBufferDataObj[carBufferDataLength - 1].price;

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

							if (beginAdding && ads[0].title != carBufferDataObj[carBufferDataLength-1].title 
								&& ads[0].innerAd.desc!= carBufferDataObj[carBufferDataLength-1].desc 
									&& ads[0].innerAd.info.Price != carBufferDataObj[carBufferDataLength-1].price){

								//create new object and push it to the file
								var temp = new Object();
								temp['title'] = fromKijijiTitle;
								temp['desc'] = fromKijijiDesc;
								temp['price'] = fromKijijiPrice;

								carBufferDataObj.push(temp);

								fs.writeFile (carBufferFile, JSON.stringify(carBufferDataObj), function(err) {
									if (err) throw err;
								});
							}
						}
					}else{
						console.log("buffer empty, adding the latest car...")
						
						//we are just going to add the latest car if the buffer is empty
						beginAdding = true;
						var temp = new Object();

							temp['title'] = ads[0].title;
							temp['desc'] = ads[0].innerAd.desc;
							temp['price'] = ads[0].innerAd.info.Price;

							carBufferDataObj.push(temp);

							fs.writeFile (carBufferFile, JSON.stringify(carBufferDataObj), function(err) {
								if (err) throw err;
							});
					}

					if (beginAdding != true){
					//the car was not found in the 20 parsed, lets just [update to the latest car] and clear 
					//the buffer, we can catch it next time?
					
					console.log ("Car was not found!")
					//clear out car buffer
					fs.writeFile(carBufferFile, JSON.stringify([]), function (err){
						if (err) throw err;
					});

					//add the latest car in
					fs.readFile(carBufferFile, {encoding : 'utf-8'}, function(err, data) {
						
						var carBufferDataObj = JSON.parse(data);

						var temp = new Object();
						temp['title'] = ads[0].title;
						temp['desc'] = ads[0].innerAd.desc;
						temp['price'] = ads[0].innerAd.info.Price;

						carBufferDataObj.push(temp);
					
						fs.writeFile (carBufferFile, JSON.stringify(carBufferDataObj), function(err) {
							if (err) throw err;
						});
					});
					
					}
				});
				
				//[update to the latest car already done here]
				
				//obj.put("title", ads[0].title);
				//obj.put("desc", ads[0].innerAd.desc);
				//obj.put("price", ads[0].innerAd.info.Price);
				
				obj[0].title = ads[0].title;
				obj[0].desc = ads[0].innerAd.desc;
				obj[0].price = ads[0].innerAd.info.Price;

				//finally update the current latest car
				fs.writeFile (currentLatestCarFile, JSON.stringify(obj), function(err) {
					if (err) throw err;
				});
			}else{
				console.log("car already at the latest....");
			}
		}else{
			console.log("current latest car was empty...");
			var temp = new Object();

				temp['title'] = ads[0].title;
				temp['desc'] = ads[0].innerAd.desc;
				temp['price'] = ads[0].innerAd.info.Price;

				obj.push(temp);

				//finally update the current latest car
				fs.writeFile (currentLatestCarFile, JSON.stringify(obj), function(err) {
					if (err) throw err;
				});
		}
	});
});