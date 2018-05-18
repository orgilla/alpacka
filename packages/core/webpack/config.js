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
    modules = [],
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
    mode,
    bail: !isDev,
    cache: isDev,
    target,
    optimization: {
      runtimeChunk: false,
      minimize: false,
      namedModules: isDev,
      noEmitOnErrors: true,
      concatenateModules: isProd
    },
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
    plugins: [],
    resolve: {
      mainFields: ['browser', 'main', 'module'],
      extensions: ['.js', '.less', '.json'],
      modules: modules.concat([
        path.resolve(appRoot, 'node_modules'),
        path.resolve(appRoot, '..', '..', 'node_modules')
      ]),
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
          test: /(pdfkit|linebreak|fontkit|unicode|brotli|png-js).*\.js$/,
          loader: 'transform-loader?brfs'
        },
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
          test: /\.flow$/,
          loader: 'ignore-loader'
        }
      ]
    },
    output: {
      publicPath:
        isElectron && options.port
          ? `http://localhost:${options.port}/`
          : isElectron
            ? './'
            : '/',
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
    config.output.filename = `${filename}.[chunkhash].js`;
    config.output.chunkFilename = `${filename}.[chunkhash].js`;
  } else if (isProd) {
    config.output.filename = `${filename}.js`;
    config.output.chunkFilename = `${filename}.js`;
    config.plugins.push(
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
    );
  } else {
    config.output.filename = `${filename}.js`;
    config.output.chunkFilename = `${filename}.js`;
    config.plugins.push(
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
    );
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

  return newConfig;
};
