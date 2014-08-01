var fs     = require('fs'),
    http   = require('http'),
    https  = require('https'),
    url    = require('url'),
    config = require('./config'),
    log    = require('./log');

if (!fs.existsSync(config.baseDir)) {
	log.info('Creating base save directory: ' + config.baseDir);
	fs.mkdirSync(config.baseDir);
}

downloaded = {};

// download file at given url
// returns true if it would be a duplicate file
module.exports.downloadFile = function downloadFile (site, siteUrl) {
	var name = url.parse(siteUrl).pathname.split('/').slice(-1).pop();
	var basePath = 'save' in site ? site.save : config.baseDir + site.name;
	var path = basePath + '/' + name;
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
	}
	path = tempPath;
	
	if (site.action == 'refresh' || (site.action == 'update' && !duplicate)) {
		log.info(site.name + ' - Saving file: ' + name + ' to ' + path);
		var protocol = url.parse(siteUrl).protocol == 'https:' ? https : http;
		protocol.get(siteUrl, function(res) {
			res.pipe(fs.createWriteStream(path));	
			downloaded[basePath].push(path);
		}).on('error', function(e) {
			log.error(site.name + ' - Download file error. Retrying: ' + e.message);
			downloadFile(site, siteUrl);
		});
		return false;
	} else {
		log.info(site.name + ' - Found existing file while updating: ' + name);
		return true;
	}
}