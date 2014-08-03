var config  = require('./config'),
    log     = require('./log');

/*
 TODO:
  - Add some example sites.
 */

rippers = Array();

require('fs').readdirSync(__dirname + '/rippers/').forEach(function(file) {
	log.debug('[Ripper Autoload] Found file: ' + file);

	if (file.match(/^.+\.js$/) !== null && file !== 'index.js') {
		ripper = require('./rippers/' + file);
		log.debug('[Ripper Autoload] Adding ripper: ' + ripper.name);
		rippers.push(ripper);
	}
});

config.sites.forEach(function (site) {
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
			log.info(site.name + ' - Starting scrape with ripper: ' + ripper.name);
			ripper.rip(site);
		} else {
			log.error(site.name + ' - Could not find valid ripper. Skipping.');
		}
	} else {
		log.info(site.name + ' - Site is disabled. Skipping.')
	}
});