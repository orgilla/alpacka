const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const newer = require('gulp-changed');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const debug = require('gulp-debug');

process.env.NODE_ENV = 'production';

const dest = '.';

const init = ({ packages, root, extensions, force }) => {
  const compile = x =>
    x
      .pipe(plumber())
      .pipe(debug())
      .pipe(newer(dest, { extension: force ? '.xyz' : '.js' }))
      .pipe(sourcemaps.init())
      .pipe(
        babel({
          presets: [[require('@alpacka/babel-preset'), { isLibrary: true }]]
        })
      )
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(dest));
  const src = [];
  packages.forEach(x => {
    extensions.forEach(ex => {
      src.push(`${root}/${x}*/*.${ex}`);
    });
    src.push(`!${root}/${x}*/*.d.ts`);
    src.push(`!${root}/${x}*/*.d.tsx`);
    src.push(`!${root}/${x}/node_modules/**/*`);
    src.push(`!${root}/${x}/node_modules/**`);
    src.push(`!${root}/${x}/node_modules`);
  });
  return { compile, src };
};

exports.watch = config => {
  const { compile, src } = init(config);
  compile(watch(src, { ignoreInitial: false, base: dest, dot: true }));
};

exports.build = config => {
  const { compile, src } = init(config);
  compile(gulp.src(src));
};
