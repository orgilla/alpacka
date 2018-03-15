module.exports = ({ isLibrary, isDev, isTest, transform }) => {
  const plugins = [
    // Experimental macros support. Will be documented after it's had some time
    // in the wild.
    // require.resolve('babel-plugin-macros'),
    // Necessary to include regardless of the environment because
    // in practice some other transforms (such as object-rest-spread)
    // don't work without it: https://github.com/babel/babel/issues/7215
    require.resolve('babel-plugin-transform-es2015-destructuring'),
    // class { handleClick = () => { } }
    require.resolve('babel-plugin-transform-class-properties'),
    // The following two plugins use Object.assign directly, instead of Babel's
    // extends helper. Note that this assumes `Object.assign` is available.
    // { ...todo, completed: true }
    [
      require.resolve('babel-plugin-transform-object-rest-spread'),
      {
        useBuiltIns: true
      }
    ],
    // Polyfills the runtime needed for async/await and generators
    [
      require.resolve('babel-plugin-transform-runtime'),
      {
        helpers: false,
        polyfill: false,
        regenerator: true
      }
    ]
  ];

  if (isTest) {
    return {
      presets: [
        // ES features necessary for user's Node version
        [
          require('babel-preset-env').default,
          {
            targets: {
              node: 'current'
            }
          }
        ]
      ],
      plugins: plugins.concat([
        // Compiles import() to a deferred require()
        require.resolve('babel-plugin-dynamic-import-node')
      ])
    };
  }

  return {
    presets: [
      // Latest stable ECMAScript features
      [
        require.resolve('babel-preset-env'),
        {
          targets: {
            // React parses on ie 9, so we should too
            ie: 9,
            // We currently minify with uglify
            // Remove after https://github.com/mishoo/UglifyJS2/issues/448
            uglify: true,
            node: '6.10'
          },
          // Disable polyfill transforms
          useBuiltIns: false,
          // Do not transform modules to CJS
          modules: isLibrary ? 'commonjs' : false
        }
      ]
    ],
    plugins: plugins.concat([
      // function* () { yield 42; yield 43; }
      [
        require.resolve('babel-plugin-transform-regenerator'),
        {
          // Async functions are converted to generators by babel-preset-env
          async: false
        }
      ],
      // Adds syntax support for import()
      require.resolve('babel-plugin-syntax-dynamic-import'),
      require.resolve('babel-plugin-transform-decorators-legacy'),
      require.resolve('babel-plugin-lodash'),
      [
        require.resolve('babel-plugin-import'),
        { libraryName: 'antd', style: true }
      ],
      [
        require.resolve('babel-plugin-transform-imports'),
        Object.assign(
          {},
          {
            antd: {
              transform: 'antd/lib/${member}',
              kebabCase: true,
              preventFullImport: true
            },
            'date-fns': {
              transform: 'date-fns/${member}',
              preventFullImport: true,
              camelCase: true
            },
            '@filou/icons': {
              transform: '@filou/icons/lib/${member}',
              kebabCase: true,
              preventFullImport: true
            }
          },
          transform || {}
        )
      ]
    ])
  };
};
