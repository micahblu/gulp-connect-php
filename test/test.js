/* jshint esversion: 6, node: true */
'use strict';

require("mocha");

const testJSMain = process.env['GCP_ES6'] ? "../index.js" : "../index-compat.js";

console.log("Testing against primary => ", testJSMain);

const request = require("supertest"),
  connect = require(testJSMain);

/*
 - Anonymous Functions in the Test Suite should have internal names. This makes failure traces easier to read.
 - For Simplicities sake, please avoid 'Arrow'-Functions (Lambda-like Constructs) and Opt for Anonymous Functions...
 Like the first point, this makes failure traces simpler to read.
 - Suites should be grouped by IIFE.
 */

const noop = function _noop() { };
const noopReturn = function _noopReturn(x) { return x; };

describe('gulp-connect-php', function _base_suite1() {

  it('Should start a basic php server', function _test_basic(done) {
    connect.server({port: 8001}, function _basic_serverCallback(error) {
      if (error) throw error;
      request('http://127.0.0.1:8001')
        .get('/test/fixtures/hello.php')
        .expect(/hello world/)
        .expect(200)
        .end(function _basic_endEvent(err, res) {
          if (err) return done(err);
          connect.closeServer(function _basic_closeServer() {
            done();
          });
        });
    });
  });

  it('Should start a set of basic php servers', function _test_multiples(done) {
    let doneCounter = 0;

    const tickDone = function _tickDone(x) {
      ++doneCounter === 2 ? done(x) : noopReturn(x)
    };

    const conn1 = new connect();
    const conn2 = new connect();

    conn1.server({port: 8002}, function _multiples1_serverCallback(error) {
      if (error) throw error;
      request('http://127.0.0.1:8002')
        .get('/test/fixtures/hello.php')
        .expect(/hello world/)
        .expect(200)
        .end(function _multiples1_endEvent(err, res) {
          if (err) return done(err);
          conn1.closeServer(function _multiples1_closeServer() {
            tickDone();
          });
        });
    });

    conn2.server({port: 8003}, function _multiples2_serverCallback(error) {
      if (error) throw error;
      request('http://127.0.0.1:8003')
        .get('/test/fixtures/hello.php')
        .expect(/hello world/)
        .expect(200)
        .end(function _multiples2_endEvent(err, res) {
          if (err) return done(err);
          conn2.closeServer(function _multiples2_closeServer() {
            tickDone();
          });
        });
    });
  });

  it('Should start a basic php server, with a set environment variable and updated memory limits set via the configCallback option', function _test_configCallback(done) {
    connect.server({
      port: 8004,
      configCallback: function _configCallback(type, collection) {
        if (type === connect.OPTIONS_SPAWN_OBJ) {
          collection.env = Object.assign({
            TEST_ENV_VAR: "SET_OK"
          }, process.env);

          return collection;
        } else if (type === connect.OPTIONS_PHP_CLI_ARR) {
          let newArgs = [
            '-d', 'memory_limit=2.1G'
          ];
          return newArgs.concat(collection);
        }
      }
    }, function _configCallback_serverCallback(error) {
      if (error) throw error;
      request('http://127.0.0.1:8004')
        .get('/test/fixtures/config-cb-checker.php')
        .expect(/ENVVAR=SET_OK,MEM_LIMIT=2\.1G;/)
        .expect(200)
        .end(function _configCallback_endEvent(err, res) {
          if (err) return done(err);
          connect.closeServer(function _configCallback_closeServer() {
            done();
          });
        });
    });
  });

  it('Should start a basic php server without a close callback', function _test_basicNoCloseCB(done) {
    connect.server({port: 8005}, function _basicNoCloseCB_serverCallback(error) {
      if (error) throw error;
      request('http://127.0.0.1:8005')
        .get('/test/fixtures/hello.php')
        .expect(/hello world/)
        .expect(200)
        .end(function _basicNoCloseCB_endEvent(err, res) {
          if (err) return done(err);
          connect.closeServer();
          setTimeout(done, 150);
        });
    });
  });

  it('Should start a basic php server, with a set environment variable and updated memory limits set via the configCallback option with null', function _test_configCallback(done) {
    connect.server({
      port: 8006,
      configCallback: function _configCallback(type, collection) {
        if (type === connect.OPTIONS_SPAWN_OBJ) {
          collection.env = Object.assign({
            TEST_ENV_VAR: "SET_OK"
          }, process.env);

          return collection;
        } else if (type === connect.OPTIONS_PHP_CLI_ARR) {
          return null;
        }
      }
    }, function _configCallback_serverCallback(error) {
      if (error) throw error;
      request('http://127.0.0.1:8006')
        .get('/test/fixtures/config-cb-checker.php')
        .expect(/ENVVAR=SET_OK,MEM_LIMIT=2\.1G;/)
        .expect(200)
        .end(function _configCallback_endEvent(err, res) {
          if (err) return done(err);
          connect.closeServer(function _configCallback_closeServer() {
            done();
          });
        });
    });
  });

  it('Should start a basic php server, with a set environment variable and updated memory limits set via the configCallback option with no return', function _test_configCallback(done) {
    connect.server({
      port: 8007,
      configCallback: function _configCallback(type, collection) {
        if (type === connect.OPTIONS_SPAWN_OBJ) {
          collection.env = Object.assign({
            TEST_ENV_VAR: "SET_OK"
          }, process.env);

          return collection;
        }
      }
    }, function _configCallback_serverCallback(error) {
      if (error) throw error;
      request('http://127.0.0.1:8007')
        .get('/test/fixtures/config-cb-checker.php')
        .expect(/ENVVAR=SET_OK,MEM_LIMIT=2\.1G;/)
        .expect(200)
        .end(function _configCallback_endEvent(err, res) {
          if (err) return done(err);
          connect.closeServer(function _configCallback_closeServer() {
            done();
          });
        });
    });
  });
});
