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
  } else if (
    typeof nameOrFunc === 'string' &&
    exists(`@alpacka/runtime-${nameOrFunc}`)
  ) {
    return require(`@alpacka/runtime-${nameOrFunc}`);
  } else if (typeof nameOrFunc === 'string' && exists(nameOrFunc)) {
    return require(nameOrFunc);
  }
  return nameOrFunc;
};

process.noDeprecation = true;
module.exports = options => {
  const {
    mode = process.env.NODE_ENV,
    port,
    alias = {},
    plugins = [],
    paths,
    runtime
  } = options;

  let target = options.target;
  if (!target && runtime === 'lambda') {
    target = 'node';
  } else if (!target && runtime === 'server') {
    target = 'node';
  } else if (!target && runtime === 'electron/main') {
    target = 'electron-main';
  } else if (!target && runtime === 'electron/renderer') {
    target = 'electron-renderer';
  } else if (!target) {
    target = 'web';
  }
  const isProd = mode === 'production' || mode === 'test';
  const isDev = !isProd;
  const isElectron = target.indexOf('electron') === 0;
  const isElectronMain = target === 'electron-main';
  const isElectronRenderer = target === 'electron-renderer';
  const isServer = target === 'node' || target === 'lambda';
  const isWeb = !isServer && target !== 'node' && target !== 'electron-main';
  const isNode = isServer || isElectronMain;
  const folder = isDev ? '.dev' : '.dist';
  const output =
    options.output || path.resolve(appRoot, folder, runtime.split('/')[0]);

  const isVerbose = true;
  let config = {
    bail: !isDev,
    cache: isDev,
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
        path.resolve(appRoot, '..', '..', 'node_modules'),
        path.resolve(appRoot, 'src')
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
        path.resolve(appRoot, '..', '..', 'node_modules'),
        path.resolve(appRoot, 'src')
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
      publicPath: isProd ? '/' : `http://localhost:${port}/`,
      path: output
    },
    entry: {}
  };

  // inline-source-map for web-dev
  config.devtool = isProd
    ? 'cheap-module-source-map'
    : 'cheap-module-source-map';

  // inline-source-map for web-dev
  if (isProd && isWeb && !isElectron) {
    config.output.filename = '[name].[contenthash].js';
  } else {
    config.output.filename = '[name].js';
  }

  // target && node settings
  if (isServer) {
    config.target = 'node';
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
  } else if (isElectronMain) {
    config.target = 'electron-main';
    config.watch = isDev;
    config.node = {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __dirname: false,
      __filename: false
    };
    config.output.libraryTarget = 'commonjs2';
  } else {
    config.target = isElectron ? 'electron-renderer' : 'web';
    config.node = {
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      __dirname: true,
      __filename: true
    };
  }

  if (isNode || isElectron) {
    config.output.filename = '[name].js';
  } else {
    const filename = isProd ? '[name].[chunkhash].js' : '[name].js';
    config.output.filename = filename;
    config.output.chunkFilename = filename;
  }

  const args = Object.assign({}, options, {
    target,
    folder,
    isProd,
    isDev,
    isWeb,
    isElectron,
    isElectronMain,
    isElectronRenderer,
    isNode,
    appRoot,
    paths,
    port,
    output
  });

  config = entry(config, args, webpack);
  config = externals(config, args, webpack);
  config = webpackPlugins(config, args, webpack);
  const x = plugins
    .map(resolvePlugin)
    .concat([resolvePlugin(runtime)])
    .reduce((store, plugin) => plugin(config, args, webpack) || config, config);

  return x;
};
