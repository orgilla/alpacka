module.exports = (config, { isDev, entry, appRoot, target }) => {
  config.resolve.alias.__resourceQuery =
    (entry && entry.split('?')[1]) || appRoot;
  if (target === 'electron-main') {
    if (isDev) {
      config.entry.main = ['webpack/hot/poll?1000', 'babel-polyfill'];
    } else {
      config.entry.main = ['babel-polyfill'];
    }
  } else if (target === 'node') {
    if (isDev) {
      config.entry.app = ['babel-polyfill', 'webpack/hot/poll?1000'];
    } else {
      config.entry.app = ['babel-polyfill'];
    }
  } else if (isDev) {
    config.entry.app = [
      'react-hot-loader/patch',
      `webpack-dev-server/client?${config.output.publicPath}`,
      'webpack/hot/only-dev-server',
      'babel-polyfill'
    ];
  } else {
    config.entry.app = ['babel-polyfill'];
  }
  if (entry) {
    config.entry.app.push(entry);
  }
  return config;
};
