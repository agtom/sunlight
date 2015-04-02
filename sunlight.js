var request = require("request");
var secrets = require("./secrets.json");
var apiKey = secrets["apiKey"];
var url = "https://congress.api.sunlightfoundation.com"
var apikey = "./secrets.json"
var zip = parseInt(process.argv[2]);
var shortTitles = []
var fullNames = []
var twitterIds = []
var coSponsorTwitterIds = []
var bioIds = []
var cosponsorIds = []
var origBillList = []
var idsJoined = bioIds.join("|")
var cosponsorIdsJoined = cosponsorIds.join("|")


// use your zipcode to find all legislators in your zipcode
request(url + "/legislators/locate?zip=" + zip + "&apikey=" + apiKey, function(err,response,body) {
	var legislators = JSON.parse(body);
	// console.log(legislators);
		for(var i = 0; i < legislators.results.length; i++) {
			fullNames.push(legislators.results[i].first_name + " " + legislators.results[i].last_name);
			if(legislators.results[i].twitter_id) {
				twitterIds.push(legislators.results[i].twitter_id);
			}
			bioIds.push(legislators.results[i].bioguide_id);
		}
		// callback ensures the idsJoined is evaluated before it is then used in the seecond request
		bills();
		twitters();
		zipcodeCoSponsors();
	console.log(fullNames);
	console.log(twitterIds);
	console.log(bioIds);
});



var bills = function()
{ request(url + "/bills?sponsor_id__in=" + idsJoined + "&fields=short_title,cosponsor_ids&apikey=" + apiKey, function(err,response,body)
	{
		var sponsoredBills = JSON.parse(body);
		// console.log(sponsoredBills);
			for(var i = 0; i < sponsoredBills.results.length; i++) {
				shortTitles.push(sponsoredBills.results[i].short_title);
					if(sponsoredBills.results[i].cosponsor_ids) {
						cosponsorIds.push(sponsoredBills.results[i].cosponsor_ids);
					}
			}
	});
}

var twitters = function() 
{ request(url + "/legislators?bioguide_id__in="+cosponsorIdsJoined+"&apikey="+apiKey+"&fields=twitter_id,party",function(err,response,body)
	{
		var coSponsors = JSON.parse(body);
		// console.log(coSponsors);
			for(var i = 0; i < coSponsors.results.length; i++) {
				if(coSponsors.results[i].twitter_id != undefined) {
					coSponsorTwitterIds.push(coSponsors.results[i].twitter_id);
				}
			}
			console.log(coSponsorTwitterIds);
	});
}



var zipcodeCoSponsors = function()
{ request(url + "/bills?cosponsor_ids__in="+idsJoined+"&apikey="+apiKey,function(err,response,body)
	{
		var origCoSponsors = JSON.parse(body);
		// console.log(origCoSponsors);
			for(var i = 0; i < origCoSponsors.results.length; i++) {
				if(origCoSponsors.results[i].official_title) {
					origBillList.push(origCoSponsors.results[i].official_title);
				}
			}
			console.log(origBillList);
	});

}


