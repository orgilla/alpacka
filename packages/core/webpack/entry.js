module.exports = (config, { isDev, entry, appRoot, target }) => {
  config.resolve.alias.__resourceQuery =
    (entry && entry.split('?')[1]) || appRoot;
  if (target === 'electron-main' || target === 'node') {
    if (isDev) {
      config.entry = ['webpack/hot/poll?1000', '@babel/polyfill'];
    } else {
      config.entry = ['@babel/polyfill'];
    }
  } else if (isDev) {
    config.entry = [
      'react-hot-loader/patch',
      `webpack-dev-server/client?${config.output.publicPath}`,
      'webpack/hot/only-dev-server',
      '@babel/polyfill'
    ];
  } else {
    config.entry = ['@babel/polyfill'];
  }
  if (entry) {
    config.entry.push(entry);
  }
  return config;
};
