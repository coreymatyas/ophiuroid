var winston = require('winston'),
    fs      = require('fs'),
    config  = require('./config');

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({ level: config.log.consoleLevel }),
	],
	exitOnError: false
});

if (config.log.dir !== null) {
	if (!fs.existsSync(config.log.dir)) {
		fs.mkdir(config.log.dir);	
	}

	var timestamp = new Date().toISOString().replace(/[T\-:]/g, '').replace(/\..+/, '');	
	logger.add(winston.transports.File, { 
		filename: config.log.dir + timestamp + '.log',
		level: config.log.fileLevel
	});
}

module.exports = logger;