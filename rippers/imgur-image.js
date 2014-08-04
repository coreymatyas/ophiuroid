var common = require('../common'),
    http   = require('http'),
    mime   = require('mime');

var regex = /^https?:\/\/(?:(?:i|www)\.)?imgur\.com\/([A-Za-z0-9]{7}|[A-Za-z0-9]{5})(\.(?:png|gif|jpg|jpeg|apng|tif|tiff))?/;

module.exports.name = 'imgur - Image';
module.exports.url = regex;
module.exports.authority = 2;

module.exports.rip = function(site) {
	var groups = regex.exec(site.url);

	if (groups[2] == undefined) {
		var request = http.request({ 
				method: 'HEAD', 
				host: 'i.imgur.com', 
				port: 80, 
				path: '/' + groups[1] + '.png' 
			}, 
			function(res) {
				common.downloadFile(site, 'http://i.imgur.com/' + groups[1] 
					+ ('content-type' in res.headers ? '.' + mime.extension(res.headers['content-type']) : '.png'));
			});
		request.end();
	} else {
		common.downloadFile(site, 'http://i.imgur.com/' + groups[1] + groups[2]);
	}
}