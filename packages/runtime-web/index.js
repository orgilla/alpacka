const CopyWebpackPlugin = require('copy-webpack-plugin');
const TemplatePlugin = require('./webpack-template-plugin');

const path = require('path');

module.exports = (
  config,
  {
    isWeb,
    isProd,
    serverMode = 'static',
    appRoot,
    target,
    output,
    template,
    statics = []
  },
  webpack
) => {
  //  config.entry.push('olymp/dom');
  config.resolve.alias.__resourceQuery = path.resolve(appRoot, 'src');

  if (!template) {
    throw new Error(
      'Please provide a template (.js file that exports a html template)'
    );
  }

  if (!Array.isArray(statics)) {
    statics = [statics];
  }

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.ROUTING': `"${
        target === 'node'
          ? 'MEMORY'
          : serverMode === 'serverless' ? 'HASH' : 'BROWSER'
      }"`,
      'process.env.SERVER_MODE': `"${serverMode}"`,
      'process.env.IS_SERVERLESS': `${serverMode === 'serverless'}`,
      'process.env.IS_SSR': `${serverMode === 'ssr'}`,
      'process.env.IS_STATIC': `${serverMode === 'static'}`
    })
  );

  if (isWeb) {
    if (isProd) {
      const last = config.entry[config.entry.length - 1];
      config.entry[config.entry.length - 1] = path.resolve(
        __dirname,
        'offline'
      );
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
            main: ['main.*.js', 'offline.html'],
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
    if (serverMode === 'serverless' || serverMode === 'static') {
      config.plugins.push(
        new TemplatePlugin({
          filename: 'index.html',
          template
        })
      );
    }
    config.plugins.push(
      new CopyWebpackPlugin(
        [path.resolve(__dirname, 'public')].concat(statics).map(context => ({
          // context: path.isAbsolute(dir) ? dir : path.resolve(appRoot, dir),
          context,
          from: '**/*',
          to: output
        }))
      )
    );
  }
  return config;
};
