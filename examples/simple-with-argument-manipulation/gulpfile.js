/* jshint esversion: 6, node: true */
'use strict';

const gulp = require('gulp'),
  connect = require('../../index.js');

gulp.task('connect', function _gulp_connect_task() {
  connect.server({
    configCallback: function _configCallback(type, collection) {
      // If you wish to leave one of the argument types alone, simply return the passed in collection.
      if (type === connect.OPTIONS_SPAWN_OBJ) { // As the constant suggests, collection is an Object.

        // Lets add a custom env var. Good for injecting AWS_RDS config variables.
        collection.env = Object.assign({
          MY_CUSTOM_ENV_VAR: "env_var_value"
        }, process.env);

        return collection;
      } else if (type === connect.OPTIONS_PHP_CLI_ARR) { // As the constant suggests, collection is an Array.
        let newArgs = [
          '-e',                     // Generate extended information for debugger/profiler.
          '-d', 'memory_limit=2G'   // Define INI entry, Up memory limit to 2G.
        ];

        // Ensure our argument switches appear before the rest.
        return newArgs.concat(collection);
      }
    }
  }, function _connected_callback() {
    console.log("PHP Development Server Connected.");
  });
});

gulp.task('default', ['connect']);
