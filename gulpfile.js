'use strict'

var $ = require('gulp-load-plugins')()
var browserSync = require('browser-sync')
var del = require('del')
var gulp = require('gulp')
var harp = require('harp')
var reload = browserSync.reload
var wiredep = require('wiredep').stream

/**
 * Wire Bower dependencies to `public/_bower-*` files.
 */
gulp.task('wiredep', function () {
  try {
    // wiredep fails miserably if he can't find `bower_components`
    var fs = require('fs')
    var path = fs.statSync('public/bower_components')
    if (path.isDirectory()) {
      return gulp
        .src(['public/_bower-*'])
        .pipe(wiredep())
        .pipe(gulp.dest('public/'))
    }
  } catch (e) {
    // bah
  }
})

/**
 * Replace bower refs to resources on a CDN.
 */
gulp.task('cdnify', function () {
  return gulp
    .src(['public/_bower-*'])
    .pipe($.googleCdn(require('./bower.json'), {
      cdn: require('jsdelivr-cdn-data')
    }))
    .pipe(gulp.dest('public/'))
})

/**
 * Clean output directories
 */
gulp.task('clean', del.bind(null, ['dist', '.publish'], {dot: true}))

/**
 * Export your site to flat static assets (HTML/CSS/JavaScript)
 */
gulp.task('harp:compile', function (cb) {
  harp.compile(__dirname, 'dist', function () {
    del('dist/bower_components', {
      force: true
    })
    .then(function () {
      // Static asset revisioning appending content hash to assets
      gulp
        .src(['dist/assets/**/*.{js,css}'], {
          base: 'assets'
        })
        .pipe($.rev())
        .pipe(gulp.dest('dist'))
        .pipe($.rev.manifest())
        .pipe(gulp.dest('dist'))
        .on('end', function () {
          return gulp
            .src(['dist/**/*.html'])
            .pipe($.revReplace({
              manifest: gulp.src('./dist/rev-manifest.json')
            }))
            .pipe(gulp.dest('dist/'))
        })
    })
  })
})

/**
 * Serve the site from the `public` directory
 */
gulp.task('serve', ['wiredep'], function () {
  harp.server(__dirname, {
    port: 9000
  }, function () {
    browserSync({
      proxy: 'localhost:9000',
      open: false,
      // Hide the notification. It gets annoying
      notify: {
        styles: ['opacity:0', 'position:absolute']
      }
    })

    gulp.watch(['public/assets/css/**/*.scss'], function () {
      reload('main.css', {stream: true})
    })

    gulp.watch(['public/**/*.{jade,ejs,md,html}'], function () {
      reload()
    })

    gulp.watch(['bower.json'], ['wiredep'])
  })
})

/**
 * Build production files
 */
gulp.task('build', ['clean', 'bump'], function (cb) {
  require('run-sequence')(
    'wiredep',
    ['cdnify'],
    'harp:compile',
    cb
  )
})

/**
 * Default task, running `gulp` will fire up the Harp site,
 * launch BrowserSync & watch files.
 */
gulp.task('default', ['serve'])

/**
 * Bump the app version
 */
gulp.task('bump', function () {
  if (!$.util.env.r) {
    return
  }

  var semver = require('semver')
  var pkg = require('./package.json')
  var version = semver.inc(pkg.version, $.util.env.r)

  gulp
    .src(['./*.json'])
    .pipe(
      $.replace(
        '"version": "' + pkg.version,
        '"version": "' + version
      )
    )
    .pipe(gulp.dest('./'))
})
