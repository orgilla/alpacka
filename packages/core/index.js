const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const webpack = require('webpack');
const notifier = require('node-notifier');
// const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
// const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;

require('dotenv').config();

const createConfig = require('./webpack/config.js');

exports.start = () =>
  require(path.resolve(process.cwd(), '.dist', 'node', 'app'));

exports.build = (options, args = {}) => {
  if (!Array.isArray(options)) {
    options = [options];
  }
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';

  const compiler = webpack(
    options.map((config, i) => {
      if (config.output && fs.existsSync(path.resolve(config.output))) {
        rimraf.sync(path.resolve(config.output));
      }
      return createConfig(config);
    })
  );

  return new Promise((yay, nay) => {
    compiler.run((err, compilation) => {
      if (err) {
        // console.error(err);
        if (!args.silent) {
          process.exit(1);
        }
        return nay(err);
      }
      const stats = compilation.stats || [compilation];
      stats.forEach((c, i) => {
        if (!args.silent) {
          // console.log(c.toString());
        }
        // console.log('File sizes after gzip:\n');
        // printFileSizesAfterBuild(c, null, null);
      });
      yay(stats);
    });
  });
};

exports.dev = (options, p) => {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  if (!Array.isArray(options)) {
    options = [options];
  }
  const watch = {
    aggregateTimeout: 300,
    poll: false,
    ignored: /node_modules/
  };

  const compiler = webpack(options.map(createConfig));

  options.forEach((config, i) => {
    const currentCompiler = compiler.compilers[i];
    if (config.target === 'node' || config.target === 'electron-main') {
      currentCompiler.watch(watch, err => {
        if (err) {
          return notifier.notify('Failed');
        }
        notifier.notify('Ready');
      });
    } else {
      const port = config.port || p;
      const WebpackDevServer = require('webpack-dev-server');
      const proxy = config.proxy || {};
      const server = new WebpackDevServer(currentCompiler, {
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        proxy: proxy || {},
        watchOptions: watch,
        inline: false,
        host: '0.0.0.0',
        port,
        disableHostCheck: true,
        historyApiFallback: true,
        hot: true,
        stats: {
          colors: true,
          hash: false,
          version: false,
          timings: false,
          assets: false,
          chunks: false,
          modules: false,
          reasons: false,
          children: false,
          source: false,
          errors: true,
          errorDetails: true,
          warnings: false,
          publicPath: false
        }
      });
      server.listen(port);
    }
  });
  return compiler;
};
