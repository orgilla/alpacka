const ElectronPlugin = require('./webpack-electron-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');

module.exports = (entry, options = {}) => (
  config,
  { isDev, output, webpack, filename, appRoot }
) => {
  const { port, src } = options;

  config.entry.push(entry);
  config.resolve.alias.__resourceQuery = src;

  const url =
    isDev && port
      ? JSON.stringify(`http://localhost:${port}/index.html`)
      : undefined;

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.INDEX_HTML': url
    })
  );

  config.plugins.push(
    new GenerateJsonPlugin(
      'package.json',
      require('./package-json')(appRoot, filename)
    )
  );

  if (isDev) {
    // const ElectronPlugin = require('electron-webpack-plugin');
    config.plugins.push(
      new ElectronPlugin({
        test: new RegExp(`^./${filename}`),
        path: output
      })
    );
  }

  return config;
};
