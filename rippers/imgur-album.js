var config  = require('../config').rip.imgur.album,
    common  = require('../common'),
    log     = require('../log'),
    request = require('request');

var regex = /^https?:\/\/(?:(?:i|www)\.)?imgur\.com\/(?:a|gallery)\/([A-Za-z0-9]{5})/;

module.exports.name = 'imgur - Album';
module.exports.url = regex;
module.exports.authority = 3;

module.exports.rip = function(site) {
	var url = site.url.replace('gallery', 'a');

	log.info(site.name + ' - Requesting album page: ' + url);
	request(url, function(error, response, html) {
		if (!error && response.statusCode == 200) {
			var parsedJSON, analytics = null;
			eval('parsedJSON = (' + /Imgur\.Album\.getInstance\(([\s\S]+?)\);/.exec(html)[1] + ')');

			var i = 1;
			parsedJSON.images.items.forEach(function(image) {
				var imagePath = image.hash + image.ext;
				common.downloadFileTo(
					site, 
					'http://i.imgur.com/' + imagePath, 
					(config.ordered ? i + ' - ' : '') + imagePath
				);
				i++;				
			});
		} else {
			log.warn(site.name + ' - Page scrape failed due to HTTP error. Retrying in ' + config.retryDelay + ' seconds.');
			setTimeout(function() { module.exports.rip(site); }, config.retryDelay * 1000);
		}
	});
}