/* The following JavaScript file was preprocessed from index.js via Babel for support on older Node installations. */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function _gulp_connect_php_module_scoping(OPTIONS_SPAWN_OBJ, OPTIONS_PHP_CLI_ARR) {
  var childProcess = require('child_process');
  var spawn = childProcess.spawn;
  var exec = childProcess.exec;
  var http = require('http');
  var open = require('opn');
  var binVersionCheck = require('bin-version-check');
  var fs = require('fs');

  //let counter = 0;

  function EnumSet() {
    var _this = this;

    [].concat(Array.prototype.slice.call(arguments)).forEach(function (x) {
      _this[x] = Symbol(x);
    });
  }

  var PhpDevelopmentServerConnection = function _PhpDevelopmentServerConnection_private_scope() {
    var Status = new EnumSet('NEW', 'STARTING', 'STARTED', 'FINISHED');

    /**
     * Private: Check wherther the server is running.
     * @param hostname
     * @param port
     * @param cb
     */
    function checkServer(hostname, port, cb) {
      var self = this;
      //console.log(`[${this.counter}] checkServer`);

      if (self.status !== Status.STARTING) return;

      setTimeout(function _checkServer_fire() {
        http.request({
          method: 'HEAD',
          hostname: hostname,
          port: port
        }, function _checkServer_httpCallback(res) {
          var statusCodeType = Number(res.statusCode.toString()[0]);

          if ([2, 3, 4].indexOf(statusCodeType) !== -1) {
            return cb(true);
          } else if (statusCodeType === 5) {
            console.log('Server docroot returned 500-level response. Please check ' + 'your configuration for possible errors.');
            return cb(true);
          }

          checkServer.call(self, hostname, port, cb);
        }).on('error', function _checkServer_httpError(err) {
          // back off after 1s
          if (++self.checkServerTries > 20) {
            console.log('PHP server not started. Retrying...');
            return cb(false);
          }
          checkServer.call(self, hostname, port, cb);
        }).end();
      }, 15);
    }

    /**
     * PHP Development Server Connection Instance
     *
     * {@link http://php.net/manual/en/features.commandline.webserver.php}
     */

    var PhpDevelopmentServerConnection = function () {
      /**
       * Create a new Instance
       * @param opts Default Options. Will be merged with our own internal set of default options. Can be overwridden in the connect ('server') call.
       * @returns {PhpDevelopmentServerConnection}
       */
      function PhpDevelopmentServerConnection(opts) {
        _classCallCheck(this, PhpDevelopmentServerConnection);

        //this.counter = ++counter;
        //console.log(`[${this.counter}] constructor`);

        this.status = Status.NEW;

        this.checkServerTries = 0;

        this.workingPort = 8000;

        this.defaults = Object.assign({
          port: 8000,
          hostname: '127.0.0.1',
          base: '.',
          open: false,
          bin: 'php',
          root: '/',
          stdio: 'inherit',
          configCallback: null,
          debug: false
        }, opts || {});

        return this; // `new` bug
      }

      /**
       * 'Close'/Shutdown the PHP Development Server
       * @param cb Optional single parameter Callback. Parameter is the return (if any) of the node `ChildProcess.kill(...)` call or nothing if not started.
       */


      _createClass(PhpDevelopmentServerConnection, [{
        key: 'closeServer',
        value: function closeServer(cb) {
          cb = cb || function _closeServerCb_noop() {};
          //console.log(`[${this.counter}] closeServer`);
          var self = this;
          if (this.loading) {
            setTimeout(function () {
              return self.closeServer(cb);
            }, 5);
            return;
          }

          if (this.childProcess) {
            cb(this.childProcess.kill('SIGKILL'));
            this.status = Status.FINISHED;
            return;
          }

          cb();
        }

        /**
         * Get the port the server is running on.
         * @returns {number|*} Port number.
         */

      }, {
        key: 'server',


        /**
         * Start the Server
         * @param options Optional Server Options to overwrite the defaults in the CTor.
         * @param cb Optional Callback for Completion. May pass in an error when there is a fault.
         */
        value: function server(options, cb) {
          //console.log(`[${this.counter}] server`);
          cb = cb || function _serverCB_noop() {};

          var self = this;

          if (this.status !== Status.NEW && this.status !== Status.FINISHED) {
            return cb(new Error('You may not start a server that is starting or started.'));
          }

          options = Object.assign({}, this.defaults, options);

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
            spawn = function _debugSpawn(outerSpawn) {
              return function debugSpawnWrapper(file, args, options) {
                console.log('Invoking Spawn with:');
                console.log(file);
                console.log(args);
                console.log(options);

                return outerSpawn(file, args, options);
              };
            }(spawn);
          }

          if (options.configCallback === null || options.configCallback === undefined) {
            options.configCallback = function noOpConfigCallback(type, collection) {
              return collection;
            };
          }

          spawn = function _configCallbackSpawn(outerSpawn) {
            return function configCallbackSpawnWrapper(file, spawnArgs, spawnOptions) {
              return outerSpawn(file, options.configCallback(OPTIONS_PHP_CLI_ARR, spawnArgs) || spawnArgs, options.configCallback(OPTIONS_SPAWN_OBJ, spawnOptions) || spawnOptions);
            };
          }(spawn);

          binVersionCheck('"' + options.bin + '"', '>=5.4', function _binVerCheck(err) {
            if (err) {
              cb(err);
              return;
            }
            var checkPath = function _checkPath() {
              var exists = fs.existsSync(options.base);
              if (exists === true) {
                self.status = Status.STARTING;
                self.childProcess = spawn(options.bin, args, {
                  cwd: '.',
                  stdio: options.stdio
                });
              } else {
                setTimeout(checkPath, 100);
              }
            };
            checkPath();
            // check when the server is ready. tried doing it by listening
            // to the child process `data` event, but it's not triggered...
            checkServer.call(self, options.hostname, options.port, function _server_checkServer() {
              self.status = Status.STARTED;
              if (options.open) {
                open('http://' + host + options.root);
              }
              cb();
            }.bind(this));
          }.bind(this));
        }
      }, {
        key: 'port',
        get: function get() {
          return this.workingPort;
        }
      }]);

      return PhpDevelopmentServerConnection;
    }();

    return PhpDevelopmentServerConnection;
  }();

  module.exports = function _export_scoping() {

    var returnStructure = PhpDevelopmentServerConnection;

    var adopterBinder = function adopterBinder(adopter, inst, method) {
      return adopter[method] = inst[method].bind(inst);
    };

    returnStructure.compat = function _naught_version_compatibility() {
      // This is segregated beacuse in the future around v1.5 we will make it emit a warning.
      // In v2.0 we will gut it completely.
      var inst = new PhpDevelopmentServerConnection();
      inst.OPTIONS_SPAWN_OBJ = OPTIONS_SPAWN_OBJ;
      inst.OPTIONS_PHP_CLI_ARR = OPTIONS_PHP_CLI_ARR;
      return inst;
    }();

    // You cannot actually bind a function to a method directly... so... lets manually bind to get a function that calls the right instance.
    adopterBinder(returnStructure, returnStructure.compat, 'server');
    adopterBinder(returnStructure, returnStructure.compat, 'closeServer');

    returnStructure.OPTIONS_SPAWN_OBJ = OPTIONS_SPAWN_OBJ;
    returnStructure.OPTIONS_PHP_CLI_ARR = OPTIONS_PHP_CLI_ARR;

    return returnStructure;
  }();
})('spawn', 'php_args');

