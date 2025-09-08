import { signIn } from 'next-auth/react'

// Test function to verify authentication flow
async function testAuthentication() {
  console.log('Testing authentication flow...')
  
  try {
    // Test citizen login
    console.log('Testing citizen login...')
    const citizenResult = await signIn('credentials', {
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
      redirect: false,
    })
    console.log('Citizen login result:', citizenResult)
    
    // Test staff login
    console.log('Testing staff login...')
    const staffResult = await signIn('credentials', {
      email: 'jane@example.com',
      password: 'password123',
      role: 'staff',
      redirect: false,
    })
    console.log('Staff login result:', staffResult)
    
    // Test officer login
    console.log('Testing officer login...')
    const officerResult = await signIn('credentials', {
      email: 'bob@example.com',
      password: 'password123',
      role: 'officer',
      redirect: false,
    })
    console.log('Officer login result:', officerResult)
    
    console.log('Authentication tests completed.')
  } catch (error) {
    console.error('Authentication test failed:', error)
  }
}

// Run the test
testAuthentication()