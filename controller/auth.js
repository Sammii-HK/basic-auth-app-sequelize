'use strict'

const db = require('../models');
const bcrypt = require('bcrypt');

const hashPassword = (password, h) => {
  return bcrypt.hash(password, 10)
}



module.exports = [
  {
    // Register User
    method: 'POST',
    path: '/register',
    options: {
      auth: 'simple',
    },
    handler: async (req, h) => {
      const {
        username, email, password,
      } = req.payload;
      try {
        // const userExists = authenticateUser(req, username, email, password)
        const user = db.User.findOne({ where: { username, email } });
        console.log("😝 user", user);
        return user

        // const results = await db.User.create({
        //   username, 
        //   email, 
        //   password: await hashPassword(password),
        // });

        // return {
        //   success: true,
        //   id: results.id,
        // };
      } catch (e) {
        console.log('error creating user:', e);
        return h.response(`Failed: ${e.message}`).code(500);
      }
    },
  }, 
  {
    // Login User
    method: 'GET',
    path: '/login',
    options: {
      auth: 'simple'
    },
    handler: async (req, h) => {
      const {
        username, email, password,
      } = req.payload;
      try {
        const results = await db.User.findAll({
          username, 
          email, 
          password
        });
        return {
          success: true,
          id: results.id,
        };
      } catch (e) {
        console.log('error finding user:', e);
        return h.response(`Failed: ${e.message}`).code(500);
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