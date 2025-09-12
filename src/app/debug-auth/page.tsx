'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function DebugAuth() {
  const { data: session, status } = useSession()
  const [envVars, setEnvVars] = useState<any>({})
  const [authResult, setAuthResult] = useState<any>(null)

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'
    })
  }, [])

  const handleCredentialsSignIn = async () => {
    try {
      console.log('Attempting Credentials Sign-In...')
      const result = await signIn('credentials', {
        email: 'test@example.com',
        password: 'password',
        role: 'citizen',
        redirect: false
      })
      setAuthResult(result)
      console.log('Credentials Sign-In Result:', result)
    } catch (error) {
      setAuthResult(error)
      console.error('Credentials Sign-In Error:', error)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Authentication Debug Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Session Status</h2>
        <p>Status: {status}</p>
        {session && (
          <div>
            <p>User: {session.user?.name}</p>
            <p>Email: {session.user?.email}</p>
            <p>Role: {session.user?.role}</p>
            {session.user?.provider && <p>Provider: {session.user.provider}</p>}
          </div>
        )}
        <button 
          onClick={() => signOut()} 
          style={{ padding: '5px 10px', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '3px' }}
        >
          Sign Out
        </button>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Environment Variables</h2>
        <pre>{JSON.stringify(envVars, null, 2)}</pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Test Authentication</h2>
        <button 
          onClick={handleCredentialsSignIn} 
          style={{ padding: '10px 20px', margin: '5px', fontSize: '16px' }}
        >
          Sign in with Credentials
        </button>
      </div>
      
      {authResult && (
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
          <h2>Authentication Result:</h2>
          <pre>{JSON.stringify(authResult, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}