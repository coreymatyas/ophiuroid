var fs      = require('fs'),
    http    = require('http'),
    https   = require('https'),
    url     = require('url'),
    request = require('request'),
    config  = require('./config'),
    log     = require('./log');

if (!fs.existsSync(config.baseDir)) {
	log.info('Creating base save directory: ' + config.baseDir);
	fs.mkdirSync(config.baseDir);
}

downloaded = {};

// download file at given url
// returns true if it would be a duplicate file
module.exports.downloadFileTo = function (site, siteUrl, filename) {
	var name = decodeURIComponent(url.parse(siteUrl).pathname.split('/').slice(-1).pop()).replace(/\+/g, ' ');
	var basePath = 'save' in site ? site.save : config.baseDir + site.name;
	var path = basePath + '/' + (filename != null ? filename : name);
	var duplicate = false;

	// Initialize save directory if does not exist
	if (!fs.existsSync(basePath)) {
		log.info(site.name + ' - Creating save directory: ' + basePath);
		fs.mkdirSync(basePath);
	}
	
	if (!(basePath in downloaded)) {
		downloaded[basePath] = [];
	}

	var i = 0, tempPath = path;
	while (fs.existsSync(tempPath)) {
		tempPath = path + '.' + i;
		i++;
	}
	if (path != tempPath && downloaded[basePath].indexOf(path) === -1) {
		duplicate = true;
	} else {
		path = tempPath;
	}
	
	if (site.action == 'refresh' || (site.action == 'update' && !duplicate)) {
		log.info(site.name + ' - Saving file: ' + name + ' to ' + path);
		var protocol = url.parse(siteUrl).protocol == 'https:' ? https : http;
		protocol.get(siteUrl, function(res) {
			res.pipe(fs.createWriteStream(path));	
			downloaded[basePath].push(path);
		}).on('error', function(e) {
			log.error(site.name + ' - Download file error. Retrying: ' + e.message);
			module.exports.downloadFileTo(site, siteUrl, filename);
		});
		return false;
	} else {
		log.info(site.name + ' - Found existing file while updating: ' + name);
		return true;
	}
}

module.exports.downloadFile = function (site, siteUrl) {
	return module.exports.downloadFileTo(site, siteUrl, null);
}

rippers = Array();

require('fs').readdirSync(__dirname + '/rippers/').forEach(function(file) {
	log.debug('[Ripper Autoload] Found file: ' + file);

	if (file.match(/^.+\.js$/) !== null && file !== 'index.js') {
		ripper = require('./rippers/' + file);
		log.debug('[Ripper Autoload] Adding ripper: ' + ripper.name);
		rippers.push(ripper);
	}
});

module.exports.ripSite = function (site) {
	if (site.action != 'disabled') {
		var ripper = null, authority = -1;
		rippers.forEach(function (item) {
			if (item.url.test(site.url)) {
				log.debug(site.name + ' - Found matching ripper: ' + item.name);
				if (item.authority > authority) {
					ripper = item;
					authority = item.authority;
					log.debug(site.name + ' - Choosing ripper: ' + item.name);
				}
			}
		});

		if (ripper !== null) {
			log.debug(site.name + ' - Starting rip with ripper: ' + ripper.name);
			ripper.rip(site);
		} else {
			log.error(site.name + ' - Could not find valid ripper. Skipping.');
		}
	} else {
		log.info(site.name + ' - Site is disabled. Skipping.')
	}
}

module.exports.ripURL = function (site, url) {
	module.exports.ripSite({ name: site.name, url: url, action: site.action });
}

getPages = {};

module.exports.getPage = function (site, url, retryDelay, retryMax, callback) {
	retryDelay = retryDelay === null ? config.retryDelay : retryDelay;
	retryMax   = retryMax   === null ? config.retryMax   : retryMax;
	getPages[url] = url in getPages ? getPages[url] + 1 : 1;

	if (getPages[url] <= retryMax) {
		log.info(site.name + ' - Requesting page: ' + url);
		request(url, function(error, response, html) {
			if (!error && response.statusCode == 200) {
				callback(html);
			} else {
				log.warn(site.name + ' - Getting page errored. Retrying in ' + retryDelay + ' seconds.');
				setTimeout(function() { 
					module.exports.getPage(site, url, retryDelay, retryMax, callback); 
				}, retryDelay * 1000);
			}
		});
	} else {
		log.error(site.name + ' - Exceeded retryMax attempting to get: ' + url);
	}
}