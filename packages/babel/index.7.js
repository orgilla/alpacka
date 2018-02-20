module.exports = ({ isLibrary, isDev, isFlowEnabled, transform }) => ({
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: false, // isLibrary ? 'usage' : 'entry',
        modules: isLibrary ? 'commonjs' : false,
      },
    ],
    [
      '@babel/preset-react',
      {
        development: !!isDev,
      },
    ],
    //  '@babel/typescript',
  ].filter(Boolean),
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-destructuring',
    '@babel/plugin-proposal-decorators',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    [
      '@babel/plugin-proposal-object-rest-spread',
      {
        useBuiltIns: true,
      },
    ],
    [
      '@babel/plugin-transform-react-jsx',
      {
        useBuiltIns: true,
      },
    ],
    !isDev && [
      'babel-plugin-transform-react-remove-prop-types',
      {
        removeImport: true,
      },
    ],
    [
      '@babel/plugin-transform-regenerator',
      {
        async: false,
      },
    ],
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-shorthand-properties',
    'lodash',
    ['import', { libraryName: 'antd', style: true }],
    /*[
      'transform-imports',
      Object.assign({}, transform || {}, {
        antd: {
          transform: 'antd/lib/${member}',
          kebabCase: true,
          preventFullImport: true,
        },
        'date-fns': {
          transform: 'date-fns/${member}',
          preventFullImport: true,
          camelCase: true,
        },
        'olymp-icons': {
          transform: 'olymp-icons/lib/${member}',
          kebabCase: true,
          preventFullImport: true,
        },
        icon88: {
          transform: 'icon88/lib/${member}',
          kebabCase: true,
          preventFullImport: true,
        },
      }),
    ],*/
  ].filter(Boolean),
});
