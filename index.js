'use strict';

const Hapi = require('@hapi/hapi');
const Routes = require('./controller');
const Bcrypt = require('bcrypt');
const db = require('./models');


const validate = async (request, username, email, password) => {
  try {
      // const user = db.users[username];
      const user = await db.User.findAll({
        where: { username, email },
      });
      console.log("user", user);
      
      if (!user) {
          return { credentials: null, isValid: false };
      }
    
      const isValid = await Bcrypt.compare(password, user.password);
      const credentials = { id: user.id, name: user.name };
    
      return { isValid, credentials };
  } catch (e) {
    console.log('error validating user:', e);
    return h.response(`Failed: ${e.message}`).code(500);
  }
};

const start = async () => {
  const server = Hapi.Server({
    host: `localhost`,
    port: 3000,
  });

  await server.register(require('@hapi/basic'));
  server.auth.strategy('simple', 'basic', { validate });
  server.auth.default('simple')

  server.route(Routes);

  await server.start();
  console.log('🦄 Server running at port:', server.info.uri);
};

start();