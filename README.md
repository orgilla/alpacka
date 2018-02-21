<div align="center">
  <a href="https://github.com/bkniffler/alpacka">
    <img alt="alpacka" src="https://raw.githubusercontent.com/bkniffler/alpacka/master/assets/logo.png" height="250px" />
  </a>
</div>

<div align="center">
  <h2>Alpacka</h2>
  <strong>A webpack abstraction layer to target multiple platforms</strong>
  <br />
  <br />
  <a href="https://travis-ci.org/bkniffler/alpacka">
    <img src="https://img.shields.io/travis/bkniffler/alpacka.svg?style=flat-square" alt="Build Status">
  </a>
  <a href="https://codecov.io/github/bkniffler/alpacka">
    <img src="https://img.shields.io/codecov/c/github/bkniffler/alpacka.svg?style=flat-square" alt="Coverage Status">
  </a>
  <a href="https://www.npmjs.com/package/@alpacka/core">
    <img src="https://img.shields.io/npm/dm/@alpacka/core.svg?style=flat-square" alt="Downloads">
  </a>
  <a href="https://github.com/bkniffler/alpacka">
    <img src="https://img.shields.io/github/issues/bkniffler/alpacka.svg?style=flat-square" alt="Issues">
  </a>
  <a href="https://github.com/bkniffler/alpacka">
    <img src="https://img.shields.io/github/package-json/v/bkniffler/alpacka.svg?style=flat-square" alt="Version">
  </a>
  <a href="https://github.com/bkniffler/alpacka">
    <img src="https://img.shields.io/github/forks/bkniffler/alpacka.svg?style=flat-square" alt="Forks">
  </a>
  <a href="https://github.com/bkniffler/alpacka">
    <img src="https://img.shields.io/github/stars/bkniffler/alpacka.svg?style=flat-square" alt="Stars">
  </a>
  <a href="https://github.com/bkniffler/alpacka/master/LICENSE">
    <img src="https://img.shields.io/github/license/bkniffler/alpacka.svg?style=flat-square" alt="License">
  </a>
  <br />
  <br />
</div>

A simple wrapper around webpack. It supports different plugins and runtimes as well as dev (hot reload) and build-modes.

* 4 runtimes: Electron, Web, Server and Lambda
* Plugins: Less and Babel, and easily add your own
* Hot-Reload: On every runtime!
* Code-Splitting: For web runtime
* Offline: Ready for web runtime
* Libraries: Will also take care of your libraries
* Deploy: Use netlify, heroko, serverless, electron-builder to easily deploy your apps, servers, and services

## Kickstart

```bash
npm i @alpacka/dev @alpacka/runtime-web @alpacka/plugin-babel-react
```

```jsx
// dev.js
require('@alpacka/dev')({
  runtime: 'web',
  plugins: ['babel-react'],
  port: 3000,
});

// src/index.js
export default () => 'Hi!';
```

```bash
node dev
```

## Runtimes

* [@alpacka/runtime-web](https://github.com/bkniffler/alpacka/tree/master/packages/runtime-web): Progressive Web Applications with offline support
* [@alpacka/runtime-lambda](https://github.com/bkniffler/alpacka/tree/master/packages/runtime-lambda): NodeJS for AWS Lambda
* [@alpacka/runtime-server](https://github.com/bkniffler/alpacka/tree/master/packages/runtime-server): Classic server for API and/or SSR
* [@alpacka/runtime-electron](https://github.com/bkniffler/alpacka/tree/master/packages/runtime-electron): Electron runtime for desktop applications

## Plugins

### JavaScript

* [@alpacka/plugin-babel-react](https://github.com/bkniffler/alpacka/tree/master/packages/plugin-babel-react): React-Babel plugin

### Styles

* [@alpacka/plugin-less](https://github.com/bkniffler/alpacka/tree/master/packages/plugin-less): Less style plugin

## Libraries

Alpacka can compile libraries with lerna monorepository structures. It will compile all .es6 files to .js. There is a watch mode for local development and a build mode for after

```bash
npm i @alpacka/task @alpacka/plugin-babel-react
```

```json
// package.json
"scripts": {
  "watch": "alpacka watch --config babel-react"
}
```

For help, use `alpacka --help`

## Motivation

We've all been there. Writing webpack configs hurt, especially if you try more complex stuff. So bundling config into packages and reuse them whenever needed is neat. You want .less? Just add the .less plugin, Alpacka will add the relevant rules and css extraction. Want to target electron? Just add the electron runtime. Never again loos precious days of getting that config to work.

## Contributing

Contributions always welcome, feel free to PR with new features/plugins or bugfixes if you like.

## Ref

* [webpack](https://github.com/webpack/webpack): Webpack is obviously more difficult to use directly, but also very versatile if you know what you're doing
* [create-react-app](https://github.com/facebook/create-react-app): CRA is a CLI tool to set-up a react app extremly quickly. It will allow to disconnect from the default config any time, though you'll have to maintain your own webpack config.
* [react-universally](https://github.com/ctrlplusb/react-universally): A very nice boilerplate for react apps
* [next.js](https://github.com/zeit/next.js/): Powerful and popular, but very monolithic compared to Alpacka, since Alpacka only provides the build tools (including a plugin system) plus different runtimes.
