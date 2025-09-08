'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function TestGoogleAuth() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const res = await signIn('google', {
        callbackUrl: '/',
        redirect: false
      })
      setResult(res)
      console.log('Google Sign-In Result:', res)
    } catch (error) {
      setResult(error)
      console.error('Google Sign-In Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Google Authentication Test</h1>
      <button 
        onClick={handleGoogleSignIn} 
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      
      {result && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <h2>Result:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}