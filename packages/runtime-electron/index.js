const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const ElectronPlugin = require('./webpack-electron-plugin');

module.exports = (
  config,
  { isElectron, isDev, isElectronMain, isElectronRenderer, appRoot }
) => {
  // LimitChunkCount on all but production-web
  if (isElectron) {
    // webpack plugins
    if (isElectronMain) {
      config.plugins.push(
        new GenerateJsonPlugin('package.json', require('./package-json')())
      );
      if (isDev) {
        // const ElectronPlugin = require('electron-webpack-plugin');
        config.plugins.push(
          new ElectronPlugin({
            test: /^.\/main/,
            path: path.resolve(appRoot, '.dev', 'electron')
          })
        );
      }
    } else if (isElectronRenderer) {
      // config.resolve.alias.superagent = 'superagent/superagent';
      // config.resolve.alias['cross-fetch/polyfill'] =  'cross-fetch/dist/browser-polyfill';
      config.plugins.push(
        new HtmlWebpackPlugin({
          alwaysWriteToDisk: true,
          filename: 'index.html',
          template: path.resolve(
            process.cwd(),
            'node_modules',
            'olymp',
            'templates',
            'electron.js'
          ),
          inject: false
          /* minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        }, */
        })
      );
    }
  }

  return config;
};
