'use strict';
var spawn = require('child_process').spawn;
var http = require('http');
var open = require('opn');
var binVersionCheck = require('bin-version-check');

module.exports = (function () {
	var checkServerTries = 0;

	function checkServer(hostname, port, cb) {
		setTimeout(function () {
			http.request({
				method: 'HEAD',
				hostname: hostname,
				port: port
			}, function (res) {
				var statusCodeType = Number(res.statusCode.toString()[0]);

				if ([2, 3, 4].indexOf(statusCodeType) !== -1) {
					return cb();
				} else if (statusCodeType === 5) {
					console.log(
						'Server docroot returned 500-level response. Please check ' +
						'your configuration for possible errors.'
					);
					return cb();
				}

				checkServer(hostname, port, cb);
			}).on('error', function (err) {
				// back off after 1s
				if (++checkServerTries > 20) {
					console.log('PHP server not started. Retrying...');
					return cb();
				}
				checkServer(hostname, port, cb);
			}).end();
		}, 50);
	}

	function extend(obj /* , ...source */) {
	  for (var i = 1; i < arguments.length; i++) {
	    for (var key in arguments[i]) {
	      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
	         obj[key] = arguments[i][key];
	         obj[key] = (typeof arguments[i][key] === 'object' && arguments[i][key] ? extend(obj[key], arguments[i][key]) : arguments[i][key]);
	      }
	    }
	  }
	  return obj;
	}

	var server = function (options){
		var cb = function(){};

		options = extend({
			port: 8000,
			hostname: '127.0.0.1',
			base: '.',
			keepalive: true,
			open: false,
			bin: 'php'
		}, options);

		var host = options.hostname + ':' + options.port;
		var args = ['-S', host];

		if (options.ini) {
			args.push('-c', options.ini);
		}

		if (options.router) {
			args.push(options.router);
		}

		binVersionCheck(options.bin, '>=5.4', function (err) {
			if (err) {
				cb();
				return;
			}
			var cp = spawn(options.bin, args, {
				cwd: options.base,
				stdio: 'inherit'
			});

			// check when the server is ready. tried doing it by listening
			// to the child process `data` event, but it's not triggered...
			checkServer(options.hostname, options.port, function () {
				if (!options.keepalive) {
					cb();
				}

				if (options.open) {
					open('http://' + host);
				}
			}.bind(this));
		}.bind(this));
	};
	return {
		server: server
	}
})();