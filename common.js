var fs      = require('fs'),
    request = require('request'),
    config  = require('./config'),
    log     = require('./log');

if (!fs.existsSync(config.baseDir)) {
	log.info('Creating base save directory: ' + config.baseDir);
	fs.mkdirSync(config.baseDir);
}

module.exports.downloadFile = function downloadFile (site, url) {
	var name = require('url').parse(url).pathname.split('/').slice(-1).pop();
	var basePath = config.baseDir + site.name;
	var path = basePath + '/' + name;
	var duplicate = false;

	// Initialize save directory if does not exist
	if (!fs.existsSync(basePath)) {
		log.info(site.name + ' - Creating save directory: ' + basePath);
		fs.mkdirSync(basePath);
	}
	
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
		log.info(site.name + ' - Saving file: ' + name + ' to ' + path);
		request(url).pipe(fs.createWriteStream(path));
		return false;
	} else {
		log.info(site.name + ' - Found existing file while updating: ' + name);
		return true;
	}
}