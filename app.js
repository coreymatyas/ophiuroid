var config = require('./config'),
    log    = require('./log'),
    common = require('./common');

/*
 TODO:
  - Add some example sites.
  - Add an easy way to do a one-off rip.
 */

config.sites.forEach(function (site) {
	common.ripSite(site);
});