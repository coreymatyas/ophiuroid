var config  = require('../config').rip.blogger,
    common  = require('../common'),
    log     = require('../log'),
    cheerio = require('cheerio');

/*
 TODO:
  - Manipulate max-results GET parameter for faster scraping.
  - Be able to save post text / more post information.
  - Group images by post for multi-image posts
 */

module.exports.name = 'Blogger';
module.exports.url = /^https?:\/\/([a-zA-Z\d-]+\.){0,}blogspot\.com/;
module.exports.authority = 1;

function scrapePage (site, url) {
	common.getPage(site, url, config.retryDelay, config.retryMax, function(html) {
		var $ = cheerio.load(html);

		var finished = false;
		$('div.separator a:has(img)').each(function(i, element) {
			finished = common.downloadFile(site, $(this).attr('href'));
		});

		if (!finished) {
			var nextPage = $('#Blog1_blog-pager-older-link');
			if (nextPage.length) {
				setTimeout(function() { scrapePage(site, nextPage.attr('href')) }, config.pageDelay * 1000);
			} else {
				log.info(site.name + ' - No next page link found. Finished scrape.');
			}
		} else {
			log.info(site.name + ' - Finishing scrape.');
		}
	});
}

module.exports.rip = function(site) {
	scrapePage(site, site.url);
}