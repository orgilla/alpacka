const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('./webpack-shell-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');

const path = require('path');

module.exports = ({ src = process.cwd(), yml }) => (
  config,
  { isProd, appRoot, output, filename }
) => {
  config.module.rules.push({
    test: /\.(yaml|yml)$/,
    use: [
      {
        loader: 'yaml-loader',
      },
    ],
  });
  if (isProd) {
    config.entry.push(src);
    config.plugins.push(
      new CopyWebpackPlugin([
        {
          from: yml,
          to: output,
        },
      ])
    );
    config.plugins.push(
      new GenerateJsonPlugin(
        'package.json',
        require('./package-json')(appRoot, filename)
      )
    );
    config.plugins.push(
      new WebpackShellPlugin({
        onBuildEnd: [`cd ${output} && npm i`],
        safe: true,
      })
    );
  } else {
    config.entry.push(path.resolve(__dirname, 'entry.js'));
    config.resolve.alias.__yml = yml;
    config.resolve.alias.__src = src;
  }
  return config;
};
