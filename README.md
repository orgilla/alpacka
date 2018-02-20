<div align="center">
  <a href="https://github.com/bkniffler/alpacka">
    <img alt="alpacka" src="https://raw.githubusercontent.com/bkniffler/alpacka/master/assets/logo.png" height="250px" />
  </a>
</div>

# alpacka

A simple wrapper around webpack. It supports different plugins and runtimes as well as dev (hot reload) and build-modes.

For applications

```bash
npm i @alpacka/run @alpacka/run-web @alpacka/plugin-babel
```

```jsx
// dev.js
const port = parseInt(process.env.PORT || 3000, 10);
require('@alpacka/run').dev({
  runtime: 'web',
  plugins: ['babel'],
  port,
});
```

```bash
node dev
```

## Runtimes

* web: Progressive Web Applications with offline support
* lambda: NodeJS for AWS Lambda
* server: Classic server for API and/or SSR
* electron: Electron runtime for desktop applications

## Plugins

* babel: Babel plugin (currently react only)
* less: Less style plugin

## Libraries

Alpacka can compile libraries with lerna monorepository structures. It will compile all .es6 files to .js. There is a watch mode for local development and a build mode for after

```bash
npm i @alpacka/task
```
