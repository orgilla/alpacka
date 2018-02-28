const electron = require('electron');
const proc = require('child_process');
const { resolve } = require('path');

class ElectronPlugin {
  constructor(options) {
    this.hashIndex = {};
    this.options = options || {};

    if (!this.options.test || !(this.options.test instanceof RegExp)) {
      throw new Error(
        'webpack-electron-plugin: test is required, and must be a RegExp'
      );
    }

    if (!this.options.path || typeof this.options.path !== 'string') {
      throw new Error(
        'webpack-electron-plugin: path is required, and must be a string'
      );
    }

    this.options.path = resolve(this.options.path);

    // defaults
    this.options.args = this.options.args || [];
    this.options.options = this.options.options || {};
    this.options.options.stdio = this.options.options.stdio || 'inherit';
  }

  launch() {
    // if electron is open, kill it
    if (this.child) {
      this.child.kill();
      this.child = null;
    }

    this.child = proc.spawn(
      electron,
      this.options.args.concat(this.options.path),
      this.options.options
    );
  }

  apply(compiler) {
    // when compilation is done
    compiler.plugin('done', stats => {
      let shouldRelaunch = false;
      stats.compilation.modules.forEach(module => {
        if (!module.resource) return true;
        if (!module._cachedSource) return true;

        // get hash
        const hash = module._cachedSource.hash;
        const split = module.id.split('!');
        // get last path in module id
        const id = split[split.length - 1];
        // if matches regex and hash is different
        console.log(id);
        if (
          id.match(this.options.test) &&
          this.hashIndex[module.resource] !== hash
        ) {
          shouldRelaunch = true;
        }

        // update hash in index
        this.hashIndex[module.resource] = hash;
      });

      if (shouldRelaunch) this.launch();
      else this.launch();
    });
  }
}

module.exports = ElectronPlugin;
