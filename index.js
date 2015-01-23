'use strict';
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
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

	var closeServer = function (cb) {
		var child = exec('lsof -i :8000',
		  function (error, stdout, stderr) {
		    //console.log('stdout: ' + stdout);
		    //console.log('stderr: ' + stderr);
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }

		    // get pid then kill it
		    var pid = stdout.match(/php\s+?([0-9]+)/)[1];
		    if (pid) {
		    	exec('kill ' + pid, function (error, stdout, stderr) {
		    		//console.log('stdout: ' + stdout);
		   			//console.log('stderr: ' + stderr);
		    		cb();
		    	});
		    } else {
		    	cb({error: "couldn't find process id and kill it"});
		    }
		});
	};

	var server = function (options, cb){
		if (!cb) {
			cb = function(){};
		}
	
		options = extend({
			port: 8000,
			hostname: '127.0.0.1',
			base: '.',
			keepalive: false,
			open: false,
			bin: 'php',
			root: '/'
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
				if (options.open) {
					open('http://' + host + options.root);
				}
				cb();
			}.bind(this));
		}.bind(this));
	};
	return {
		server: server,
		closeServer: closeServer
	}
})();