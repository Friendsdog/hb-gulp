'use strict';

// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/

import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import swPrecache from 'sw-precache';
import gulpLoadPlugins from 'gulp-load-plugins';
import harp from 'harp';
// import {output as pagespeed} from 'psi';
import pkg from './package.json';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;


// Lint JavaScript
gulp.task('jshint', () =>
  gulp.src(['public/scripts/**/*.js', 'gulpfile.babel.js'])
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')))
);


// Optimize images
gulp.task('images', () =>
  gulp.src('public/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({ title: 'images' }))
);


// Copy all files at the root level (public)
gulp.task('copy', () =>
  gulp.src([
    '.tmp/*.json',
    // 'public/*',
    // '!public/**/_*',
    // '!public/**/*.{html,jade}',
    // '!public/images',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({ title: 'copy' }))
);


// Copy web fonts to dist
gulp.task('fonts', () =>
  gulp.src(['public/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({ title: 'fonts' }))
);


// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    'public/styles/**/*.scss',
    'public/styles/**/*.css'
  ])
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))

    // Concatenate and minify styles
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/styles'))
    .pipe($.size({ title: 'styles' }));
});


// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
// to disable ES2015 support, uncomment the line `"only": "gulpfile.babel.js",`
// in the `.babelrc` file.
gulp.task('scripts', () =>
  gulp.src([
    'public/scripts/**/*.js',
    'public/styles/**/*.js'
  ])
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe($.concat('main.min.js'))
    .pipe($.uglify())

    // Output files
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts'))
    .pipe($.size({ title: 'scripts' }))
);


// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  const assets = $.useref.assets({ searchPath: '{.tmp}' });

  return gulp.src(['.tmp/**/*.html'])
    .pipe(assets)

    // Remove unused CSS
    .pipe($.if('*.css', $.uncss({
      html: ['.tmp/**/*.html'],
      ignore: [
      ]
    })))

    // Concatenate and minify styles
    .pipe($.if('*.css', $.minifyCss()))
    .pipe(assets.restore())
    .pipe($.useref())

    // Minify any HTML
    .pipe($.if('*.html', $.minifyHtml()))

    // Output files
    .pipe(gulp.dest('dist'))
    .pipe($.size({ title: 'html' }));
});


// Clean output directory
gulp.task('clean', cb => del([
  '.tmp', 'dist/*', '!dist/.git'
], {dot: true}, cb));


// Watch files for changes & reload (prefer our task over harp's)
gulp.task('serve', ['scripts', 'styles'], () => {
  del('.tmp/**/*.html');

  harp.server('.', { port: 9000 }, () => {
    browserSync({
      // This is annoying!
      open: false,
      notify: false,
      // Run as an https by uncommenting 'https: true'
      // Note: this uses an unsigned certificate which on first access
      //       will present a certificate warning in the browser.
      // https: true,
      proxy: 'localhost:9000',
      serveStatic: ['.tmp']
    });

    gulp.watch(['public/**/*.{jade,html}'], reload);
    gulp.watch(['public/fonts/**/*'], reload);
    gulp.watch(['public/images/**/*'], reload);
    gulp.watch(['public/scripts/**/*.js'], ['jshint', 'scripts']);
    gulp.watch(['public/styles/**/*.{scss,css}'], ['styles', reload]);
  });
});


// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () =>
  browserSync({
    // This is annoying!
    open: false,
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist'
  })
);


//
gulp.task('harp', cb =>
  harp.compile('.', path.resolve('.tmp'), err => {
    if (err) {
      cb(err);
    }

    cb();
  })
);


// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    'styles',
    'harp',
    ['jshint', 'html', 'scripts', 'images', 'fonts', 'copy'],
    'generate-service-worker',
    cb
  )
);


// Run PageSpeed Insights
// gulp.task('pagespeed', cb =>
//   // Update the below URL to the public URL of your site
//   pagespeed('example.com', {
//     strategy: 'mobile'
//     // By default we use the PageSpeed Insights free (no API key) tier.
//     // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
//     // key: 'YOUR_API_KEY'
//   }, cb)
// );


// See http://www.html5rocks.com/en/tutorials/service-worker/introduction/ for
// an in-depth explanation of what service workers are and why you should care.
// Generate a service worker file that will provide offline functionality for
// local resources. This should only be done for the 'dist' directory, to allow
// live reload to work as expected when serving from the 'public' directory.
gulp.task('generate-service-worker', cb => {
  const rootDir = 'dist';

  swPrecache({
    // Used to avoid cache conflicts when serving on localhost.
    cacheId: pkg.name || 'web-starter-kit',
    staticFileGlobs: [
      // Add/remove glob patterns to match your directory setup.
      `${rootDir}/fonts/**/*.woff`,
      `${rootDir}/images/**/*`,
      `${rootDir}/scripts/**/*.js`,
      `${rootDir}/styles/**/*.css`,
      `${rootDir}/*.{html,json}`
    ],
    // Translates a static file path to the relative URL that it's served from.
    stripPrefix: path.join(rootDir, path.sep)
  }, (err, swFileContents) => {
    if (err) {
      cb(err);
      return;
    }

    const filepath = path.join(rootDir, 'service-worker.js');

    fs.writeFile(filepath, swFileContents, err => {
      if (err) {
        cb(err);
        return;
      }

      cb();
    });
  });
});

// Load custom tasks from the `tasks` directory
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }
