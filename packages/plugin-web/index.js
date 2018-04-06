const CopyWebpackPlugin = require('copy-webpack-plugin');
const TemplatePlugin = require('./webpack-template-plugin');

const path = require('path');

module.exports = (args = {}) => (config, props) => {
  const { template, offline } = args;
  const { isProd, target, output } = props;
  let statics = args.statics || [];
  //  config.entry.push('olymp/dom');
  if (!Array.isArray(statics)) {
    statics = [statics];
  }
  if (!template) {
    throw new Error(
      'Please provide a template (.js file that exports a html template)'
    );
  }

  if (isProd && offline !== false && target === 'web') {
    const last = config.entry[config.entry.length - 1];
    config.entry[config.entry.length - 1] = path.resolve(__dirname, 'offline');
    config.entry.push(last);
    const OfflinePlugin = require('offline-plugin');
    config.plugins.push(
      new TemplatePlugin({
        filename: 'offline.html',
        template
      })
    );
    config.plugins.push(
      new OfflinePlugin({
        relativePaths: false,
        publicPath: '/',
        responseStrategy: 'network-first',
        // externals: ['https://cdn.polyfill.io/v2/polyfill.min.js?callback=POLY'],
        autoUpdate: 1000 * 60 * 1,
        caches: {
          main: ['*.js', '*.css'],
          additional: [':externals:'],
          optional: [':rest:']
        },
        externals: ['/', '/offline.html'],
        updateStrategy: 'all',
        ServiceWorker: {
          // (node:18281) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): Error: webpack.optimize.UglifyJsPlugin has been removed, please use config.optim
          minify: false,
          events: true,
          navigateFallbackURL: '/'
        },
        AppCache: {
          events: true,
          FALLBACK: { '/': '/offline.html' }
        }
      })
    );
  }

  config.plugins.push(
    new CopyWebpackPlugin(
      statics.map(context => ({
        // context: path.isAbsolute(dir) ? dir : path.resolve(appRoot, dir),
        context,
        from: '**/*',
        to: output
      }))
    )
  );

  config.plugins.push(
    new TemplatePlugin({
      filename: 'index.html',
      publicPath: config.output.publicPath,
      template
    })
  );
  return config;
};
