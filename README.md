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

For applications

```bash
npm i @alpacka/dev @alpacka/runtime-web @alpacka/plugin-babel
```

```jsx
// dev.js
require('@alpacka/dev')({
  runtime: 'web',
  plugins: ['babel'],
  port: 3000,
});
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

* [@alpacka/plugin-babel](https://github.com/bkniffler/alpacka/tree/master/packages/plugin-babel): Babel plugin (currently react only)
* [@alpacka/plugin-less](https://github.com/bkniffler/alpacka/tree/master/packages/plugin-less): Less style plugin

## Libraries

Alpacka can compile libraries with lerna monorepository structures. It will compile all .es6 files to .js. There is a watch mode for local development and a build mode for after

```bash
npm i @alpacka/task
```
