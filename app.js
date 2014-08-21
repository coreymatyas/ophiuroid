var config = require('./config'),
    log    = require('./log'),
    common = require('./common');

/*
 TODO:
  - Implement resuming when initial downloads are interrupted.
  - Proxy support.
  - Summarize new files with 'update'
  - New Ripper Ideas:
    - Reddit
    - Instagram
    - SoundCloud
    - YouTube
    - Coursera
 */

if (process.argv.length === 3) {
	var url = require('url').parse(process.argv[2]);
	common.ripSite({ name: url.host, url: url.href, action: 'refresh' });
} else {
	config.sites.forEach(function (site) {
		common.ripSite(site);
	});
}