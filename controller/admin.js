'use strict'

const db = require('../models');


module.exports = [
  {
    // Login User
    method: 'GET',
    path: '/admin/users',
    handler: async (req, h) => {
      try {
        const results = await db.User.findAll({})
        return {
          id: results.id,
          results,
        };
      } catch (e) {
        console.log('error finding user:', e);
        return h.response(`Failed: ${e.message}`).code(500);
      }
    },
  }, 
]