const CopyWebpackPlugin = require('copy-webpack-plugin');
const DepsPlugin = require('./webpack-deps-plugin');
const WebpackShellPlugin = require('./webpack-shell-plugin');

const path = require('path');

module.exports = ({ src = process.cwd(), yml }) => (
  config,
  { isProd, appRoot, output }
) => {
  config.module.rules.push({
    test: /\.(yaml|yml)$/,
    use: [
      {
        loader: 'json-loader'
      },
      {
        loader: 'yaml-loader'
      }
    ]
  });
  if (isProd) {
    config.entry.push(src);
    config.plugins.push(
      new CopyWebpackPlugin([
        {
          from: yml,
          to: output
        }
      ])
    );
    config.plugins.push(
      new DepsPlugin({
        root: appRoot,
        outDir: output
      })
    );
    config.plugins.push(
      new WebpackShellPlugin({
        onBuildEnd: [`cd ${output} && npm i`],
        safe: true
      })
    );
  } else {
    config.entry.push(path.resolve(__dirname, 'entry.js'));
    config.resolve.alias.__yml = yml;
    config.resolve.alias.__src = src;
  }
  return config;
};
