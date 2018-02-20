const path = require('path');
const run = require('@alpacka/run');

it('build for web/static (with babel)', () =>
  run.build(
    {
      runtime: 'web',
      entry: path.resolve(__dirname, 'src'),
      plugins: ['babel'],
      port: 3000
    },
    {
      silent: true
    }
  ));

it('build for web/serverless (with babel)', () =>
  run.build(
    {
      runtime: 'web',
      serverMode: 'serverless',
      entry: path.resolve(__dirname, 'src'),
      plugins: ['babel'],
      port: 3000
    },
    {
      silent: true
    }
  ));
