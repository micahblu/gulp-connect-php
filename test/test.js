require("mocha");
var request = require("supertest"),
    assert = require("assert"),
    connect = require("../index.js");

describe('gulp-connect-php', function () {
	it('Should start a basic php server', function (done) {
		connect.server({}, function() {
      request('http://127.0.0.1:8000')
      .get('/test/fixtures/hello.php')
      .expect(/hello world/)
      .expect(200)
      .end(function (err, res) {
        connect.closeServer(function (){
          done();
        });
        if (err) return done(err);
      });
    });
	});

  it('Should start a basic php server, with a set environment variable and updated memory limits set via the configCallback option', function (done) {
    connect.server({
      configCallback: function _configCallback(type, collection) {
        if (type === connect.OPTIONS_SPAWN_OBJ) {
          collection.env = Object.assign({
            TEST_ENV_VAR: "SET_OK"
          }, process.env);

          return collection;
        } else if (type === connect.OPTIONS_PHP_CLI_ARR) {
          var newArgs = [
            '-d', 'memory_limit=2.1G'
          ];
          return newArgs.concat(collection);
        }
      }
    }, function() {
      request('http://127.0.0.1:8000')
        .get('/test/fixtures/config-cb-checker.php')
        .expect(/ENVVAR=SET_OK,MEM_LIMIT=2\.1G;/)
        .expect(200)
        .end(function (err, res) {
          connect.closeServer(function (){
            done();
          });
          if (err) return done(err);
        });
    });
  });
});
