const fs = require('fs');
const path = require('path');

class DepsPlugin {
  constructor(options) {
    this.options = options || {};
  }
  apply(compiler) {
    compiler.plugin('after-emit', (compilation, callback) => {
      const modules = [];
      compilation.chunks.forEach(chunk => {
        chunk.forEachModule(module => {
          if (module.external) {
            if (module.request[0] === '@') {
              modules.push(
                `${module.request.split('/')[0]}/${
                  module.request.split('/')[1]
                }`
              );
            } else {
              modules.push(module.request.split('/')[0]);
            }
          } else if (
            module.request &&
            module.request.indexOf('/node_modules/') !== -1
          ) {
            modules.push(
              module.request.split('/node_modules/')[1].split('/')[0]
            );
          }
        });
      });

      const packageJson = JSON.parse(
        fs.readFileSync(
          path.resolve(this.options.root || process.cwd(), 'package.json')
        )
      );
      const deps = Object.assign(
        packageJson.devDependencies || {},
        packageJson.dependencies || {}
      );
      fs.writeFileSync(
        path.resolve(this.options.outDir || process.cwd(), 'package.json'),
        JSON.stringify(
          {
            name: 'Hallo',
            dependencies: Object.keys(deps).reduce((result, key) => {
              if (modules.indexOf(key) !== -1) {
                result[key] = deps[key];
              }
              return result;
            }, {})
          },
          null,
          2
        )
      );

      callback();
    });
  }
}

module.exports = DepsPlugin;
