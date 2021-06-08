'use strict'

const db = require('../models');
const Boom = require('boom');
const { isPasswordValid, isVerified, generateToken } = require('../lib/secureRoute.js')


module.exports = [
  // Register User
  {
    method: 'POST',
    path: '/register',
    options: {
      auth: false,
    },
    handler: async (req, h) => {
      const {
        username, email, password,
      } = req.payload;
      try {    
        let message
        await db.User.findOne({ where: { username, email } })
        .then(async (user) => {
          // only create a user if none are found with matching credentials
          if(!user) {
            const results = await db.User.create({
              username, 
              email, 
              password: await bcrypt.hash(password, 10),
            });
            message = {
              success: true,
              results: {
                id: results.id,
                username: results.username,
              },
            };
          } else {
            message = Boom.methodNotAllowed(`Failed: user already exists!`)
          }
        })
        return message
        
      } catch (h) {
        console.log('error creating user:', h);
        return Boom.badImplementation(`Failed: ${h.message}`)
      }
    },
  }, 
  // Login User
  {
    method: 'POST',
    path: '/login',
    options: {
      auth: false,
    },
    handler: async (req, h) => {
      const {
        username, password,
      } = req.payload;
      try {
        let message
        await db.User.findOne({ where: { username } })
        .then(async user => {
          // check their password is valid
          const verifyPassword = await isPasswordValid(password, user.password)
          console.log("🔮 isPasswordValid", verifyPassword); 
          if(!verifyPassword) {
            console.log("🥊 DENIED");
            message = Boom.unauthorized('The username and/or password to not match our system.');
          } else if (verifyPassword) {
            // create a token
            const token = generateToken(user.id)
            // send it to the client
            message = {
              success: true,
              id: user.id,
              message: `Welcome back, ${user.username}!`,
              credentials: token,
            };
          }
        })       
        return message

      } catch (h) {
        console.log('error finding user:', h);
        return Boom.badImplementation(`Failed: ${h.message}`)
      }
    },
  }, 
  // Get User Info
  {
    method: 'GET',
    path: '/profile/{id}',
    handler: async (req, h) => {
      try {
        const token = req.headers.token;       
        const verify = isVerified(token)

        if (verify.isValid) {
          const { id } = req.params;
          const results = await db.User.findOne({
            where: { id },
          });
          
          return {
            message: `Hey ${results.username}!`,
            verify,
            results,
          };
        } else return { verify }

      } catch (e) {
        console.log('error finding user:', e);
        return h.response(`Failed: ${e.message}`).code(500);
      }
    },
  }, 
  {
    // Update User Info
    method: 'PUT',
    path: '/profile/{id}',
    handler: async (req, h) => {
      const { id } = req.params;
      const {
        username, password,
      } = req.payload;

      const updateUsersObject = {
        username,
        password, 
      };

      try {
        const updatePromises = [];
        const updateUsersPromise = db.User.update(
          updateUsersObject,
          { where: { id } },
        );
        updatePromises.push(updateUsersPromise);

        await Promise.all(updatePromises);

        const results = await db.User.findAll({
          where: { id },
        });

        return results

      } catch (e) {
        console.log('error updating user:', e);
        return h.response(`Failed: ${e.message}`).code(500);
      }
    },
  }, 
  {
    method: 'DELETE',
    path: '/goodbye/{id}',
    handler: async (req, h) => {
      try {
        const { id } = req.params;
        const results = await db.User.destroy({
          where: {
            id: id,
          },
        });
        return results;
      } catch (e) {
        console.log('error deleting user:', e);
        return h.response(`Failed: ${e.message}`).code(500);
      }
    },
  }
];