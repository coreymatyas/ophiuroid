var common    = require("../common"),
    logger    = require("../log"),
    config    = require("../config").rip.gfycat,
    request   = require("request");

var regex = /^https?:\/\/(?:www\.)?gfycat\.com\/(.+)/;

module.exports.name = "Gfycat";
module.exports.url = regex;
module.exports.authority = 1;

module.exports.rip = function(site) {
	var groups = regex.exec(site.url);

	request("http://gfycat.com/cajax/get/"+groups[1], function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var formats = config.formats;
			var response = JSON.parse(body);
			for (var format in formats) {
				if (formats[format] == true) {
					common.downloadFile(site, response["gfyItem"][format+"Url"]);
				}
			}
			return true;
		}
		else {
			return false;
		}
	});
}
