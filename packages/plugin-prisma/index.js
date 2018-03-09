const { resolve } = require('path');

module.exports = src => (config, props) => {
  config.resolve.alias.__prisma_entry = src;
  config.entry.push(resolve(__dirname, 'entry'));
  return config;
};
