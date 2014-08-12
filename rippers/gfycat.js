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

	common.getPage(site, "http://gfycat.com/cajax/get/" + groups[1], config.retryDelay, null, function(html) {
		var formats = config.formats;
		var response = JSON.parse(html);
		for (var format in formats) {
			if (formats[format] == true) {
				common.downloadFile(site, response["gfyItem"][format+"Url"]);
			}
		}
	});
}
