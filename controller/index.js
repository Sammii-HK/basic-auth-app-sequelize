const ping = require('./ping');
const auth = require('./auth');

module.exports = [
  ...ping,
  ...auth,
];
