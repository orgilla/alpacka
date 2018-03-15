const path = require('path');

const defaultExtensions = ['tsx', 'ts', 'es6'];

const exists = name => {
  try {
    require.resolve(name);
    return true;
  } catch (e) {
    return false;
  }
};
const resolvePackages = (packages, r) => {
  let result;
  if (packages) {
    result = [].concat(packages || []);
    if (packages.length === 0) {
      throw new Error(`No packages defined`);
    }
    return result;
  }
  const root = path.isAbsolute(r) ? r : path.resolve(process.cwd(), r);
  const lernaPath = path.resolve(root, 'lerna.json');
  const pckgJsonPath = path.resolve(root, 'package.json');
  if (exists(lernaPath)) {
    result = require(lernaPath).packages; // eslint-disable-line
  } else if (exists(pckgJsonPath)) {
    result = require(pckgJsonPath).workspaces; // eslint-disable-line
  }
  if (!result || result.length === 0) {
    throw new Error(
      `No lerna.json or package.json workspaces found, please use --packages argument or point --root to lerna.json/package.json root folder`
    );
  }
  return result;
};

module.exports = argv => {
  const root = argv.root || process.cwd();
  const packages = resolvePackages(argv.packages, root);
  return {
    force: argv.force || false,
    packages,
    root,
    extensions: argv.extensions || defaultExtensions
  };
};
