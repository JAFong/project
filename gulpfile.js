var gulp = require('gulp');

var gutil = require('gulp-util');
var bower = require('bower');

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var jshint = require('gulp-jshint');
var karma = require('karma').server;
// var karma = require('gulp-karma-runner');

var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');

var rename = require('gulp-rename');
var sh = require('shelljs');
var shell = require('gulp-shell');

var notify = require('gulp-notify');
var jsdoc = require("gulp-jsdoc");
var protractor = require("gulp-protractor").protractor;
// var watch = require('gulp-watch');

var paths = {
  sass: ['./scss/**/*.scss'],
  js: ['./www/js/**/*.js']
};

gulp.task('jsdoc', function() {
  gulp.src(["./www/js/**/*.js", "README.md"])
    .pipe(jsdoc('./docs'));
});

gulp.task('karma', function(done) {
  karma.start({
      configFile: __dirname + '/www/spec/karma.conf.js',
      singleRun: true
    }, function(exitStatus) {
      //0 represents all tests passing
      done(exitStatus || 0);
    });
});

gulp.task('jshint', function(done) {
  gulp.src('./www/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .on('error', notify.onError(function(error) {
      return error.message;
    }));
  gulp.start();

});

gulp.task('protractor', shell.task([
  'protractor www/spec/protractor.config.js'
]));

gulp.task('build', function() {
  gulp.src('./www/js/**/*.js')
    .pipe(concat('concat.js'))
    .pipe(gulp.dest('www/build'))
    .pipe(rename('uglify.js'))
    .pipe(uglify())
    .pipe(gulp.dest('www/build'));
});

gulp.task('serveLab', shell.task([
  'ionic serve --lab'
]));

gulp.task('deploy', shell.task([
  'ionic upload'
]));

gulp.task('test', ['jshint', 'karma', 'protractor']);

gulp.task('dev', ['test']);

gulp.task('prod', ['build', 'test', 'deploy']);

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['dev']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});