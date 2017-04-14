'use strict';
var extend = require('util')._extend;
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var http = require('http');
var open = require('opn');
var binVersionCheck = require('bin-version-check');
var fs = require('fs');

module.exports = (function (OPTIONS_SPAWN_OBJ, OPTIONS_PHP_CLI_ARR) {
	var checkServerTries = 0;
	var workingPort = 8000;

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

	var closeServer = function (cb) {
		var child = exec('lsof -i :' + workingPort,
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
			open: false,
			bin: 'php',
			root: '/',
			stdio: 'inherit',
			configCallback: null,
			debug: false
		}, options);

		workingPort = options.port;
		var host = options.hostname + ':' + options.port;
		var args = ['-S', host, '-t', options.base];

		if (options.ini) {
			args.push('-c', options.ini);
		}

		if (options.router) {
			args.push(require('path').resolve(options.router));
		}

		if (options.debug) {
			spawn = function (outerSpawn) { return function debugSpawnWrapper(file, args, options) {
				console.log('Invoking Spawn with:');
				console.log(file);
				console.log(args);
				console.log(options);

				return outerSpawn(file, args, options);
			}}(spawn);
		}

		if (options.configCallback === null || options.configCallback === undefined) {
		  options.configCallback = function noOpConfigCallback(type, collection) { return collection; }
		}

		spawn = function (outerSpawn) { return function configCallbackSpawnWrapper(file, spawnArgs, spawnOptions) {
		  return outerSpawn(file, options.configCallback(OPTIONS_PHP_CLI_ARR, spawnArgs), options.configCallback(OPTIONS_SPAWN_OBJ, spawnOptions));
		}}(spawn);
		
		binVersionCheck(options.bin, '>=5.4', function (err) {
			if (err) {
				cb();
				return;
			}
			var checkPath = function(){
			    var exists = fs.existsSync(options.base);
			    if (exists === true) {
			        spawn(options.bin, args, {
						cwd: '.',
						stdio: options.stdio
					});
			    }
			    else{
				setTimeout(checkPath, 100);
			    }
			};
			checkPath();
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
		closeServer: closeServer,
		OPTIONS_SPAWN_OBJ: OPTIONS_SPAWN_OBJ,
		OPTIONS_PHP_CLI_ARR: OPTIONS_PHP_CLI_ARR
	}
})('spawn', 'php_args');
