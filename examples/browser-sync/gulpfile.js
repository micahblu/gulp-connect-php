/* jshint esversion: 6, node: true */
'use strict';

const gulp = require('gulp'),
  connect = require('../../index.js'),
  browserSync = require('browser-sync');

gulp.task('connect-sync', function () {
  connect.server({}, function () {
    browserSync({
      proxy: 'localhost:8000'
    });
  });

  gulp.watch('**/*.php').on('change', function () {
    browserSync.reload();
  });
});
