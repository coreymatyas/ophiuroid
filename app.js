var request  = require('request'),
    cheerio  = require('cheerio'),
    http     = require('http'),
    fs       = require('fs'),
    config   = require('./config');

/*
 TODO:
  - Manipulate max-results GET parameter for faster scraping.
  - Be able to save post text / more post information.
  - Handle legitimate duplicate filenames better.
  - More control over save location.
  - Exception handling for web errors.
  - Add some example sites.
  - Move logger to its own module.
  - Modularize different site scrapers.
 */

function log(site, text) {
	console.log(site.name + ': ' + text);
}

module.exports.log = log;

function downloadFile (site, url) {
	var name = require('url').parse(url).pathname.split('/').slice(-1).pop();
	var path = config.baseDir + site.name + '/' + name;
	var duplicate = false;
	
	var i = 0, tempPath = path;
	while (fs.existsSync(tempPath)) {
		tempPath = path + '.' + i;
		i++;
	}
	if (path != tempPath) {
		duplicate = true;
	}
	path = tempPath;
	
	if (site.action == 'refresh' || (site.action == 'update' && !duplicate)) {
		var file = fs.createWriteStream(path);
		log(site, 'Saving file: ' + name + ' to ' + path);
		http.get(url, function(response) {
			response.pipe(file);
		});
		return false;
	} else {
		log(site, 'Found existing file while updating: ' + name);
		return true;
	}
}

function scrapePage (site, url) {
	log(site, 'Requesting next page: ' + url);
	request(url, function(error, response, html) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html);

			var finished = false;
			$('div.separator a:has(img)').each(function(i, element) {
				finished = downloadFile(site, $(this).attr('href'));
			});

			if (!finished) {
				var nextPage = $('#Blog1_blog-pager-older-link');
				if (nextPage.length) {
					setTimeout(function() { scrapePage(site, nextPage.attr('href')) }, config.blogger.pageDelay * 1000);
				} else {
					log(site, 'No next page link found. Finished scrape.');
				}
			} else {
				log(site, 'Finishing scrape.');
			}
		} else {
			log(site, 'Page scrape failed due to HTTP error. Retrying in ' + config.blogger.retryDelay + ' seconds...');
			setTimeout(function() { scrapePage(site, url); }, config.blogger.retryDelay * 1000);
		}
	});
}

if (!fs.existsSync(config.baseDir)) {
	fs.mkdir(config.baseDir);
}

config.sites.forEach(function (item) {
	if (item.action != 'disabled') {
		path = config.baseDir + item.name;
		if (!fs.existsSync(path)) {
			log(item, 'Creating save directory: ' + path);
			fs.mkdir(path);
		}

		log(item, 'Starting scrape...');
		scrapePage(item, item.url);
	} else {
		log(item, 'Site is disabled. Skipping...')
	}
});