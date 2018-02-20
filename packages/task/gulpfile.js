const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const newer = require('gulp-changed');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const debug = require('gulp-debug');
const path = require('path');
const babelOptions = require('@alpacka/babel')({ isLibrary: true });

process.env.NODE_ENV = 'production';

const root = process.cwd();

const { packages } = require(path.resolve(root, 'lerna.json'));

const src = [];
packages.forEach(x => {
  src.push(`${root}/${x}*/*.tsx`);
  src.push(`${root}/${x}*/*.ts`);
  src.push(`${root}/${x}*/*.es6`);
  src.push(`!${root}/${x}*/*.d.ts`);
  src.push(`!${root}/${x}*/*.d.tsx`);
  src.push(`!${root}/${x}/node_modules/**/*`);
  src.push(`!${root}/${x}/node_modules/**`);
  src.push(`!${root}/${x}/node_modules`);
});
const dest = '.';

const compile = x =>
  x
    .pipe(plumber())
    .pipe(debug())
    // .pipe(newer(dest, { extension: '.js' }))
    .pipe(sourcemaps.init())
    .pipe(babel(babelOptions))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest));

exports.watch = () => {
  compile(watch(src, { ignoreInitial: false, base: dest, dot: true }));
};

exports.build = () => {
  compile(watch(src, { ignoreInitial: false, base: dest, dot: true }));
};
