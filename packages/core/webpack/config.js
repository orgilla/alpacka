const webpack = require('webpack');
const path = require('path');
const externals = require('./externals');
const entry = require('./entry');
const webpackPlugins = require('./plugins');

const appRoot = process.cwd();

const exists = name => {
  try {
    require.resolve(name);
    return true;
  } catch (e) {
    return false;
  }
};
const resolvePlugin = nameOrFunc => {
  if (
    typeof nameOrFunc === 'string' &&
    exists(`@alpacka/plugin-${nameOrFunc}`)
  ) {
    return require(`@alpacka/plugin-${nameOrFunc}`);
  } else if (typeof nameOrFunc === 'string' && exists(nameOrFunc)) {
    return require(nameOrFunc);
  }
  return nameOrFunc;
};

process.noDeprecation = true;
module.exports = options => {
  const {
    mode = process.env.NODE_ENV,
    alias = {},
    plugins = [],
    paths,
    target,
    filename = 'main'
  } = options;

  const isProd = mode === 'production' || mode === 'test';
  const isDev = !isProd;
  const isElectron = target.indexOf('electron-') === 0;
  const isElectronMain = target === 'electron-main';
  const isElectronRenderer = target === 'electron-renderer';
  const isServer = target === 'node' || target === 'lambda';
  const isWeb = !isServer && target !== 'node' && target !== 'electron-main';
  const isNode = isServer || isElectronMain;
  const folder = isDev ? '.dev' : '.dist';
  const output =
    options.output || path.resolve(appRoot, folder, target.split('-')[0]);
  const cache = options.cache || path.resolve(output, '..', '.cache');

  const isVerbose = true;
  const config = {
    bail: !isDev,
    cache: isDev,
    target,
    // cache: true,
    stats: {
      cached: isVerbose,
      cachedAssets: isVerbose,
      chunks: isVerbose,
      chunkModules: isVerbose,
      colors: true,
      hash: isVerbose,
      modules: isVerbose,
      reasons: isDev,
      timings: true,
      version: isVerbose
    },
    resolve: {
      extensions: ['.js', '.less'],
      modules: [
        path.resolve(appRoot, 'node_modules'),
        path.resolve(appRoot, '..', '..', 'node_modules')
      ],
      /* modules: [
        path.resolve(appRoot, 'node_modules'),
        path.resolve(appRoot, 'app'),
      ], */
      alias: Object.assign(
        {},
        {
          __app__: path.resolve(__dirname, '..', 'noop'),
          __server__: path.resolve(__dirname, '..', 'noop'),
          __electron__: path.resolve(__dirname, '..', 'noop'),
          __root__: appRoot
        },
        alias
      )
    },
    resolveLoader: {
      modules: [
        path.resolve(appRoot, 'node_modules'),
        path.resolve(appRoot, '..', '..', 'node_modules')
      ]
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          loader: 'file-loader?name=[name].[ext]'
        },
        {
          test: /\.(jpg|jpeg|png|gif|eot|ttf|woff|woff2|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 20000
          }
        },
        {
          test: /\.(txt|md|pug)$/,
          loader: 'raw-loader'
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.flow$/,
          loader: 'ignore-loader'
        }
      ]
    },
    output: {
      publicPath: '/',
      path: output
    },
    entry: {}
  };

  // inline-source-map for web-dev
  config.devtool = isProd
    ? 'cheap-module-source-map'
    : 'cheap-module-source-map';

  // target && node settings
  if (isNode) {
    config.watch = isDev;
    config.node = {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false
    };
    config.output.libraryTarget = 'commonjs2';
  } else {
    config.node = {
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      __dirname: true,
      __filename: true
    };
  }

  // inline-source-map for web-dev
  if (isProd && target === 'web') {
    config.output.filename = '[name].[chunkhash].js';
    config.output.chunkFilename = '[name].[chunkhash].js';
  } else {
    config.output.filename = '[name].js';
    config.output.chunkFilename = '[name].js';
  }

  const args = Object.assign({}, options, {
    webpack,
    chain: (config, funcs) =>
      funcs.reduce((config, func) => func(config, args), config),
    target,
    isProd,
    isDev,
    isWeb,
    isElectron,
    isElectronMain,
    isElectronRenderer,
    isNode,
    appRoot,
    paths,
    cache,
    output,
    filename
  });

  const newConfig = [entry, externals, webpackPlugins]
    .concat(plugins)
    .map(resolvePlugin)
    .reduce((store, plugin) => plugin(config, args) || config, config);

  const e = newConfig.entry;
  newConfig.entry = {};
  newConfig.entry[filename] = e;
  return newConfig;
};
