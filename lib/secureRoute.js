'use strict'

const Jwt = require('@hapi/jwt');
const bcrypt = require('bcrypt');
const { secret, tokenExpiry } = require('../config/environment');

const isPasswordValid = (password, userPassword) => bcrypt.compare(password, userPassword)

// verify a token
const verifyToken = (artifact, options = {}) => {
  try {
    Jwt.token.verify(artifact, secret, options);
    return { isValid: true };
  }
  catch (err) {
    return {
      isValid: false,
      error: err.message
    };
  }
};

// generate a token
const generateToken = (userId) => Jwt.token.generate(
  { sub: userId }, { key: secret }, { tokenExpiry }
);

const isVerified = (token) => {
  let decodedToken = Jwt.token.decode(token);
  return verifyToken(decodedToken, secret)
}

// // Get response of a succesful verification
// const validResponse = verifyToken(decodedToken, secret);

// // Get response of a unsuccessful verification due to wrong shared secret
// const badSecretResponse = verifyToken(decodedToken, 'some_unshared_secret');

// // Get response of a unsuccessful verification due to wrong iss
// const badIssResonse = verifyToken(decodedToken, secret, { iss: 'urn:issuer:different_test' });

module.exports = { isPasswordValid, generateToken, verifyToken, isVerified }