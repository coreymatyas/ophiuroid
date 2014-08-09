var config  = require('../config').rip.imgur.gallery,
    common  = require('../common'),
    log     = require('../log'),
    request = require('request');

module.exports.name = 'imgur - Gallery';
module.exports.url = /^https?:\/\/([a-zA-Z\d-]+\.){0,}imgur\.com\/?(?:gallery)?/;
module.exports.authority = 1;

module.exports.rip = function(site) {
	for (var i = 0; i < config.distance; i++) {
		var url = 'http://imgur.com/gallery/hot/viral/page/0/hit?scrolled&set=' + i;

		log.info(site.name + ' - Requesting gallery page #' + i);
		request(url, function(error, response, html) {
			if (!error && response.statusCode == 200) {
				var images = JSON.parse(html.split('\n')[6].substring(1, html.split('\n')[6].length - 9));

				images.forEach(function(image) {
					common.ripSite({ 
						name: site.name + (image.is_album ? '/' + image.hash : ''), 
						url: 'http://imgur.com/' + (image.is_album ? 'a/' : '') + image.hash,
						action: site.action
					});			
				});
			} else {
				log.warn(site.name + ' - Page scrape failed due to HTTP error. Retrying in ' + config.retryDelay + ' seconds.');
				setTimeout(function() { module.exports.rip(site); }, config.retryDelay * 1000);
			}
		});
	}
}