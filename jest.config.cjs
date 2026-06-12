module.exports = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  transform: {},
  moduleNameMapper: {
    '^chart\\.js$': '<rootDir>/__mocks__/chart.js',
    '^lucide$': '<rootDir>/__mocks__/lucide.js'
  }
};