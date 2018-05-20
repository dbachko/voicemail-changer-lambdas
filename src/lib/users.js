import { randomBytes } from 'crypto';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { objectOmit } from './utils';

// Dummy user db.
const UsersDB = [
  {
    username: 'admin',
    password: 'admin',
  },
];

/**
 * Puts user into database.
 * @param  {Object} doc       Doc to insert.
 * @return {Promise}          [description]
 */
const dbPutUser = ({ username }) =>
  new Promise((resolve, reject) => {
    const db = new DynamoDB();
    const dbParams = {
      Item: {
        username: {
          S: username,
        },
        password: {
          S: randomBytes(4).toString('hex'),
        },
      },
      TableName: 'VoicemailChangerUserTable',
    };

    db.putItem(dbParams, (err, body) => {
      if (err) {
        reject(err.stack);
      }
      resolve(body);
    });
  });

/**
 * Searches user by username.
 * @param  {String} id       Record id.
 * @return {Promise}         [description]
 */
const dbGetUser = username =>
  new Promise((resolve, reject) => {
    const db = new DynamoDB();
    const params = {
      ExpressionAttributeNames: {
        '#U': 'username',
      },
      ExpressionAttributeValues: {
        ':u': {
          S: username,
        },
      },
      KeyConditionExpression: '#U = :u',
      TableName: 'VoicemailChangerUserTable',
    };
    // Execute query.
    db.query(params, (err, body) => {
      if (err) {
        reject(err.stack);
      }
      resolve(body);
    });
  });

/**
 * Returns a user, given a username and valid password.
 * @param {String} username User id
 * @param {String} password Allow / Deny
 * @throws Will throw an error if a user is not found or if the password is wrong.
 * @returns {Object} user
 */
const login = (username, password) => {
  const user = UsersDB.find(({ username: u }) => u === username);
  if (!user) throw new Error('User not found!');

  const hasValidPassword = user.password === password;
  if (!hasValidPassword) throw new Error('Invalid password');

  return objectOmit(user, ['password']);
};

/**
 * Registers user.
 * @param {String} Username( phone number )
 */
const register = username => username;

export { dbGetUser, dbPutUser, login, register };
