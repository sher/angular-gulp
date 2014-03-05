var path      = require('path');
var gulp      = require('gulp');
var gutil     = require('gulp-util');
var changed   = require('gulp-changed');
var gulpif    = require('gulp-if');
var uglify    = require('gulp-uglify');
var jshint    = require('gulp-jshint');
var stylish   = require('jshint-stylish');
var concat    = require('gulp-concat');
var sass      = require('gulp-sass');
var minifycss = require('gulp-minify-css');
var jade      = require('gulp-jade');
var clean     = require('gulp-clean');

var config = {
  envs:     ['development', 'staging', 'production'],
  env:      'development',
  debug:    false,
  version:  null,
  paths:    {},
  tlr:      null
};

// ------------------------------------------------
// - Tasks
// ------------------------------------------------
gulp.task('clean', function () {
  return gulp.src('build/**/*', { read: false })
    .pipe(clean({ force: true }));
});

gulp.task('start', function () {
  setEnv();
  setVersion();
  setPaths();

  gutil.log(gutil.colors.green('------------------------------'));
  gutil.log(gutil.colors.green('-'), '    Env:', gutil.colors.yellow(config.env));
  gutil.log(gutil.colors.green('-'), '  Debug:', gutil.colors.yellow(config.debug));
  gutil.log(gutil.colors.green('-'), 'Version:', gutil.colors.yellow(config.version));
  gutil.log(gutil.colors.green('------------------------------'));
});

gulp.task('index', function () {
  return gulp.src(paths.index)
    .pipe(jade({ pretty: true }))
    .pipe(gulp.dest('build'))
    .pipe(gulpif(config.tlr, livereload(config.tlr)));
});

gulp.task('jade', function () {
  return gulp.src(paths.jade)
    .pipe(changed('build/views', { extension: '.html' }))
    .pipe(jade({ pretty: true }))
    .pipe(gulp.dest('build/views'))
    .pipe(gulpif(config.tlr, livereload(config.tlr)));
});

gulp.task('scripts', function () {
  return gulp.src(paths.scripts)
    .pipe(changed('build/js'))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(concat('scripts.js'))
    .pipe(gulpif(!config.debug, uglify()))
    .pipe(gulp.dest('build/js'))
    .pipe(gulpif(config.tlr, livereload(config.tlr)));
});

gulp.task('sass', function () {
  return gulp.src(paths.sass.main)
    .pipe(sass({ errLogToConsole: true }))
    .pipe(gulpif(!config.debug, minifycss()))
    .pipe(gulp.dest('build/css'))
    .pipe(gulpif(config.tlr, livereload(config.tlr)));
});

gulp.task('libraries', function () {
  return gulp.src(paths.libraries)
    .pipe(concat('libraries.js'))
    .pipe(gulpif(!config.debug, uglify()))
    .pipe(gulp.dest('build/js'));
});

gulp.task('watch', function () {
  startLivereload();
  startExpress();

  gulp.watch(paths.sass.all,  ['sass']);
  gulp.watch(paths.scripts,   ['scripts']);
  gulp.watch(paths.jade,      ['jade']);
  gulp.watch(paths.index,     ['index']);
});

gulp.task('default', ['clean'], function () {
  gulp.start('start', 'watch', 'sass', 'libraries', 'scripts', 'jade', 'index');
});

gulp.task('build', ['clean'], function () {
  gulp.start('start', 'sass', 'libraries', 'scripts', 'jade', 'index');
});

// ------------------------------------------------
// - Helper methods
// ------------------------------------------------
function setEnv() {
  config.env = gutil.env.env || 'development';
  if (config.envs.indexOf(config.env) == -1) config.env = 'development';
  config.debug = undefined === gutil.env.debug ? true : !!(gutil.env.debug);
}

function setVersion() {
  var now = new Date();
  config.version = now.getTime().toString(36);
}

function setPaths() {
  paths = {
    libraries: [
      'src/bower_components/angular/angular.js',
      'src/bower_components/angular-route/angular-route.js',
      'src/bower_components/angular-ui-router/release/angular-ui-router.js',
      'src/bower_components/json3/json3.js',
      'src/bower_components/lodash/dist/lodash.compat.js'
    ],
    scripts: scriptPaths(),
    index: 'src/index.jade',
    jade: 'src/views/**/*.jade',
    sass: {
      main: 'src/styles/main.scss',
      all: 'src/styles/**/*.scss'
    },
    fonts: 'src/bower_components/font-awesome/fonts/*',
    tests: 'test/**/*.js'
  };
}

function scriptPaths() {
  var files = [];
  // main app file, must be loaded first
  files.push('src/scripts/app.js');
  // env specific config file
  files.push('src/scripts/config/' + config.env + '.js');
  // exclude other enviroment config files
  for (var i = 0; i < config.envs.length; i++) {
    if (config.envs[i] !== config.env) {
      files.push('!src/scripts/config/' + config.envs[i] + '.js');
    }
  }
  files.push('src/scripts/**/*.js');
  return files;
}

function startExpress() {
  var express = require('express'),
      app     = express();
  app.use(require('connect-livereload')({ port: 35729 }));
  app.use(express.static(path.join(__dirname, 'build')));
  app.listen(4000);
}

function startLivereload() {
  config.tlr = require('tiny-lr')();
  var port = 35729;
  config.tlr.listen(port, function (err) {
    if (err) throw err.message;
    gutil.log('Live reload server listening on: ' + gutil.colors.magenta(port));
  });
}

function livereload(server) {
  var Transform = require('stream').Transform,
      reload    = new Transform({ objectMode: true });

  reload.changed = function(filePath) {
    gutil.log(gutil.colors.magenta(path.basename(filePath)) + ' was reloaded.');
    server.changed({
      body: {
        files: [filePath]
      }
    });
  };

  reload._transform = function(file, encoding, next) {
    reload.changed(file.path);
    this.push(file);
    next();
  };

  return reload;
};