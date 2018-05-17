const OFF = 0;
const WARNING = 1;
const ERROR = 2;

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ['airbnb', 'eslint:recommended'],
  plugins: [],
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {}
  },
  rules: {
    eqeqeq: [ERROR, 'always'],
    'import/no-extraneous-dependencies': [2, {
      devDependencies: true
    }],
    indent: [ERROR, 2],
    'keyword-spacing': [ERROR, {
      before: true
    }],
    'linebreak-style': [ERROR, 'unix'],
    quotes: [ERROR, 'single'],
    semi: [ERROR, 'always'],
    strict: [ERROR, 'global'],
    'space-before-blocks': [ERROR, 'always'],
    'no-console': [OFF]
  }
};
