/* eslint-disable no-undef */
/* eslint-disable no-var */

var path = require('path')
var gulp = require('gulp')
var runSequence = require('run-sequence')
var gutil = require('gulp-util')
var webpack = require('webpack')
var del = require('del')
var WebpackDevServer = require('webpack-dev-server')

var PATH = {
  SRC: path.join(__dirname, './src'),
  DIST: path.join(__dirname, './dist'),
}

gulp.task('clean', function() {
  return del(path.join(PATH.DIST, './**/*'))
})

gulp.task('build:compile', function(callback) {
  webpack(require('./webpack.prod.config'), function(err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack', err)
    }
    gutil.log('[webpack]', stats.toString({ colors: true }))
    callback()
  })
})

gulp.task('build:del', function() {
  return del([
    path.join(PATH.SRC, './javascripts/boring-utils.js'),
    path.join(PATH.SRC, './stylesheets/boring-utils.css'),
  ])
})

gulp.task('build', function(callback) {
  runSequence(
    'build:compile',
    'build:del',
    callback
  )
})

gulp.task('dev', function(callback) {
  var compiler = webpack(require('./webpack.dev.config'), function(err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack', err)
    }
    gutil.log('[webpack]', stats.toString({ colors: true }))
  })

  new WebpackDevServer(compiler, {
    noInfo: true,
    stats: 'error-only',
    publicPath: '/javascripts/',
  })
  .listen(8080, 'localhost', function(err) {
    if (err) {
      throw new gutil.PluginError('webpack-dev-server', err)
    }
    gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html')
    callback()
  })
})

gulp.task('build', function(callback) {
  runSequence(
    'clean',
    'build',
    callback
  )
})
