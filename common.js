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
			downloadFile(site, siteUrl);
		});
		return false;
	} else {
		log.info(site.name + ' - Found existing file while updating: ' + name);
		return true;
	}
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

module.exports.ripSite = function(site) {
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
		log.info(site.name + ' - Starting rip with ripper: ' + ripper.name);
		ripper.rip(site);
	} else {
		log.error(site.name + ' - Could not find valid ripper. Skipping.');
	}
}