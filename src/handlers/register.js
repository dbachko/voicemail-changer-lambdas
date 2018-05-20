import qs from 'querystring';
import { dbPutUser } from '../lib/users';

/**
 *
 * @param {String} event.body.username
 * @throws Returns 404 if the user already exists or something went wrong.
 * @returns {Object} jwt that expires in 5 mins
 */
export default async (event, context, callback) => {
  console.log('register');
  const requestBody = qs.parse(event.body);
  const { username } = requestBody;

  try {
    // Add user to database.
    await dbPutUser({ username });
    const response = {
      // Success response
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ username }),
    };

    // Return response
    console.log(response);
    callback(null, response);
  } catch (e) {
    console.log(`Error registering user: ${e.message}`);
    const response = {
      // Error response
      statusCode: 404,
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
