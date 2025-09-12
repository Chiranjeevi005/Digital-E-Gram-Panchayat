require('@testing-library/jest-dom')

// Fix for TextEncoder not being defined in Jest environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock next-auth to avoid issues with jose library
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(),
}))

// Removed Google provider mock as Google authentication is not used
// jest.mock('next-auth/providers/google', () => ({
//   __esModule: true,
//   default: jest.fn(() => ({
//     id: 'google',
//     name: 'Google',
//     type: 'oauth',
//     profile: jest.fn((profile) => ({
//       id: profile.sub,
//       name: `${profile.given_name} ${profile.family_name}`,
//       email: profile.email,
//       role: 'citizen'
//     }))
//   }))
// }))

jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    id: 'credentials',
    name: 'Credentials',
    type: 'credentials'
  }))
}))