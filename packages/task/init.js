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
const resolvePlugin = name => {
  if (exists(`@alpacka/plugin-${name}/config`)) {
    return require(`@alpacka/plugin-${name}/config`); // eslint-disable-line
  } else if (exists(name)) {
    return require(name); // eslint-disable-line
  }
  throw new Error(
    `${name} not found (tried to resolve '@alpacka/plugin-${name}/config' and '${name}')`
  );
};

module.exports = argv => {
  const packages = resolvePackages(argv.packages, argv.root);
  const plugin = resolvePlugin(argv.config || 'babel-react');
  return {
    force: argv.force || false,
    plugin,
    packages,
    root: argv.root || process.cwd(),
    extensions: argv.extensions || defaultExtensions
  };
};
