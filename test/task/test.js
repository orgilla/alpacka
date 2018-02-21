const gulp = require('@alpacka/task/gulpfile');
const init = require('@alpacka/task/init');

it('compile .es6', () =>
  gulp.build(
    init({
      packages: ['src'],
      root: __dirname
    })
  ));
