require('dotenv').config({ path: '../../.env' });

const port = parseInt(process.env.PORT || 3000, 10);

require('olymp-webpack').build({
  runtime: 'lambda',
  plugins: ['babel'],
  env: {},
  port
});
