var common  = require('../common'),
    log     = require('../log');

module.exports.name = 'General';
module.exports.url = /\.(?:png|gif|jpg|jpeg|apng|tif|tiff|pdf|bmp|swf|webm)$/;
module.exports.authority = 0;

module.exports.rip = function(site) {
	common.downloadFile(site, site.url);
}