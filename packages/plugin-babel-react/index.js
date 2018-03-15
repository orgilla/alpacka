const { resolve } = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const babel = require('@alpacka/babel-preset');

module.exports = () => (config, options) => {
  const { isProd, isDev, target, transform, cache } = options;
  config.resolveLoader.modules.push(resolve(__dirname, 'node_modules'));
  if (isProd && target === 'web') {
    // config.plugins.push(new LodashModuleReplacementPlugin()),
    config.plugins.push(
      new UglifyJSPlugin({
        uglifyOptions: {
          ecma: 8,
          compress: {
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false
          },
          mangle: {
            safari10: true
          },
          output: {
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true
          }
        },
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        parallel: true,
        // Enable file caching
        cache: true,
        sourceMap: true
      })
    );
  }

  const plugins = [];
  if (isDev && (target === 'electron-renderer' || target === 'web')) {
    plugins.push('extract-hoc/babel');
    plugins.push('react-hot-loader/babel');
  }

  if (isDev) {
    config.module.rules.push({
      test: /\.js$/,
      use: [
        {
          loader: 'cache-loader',
          options: {
            cacheDirectory: resolve(cache, 'babel')
          }
        },
        {
          loader: 'babel-loader',
          options: {
            presets: [[babel, { transform }]],
            plugins
          }
        }
      ],
      exclude: /node_modules/
    });
  } else {
    config.module.rules.push({
      test: /\.js$/,
      use: [
        {
          loader: 'cache-loader',
          options: {
            cacheDirectory: resolve(cache, 'babel')
          }
        },
        {
          loader: 'babel-loader',
          options: {
            presets: [[babel, { transform }]],
            plugins
          }
        }
      ],
      exclude: /node_modules/
    });
  }

  return config;
};
