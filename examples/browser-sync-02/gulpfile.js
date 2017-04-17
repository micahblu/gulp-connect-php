/* jshint esversion: 6, node: true */
'use strict';

const gulp = require('gulp'),
  connect = require('../../index.js'),
  browserSync = require('browser-sync');


//task that fires up php server at port 8001
gulp.task('connect', function (callback) {
  connect.server({
    port: 8001
  }, callback);
});


//task that fires up browserSync proxy after connect server has started
gulp.task('browser-sync', ['connect'], function () {
  browserSync({
    proxy: '127.0.0.1:8001',
    port: 8910
  });
});


//default task that runs task browser-sync ones and then watches php files to change. If they change browserSync is reloaded
gulp.task('default', ['browser-sync'], function () {
  gulp.watch(['**/*.php'], browserSync.reload);
});