const { resolve } = require('path');
const babel = require('./config');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = (config, options) => {
  const {
    isProd,
    isWeb,
    isDev,
    isNode,
    appRoot,
    target,
    folder,
    transform
  } = options;
  if (isProd && isWeb) {
    console.log(
      'MANGLE = FALSE, https://github.com/graphql/graphql-js/issues/1182'
    );

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
  const babelOptions = babel({ isDev, transform });

  if (isProd) {
    // babelOptions.plugins.push('graphql-tag');
  }

  if (!isNode && isDev) {
    babelOptions.plugins.push('extract-hoc/babel');
    babelOptions.plugins.push('react-hot-loader/babel');
  }

  if (isDev) {
    config.module.rules.push({
      test: /\.js$/,
      use: [
        {
          loader: 'cache-loader',
          options: {
            cacheDirectory: resolve(appRoot, folder, 'cache', `${target}-babel`)
          }
        },
        {
          loader: 'babel-loader',
          options: babelOptions
        }
      ],
      include: [
        // path.resolve(appRoot, 'server'),
        // path.resolve(olympRoot, 'graphql'),
        resolve(appRoot, 'src')
      ]
    });
  } else {
    config.module.rules.push({
      test: /\.js$/,
      use: [
        {
          loader: 'cache-loader',
          options: {
            cacheDirectory: resolve(appRoot, folder, 'cache', `${target}-babel`)
          }
        },
        {
          loader: 'babel-loader',
          options: babelOptions
        }
      ],
      include: [
        // path.resolve(appRoot, 'server'),
        // path.resolve(olympRoot, 'graphql'),
        resolve(appRoot, 'src')
      ]
    });
  }

  return config;
};
