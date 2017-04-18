/* jshint esversion: 6, node: true */
'use strict';

const gulp = require('gulp'),
  connect = require('../../index.js');

gulp.task('connect', function () {
  connect.server({}, function () {
    // connected
  });
});

gulp.task('default', ['connect']);
