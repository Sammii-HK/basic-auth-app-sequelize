'use strict'

const db = require('../models');


module.exports = [
  {
    // Login User
    method: 'GET',
    path: '/admin/users',
    options: {
      auth: {
        mode: 'optional'
      }
    },
    handler: async (req, h) => {
      try {
        const results = await db.User.findAll({})
        return {
          success: true,
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