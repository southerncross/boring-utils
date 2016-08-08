/* eslint-disable no-undef */
/* eslint-disable no-var */

var webpack = require('webpack');
var path = require('path');

module.exports = {
  devtool: '#cheap-module-eval-source-map',
  stats: 'error-only',

  entry: [
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://localhost:8080',
    path.join(__dirname, 'src/index.js'),
  ],

  output: {
    filename: 'boring-utils.js',
    path: path.join(__dirname, 'javascripts/'),
  },

  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015', 'stage-2', 'react'],
      },
      include: path.join(__dirname, 'src'),
    }, {
      test: /\.styl$/,
      loader: 'style!css?sourceMap!stylus?resolve',
    }, {
      test: /\.(jpg|png|gif|eot|svg|ttf|woff|otf)/,
      loader: 'url',
      query: {
        limit: 100000,
        name: '[name].[ext]?[hash:7]',
      },
    }],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
};
