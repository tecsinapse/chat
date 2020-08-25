module.exports = {
  roots: ['./__tests__'],
  displayName: 'chat-tests',
  testMatch: ['**/__tests__/**/*.test.js'],
  testURL: 'http://localhost',
  transformIgnorePatterns: [
    '/node_modules/(?!(@tecsinapse/ui-kit|@tecsinapse/uploader)).+\\.js$',
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
