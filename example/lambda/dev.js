require('dotenv').config({ path: '../../.env' });

const port = parseInt(process.env.PORT || 3000, 10);

require('olymp-webpack').dev({
  runtime: 'lambda',
  plugins: ['babel'],
  env: {},
  port
});
