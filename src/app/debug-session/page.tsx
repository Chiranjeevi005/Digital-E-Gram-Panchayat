'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function DebugSession() {
  const { data: session, status } = useSession()
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    if (session) {
      setSessionData(session)
    }
  }, [session])

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug Page</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Session Status</h2>
        <p>Status: {status}</p>
      </div>

      {sessionData && (
        <div className="mt-6 bg-blue-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Session Data</h2>
          <pre className="bg-white p-4 rounded overflow-x-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>
      )}

      {!sessionData && status !== 'loading' && (
        <div className="mt-6 bg-yellow-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No Session Data</h2>
          <p>No session data available.</p>
        </div>
      )}
    </div>
  )
}