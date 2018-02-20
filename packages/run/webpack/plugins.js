const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const StartServerPlugin = require('start-server-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

module.exports = (
  config,
  { isWeb, isNode, isElectron, isDev, port, isProd, isLinked, output, env = {} }
) => {
  config.plugins = [
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
          'process.env.IS_WEB': isWeb,
          'process.env.IS_NODE': isNode,
          'process.env.IS_ELECTRON': isElectron,
          'process.env.PORT': `${port}`
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

  if (isNode && !isElectron) {
    config.plugins.push(
      new webpack.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: false
      })
    );
    if (isDev) {
      config.plugins.push(
        new StartServerPlugin({
          name: 'app.js'
          // nodeArgs: [`--inspect=${devPort + 1}`], // allow debugging
        })
      );
    }
  } else if (!isNode) {
    config.plugins.push(new HtmlWebpackHarddiskPlugin());
  }

  // Hot module replacement on dev
  if (isDev) {
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin({ quiet: true })
    );
  }

  // LimitChunkCount on all but production-web
  if (isNode) {
    config.plugins.push(
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
    );
  } else if (isWeb) {
    config.plugins.push(
      new AssetsPlugin({
        filename: 'assets.json',
        path: output
      })
    );
    config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
    if (isLinked && isProd) {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
        .BundleAnalyzerPlugin;
      config.plugins.push(
        new BundleAnalyzerPlugin({
          reportFilename: './_report.html',
          analyzerMode: 'static'
          // generateStatsFile: false,
        })
      );
    } else if (isProd) {
      config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    }
    // config.plugins.push(new webpack.optimize.LimitChunkCountPlugin({ minChunkSize: 10000 }));
    const filename = isProd ? '[name].[chunkhash].js' : '[name].js';
    config.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        name: 'app',
        filename
        // minChunks: 2,
      })
    );
  }

  return config;
};
