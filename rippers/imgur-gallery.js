var config  = require('../config').rip.imgur.gallery,
    common  = require('../common'),
    log     = require('../log'),
    cheerio = require('cheerio');
    
module.exports.name = 'imgur - Gallery';
module.exports.url = /^https?:\/\/([a-zA-Z\d-]+\.){0,}imgur\.com\/?(?:gallery)?/;
module.exports.authority = 1;

module.exports.rip = function(site) {
	for (var i = 0; i < config.distance; i++) {
		common.getPage(site, 'http://imgur.com/gallery/hot/viral/page/0/hit?scrolled&set=' + i, config.retryDelay, null, function(html) {
			var $ = cheerio.load(html);

			$('div.post').each(function(i, element) {
				var isAlbum = $(element).find('.post-info').html().lastIndexOf('album', 0) === 0;
				var hash = $(element).find('.image-list-link').attr('href').split('/')[2];

				common.ripSite({ 
					name: site.name + (isAlbum ? '/' + hash : ''), 
					url: 'http://imgur.com/' + (isAlbum ? 'a/' : '') + hash,
					action: site.action
				});		
			});
		});
	}
}