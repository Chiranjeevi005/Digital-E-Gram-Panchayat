import { authOptions } from '@/lib/auth'

// Mock the environment variables
process.env.GOOGLE_CLIENT_ID = 'test-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'

describe('Google Authentication', () => {
  test('should configure Google provider correctly', () => {
    const providers = authOptions.providers
    const googleProvider = providers.find(provider => 
      typeof provider === 'object' && 'id' in provider && provider.id === 'google'
    )
    
    expect(googleProvider).toBeDefined()
    expect(googleProvider).toMatchObject({
      id: 'google',
      name: 'Google',
    })
  })

  test('should have events configuration for Google sign-in restrictions', () => {
    // This would be tested in the events.signIn callback
    // We'll test that the event handler exists
    expect(authOptions.events).toBeDefined()
    expect(authOptions.events!.signIn).toBeDefined()
  })
})