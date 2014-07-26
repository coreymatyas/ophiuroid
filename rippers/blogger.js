var config  = require('../config').rip.blogger,
    common  = require('../common'),
    log     = require('../log'),
    request = require('request'),
    cheerio = require('cheerio');

/*
 TODO:
  - Manipulate max-results GET parameter for faster scraping.
  - Be able to save post text / more post information.
 */

module.exports.name = 'Blogger';
module.exports.url = /^https?:\/\/([a-zA-Z\d-]+\.){0,}blogspot\.com/;
// specificity of regex to site as a whole. 0 -> internet, 1 -> domain, 2-Inf -> subsections
module.exports.authority = 1;

function scrapePage (site, url) {
	log.info(site.name + ' - Requesting next page: ' + url);
	request(url, function(error, response, html) {
		if (!error && response.statusCode == 200) {
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
		} else {
			log.warn(site.name + ' - Page scrape failed due to HTTP error. Retrying in ' + config.retryDelay + ' seconds...');
			setTimeout(function() { scrapePage(site, url); }, config.retryDelay * 1000);
		}
	});
}

module.exports.rip = function(site) {
	scrapePage(site, site.url);
}