'use strict';

const Hapi = require('@hapi/hapi');
const Routes = require('./controller');
const Bcrypt = require('bcrypt');
const db = require('./models');
const { port } = require('./config/environment')


const start = async () => {
  const server = Hapi.Server({
    host: `localhost`,
    port: port,
  });

  server.route(Routes);

  await server.start();
  console.log('🦄 Server running at port:', server.info.uri);
};

start();