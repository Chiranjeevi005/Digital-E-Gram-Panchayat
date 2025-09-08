'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function TestSession() {
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log('Session data:', session)
  }, [session])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Session Test Page</h1>
      <p>Status: {status}</p>
      
      {session ? (
        <div>
          <h2>Session Data:</h2>
          <pre>{JSON.stringify(session, null, 2)}</pre>
          
          <h2>User Data:</h2>
          <p>Name: {session.user?.name || 'No name'}</p>
          <p>Email: {session.user?.email || 'No email'}</p>
          <p>Role: {session.user?.role || 'No role'}</p>
          <p>Provider: {(session.user as any)?.provider || 'No provider'}</p>
        </div>
      ) : (
        <p>No session data available</p>
      )}
    </div>
  )
}
