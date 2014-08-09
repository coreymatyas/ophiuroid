var config = require('./config'),
    log    = require('./log'),
    common = require('./common');

/*
 TODO:
  - Implement resuming when initial downloads are interrupted.
  - Add an easy way to do a one-off rip.
  - Proxy support.
 */

config.sites.forEach(function (site) {
	common.ripSite(site);
});