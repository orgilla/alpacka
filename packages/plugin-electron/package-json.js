const path = require('path');

module.exports = (appRoot, output) => {
  const packageJson = require(path.resolve(appRoot, 'package.json'));
  return {
    name: packageJson.name,
    description: packageJson.description,
    author: packageJson.author,
    version: packageJson.version,
    main: `${output}.js`,
    scripts: {
      postinstall: 'electron-builder install-app-deps',
    },
    dependencies: packageJson.dependencies,
  };
};
