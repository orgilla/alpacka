const { isObject, isArray, isString, pick } = require('lodash');

const reduce = env =>
  Object.keys(env).reduce((store, key) => {
    store[`process.env.${key}`] = JSON.stringify(env[key]);
    return store;
  }, {});

module.exports = (stringOrObjOrArray, env) => (config, props) => {
  const { webpack } = props;
  if (isObject(stringOrObjOrArray)) {
    config.plugins.push(new webpack.DefinePlugin(reduce(stringOrObjOrArray)));
  } else if (isString(stringOrObjOrArray)) {
    require('dotenv').config({ path: stringOrObjOrArray });
    config.plugins.push(
      new webpack.DefinePlugin(reduce(pick(process.env, env)))
    );
  } else if (isArray(stringOrObjOrArray)) {
    require('dotenv').config();
    config.plugins.push(
      new webpack.DefinePlugin(reduce(pick(process.env, stringOrObjOrArray)))
    );
  }
  return config;
};
