module.exports = ({ isLibrary, isDev, isFlowEnabled, isTest, transform }) => {
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
        useBuiltIns: true,
      },
    ],
    // Transforms JSX
    [
      require.resolve('babel-plugin-transform-react-jsx'),
      {
        useBuiltIns: true,
      },
    ],
    // Polyfills the runtime needed for async/await and generators
    [
      require.resolve('babel-plugin-transform-runtime'),
      {
        helpers: false,
        polyfill: false,
        regenerator: true,
      },
    ],
  ];

  if (isDev || isTest) {
    // The following two plugins are currently necessary to make React warnings
    // include more valuable information. They are included here because they are
    // currently not enabled in babel-preset-react. See the below threads for more info:
    // https://github.com/babel/babel/issues/4702
    // https://github.com/babel/babel/pull/3540#issuecomment-228673661
    // https://github.com/facebookincubator/create-react-app/issues/989
    plugins.push.apply(plugins, [
      // Adds component stack to warning messages
      require.resolve('babel-plugin-transform-react-jsx-source'),
      // Adds __self attribute to JSX which React will use for some warnings
      require.resolve('babel-plugin-transform-react-jsx-self'),
    ]);
  }

  if (isTest) {
    return {
      presets: [
        // ES features necessary for user's Node version
        [
          require('babel-preset-env').default,
          {
            targets: {
              node: 'current',
            },
          },
        ],
        // JSX, Flow
        require.resolve('babel-preset-react'),
      ],
      plugins: plugins.concat([
        // Compiles import() to a deferred require()
        require.resolve('babel-plugin-dynamic-import-node'),
      ]),
    };
  } else {
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
              node: '6.10',
            },
            // Disable polyfill transforms
            useBuiltIns: false,
            // Do not transform modules to CJS
            modules: isLibrary ? 'commonjs' : false,
          },
        ],
        // JSX, Flow
        require.resolve('babel-preset-react'),
      ],
      plugins: plugins.concat([
        // function* () { yield 42; yield 43; }
        [
          require.resolve('babel-plugin-transform-regenerator'),
          {
            // Async functions are converted to generators by babel-preset-env
            async: false,
          },
        ],
        // Adds syntax support for import()
        require.resolve('babel-plugin-syntax-dynamic-import'),
        require.resolve('babel-plugin-transform-decorators-legacy'),
        require.resolve('babel-plugin-lodash'),
        [
          require.resolve('babel-plugin-import'),
          { libraryName: 'antd', style: true },
        ],
        [
          require.resolve('babel-plugin-transform-imports'),
          {
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
          },
        ],
      ]),
    };

    if (env === 'production') {
      // Optimization: hoist JSX that never changes out of render()
      // Disabled because of issues: https://github.com/facebookincubator/create-react-app/issues/553
      // TODO: Enable again when these issues are resolved.
      // plugins.push.apply(plugins, [
      //   require.resolve('babel-plugin-transform-react-constant-elements')
      // ]);
    }
  }
};
