const electron = require('electron');
const proc = require('child_process');
const { resolve } = require('path');

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');

module.exports = (
  config,
  { isElectron, isDev, isElectronMain, isElectronRenderer, appRoot }
) => {
  // LimitChunkCount on all but production-web
  if (isElectron) {
    config.plugins.push(
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
    );
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
      config.resolve.alias.superagent = 'superagent/superagent';
      config.resolve.alias['cross-fetch/polyfill'] =
        'cross-fetch/dist/browser-polyfill';
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

class ElectronPlugin {
  constructor(options) {
    this.hashIndex = {};
    this.options = options || {};

    if (!this.options.test || !(this.options.test instanceof RegExp)) {
      throw new Error(
        'webpack-electron-plugin: test is required, and must be a RegExp'
      );
    }

    if (!this.options.path || typeof this.options.path !== 'string') {
      throw new Error(
        'webpack-electron-plugin: path is required, and must be a string'
      );
    }

    this.options.path = resolve(this.options.path);

    // defaults
    this.options.args = this.options.args || [];
    this.options.options = this.options.options || {};
    this.options.options.stdio = this.options.options.stdio || 'inherit';
  }

  launch() {
    // if electron is open, kill it
    if (this.child) {
      this.child.kill();
      this.child = null;
    }

    this.child = proc.spawn(
      electron,
      this.options.args.concat(this.options.path),
      this.options.options
    );
  }

  apply(compiler) {
    // when compilation is done
    compiler.plugin('done', stats => {
      let shouldRelaunch = false;
      stats.compilation.modules.forEach(module => {
        if (!module.resource) return true;
        if (!module._cachedSource) return true;

        // get hash
        const hash = module._cachedSource.hash;
        const split = module.id.split('!');
        // get last path in module id
        const id = split[split.length - 1];
        console.log(
          id,
          id.match(this.options.test),
          hash,
          module.resource,
          this.hashIndex
        );
        // if matches regex and hash is different
        if (
          id.match(this.options.test) &&
          this.hashIndex[module.resource] !== hash
        ) {
          console.log('LAUNCH');
          shouldRelaunch = true;
        }

        // update hash in index
        this.hashIndex[module.resource] = hash;
      });

      if (shouldRelaunch) this.launch();
      else this.launch();
    });
  }
}
