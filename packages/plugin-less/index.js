const { resolve } = require('path');

module.exports = args => (config, options) => {
  const { modifyVars } = args;
  const { isProd, isDev, target, cache } = options;
  config.resolveLoader.modules.push(resolve(__dirname, 'node_modules'));

  const isWeb = target === 'web' || target === 'electron-renderer';

  if (isWeb && isProd) {
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: config.output.filename.replace('.js', '.css'),
        chunkFilename: config.output.chunkFilename.replace('.js', '.css')
      })
    );
    config.module.rules.push({
      test: /\.(less|css)$/,
      use: [
        MiniCssExtractPlugin.loader,
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
          options: { modifyVars, javascriptEnabled: true }
        }
      ]
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
