const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('__resourceQuery/serverless.yml');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const invoke = (func, isMiddleware) => (req, res, next) => {
  func(
    {
      httpMethod: req.method,
      queryStringParameters: req.query || {},
      body: req.body || {},
      headers: req.headers || {}
    },
    req.context || {},
    (err, response) => {
      if (err) {
        return res.status(500).send(
          JSON.stringify({
            err
          })
        );
      } else if (response && isMiddleware) {
        req.context = Object.assign({}, req.context || {}, response);
      } else if (response && !isMiddleware) {
        const { statusCode, headers, body } = response;
        return res
          .status(statusCode || 200)
          .set(headers)
          .send(body);
      }
      next();
    }
  );
};

const index = {};
Object.keys(serverless.functions).forEach(key => {
  const funcDef = serverless.functions[key];
  const [func, file = 'index'] = funcDef.handler.split('.').reverse();
  const module = require(`__resourceQuery/src/${file}`)[func];
  index[key] = module;
  if (funcDef.events && funcDef.events.length && funcDef.events[0].http) {
    const { http } = funcDef.events[0];
    if (http.authorizer && index[http.authorizer]) {
      app[http.method](`/${http.path}`, invoke(index[http.authorizer], true));
    }
    app[http.method](`/${http.path}`, invoke(module));
  }
});

export default app;
