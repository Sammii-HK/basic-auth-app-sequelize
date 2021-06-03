const ping = require('./ping');
const auth = require('./auth');
const admin = require('./admin');


module.exports = [
  ...ping,
  ...auth,
  ...admin,
];