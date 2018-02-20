const { resolve } = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (config, options) => {
  const { isProd, isWeb, isNode, isDev, appRoot, folder, target } = options;
  const modifyVars = Object.assign(
    {},
    {
      'menu-collapsed-width': '64px',
      'font-family-no-number':
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
      'font-family':
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
      'font-size-base': '15px',
      'primary-color': '#8e44ad',
    },
    options.modifyVars || {}
  );
  if (isWeb && isProd) {
    config.plugins.push(
      new ExtractTextPlugin({
        allChunks: true,
        filename: isProd ? '[name].[hash].css' : '[name].css',
      })
    );
    config.module.rules.push({
      test: /\.(less|css)$/,
      loader: ExtractTextPlugin.extract({
        use: [
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: resolve(
                appRoot,
                folder,
                'cache',
                `${target}-less`
              ),
            },
          },
          {
            loader: 'css-loader',
            options: { modules: false },
          },
          {
            loader: 'less-loader',
            options: { modifyVars },
          },
        ],
        fallback: 'style-loader',
      }),
    });
  } else if (isWeb) {
    config.module.rules.push({
      test: /\.(less|css)$/,
      use: [
        {
          loader: 'cache-loader',
          options: {
            cacheDirectory: resolve(appRoot, folder, 'cache', `${target}-less`),
          },
        },
        {
          loader: 'style-loader',
          options: { insertAt: 'top', hmr: isDev },
        },
        {
          loader: 'css-loader',
          options: { modules: false, sourceMap: true },
        },
        {
          loader: 'less-loader',
          options: { modifyVars, sourceMap: true },
        },
      ],
    });
  } else if (isNode) {
    config.module.rules.push({
      test: /\.(less|css)$/,
      loader: 'ignore-loader',
    });
  }

  return config;
};
