var config = require('./config'),
    log    = require('./log'),
    common = require('./common');

/*
 TODO:
  - Add some example sites.
  - Add an easy way to do a one-off rip.
 */

config.sites.forEach(function (site) {
	if (site.action != 'disabled') {
		common.ripSite(site);
	} else {
		log.info(site.name + ' - Site is disabled. Skipping.')
	}
});