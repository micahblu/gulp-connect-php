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
});
