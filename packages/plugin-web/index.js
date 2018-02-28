const CopyWebpackPlugin = require('copy-webpack-plugin');
const TemplatePlugin = require('./webpack-template-plugin');

const path = require('path');

module.exports = (args = {}) => (config, props) => {
  const { template, offline, history } = args;
  const { isProd, target, output, webpack, filename } = props;
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

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.HISTORY': `"${history}"`
    })
  );

  if (isProd && (offline === true || target === 'web')) {
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
        responseStrategy: 'network-first',
        // externals: ['https://cdn.polyfill.io/v2/polyfill.min.js?callback=POLY'],
        autoUpdate: 1000 * 60 * 1,
        caches: {
          main: [`${filename}.*.js`, 'offline.html'],
          additional: [':externals:'],
          optional: ['*.js']
        },
        updateStrategy: 'all',
        ServiceWorker: {
          events: true,
          navigateFallbackURL: '/offline.html'
        },
        AppCache: false
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
      template
    })
  );
  return config;
};
