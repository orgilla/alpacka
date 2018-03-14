const app = require('__app_entry').default;

const port = parseInt(process.env.PORT || 3000, 10);
let server = null;

app.start({ port }).then(s => {
  server = s;
  console.log('Server listening to', port, ' in', process.env.NODE_ENV);
});

if (module.hot) {
  module.hot.accept('__app_entry', () => {
    if (!server) {
      return null;
    }
    server.close();
    server = null;
    require('__app_entry')
      .default.start({ port })
      .then(s => {
        server = s;
        console.log(
          'Server listening to',
          port,
          'again, in',
          process.env.NODE_ENV
        );
      });
  });
}

process.on('uncaughtException', err => {
  console.error(
    `${new Date().toUTCString()} uncaughtException: ${err.message}`
  );
  console.error(err.stack);
  process.exit(1);
});
