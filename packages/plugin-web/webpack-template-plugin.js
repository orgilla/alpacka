const path = require('path');
const fs = require('fs');

function getFileExtension(filename) {
  let extension = filename.split('.').reverse()[0];

  if (!extension.length) {
    extension = null;
  }

  return extension;
}

const exists = name => {
  try {
    require.resolve(name);
    return true;
  } catch (e) {
    return false;
  }
};

const resolvePlugin = name => {
  if (exists(name)) {
    return require(name);
  } else if (exists(path.resolve(process.cwd(), 'node_modules', name))) {
    return require(path.resolve(process.cwd(), 'node_modules', name));
  } else if (
    exists(path.resolve(process.cwd(), '..', '..', 'node_modules', name))
  ) {
    return require(path.resolve(
      process.cwd(),
      '..',
      '..',
      'node_modules',
      name
    ));
  }
  throw new Error(`Can't find ${name}`);
};

class TemplatePlugin {
  constructor(options) {
    this.options = options || {};
    if (!this.options.template) {
      throw new Error('Template must be defined in');
    }
    if (!this.options.filename) {
      throw new Error('Filename must be defined');
    }
    if (typeof this.options.template === 'string') {
      this.options.template = resolvePlugin(this.options.template);
    }
    if (!this.options.publicPath) {
      this.options.publicPath = '/';
    }
  }
  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      const initial = {};
      const entry = {};
      const files = {};

      compilation
        .getStats()
        .toJson()
        .chunks.forEach(element => {
          element.files.forEach(file => {
            const ext = getFileExtension(file);
            if (element.initial) {
              if (!initial[ext]) {
                initial[ext] = [];
              }
              initial[ext].push(`${this.options.publicPath}${file}`);
            }
            if (element.entry) {
              if (!entry[ext]) {
                entry[ext] = [];
              }
              entry[ext].push(`${this.options.publicPath}${file}`);
            }
            if (!files[ext]) {
              files[ext] = [];
            }
            files[ext].push(`${this.options.publicPath}${file}`);
          });
        });

      const resultString = this.options.template(
        { files, entry, initial, htmlWebpackPlugin: { files: entry } },
        compilation
      );

      if (resultString) {
        compilation.assets[this.options.filename] = {
          source() {
            return resultString;
          },
          size() {
            return Buffer.byteLength(resultString);
          }
        };
        callback();
        /* const fullPath = path.resolve(
          this.outputPath || compilation.compiler.outputPath,
          this.options.filename
        );
        fs.writeFile(fullPath, resultString, err => callback(err, null)); */
      } else {
        callback();
      }
    });
  }
}

module.exports = TemplatePlugin;
