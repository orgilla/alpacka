const { resolve } = require('path');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');

module.exports = src => (config, { isProd, appRoot, filename }) => {
  config.resolve.alias.__app_entry = src;
  config.entry.push(resolve(__dirname, 'entry'));

  if (isProd) {
    const packageJson = require(resolve(appRoot, 'package.json'));
    config.plugins.push(
      new GenerateJsonPlugin('package.json', {
        name: packageJson.name,
        description: packageJson.description,
        author: packageJson.author,
        version: packageJson.version,
        main: `${filename}.js`,
        dependencies: packageJson.dependencies,
        scripts: {
          start: 'node index'
        }
      })
    );
  }
  return config;
};
