const path = require('path');
const rimraf = require('rimraf');
const webpack = require('webpack');
const notifier = require('node-notifier');
// const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
// const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;

require('dotenv').config();

const createConfig = require(path.resolve(__dirname, 'webpack', 'config.js'));

const root = process.cwd();

exports.start = () => {
  require(path.resolve(process.cwd(), '.dist', 'node', 'app'));
};

exports.build = (options, args = {}) => {
  if (!Array.isArray(options)) {
    options = [options];
  }
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';

  const compiler = webpack(
    options.map((config, i) => {
      rimraf.sync(path.resolve(root, '.dist', config.runtime.split('/')[0]));
      return createConfig(config);
    })
  );

  return new Promise((yay, nay) => {
    compiler.run((err, compilation) => {
      if (err) {
        console.error(err);
        if (!args.silent) {
          process.exit(1);
        }
        return nay(err);
      }
      const stats = compilation.stats || [compilation];
      stats.forEach((c, i) => {
        if (!args.silent) {
          console.log(c.toString());
        }
        // console.log('File sizes after gzip:\n');
        // printFileSizesAfterBuild(c, null, null);
      });
      yay(stats);
    });
  });
};

exports.dev = options => {
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
    if (
      config.runtime === 'node' ||
      config.runtime === 'lambda' ||
      config.runtime === 'electron/main'
    ) {
      currentCompiler.watch(watch, (err, compilation) => {
        if (err) {
          return console.log('[webpack] error:', err);
        }
        const stats = compilation.stats || [compilation];
        console.log('[webpack] the following asset bundles were built:');
        stats.forEach(c => console.log(c.toString()));
        notifier.notify('Ready');
      });
    } else {
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
        port: config.port,
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
      console.log('WebpackDevServer listening to', config.port);
      server.listen(config.port);
    }
  });
  return compiler;
};
