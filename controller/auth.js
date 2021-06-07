'use strict'

const db = require('../models');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret } = require('../config/environment');
const Boom = require('boom');

module.exports = [
  {
    // Register User
    method: 'POST',
    path: '/register',
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
  {
    // Login User
    method: 'POST',
    path: '/login',
    options: {
      // auth: 'simple'
    },
    handler: async (req, h) => {
      const {
        username, password,
      } = req.payload;
      try {
        let token
        let message
        await db.User.findOne({ where: { username } })
        .then(async user => {
          const isPasswordValid = await bcrypt.compare(password, user.password)
          // check their password is valid
          console.log("🔮 isPasswordValid", isPasswordValid); 
          if(!isPasswordValid) {
            console.log("🥊 DENIED");
            message = Boom.unauthorized('The username and/or password to not match our system.');
          } else if (isPasswordValid) {
            // create a token
            token = jwt.sign({ sub: user.id }, secret, { expiresIn: '6h' })
            // send it to the client
            message = {
              success: true,
              id: user.id,
              credentials: token,
              isValid: true,
              message: `Welcome back, ${user.username}!`,
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
  {
    // Get User Info
    method: 'GET',
    path: '/profile/{id}',
    handler: async (req, h) => {
      try {
        const { id } = req.params;
        const results = await db.User.findAll({
          where: { id },
        });
        return results;
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