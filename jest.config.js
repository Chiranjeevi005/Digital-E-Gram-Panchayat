const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!next-auth|jose|openid-client|@auth|mongodb|bson|lodash|whatwg-fetch|whatwg-url)/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  transform: {
    'node_modules/jose/.+\\.(j|t)sx?$': 'ts-jest',
  },
}

module.exports = createJestConfig(customJestConfig)