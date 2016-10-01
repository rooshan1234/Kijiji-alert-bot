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

var latestCarFile = "latestCarFile.json";
var filePathToLastestCarFile = path.join(__dirname, latestCarFile);

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

	fs.readFile(filePathToLastestCarFile, {encoding : 'utf-8'}, function(err, data) {
		if (err) throw err;
		
		var obj = JSON.parse(data);
		var length = obj.length;

		//make sure the file is not empty
		if(length != 0){
			
			//check the last entry of the file
			var fileTitle = obj[length - 1].title;
			var fileDesc = obj[length - 1].desc;
			var filePrice = obj[length - 1].price;

			beginAdding = false;


				//cycle through and add all the cars to 
				//the bottom of the existing array
				for (var i = MAX_CAR_TO_SEARCH - 1; i >= 0 ; i--){
				console.log ("\n\nFile information: " + fileTitle + fileDesc + filePrice + "\n\n");

				//console.log(i);
				fromKijijiTitle = ads[i].title;
				fromKijijiDesc = ads[i].innerAd.desc;
				fromKijijiPrice = ads[i].innerAd.info.Price;
				//fromKijijiPubDate = ads[0].pubDate;

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
				fromKijijiDesc = fromKijijiDesc.replace(/\$/g, "");
				fromKijijiDesc = fromKijijiDesc.replace(/\'/g, "");

				//fromKijijiPrice = fromKijijiPrice.replace(/ /g, "");
				//fromKijijiPrice = fromKijijiPrice.replace(/\./g, "");
				//fromKijijiPrice = fromKijijiPrice.replace(/\,/g, "");
				//fromKijijiPrice = fromKijijiPrice.replace(/\$/g, "");
				
				console.log("\nKijiji Information: " + fromKijijiTitle + "\ndesc: " + fromKijijiDesc + "\nprice: " + fromKijijiPrice);


				//check if the last entry is already the latest
				//we don't need to update this file if its already the latest car
				if (fromKijijiTitle == fileTitle && fromKijijiDesc == fileDesc && 
					fromKijijiPrice == filePrice){
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

					fs.writeFile (filePathToLastestCarFile, JSON.stringify(obj), function(err) {
						if (err) throw err;
					});
				}
			}
		}

	});
});