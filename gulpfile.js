var gulp = require('gulp'),
    del = require('del'),
    run = require('gulp-run'),
    less = require('gulp-less'),
    htmlmin = require('gulp-htmlmin'),
    ngTemplates = require('gulp-ng-templates'),
    cssmin = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    karma = require('karma').server,
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    gulpif = require('gulp-if'),
    zip = require('gulp-zip'),
    path = require('path'),
    browserSync = require('browser-sync'),
    pkg = require('./package.json'),
    reload = browserSync.reload;

/**
 * Running Bower
 */
gulp.task('bower', function() {
  run('bower install').exec();
})

/**
 * Cleaning dist/ folder
 */
.task('clean', function(cb) {
  del(['dist/**'], cb);
})

/**
 * Running livereload server
 */
.task('server', function() {
  browserSync({
    server: {
     baseDir: './' 
    }
  });
})

/**
 * Less compilation
 */
.task('less', function() {
  return gulp.src('assets/less/*.less')
  .pipe(less())
  .pipe(concat('style.css'))
  .pipe(gulp.dest('dist'));
})
.task('less:min', function() {
  return gulp.src('assets/less/*.less')
  .pipe(less())
  .pipe(concat('style.css'))
  .pipe(cssmin())
  .pipe(gulp.dest('dist'));
})

/**
 * JSLint/JSHint validation
 */
.task('lint', function() {
  return gulp.src('./app/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
})

/**
 * Karma testing
 */
.task('karma', function(done) {
  karma.start({
    configFile: __dirname + '/config/karma.conf.js',
    singleRun: true
  }, done);
})
.task('karma:watch', function(done) {
  karma.start({
    configFile: __dirname + '/config/karma.conf.js'
  }, done);
})

/** JavaScript compilation */
.task('js', function() {
  return gulp.src(['app/*.js', 'app/templates/*.html'])
  .pipe(gulpif(/\.html$/, htmlmin({ collapseWhitespace: true })))
  .pipe(gulpif(/\.html$/, ngTemplates()))
  .pipe(concat('app.js'))
  .pipe(gulp.dest('dist'));
})
.task('js:min', function() {
  return gulp.src(['app/*.js', 'app/templates/*.html'])
  .pipe(gulpif(/\.html$/, htmlmin({ collapseWhitespace: true })))
  .pipe(gulpif(/\.html$/, ngTemplates()))
  .pipe(uglify({ mangle: false }))
  .pipe(concat('app.js'))
  .pipe(gulp.dest('dist'));
})

/**
 * Compiling resources and serving application
 */
.task('serve', ['bower', 'clean', 'lint', 'karma', 'less', 'js', 'server'], function() {
  return gulp.watch([
    '*.js', 'app/*.js', '*.html', 'assets/**/*.less'
  ], [
   'lint', 'karma', 'less', 'js', browserSync.reload
  ]);
})
.task('serve:minified', ['bower', 'clean', 'lint', 'karma', 'less:min', 'js:min', 'server'], function() {
  return gulp.watch([
    '*.js', 'app/*.js', '*.html', 'assets/**/*.less'
  ], [
   'lint', 'karma', 'less:min', 'js:min', browserSync.reload
  ]);
})

/**
 * Test Driven Development using Karma and JSHint
 */
.task('tdd', ['bower', 'lint'], function() {
  return gulp.watch([
    '*.js', 'app/*.js', '*.html', 'assets/**/*.less'
  ], [
    'lint', 'karma'
  ]);
})

/**
 * Packaging compiled resources
 */
.task('package', ['bower', 'clean', 'lint', 'karma', 'less:min', 'js:min'], function() {
  return gulp.src(['index.html', 'dist/**', 'libs/**'], { base: './' })
  .pipe(zip(pkg.name + '-' + pkg.version + '.zip'))
  .pipe(gulp.dest('dist'));
});