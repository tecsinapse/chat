module.exports = {
  roots: ['./__tests__'],
  displayName: 'chat-tests',
  testMatch: ['**/__tests__/**/*.js'],
  testURL: 'http://localhost',
  transformIgnorePatterns: ['/node_modules/(?!@tecsinapse/ui-kit).+\\.js$'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  // automock: true, automock is causing errors on test, we should only mock react-mic dep
};
