import jwt from 'jsonwebtoken';
import qs from 'querystring';

import { login } from '../lib/users';

const JWT_EXPIRATION_TIME = '60m';

/**
 * POST /sessions
 *
 * Returns a JWT, given a username and password.
 * @method login
 * @param {String} event.body.username
 * @param {String} event.body.password
 * @throws Returns 401 if the user is not found or password is invalid.
 * @returns {Object} jwt that expires in 5 mins
 */
export default (event, context, callback) => {
  console.log('login');
  const requestBody = qs.parse(event.body);
  const { username, password } = requestBody;

  try {
    // Authenticate user
    const user = login(username, password);
    console.log(user);

    // Issue JWT
    const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRATION_TIME });
    console.log(`JWT issued: ${token}`);
    const response = {
      // Success response
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        token,
      }),
    };

    // Return response
    console.log(response);
    callback(null, response);
  } catch (e) {
    console.log(`Error logging in: ${e.message}`);
    const response = {
      // Error response
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: e.message,
      }),
    };
    callback(null, response);
  }
};
