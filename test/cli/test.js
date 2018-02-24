const gulp = require('@alpacka/cli/gulpfile');
const init = require('@alpacka/cli/init');

it('compile .es6', () =>
  gulp.build(
    init({
      packages: ['src'],
      root: __dirname
    })
  ));
