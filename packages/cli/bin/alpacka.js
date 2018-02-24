#!/usr/bin/env node

const chalk = require('chalk');
const yargs = require('yargs');
const init = require('../init');
const gulp = require('../gulpfile');

const log = message => console.log(chalk.green(message));
const clear = () => process.stdout.write('\u001B[2J\u001B[0;0f');

const prepare = (command, func) => argv => {
  const config = init(argv);
  clear();
  log(
    `${command} [${config.extensions
      .map(x => `.${x}`)
      .join(', ')}] in ${config.packages.join(', ')} ...`
  );
  return func(config);
};

module.exports = yargs
  .usage('$0 <cmd> [args]')
  .command('watch', 'Watch a folder', () => {}, prepare('Watching', gulp.watch))
  .command('build', 'Build a folder', () => {}, prepare('Building', gulp.build))
  .demandCommand(1)
  .alias('c', 'config')
  .string('c')
  .describe('c', 'Define config')
  .alias('p', 'packages')
  .array('p')
  .describe('p', 'Define packages')
  .alias('f', 'force')
  .boolean('f')
  .describe('f', 'Force building files')
  .alias('r', 'root')
  .string('r')
  .describe('e', 'Define extensions')
  .alias('e', 'extensions')
  .array('e')
  .describe('r', 'Define root (instead of process.cwd())')
  .example(
    '$0 watch',
    'Watch packages found in lerna.json or yarn workspaces in package.json'
  )
  .example('$0 watch -f src src2', 'Watch files in folders src, src2')
  .example('$0 watch -r ../project1', 'Use ../project1 as root folder')
  .help().argv;
