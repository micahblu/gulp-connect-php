/* jshint esversion: 6, node: true */
'use strict';

(function _gulp_php_connect_module_scoping(OPTIONS_SPAWN_OBJ, OPTIONS_PHP_CLI_ARR) {
  const childProcess = require('child_process');
  let spawn = childProcess.spawn;
  const exec = childProcess.exec;
  const http = require('http');
  const open = require('opn');
  const binVersionCheck = require('bin-version-check');
  const fs = require('fs');

  class PhpDevelopmentServerConnection {
    constructor() {
      this.checkServerTries = 0;
      this.workingPort = 8000;
      return this; // `new` bug
    }

    closeServer(cb) {
      if (this.childProcess) {
        cb(this.childProcess.kill('SIGKILL'));
        return;
      }
      cb();
    }


    checkServer(hostname, port, cb) {
      const self = this;
      setTimeout(function () {
        http.request({
          method: 'HEAD',
          hostname: hostname,
          port: port
        }, function (res) {
          const statusCodeType = Number(res.statusCode.toString()[0]);

          if ([2, 3, 4].indexOf(statusCodeType) !== -1) {
            return cb();
          } else if (statusCodeType === 5) {
            console.log(
              'Server docroot returned 500-level response. Please check ' +
              'your configuration for possible errors.'
            );
            return cb();
          }

          //self.checkServer(hostname, port, cb);
        }).on('error', function (err) {
          // back off after 1s
          if (++this.checkServerTries > 20) {
            console.log('PHP server not started. Retrying...');
            return cb();
          }
          //self.checkServer(hostname, port, cb);
        }).end();
      }, 50);
    }

    server(options, cb) {
      if (!cb) {
        cb = function () {
        };
      }

      var self = this;

      options = Object.assign({
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

      this.workingPort = options.port;
      var host = options.hostname + ':' + options.port;
      var args = ['-S', host, '-t', options.base];

      if (options.ini) {
        args.push('-c', options.ini);
      }

      if (options.router) {
        args.push(require('path').resolve(options.router));
      }

      if (options.debug) {
        spawn = function (outerSpawn) {
          return function debugSpawnWrapper(file, args, options) {
            console.log('Invoking Spawn with:');
            console.log(file);
            console.log(args);
            console.log(options);

            return outerSpawn(file, args, options);
          }
        }(spawn);
      }

      if (options.configCallback === null || options.configCallback === undefined) {
        options.configCallback = function noOpConfigCallback(type, collection) {
          return collection;
        }
      }

      spawn = function (outerSpawn) {
        return function configCallbackSpawnWrapper(file, spawnArgs, spawnOptions) {
          return outerSpawn(file, options.configCallback(OPTIONS_PHP_CLI_ARR, spawnArgs), options.configCallback(OPTIONS_SPAWN_OBJ, spawnOptions));
        }
      }(spawn);


      binVersionCheck(options.bin, '>=5.4', function (err) {
        if (err) {
          cb();
          return;
        }
        var checkPath = function () {
          var exists = fs.existsSync(options.base);
          if (exists === true) {
            self.childProcess = spawn(options.bin, args, {
              cwd: '.',
              stdio: options.stdio
            });
          }
          else {
            setTimeout(checkPath, 100);
          }
        };
        checkPath();
        // check when the server is ready. tried doing it by listening
        // to the child process `data` event, but it's not triggered...
        self.checkServer(options.hostname, options.port, function () {
          if (options.open) {
            open('http://' + host + options.root);
          }
          cb();
        }.bind(this));
      }.bind(this));
    };
  }

  module.exports = (function _export_scoping() {

    let returnStructure = PhpDevelopmentServerConnection;

    const adopterBinder = (adopter, inst, method) => adopter[method] = inst[method].bind(inst);

    returnStructure.compat = (function _naught_version_compatibility() {
      // This is segregated beacuse in the future around v1.5 we will make it emit a warning.
      // In v2.0 we will gut it completely.
      const inst = new PhpDevelopmentServerConnection;
      inst.OPTIONS_SPAWN_OBJ = OPTIONS_SPAWN_OBJ;
      inst.OPTIONS_PHP_CLI_ARR = OPTIONS_PHP_CLI_ARR;
      return inst;
    })();

    // You cannot actually bind a function to a method directly... so... lets manually bind to get a function that calls the right instance.
    adopterBinder(returnStructure, returnStructure.compat, 'server');
    adopterBinder(returnStructure, returnStructure.compat, 'closeServer');

    returnStructure.OPTIONS_SPAWN_OBJ = OPTIONS_SPAWN_OBJ;
    returnStructure.OPTIONS_PHP_CLI_ARR = OPTIONS_PHP_CLI_ARR;

    return returnStructure;
  })();
})('spawn', 'php_args');
