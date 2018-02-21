const path = require('path');
const build = require('@alpacka/build');

it(
  'build for web/static (with babel)',
  () =>
    build(
      {
        runtime: 'web',
        template: path.resolve(__dirname, 'template.js'),
        entry: path.resolve(__dirname, 'src'),
        plugins: ['babel-react'],
        port: 3000
      },
      {
        silent: true
      }
    ),
  30000
);

it(
  'build for web/serverless (with babel)',
  () =>
    build(
      {
        runtime: 'web',
        template: path.resolve(__dirname, 'template.js'),
        serverMode: 'serverless',
        entry: path.resolve(__dirname, 'src'),
        plugins: ['babel-react'],
        port: 3000
      },
      {
        silent: true
      }
    ),
  30000
);
