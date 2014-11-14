# gulp-connect-php

> Start a [PHP-server](http://php.net/manual/en/features.commandline.webserver.php)

This is pretty much a gulp version of [@sindresorhus's](https://github.com/sindresorhus) [grunt-php] (https://github.com/sindresorhus/grunt-php) and acts as a drop-in replacement for [gulp-connect](https://github.com/gruntjs/grunt-contrib-connect). Useful for running tests on PHP projects.

Uses the built-in server in PHP 5.4.0+.

## Install

```sh
$ npm install --save-dev gulp-connect-php
```

## Usage

```js
var gulp = require('gulp'),
    connect = require('gulp-connect-php');

gulp.task('connect', function() {
	connect.server();
});

gulp.task('default', ['connect']);
```

## Examples

#### Use it with gulp.watch

```js
var gulp = require('gulp'),
    connect = require('gulp-connect-php');

gulp.task('connect', function() {
	connect.server();
});

gulp.task('php', function(){
  gulp.src('./*.php')
	.pipe(connect.reload());
});

gulp.task('watch', function(){
	gulp.watch(['./*.php'], ['php']);
});

```

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

### keepalive

Type: `boolean`  
Default: `true`

Keep the server alive indefinitely.

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

## License

MIT © [Micah Blu](http://micahblu.com)
