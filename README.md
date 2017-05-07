# gulp-connect-php

***REQUIRES NODE 5.0.0 OR GREATER***

> Start a [PHP-server](http://php.net/manual/en/features.commandline.webserver.php)

This is pretty much a gulp version of [@sindresorhus's](https://github.com/sindresorhus) [grunt-php](https://github.com/sindresorhus/grunt-php) and acts as a _basic version_ drop-in replacement for [gulp-connect](https://www.npmjs.com/package/gulp-connect), though please note not all features from gulp-connect are supported with gulp-connect-php. I am open to supporting other features and pull requests that implement them.

Uses the built-in server in PHP 5.4.0+.

## Install

```sh
$ npm install --save-dev gulp-connect-php
```

## Usage

### As a Singleton
```js
var gulp = require('gulp'),
    connect = require('gulp-connect-php');

gulp.task('connect', function() {
	connect.server();
});

gulp.task('default', ['connect']);
```

### As an Instance
```js
var gulp = require('gulp'),
    connect = require('gulp-connect-php');

let server = new connect();

gulp.task('connect', function() {
	server.server();
});
gulp.task('disconnect', function() {
	server.closeServer();
});

gulp.task('default', ['connect', 'disconnect']);
```

## Examples

### Use it with Browser Sync

```js
var gulp = require('gulp'),
    connect = require('gulp-connect-php'),
    browserSync = require('browser-sync');

gulp.task('connect-sync', function() {
  connect.server({}, function (){
    browserSync({
      proxy: '127.0.0.1:8000'
    });
  });

  gulp.watch('**/*.php').on('change', function () {
    browserSync.reload();
  });
});
```

### Advanced Option Manipulation

```js
gulp.task('connect', function() {
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

gulp.task('disconnect', function() {
	connect.closeServer();
});

gulp.task('default', ['connect', 'disconnect']);
```

### Windows (via Batch file)

Windows Batch file execution via a `%PATH%` specified batchfile is possible, but some considerations are required.

1. The batch file must be on your `%PATH%` and executable with permissions of the invoker.
2. You must pass the parameter set off to the PHP process.
3. We have no -real- way of detecting an error state at this point.
4. You must use the 'Advanced Option Maniulation' scheme and set the `shell` option on `spawn(...)`.

#### Scenario

- PHP is located at `C:\Users\mainuser\Applications\PHP\7.0.17-NTS-VC14\php.exe`.
- The batch file is located at `C:\Users\mainuser\MyProject\strap\php.bat`.
- I have set `%PATH%` manually to `C:\Users\mainuser\MyProject\strap\;%PATH%`.

#### Contents of php.bat

```batch
@echo off

REM We specify the whole path to PHP since the working directory is that of gulp...
REM unless we also changed that in our gulp callback.

C:\Users\mainuser\Applications\PHP\7.0.17-NTS-VC14\php.exe %*
```

#### Contents of our gulp task
```js
gulp.task('connect', function _gulp_connect_task() {
  connect.server({
    configCallback: function _configCallback(type, collection) {
      if (type === connect.OPTIONS_SPAWN_OBJ) {
        // Windows Batch files are NOT executable on their own. This will start a shell
        // session then execute.
        collection.shell = true;
        return collection;
      }
    }
  }, function _connected_callback() {
    console.log("PHP Development Server Connected.");
  });
});

gulp.task('default', ['connect']);
````

## Options

### port

Type: `number`  
Default: `8000`

The port on which you want to access the webserver. Task will fail if the port is already in use.

### hostname

Type: `string`  
Default: `'127.0.0.1'` *(usually same as `localhost`)*

The hostname the webserver will use.

Use `0.0.0.0` if you want it to be accessible from the outside.

### base

Type: `string`  
Default: `'.'`

From which folder the webserver will be served. Defaults to the directory of the gulpfile.

### open

Type: `boolean`  
Default: `false`

Open the server in the browser when the task is triggered.

### router

Type: `string`  

Optionally specify the path to a [router script](http://php.net/manual/en/features.commandline.webserver.php#example-380) that is run at the start of each HTTP request. If this script returns `false`, then the requested resource is returned as-is. Otherwise the script's output is returned to the browser.

Example router script:

```php
<?php
// router.php
if (preg_match('/\.(?:png|jpg|jpeg|gif)$/', $_SERVER["REQUEST_URI"])) {
	return false;    // serve the requested resource as-is
} else {
	echo "<p>Thanks for using gulp-connect-php :)</p>";
}
?>
```

### bin

Type: `string`  
Default: `'php'`

Path to the PHP binary. Useful if you have multiple versions of PHP installed.

### ini

Type: `string`  
Default: Built-in `php.ini`

Path to a custom [`php.ini`](http://php.net/manual/en/ini.php) config file.

### stdio

Type: `string`  
Default: `'inherit'`

Node's [stdio parameter](https://nodejs.org/api/child_process.html#child_process_options_stdio), set it to `'ignore'` to suppress all the logging into console of the php server process.

### configCallback

Type: `function (type, collection) : collection`  

Prototype:

  - `type` - String, either `OPTIONS_SPAWN_OBJ` or `OPTIONS_PHP_CLI_ARR`.
  - `collection` - Array or Object, the initial version of the collection specified by `type`.

     Return: Optionally modified version of `collection`.

Default: `'null'` (Which is replaced with a no-op call that returns an unmodified version of the `collection` parameter)

Allows the caller to modify the `spawn` [options](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) object and or the [PHP command line arguments](http://php.net/manual/en/features.commandline.options.php) (array) before the [PHP development server](http://php.net/manual/en/features.commandline.webserver.php) is invoked.

### debug

Type: `boolean`
Default: `'false'`

Enables debugging of the spawn call and its parameters.

## License

MIT © [Micah Blu](http://micahblu.net)
