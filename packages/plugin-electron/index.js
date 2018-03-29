const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const path = require('path');
const ElectronPlugin = require('./webpack-electron-plugin');

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
      'process.env.INDEX_HTML': url,
    })
  );

  const packageJson = require(path.resolve(appRoot, 'package.json'));
  const scripts = {};
  if (config.sqlite || options.sqlite) {
    packageJson.dependencies['sqlite3-electron-1.8.2'] =
      'https://github.com/Otas13/sqlite3-electron-1.8.2';
    packageJson.scripts.postinstall = `cp -R node_modules/sqlite3-electron-1.8.2/electron-v1.8-win32-x64 node_modules/sqlite3/lib/binding`;
  }
  config.plugins.push(
    new GenerateJsonPlugin('package.json', {
      name: packageJson.name,
      description: packageJson.description,
      author: packageJson.author,
      version: packageJson.version,
      main: `${filename}.js`,
      scripts,
      dependencies: packageJson.dependencies,
    })
  );

  if (isDev) {
    // const ElectronPlugin = require('electron-webpack-plugin');
    config.plugins.push(
      new ElectronPlugin({
        test: new RegExp(`^./${filename}`),
        path: output,
      })
    );
  }

  return config;
};
