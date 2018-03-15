const { resolve } = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = args => (config, options) => {
  const { modifyVars } = args;
  const { isProd, isDev, target, cache } = options;
  config.resolveLoader.modules.push(resolve(__dirname, 'node_modules'));

  const isWeb = target === 'web' || target === 'electron-renderer';

  if (isWeb && isProd) {
    config.plugins.push(
      new ExtractTextPlugin({
        allChunks: true,
        filename: config.output.filename.replace('.js', '.css')
      })
    );
    config.module.rules.push({
      test: /\.(less|css)$/,
      loader: ExtractTextPlugin.extract({
        use: [
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: resolve(cache, `less`)
            }
          },
          {
            loader: 'css-loader',
            options: { modules: false }
          },
          {
            loader: 'less-loader',
            options: { modifyVars }
          }
        ],
        fallback: 'style-loader'
      })
    });
  } else if (isWeb) {
    config.module.rules.push({
      test: /\.(less|css)$/,
      use: [
        {
          loader: 'cache-loader',
          options: {
            cacheDirectory: resolve(cache, 'less')
          }
        },
        {
          loader: 'style-loader',
          options: { insertAt: 'top', hmr: isDev }
        },
        {
          loader: 'css-loader',
          options: { modules: false, sourceMap: true }
        },
        {
          loader: 'less-loader',
          options: { modifyVars, sourceMap: true, javascriptEnabled: true }
        }
      ]
    });
  } else {
    config.module.rules.push({
      test: /\.(less|css)$/,
      loader: 'ignore-loader'
    });
  }

  return config;
};
