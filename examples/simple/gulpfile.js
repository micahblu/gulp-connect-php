var gulp = require('gulp'),
    connect = require('../../index.js');

gulp.task('connect', function() {
    connect.server({}, function(){
    	// connected
    });
});

gulp.task('default', ['connect']);
