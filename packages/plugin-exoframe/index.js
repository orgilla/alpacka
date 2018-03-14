const { resolve } = require('path');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');

module.exports = options => (config, { isProd, appRoot }) => {
  const packageJson = require(resolve(appRoot, 'package.json'));
  config.plugins.push(
    new GenerateJsonPlugin(
      'exoframe.json',
      Object.assign(
        {
          name: packageJson.name
            .split('@')
            .join('')
            .split('/')
            .join('-'),
          restart: 'on-failure:2',
          env: {
            PORT: 80
          }
        },
        options
      )
    )
  );
  return config;
};
