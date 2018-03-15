const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const StartServerPlugin = require('start-server-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

module.exports = (
  config,
  {
    isNode,
    isElectron,
    isDev,
    isProd,
    analyze,
    output,
    filename,
    target,
    env = {}
  }
) => {
  config.plugins = [
    new FriendlyErrorsWebpackPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: isDev
    }),
    new webpack.DefinePlugin(
      Object.assign(
        {},
        Object.keys(env).reduce((store, key) => {
          if (env[key] === true || process.env[key]) {
            store[`process.env.${key}`] = JSON.stringify(process.env[key]);
          } else {
            store[`process.env.${key}`] = JSON.stringify(env[key]);
          }
          return store;
        }, {}),
        {
          'process.env.BUILD_ON': `"${new Date()}"`,
          'process.env.NODE_ENV': `"${isProd ? 'production' : 'development'}"`,
          'process.env.IS_NODE': isNode,
          'process.env.IS_ELECTRON': isElectron
        }
      )
    ),
    // new PrepackWebpackPlugin({ }),
    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /de/),
    new ProgressBarPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
    // new CheckerPlugin(),
  ];

  if (isDev) {
    config.plugins.push(new webpack.NamedModulesPlugin());
  }

  if (isNode) {
    config.plugins.push(
      new webpack.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: false
      })
    );
    if (isDev && target === 'node') {
      config.plugins.push(
        new StartServerPlugin({
          name: `${filename}.js`
          // nodeArgs: [`--inspect=${devPort + 1}`], // allow debugging
        })
      );
    }
  }

  // Hot module replacement on dev
  if (isDev) {
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin({ quiet: true })
    );
  }

  if (analyze === true) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
      .BundleAnalyzerPlugin;
    config.plugins.push(
      new BundleAnalyzerPlugin({
        reportFilename: './_report.html',
        analyzerMode: 'static'
        // generateStatsFile: false,
      })
    );
  }

  // LimitChunkCount on all but production-web
  if (target === 'web' && isProd) {
    config.plugins.push(
      new AssetsPlugin({
        filename: 'assets.json',
        path: output
      })
    );
    config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
    if (isProd) {
      config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    }
    // config.plugins.push(new webpack.optimize.LimitChunkCountPlugin({ minChunkSize: 10000 }));
    const file = isProd ? output.chunkFileName : output.filename;
    config.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        name: filename,
        filename: file,
        minChunks: 2,
        async: true,
        children: true
      })
    );
  } else {
    config.plugins.push(
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
    );
  }

  return config;
};
