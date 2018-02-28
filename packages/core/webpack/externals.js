const path = require('path');
const fs = require('fs');
const nodeExternals = require('webpack-node-externals');

module.exports = (config, { appRoot, externals = [], isNode }) => {
  if (isNode) {
    const getExternals = modulesDir =>
      nodeExternals({
        modulesDir,
        whitelist: [
          '.bin',
          'source-map-support/register',
          // 'babel-polyfill',
          /\.(eot|woff|woff2|ttf|otf)$/,
          /\.(svg|png|jpg|jpeg|gif|ico)$/,
          /\.(mp4|mp3|ogg|swf|webp)$/,
          /\.(css|scss|sass|sss|less)$/,
          v => v.indexOf('webpack/hot/poll') === 0,
          v => v === 'antd' || v.indexOf('antd/') === 0,
          v => v.indexOf('@powr/') === 0,
          v => v.indexOf('@filou/') === 0,
          v => v.indexOf('@grappa/') === 0,
          v => v.indexOf('@alpacka/') === 0,
          v =>
            v === 'olymp' ||
            v.indexOf('olymp-') === 0 ||
            v.indexOf('olymp/') === 0,
          v =>
            v === 'hashtax' ||
            v.indexOf('hashtax-') === 0 ||
            v.indexOf('hashtax/') === 0
        ].concat(
          externals.map(key => v => v === key || v.indexOf(`${key}/`) === 0)
        )
      });
    config.externals = [];
    if (fs.existsSync(path.resolve(appRoot, 'node_modules'))) {
      config.externals.push(
        getExternals(path.resolve(appRoot, 'node_modules'))
      );
    }
    if (fs.existsSync(path.resolve(appRoot, '..', '..', 'node_modules'))) {
      config.externals.push(
        getExternals(path.resolve(appRoot, '..', '..', 'node_modules'))
      );
    }
  }
  return config;
};
