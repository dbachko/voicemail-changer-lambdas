import { objectOmit } from './utils';

// Dummy user db.
const UsersDB = [
  {
    username: 'admin',
    password: 'admin',
  },
];

/**
 * Returns a user, given a username and valid password.
 *
 * @method login
 * @param {String} username User id
 * @param {String} password Allow / Deny
 * @throws Will throw an error if a user is not found or if the password is wrong.
 * @returns {Object} user
 */
export const login = (username, password) => {
  const user = UsersDB.find(({ username: u }) => u === username);
  if (!user) throw new Error('User not found!');

  const hasValidPassword = user.password === password;
  if (!hasValidPassword) throw new Error('Invalid password');

  return objectOmit(user, ['password']);
};

export default {
  login,
};
