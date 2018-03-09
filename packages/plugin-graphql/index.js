module.exports = () => (config, props) => {
  config.module.rules.push({
    test: /\.graphql?$/,
    loader: 'webpack-graphql-loader'
  });
  return config;
};
