module.exports = {
  roots: ['./__tests__'],
  displayName: 'chat-tests',
  testMatch: ['**/__tests__/**/*.js'],
  testURL: 'http://localhost',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
