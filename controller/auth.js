'use strict'

const db = require('../models');
const bcrypt = require('bcrypt');

const hashPassword = (password, h) => {
  return bcrypt.hash(password, 10)
}

const authenticatePassword = (password, userPassword, h) => {
  console.log("password, userPassword", password, userPassword);
  return bcrypt.compare(password, userPassword)
}

const authenticateUser = (request, username, email, password, h) => {
  // const hashedPassword = hashPassword(password)
  // const user = db.User.findOne({ username, email, password: pwHash }).exec()
  const user = db.User.findOne({ username, email }).exec()
  // check to see if exists on database
  // const user = db.User.findOne({ where: { username, email } });
  console.log("😝 user", user);
  
  // const isValid = authenticatePassword(user[password], password);
  // const credentials = { id: user.id, name: user.username };
  
  // console.log("🤓 credentials, isValid", credentials, isValid);
  // return { isValid, credentials };
  return user
};

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